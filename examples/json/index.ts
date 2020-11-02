import { TumauServer, compose, JsonParser, JsonResponse, JsonParserConsumer } from 'tumau';

const server = TumauServer.create(
  compose(JsonParser(), (ctx) => {
    const jsonBody = ctx.getOrFail(JsonParserConsumer);
    if (jsonBody) {
      return JsonResponse.withJson({ you: '<- are here !', received: jsonBody });
    }
    return JsonResponse.withJson({ you: '<- are here !' });
  })
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
