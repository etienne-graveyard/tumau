import { IncomingMessage } from 'http';
import { requestToString } from './requestToString';
import { HttpError } from '@tumau/core';

// Allowed whitespace is defined in RFC 7159
// http://www.rfc-editor.org/rfc/rfc7159.txt
const strictJSONReg = /^[\x20\x09\x0a\x0d]*(\[|\{)/;

export async function parseJsonBody(
  req: IncomingMessage,
  limit: number,
  expectedLength: number | null
): Promise<object> {
  const str = await requestToString(req, limit);

  if (!str) {
    return {};
  }

  // Note we allow content-length to be greater than the actual length, is thi OK ?
  if (expectedLength !== null && str && str.length > expectedLength) {
    throw new HttpError.PayloadTooLarge();
  }

  // strict JSON test
  if (!strictJSONReg.test(str)) {
    throw new HttpError.NotAcceptable('invalid JSON, only supports object and array');
  }
  return JSON.parse(str);
}
