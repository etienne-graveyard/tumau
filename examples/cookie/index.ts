import { Server, TumauResponse, CookieResponse, Cookie } from 'tumau';

console.log(Cookie);

const server = Server.create(() => {
  return new CookieResponse(TumauResponse.noContent(), [Cookie.create('token', 'T55YTRR55554')]);
});

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
