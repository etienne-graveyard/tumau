import { TumauServer, WebsocketProvider, HandleWebsocket, Route, TumauResponse, RouterPackage, compose } from 'tumau';
import WebSocket from 'ws';

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (_ws, request) => {
  // ...
  console.log('connected', request.url);
});

const server = TumauServer.create({
  handleErrors: true,
  handleServerUpgrade: true,
  mainMiddleware: compose(
    WebsocketProvider(wss),
    RouterPackage([
      Route.namespace('user', [
        Route.GET(null, () => TumauResponse.withText('OK')),
        Route.all(
          'ws',
          compose(HandleWebsocket, () => TumauResponse.withText('Not WS ?'))
        ),
      ]),
    ])
  ),
});

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
