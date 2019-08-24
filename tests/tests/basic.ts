import { Server, Response } from '@tumau/core';
import { runRequest } from '../utils/runRequest';
import { Request } from '../utils/Request';
import { BodyResponse } from '../utils/BodyResponse';

describe('Server', () => {
  test('create a Server without crashing', () => {
    expect(() => Server.create(() => null)).not.toThrowError();
  });

  test('can send a request', async () => {
    const app = Server.create(() => {
      return Response.withText('Hey');
    });
    const res = await runRequest(app, new Request());
    expect(res).toBeDefined();
    expect(res.statusCode).toBe(200);
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Content-Length: 3
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Connection: close
    `);
    const body = await BodyResponse.asText(res);
    expect(body).toBe('Hey');
  });
});
