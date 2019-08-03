import { Server, BaseContext, Response, Middleware } from '@tumau/core';
import {} from '@tumau/router';

interface Ctx extends BaseContext, UrlParserCtx {}

const createInititalContext = (ctx: BaseContext): Ctx => ctx;

const main: Middleware<Ctx> = ctx => {
  return {
    ctx,
    response: Response.create({
      body: JSON.stringify(ctx.parsedUrl),
    }),
  };
};

const server = Server.create<Ctx>(
  createInititalContext,
  Middleware.compose(
    UrlParser(),
    main
  )
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002/foo?bar=hey `);
});
