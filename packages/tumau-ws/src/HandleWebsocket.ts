import { Middleware, RequestConsumer, HttpError, TumauUpgradeResponse } from '@tumau/core';
import { WebsocketConsumer } from './WebsocketProvider';

export const HandleWebsocket: Middleware = async (ctx, next) => {
  const request = ctx.get(RequestConsumer);
  if (request.isUpgrade) {
    const wss = ctx.get(WebsocketConsumer);
    if (!wss) {
      throw new HttpError.Internal(`Missing WebsocketProvider`);
    }
    return new TumauUpgradeResponse(async (req, socket, head) => {
      return new Promise((res) => {
        wss.handleUpgrade(req, socket as any, head, (ws) => {
          wss.emit('connection', ws, request);
          res();
        });
      });
    });
  }
  return next(ctx);
};
