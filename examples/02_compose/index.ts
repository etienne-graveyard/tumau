import { Server, Middleware, BaseContext, Response } from '@tumau/core';

interface Ctx extends BaseContext {
  num: null | number;
}

const logger: Middleware<Ctx> = async (ctx, next) => {
  const start = process.hrtime();
  console.log(`${ctx.request.method} ${ctx.request.url}`);
  const result = await next(ctx);
  const time = process.hrtime(start);
  console.log(`done in ${time[0]}s ${time[1] / 1000000}ms`);
  return result;
};

const addNum: Middleware<Ctx> = (ctx, next) => {
  const nextCtx = {
    ...ctx,
    num: Math.floor(Math.random() * 100000),
  };
  return next(nextCtx);
};

const main: Middleware<Ctx> = async ctx => {
  await new Promise(resolve => {
    setTimeout(resolve, 2000);
  });
  return {
    ctx,
    response: Response.create({
      body: `Num : ${ctx.num}`,
    }),
  };
};

const composed = Middleware.compose(
  logger,
  addNum,
  main
);

const createInitialContext = (ctx: BaseContext): Ctx => ({ ...ctx, num: null });

const server = Server.create(createInitialContext, composed);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002/ `);
});
