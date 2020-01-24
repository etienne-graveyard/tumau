import {
  TumauServer,
  HttpError,
  Middleware,
  HttpMethod,
  HttpHeaders,
  ContentType,
  JsonParser,
  ErrorToJson,
  JsonResponse,
  JsonParserConsumer,
} from 'tumau';
import { mountTumau } from '../utils/mountTumau';
import fetch from 'node-fetch';

describe('Server', () => {
  test('convert HTTPError to JsonResponse', async () => {
    const app = TumauServer.create(
      Middleware.compose(ErrorToJson, JsonParser(), () => {
        return new HttpError.NotFound();
      })
    );
    const { close, url } = await mountTumau(app);
    const res = await fetch(url);
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 404 Not Found
      Connection: close
      Content-Length: 34
      Content-Type: application/json
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    expect(await res.json()).toEqual({ code: 404, message: 'Not Found' });
    await close();
  });

  test('parse JSON body', async () => {
    const app = TumauServer.create(
      Middleware.compose(ErrorToJson, JsonParser(), tools => {
        return JsonResponse.with({ body: tools.readContext(JsonParserConsumer) });
      })
    );
    const { close, url } = await mountTumau(app);
    const res = await fetch(url, {
      method: HttpMethod.POST,
      body: JSON.stringify({ name: 'Perceval', alias: 'Provençal le Gaulois' }),
      headers: {
        [HttpHeaders.ContentType]: ContentType.Json,
      },
    });
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Length: 60
      Content-Type: application/json
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    expect(await res.json()).toEqual({ body: { name: 'Perceval', alias: 'Provençal le Gaulois' } });
    await close();
  });
});
