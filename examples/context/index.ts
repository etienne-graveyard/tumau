import { Context, Server, Middleware } from 'tumau';

// first let's create a context
const NumContext = Context.create<number>(7); // 7 is the default value (optionnal)

// middleware
const myContextProvider: Middleware = (ctx, next) => {
  // we provide our context
  const numProvider = NumContext.provide(42);
  // we create a new ctx by calling ctx.set()
  const nextCtx = ctx.set(numProvider);
  // we call next with our new context
  return next(nextCtx);
};

// middleware
const myContextConsumer: Middleware = (ctx, next) => {
  const has = ctx.has(NumContext);
  const num = ctx.get(NumContext); // get the value of the default if not provided
  // if the context is required we could also call
  // const num = ctx.getOrThrow(NumContext);
  console.log({
    has,
    num,
  });
  return next(ctx);
};

const server = Server.create(
  Middleware.compose(
    myContextConsumer, // contex not there yet, will log { has: false, num: 7 } (7 is the default value)
    myContextProvider,
    myContextConsumer // logs { has: true, num: 42 }
  )
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
