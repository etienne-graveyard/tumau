import { createServer, TumauResponse, RequestConsumer } from 'tumau';

const server = createServer((ctx) => {
  const request = ctx.get(RequestConsumer);
  return TumauResponse.withText(`Hello World ! (from ${request.url})`);
});

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
