import { Server } from '@tumau/core';

const server = Server.create(ctx => {
  return ctx.response.create({
    json: {
      hello: 'world !',
    },
  });
});

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
