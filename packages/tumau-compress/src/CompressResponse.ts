import { TumauResponse, Body, HttpHeaders, ContentEncoding } from '@tumau/core';
import { Encoding } from './CompressContext';
import { OutgoingHttpHeaders } from 'http';
import { Readable } from 'stream';
import { StringStream } from './StringStream';
import zlib from 'zlib';

export class CompressResponse extends TumauResponse {
  public originalResponse: TumauResponse;

  constructor(originalResponse: TumauResponse, encodings: Array<Encoding>) {
    const body = CompressResponse.encodeBodyWithEncodings(originalResponse.body, encodings);
    const headers: OutgoingHttpHeaders = {
      ...originalResponse.headers,
      [HttpHeaders.ContentEncoding]: encodings,
    };

    // remove content length beacause we no longer know the size of the body
    // (unless we compress first, then send it but that would be quite bad)
    delete headers[HttpHeaders.ContentLength];

    super({
      body,
      code: originalResponse.code,
      headers,
    });
    this.originalResponse = originalResponse;
  }

  public static encodeBodyWithEncodings(body: Body, encodings: Array<Encoding>): Readable | null {
    if (body === null) {
      return null;
    }
    let bodyStream = typeof body === 'string' ? new StringStream(body) : body;

    encodings.forEach(encoding => {
      bodyStream = CompressResponse.encodeBodyWithEncoding(bodyStream, encoding);
    });

    return bodyStream;
  }

  public static encodeBodyWithEncoding(body: Readable, encoding: Encoding): Readable {
    if (encoding === ContentEncoding.Brotli) {
      return body.pipe(zlib.createBrotliCompress());
    }
    if (encoding === ContentEncoding.Gzip) {
      return body.pipe(zlib.createGzip());
    }
    if (encoding === ContentEncoding.Deflate) {
      return body.pipe(zlib.createDeflate());
    }
    return body;
  }
}
