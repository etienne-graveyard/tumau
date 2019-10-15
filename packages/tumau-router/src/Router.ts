import { Middleware } from '@tumau/core';
import { UrlParser } from '@tumau/url-parser';
import { Routes } from './Route';
import { AllowedMethods } from './AllowedMethods';
import { StandaloneRouter } from './StandaloneRouter';

export function Router(routes: Routes): Middleware {
  return Middleware.compose(
    UrlParser(),
    AllowedMethods(routes),
    StandaloneRouter(routes)
  );
}
