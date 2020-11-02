import { createServer, TumauResponse, Middleware, UrlParserConsumer, UrlParser, compose } from 'tumau';

const main: Middleware = (ctx) => {
  const parsedUrl = ctx.getOrFail(UrlParserConsumer);
  return TumauResponse.withText(JSON.stringify(parsedUrl));
};

const server = createServer(compose(UrlParser(), main));

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002/foo?bar=hey `);
});
