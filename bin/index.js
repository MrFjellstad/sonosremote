const cron = require('node-schedule');
const Dropbox = require('dropbox');
const sonos = require('sonos');
const bunyan = require('bunyan');
const config = require('./config');

const log = bunyan.createLogger({ name: 'SonosRemote' });
const dbx = new Dropbox({ accessToken: config.get('accesstoken') });

function deviceDescription(device) {
    return new Promise((resolve, reject) => {
        device.deviceDescription((err, info) => {
            if (err) {
                reject(err);
            } else {
                resolve(info);
            }
        });
    });
}

function startPlaying(device) {
    return new Promise((resolve, reject) => {
        device.play((err, info) => {
            if (err) {
                reject(err);
            } else {
                resolve(info);
            }
        });
    });
}

function clearDropboxFolder(response) {
    response.entries.forEach((element) => {
        log.info(element.name);
        const fileFullPath = {
            path: `${config.get('dropboxPath')}/${element.name}`,
        };
        dbx.filesDelete(fileFullPath);
    });
}

const sonosSearch = sonos.search();
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

// TODO: Check for play or pause as the filenames so that the player will start or pause correctly.
const schedule = cron.scheduleJob(config.get('schedule'), () => {
    dbx.filesListFolder({ path: config.get('dropboxPath') })
        .then((response) => {
            if (response.entries.length > 0) {
                deviceList.forEach((device) => {
                    startPlaying(device)
                        .then((info) => {
                            log.info(info);
                        })
                        .catch((err) => {
                            log.error(err);
                        });
                });

                clearDropboxFolder(response);
            } else {
                log.info('No files in folder');
            }
        })
        .catch((error) => {
            log.warn(error.error);
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
