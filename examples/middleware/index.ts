import { Middleware, Context } from '@tumau/middleware';

const ACtx = Context.create<string>('A');

const mid = Middleware.compose<string>(
  next => {
    console.log('middleware 1');
    console.log((next as any).debug());
    return next.set(ACtx.Provider('a1')).run();
  },
  next => {
    console.log('middleware 2');
    console.log((next as any).debug());
    return next.set(ACtx.Provider('a2')).run();
  },
  next => {
    console.log('middleware 3');
    console.log((next as any).debug());
    return next.set(ACtx.Provider('a3')).run();
  }
);

const mid2 = Middleware.compose(mid, async next => {
  console.log('done');
  console.log((next as any).debug());
  return next.run();
});

Middleware.run(mid2, () => {
  console.log('done 2');
  return 'nope2';
}).then(res => {
  console.log({ res });
});
