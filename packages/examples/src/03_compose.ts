import { Server, Middleware } from '@tumau/core';

const logger: Middleware = async (ctx, next) => {
  const start = process.hrtime();
  console.log(`${ctx.request.method} ${ctx.request.pathname}`);
  await next();
  const time = process.hrtime(start);
  console.log(`done in ${time[0]}s ${time[1] / 1000000}ms`);
};

const main: Middleware = async ctx => {
  await new Promise((resolve, reject) => {
    setTimeout(resolve, 2000);
  });
  ctx.response.create({
    json: {
      hello: 'world !',
    },
  });
};

const composed = Middleware.compose(
  logger,
  main
);

const server = Server.create(composed);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002/ `);
});
