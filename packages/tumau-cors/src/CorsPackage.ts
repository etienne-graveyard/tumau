import { CorsActual } from './CorsActual';
import { CorsPreflight } from './CorsPreflight';
import { Middleware, ErrorHandlerPackage, compose } from '@tumau/core';
import { CorsPreflightConfig } from './utils';

export function CorsPackage(options?: CorsPreflightConfig): Middleware {
  // add HandleErrors under Cors so errors still get Cors headers
  return compose(
    // handle preflight
    CorsPreflight(options),
    // handle GET
    CorsActual(options),
    // Handle errors to add CORS even in case of error
    ErrorHandlerPackage
  );
}
