import { Middleware, ErrorHandlerPackage, compose } from '@tumau/core';
import { Compress } from './Compress';

export const CompressPackage: Middleware = compose(
  Compress,
  // handle errors downstream
  ErrorHandlerPackage
);
