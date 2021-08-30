import { HttpMethod, compose } from '../core';
import { CorsPreflight, CorsPreflightConfig } from '../cors';
import { Route, Routes } from './Route';

export function CorsPreflightRoutes(routes: Routes, config: CorsPreflightConfig = {}): Routes {
  const PreflightMiddleware = CorsPreflight(config);
  const byPattern = Route.groupByPattern(routes);
  const updatedRoutes = new Map<Route, Route>();
  const result: Routes = [];
  byPattern.forEach(({ pattern, routes }) => {
    const optionsRoute = routes.find((route) => route.method === HttpMethod.OPTIONS);
    if (optionsRoute) {
      const newRoute: Route = {
        ...optionsRoute,
        middleware: compose(PreflightMiddleware, optionsRoute.middleware),
      };
      updatedRoutes.set(optionsRoute, newRoute);
    } else {
      result.push(Route.create({ pattern, exact: true, method: HttpMethod.OPTIONS }, PreflightMiddleware));
    }
  });
  routes.forEach((route) => {
    const updated = updatedRoutes.get(route);
    if (updated) {
      result.push(updated);
    } else {
      result.push(route);
    }
  });
  return result;
}
