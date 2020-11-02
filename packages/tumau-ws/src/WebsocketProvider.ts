import { createContext, Middleware } from '@tumau/core';
import { Server } from 'ws';

const WebsocketContext = createContext<Server>();
export const WebsocketConsumer = WebsocketContext.Consumer;

export function WebsocketProvider(ws: Server): Middleware {
  return async (ctx, next) => {
    return next(ctx.with(WebsocketContext.Provider(ws)));
  };
}
