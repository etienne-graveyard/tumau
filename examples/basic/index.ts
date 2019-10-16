import { Server, TumauResponse, RequestConsumer } from 'tumau';

const server = Server.create(ctx => {
  const request = ctx.get(RequestConsumer);
  return TumauResponse.withText(`Hello World ! (from ${request.url})`);
});

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
