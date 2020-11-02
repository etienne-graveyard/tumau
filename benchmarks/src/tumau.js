'use strict';

const tumau = require('@tumau/core');

const app = tumau.createServer(() => {
  return new tumau.TumauResponse({
    body: JSON.stringify({ hello: 'world (tumau)' }),
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });
});

app.listen(process.env.PORT);
