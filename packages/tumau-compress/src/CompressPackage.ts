import { Middleware, ErrorHandlerPackage } from '@tumau/core';
import { Compress } from './Compress';

export const CompressPackage: Middleware = Middleware.compose(
  Compress,
  // handle errors downstream
  ErrorHandlerPackage
);
