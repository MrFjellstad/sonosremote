const cron = require('node-schedule');
const Dropbox = require('dropbox');
const sonos = require('sonos');

const config = require('./config');

// const dbx = new Dropbox({accessToken: 'OYC94uhlHVAAAAAAAAAE5BWE_S5B7_zjQyDdwSMjAK8WcFOsZkILl9I8HQg8j9Fa'});
console.log(config.get('accesstoken'));
const dbx = new Dropbox({accessToken: config.get('accesstoken')});

// cron.scheduleJob('/3 * * * * *', () => {
const schedule = cron.scheduleJob(config.get('schedule'), () => {
    console.log('Checking for stuff');
    // dbx.filesListFolder({path: '/IFTTT/SonosControl'}).then((response) => {
    dbx.filesListFolder({path: config.get('dropboxPath')})
    .then((response) => {
        if (response.entries.length > 0) {
            console.log('Found files');
            const search = sonos.search((device) => {
                search.destroy((response) => {
                    console.log('Stopped searching');
                    console.log(response);
                });

                device.play((response) => {
                    console.log(response);
                    return true;
                })
            });

            response.entries.forEach((element) => {
                console.log(element.name);
                const fileFullPath = {
                    path: `${config.get('dropboxPath')}/${element.name}`
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
