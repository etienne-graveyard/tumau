import { Server, TumauResponse } from 'tumau';

const server = Server.create(() => {
  return TumauResponse.withText('Hello Tumau');
});

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
