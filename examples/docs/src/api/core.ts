/* eslint-disable @typescript-eslint/no-unused-vars */

/*
Imports:
*/

import { TumauServer, compose, ErrorHandlerPackage } from '@tumau/core';
import { createServer } from 'http';

/*
### TumauServer

The `TumauServer` namespace contains only one function `create` that take a
Middleware as argument and return an object of type `TumauServer`.
*/

// TumauServer.create(middleware: Middleware)
const serverA = TumauServer.create(() => null);

/*
The resulting `TumauServer` has the following properties
*/

// The http.Server instance
serverA.httpServer;
// proxy to http.Server.listen
serverA.listen();

/*
You can also pass an object to `TumauServer.create`
*/

const serverB = TumauServer.create({
  mainMiddleware: () => null,
});

/*
The `handleErrors` options (`true` by default) will add the 
ErrorHandlerPackage middleware before the mainMiddleware
*/

const serverC1 = TumauServer.create({
  handleErrors: true,
  mainMiddleware: () => null,
});
// same as
const serverC2 = TumauServer.create({
  handleErrors: false,
  mainMiddleware: compose(ErrorHandlerPackage, () => null),
});

/*
The `httpServer` option let you provide your own http server
*/

const myHttpServer = createServer();

const serverD = TumauServer.create({
  mainMiddleware: () => null,
  httpServer: myHttpServer,
});

/*
The `handleServerRequest` and `handleServerUpgrade` let you control which events
the server should respond to.

By default only the `request` event is handled
but you can turn `upgrade` on if you want to deal with websocket for example.
*/

const serverE = TumauServer.create({
  mainMiddleware: () => null,
  handleServerRequest: true, // true by default
  handleServerUpgrade: false, // false by default
});
