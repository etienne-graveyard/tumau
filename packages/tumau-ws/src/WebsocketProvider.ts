import { Context, Middleware } from '@tumau/core';
import { Server } from 'ws';

const WebsocketContext = Context.create<Server>();
export const WebsocketConsumer = WebsocketContext.Consumer;

export function WebsocketProvider(ws: Server): Middleware {
  return async tools => {
    return tools.withContext(WebsocketContext.Provider(ws)).next();
  };
}
