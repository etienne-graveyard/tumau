import {
  createServer,
  TumauResponse,
  Middleware,
  HttpMethod,
  RouterPackage,
  Route,
  Routes,
  RouterConsumer,
  UrlParserConsumer,
  JsonResponse,
  Chemin,
  CheminParam as P,
  compose,
} from 'tumau';

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
    <a href="/next/yolo">/next/yolo</a><br />
    <a href="/static/hey">/static/hey</a><br />
    <a href="/static/yolo">/static/yolo</a><br />
    <p>${content}</p>
  </body>
</html>`;

const logRoute: Middleware = (ctx, next) => {
  const parsedUrl = ctx.get(UrlParserConsumer);
  console.log(parsedUrl && parsedUrl.pathname);
  return next(ctx);
};

const ROUTE_WITH_PARAM = Chemin.create('static', P.string('app'));

const ROUTES: Routes = [
  Route.GET('/', logRoute, () => {
    return TumauResponse.withHtml(render('Home'));
  }),
  Route.create({ pattern: ROUTE_WITH_PARAM, exact: false, method: null }, (ctx) => {
    const params = ctx.getOrFail(RouterConsumer).getOrFail(ROUTE_WITH_PARAM);
    return JsonResponse.withJson({
      appParam: params.app,
    });
  }),
  Route.create({ pattern: '/group', exact: false }, logRoute, [
    Route.GET('/skip', async () => {
      // return null will skip the route
      return null;
    }),
    Route.GET('/1', () => {
      return TumauResponse.withHtml(render('Group 1'));
    }),
    Route.GET('/2', () => {
      return TumauResponse.withHtml(render('Group 2'));
    }),
  ]),
  Route.GET('/group/skip', async (ctx, next) => {
    await next(ctx);
    return TumauResponse.withHtml(render('Group skiped !'));
  }),
  Route.namespace('/foo', [
    Route.GET('/bar', logRoute, () => {
      return TumauResponse.withHtml(render('Baaaaar'));
    }),
    Route.GET(null, () => TumauResponse.withHtml(render('GET on /foo Not found'))),
    Route.POST(null, () => TumauResponse.withHtml(render('POST on /foo Not found'))),
    Route.create({ method: [HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT] }, () =>
      TumauResponse.withHtml(render('foo Not found'))
    ),
  ]),
  Route.GET('/search', (ctx) => {
    const parsedUrl = ctx.getOrFail(UrlParserConsumer);
    const searchQuery = parsedUrl && parsedUrl.query && parsedUrl.query.q;
    if (searchQuery) {
      return TumauResponse.withHtml(render(`Search page for "${searchQuery}"`));
    }
    // oops not a real match (return no response => act like this the route didn't match in the first place)
    return null;
  }),
  Route.GET('/next/:subroute?', (ctx, next) => {
    // calling next in a route call the middleware after the route
    return next(ctx);
  }),
  Route.GET('/next/yolo', () => {
    return TumauResponse.withHtml(render('Welcome on /next/yolo'));
  }),
  Route.GET(null, () => TumauResponse.withHtml(render('Not found'))),
  Route.create({ pattern: '/all' }, () => null),
];

const server = createServer(
  compose(
    RouterPackage(ROUTES),
    // this middleware is executed if next is called inside a route middleware
    (ctx) => {
      const router = ctx.getOrFail(RouterConsumer);
      const pattern = router.pattern?.stringify();
      const subroute = (router.params?.subroute as any)?.value;

      if (subroute === 'yolo') {
        // this will go up to the router and pretend it did not match this route
        // then the router will run the next matching route (/next/yolo)
        return null;
      }

      return TumauResponse.withHtml(render(`Next was called on ${pattern} with subroute: ${subroute}`));
    }
  )
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
