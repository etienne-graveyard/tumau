import { TumauServer, TumauResponse, RequestConsumer } from 'tumau';

/*
This is [some](link)
*/

const server = TumauServer.create(tools => {
  const request = tools.readContext(RequestConsumer);
  return TumauResponse.withText(`Hello World ! (from ${request.url})`);
});

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
