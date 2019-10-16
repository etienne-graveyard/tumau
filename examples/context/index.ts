import { Context, Server, Middleware } from 'tumau';

// Num context with a default value of 7
const NumContext = Context.create<number>('Num', 7);

// MaybeNum with no default value
const MaybeNumContext = Context.create<number>('MaybeNum');

// middleware
const myContextProvider: Middleware = (ctx, next) => {
  // we provide our context
  const numProvider = NumContext.provide(42);
  const maybeNumProvider = MaybeNumContext.provide(6);
  // we create a new ctx by calling ctx.set()
  const nextCtx = ctx.set(numProvider, maybeNumProvider);
  // we call next with our new context
  return next(nextCtx);
};

// middleware
const myContextConsumer: Middleware = (ctx, next) => {
  // Num
  console.log({
    has: ctx.has(NumContext),
    num: ctx.get(NumContext),
    // NumContext has a default value so this would never throw
    numOrThrow: ctx.getOrThrow(NumContext),
  });

  // MaybeNum
  console.log({
    has: ctx.has(MaybeNumContext),
    maybeNum: ctx.get(MaybeNumContext),
    // this will throw an error if the Context is not present
    numOrThrow: ctx.getOrThrow(MaybeNumContext),
  });

  return next(ctx);
};

const server = Server.create(
  Middleware.compose(
    myContextConsumer, // consume but context are not there yet
    myContextProvider, // providing context
    myContextConsumer // logs { has: true, num: 42 }
  )
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
