## Gist

```js
import { TumauServer, Response, compose } from '@tumau/core';
import { UrlParser } from '@tumau/url-parser';

const server = TumauServer.create(
  compose(UrlParser(), (ctx) =>
    Response.create({
      body: JSON.stringify(ctx.parsedUrl),
    })
  )
);

server.listen(3002);
```
