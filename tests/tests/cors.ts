import {
  TumauServer,
  TumauResponse,
  CorsActual,
  Middleware,
  CorsActualConfig,
  CorsPreflight,
  RequestConsumer,
  HttpMethod,
  HttpError,
  CorsPreflightConfig,
  CorsPackage,
} from 'tumau';
import { mountTumau } from '../utils/mountTumau';
import fetch from 'node-fetch';

describe('CORS: simple / actual requests', () => {
  function createCorsServer(config: CorsActualConfig = {}) {
    return TumauServer.create(
      Middleware.compose(CorsActual(config), () => {
        return TumauResponse.withText('Hello');
      })
    );
  }

  test('create server with cors does not throw', async () => {
    expect(() => createCorsServer()).not.toThrow();
  });

  test('simple text response', async () => {
    const app = createCorsServer();
    const { url, close } = await mountTumau(app);
    const res = await fetch(url);
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Length: 5
      Content-Type: text/plain; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    expect(await res.text()).toBe('Hello');
    await close();
  });

  test('6.1.1 Does not set headers if Origin is missing', async () => {
    const app = createCorsServer({
      allowOrigin: ['http://api.myapp.com', 'http://www.myapp.com'],
    });
    const { url, close } = await mountTumau(app);
    const res = await fetch(url);
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Length: 5
      Content-Type: text/plain; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    await close();
  });

  test('6.1.2 Does not set headers if Origin does not match', async () => {
    const app = createCorsServer({
      allowOrigin: ['http://api.myapp.com', 'http://www.myapp.com'],
    });
    const { url, close } = await mountTumau(app);
    const res = await fetch(url, {
      headers: {
        Origin: 'http://random-website.com',
      },
    });
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Length: 5
      Content-Type: text/plain; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    await close();
  });

  test('6.1.3 Sets Allow-Origin headers if the Origin matches', async () => {
    const app = createCorsServer({
      allowOrigin: ['http://api.myapp.com', 'http://www.myapp.com'],
    });
    const { url, close } = await mountTumau(app);
    const res = await fetch(url, {
      headers: {
        Origin: 'http://api.myapp.com',
      },
    });
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Access-Control-Allow-Origin: http://api.myapp.com
      Connection: close
      Content-Length: 5
      Content-Type: text/plain; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    await close();
  });

  test('6.1.3 Does not set Access-Control-Allow-Credentials header if Origin is *', async () => {
    expect(() =>
      createCorsServer({
        allowOrigin: ['*'],
        allowCredentials: true,
      })
    ).toThrowError('');
  });

  test('6.1.3 Sets Access-Control-Allow-Credentials header if configured', async () => {
    const app = createCorsServer({
      allowOrigin: ['http://api.myapp.com'],
      allowCredentials: true,
    });
    const { url, close } = await mountTumau(app);
    const res = await fetch(url, {
      headers: {
        Origin: 'http://api.myapp.com',
      },
    });
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Access-Control-Allow-Credentials: true
      Access-Control-Allow-Origin: http://api.myapp.com
      Connection: close
      Content-Length: 5
      Content-Type: text/plain; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    await close();
  });

  test('6.1.4 Does not set exposed headers if empty', async () => {
    const app = createCorsServer({
      allowOrigin: ['http://api.myapp.com', 'http://www.myapp.com'],
    });
    const { url, close } = await mountTumau(app);
    const res = await fetch(url, {
      headers: {
        Origin: 'http://api.myapp.com',
      },
    });
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Access-Control-Allow-Origin: http://api.myapp.com
      Connection: close
      Content-Length: 5
      Content-Type: text/plain; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    await close();
  });

  test('6.1.4 Sets exposed headers if configured', async () => {
    const app = createCorsServer({
      allowOrigin: ['http://api.myapp.com', 'http://www.myapp.com'],
      exposeHeaders: ['HeaderA', 'HeaderB'],
    });
    const { url, close } = await mountTumau(app);
    const res = await fetch(url, {
      headers: {
        Origin: 'http://api.myapp.com',
      },
    });
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Access-Control-Allow-Origin: http://api.myapp.com
      Access-Control-Expose-Headers: HeaderA, HeaderB
      Connection: close
      Content-Length: 5
      Content-Type: text/plain; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    await close();
  });
});

describe('CORS: preflight requests', () => {
  function createCorsServer(config: CorsPreflightConfig = {}) {
    return TumauServer.create(
      Middleware.compose(CorsPreflight(config), (ctx) => {
        const req = ctx.getOrFail(RequestConsumer);
        if (req.method === HttpMethod.POST) {
          return TumauResponse.withText('Hello');
        }
        throw new HttpError(405);
      })
    );
  }

  test('6.2.1 Does not set headers if Origin is missing', async () => {
    const app = createCorsServer({
      allowOrigin: ['http://api.myapp.com', 'http://www.myapp.com'],
    });
    const { url, close } = await mountTumau(app);
    const res = await fetch(url, {
      headers: {},
    });
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 405 Method Not Allowed
      Connection: close
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Transfer-Encoding: chunked
    `);
    await close();
  });

  test('6.2.2 Does not set headers if Origin does not match', async () => {
    const app = createCorsServer({
      allowOrigin: ['http://api.myapp.com', 'http://www.myapp.com'],
    });
    const { url, close } = await mountTumau(app);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Origin: 'http://random-website.com',
      },
    });
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Length: 5
      Content-Type: text/plain; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    await close();
  });

  test('6.2.3 Does not set headers if Access-Control-Request-Method is missing', async () => {
    const app = createCorsServer({
      allowOrigin: ['http://api.myapp.com', 'http://www.myapp.com'],
    });
    const { url, close } = await mountTumau(app);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Origin: 'http://api.myapp.com',
      },
    });
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Length: 5
      Content-Type: text/plain; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    await close();
  });

  // xit('6.2.4 Does not terminate if parsing of Access-Control-Request-Headers fails', function(done) {
  //   done();
  // });
  // xit('6.2.5 Always matches Access-Control-Request-Method (spec says it is acceptable)', function(done) {
  //   done();
  // });

  test('6.2.6 Does not set headers if Access-Control-Request-Headers does not match', async () => {
    const app = createCorsServer({
      allowOrigin: ['http://api.myapp.com', 'http://www.myapp.com'],
      allowHeaders: ['API-Token'],
    });
    const { url, close } = await mountTumau(app);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Origin: 'http://api.myapp.com',
        'Access-Control-Request-Headers': 'Weird-Header',
      },
    });
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Length: 5
      Content-Type: text/plain; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    await close();
  });

  test('6.2.7 Set the Allow-Origin header if it matches', async () => {
    const app = createCorsServer({
      allowOrigin: ['http://api.myapp.com', 'http://www.myapp.com'],
    });
    const { url, close } = await mountTumau(app);
    const res = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://api.myapp.com',
        'Access-Control-Request-Method': 'GET',
      },
    });
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 204 No Content
      Access-Control-Allow-Headers: x-requested-with, access-control-allow-origin, x-http-method-override, content-type, authorization, accept
      Access-Control-Allow-Methods: POST, GET, PUT, PATCH, DELETE, OPTIONS
      Access-Control-Allow-Origin: http://api.myapp.com
      Access-Control-Max-Age: 86400
      Connection: close
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    await close();
  });

  // it('6.2.8 Set the Access-Control-Max-Age header if a max age is provided', function(done) {
  //   var server = test.corsServer({
  //     preflightMaxAge: 5,
  //     origins: ['http://api.myapp.com', 'http://www.myapp.com'],
  //   });
  //   request(server)
  //     .options('/test')
  //     .set('Origin', 'http://api.myapp.com')
  //     .set('Access-Control-Request-Method', 'GET')
  //     .expect('Access-Control-Max-Age', '5')
  //     .expect(204)
  //     .end(done);
  // });
  // it('6.2.9 Set the Allow-Method header', function(done) {
  //   var server = test.corsServer({
  //     origins: ['http://api.myapp.com', 'http://www.myapp.com'],
  //   });
  //   request(server)
  //     .options('/test')
  //     .set('Origin', 'http://api.myapp.com')
  //     .set('Access-Control-Request-Method', 'GET')
  //     .expect('Access-Control-Allow-Methods', 'GET, OPTIONS')
  //     .expect(204)
  //     .end(done);
  // });
  // it('6.2.10 Set the Allow-Headers to all configured custom headers', function(done) {
  //   var server = test.corsServer({
  //     origins: ['http://api.myapp.com', 'http://www.myapp.com'],
  //     allowHeaders: ['HeaderA'],
  //   });
  //   request(server)
  //     .options('/test')
  //     .set('Origin', 'http://api.myapp.com')
  //     .set('Access-Control-Request-Method', 'GET')
  //     .expect('Access-Control-Allow-Headers', /accept-version/) // restify defaults
  //     .expect('Access-Control-Allow-Headers', /x-api-version/) // restify defaults
  //     .expect('Access-Control-Allow-Headers', /HeaderA/) // custom header
  //     .expect(204)
  //     .end(done);
  // });
  // it('[Not in spec] The Allow-Headers should not contain duplicates', function(done) {
  //   var server = test.corsServer({
  //     origins: ['http://api.myapp.com', 'http://www.myapp.com'],
  //   });
  //   request(server)
  //     .options('/test')
  //     .set('Origin', 'http://api.myapp.com')
  //     .set('Access-Control-Request-Method', 'GET')
  //     .expect(204)
  //     .then(function(request) {
  //       var allowHeaders = request.headers['access-control-allow-headers'].split(', ');
  //       if (new Set(allowHeaders).size !== allowHeaders.length) {
  //         return done(new Error('duplicate header detected'));
  //       }
  //       done(null);
  //     });
  // });
});

describe('CorsPackage', () => {
  function createServer(config: CorsActualConfig = {}) {
    return TumauServer.create(
      Middleware.compose(CorsPackage(config), () => {
        return TumauResponse.withText('Hello');
      })
    );
  }

  test('create a server with CorsPackage does not throw', () => {
    expect(() => createServer()).not.toThrow();
  });

  test('response to actual request', async () => {
    const app = createServer();
    const { url, close } = await mountTumau(app);
    const res = await fetch(url, {
      headers: {
        Origin: 'http://api.myapp.com',
      },
    });
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Access-Control-Allow-Origin: http://api.myapp.com
      Connection: close
      Content-Length: 5
      Content-Type: text/plain; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    await close();
  });

  test('response to preflight request', async () => {
    const app = createServer();
    const { url, close } = await mountTumau(app);
    const res = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://api.myapp.com',
        'Access-Control-Request-Method': 'GET',
      },
    });
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 204 No Content
      Access-Control-Allow-Headers: x-requested-with, access-control-allow-origin, x-http-method-override, content-type, authorization, accept
      Access-Control-Allow-Methods: POST, GET, PUT, PATCH, DELETE, OPTIONS
      Access-Control-Allow-Origin: http://api.myapp.com
      Access-Control-Max-Age: 86400
      Connection: close
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    await close();
  });

  test('handle error', async () => {
    const app = TumauServer.create(
      Middleware.compose(CorsPackage(), () => {
        throw new HttpError.NotFound();
      })
    );
    const { url, close } = await mountTumau(app);
    const res = await fetch(url, {
      headers: {
        Origin: 'http://api.myapp.com',
      },
    });
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 404 Not Found
      Access-Control-Allow-Origin: http://api.myapp.com
      Connection: close
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Transfer-Encoding: chunked
    `);
    await close();
  });

  test('handle error on preflight', async () => {
    const app = TumauServer.create(
      Middleware.compose(CorsPackage(), () => {
        throw new HttpError.NotFound();
      })
    );
    const { url, close } = await mountTumau(app);
    const res = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://api.myapp.com',
        'Access-Control-Request-Method': 'POST',
      },
    });
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 204 No Content
      Access-Control-Allow-Headers: x-requested-with, access-control-allow-origin, x-http-method-override, content-type, authorization, accept
      Access-Control-Allow-Methods: POST, GET, PUT, PATCH, DELETE, OPTIONS
      Access-Control-Allow-Origin: http://api.myapp.com
      Access-Control-Max-Age: 86400
      Connection: close
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `);
    await close();
  });
});
