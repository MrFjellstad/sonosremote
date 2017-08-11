const cron = require('node-schedule');
const Dropbox = require('dropbox');
const sonos = require('sonos');
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'SonosRemote'});

const config = require('./config');

const dbx = new Dropbox({ accessToken: config.get('accesstoken') });

const schedule = cron.scheduleJob(config.get('schedule'), () => {
    dbx.filesListFolder({ path: config.get('dropboxPath') })
        .then((response) => {
            if (response.entries.length > 0) {
                const search = sonos.search((device) => {
                    search.destroy((searchResponse) => {
                        log.info('Stopped searching');
                        log.info(searchResponse);
                    });

                    device.play((playResponse) => {
                        log.info(playResponse);
                        return true;
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
                log.info('Nothing here');
            }
        })
        .catch((error) => {
            log.warn(error.error);
            schedule.cancel();
        });
});
