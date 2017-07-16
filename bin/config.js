var convict = require('convict');

// Define a schema
var config = convict({
    env: {
        doc: 'The applicaton environment.',
        format: [
            'production', 'development', 'test'
        ],
        default: 'development',
        env: 'NODE_ENV'
    },
    accesstoken: {
        doc: 'Dropbox accestoken.',
        format: 'String',
        default: 'SECRET',
        env: 'ACCESSTOKEN'
    },
    dropboxPath: {
        doc: 'The folder the app will access to look for the file from IFTTT.',
        format: 'String',
        default: '/IFTTT/SonosControl',
        env: 'DROPBOX_PATH'
        },
    schedule: {
        doc: 'Crontab timeformat',
        format: 'String',
        default: '/3 * * * * *'
    }
});

// Load environment dependent configuration
var env = config.get('env');
config.loadFile('./config/' + env + '.json');

// Perform validation
config.validate({allowed: 'strict'});

module.exports = config;
