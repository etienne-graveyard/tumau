import { OutgoingHttpHeaders } from 'http';
import { HttpStatusCode } from './HttpStatus';
import { HttpError } from './HttpError';
import { HttpHeaders } from './HttpHeaders';
import { Readable } from 'stream';
import { TumauBaseResponse } from './TumauBaseResponse';
import { ContentType, ContentTypeCharset, ContentTypeUtils } from '@tumau/content-type';

export type Body = Readable | string | null;

export interface ResponseConstuctorOptions {
  code?: HttpStatusCode;
  body?: Body;
  headers?: OutgoingHttpHeaders;
  originalResponse?: TumauResponse | null;
}

/**
 * Note: the correct name for this class is TumauRequestResponse
 * This is named TumauResponse because the vast majority of apps only handle the 'request' event
 */
export class TumauResponse extends TumauBaseResponse {
  public readonly code: HttpStatusCode;
  public readonly body: Body;
  public readonly headers: OutgoingHttpHeaders;
  public readonly originalResponse: TumauResponse | null;

  public constructor(options: ResponseConstuctorOptions = {}) {
    super();
    const { code = 200, headers = {}, body = null, originalResponse = null } = options;
    this.code = code;
    this.body = body;
    this.headers = headers;
    this.originalResponse = originalResponse;
  }

  public extends(overrides: ResponseConstuctorOptions = {}): ResponseConstuctorOptions {
    return {
      body: overrides.body || this.body,
      code: overrides.code || this.code,
      originalResponse: this,
      headers: {
        ...this.headers,
        ...(overrides.headers || {}),
      },
    };
  }

  public static withText(text: string) {
    return new TumauResponse({
      body: text,
      headers: {
        [HttpHeaders.ContentLength]: text.length,
        [HttpHeaders.ContentType]: ContentTypeUtils.format({
          type: ContentType.Text,
          parameters: {
            charset: ContentTypeCharset.Utf8,
          },
        }),
      },
    });
  }

  public static withHtml(html: string) {
    return new TumauResponse({
      body: html,
      headers: {
        [HttpHeaders.ContentLength]: html.length,
        [HttpHeaders.ContentType]: [ContentType.Html, ContentTypeCharset.Utf8].join('; '),
      },
    });
  }

  public static noContent() {
    return new TumauResponse({
      code: 204,
    });
  }

  public static redirect(to: string, permanent: boolean = false) {
    return new TumauResponse({
      code: permanent ? 301 : 302,
      headers: {
        [HttpHeaders.Location]: to,
      },
    });
  }

  public static withStream(stream: Readable, size: number) {
    return new TumauResponse({
      body: stream,
      headers: {
        [HttpHeaders.ContentLength]: size,
      },
    });
  }

  public static isTumauResponse(maybe: any): maybe is TumauResponse {
    return maybe && maybe instanceof TumauResponse;
  }

  public static fromError(err: any, debug: boolean): TumauResponse {
    if (err instanceof HttpError) {
      const stack = err instanceof HttpError.Internal ? err.internalStack || err.stack : err.stack;
      return new TumauResponse({
        code: err.code,
        body: errorToString(err, stack, debug),
      });
    }
    if (err instanceof Error) {
      return TumauResponse.fromError(new HttpError.Internal(err.message), debug);
    }
    return TumauResponse.fromError(new HttpError.Internal(String(err)), debug);
  }
}

function errorToString(err: HttpError, stack: string | undefined, debug: boolean): string {
  if (debug === false) {
    return `Error ${err.code}: ${err.message}`;
  }
  let stackContent = '';
  if (stack) {
    stackContent = `\n\n` + stack;
  }

  return `Error ${err.code}: ${err.message}` + stackContent;
}
