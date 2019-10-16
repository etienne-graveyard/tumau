import { Middleware, HttpHeaders, ContentEncoding, ResultSync, RequestConsumer } from '@tumau/core';
import { CompressContext, Encoding } from './CompressContext';
import { CompressResponse } from './CompressResponse';

export function Compress(): Middleware {
  return async (ctx, next): Promise<ResultSync> => {
    const request = ctx.getOrThrow(RequestConsumer);
    const acceptedEncodingHeader = request.headers[HttpHeaders.AcceptEncoding];
    const acceptedEncoding: Array<Encoding> =
      typeof acceptedEncodingHeader === 'string'
        ? (acceptedEncodingHeader.split(/, ?/) as any)
        : Array.isArray(acceptedEncodingHeader)
        ? acceptedEncodingHeader
        : [ContentEncoding.Identity];

    const compressCtx = {
      acceptedEncoding,
      usedEncoding: null,
    };

    const nextCtx = ctx.set(CompressContext.Provider(compressCtx));
    // we allow next middleware to change what acceptedEncoding are accepted
    const response = await next(nextCtx);
    if (response === null) {
      // no response = do nothing
      return response;
    }

    const usedEncoding: Array<Encoding> = (() => {
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

    // const doneCtx = ctx.set(CompressContext.provide({
    //   ...compressCtx,
    //   usedEncoding,
    // }))

    // const returedCtx: Ctx = {
    //   ...endCtx,
    //   compress: {
    //     ...endCtx.compress,
    //     usedEncoding,
    //   },
    // };
    const compressResponse = new CompressResponse(response, usedEncoding);
    return compressResponse;
  };
}
