import { Server, TumauResponse, Middleware, Router, Route, Routes } from 'tumau';

const ROUTES: Routes = [
  Route.GET('/', () => {
    return TumauResponse.redirect('/hello');
  }),
  Route.GET('/hello', () => {
    return TumauResponse.withText('Hello');
  }),
];

const server = Server.create(Middleware.compose(Router(ROUTES)));

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
