import {
  createServer,
  Route,
  TumauResponse,
  HttpError,
  CookieManager,
  compose,
  CorsActual,
  CorsPreflight,
  Compress,
  ErrorToHttpError,
  HttpErrorToTextResponse,
  InvalidResponseToHttpError,
  UrlParser,
  Router,
  AllowedMethodsRoutes,
} from '../../src';
import { mountTumau } from '../utils/mountTumau';
import fetch from 'node-fetch';

test('real life', async () => {
  // const wss = new WebSocket.Server({ noServer: true });

  // const onConnected = jest.fn();
  // const onOpen = jest.fn();

  // wss.on('connection', (ws) => {
  //   onConnected();
  //   ws.close();
  // });

  const app = createServer({
    handleServerUpgrade: true,
    mainMiddleware: compose(
      CorsActual(),
      CorsPreflight(),
      Compress,
      UrlParser(),
      HttpErrorToTextResponse,
      InvalidResponseToHttpError,
      ErrorToHttpError(),
      CookieManager(),
      Router(
        AllowedMethodsRoutes([
          // Route.UPGRADE('connect', HandleWebsocket),
          Route.GET('login', () => {
            return TumauResponse.withText('TODO');
          }),
          Route.GET('logout', () => {
            return TumauResponse.withText('TODO');
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
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Transfer-Encoding: chunked
  `);

  // const res2 = await fetch(`${url}/connect`);
  // expect(res2).toMatchInlineSnapshot(`
  //   HTTP/1.1 404 Not Found
  //   Connection: close
  //   Content-Encoding: gzip
  //   Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
  //   Transfer-Encoding: chunked
  // `);

  // await new Promise<void>((res) => {
  //   const ws = new WebSocket(`ws://localhost:${port}/connect`);
  //   ws.on('open', () => {
  //     onOpen();
  //   });
  //   ws.on('close', () => {
  //     res();
  //   });
  // });

  // expect(onOpen).toHaveBeenCalledTimes(1);
  // expect(onConnected).toHaveBeenCalledTimes(1);

  await close();
  // wss.close();
});
