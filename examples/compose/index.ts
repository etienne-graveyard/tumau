import { TumauServer, Middleware, TumauResponse, Context, RequestConsumer } from 'tumau';

const NumCtx = Context.create<number>();

const logger: Middleware = async tools => {
  const start = process.hrtime();
  const request = tools.readContextOrFail(RequestConsumer);
  console.log(`Received request for ${request.method} ${request.url}`);
  const result = await tools.next();
  const time = process.hrtime(start);
  console.log(`${request.method} ${request.url} was served in ${time[0]}s ${time[1] / 1000000}ms`);
  return result;
};

const addNum: Middleware = tools => {
  return tools.withContext(NumCtx.Provider(Math.floor(Math.random() * 100000))).next();
};

const logNum: Middleware = async tools => {
  await new Promise(resolve => {
    setTimeout(resolve, 2000);
  });
  const num = tools.readContext(NumCtx.Consumer);
  console.log(`num : ${num}`);
  return tools.next();
};

const main: Middleware = async tools => {
  await new Promise(resolve => {
    setTimeout(resolve, 2000);
  });
  const num = tools.readContextOrFail(NumCtx.Consumer);
  return TumauResponse.withText(`Num : ${num}`);
};

const composed = Middleware.compose(logger, logNum, addNum, logNum, main);

const server = TumauServer.create(composed);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002/ `);
});
