require('isomorphic-fetch');
const cron = require('node-schedule');
const { Dropbox } = require('dropbox');
const sonos = require('sonos');
const bunyan = require('bunyan');
const config = require('./config');
const {
    deviceDescription,
    startPlayer,
    pausePlayer,
    getLastResponse,
    clearDropboxFolder,
} = require('./utils');

const log = bunyan.createLogger({ name: 'SonosRemote' });
const dbx = new Dropbox({ accessToken: config.get('accesstoken') });

const sonosSearch = sonos.Search();
const deviceList = [];

sonosSearch.on('DeviceAvailable', (device) => {
    deviceDescription(device)
        .then((deviceInfo) => {
            const activeRoom = config.get('room');
            log.info(`Found ${deviceInfo.roomName}`);
            if (activeRoom === 'any' || activeRoom === deviceInfo.roomName) {
                deviceList.push(device);
            }
        });
});

const schedule = cron.scheduleJob(config.get('schedule'), () => {
    dbx.filesListFolder({ path: config.get('dropboxPath') })
        .then((response) => {
            if (response.entries.length > 0) {
                const sonosActivity = getLastResponse(response);

                switch (sonosActivity) {
                case 'play':
                    deviceList.forEach((device) => {
                        startPlayer(device)
                            .then((info) => {
                                log.debug('Playing');
                                log.debug(info);
                            })
                            .catch((err) => {
                                log.error('Play failed');
                                log.error(err);
                            });
                    });
                    break;

                case 'pause':
                    deviceList.forEach((device) => {
                        pausePlayer(device)
                            .then((info) => {
                                log.info('Paused');
                                log.info(info);
                            })
                            .catch((err) => {
                                log.error('Pause failed');
                                log.error(err);
                            });
                    });
                    break;

                default:
                }
                clearDropboxFolder(dbx, config.get('dropboxPath'), response, log);
            } else {
                log.debug('No files in folder');
            }
        })
        .catch((error) => {
            log.warn(error);
            schedule.cancel();
        });
});

process.on('SIGINT', () => {
    log.info('Gracefully shutting down from SIGINT (Ctrl-C)');

    sonosSearch.destroy((searchResponse) => {
        log.info('Stopped searching for Sonos device');
        log.info(searchResponse);
    });
    schedule.cancel();
    process.exit();
});

process.on('SIGTERM', () => {
    log.info('Gracefully shutting down from SIGTERM');

    sonosSearch.destroy((searchResponse) => {
        log.info('Stopped searching for Sonos device');
        log.info(searchResponse);
    });
    schedule.cancel();
    process.exit();
});
