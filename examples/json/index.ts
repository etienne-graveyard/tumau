import { createServer, compose, JsonParser, JsonResponse, JsonParserConsumer } from 'tumau';

const server = createServer(
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
