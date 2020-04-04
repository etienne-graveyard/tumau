import { TumauResponse, Body, HttpHeaders, HttpStatus } from '@tumau/core';
import { OutgoingHttpHeaders } from 'http';
import { Readable } from 'stream';
import { StringStream } from './StringStream';
import zlib from 'zlib';
import { ContentEncoding } from './ContentEnconding';

export class CompressResponse extends TumauResponse {
  public originalResponse: TumauResponse;

  constructor(originalResponse: TumauResponse, encodings: Array<ContentEncoding>) {
    const body = CompressResponse.encodeBodyWithEncodings(originalResponse.body, encodings);
    const headers: OutgoingHttpHeaders = {
      ...originalResponse.headers,
      [HttpHeaders.ContentEncoding]: encodings,
    };

    // remove content length because we no longer know the size of the body
    // (unless we compress first, then send it but that would be quite bad)
    delete headers[HttpHeaders.ContentLength];

    super({
      body,
      code: originalResponse.code,
      headers,
    });
    this.originalResponse = originalResponse;
  }

  public static encodeBodyWithEncodings(body: Body, encodings: Array<ContentEncoding>): Readable | null {
    if (body === null) {
      return null;
    }
    let bodyStream = typeof body === 'string' ? new StringStream(body) : body;

    encodings.forEach(encoding => {
      bodyStream = CompressResponse.encodeBodyWithEncoding(bodyStream, encoding);
    });

    return bodyStream;
  }

  public static encodeBodyWithEncoding(body: Readable, encoding: ContentEncoding): Readable {
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

  public static fromResponse(
    originalResponse: TumauResponse,
    encodings: Array<ContentEncoding>
  ): TumauResponse | CompressResponse {
    if (originalResponse.body === null || HttpStatus.isEmpty(originalResponse.code)) {
      return originalResponse;
    }
    return new CompressResponse(originalResponse, encodings);
  }
}
