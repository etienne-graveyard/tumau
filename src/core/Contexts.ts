import { createContext } from 'miid';
import { TumauRequest } from './TumauRequest';
import { ServerResponse } from 'http';
import { Duplex } from 'stream';

// We force a deault value because this context is alway present !
export const RequestContext = createContext<TumauRequest>({
  name: 'Request',
  defaultValue: null as any,
});
export const RequestConsumer = RequestContext.Consumer;

// Response might not exist in the case of an `upgrade` event (WebSocket)
export const ServerResponseContext = createContext<ServerResponse>({
  name: `Response`,
});
export const ServerResponseConsumer = ServerResponseContext.Consumer;

export const UpgradeSocketContext = createContext<Duplex>({
  name: 'UpgradeSocket',
});
export const UpgradeSocketConsumer = UpgradeSocketContext.Consumer;

export const UpgradeHeadContext = createContext<Buffer>({
  name: 'UpgradeHead',
});
export const UpgradeHeadConsumer = UpgradeHeadContext.Consumer;

export const DebugContext = createContext<boolean>({
  name: 'Debug',
  defaultValue: false,
});
export const DebugConsumer = DebugContext.Consumer;
