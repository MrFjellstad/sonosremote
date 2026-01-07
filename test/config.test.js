/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
const tap = require('tap');
const config = require('../bin/config');

tap.test('config module', (t) => {
    t.test('should load configuration', (t) => {
        t.ok(config, 'config object exists');
        t.end();
    });

    t.test('should have env property', (t) => {
        const env = config.get('env');
        t.ok(env, 'env is set');
        t.match(env, /^(production|development|test)$/, 'env is valid');
        t.end();
    });

    t.test('should have accesstoken', (t) => {
        const token = config.get('accesstoken');
        t.ok(token, 'accesstoken is defined');
        t.type(token, 'string', 'accesstoken is a string');
        t.end();
    });

    t.test('should have dropboxPath', (t) => {
        const path = config.get('dropboxPath');
        t.ok(path, 'dropboxPath is defined');
        t.type(path, 'string', 'dropboxPath is a string');
        t.match(path, /^\//, 'dropboxPath starts with /');
        t.end();
    });

    t.test('should have schedule', (t) => {
        const schedule = config.get('schedule');
        t.ok(schedule, 'schedule is defined');
        t.type(schedule, 'string', 'schedule is a string');
        t.end();
    });

    t.test('should have room', (t) => {
        const room = config.get('room');
        t.ok(room, 'room is defined');
        t.type(room, 'string', 'room is a string');
        t.end();
    });

    t.end();
});
