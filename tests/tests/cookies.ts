import {
  TumauServer,
  TumauResponse,
  CookieResponse,
  SetCookie,
  Middleware,
  CookieManager,
  CookieManagerConsumer,
} from 'tumau';
import koa from 'koa';
import { mountTumau } from '../utils/mountTumau';
import { mountKoa } from '../utils/mountKoa';
import fetch from 'node-fetch';

test('should set the Set-Cookie header', async () => {
  const app = TumauServer.create(() => {
    return new CookieResponse(TumauResponse.noContent(), [SetCookie.create('token', 'T55YTRR55554')]);
  });
  const { close, url } = await mountTumau(app);
  const res = await fetch(url);
  expect(res).toMatchInlineSnapshot(`
    HTTP/1.1 204 No Content
    Connection: close
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Set-Cookie: token=T55YTRR55554; HttpOnly; Path=/
  `);
  await close();
});

test('should set the Set-Cookie header using Manager', async () => {
  const app = TumauServer.create(
    Middleware.compose(CookieManager(), tools => {
      tools.readContextOrFail(CookieManagerConsumer).set('token', 'T55YTRR55554');
      return TumauResponse.noContent();
    })
  );
  const { close, url } = await mountTumau(app);
  const res = await fetch(url);
  expect(res).toMatchInlineSnapshot(`
    HTTP/1.1 204 No Content
    Connection: close
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Set-Cookie: token=T55YTRR55554; HttpOnly; Path=/
  `);
  await close();
});

test('should set two Set-Cookie header using Manager', async () => {
  const app = TumauServer.create(
    Middleware.compose(CookieManager(), tools => {
      const cookieManager = tools.readContextOrFail(CookieManagerConsumer);
      cookieManager.set('token', 'T55YTRR55554');
      cookieManager.set('user', 'etienne');
      return TumauResponse.noContent();
    })
  );
  const { close, url } = await mountTumau(app);
  const res = await fetch(url);
  expect(res).toMatchInlineSnapshot(`
    HTTP/1.1 204 No Content
    Connection: close
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Set-Cookie: token=T55YTRR55554; HttpOnly; Path=/
    Set-Cookie: user=etienne; HttpOnly; Path=/
  `);
  await close();
});

test('should return the same result as koa', async () => {
  const tumauApp = TumauServer.create(() => {
    return new CookieResponse(TumauResponse.noContent(), [SetCookie.create('token', 'T55YTRR55554')]);
  });
  const koaApp = new koa();
  koaApp.use(ctx => {
    ctx.cookies.set('token', 'T55YTRR55554');
    ctx.body = null;
  });

  const tumauServer = await mountTumau(tumauApp);
  const koaServer = await mountKoa(koaApp);

  const tumauRes = await fetch(tumauServer.url);
  const koaRes = await fetch(koaServer.url);

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

  await tumauServer.close();
  await koaServer.close();
});
