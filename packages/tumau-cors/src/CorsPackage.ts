import { CorsActualConfig, CorsActual } from './CorsActual';
import { CorsPreflight, CorsPreflightConfig } from './CorsPreflight';
import { Middleware, ErrorHandlerPackage } from '@tumau/core';

export function CorsPackage(options?: CorsActualConfig & CorsPreflightConfig) {
  // add HandleErrors under Cors so errors still get Cors headers
  return Middleware.compose(CorsPreflight(options), CorsActual(options), ErrorHandlerPackage);
}
