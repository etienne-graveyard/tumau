import {
  TumauServer,
  TumauResponse,
  CookieResponse,
  SetCookie,
  Middleware,
  CookieManager,
  CookieManagerConsumer,
  HttpError,
  HandleErrors,
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
    Set-Cookie: token=T55YTRR55554; Path=/; HttpOnly
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
    Set-Cookie: token=T55YTRR55554; Path=/; HttpOnly
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
    Set-Cookie: token=T55YTRR55554; Path=/; HttpOnly, user=etienne; Path=/; HttpOnly
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
    Set-Cookie: token=T55YTRR55554; Path=/; HttpOnly
  `);

  await tumauServer.close();
  await koaServer.close();
});

test('should return the same result as koa when deleting cookie', async () => {
  const tumauApp = TumauServer.create(() => {
    return new CookieResponse(TumauResponse.noContent(), [SetCookie.delete('token')]);
  });
  const koaApp = new koa();
  koaApp.use(ctx => {
    ctx.cookies.set('token');
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
    Set-Cookie: token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly
  `);
  expect(tumauRes).toMatchInlineSnapshot(`
    HTTP/1.1 204 No Content
    Connection: close
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Set-Cookie: token=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; HttpOnly
  `);

  await tumauServer.close();
  await koaServer.close();
});

test('Cookie manager should set and delete cookies', async () => {
  const tumauApp = TumauServer.create(
    Middleware.compose(CookieManager(), tools => {
      const manager = tools.readContextOrFail(CookieManagerConsumer);
      manager.set('new-cookie', 'value');
      manager.delete('deleted-cookie');
      return TumauResponse.noContent();
    })
  );

  const tumauServer = await mountTumau(tumauApp);
  const tumauRes = await fetch(tumauServer.url);

  expect(tumauRes).toMatchInlineSnapshot(`
    HTTP/1.1 204 No Content
    Connection: close
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Set-Cookie: new-cookie=value; Path=/; HttpOnly, deleted-cookie=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; HttpOnly
  `);

  await tumauServer.close();
});

test('Cookies should not be set on error response', async () => {
  const app = TumauServer.create(
    Middleware.compose(CookieManager(), HandleErrors, tools => {
      const manager = tools.readContextOrFail(CookieManagerConsumer);
      manager.set('new-cookie', 'value');
      manager.delete('deleted-cookie');
      throw new HttpError.NotFound();
    })
  );
  const { url, close } = await mountTumau(app);
  const tumauRes = await fetch(url);
  expect(tumauRes).toMatchInlineSnapshot(`
    HTTP/1.1 404 Not Found
    Connection: close
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Transfer-Encoding: chunked
  `);

  await close();
});
