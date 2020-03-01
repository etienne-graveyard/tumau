'use strict';

const tumau = require('@tumau/core');
const json = require('@tumau/json');
const router = require('@tumau/router');

const app = tumau.TumauServer.create(
  tumau.Middleware.compose(
    json.JsonPackage(),
    router.RouterPackage([
      router.Route.GET('/', () => {
        return json.JsonResponse.withJson({ hello: 'world (tumau-json)' });
      }),
    ])
  )
);

app.listen(process.env.PORT);
