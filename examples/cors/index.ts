import { TumauServer, TumauResponse, Middleware, UrlParserConsumer, UrlParser, CorsPackage, compose } from 'tumau';

const main: Middleware = (ctx) => {
  const parsedUrl = ctx.getOrFail(UrlParserConsumer);
  return TumauResponse.withText(JSON.stringify(parsedUrl));
};

const server = TumauServer.create(compose(UrlParser(), CorsPackage(), main));

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002/`);
});
