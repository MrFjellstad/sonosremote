const cron = require('node-schedule');
const Dropbox = require('dropbox');
const sonos = require('sonos');

const config = require('./config');

const dbx = new Dropbox({ accessToken: config.get('accesstoken') });

// cron.scheduleJob('/3 * * * * *', () => {
const schedule = cron.scheduleJob(config.get('schedule'), () => {
    dbx.filesListFolder({ path: config.get('dropboxPath') })
        .then((response) => {
            if (response.entries.length > 0) {
                const search = sonos.search((device) => {
                    search.destroy((searchResponse) => {
                        console.log('Stopped searching');
                        console.log(searchResponse);
                    });

                    device.play((playResponse) => {
                        console.log(playResponse);
                        return true;
                    });
                });

                response.entries.forEach((element) => {
                    console.log(element.name);
                    const fileFullPath = {
                        path: `${config.get('dropboxPath')}/${element.name}`,
                    };
                    dbx.filesDelete(fileFullPath);
                });
            } else {
                console.log('Nothing here');
            }
        })
        .catch((error) => {
            console.log(error.error);
            schedule.cancel();
        });
});
