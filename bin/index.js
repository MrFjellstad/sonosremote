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

function startPlayer(device) {
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

function pausePlayer(device) {
    return new Promise((resolve, reject) => {
        device.pause((err, info) => {
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
        log.debug(`Removing ${element.name}`);
        const fileFullPath = {
            path: `${config.get('dropboxPath')}/${element.name}`,
        };
        dbx.filesDelete(fileFullPath);
    });
}

function getLastResponse(response) {
    const lastElement = response.entries[response.entries.length - 1].name;
    const lastElementCommandArray = lastElement.split('.');
    const lastElementCommand = lastElementCommandArray[0];
    const validCommands = ['play', 'pause'];

    if (validCommands.indexOf(lastElementCommand) > -1) {
        return lastElementCommand;
    }
    return 'ignore';
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
                clearDropboxFolder(response);
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
