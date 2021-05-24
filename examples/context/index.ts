import { createContext, createServer, Middleware, compose } from 'tumau';

// Num context with a default value of 7
const NumContext = createContext<number>({ name: 'Num', defaultValue: 7 });

// MaybeNum with no default value
const MaybeNumContext = createContext<number>({ name: 'MaybeNum' });

// middleware
const myContextProvider: Middleware = (ctx, next) => {
  // we provide our context
  const numProvider = NumContext.Provider(42);
  const maybeNumProvider = MaybeNumContext.Provider(6);
  // we create a new context by calling ctx.with()
  const nextCtx = ctx.with(numProvider, maybeNumProvider);
  // we call next with our new context to execute the next middleware
  return next(nextCtx);
};

// middleware
const myContextConsumer: Middleware = (ctx, next) => {
  // Num
  console.log({
    has: ctx.has(NumContext.Consumer),
    num: ctx.get(NumContext.Consumer),
    // NumContext has a default value so this would never throw
    numOrThrow: ctx.getOrFail(NumContext.Consumer),
  });

  // MaybeNum
  console.log({
    has: ctx.has(MaybeNumContext.Consumer),
    maybeNum: ctx.get(MaybeNumContext.Consumer),
    // this will throw an error if the Context is not present
    numOrThrow: ctx.getOrFail(MaybeNumContext.Consumer),
  });

  return next(ctx);
};

const server = createServer(
  compose(
    myContextConsumer, // consume but context are not there yet
    myContextProvider, // providing context
    myContextConsumer // logs { has: true, num: 42 }
  )
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
