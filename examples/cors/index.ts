import { TumauServer, TumauResponse, Middleware, UrlParserConsumer, Cors, HandleErrors, UrlParser } from 'tumau';

const main: Middleware = tools => {
  const parsedUrl = tools.readContextOrFail(UrlParserConsumer);
  return TumauResponse.withText(JSON.stringify(parsedUrl));
};

const server = TumauServer.create(Middleware.compose(UrlParser(), Cors.create(), HandleErrors, main));

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002/`);
});
