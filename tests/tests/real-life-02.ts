import {
  TumauServer,
  Middleware,
  RouterPackage,
  Route,
  HttpError,
  CookieManager,
  Compress,
  CorsPackage,
  JsonPackage,
  CookieParser,
  JsonResponse,
} from 'tumau';
import { mountTumau } from '../utils/mountTumau';
import fetch from 'node-fetch';

test('real life 2', async () => {
  const app = TumauServer.create({
    handleServerUpgrade: true,
    mainMiddleware: Middleware.compose(
      CorsPackage(),
      Compress(),
      JsonPackage(),
      CookieParser(),
      CookieManager(),
      RouterPackage([
        Route.POST('login', () => {
          return JsonResponse.with({ success: true });
        }),
        Route.all(null, () => {
          throw new HttpError.NotFound();
        }),
      ])
    ),
  });

  const { url, close } = await mountTumau(app);

  const res = await fetch(url);
  expect(res).toMatchInlineSnapshot(`
    HTTP/1.1 404 Not Found
    Connection: close
    Content-Encoding: gzip
    Content-Type: application/json
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Transfer-Encoding: chunked
  `);

  const res2 = await fetch(`${url}/login`);
  expect(res2).toMatchInlineSnapshot(`
    HTTP/1.1 404 Not Found
    Connection: close
    Content-Encoding: gzip
    Content-Type: application/json
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Transfer-Encoding: chunked
  `);

  const res3 = await fetch(`${url}/login`, { method: 'post' });
  expect(res3).toMatchInlineSnapshot(`
    HTTP/1.1 200 OK
    Connection: close
    Content-Encoding: gzip
    Content-Type: application/json
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Transfer-Encoding: chunked
  `);

  const res4 = await fetch(`${url}/login`, {
    method: 'post',
    headers: {
      origin: 'localhost:3000',
    },
  });
  expect(res4).toMatchInlineSnapshot(`
    HTTP/1.1 200 OK
    Access-Control-Allow-Origin: localhost:3000
    Connection: close
    Content-Encoding: gzip
    Content-Type: application/json
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Transfer-Encoding: chunked
`);

  await close();
});
