import { Server, TumauResponse, Middleware, UrlParserConsumer, Cors, HandleErrors, UrlParser } from 'tumau';

const main: Middleware = ctx => {
  const parsedUrl = ctx.getOrThrow(UrlParserConsumer);
  return TumauResponse.withText(JSON.stringify(parsedUrl));
};

const server = Server.create(
  Middleware.compose(
    UrlParser(),
    Cors.create(),
    HandleErrors,
    main
  )
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002/`);
});
