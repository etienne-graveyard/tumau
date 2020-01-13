import { ContentEncoding, Context } from '@tumau/core';

type EncodingType = typeof ContentEncoding;

export type Encoding = EncodingType[keyof EncodingType];

export const CompressContext = Context.create<{
  acceptedEncoding: Array<Encoding>;
  usedEncoding: null | Array<Encoding>;
}>();

export const CompressConsumer = CompressContext.Consumer;
