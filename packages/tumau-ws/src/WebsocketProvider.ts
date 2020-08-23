import { Context, Middleware } from '@tumau/core';
import { Server } from 'ws';

const WebsocketContext = Context.create<Server>();
export const WebsocketConsumer = WebsocketContext.Consumer;

export function WebsocketProvider(ws: Server): Middleware {
  return async (ctx, next) => {
    return next(ctx.with(WebsocketContext.Provider(ws)));
  };
}
