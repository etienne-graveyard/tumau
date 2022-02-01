import { createKey } from 'miid';
import { TumauRequest } from './TumauRequest';
import { ServerResponse } from 'http';
import { Duplex } from 'stream';

// We force a default value because this context is alway present !
export const RequestKey = createKey<TumauRequest>({
  name: 'Request',
  defaultValue: null as any,
});
export const RequestConsumer = RequestKey.Consumer;

// Response might not exist in the case of an `upgrade` event (WebSocket)
export const ServerResponseKey = createKey<ServerResponse>({
  name: `Response`,
});
export const ServerResponseConsumer = ServerResponseKey.Consumer;

export const UpgradeSocketKey = createKey<Duplex>({
  name: 'UpgradeSocket',
});
export const UpgradeSocketConsumer = UpgradeSocketKey.Consumer;

export const UpgradeHeadKey = createKey<Buffer>({
  name: 'UpgradeHead',
});
export const UpgradeHeadConsumer = UpgradeHeadKey.Consumer;

export const DebugKey = createKey<boolean>({
  name: 'Debug',
  defaultValue: false,
});
export const DebugConsumer = DebugKey.Consumer;
