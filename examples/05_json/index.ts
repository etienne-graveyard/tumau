import { Server, BaseContext, Middleware } from '@tumau/core';
import { JsonParserCtx, JsonParser, JsonResponse } from '@tumau/json';

interface Ctx extends BaseContext, JsonParserCtx {}

const server = Server.create<Ctx>(
  Middleware.compose(
    JsonParser(),
    ctx => {
      if (ctx.jsonBody) {
        return JsonResponse.with({ you: '<- are here !', received: ctx.jsonBody });
      }
      return JsonResponse.with({ you: '<- are here !' });
    }
  )
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
