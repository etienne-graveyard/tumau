import { KeyProvider, Stack, StackInternal } from 'miid';

/**
 * Base class used to chech is we have a valid response (instanceof TumauBaseResponse)
 */
export class TumauBaseResponse extends Stack {
  protected constructor(internal: StackInternal<TumauBaseResponse> | null = null) {
    super(internal);
  }

  public with(...keys: Array<KeyProvider<any>>): TumauBaseResponse {
    // Use the static `applyKeys` method to apply keys to the current instance
    return Stack.applyKeys<TumauBaseResponse>(this, keys, (internal) => new TumauBaseResponse(internal));
  }
}
