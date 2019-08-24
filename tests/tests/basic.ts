import { Server, Response, HttpMethod } from '@tumau/core';
import { runTumauRequest, runKoaRequest } from '../utils/runRequest';
import { Request } from '../utils/Request';
import { BodyResponse } from '../utils/BodyResponse';
import koa = require('koa');
// import koa from 'koa';

describe('Server', () => {
  test('create a Server without crashing', () => {
    expect(() => Server.create(() => null)).not.toThrowError();
  });

  test('simple text response', async () => {
    const app = Server.create(() => {
      return Response.withText('Hey');
    });
    const res = await runTumauRequest(app, new Request());
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Length: 3
      Content-Type: text/plain; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    expect(await BodyResponse.asText(res)).toBe('Hey');
  });

  test('response to arbitrary path', async () => {
    const app = Server.create(() => {
      return Response.withText('Hey');
    });
    const res = await runTumauRequest(app, new Request({ path: '/some/path' }));
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Length: 3
      Content-Type: text/plain; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    expect(await BodyResponse.asText(res)).toBe('Hey');
  });

  test('response to post method', async () => {
    const app = Server.create(() => {
      return Response.withText('Hey');
    });
    const res = await runTumauRequest(app, new Request({ method: HttpMethod.POST }));
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Length: 3
      Content-Type: text/plain; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    expect(await BodyResponse.asText(res)).toBe('Hey');
  });

  test('head request return 204 & empty body', async () => {
    const app = Server.create(() => {
      return Response.withText('Hey');
    });
    const res = await runTumauRequest(app, new Request({ method: HttpMethod.HEAD }));
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 204 No Content
      Connection: close
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    expect(await BodyResponse.isEmpty(res)).toBe(true);
  });

  test('should return the same result as koa', async () => {
    const tumauApp = Server.create(() => {
      return Response.withText('Hey');
    });
    const koaApp = new koa();
    koaApp.use((ctx: any) => {
      ctx.body = 'Hey';
    });

    const tumauRes = await runTumauRequest(tumauApp, new Request());
    const koaRes = await runKoaRequest(koaApp, new Request());

    expect(tumauRes).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Length: 3
      Content-Type: text/plain; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    expect(koaRes).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Length: 3
      Content-Type: text/plain; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
  });
});
