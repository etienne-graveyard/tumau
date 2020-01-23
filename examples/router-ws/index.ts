import {
  TumauServer,
  WebsocketProvider,
  Middleware,
  HandleWebsocket,
  Route,
  TumauResponse,
  RouterPackage,
} from 'tumau';
import WebSocket from 'ws';

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (_ws, request) => {
  // ...
  console.log('connected', request.url);
});

const server = TumauServer.create({
  handleErrors: true,
  handleServerUpgrade: true,
  mainMiddleware: Middleware.compose(
    WebsocketProvider(wss),
    RouterPackage([
      Route.namespace('user', [
        Route.GET(null, () => TumauResponse.withText('OK')),
        Route.all(
          'ws',
          Middleware.compose(HandleWebsocket, () => TumauResponse.withText('Not WS ?'))
        ),
      ]),
    ])
  ),
});

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
