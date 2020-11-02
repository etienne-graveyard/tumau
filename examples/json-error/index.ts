import { TumauServer, HttpError, JsonPackage, compose } from 'tumau';

const server = TumauServer.create(
  compose(JsonPackage(), () => {
    throw new HttpError.NotFound();
  })
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
