import { Server, Middleware, JsonParser, JsonResponse, JsonParserConsumer } from 'tumau';

const server = Server.create(
  Middleware.compose(
    JsonParser(),
    ctx => {
      const jsonBody = ctx.getOrThrow(JsonParserConsumer);
      if (jsonBody) {
        return JsonResponse.with({ you: '<- are here !', received: jsonBody });
      }
      return JsonResponse.with({ you: '<- are here !' });
    }
  )
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
