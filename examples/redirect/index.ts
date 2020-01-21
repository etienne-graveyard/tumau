import { TumauServer, TumauResponse, Middleware, Route, Routes, RouterPackage } from 'tumau';

const ROUTES: Routes = [
  Route.GET('/', () => {
    return TumauResponse.redirect('/hello');
  }),
  Route.GET('/hello', () => {
    return TumauResponse.withText('Hello');
  }),
];

const server = TumauServer.create(Middleware.compose(RouterPackage(ROUTES)));

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
