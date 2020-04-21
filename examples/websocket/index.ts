import { TumauServer, TumauResponse, RequestConsumer, TumauUpgradeResponse } from 'tumau';
import WebSocket from 'ws';

const wss1 = new WebSocket.Server({ noServer: true });

wss1.on('connection', (ws) => {
  console.log('connected');
  ws.addEventListener('message', (e) => {
    console.log('Received: ', e.data);
    ws.send('pong');
  });
});

const server = TumauServer.create({
  handleServerUpgrade: true,
  mainMiddleware: (tools) => {
    const request = tools.readContext(RequestConsumer);
    console.log(request);
    console.log(request.isUpgrade, request.url);
    if (request.isUpgrade) {
      return new TumauUpgradeResponse(async (req, socket, head) => {
        wss1.handleUpgrade(req, socket as any, head, function done(ws) {
          wss1.emit('connection', ws, request);
        });
      });
    }
    return TumauResponse.withText(`Hello World ! (from ${request.url})`);
  },
});

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
