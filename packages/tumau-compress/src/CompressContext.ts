import { createContext } from '@tumau/core';
import { ContentEncoding } from './ContentEnconding';

export const CompressContext = createContext<{
  acceptedEncoding: Array<ContentEncoding>;
  usedEncoding: null | Array<ContentEncoding>;
}>({
  name: 'Compress',
});

export const CompressConsumer = CompressContext.Consumer;
