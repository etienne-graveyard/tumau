import { Server } from '@tumau/core';

const server = Server.create(ctx => {
  return ctx.response.create({
    json: {
      path: ctx.request.path,
      pathname: ctx.request.pathname,
      rawQuery: ctx.request.rawQuery,
      query: ctx.request.query,
      href: ctx.request.href,
      method: ctx.request.method,
      search: ctx.request.search,
      url: ctx.request.url,
    },
  });
});

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002/foo?bar=hey `);
});
