import { Server, Middleware, HttpError, JsonPackage } from 'tumau';

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
