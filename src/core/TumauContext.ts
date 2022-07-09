import { createKey, KeyProvider, Stack, StackInternal } from 'miid';
import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http';
import { HttpRequestHeader } from './HttpHeaders';
import { HttpMethod } from './HttpMethod';
import { notNill } from './utils';
import { Duplex } from 'stream';

// export const UpgradeSocketKey = createKey<Duplex>({ name: 'UpgradeSocket' });
// export const UpgradeSocketConsumer = UpgradeSocketKey.Consumer;

// export const UpgradeHeadKey = createKey<Buffer>({ name: 'UpgradeHead' });
// export const UpgradeHeadConsumer = UpgradeHeadKey.Consumer;

export interface TumauContextInfos {
  readonly req: IncomingMessage;
  readonly method: HttpMethod;
  readonly url: string;
  readonly headers: IncomingHttpHeaders;
  readonly origin: string | null;
  readonly isUpgrade: boolean;
}

const ContextInfosKey = createKey<TumauContextInfos>({ name: 'ContextInfos' });
const ServerResponseKey = createKey<ServerResponse>({ name: `Response` });
const DebugKey = createKey<boolean>({ name: 'Debug' });
const SocketKey = createKey<Duplex>({ name: 'Socket' });
const SocketHeadKey = createKey<Buffer>({ name: 'SocketHead' });

export interface TumauContextOptions {
  // does it come from server.on('upgrade', ...);
  isUpgrade?: boolean;
  // Response might not exist in the case of an `upgrade` event (WebSocket)
  res?: ServerResponse;
  // Debug mode
  debug?: boolean;
  // socket
  socket?: Duplex;
  // socket head
  head?: Buffer;
}

export class TumauContext extends Stack {
  static create(req: IncomingMessage, options: TumauContextOptions = {}): TumauContext {
    const { isUpgrade = false, res, debug = false, socket, head } = options;
    const url = notNill(req.url); // never null because IncomingMessage come from http.Server
    const method = notNill(req.method) as HttpMethod;
    const origin: string | null = (req.headers[HttpRequestHeader.Origin] as string | undefined) || null;

    let ctx = new TumauContext().with(
      ContextInfosKey.Provider({
        isUpgrade: isUpgrade,
        req: req,
        url: url,
        method: method,
        headers: req.headers,
        origin: origin,
      }),
      DebugKey.Provider(debug)
    );
    if (res) {
      ctx = ctx.with(ServerResponseKey.Provider(res));
    }
    if (socket) {
      ctx = ctx.with(SocketKey.Provider(socket));
    }
    if (head) {
      ctx = ctx.with(SocketHeadKey.Provider(head));
    }
    return ctx;
  }

  protected constructor(internal: StackInternal<TumauContext> | null = null) {
    super(internal);
  }

  public with(...keys: Array<KeyProvider<any>>): TumauContext {
    // Use the static `applyKeys` method to apply keys to the current instance
    return Stack.applyKeys<TumauContext>(this, keys, (internal) => new TumauContext(internal));
  }

  public get isUpgrade(): boolean {
    return this.getOrFail(ContextInfosKey.Consumer).isUpgrade;
  }

  public get req(): IncomingMessage {
    return this.getOrFail(ContextInfosKey.Consumer).req;
  }

  public get method(): HttpMethod {
    return this.getOrFail(ContextInfosKey.Consumer).method;
  }

  public get url(): string {
    return this.getOrFail(ContextInfosKey.Consumer).url;
  }

  public get headers(): IncomingHttpHeaders {
    return this.getOrFail(ContextInfosKey.Consumer).headers;
  }

  public get origin(): string | null {
    return this.getOrFail(ContextInfosKey.Consumer).origin;
  }

  public get res(): ServerResponse | null {
    return this.get(ServerResponseKey.Consumer);
  }

  public get debugMode(): boolean {
    return this.getOrFail(DebugKey.Consumer);
  }
}
