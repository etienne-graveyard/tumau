import { IncomingMessage } from 'http';
import { readStream } from './readStream';
import { HttpHeaders, ContentEncoding } from '@tumau/core';
import { Encoding } from '@tumau/compress';
import { Readable } from 'stream';
import zlib from 'zlib';

export const BodyResponse = {
  asText,
  isEmpty,
  fromGzip,
  fromBrotli,
  fromDeflate,
  fromJson,
};

async function fromGzip(res: IncomingMessage): Promise<string> {
  return readStream(decodeBodyWithEncoding(res, ContentEncoding.Gzip));
}

async function fromBrotli(res: IncomingMessage): Promise<string> {
  return readStream(decodeBodyWithEncoding(res, ContentEncoding.Brotli));
}

async function fromDeflate(res: IncomingMessage): Promise<string> {
  return readStream(decodeBodyWithEncoding(res, ContentEncoding.Deflate));
}

async function fromJson(res: IncomingMessage): Promise<object> {
  return JSON.parse(await asText(res));
}

async function asText(res: IncomingMessage): Promise<string> {
  const _1mb = 1024 * 1024 * 1024;
  const limit = _1mb;

  const length = (() => {
    const lengthStr = res.headers[HttpHeaders.ContentLength];
    if (lengthStr === undefined || Array.isArray(lengthStr)) {
      return null;
    }
    const length = parseInt(lengthStr, 10);
    if (Number.isNaN(length)) {
      return null;
    }
    return length;
  })();

  if (length === 0) {
    return Promise.resolve('');
  }

  const encodingHeader = res.headers[HttpHeaders.ContentEncoding];
  const encoding: Array<Encoding> =
    typeof encodingHeader === 'string'
      ? (encodingHeader.split(/, ?/) as any)
      : Array.isArray(encodingHeader)
      ? encodingHeader
      : [ContentEncoding.Identity];

  const decoded = decodeBodyWithEncodings(res, encoding);
  const str = await readStream(decoded, limit);
  if (length !== null && str.length !== length) {
    throw new Error('Content length did not match header');
  }
  return str;
}

function decodeBodyWithEncodings(body: Readable, encodings: Array<Encoding>): Readable {
  return encodings.reduce<Readable>((body, encoding) => {
    return decodeBodyWithEncoding(body, encoding);
  }, body);
}

function decodeBodyWithEncoding(body: Readable, encoding: Encoding): Readable {
  if (encoding === ContentEncoding.Brotli) {
    return body.pipe(zlib.createBrotliDecompress());
  }
  if (encoding === ContentEncoding.Gzip) {
    return body.pipe(zlib.createGunzip());
  }
  if (encoding === ContentEncoding.Deflate) {
    return body.pipe(zlib.createInflate());
  }
  return body;
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
