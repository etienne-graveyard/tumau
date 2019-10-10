<p align="center">
  <img src="https://github.com/etienne-dldc/tumau/blob/master/design/logo.svg" width="597" alt="tumau logo">
</p>

# 🏺 Tumau

> A Zero dependency node HTTP server written in Typescript

Tumau is a small NodeJS server (just like [Express](https://expressjs.com/) or [Koa](https://koajs.com/)) with zero external dependencies and written in TypeScript.

## Gist

```ts
import { Server, Response } from '@tumau/core';

const server = Server.create(ctx => {
  return Response.withText(`Hello World ! (from ${ctx.request.url})`);
});

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
```

## Benefits over Express/Koa/Other

- Written in Typescript (strong yet easy-to-use types)
- Zero-dependency (easy to audit)
- Simple to extends (using middleware)
- Minimal (contains only the bare minimum)

## Install

```bash
$ npm install @tumau/core
```

## What about routing, json & other ?

Take a look at:

- [`@tumau/url-parser`](https://github.com/etienne-dldc/tumau/tree/master/packages/tumau-url-parser) for parsing url (pathname, query...)
- [`@tumau/router`](https://github.com/etienne-dldc/tumau/tree/master/packages/tumau-router) for routing (it uses `@tumau/url-parser` for url parsing)
- [`@tumau/json`](https://github.com/etienne-dldc/tumau/tree/master/packages/tumau-json) for parsing / sending JSON

## Overview

Like many other server, Tumau is based on middleware. A middleware is like a layer the request has to go though. At some point a response is created by one of the middleware and the response has to travel back to the outside (go through every layer in the opposite order) to be sent.

<p align="center">
  <img src="https://github.com/etienne-dldc/tumau/blob/master/design/illu-1.png" width="597">
</p>

A middleware can stop the chain and return a response. In that case the next middleware will not be called !

<p align="center">
  <img src="https://github.com/etienne-dldc/tumau/blob/master/design/illu-2.png" width="597">
</p>

## The context (ctx)

In tumau the context a an object passed between middleware to share data between them.

**Note**: You should **NOT** mutate the context but rather create a copy where changes can be performed. This changed copy is passed to the next middleware.

### For TypeScript users

The type of the context is defined for the entire app (all the middleware). This make the typings simpler because the type system does not care about the order in which middleware are called. But it also mean that some part of the context might not be there yet !

## Middleware

A middleare is a function that:

- receives a context from the previous middleware
- receives a `next` function that will execute the next middleware
- can return a response

<p align="center">
  <img src="https://github.com/etienne-dldc/tumau/blob/master/design/illu-3.png" width="597">
</p>

```js
const myMiddleware = async (ctx, next) => {
  // 1. Context from previous middleware
  console.log(ctx);
  // 2. We call `next` to call the next middleware
  const response = await next(ctx);
  // 3. The next middleware return a result ({ response, ctx })
  console.log(response);
  // 4. We return something, in that case we return the result from the next middleware
  return response;
};
```

### `next`

The `next` function is always async (it return a Promise).
It take one parameter: the `Context` and return a Promise of an object with two keys:

- `ctx`: the context returned by the middleware
- `response`: the response returned by the middleware or null

### Return type of a middleware

A middleware can return

- `null`,
- A valid `Response`
- A object with `ctx` and `response` where `response` can be `null`
- A Promise of any of the three above

### Some examples

```js
// Return a response, ignore next middleware
const middleware = () => Response.withText('Hello');

// Return a response if the next middleware did not
const middleware = async (ctx, next) => {
  const { response } = await next(ctx);
  if (response === null) {
    return Response.withText('Not found');
  }
  return response;
};

// Add a key to the context before calling the next middleware
// return whatever the next middleware return
const middleware = (ctx, next) => {
  const nextCtx = {
    ...ctx,
    receivedAt: new Date(),
  };
  return next(nextCtx);
};

// Add something to the context on the way up
const middleware = async (ctx, next) => {
  const result = await next(ctx);
  const nextCtx = {
    ...result.ctx,
    responseSendAt: new Date(),
  };
  return { response: result.response, ctx: nextCtx };
};
```

### Conbining multiple Middlewares

The `Server.create` function take only one middleware as parameter. To use multiple middleware you need to combine them with `Middleware.compose`:

```js
import { Middleware } from '@tumau/core';

const composed = Middleware.compose(
  logger,
  cors,
  main
);

const server = Server.create(composed);
```

**Note**: Middlewares are executed in the order they are passed to `compose`. In the example above: `logger`, then `cors`, then `main` (then the reverse order on the way up).

## TypeScript Example

```ts
import { Server, BaseContext, Response, Middleware } from '@tumau/core';
import { UrlParserCtx, UrlParser } from '@tumau/url-parser';

// Define the type of the Context of your app, you can add your own properties
interface Ctx extends UrlParserCtx {}

const main: Middleware<Ctx> = ctx => {
  return Response.create({
    body: JSON.stringify(ctx.parsedUrl),
  });
};

const server = Server.create<Ctx>(
  Middleware.compose(
    UrlParser(),
    main
  )
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002/foo?bar=hey `);
});
```

## Performance

> Is it fast ?

I'm no expert in benchmarks but from [my attempt to measure it](https://github.com/etienne-dldc/tumau/tree/master/benchmarks) it's a bit faster than Koa and Express but not as fast as [fastify](https://github.com/fastify/fastify).

You can run the benchmark yourself by running `yarn benchmark` in the root folder of the monorepo. Fell free to add more framework or more complex cases !

## What does "Tumau" means

[According to Google Traduction](https://translate.google.com/?source=osdd#view=home&op=translate&sl=en&tl=mi&text=server) it is the translation of "server" in Maori but I'm not sure which definition it apply to. Anyway I thought it would make a cool name and it was not used on NPM so...
