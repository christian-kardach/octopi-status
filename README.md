# octopi-status
An example of how to get progress reports from OctoPI server spoken to you every 10th percent completed. Audio is stored so we don't need to do a new synthesis every time.

Tutorial can be found here: https://www.coding-blues.com/2020/10/05/octopi-websocket-progress-report/

This example was designed to be running on a RaspberryPI with a connected speaker.

Some of the packages included
* Azure Cognitive Services Speech SDK (Could be any service)
* REDIS is you have a central server to manage and stream audio
* OctoPi Websocket status

## .env explanation
- OCTOPI_SERVER=http://octopi.local // This is typically the address
- OCTOPI_USER= // Your username to login to OctoPI
- OCTOPI_PASSWORD="" // Your OctoPI password
- REDIS_SERVER="" // If you are using REDIS as your message bus
- REDIS_CHANNEL="" // What channel should it be published to
- API_SERVER= // If your using REDIS streaming the audio from there
- AZURE_KEY="" // Speech API key
- STREAM_AUDIO=1 // 0: get and play audio locally. 1: Stream from another place
- PROGRESS_UPDATE_EVERY=10 // How often you want an update read

## Run
* Clone the repo
* Create a new .env file based on .sample-env
* Fill out your custom data
* ```$ npm install ```
* ```$ nodemon start```
* or
* ```$ npm start```

