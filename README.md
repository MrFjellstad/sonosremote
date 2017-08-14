# sonosremote

[![Greenkeeper badge](https://badges.greenkeeper.io/MrFjellstad/sonosremote.svg)](https://greenkeeper.io/)

Start the Sonos player when you arrive at home.

Works with [Play Sonos when arriving home. - IFTTT](https://ifttt.com/applets/57585804d-play-sonos-when-arriving-home) to start your Sonos player when you arrive at home.

It works as a replacement for the python script and Dropbox installation needed by the IFTTT task. It was made so I could have it running on my Raspberry Pi.

## Setup
Needs a Dropbox accesstoken that you can find [here](https://blogs.dropbox.com/developers/2014/05/generate-an-access-token-for-your-own-account/)

Just drop it in the production.json or development.json file as
```javascript
{
    "accesstoken": "YourTokenGoesHere"
}
```
