'use strict';

const tumau = require('@tumau/core');
const json = require('@tumau/json');

const app = tumau.createServer(
  tumau.compose(json.JsonPackage(), () => {
    return json.JsonResponse.withJson({ hello: 'world (tumau-json)' });
  })
);

app.listen(process.env.PORT);
