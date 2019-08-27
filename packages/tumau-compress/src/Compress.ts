import { Middleware, ResultSync, HttpHeaders, ContentEncoding } from '@tumau/core';
import { CompressCtx, Encoding } from './CompressCtx';
import { toArray } from './utils';
import { CompressResponse } from './CompressResponse';

export function Compress<Ctx extends CompressCtx>(): Middleware<Ctx> {
  return async (ctx, next): Promise<ResultSync<Ctx>> => {
    const acceptedEncoding = toArray(ctx.request.headers[HttpHeaders.AcceptEncoding] || ContentEncoding.Identity);
    const nextCtx: Ctx = {
      ...ctx,
      compress: {
        acceptedEncoding,
        usedEncoding: null,
      },
    };
    // we allow next middleware to change what acceptedEncoding are accepted
    const { response, ctx: endCtx } = await next(nextCtx);
    if (response === null) {
      // no response = do nothing
      return { response, ctx: endCtx };
    }
    const endAccepted = endCtx.compress ? endCtx.compress.acceptedEncoding : acceptedEncoding;
    const usedEncoding: Array<Encoding> = (() => {
      if (endAccepted.indexOf(ContentEncoding.Brotli) >= 0) {
        return [ContentEncoding.Brotli];
      }
      if (endAccepted.indexOf(ContentEncoding.Gzip) >= 0) {
        return [ContentEncoding.Gzip];
      }
      if (endAccepted.indexOf(ContentEncoding.Deflate) >= 0) {
        return [ContentEncoding.Deflate];
      }
      return [ContentEncoding.Identity];
    })();
    const returedCtx: Ctx = {
      ...endCtx,
      compress: {
        ...endCtx.compress,
        usedEncoding,
      },
    };
    const compressResponse = new CompressResponse(response, usedEncoding);
    return { response: compressResponse, ctx: returedCtx };
  };
}
