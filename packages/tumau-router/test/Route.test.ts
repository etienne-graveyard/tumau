it('prevent no test error', () => {
  expect(true).toBe(true);
});

// describe('RoutePattern', () => {
//   // const admin = pat('admin', optional('yolo'));
//   // const sessionRoot = pat(admin, optional('session', 'sess'), 'session');
//   // const session = pat(sessionRoot, num('sessionId'));

//   const log = (res: any) => {
//     console.log(JSON.stringify(res, null, 2));
//     if (res) {
//       res.providers.forEach((v: any) => console.log(v));
//     }
//   };

//   // log(RoutePattern.match(session, 'admin/session'.split('/')));
//   // log(RoutePattern.match(session, 'admin/session/54'.split('/')));
//   // log(RoutePattern.match(session, 'admin/sess/session/54'.split('/')));
//   // log(RoutePattern.match(session, 'admin/yolo/session/54'.split('/')));
//   // log(RoutePattern.match(session, 'admin/yolo/session/54/demo/after'.split('/')));

//   const res = RoutePattern.match(
//     pat(pat(optional('user'), num('userId')), pat(optional('pass'), num('passId'))),
//     'user/3/pass/6'.split('/')
//   );

//   log(res);
// });

// const noop: Middleware = () => null;

// describe('flatten', () => {
//   it('flatten a single route', () => {
//     const route = Route.GET('/foo', noop);
//     const flat = Route.flatten([route]);
//     expect(Array.isArray(flat)).toBeTruthy();
//     expect(flat.length).toBe(1);
//     expect(flat[0]).toMatchInlineSnapshot(`
//       Object {
//         "children": Array [],
//         "exact": true,
//         "method": "GET",
//         "middleware": [Function],
//         "pattern": "/foo",
//         Symbol(ROUTE_TOKEN): true,
//       }
//     `);
//   });

//   it('flatten a namespace', () => {
//     const route = Route.GET('/foo', noop);
//     const namespace = Route.namespace('/user', [route]);
//     const flat = Route.flatten([namespace]);
//     expect(Array.isArray(flat)).toBeTruthy();
//     expect(flat.length).toBe(1);
//     expect(flat[0].pattern).toBe('/user/foo');
//   });
// });
