import { Server, Middleware, JsonResponse, Compress } from 'tumau';

const server = Server.create(
  Middleware.compose(
    Compress(),
    () => JsonResponse.with({ hello: 'world' })
  )
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
