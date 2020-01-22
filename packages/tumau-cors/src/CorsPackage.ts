import { Config, Cors } from './Cors';
import { Middleware, HandleErrors } from '@tumau/core';

export function CorsPackage(options?: Config) {
  // add HandleErrors under Cors so errors still get Cors headers
  return Middleware.compose(Cors(options), HandleErrors);
}
