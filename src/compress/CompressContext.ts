import { createKey } from '../core';
import { ContentEncoding } from './ContentEnconding';

export const CompressKey = createKey<{
  acceptedEncoding: Array<ContentEncoding>;
  usedEncoding: null | Array<ContentEncoding>;
}>({
  name: 'Compress',
});

export const CompressConsumer = CompressKey.Consumer;
