import { Context } from '@tumau/core';
import { ContentEncoding } from './ContentEnconding';

export const CompressContext = Context.create<{
  acceptedEncoding: Array<ContentEncoding>;
  usedEncoding: null | Array<ContentEncoding>;
}>();

export const CompressConsumer = CompressContext.Consumer;
