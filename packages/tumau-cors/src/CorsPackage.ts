import { CorsActual } from './CorsActual';
import { CorsPreflight } from './CorsPreflight';
import { Middleware, ErrorHandlerPackage } from '@tumau/core';
import { CorsPreflightConfig } from './utils';

export function CorsPackage(options?: CorsPreflightConfig): Middleware {
  // add HandleErrors under Cors so errors still get Cors headers
  return Middleware.compose(
    // handle preflight
    CorsPreflight(options),
    // handle GET
    CorsActual(options),
    // Handle errors to add CORS even in case of error
    ErrorHandlerPackage
  );
}
