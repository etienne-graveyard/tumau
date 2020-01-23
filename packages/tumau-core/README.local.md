## API

[[@tumau-example/docs/src/api/core.ts]]

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
