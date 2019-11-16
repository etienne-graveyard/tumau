import { Config } from './CorsMiddleware';
import { Cors } from './Cors';
import { Middleware, HandleErrors } from '@tumau/core';

export const CorsPackage = {
  create: (options: Config) =>
    Middleware.compose(
      HandleErrors,
      Cors.create(options)
    ),
  setCors: Cors.setCors,
};
