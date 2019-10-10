import { Server, BaseContext, Response, Middleware, HttpMethod } from '@tumau/core';
import { Router, RouterCtx, Route, Routes } from '@tumau/router';

interface Ctx extends BaseContext, RouterCtx {}

const logRoute: Middleware<Ctx> = (ctx, next) => {
  console.log(ctx.parsedUrl && ctx.parsedUrl.pathname);
  return next(ctx);
};

const ROUTES: Routes<Ctx> = [
  Route.GET('/', logRoute, () => {
    return Response.withHtml(render('Home'));
  }),
  Route.create({ pattern: '/group', exact: false }, logRoute, [
    Route.GET('/1', () => {
      return Response.withHtml(render('Group 1'));
    }),
    Route.GET('/2', () => {
      return Response.withHtml(render('Group 1'));
    }),
    Route.GET('/3', () => {
      return Response.withHtml(render('Group 1'));
    }),
  ]),
  Route.namespace('/foo', [
    Route.GET('/bar', logRoute, () => {
      return Response.withHtml(render('Baaaaar'));
    }),
    Route.GET(null, () => Response.withHtml(render('foo Not found'))),
    Route.POST(null, () => Response.withHtml(render('foo Not found'))),
    Route.create({ method: [HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT] }, () =>
      Response.withHtml(render('foo Not found'))
    ),
  ]),
  Route.GET('/search', ctx => {
    const searchQuery = ctx.parsedUrl && ctx.parsedUrl.query && ctx.parsedUrl.query.q;
    if (searchQuery) {
      return Response.withHtml(render(`Search page for "${searchQuery}"`));
    }
    // oops not a real match (return no response === act like this the route didn't match in the first place)
    return null;
  }),
  Route.GET('/next/*?', (ctx, next) => {
    // calling next in a route call the middleware after the route
    return next(ctx);
  }),
  Route.GET(null, () => Response.withHtml(render('Not found'))),
  Route.create({ pattern: '/all' }, () => null),
];

const server = Server.create<Ctx>(
  Middleware.compose(
    Router(ROUTES),
    // this middleware is executed if next is called inside a route middleware
    ctx => {
      const pattern = ctx.router && ctx.router.pattern;
      const params = ctx.router && ctx.router.params && ctx.router.params.wild;

      return Response.withHtml(render(`Next was called on ${pattern} with ${params}`));
    }
  )
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
