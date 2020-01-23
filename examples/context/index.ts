import { Context, TumauServer, Middleware } from 'tumau';

// Num context with a default value of 7
const NumContext = Context.create<number>(7);

// MaybeNum with no default value
const MaybeNumContext = Context.create<number>();

// middleware
const myContextProvider: Middleware = tools => {
  // we provide our context
  const numProvider = NumContext.Provider(42);
  const maybeNumProvider = MaybeNumContext.Provider(6);
  // we create a new tools by calling tools.withContext()
  const nextTools = tools.withContext(numProvider, maybeNumProvider);
  // we call next on our new tools to execute the next middleware
  return nextTools.next();
};

// middleware
const myContextConsumer: Middleware = tools => {
  // Num
  console.log({
    has: tools.hasContext(NumContext.Consumer),
    num: tools.readContext(NumContext.Consumer),
    // NumContext has a default value so this would never throw
    numOrThrow: tools.readContextOrFail(NumContext.Consumer),
  });

  // MaybeNum
  console.log({
    has: tools.hasContext(MaybeNumContext.Consumer),
    maybeNum: tools.readContext(MaybeNumContext.Consumer),
    // this will throw an error if the Context is not present
    numOrThrow: tools.readContextOrFail(MaybeNumContext.Consumer),
  });

  return tools.next();
};

const server = TumauServer.create(
  Middleware.compose(
    myContextConsumer, // consume but context are not there yet
    myContextProvider, // providing context
    myContextConsumer // logs { has: true, num: 42 }
  )
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
