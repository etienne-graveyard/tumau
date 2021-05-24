import {
  createServer,
  WebsocketProvider,
  HandleWebsocket,
  Route,
  TumauResponse,
  RouterPackage,
  compose,
  HttpErrorToTextResponse,
  ErrorToHttpError,
} from 'tumau';
import WebSocket from 'ws';

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (_ws, request) => {
  // ...
  console.log('connected', request.url);
});

const server = createServer({
  handleServerUpgrade: true,
  mainMiddleware: compose(
    HttpErrorToTextResponse,
    ErrorToHttpError,
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
