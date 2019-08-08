import { Server, BaseContext, Response, Middleware } from '@tumau/core';
import { UrlParserCtx, UrlParser } from '@tumau/url-parser';

interface Ctx extends BaseContext, UrlParserCtx {}

const main: Middleware<Ctx> = ctx => {
  return Response.create({
    body: JSON.stringify(ctx.parsedUrl),
  });
};

const server = Server.create<Ctx>(
  Middleware.compose(
    UrlParser(),
    main
  )
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002/foo?bar=hey `);
});
