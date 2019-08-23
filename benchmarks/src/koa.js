'use strict';

const Koa = require('koa');

const app = new Koa();

app.use(async function(ctx) {
  ctx.body = { hello: 'world(koa)' };
});

app.listen(process.env.PORT);
