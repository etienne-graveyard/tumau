'use strict';

const fastify = require('fastify')();

fastify.get('/', (req, reply) => {
  reply.send({ hello: 'world (fastify)' });
});

fastify.listen(process.env.PORT);
