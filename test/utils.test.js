/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
const tap = require('tap');
const {
    deviceDescription,
    startPlayer,
    pausePlayer,
    getLastResponse,
    clearDropboxFolder,
} = require('../bin/utils');

tap.test('deviceDescription', (t) => {
    t.test('resolves with device info on success', async (st) => {
        const deviceInfo = { roomName: 'Living Room', uuid: '123' };
        const mockDevice = {
            deviceDescription: (cb) => cb(null, deviceInfo),
        };
        const result = await deviceDescription(mockDevice);
        st.same(result, deviceInfo, 'resolves with the device info object');
        st.end();
    });

    t.test('rejects with error on failure', async (st) => {
        const error = new Error('Device not found');
        const mockDevice = {
            deviceDescription: (cb) => cb(error),
        };
        await st.rejects(deviceDescription(mockDevice), error, 'rejects with the error');
        st.end();
    });

    t.test('calls device.deviceDescription exactly once', async (st) => {
        let callCount = 0;
        const mockDevice = {
            deviceDescription: (cb) => {
                callCount += 1;
                cb(null, {});
            },
        };
        await deviceDescription(mockDevice);
        st.equal(callCount, 1, 'deviceDescription called once');
        st.end();
    });

    t.test('passes device info with multiple properties', async (st) => {
        const deviceInfo = { roomName: 'Kitchen', uuid: 'abc-123', model: 'PLAY:1' };
        const mockDevice = {
            deviceDescription: (cb) => cb(null, deviceInfo),
        };
        const result = await deviceDescription(mockDevice);
        st.equal(result.roomName, 'Kitchen');
        st.equal(result.uuid, 'abc-123');
        st.equal(result.model, 'PLAY:1');
        st.end();
    });

    t.end();
});

tap.test('startPlayer', (t) => {
    t.test('resolves with info on success', async (st) => {
        const playInfo = { success: true };
        const mockDevice = {
            play: (cb) => cb(null, playInfo),
        };
        const result = await startPlayer(mockDevice);
        st.same(result, playInfo, 'resolves with play response');
        st.end();
    });

    t.test('rejects with error on failure', async (st) => {
        const error = new Error('Play failed');
        const mockDevice = {
            play: (cb) => cb(error),
        };
        await st.rejects(startPlayer(mockDevice), error, 'rejects with the error');
        st.end();
    });

    t.test('calls device.play exactly once', async (st) => {
        let callCount = 0;
        const mockDevice = {
            play: (cb) => {
                callCount += 1;
                cb(null, {});
            },
        };
        await startPlayer(mockDevice);
        st.equal(callCount, 1, 'play called once');
        st.end();
    });

    t.end();
});

tap.test('pausePlayer', (t) => {
    t.test('resolves with info on success', async (st) => {
        const pauseInfo = { paused: true };
        const mockDevice = {
            pause: (cb) => cb(null, pauseInfo),
        };
        const result = await pausePlayer(mockDevice);
        st.same(result, pauseInfo, 'resolves with pause response');
        st.end();
    });

    t.test('rejects with error on failure', async (st) => {
        const error = new Error('Pause failed');
        const mockDevice = {
            pause: (cb) => cb(error),
        };
        await st.rejects(pausePlayer(mockDevice), error, 'rejects with the error');
        st.end();
    });

    t.test('calls device.pause exactly once', async (st) => {
        let callCount = 0;
        const mockDevice = {
            pause: (cb) => {
                callCount += 1;
                cb(null, {});
            },
        };
        await pausePlayer(mockDevice);
        st.equal(callCount, 1, 'pause called once');
        st.end();
    });

    t.end();
});

tap.test('getLastResponse', (t) => {
    t.test('returns "play" when last entry is a play file', (st) => {
        const response = { entries: [{ name: 'play.txt' }] };
        st.equal(getLastResponse(response), 'play');
        st.end();
    });

    t.test('returns "pause" when last entry is a pause file', (st) => {
        const response = { entries: [{ name: 'pause.txt' }] };
        st.equal(getLastResponse(response), 'pause');
        st.end();
    });

    t.test('returns "ignore" for an unrecognized command', (st) => {
        const response = { entries: [{ name: 'stop.txt' }] };
        st.equal(getLastResponse(response), 'ignore');
        st.end();
    });

    t.test('returns "ignore" for an arbitrary filename', (st) => {
        const response = { entries: [{ name: 'random.file' }] };
        st.equal(getLastResponse(response), 'ignore');
        st.end();
    });

    t.test('uses the last entry when multiple entries are present', (st) => {
        const response = {
            entries: [
                { name: 'play.txt' },
                { name: 'pause.txt' },
            ],
        };
        st.equal(getLastResponse(response), 'pause', 'last entry wins');
        st.end();
    });

    t.test('last entry overrides earlier valid command', (st) => {
        const response = {
            entries: [
                { name: 'pause.txt' },
                { name: 'play.txt' },
            ],
        };
        st.equal(getLastResponse(response), 'play', 'last entry wins');
        st.end();
    });

    t.test('filename without extension uses full name as command', (st) => {
        const response = { entries: [{ name: 'play' }] };
        st.equal(getLastResponse(response), 'play', 'works with no extension');
        st.end();
    });

    t.test('handles filenames with multiple dots correctly', (st) => {
        const response = { entries: [{ name: 'play.2024-01-01.txt' }] };
        st.equal(getLastResponse(response), 'play', 'uses first segment before dot');
        st.end();
    });

    t.end();
});

tap.test('clearDropboxFolder', (t) => {
    t.test('calls filesDelete for each entry', (st) => {
        const deleted = [];
        const mockDbx = {
            filesDelete: (fileObj) => deleted.push(fileObj),
        };
        const response = {
            entries: [
                { name: 'play.txt' },
                { name: 'pause.txt' },
            ],
        };
        clearDropboxFolder(mockDbx, '/IFTTT/SonosControl', response);
        st.equal(deleted.length, 2, 'filesDelete called twice');
        st.same(deleted[0], { path: '/IFTTT/SonosControl/play.txt' });
        st.same(deleted[1], { path: '/IFTTT/SonosControl/pause.txt' });
        st.end();
    });

    t.test('does nothing when entries is empty', (st) => {
        const deleted = [];
        const mockDbx = {
            filesDelete: (fileObj) => deleted.push(fileObj),
        };
        clearDropboxFolder(mockDbx, '/IFTTT/SonosControl', { entries: [] });
        st.equal(deleted.length, 0, 'filesDelete not called');
        st.end();
    });

    t.test('constructs correct full path from dropboxPath and entry name', (st) => {
        const deleted = [];
        const mockDbx = {
            filesDelete: (fileObj) => deleted.push(fileObj),
        };
        clearDropboxFolder(mockDbx, '/custom/path', { entries: [{ name: 'cmd.txt' }] });
        st.equal(deleted[0].path, '/custom/path/cmd.txt', 'path is correctly constructed');
        st.end();
    });

    t.test('works without a log argument', (st) => {
        const mockDbx = { filesDelete: () => {} };
        st.doesNotThrow(
            () => clearDropboxFolder(mockDbx, '/path', { entries: [{ name: 'x.txt' }] }),
            'runs without a log object',
        );
        st.end();
    });

    t.test('logs each removal when log is provided', (st) => {
        const logged = [];
        const mockLog = { debug: (msg) => logged.push(msg) };
        const mockDbx = { filesDelete: () => {} };
        const response = { entries: [{ name: 'play.txt' }, { name: 'pause.txt' }] };
        clearDropboxFolder(mockDbx, '/p', response, mockLog);
        st.equal(logged.length, 2, 'debug called for each entry');
        st.match(logged[0], /play\.txt/, 'log includes filename');
        st.end();
    });

    t.end();
});
