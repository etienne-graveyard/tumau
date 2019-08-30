import { Server, Middleware } from '@tumau/core';
import { JsonResponse } from '@tumau/json';
import { Compress } from '@tumau/compress';

const server = Server.create(
  Middleware.compose(
    Compress(),
    () => JsonResponse.with({ hello: 'world' })
  )
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
