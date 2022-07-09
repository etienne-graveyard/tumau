import { TumauBaseResponse } from './TumauBaseResponse';
import { IncomingMessage, ServerResponse } from 'http';
import { createKey, KeyProvider, Stack, StackInternal } from 'miid';

export type RequestHander = (req: IncomingMessage, res: ServerResponse) => Promise<void> | void;

const RequestHanderKey = createKey<RequestHander>({ name: 'RequestHander' });

export class TumauHandlerResponse extends TumauBaseResponse {
  static RequestHanderKey = RequestHanderKey;

  static create(handler: RequestHander): TumauHandlerResponse {
    return new TumauHandlerResponse().with(RequestHanderKey.Provider(handler));
  }

  protected constructor(internal: StackInternal<TumauHandlerResponse> | null = null) {
    super(internal);
  }

  with(...keys: Array<KeyProvider<any>>): TumauHandlerResponse {
    // Use the static `applyKeys` method to apply keys to the current instance
    return Stack.applyKeys<TumauHandlerResponse>(this, keys, (internal) => new TumauHandlerResponse(internal));
  }

  get handler(): RequestHander {
    return this.getOrFail(RequestHanderKey.Consumer);
  }
}
