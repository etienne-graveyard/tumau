import { Server, Middleware, HttpError } from '@tumau/core';
import { JsonPackage } from '@tumau/json';

const server = Server.create(
  Middleware.compose(
    JsonPackage(),
    () => {
      throw new HttpError.NotFound();
    }
  )
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
