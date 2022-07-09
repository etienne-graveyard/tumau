import { HttpStatusCode } from './HttpStatus';
import { HttpError } from './HttpError';
import { HttpHeaders, HttpHeader } from './HttpHeaders';
import { Readable } from 'stream';
import { TumauBaseResponse } from './TumauBaseResponse';
import { ContentType, ContentTypeCharset } from '../content-type';
import { createKey, KeyProvider, Stack, StackInternal } from 'miid';

export type Body = Readable | string | null;

const BodyKey = createKey<Body>({ name: 'Body' });
const StatusKey = createKey<HttpStatusCode>({ name: 'Status' });
const HeadersKey = createKey<HttpHeaders>({ name: 'Headers' });

export interface CreateOptions {
  code?: HttpStatusCode;
  body?: Body;
  headers?: HttpHeaders;
}

export class TumauRequestResponse extends TumauBaseResponse {
  static BodyKey = BodyKey;
  static StatusKey = StatusKey;
  static HeadersKey = HeadersKey;

  static create(options: CreateOptions = {}): TumauRequestResponse {
    const { code = 200, headers = [], body = null } = options;
    return new TumauRequestResponse().with(
      StatusKey.Provider(code),
      HeadersKey.Provider(headers),
      BodyKey.Provider(body)
    );
  }

  static withText(text: string): TumauRequestResponse {
    return TumauRequestResponse.create({
      body: text,
      headers: [
        [HttpHeader.ContentLength, text.length.toFixed()],
        [HttpHeader.ContentType, ContentType.format('text/plain', { charset: ContentTypeCharset.Utf8 })],
      ],
    });
  }

  static withHtml(html: string): TumauRequestResponse {
    return TumauRequestResponse.create({
      body: html,
      headers: [
        [HttpHeader.ContentLength, html.length.toFixed()],
        [HttpHeader.ContentType, ContentType.format('text/html', { charset: ContentTypeCharset.Utf8 })],
      ],
    });
  }

  static noContent(): TumauRequestResponse {
    return TumauRequestResponse.create({
      code: 204,
    });
  }

  static redirect(to: string, permanent: boolean = false): TumauRequestResponse {
    return TumauRequestResponse.create({
      code: permanent ? 301 : 302,
      headers: [[HttpHeader.Location, to]],
    });
  }

  static withStream(stream: Readable, size: number): TumauRequestResponse {
    return TumauRequestResponse.create({
      body: stream,
      headers: [[HttpHeader.ContentLength, size.toFixed()]],
    });
  }

  static fromError(err: unknown, debug: boolean): TumauRequestResponse {
    if (err instanceof HttpError) {
      const stack = err instanceof HttpError.Internal ? err.internalStack || err.stack : err.stack;
      return TumauRequestResponse.create({
        code: err.code,
        body: errorToString(err, stack, debug),
      });
    }
    if (err instanceof Error) {
      return TumauRequestResponse.fromError(new HttpError.Internal(err.message), debug);
    }
    return TumauRequestResponse.fromError(new HttpError.Internal(String(err)), debug);
  }

  static isTumauRequestResponse(maybe: unknown): maybe is TumauRequestResponse {
    if (!maybe) {
      return false;
    }
    return maybe instanceof TumauRequestResponse;
  }

  protected constructor(internal: StackInternal<TumauRequestResponse> | null = null) {
    super(internal);
  }

  with(...keys: Array<KeyProvider<any>>): TumauRequestResponse {
    // Use the static `applyKeys` method to apply keys to the current instance
    return Stack.applyKeys<TumauRequestResponse>(this, keys, (internal) => new TumauRequestResponse(internal));
  }

  get headers() {
    return this.getOrFail(HeadersKey.Consumer);
  }

  get status() {
    return this.getOrFail(StatusKey.Consumer);
  }

  get body() {
    return this.getOrFail(BodyKey.Consumer);
  }

  addHeaders(...headers: HttpHeaders): TumauRequestResponse {
    return this.with(HeadersKey.Provider([...this.headers, ...headers]));
  }

  updateHeaders(updater: (prev: HttpHeaders) => HttpHeaders): TumauRequestResponse {
    return this.with(HeadersKey.Provider(updater(this.headers)));
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
