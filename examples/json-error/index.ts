import { createServer, HttpError, JsonPackage, compose } from 'tumau';

const server = createServer(
  compose(JsonPackage(), () => {
    throw new HttpError.NotFound();
  })
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
