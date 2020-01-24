import { Context } from 'Miid';
import { TumauRequest } from './TumauRequest';
import { ServerResponse } from 'http';
import { Duplex } from 'stream';

// We force a deault value because this context is alway present !
export const RequestContext = Context.create<TumauRequest>(null as any);
export const RequestConsumer = RequestContext.Consumer;

// Response might not exist in the case of an `upgrade` event (WebSocket)
export const ServerResponseContext = Context.create<ServerResponse>();
export const ServerResponseConsumer = ServerResponseContext.Consumer;

export const UpgradeSocketContext = Context.create<Duplex>();
export const UpgradeSocketConsumer = UpgradeSocketContext.Consumer;

export const UpgradeHeadContext = Context.create<Buffer>();
export const UpgradeHeadConsumer = UpgradeHeadContext.Consumer;
