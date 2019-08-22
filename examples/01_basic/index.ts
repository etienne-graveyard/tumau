import { Server } from '@tumau/core';

const server = Server.create(() => {
  return null;
});

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
