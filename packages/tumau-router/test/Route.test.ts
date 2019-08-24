import { Route } from '../src/Route';
import { Middleware } from '@tumau/core';

const noop: Middleware<any> = ctx => ({ ctx, response: null });

describe('flatten', () => {
  it('flatten a single route', () => {
    const route = Route.GET('/foo', noop);
    const flat = Route.flatten([route]);
    expect(Array.isArray(flat)).toBeTruthy();
    expect(flat.length).toBe(1);
    expect(flat[0]).toMatchInlineSnapshot(`
      Object {
        "children": Array [],
        "exact": true,
        "method": "GET",
        "middleware": [Function],
        "pattern": "/foo",
        Symbol(ROUTE_TOKEN): true,
      }
    `);
  });

  it('flatten a namespace', () => {
    const route = Route.GET('/foo', noop);
    const namespace = Route.namespace('/user', [route]);
    const flat = Route.flatten([namespace]);
    expect(Array.isArray(flat)).toBeTruthy();
    expect(flat.length).toBe(1);
    expect(flat[0].pattern).toBe('/user/foo');
  });
});
