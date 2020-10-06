# octopi-status
An example of how to get progress reports from OctoPI server spoken to you every 10th percent completed. Audio is stored so we don't need to do a new synthesis every time.

This example was designed to be running on a RaspberryPI with a connected speaker.

Some of the packages included
* Azure Cognitive Services Speech SDK (Could be any service)
* REDIS is you have a central server to manage and stream audio
* OctoPi Websocket status

## Test it yourself
* Clone the repo
* Create a new .env file based on .sample-env
* Fill out your custom data
* ```$ npm install ```
* ```$ nodemon start```
* or
* ```$ npm start```

