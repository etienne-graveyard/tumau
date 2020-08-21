import { Context, TumauServer, Middleware } from 'tumau';

// Num context with a default value of 7
const NumContext = Context.create<number>(7);

// MaybeNum with no default value
const MaybeNumContext = Context.create<number>();

// middleware
const myContextProvider: Middleware = (ctx, next) => {
  // we provide our context
  const numProvider = NumContext.Provider(42);
  const maybeNumProvider = MaybeNumContext.Provider(6);
  // we create a new context by calling ctx.withContext()
  const nextCtx = ctx.withContext(numProvider, maybeNumProvider);
  // we call next with our new context to execute the next middleware
  return next(nextCtx);
};

// middleware
const myContextConsumer: Middleware = (ctx, next) => {
  // Num
  console.log({
    has: ctx.hasContext(NumContext.Consumer),
    num: ctx.readContext(NumContext.Consumer),
    // NumContext has a default value so this would never throw
    numOrThrow: ctx.readContextOrFail(NumContext.Consumer),
  });

  // MaybeNum
  console.log({
    has: ctx.hasContext(MaybeNumContext.Consumer),
    maybeNum: ctx.readContext(MaybeNumContext.Consumer),
    // this will throw an error if the Context is not present
    numOrThrow: ctx.readContextOrFail(MaybeNumContext.Consumer),
  });

  return next(ctx);
};

const server = TumauServer.create(
  Middleware.compose(
    myContextConsumer, // consume but context are not there yet
    myContextProvider, // providing context
    myContextConsumer // logs { has: true, num: 42 }
  )
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
