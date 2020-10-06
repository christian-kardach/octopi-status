"use strict";
require('dotenv').config();
const axios = require('axios');
const { spawn } = require("child_process");

var WebSocketClient = require('websocket').client;
const azureSpeak = require('./services/azure.tts');
const utils = require('./utils');
const octopiStatus = require('./octopi.status');

let octoSession = null;

// Hold all the phrases we will process
const speakQueue = new utils.Queue();
let isSpeaking = false;

// ------ REDIS -----
if (process.env.STREAM_AUDIO == 1) {
    const Redis = require('ioredis');
    const redis = new Redis(process.env.REDIS_SERVER, 6379);
    const redis_publish = new Redis(process.env.REDIS_SERVER, 6379);
    let channel = process.env.REDIS_CHANNEL;

    redis.on('message', (channel, message) => {
            // console.log(`Received the following message from: ${channel}: ${message}`);
            let data = JSON.parse(message);
            if (data.type == "speak") {
                const process = spawn("mpg123", [data.url]);
                process.on('close', function (code) {
                    isSpeaking = false;
                });
                process.on('error', function (err) {
                    isSpeaking = false;
                });
            }
    });

    redis.subscribe(channel, (error, count) => {
        if (error) {
            throw new Error(error);
        }
        console.log(`Subscribed to ${count} channel. Listening for updates on the '${channel}' channel.`);
    });

    module.exports = {
        redis_publish
    }
}

function speakText() {
    if (isSpeaking === false && !speakQueue.isEmpty()) {
        let text = speakQueue.dequeue();
        isSpeaking = true;

        if (process.env.STREAM_AUDIO == 1) {
            axios.get('http://192.168.1.71:4000/api/v1/speak', {
                params: {
                    'text': text
                }
            });
        }
        else {
            azureSpeak.speak(text).then((result) => {
                isSpeaking = false;
            })
        }
    }
}

// Create a new Websocket and connect to OctoPi
let client = new WebSocketClient();
client.on('connectFailed', function (error) {
    console.log('Connect Error: ' + error.toString());
});

function speakCallback(text) {
    speakQueue.enqueue(text);
}

client.on('connect', function (connection) {
    // Send our username and session
    connection.send("{\"auth\": \"" + process.env.OCTOPI_USER + ":" + octoSession + "\"}")
    console.log('OctoPI Client Connected');

    speakQueue.enqueue('OctoPI Client Connected!');

    connection.on('error', function (error) {
        console.log("Connection Error: " + error.toString());
    });

    connection.on('close', function () {
        console.log('OctoPI Connection Closed');
    });

    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            let data = JSON.parse(message.utf8Data);
            // let str = JSON.stringify(data, null, 4);
            // console.log(str);

            if (data.current) {
                octopiStatus.processStatus(data, speakCallback);
            }
        }
    });
});

// Here we login to OctoPI to get our session id
axios.post(process.env.OCTOPI_SERVER + '/api/login', {
    user: process.env.OCTOPI_USER,
    pass: process.env.OCTOPI_PASSWORD,
    passive: true
})
    .then(function (response) {
        //console.log(response.data);
        octoSession = response.data.session;
        client.connect(process.env.OCTOPI_SERVER + '/sockjs/websocket');
    });

setInterval(function () { speakText() }, 200);