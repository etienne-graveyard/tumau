```ts
// handle preflight
CorsPreflight(options),
  // handle GET
  CorsActual(options),
  // Handle errors to add CORS even in case of an error
  HttpErrorToTextResponse,
  // or
  HttpErrorToJson,
```
