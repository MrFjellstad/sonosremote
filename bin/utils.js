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

function clearDropboxFolder(dbx, dropboxPath, response, log) {
    response.entries.forEach((element) => {
        if (log) log.debug(`Removing ${element.name}`);
        const fileFullPath = {
            path: `${dropboxPath}/${element.name}`,
        };
        dbx.filesDelete(fileFullPath);
    });
}

module.exports = {
    deviceDescription,
    startPlayer,
    pausePlayer,
    getLastResponse,
    clearDropboxFolder,
};
