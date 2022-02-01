<!-- This file has been generated, to change it edit docs/content/index.dy -->
<p align="center">

![tumau logo](https://github.com/etienne-dldc/tumau/blob/master/design/logo.svg)

</p>

# 🏺 Tumau

> A node HTTP framework written in Typescript

Tumau is NodeJS server framework (just like [Express](https://expressjs.com/) or [Koa](https://koajs.com/)) with almost no external dependencies and written in TypeScript.

## Gist

```ts
import { createServer, TumauResponse, RequestConsumer } from 'tumau';

const server = createServer((ctx) => {
  const request = ctx.get(RequestConsumer);
  return TumauResponse.withText(`Hello World ! (from ${request.url})`);
});

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
```

## Benefits over Express/Koa/Other

- Written in Typescript (strong yet easy-to-use types)
- Almost no external dependency (easy to audit)
- Simple to extends (using middleware)
- Modular, you can take only what you need.

## Install

```bash
# npm
npm install tumau

# yarn
yarn add tumau
```

## Dependencies

-[`chemin`](https://github.com/etienne-dldc/chemin) for the router path matching (`chemin` itself has zero dependencies). -[`miid`](https://github.com/etienne-dldc/miid) for the middleware system (`miid` itself has zero dependencies).

## Overview

Like many other server, Tumau is based on middleware. A middleware is like a layer the request has to go though. At some point a response is created by one of the middleware and the response has to travel back to the outside (go through every layer in the opposite order) to be sent.

<p align="center">

![middleware](https://github.com/etienne-dldc/tumau/blob/master/design/illu-1.png)

</p>

A middleware can stop the chain and return a response. In that case the next middleware will not be called !

<p align="center">

![next](https://github.com/etienne-dldc/tumau/blob/master/design/illu-2.png)

</p>

### For TypeScript users

Contexts are typed when you create them:

```ts
import { createKey } from 'tumau';
// here we could omit <number> because it would be infered
const NumKey = createKey<number>(0);
// you can omit the default value
const NameKey = createKey<string>();
```

## Middleware

A middleare is a function that:

- receives the context and the `next` function
- can return a response or null (or a promise of one of them)

```ts
type Middleware = (ctx, next) => null | Response | Promise<null | Response>;
```

Example:

```js
const myMiddleware = async (ctx, next) => {
  // 1. We receive a ctx object
  console.log(ctx); // { get, getOrFail, has, with }
  // 2. We call `next` to call the next middleware
  const response = await next(ctx);
  // 3. The next middleware return a response
  console.log(response);
  // 4. We return that response
  return response;
};
```

### The `next` function

The `next` function is always async (it return a Promise).
It take a context as parameter and return a Promise of a Response or null

```ts
type Next = () => Promise<Response | null>;
```

### Some examples

```js
// Return a response, ignore next middleware
const middleware = () => Response.withText('Hello');

// Return a response if the next middleware did not
const middleware = async (ctx, next) => {
  const response = await next();
  if (response === null) {
    return Response.withText('Not found');
  }
  return response;
};

// Add a item to the context before calling the next middleware
// return whatever the next middleware return
const middleware = (ctx) => {
  const nextCtx = ctx.with(ReceivedAtContext.Provide(new Date()));
  return next(nextCtx);
};
```

### Conbining multiple Middlewares

The `createServer` function take only one middleware as parameter. To use multiple middleware you need to combine them with `compose` :

```js
import { createServer, compose } from 'tumau';

const composed = compose(logger, cors, main);

const server = createServer(composed);
```

**Note**: Middlewares are executed in the order they are passed to `compose`. In the example above: `logger`, then `cors`, then `main` (then the reverse order on the way up).

## Performance

> Is it fast ?

I'm no expert in benchmarks but from my attempt to measure it, it's a bit faster than Koa and Express but not as fast as [fastify](https://github.com/fastify/fastify).

## What does "Tumau" means

[According to Google Traduction](https://translate.google.com/?source=osdd#view=home&op=translate&sl=en&tl=mi&text=server) it is the translation of "server" in Maori but I'm not sure which definition it apply to. Anyway I thought it would make a cool name and it was not used on NPM so...
