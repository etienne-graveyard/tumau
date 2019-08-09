import { Server, BaseContext, Response, Middleware, HttpMethod } from '@tumau/core';
import { Router, RouterCtx, Route, Routes } from '@tumau/router';

interface Ctx extends BaseContext, RouterCtx {}

const render = (content: string) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
  </head>
  <body>
    <a href="/">/</a><br />
    <a href="/group/1">/group/1</a><br />
    <a href="/group/2">/group/2</a><br />
    <a href="/group/3">/group/3</a><br />
    <a href="/foo">/foo</a><br />
    <a href="/foo/">/foo/</a><br />
    <a href="/foo/bar">/foo/bar</a><br />
    <a href="/foo/not-found">/foo/not-found</a><br />
    <a href="/search?q=hey">/search?q=hey</a><br />
    <a href="/search">/search</a><br />
    <a href="/next">/next</a><br />
    <a href="/next/demo">/next/demo</a><br />
    <p>${content}</p>
  </body>
</html>
`;

const logRoute: Middleware<Ctx> = (ctx, next) => {
  console.log(ctx.parsedUrl && ctx.parsedUrl.pathname);
  return next(ctx);
};

const ROUTES: Routes<Ctx> = [
  Route.GET('/', logRoute, () => {
    return Response.withText(render('Home'));
  }),
  Route.create({ pattern: '/group', exact: false }, logRoute, [
    Route.GET('/1', () => {
      return Response.withText(render('Group 1'));
    }),
    Route.GET('/2', () => {
      return Response.withText(render('Group 1'));
    }),
    Route.GET('/3', () => {
      return Response.withText(render('Group 1'));
    }),
  ]),
  Route.namespace('/foo', [
    Route.GET('/bar', logRoute, () => {
      return Response.withText(render('Baaaaar'));
    }),
    Route.GET(null, () => Response.withText(render('foo Not found'))),
    Route.POST(null, () => Response.withText(render('foo Not found'))),
    Route.create({ method: [HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT] }, () =>
      Response.withText(render('foo Not found'))
    ),
  ]),
  Route.GET('/search', ctx => {
    const searchQuery = ctx.parsedUrl && ctx.parsedUrl.query && ctx.parsedUrl.query.q;
    if (searchQuery) {
      return Response.withText(render(`Search page for "${searchQuery}"`));
    }
    // oops not a real match (return no response === act like this the route didn't match in the first place)
    return null;
  }),
  Route.GET('/next/*?', (ctx, next) => {
    // calling next in a route call the middleware after the route
    return next(ctx);
  }),
  Route.GET(null, () => Response.withText(render('Not found'))),
  Route.create({ pattern: '/all' }, () => null),
];

const server = Server.create<Ctx>(
  Middleware.compose(
    Router(ROUTES),
    // this middleware is executed if next is called inside a route middleware
    ctx => {
      const pattern = ctx.router && ctx.router.pattern;
      const params = ctx.router && ctx.router.params && ctx.router.params.wild;

      return Response.withText(render(`Next was called on ${pattern} with ${params}`));
    }
  )
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
