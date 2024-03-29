import { Middleware, HttpHeader, TumauResponse, HttpError, TumauHandlerResponse } from '../core';
import { CompressKey } from './CompressContext';
import { CompressResponse } from './CompressResponse';
import { ContentEncoding } from './ContentEnconding';

export const Compress: Middleware = async (ctx, next) => {
  const isUpgrade = ctx.isUpgrade;
  const acceptedEncodingHeader = ctx.headers[HttpHeader.AcceptEncoding];
  const acceptedEncoding: Array<ContentEncoding> =
    typeof acceptedEncodingHeader === 'string'
      ? (acceptedEncodingHeader.split(/, ?/) as any)
      : Array.isArray(acceptedEncodingHeader)
      ? acceptedEncodingHeader
      : [ContentEncoding.Identity];

  const compressCtx = {
    acceptedEncoding,
    usedEncoding: null,
  };

  // we allow next middleware to change what acceptedEncoding are accepted
  const response = await next(ctx.with(CompressKey.Provider(compressCtx)));
  if (isUpgrade) {
    return response;
  }
  if (response === null) {
    // no response = do nothing
    return response;
  }
  if (response instanceof TumauHandlerResponse) {
    return response;
  }
  if (response instanceof TumauResponse === false) {
    throw new HttpError.Internal(`Compress received an invalid response !`);
  }
  const res = response as TumauResponse;

  const usedEncoding: Array<ContentEncoding> = (() => {
    if (compressCtx.acceptedEncoding.indexOf(ContentEncoding.Brotli) >= 0) {
      return [ContentEncoding.Brotli];
    }
    if (compressCtx.acceptedEncoding.indexOf(ContentEncoding.Gzip) >= 0) {
      return [ContentEncoding.Gzip];
    }
    if (compressCtx.acceptedEncoding.indexOf(ContentEncoding.Deflate) >= 0) {
      return [ContentEncoding.Deflate];
    }
    return [ContentEncoding.Identity];
  })();
  const compressResponse = CompressResponse.fromResponse(res, usedEncoding);
  return compressResponse;
};
