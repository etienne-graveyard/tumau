import {
  createServer,
  Route,
  HttpError,
  CookieManager,
  CookieParser,
  JsonResponse,
  compose,
  JsonParser,
  ErrorToHttpError,
  InvalidResponseToHttpError,
  CorsActual,
  CorsPreflight,
  Compress,
  HttpErrorToJsonResponse,
  AllowedMethodsRoutes,
  Router,
  UrlParser,
} from '../../src';
import { mountTumau } from '../utils/mountTumau';
import fetch from 'node-fetch';

test('real life 2', async () => {
  const app = createServer({
    handleServerUpgrade: true,
    mainMiddleware: compose(
      CorsActual(),
      CorsPreflight(),
      Compress,
      HttpErrorToJsonResponse,
      InvalidResponseToHttpError,
      ErrorToHttpError,
      UrlParser(),
      JsonParser(),
      CookieParser(),
      CookieManager(),
      Router(
        AllowedMethodsRoutes([
          Route.POST('login', () => {
            return JsonResponse.withJson({ success: true });
          }),
          Route.fallback(() => {
            throw new HttpError.NotFound();
          }),
        ])
      )
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
