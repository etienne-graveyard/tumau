import { Server, Response, Middleware, HttpMethod } from '@tumau/core';
import { Router, Route, Routes, RouterContext } from '@tumau/router';
import { UrlParserContext } from '@tumau/url-parser';

const render = (content: string) => `<!DOCTYPE html>
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
    <a href="/group/skip">/group/skip</a><br />
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
</html>`;

const logRoute: Middleware = (ctx, next) => {
  const parsedUrl = ctx.get(UrlParserContext);
  console.log(parsedUrl && parsedUrl.pathname);
  return next(ctx);
};

const ROUTES: Routes = [
  Route.GET('/', logRoute, () => {
    return Response.withHtml(render('Home'));
  }),
  Route.create({ pattern: '/group', exact: false }, logRoute, [
    Route.GET('/skip', async () => {
      // return null will skip the route
      return null;
    }),
    Route.GET('/1', () => {
      return Response.withHtml(render('Group 1'));
    }),
    Route.GET('/2', () => {
      return Response.withHtml(render('Group 2'));
    }),
  ]),
  Route.GET('/group/skip', async (ctx, next) => {
    await next(ctx);
    return Response.withHtml(render('Group skiped !'));
  }),
  Route.namespace('/foo', [
    Route.GET('/bar', logRoute, () => {
      return Response.withHtml(render('Baaaaar'));
    }),
    Route.GET(null, () => Response.withHtml(render('GET on /foo Not found'))),
    Route.POST(null, () => Response.withHtml(render('POST on /foo Not found'))),
    Route.create({ method: [HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT] }, () =>
      Response.withHtml(render('foo Not found'))
    ),
  ]),
  Route.GET('/search', ctx => {
    const parsedUrl = ctx.getOrThrow(UrlParserContext);
    const searchQuery = parsedUrl && parsedUrl.query && parsedUrl.query.q;
    if (searchQuery) {
      return Response.withHtml(render(`Search page for "${searchQuery}"`));
    }
    // oops not a real match (return no response => act like this the route didn't match in the first place)
    return null;
  }),
  Route.GET('/next/*?', (ctx, next) => {
    // calling next in a route call the middleware after the route
    return next(ctx);
  }),
  Route.GET(null, () => Response.withHtml(render('Not found'))),
  Route.create({ pattern: '/all' }, () => null),
];

const server = Server.create(
  Middleware.compose(
    Router(ROUTES),
    // this middleware is executed if next is called inside a route middleware
    ctx => {
      const router = ctx.get(RouterContext);
      const pattern = router && router.pattern;
      const params = router && router.params && router.params.wild;

      return Response.withHtml(render(`Next was called on ${pattern} with ${params}`));
    }
  )
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
