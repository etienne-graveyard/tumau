# @tumau/url-parser

> Url parser for @tumau/core

## Tumau

This package is part of the [tumau](https://github.com/etienne-dldc/tumau) family. Make sure to read [the documentation of tumau](https://github.com/etienne-dldc/tumau) first !

## Gist

```js
import { Server, Response, Middleware } from '@tumau/core';
import { UrlParser } from '@tumau/url-parser';

const server = Server.create(
  Middleware.compose(UrlParser(), ctx =>
    Response.create({
      body: JSON.stringify(ctx.parsedUrl),
    })
  )
);

server.listen(3002);
```
