import { TumauServer, TumauResponse, Middleware, UrlParserConsumer, UrlParser, CorsPackage } from 'tumau';

const main: Middleware = (ctx) => {
  const parsedUrl = ctx.getOrFail(UrlParserConsumer);
  return TumauResponse.withText(JSON.stringify(parsedUrl));
};

const server = TumauServer.create(Middleware.compose(UrlParser(), CorsPackage(), main));

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002/`);
});
