import { Server, Response } from '@tumau/core';

const server = Server.create(ctx => {
  return Response.withText(`Hello World ! (from ${ctx.request.url})`);
});

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
