import { TumauServer, WebsocketProvider, HandleWebsocket, compose } from 'tumau';
import WebSocket from 'ws';

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (_ws, request) => {
  // ...
  console.log('connected', request.url);
});

const server = TumauServer.create({
  handleServerUpgrade: true,
  mainMiddleware: compose(
    WebsocketProvider(wss),
    // logger
    (ctx, next) => {
      console.log(`Request !`);
      return next(ctx);
    },
    HandleWebsocket
  ),
});

server.listen(3002, () => {
  console.log(`Server is up at ws://localhost:3002`);
});
