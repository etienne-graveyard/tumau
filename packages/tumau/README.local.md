<p align="center">

![tumau logo](https://github.com/etienne-dldc/tumau/blob/master/design/logo.svg)

</p>

# 🏺 Tumau

> A node HTTP framework written in Typescript

Tumau is a small NodeJS server (just like [Express](https://expressjs.com/) or [Koa](https://koajs.com/)) with almost no external dependencies and written in TypeScript.

## Gist

[[@tumau-example/basic/index.ts]]

## Benefits over Express/Koa/Other

- Written in Typescript (strong yet easy-to-use types)
- Almost no external dependency (easy to audit)
- Simple to extends (using middleware)
- Modular, cou can take only what you need.

## Install

```bash
# npm
npm install tumau

# yarn
yarn add tumau
```

## Packages

The `tumau` package is a proxi for different packages:

- [`@tumau/core`](https://github.com/etienne-dldc/tumau/tree/master/packages/tumau-core)
- [`@tumau/url-parser`](https://github.com/etienne-dldc/tumau/tree/master/packages/tumau-url-parser) for parsing url (pathname, query...)
- [`@tumau/router`](https://github.com/etienne-dldc/tumau/tree/master/packages/tumau-router) for routing (it uses `@tumau/url-parser` for url parsing)
- [`@tumau/json`](https://github.com/etienne-dldc/tumau/tree/master/packages/tumau-json) for parsing / sending JSON
- [`@tumau/compress`](https://github.com/etienne-dldc/tumau/tree/master/packages/tumau-compress) for Brotli / GZip / Deflate compression
- [`@tumau/cookie`](https://github.com/etienne-dldc/tumau/tree/master/packages/tumau-cookie) for readong and setting cookies

## Dependencies

`@tumau/router` has [`chemin`](https://github.com/etienne-dldc/chemin) as a dependency and `chemin` itself has zero dependencies.
`@tumau/ws` depend on [`ws`](https://github.com/websockets/ws).

## Overview

Like many other server, Tumau is based on middleware. A middleware is like a layer the request has to go though. At some point a response is created by one of the middleware and the response has to travel back to the outside (go through every layer in the opposite order) to be sent.

<p align="center">

![middleware](https://github.com/etienne-dldc/tumau/blob/master/design/illu-1.png)

</p>

A middleware can stop the chain and return a response. In that case the next middleware will not be called !

<p align="center">

![next](https://github.com/etienne-dldc/tumau/blob/master/design/illu-2.png)

</p>

## Tools

In tumau the tools is what you get in middleware to interact wth the other middlewares.

The tools let you do two things:

- Read / Write a context (Take a look a [this example](https://github.com/etienne-dldc/tumau/blob/master/examples/context/index.ts))
- Call the next middleware

### For TypeScript users

Contexts are typed when you create them:

[[@tumau-example/context/create.ts]]

## Middleware

A middleare is a function that:

- receives the tools
- can return a response or null (or a promise of one of them)

```ts
type Middleware = (tools: Tools) => null | Response | Promise<null | Response>;
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

### `tools.next`

The `tools.next` function is always async (it return a Promise).
It take np parameter and return a Promise of a Response or null

```ts
type Next = () => Promise<Response | null>;
```

### Some examples

```js
// Return a response, ignore next middleware
const middleware = () => Response.withText('Hello');

// Return a response if the next middleware did not
const middleware = async (tools) => {
  const response = await tools.next();
  if (response === null) {
    return Response.withText('Not found');
  }
  return response;
};

// Add a item to the context before calling the next middleware
// return whatever the next middleware return
const middleware = (tools) => {
  const nextTools = tools.with(ReceivedAtContext.Provide(new Date()));
  return nextTools.next();
};
```

### Conbining multiple Middlewares

The `Server.create` function take only one middleware as parameter. To use multiple middleware you need to combine them with `Middleware.compose`:

```js
import { TumauServer, Middleware } from 'tumau';

const composed = Middleware.compose(logger, cors, main);

const server = TumauServer.create(composed);
```

**Note**: Middlewares are executed in the order they are passed to `compose`. In the example above: `logger`, then `cors`, then `main` (then the reverse order on the way up).

## More Examples

Take a look a the [Examples](https://github.com/etienne-dldc/tumau/tree/master/examples) folder !

## Performance

> Is it fast ?

I'm no expert in benchmarks but from [my attempt to measure it](https://github.com/etienne-dldc/tumau/tree/master/benchmarks) it's a bit faster than Koa and Express but not as fast as [fastify](https://github.com/fastify/fastify).

You can run the benchmark yourself by running `yarn benchmark` in the root folder of the monorepo. Fell free to add more framework or more complex cases !

## What does "Tumau" means

[According to Google Traduction](https://translate.google.com/?source=osdd#view=home&op=translate&sl=en&tl=mi&text=server) it is the translation of "server" in Maori but I'm not sure which definition it apply to. Anyway I thought it would make a cool name and it was not used on NPM so...
