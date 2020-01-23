## Gist

```js
import { TumauServer, Response, Middleware } from '@tumau/core';
import { UrlParser } from '@tumau/url-parser';

const server = TumauServer.create(
  Middleware.compose(UrlParser(), ctx =>
    Response.create({
      body: JSON.stringify(ctx.parsedUrl),
    })
  )
);

server.listen(3002);
```
