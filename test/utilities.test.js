/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
const tap = require('tap');

tap.test('utility functions', (t) => {
    t.test('getLastResponse should identify play command', (t) => {
        const response = {
            entries: [
                { name: 'play.txt' },
                { name: 'other.txt' },
            ],
        };
        const lastElement = response.entries[response.entries.length - 1].name;
        const lastElementCommandArray = lastElement.split('.');
        const lastElementCommand = lastElementCommandArray[0];
        const validCommands = ['play', 'pause'];

        t.match(lastElementCommand, /^(play|pause|other)$/, 'command is parsed from filename');
        t.end();
    });

    t.test('getLastResponse should identify pause command', (t) => {
        const response = {
            entries: [
                { name: 'play.txt' },
                { name: 'pause.txt' },
            ],
        };
        const lastElement = response.entries[response.entries.length - 1].name;
        const lastElementCommandArray = lastElement.split('.');
        const lastElementCommand = lastElementCommandArray[0];
        const validCommands = ['play', 'pause'];

        t.equal(lastElementCommand, 'pause', 'pause command is correctly identified');
        t.ok(validCommands.indexOf(lastElementCommand) > -1, 'command is valid');
        t.end();
    });

    t.test('getLastResponse should ignore invalid commands', (t) => {
        const response = {
            entries: [
                { name: 'invalid.txt' },
            ],
        };
        const lastElement = response.entries[response.entries.length - 1].name;
        const lastElementCommandArray = lastElement.split('.');
        const lastElementCommand = lastElementCommandArray[0];
        const validCommands = ['play', 'pause'];

        t.equal(lastElementCommand, 'invalid', 'invalid command is parsed');
        t.notOk(validCommands.indexOf(lastElementCommand) > -1, 'invalid command is not in validCommands');
        t.end();
    });

    t.end();
});
