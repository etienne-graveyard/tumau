import { Server, Response, Middleware } from '@tumau/core';
import { Router, Route, Routes } from '@tumau/router';

const ROUTES: Routes = [
  Route.GET('/', () => {
    return Response.redirect('/hello');
  }),
  Route.GET('/hello', () => {
    return Response.withText('Hello');
  }),
];

const server = Server.create(Middleware.compose(Router(ROUTES)));

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
