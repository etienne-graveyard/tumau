import { Server, Response, Middleware, UrlParserContext, UrlParser } from 'tumau';

const main: Middleware = ctx => {
  const parsedUrl = ctx.getOrThrow(UrlParserContext);
  return Response.withText(JSON.stringify(parsedUrl));
};

const server = Server.create(
  Middleware.compose(
    UrlParser(),
    main
  )
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002/foo?bar=hey `);
});
