import { Middleware, Result } from '@tumau/core';
import { UrlParser } from '@tumau/url-parser';
import { RouterCtx } from './RouterCtx';
import { Route } from './Route';

export function Router<Ctx extends RouterCtx>(routes: Array<Route<Ctx>>): Middleware<Ctx> {
  const router: Middleware<Ctx> = async (inCtx, next): Promise<Result<Ctx>> => {
    async function handleNext(startIndex: number, ctx: Ctx): Promise<Result<Ctx>> {
      const findResult = Route.find(routes, startIndex, ctx);

      const routeMiddleware = findResult ? findResult.route.middleware : null;
      const pattern = findResult ? findResult.route.pattern : '';
      const composedPattern = ctx.router ? ctx.router.pattern + pattern : pattern;

      const nextCtx: Ctx = {
        ...ctx,
        router: {
          middleware: routeMiddleware,
          pattern: composedPattern,
          notFound: findResult === false,
          params: findResult ? findResult.params : {},
        },
      };

      if (findResult) {
        // found a match, run it's middleware
        const result = await findResult.route.middleware(
          nextCtx,
          (ctx: RouterCtx): Promise<Result<Ctx>> => {
            return next(ctx as any);
          }
        );

        // If the match did not return a response search the next match
        if (result.response === null) {
          return handleNext(findResult.index + 1, ctx as any);
        }

        // return the response
        return result;
      }

      // no match, run next
      return next(nextCtx);
    }

    return handleNext(0, inCtx);
  };

  return Middleware.compose(
    UrlParser(),
    router
  );
}
