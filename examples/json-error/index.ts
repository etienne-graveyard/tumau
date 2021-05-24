import { createServer, HttpError, compose, JsonParser, HttpErrorToJsonResponse } from 'tumau';

const server = createServer(
  compose(JsonParser(), HttpErrorToJsonResponse, () => {
    throw new HttpError.NotFound();
  })
);

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
