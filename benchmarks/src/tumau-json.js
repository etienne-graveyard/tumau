'use strict';

const tumau = require('@tumau/core');
const json = require('@tumau/json');

const app = tumau.Server.create(
  tumau.Middleware.compose(
    json.JsonPackage(),
    () => {
      return json.JsonResponse.with({ hello: 'world (tumau-json)' });
    }
  )
);

app.listen(process.env.PORT);
