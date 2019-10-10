import { OutgoingHttpHeaders } from 'http';
import { HttpStatusCode } from './HttpStatus';
import { HttpError } from './HttpError';
import { HttpHeaders, ContentType, ContentTypeCharset } from './HttpHeaders';
import { Readable } from 'stream';

export type Body = Readable | string | null;

interface CreateResponseOptions {
  code?: HttpStatusCode;
  body?: Body;
  headers?: OutgoingHttpHeaders;
}

export class Response {
  public code: HttpStatusCode;
  public body: Body;
  public headers: OutgoingHttpHeaders;

  public constructor(options: CreateResponseOptions = {}) {
    const { code = 200, headers = {}, body = null } = options;
    this.code = code;
    this.body = body;
    this.headers = headers;
  }

  public static withText(text: string) {
    return new Response({
      body: text,
      headers: {
        [HttpHeaders.ContentLength]: text.length,
        [HttpHeaders.ContentType]: [ContentType.Text, ContentTypeCharset.Utf8].join('; '),
      },
    });
  }

  public static withHtml(html: string) {
    return new Response({
      body: html,
      headers: {
        [HttpHeaders.ContentLength]: html.length,
        [HttpHeaders.ContentType]: [ContentType.Html, ContentTypeCharset.Utf8].join('; '),
      },
    });
  }

  public static redirect(to: string, permanent: boolean = false) {
    return new Response({
      code: permanent ? 301 : 302,
      headers: {
        [HttpHeaders.Location]: to,
      },
    });
  }

  public static withStream(stream: Readable, size: number) {
    return new Response({
      body: stream,
      headers: {
        [HttpHeaders.ContentLength]: size,
      },
    });
  }

  public static isResponse(maybe: any): maybe is Response {
    return maybe && maybe instanceof Response;
  }

  public static fromError(err: any): Response {
    if (err instanceof HttpError) {
      return new Response({
        code: err.code,
        body: err.message,
      });
    }
    if (err instanceof Error) {
      return Response.fromError(new HttpError.Internal(err.message));
    }
    return Response.fromError(new HttpError.Internal(String(err)));
  }

  public static extends(originalResponse: Response, overrides: CreateResponseOptions = {}): ExtendedResponse {
    return new ExtendedResponse(originalResponse, overrides);
  }
}

export class ExtendedResponse extends Response {
  constructor(public originalResponse: Response, overrides: CreateResponseOptions = {}) {
    super({
      body: overrides.body || originalResponse.body,
      code: overrides.code || originalResponse.code,
      headers: {
        ...originalResponse.headers,
        ...(overrides.headers || {}),
      },
    });
  }
}
