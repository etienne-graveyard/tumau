import {
  compose,
  createKey,
  HttpError,
  HttpHeader,
  HttpMethod,
  Middleware,
  Result,
  TumauHandlerResponse,
  TumauResponse,
} from '../core';
import { Route, Routes } from './Route';

export const RouterAllowedMethodsKey = createKey<Set<HttpMethod>>({ name: 'RouterAllowedMethods' });
export const RouterAllowedMethodsConsumer = RouterAllowedMethodsKey.Consumer;

export function allowedMethodsResponse(response: TumauResponse, allowedMethods: Set<HttpMethod>): TumauResponse {
  const allowHeaderContent = Array.from(allowedMethods.values()).join(',');
  return response
    .addHeaders([HttpHeader.Allow, allowHeaderContent])
    .with(RouterAllowedMethodsKey.Provider(allowedMethods));
}

export function AllowedMethodsRoutes(routes: Routes): Routes {
  const result: Routes = [];
  const byPattern = Route.groupByPattern(routes);
  const updatedRoutes = new Map<Route, Route>();
  byPattern.forEach(({ pattern, routes }) => {
    if (pattern !== null) {
      const allowedMethods = routes.reduce<Set<HttpMethod> | null>((acc, route) => {
        if (route.isFallback) {
          return acc;
        }
        if (acc === null || route.method === null) {
          return null;
        }
        acc.add(route.method);
        return acc;
      }, new Set<HttpMethod>([HttpMethod.OPTIONS]));
      const methods = allowedMethods || HttpMethod.__ALL;
      if (methods.size === 1) {
        return;
      }
      const optionsRoute = routes.find((route) => route.method === HttpMethod.OPTIONS);
      if (optionsRoute) {
        const newRoute: Route = {
          ...optionsRoute,
          middleware: compose(AllowedMethodsMiddleware(methods), optionsRoute.middleware),
        };
        updatedRoutes.set(optionsRoute, newRoute);
      } else {
        result.push(
          Route.create({ pattern, exact: true, method: HttpMethod.OPTIONS }, AllowedMethodsMiddleware(methods))
        );
      }
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

function AllowedMethodsMiddleware(methods: Set<HttpMethod>): Middleware {
  return async (ctx, next): Promise<Result> => {
    const response = await next(ctx.with(RouterAllowedMethodsKey.Provider(methods)));
    if (response instanceof TumauHandlerResponse) {
      return response;
    }
    if (response === null) {
      return allowedMethodsResponse(TumauResponse.noContent(), methods);
    }
    if (response instanceof TumauResponse) {
      return allowedMethodsResponse(response, methods);
    }
    throw new HttpError.Internal(`AllowedMethods received an invalid response !`);
  };
}
