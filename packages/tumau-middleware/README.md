# @tumau/middleware

> Middleware & Context system for Tumau

## Tumau

This package is part of the [tumau](https://github.com/etienne-dldc/tumau) family. Make sure to read [the documentation of tumau](https://github.com/etienne-dldc/tumau) first !

## What is this package for

This package manage the composition of middlewares and the context. It is not made for http server specifically and can be used for something else.

## API

```ts
import {
  Middleware,
  Context,
  ContextStack,
  Tools,
  Middlewares,
  ContextProvider,
  ContextProviderFn,
  ContextConsumer,
  Done,
  Next,
  Result,
} from '@tumau/middleware';
```

## Example

```ts
import { Middleware, Context } from '@tumau/middleware';

const ACtx = Context.create<string>('A');

const mid = Middleware.compose<string>(
  tools => {
    console.log('middleware 1');
    console.log((tools as any).debug());
    return tools.withContext(ACtx.Provider('a1')).next();
  },
  tools => {
    console.log('middleware 2');
    console.log((tools as any).debug());
    return tools.withContext(ACtx.Provider('a2')).next();
  },
  tools => {
    console.log('middleware 3');
    console.log(tools.readContext(ACtx.Consumer));
    console.log((tools as any).debug());
    return tools.withContext(ACtx.Provider('a3')).next();
  }
);

const mid2 = Middleware.compose(mid, async tools => {
  console.log('done');
  console.log((tools as any).debug());
  return tools.next();
});

Middleware.run(mid2, () => {
  console.log('done 2');
  return 'nope2';
}).then(res => {
  console.log({ res });
});
```
