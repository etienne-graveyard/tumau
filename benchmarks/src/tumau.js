'use strict';

const tumau = require('@tumau/core');

const app = tumau.Server.create(() => {
  return new tumau.Response({
    body: JSON.stringify({ hello: 'world (tumau)' }),
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });
});

app.listen(process.env.PORT);
