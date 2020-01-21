import { TumauServer, Middleware } from '@tumau/core';
import { runTumauRequest } from '../utils/runRequest';
import { Request } from '../utils/Request';
import { JsonResponse } from '@tumau/json';
import { Compress } from '@tumau/compress';
import { BodyResponse } from 'tests/utils/BodyResponse';

describe('Compress', () => {
  test('gzip', async () => {
    const app = TumauServer.create(Middleware.compose(Compress(), () => JsonResponse.with({ hello: 'world' })));

    const res = await runTumauRequest(
      app,
      new Request({
        headers: {
          'accept-encoding': 'gzip',
        },
      })
    );
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Encoding: gzip
      Content-Type: application/json
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Transfer-Encoding: chunked
    `);
    expect(await BodyResponse.fromGzip(res)).toBe('{"hello":"world"}');
  });

  test('brotli over gzip', async () => {
    const app = TumauServer.create(Middleware.compose(Compress(), () => JsonResponse.with({ hello: 'world' })));
    const res = await runTumauRequest(
      app,
      new Request({
        headers: {
          'accept-encoding': 'gzip, br',
        },
      })
    );
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Encoding: br
      Content-Type: application/json
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Transfer-Encoding: chunked
    `);
    expect(await BodyResponse.fromBrotli(res)).toBe('{"hello":"world"}');
  });

  test('deflate', async () => {
    const app = TumauServer.create(Middleware.compose(Compress(), () => JsonResponse.with({ hello: 'world' })));
    const res = await runTumauRequest(
      app,
      new Request({
        headers: {
          'accept-encoding': 'deflate',
        },
      })
    );
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Encoding: deflate
      Content-Type: application/json
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Transfer-Encoding: chunked
    `);
    expect(await BodyResponse.fromDeflate(res)).toBe('{"hello":"world"}');
  });
});
