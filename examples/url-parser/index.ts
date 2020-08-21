import { TumauServer, TumauResponse, Middleware, UrlParserConsumer, UrlParser } from 'tumau';

const main: Middleware = (ctx) => {
  const parsedUrl = ctx.readContextOrFail(UrlParserConsumer);
  return TumauResponse.withText(JSON.stringify(parsedUrl));
};

const server = TumauServer.create(Middleware.compose(UrlParser(), main));

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002/foo?bar=hey `);
});
