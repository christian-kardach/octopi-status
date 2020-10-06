"use strict";
let sdk = require("microsoft-cognitiveservices-speech-sdk");
let sha256 = require("sha256");
let path = require('path');
let fs = require('fs');

const sound = require('sound-play');

// Configure Azure
let subscriptionKey = process.env.AZURE_KEY;
let serviceRegion = "westeurope";
let speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
speechConfig.speechSynthesisVoiceName = "en-GB-MiaNeural"
speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3;

function speak(text) {
    let audioPath = path.join('src', 'audio', sha256(text) + ".mp3");

    return new Promise(function (resolve, reject) {
        if (fs.existsSync(audioPath)) {
            sound.play(audioPath).then(() => resolve('done'));
        }
        else {
            let audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioPath);
            let synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

            synthesizer.speakTextAsync(text, function (result) {
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {

                    sound.play(audioPath).then(() => resolve('done'));

                } else {
                    console.error("Speech synthesis canceled, " + result.errorDetails +
                        "\nDid you update the subscription info?");
                }
                synthesizer.close();
                synthesizer = undefined;
            },
                function (err) {
                    console.trace("err - " + err);
                    synthesizer.close();
                    synthesizer = undefined;
                });
        }
    })
}
module.exports = {
    speak
}