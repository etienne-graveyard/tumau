import { IncomingMessage } from 'http';
import { requestToString } from './requestToString';
import { HttpError } from '@tumau/core';

export async function parseStringBody(
  req: IncomingMessage,
  limit: number,
  expectedLength: number | null
): Promise<string> {
  const str = await requestToString(req, limit);

  // Note we allow content-length to be greater than the actual length, is thi OK ?
  if (expectedLength !== null && str && str.length > expectedLength) {
    throw new HttpError.PayloadTooLarge();
  }

  return str;
}
