import { TumauServer, TumauResponse, RequestConsumer } from 'tumau';

const server = TumauServer.create((ctx) => {
  const request = ctx.readContext(RequestConsumer);
  return TumauResponse.withText(`Hello World ! (from ${request.url})`);
});

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
