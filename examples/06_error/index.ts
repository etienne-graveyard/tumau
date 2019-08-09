import { Server, BaseContext, Middleware, HttpError } from '@tumau/core';
import { JsonParserCtx, JsonPackage } from '@tumau/json';

interface Ctx extends BaseContext, JsonParserCtx {}

const server = Server.create<Ctx>(
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
