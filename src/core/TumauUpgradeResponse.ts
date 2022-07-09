import { IncomingMessage } from 'http';
import { createKey, KeyProvider, Stack } from 'miid';
import { Duplex } from 'stream';
import { TumauBaseResponse } from './TumauBaseResponse';

export type UpgradeHandler = (req: IncomingMessage, socket: Duplex, head: Buffer) => Promise<void>;

const UpgradeHandlerKey = createKey<UpgradeHandler>({ name: 'UpgradeHandler' });

export class TumauUpgradeResponse extends TumauBaseResponse {
  static UpgradeHandlerKey = UpgradeHandlerKey;

  static create(handler: UpgradeHandler): TumauUpgradeResponse {
    return new TumauUpgradeResponse().with(UpgradeHandlerKey.Provider(handler));
  }

  static fromError(err: unknown): TumauUpgradeResponse {
    return TumauUpgradeResponse.create(async (_req, socket) => {
      console.error(err);
      socket.destroy();
    });
  }

  with(...keys: Array<KeyProvider<any>>): TumauUpgradeResponse {
    // Use the static `applyKeys` method to apply keys to the current instance
    return Stack.applyKeys<TumauUpgradeResponse>(this, keys, (internal) => new TumauUpgradeResponse(internal));
  }

  get handler(): UpgradeHandler {
    return this.getOrFail(UpgradeHandlerKey.Consumer);
  }
}
