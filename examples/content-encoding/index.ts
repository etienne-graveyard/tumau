import { TumauServer, compose, JsonResponse, Compress } from 'tumau';

const server = TumauServer.create(compose(Compress, () => JsonResponse.withJson({ hello: 'world' })));

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
