import { HttpMethod, compose } from '../core';
import { CorsActual, CorsPreflightConfig } from '../cors';
import { CorsPreflightRoutes } from './CorsPreflightRoutes';
import { Route, Routes } from './Route';

export function CorsRoutes(config: CorsPreflightConfig = {}) {
  return (routes: Routes): Routes => {
    const withCorsActual = routes.map((route) => {
      const { pattern, exact, method, middleware, isFallback } = route;
      if (method === HttpMethod.OPTIONS) {
        return route;
      }
      return Route.create({ pattern, exact, method, isFallback }, compose(CorsActual(config), middleware));
    });
    return CorsPreflightRoutes(withCorsActual, config);
  };
}
