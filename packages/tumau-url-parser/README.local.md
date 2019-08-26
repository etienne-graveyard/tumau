## Gist

```js
import { Server, Response, Middleware } from '@tumau/core';
import { UrlParser } from '@tumau/url-parser';

const server = Server.create(
  Middleware.compose(
    UrlParser(),
    ctx =>
      Response.create({
        body: JSON.stringify(ctx.parsedUrl),
      })
  )
);

server.listen(3002);
```
