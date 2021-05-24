/* eslint-disable @typescript-eslint/no-unused-vars */

/*
Imports:
*/

import { createServer, compose } from '@tumau/core';
import { createServer as createHttpServer } from 'http';

/*
### createServer

The `createServer` function that take a
Middleware as argument and return an object of type `TumauServer`.
*/

// createServer(middleware: Middleware)
const serverA = createServer(() => null);

/*
The resulting `TumauServer` has the following properties
*/

// The http.Server instance
serverA.httpServer;
// proxy to http.Server.listen
serverA.listen();

/*
You can also pass an object to `createServer`
*/

const serverB = createServer({
  mainMiddleware: () => null,
});

/*
The `httpServer` option let you provide your own http server
*/

const myHttpServer = createHttpServer();

const serverD = createServer({
  mainMiddleware: () => null,
  httpServer: myHttpServer,
});

/*
The `handleServerRequest` and `handleServerUpgrade` let you control which events
the server should respond to.

By default only the `request` event is handled
but you can turn `upgrade` on if you want to deal with websocket for example.
*/

const serverE = createServer({
  mainMiddleware: () => null,
  handleServerRequest: true, // true by default
  handleServerUpgrade: false, // false by default
});
