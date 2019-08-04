import { Server, BaseContext, Response, Middleware } from '@tumau/core';
import { Router, RouterCtx, Route } from '@tumau/router';

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
  <a href="/foo">/foo</a><br />
  <a href="/foo/">/foo/</a><br />
  <a href="/foo/bar">/foo/bar</a><br />
  <a href="/foo/not-found">/foo/not-found</a><br />
  <a href="/search">/search</a><br />
  <a href="/search?q=hey">/search?q=hey</a><br />
  <a href="/next">/next</a><br />
  <a href="/next/demo">/next/demo</a><br />
  <p>${content}</p>
</body>
</html>
`;

const server = Server.create<Ctx>(
  ctx => ctx,
  Middleware.compose(
    Router([
      Route.GET('/', ctx => {
        return {
          ctx,
          response: Response.create({ body: render('Home') }),
        };
      }),
      Route.namespace(
        '/foo',
        Router([
          Route.GET('/bar', ctx => {
            return {
              ctx,
              response: Response.create({ body: render('Baaaaar') }),
            };
          }),
          Route.GET(null, ctx => ({ ctx, response: Response.create({ body: render('foo Not found') }) })),
        ])
      ),
      Route.GET('/search', ctx => {
        const searchQuery = ctx.parsedUrl && ctx.parsedUrl.query && ctx.parsedUrl.query.q;
        if (searchQuery) {
          return {
            ctx,
            response: Response.create({ body: render(`Search page for "${searchQuery}"`) }),
          };
        }
        // oops not a real match
        return {
          ctx,
          response: null,
        };
      }),
      Route.GET('/next/*?', (ctx, next) => {
        // calling next in a route call the middleware after the route
        return next(ctx);
      }),
      Route.GET(null, ctx => ({ ctx, response: Response.create({ body: render('Not found') }) })),
    ]),
    ctx => {
      const pattern = ctx.router && ctx.router.pattern;
      const params = ctx.router && ctx.router.params && ctx.router.params.wild;

      return {
        ctx,
        response: Response.create({ body: render(`Next was called on ${pattern} with ${params}`) }),
      };
    }
  )
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
