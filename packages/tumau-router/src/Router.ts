import { Middleware } from '@tumau/core';
import { UrlParser } from '@tumau/url-parser';
import { RouterCtx } from './RouterCtx';
import { Routes } from './Route';
import { AllowedMethods } from './AllowedMethods';
import { StandaloneRouter } from './StandaloneRouter';

export function Router<Ctx extends RouterCtx>(routes: Routes<Ctx>): Middleware<Ctx> {
  return Middleware.compose(
    UrlParser(),
    AllowedMethods(routes),
    StandaloneRouter(routes)
  );
}
