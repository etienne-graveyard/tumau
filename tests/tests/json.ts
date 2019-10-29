import { Server, HttpError, Middleware, HttpHeaders, HttpMethod } from '@tumau/core';
import { JsonParser, ErrorToJson, JsonResponse, JsonParserConsumer } from '@tumau/json';
import { runTumauRequest } from '../utils/runRequest';
import { Request } from '../utils/Request';
import { BodyResponse } from '../utils/BodyResponse';

describe('Server', () => {
  test('convert HTTPError to JsonResponse', async () => {
    const app = Server.create(
      Middleware.compose(
        ErrorToJson,
        JsonParser(),
        () => {
          throw new HttpError.NotFound();
        }
      )
    );
    const res = await runTumauRequest(app, new Request());
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 404 Not Found
      Connection: close
      Content-Length: 34
      Content-Type: application/json
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    expect(await BodyResponse.fromJson(res)).toEqual({ code: 404, message: 'Not Found' });
  });

  test('parse JSON body', async () => {
    const app = Server.create(
      Middleware.compose(
        ErrorToJson,
        JsonParser(),
        ctx => {
          console.log(ctx.get(JsonParserConsumer));
          return JsonResponse.with({ body: ctx.get(JsonParserConsumer) });
        }
      )
    );
    const body = JSON.stringify({ name: 'Perceval', alias: 'Provençal le Gaulois' });
    const res = await runTumauRequest(
      app,
      new Request({
        method: HttpMethod.POST,
        body,
        headers: { [HttpHeaders.ContentLength]: body.length.toString(), [HttpHeaders.ContentType]: 'application/json' },
      })
    );
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 400 Bad Request
      Connection: close
    `);
    // console.log(await BodyResponse.asText(res));

    // expect(await BodyResponse.fromJson(res)).toEqual({ name: 'Perceval', alias: 'Provençal le Gaulois' });
  });
});
