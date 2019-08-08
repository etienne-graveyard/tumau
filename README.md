<p align="center">
  <img src="https://github.com/etienne-dldc/tumau/blob/master/design/logo.svg" width="597" alt="tumau logo">
</p>

# 🏺 Tumau

> A Zero dependency node HTTP server written in Typescript

Tumau is a small NodeJS server (just like [Express](https://expressjs.com/) or [Koa](https://koajs.com/)) with zero external dependencies and fully written in TypeScript.

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

- Written in Typescript (strong yet easy to use types)
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

Like many other server, Tumau is based on middleware. A middleware is like a layer the request has to go though. At some point a response is created by one of the middleware and the response has to travel back to the outside (go through every layer in the opposite order) to be send.

<p align="center">
  <img src="https://github.com/etienne-dldc/tumau/blob/master/design/illu-1.png" width="597">
</p>

A middleware can stop the chain and return a response. In that case the middleware under it will not be called !

<p align="center">
  <img src="https://github.com/etienne-dldc/tumau/blob/master/design/illu-2.png" width="597">
</p>

## The context (ctx)

In tumau the context a an object passed between middleware to share data between them. The context is also part of the response.

**Note**: It is recomended not to mutate the context but instead to create a copy before changing something and then pass this new object to the next middleware.

### For TypeScript users

The type of the context is defined for all the middleware. This make the typings simpler because the type system does not care about the order in which middleware are called. But it also mean that some part of the context might not be there yet !

## Middleware

A middleare is a function:
