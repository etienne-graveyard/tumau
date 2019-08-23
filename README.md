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

The `next` function is always async (it return a Promise) and return an object with two keys:

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

I'm no expert in benchmarking but from [my attempt to measure it](https://github.com/etienne-dldc/tumau/benchmarks) it's a bit faster than Koa and Express but not as fast as [fastify](https://github.com/fastify/fastify).

You can run the benchmark yourself by running `yarn benchmark` in the root folder of the monorepo. Fell free to add more framework or more complex cases !

## API

### Server

#### Server.create(opts)

- `opts`: the main middleware or an object

If `opts` is an object it accepts the following properties:

- `mainMiddleware`: (`required`) the main middleware of your app
- `createInitialCtx`: (`optional`) a function used to initialize the Context object. This function will receive the base Context as parameter
- `httpServer`: (`optional`) a instance of `http.Server`. If ommited, a server will be created (`http.createServer()`)

**return**: A `Server` object with the following properties:

- `httpServer`: The `http.Server` used by Tumau (either passed as option or created by Tumau)
- `listen(port, listener)`: A function that start the server on a given port
  - `port` (`number required`) the port to listen on
  - `listener`: (`function optional`) a function executed once the server is up

### Middleware

#### Signature

`async (ctx, next) => Result`

A middleware is a function that can be `async`, it receive the following arguments

- `ctx`: The context of the app (see `Context`)
- `next`: A function that return a Promise of the resolved result of the next middleware (`{ ctx, response }`).

**returns**: `null` or a `Response` or an object `{ ctx, response }` or a Promise of on of these.

If the returned value is a object `ctx` is required while `response` can be either `null` or a `Response`

#### Middleware.compose(...middlewares)

> Compose a list of middleware together

- `...middlewares` middlewares to compose together

**returns**: a middleware that will run the given middlewares on fater the order.

**Note**: if a middleware does not call `next` then it will stop the chain the the following middleware will not be called.

#### Middleware.resolveResult(result)

> Convert the returned value of a middleware into an object { ctx, response }

- `result` any returned value of a middleware (`null` or a `Response` or an object `{ ctx, response }`)

**returns**: an object `{ ctx, response }` where response can be null.

**Note**: You probably don't need to use this function as it is already called by `Middleware.compose` on the result of the `next()` call.

### Context

> The base context passed to the `mainMiddleware`

The context is an object with the following properties:

- `request`: A request object with
  - `req`: The request received from the NodeJS server (`IncomingMessage`)
  - `method`: The method of the request (`GET`, `POST`, `PUT`...)
  - `url`: The url of the request (`/user/paul?foo=bar`)
  - `headers`: The headers received (`IncomingHttpHeaders`)
- `res`: The response as provided by NodeJS (`http.ServerResponse`). You probably don't need to use this as Tumau will send the response.

**Note**: Your context will likely have more properties added by middlewares. You can also add your own properties either in a middleware or by using the `createInitialCtx` option on `Server.create`.

### Response

A valid Response must inherit from the `Response` class.

The `Response` has has 3 main properties used to send the response:

- `code`: The HTTP code of the response
- `body`: (`string or null`) the body of the response
- `headers`: headers to send with the response (type: `OutgoingHttpHeaders`)

#### new Response(options)

- `options` must be an object with the following properties
  - `code`: (`optional`): the HTTP code of the response (default `200`)
  - `body`: (`optional`, `string or null`) the body of the response (default `null`)
  - `headers`: (`optional`) headers to send with the response (default `{}`)

**returns** a `Response` instance

#### Response.withText(text)

> Create a 200 response

- `text`: (`string`, `required`) the text of the response

**returns** a `Response` instance

#### Response.fromError(err)

> Create a response from an error

- `err`: (`any`) the error to handle. If `err` is an instance of `HttpError` it will create a Response with the correct HTTP code and message otherwise it create an `500` Response.

**returns** a `Response` instance

#### Response.isResponse(maybe)

> Test if something is a valid Response

- `maybe`: (`any`) the value to test

**returns** a `true` is `maybe` inherit `Response`, `false` otherwise

### HttpError

> A class extending `Error` that represent an HTTP error

#### new HttpError(code, message)

- `code`: the HTTP code of the error (must be 4xx or 5xx)
- `message`: (`optional`) the message of the error, if not provided Tumau will use the default message corresponding to the code

#### new HttpError.LengthRequired()

#### new HttpError.NotAcceptable(message)

#### new HttpError.PayloadTooLarge()

#### new HttpError.BadRequest(message)

#### new HttpError.NotFound()

#### new HttpError.ServerDidNotRespond()

#### new HttpError.Internal(message)

### HttpMethod

```ts
enum HttpMethod {
  GET = 'GET',
  HEAD = 'HEAD',
  PATCH = 'PATCH',
  OPTIONS = 'OPTIONS',
  DELETE = 'DELETE',
  POST = 'POST',
  PUT = 'PUT',
}
```

### HttpStatus

#### HttpStatus.getMessage(code)

#### HttpStatus.get(code)

#### HttpStatus.isEmpty(code)

#### HttpStatus.isError(code)

## What does "Tumau" means

[According to Google Traduction](https://translate.google.com/?source=osdd#view=home&op=translate&sl=en&tl=mi&text=server) it is the translation of "server" in Maori but I'm not sure which definition it apply to. Anyway I thought it would make a cool name and it was not used on NPM so...
