## Gist

```js
import { createServer, Response, compose } from '@tumau/core';
import { UrlParser } from '@tumau/url-parser';

const server = createServer(
  compose(UrlParser(), (ctx) =>
    Response.create({
      body: JSON.stringify(ctx.parsedUrl),
    })
  )
);

server.listen(3002);
```
