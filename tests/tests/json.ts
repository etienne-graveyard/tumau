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
  JsonPackage,
  TumauResponse,
} from 'tumau';
import { mountTumau } from '../utils/mountTumau';
import fetch from 'node-fetch';

describe('Server', () => {
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

  test('JsonPackage handle all sort of response', async () => {
    let count = 0;

    const app = TumauServer.create(
      Middleware.compose(JsonPackage(), () => {
        count++;
        if (count === 1) {
          return null;
        }
        if (count === 2) {
          return TumauResponse.withText('Hello');
        }
        if (count === 3) {
          throw new HttpError.NotFound();
        }
        if (count === 4) {
          throw new Error('Oops');
        }
        return JsonResponse.with({ foo: 'bar' });
      })
    );
    const { close, url } = await mountTumau(app);

    const res1 = await fetch(url);
    expect(res1).toMatchInlineSnapshot(`
      HTTP/1.1 500 Internal Server Error
      Connection: close
      Content-Length: 70
      Content-Type: application/json
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    expect(await res1.json()).toEqual({ code: 500, message: 'Internal Server Error: Server did not respond' });

    const res2 = await fetch(url);
    expect(res2).toMatchInlineSnapshot(`
      HTTP/1.1 500 Internal Server Error
      Connection: close
      Content-Length: 109
      Content-Type: application/json
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    expect(await res2.json()).toEqual({
      code: 500,
      message: 'Internal Server Error: Invalid response: Expected a JsonResponse got a TumauResponse',
    });

    const res3 = await fetch(url);
    expect(res3).toMatchInlineSnapshot(`
      HTTP/1.1 404 Not Found
      Connection: close
      Content-Length: 34
      Content-Type: application/json
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    expect(await res3.json()).toEqual({ code: 404, message: 'Not Found' });

    const res4 = await fetch(url);
    expect(res4).toMatchInlineSnapshot(`
      HTTP/1.1 500 Internal Server Error
      Connection: close
      Content-Length: 52
      Content-Type: application/json
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    expect(await res4.json()).toEqual({ code: 500, message: 'Internal Server Error: Oops' });

    const res5 = await fetch(url);
    expect(res5).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Length: 13
      Content-Type: application/json
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    expect(await res5.json()).toEqual({ foo: 'bar' });

    await close();
  });
});
