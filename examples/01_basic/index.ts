import { Server, Response } from '@tumau/core';

const server = Server.create(
  ctx => ctx,
  ctx => {
    return {
      ctx,
      response: Response.create({
        body: 'Hello World !',
      }),
    };
  }
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
