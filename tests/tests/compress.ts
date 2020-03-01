import { TumauServer, Middleware, JsonResponse, CompressPackage } from 'tumau';
import { mountTumau } from '../utils/mountTumau';
import fetch from 'node-fetch';

describe('Compress', () => {
  test('gzip', async () => {
    const app = TumauServer.create(
      Middleware.compose(CompressPackage, () => JsonResponse.withJson({ hello: 'world' }))
    );

    const { close, url } = await mountTumau(app);
    const res = await fetch(url, {
      headers: {
        'accept-encoding': 'gzip',
      },
    });
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Encoding: gzip
      Content-Type: application/json
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Transfer-Encoding: chunked
    `);
    expect(await res.text()).toBe('{"hello":"world"}');
    await close();
  });

  test('brotli over gzip', async () => {
    const app = TumauServer.create(
      Middleware.compose(CompressPackage, () => JsonResponse.withJson({ hello: 'world' }))
    );
    const { close, url } = await mountTumau(app);
    const res = await fetch(url, {
      headers: {
        'accept-encoding': 'gzip, br',
      },
    });
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Encoding: br
      Content-Type: application/json
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Transfer-Encoding: chunked
    `);
    expect(await res.text()).toBe('{"hello":"world"}');
    await close();
  });

  test('deflate', async () => {
    const app = TumauServer.create(
      Middleware.compose(CompressPackage, () => JsonResponse.withJson({ hello: 'world' }))
    );
    const { close, url } = await mountTumau(app);
    const res = await fetch(url, {
      headers: {
        'accept-encoding': 'deflate',
      },
    });
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Encoding: deflate
      Content-Type: application/json
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Transfer-Encoding: chunked
    `);
    expect(await res.text()).toBe('{"hello":"world"}');
    await close();
  });
});
