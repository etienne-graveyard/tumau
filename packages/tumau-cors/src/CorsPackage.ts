import { Config } from './CorsMiddleware';
import { Cors } from './Cors';
import { Middleware, HandleErrors } from '@tumau/core';

export const CorsPackage = {
  create: (options?: Config) =>
    Middleware.compose(
      Cors.create(options),
      HandleErrors
    ),
  setCors: Cors.setCors,
};
