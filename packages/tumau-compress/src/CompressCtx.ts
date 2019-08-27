import { BaseContext, ContentEncoding } from '@tumau/core';

type EncodingType = typeof ContentEncoding;

export type Encoding = (EncodingType)[keyof (EncodingType)];

export interface CompressCtx extends BaseContext {
  compress: null | {
    acceptedEncoding: Array<Encoding>;
    usedEncoding: null | Array<Encoding>;
  };
}
