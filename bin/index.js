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

const sonosSearch = sonos.search();

sonosSearch.on('DeviceAvailable', (device, model) => {
    log.info('DeviceListener');
    log.info(device);
    log.info(model);
});

const schedule = cron.scheduleJob(config.get('schedule'), () => {
    dbx.filesListFolder({ path: config.get('dropboxPath') })
        .then((response) => {
            if (response.entries.length > 0) {
                const search = sonos.search((device, model) => {
                    log.info(model);
                    log.info(device);

                    if (config.get('room') === 'any') {
                        search.destroy(() => {
                            log.info('Stopped searching for Sonos device');
                        });
                        startPlaying(device)
                            .then((info) => {
                                log.info(info);
                            })
                            .catch((err) => {
                                log.error(err);
                            });
                    } else {
                        deviceDescription(device)
                            .then((info) => {
                                if (info.roomName === config.get('room')) {
                                    search.destroy((searchResponse) => {
                                        log.info('Stopped searching for Sonos device');
                                        log.info(searchResponse);
                                    });
                                    startPlaying(device)
                                        .then((playingInfo) => {
                                            log.info(playingInfo);
                                        })
                                        .catch((err) => {
                                            log.error(err);
                                        });
                                }
                            });
                    }

                    deviceDescription(device)
                        .then((info) => {
                            log.info(info.roomName);
                        });
                });
                response.entries.forEach((element) => {
                    log.info(element.name);
                    const fileFullPath = {
                        path: `${config.get('dropboxPath')}/${element.name}`,
                    };
                    dbx.filesDelete(fileFullPath);
                });
            } else {
                log.info('No files in folder');
            }
        })
        .catch((error) => {
            log.warn(error.error);
            schedule.cancel();
        });
});
