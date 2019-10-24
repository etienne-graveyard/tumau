import { Middleware } from '@tumau/core';
import { UrlParser } from '@tumau/url-parser';
import { Routes } from './Route';
import { AllowedMethods } from './AllowedMethods';
import { Router } from './Router';

export function RouterPackage(routes: Routes): Middleware {
  return Middleware.compose(
    UrlParser(),
    AllowedMethods(routes),
    Router(routes)
  );
}