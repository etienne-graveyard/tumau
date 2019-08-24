import { IncomingMessage } from 'http';
import { readStream } from './readStream';
import { HttpHeaders, ContentEncoding } from '@tumau/core';

export const BodyResponse = {
  asText,
  isEmpty,
};

async function asText(res: IncomingMessage): Promise<string> {
  const _1mb = 1024 * 1024 * 1024;
  const limit = _1mb;

  const lengthStr = res.headers[HttpHeaders.ContentLength];
  if (lengthStr === undefined || Array.isArray(lengthStr)) {
    throw new Error('LengthRequired');
  }
  const length = parseInt(lengthStr, 10);
  if (Number.isNaN(length)) {
    throw new Error('LengthRequired');
  }
  if (length === 0) {
    return Promise.resolve('');
  }

  const encoding = res.headers[HttpHeaders.ContentEncoding] || ContentEncoding.Identity;
  if (encoding !== ContentEncoding.Identity) {
    throw new Error(`NotAcceptable: ${encoding} not supported`);
  }
  if (length > limit) {
    throw new Error('PayloadTooLarge');
  }
  const str = await readStream(res, limit);
  if (str.length !== length) {
    throw new Error('Content length did not match header');
  }
  return str;
}

async function isEmpty(res: IncomingMessage): Promise<boolean> {
  const lengthStr = res.headers[HttpHeaders.ContentLength];
  if (lengthStr !== undefined) {
    if (Array.isArray(lengthStr)) {
      throw new Error('Invalid Length');
    }
    const length = parseInt(lengthStr, 10);
    if (Number.isNaN(length)) {
      throw new Error('Invalid Length');
    }
    if (length !== 0) {
      console.log(length);
      return false;
    }
  }
  const str = await readStream(res);
  return str === '';
}
