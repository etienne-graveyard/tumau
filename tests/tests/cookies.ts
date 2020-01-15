import {
  Server,
  TumauResponse,
  CookieResponse,
  SetCookie,
  Middleware,
  CookieManager,
  CookieManagerConsumer,
} from 'tumau';
import { runKoaRequest, runTumauRequest } from '../utils/runRequest';
import { Request } from '../utils/Request';
import koa from 'koa';

test('should set the Set-Cookie header', async () => {
  const tumauApp = Server.create(() => {
    return new CookieResponse(TumauResponse.noContent(), [SetCookie.create('token', 'T55YTRR55554')]);
  });
  const tumauRes = await runTumauRequest(tumauApp, new Request());
  expect(tumauRes).toMatchInlineSnapshot(`
    HTTP/1.1 204 No Content
    Connection: close
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Set-Cookie: token=T55YTRR55554; HttpOnly; Path=/
  `);
});

test('should set the Set-Cookie header using Manager', async () => {
  const tumauApp = Server.create(
    Middleware.compose(CookieManager(), tools => {
      tools.readContextOrFail(CookieManagerConsumer).set('token', 'T55YTRR55554');
      return TumauResponse.noContent();
    })
  );
  const tumauRes = await runTumauRequest(tumauApp, new Request());
  expect(tumauRes).toMatchInlineSnapshot(`
    HTTP/1.1 204 No Content
    Connection: close
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Set-Cookie: token=T55YTRR55554; HttpOnly; Path=/
  `);
});

test('should set two Set-Cookie header using Manager', async () => {
  const tumauApp = Server.create(
    Middleware.compose(CookieManager(), tools => {
      const cookieManager = tools.readContextOrFail(CookieManagerConsumer);
      cookieManager.set('token', 'T55YTRR55554');
      cookieManager.set('user', 'etienne');
      return TumauResponse.noContent();
    })
  );
  const tumauRes = await runTumauRequest(tumauApp, new Request());
  expect(tumauRes).toMatchInlineSnapshot(`
    HTTP/1.1 204 No Content
    Connection: close
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Set-Cookie: token=T55YTRR55554; HttpOnly; Path=/
    Set-Cookie: user=etienne; HttpOnly; Path=/
  `);
});

test('koa multiple cookie', async () => {
  const koaApp = new koa();
  koaApp.use(ctx => {
    ctx.cookies.set('token', 'T55YTRR55554');
    ctx.cookies.set('user', 'etienne');
    ctx.body = null;
  });

  const koaRes = await runKoaRequest(koaApp, new Request());

  expect(koaRes).toMatchInlineSnapshot(`
    HTTP/1.1 204 No Content
    Connection: close
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Set-Cookie: token=T55YTRR55554; path=/; httponly
    Set-Cookie: user=etienne; path=/; httponly
  `);
});

test('should return the same result as koa', async () => {
  const tumauApp = Server.create(() => {
    return new CookieResponse(TumauResponse.noContent(), [SetCookie.create('token', 'T55YTRR55554')]);
  });
  const koaApp = new koa();
  koaApp.use(ctx => {
    ctx.cookies.set('token', 'T55YTRR55554');
    ctx.body = null;
  });

  const tumauRes = await runTumauRequest(tumauApp, new Request());
  const koaRes = await runKoaRequest(koaApp, new Request());

  expect(koaRes).toMatchInlineSnapshot(`
    HTTP/1.1 204 No Content
    Connection: close
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Set-Cookie: token=T55YTRR55554; path=/; httponly
  `);
  expect(tumauRes).toMatchInlineSnapshot(`
    HTTP/1.1 204 No Content
    Connection: close
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Set-Cookie: token=T55YTRR55554; HttpOnly; Path=/
  `);
});
