'use strict';

const Hapi = require('@hapi/hapi');
const Joi = require('joi');
const Jwt = require('@hapi/jwt');

const init = async () => {

    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    await server.register(Jwt);

    server.route({
        method: 'POST',
        path: '/',
        handler: function (request, h) {
            const { body } = request.payload;

            return `Welcome ${body}!`;
        }
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return 'Hello World!';
        }
    });

    server.route({
        method: 'GET',
        path: '/{id}',
        handler: function (request, h) {

            const name = request.params.id;

            return 'Hello ' + name
        }
    });

    server.auth.strategy('my_jwt_strategy', 'jwt', {
        keys: 'some_shared_secret',
        verify: {
            aud: 'urn:audience:test',
            iss: 'urn:issuer:test',
            sub: false,
            nbf: true,
            exp: true,
            maxAgeSec: 14400, // 4 hours
            timeSkewSec: 15
        },
        validate: (artifacts, request, h) => {
            return {
                isValid: true,
                credentials: { user: artifacts.decoded.payload.user }
            };
        }
    });

    server.route({
        method: '*',
        path: '/{any*}',
        handler: function (request, h) {

            return '404 Error! Page Not Found!';
        }
    });

    // Set the strategy
    server.auth.default('my_jwt_strategy');

    server.route({
        method: 'GET',
        path: '/user/{name}',
        handler: function (request, h) {
            const response = h.response('success');

            response.type('text/plain');
            response.header('X-Custom', 'some-value');

            return response;
        },
        options: {
            validate: {
                params: Joi.object({
                    name: Joi.string().min(3).max(10)
                })
            }
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
