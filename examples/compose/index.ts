import { createServer, Middleware, TumauResponse, createContext, RequestConsumer, compose } from 'tumau';

const NumCtx = createContext<number>();

const logger: Middleware = async (ctx, next) => {
  const start = process.hrtime();
  const request = ctx.getOrFail(RequestConsumer);
  console.log(`Received request for ${request.method} ${request.url}`);
  const result = await next(ctx);
  const time = process.hrtime(start);
  console.log(`${request.method} ${request.url} was served in ${time[0]}s ${time[1] / 1000000}ms`);
  return result;
};

const addNum: Middleware = (ctx, next) => {
  return next(ctx.with(NumCtx.Provider(Math.floor(Math.random() * 100000))));
};

const logNum: Middleware = async (ctx, next) => {
  await new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });
  const num = ctx.get(NumCtx.Consumer);
  console.log(`num : ${num}`);
  return next(ctx);
};

const main: Middleware = async (ctx) => {
  await new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });
  const num = ctx.getOrFail(NumCtx.Consumer);
  return TumauResponse.withText(`Num : ${num}`);
};

const composed = compose(logger, logNum, addNum, logNum, main);

const server = createServer(composed);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002/ `);
});
