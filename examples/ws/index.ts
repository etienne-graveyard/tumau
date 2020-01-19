import { Server, WebsocketProvider, Middleware, HandleWebsocket } from 'tumau';
import WebSocket from 'ws';

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (_ws, request) => {
  // ...
  console.log('connected', request.url);
});

const server = Server.create({
  handleServerUpgrade: true,
  mainMiddleware: Middleware.compose(
    WebsocketProvider(wss),
    // logger
    tools => {
      console.log(`Request !`);
      return tools.next();
    },
    HandleWebsocket
  ),
});

server.listen(3002, () => {
  console.log(`Server is up at ws://localhost:3002`);
});
