const utils = require('./utils');

let state = null;
let flags = null;
let progress = null;
let activeFile = null;
let temperature = null;

let firstStatusUpdated = false;
let lastSpokenProgress = 0;
let lastSpokenStatus = null;
let lastActiveFile = null;

function processStatus(data, callback) {
    // console.log(data);

    try { state = (data.current["state"][["text"]]); } catch { }
    try { flags = (data.current["state"]["flags"]); } catch { }
    try { progress = parseInt(data.current["progress"]['completion']); } catch { }
    try { activeFile = (data.current["busyFiles"][0]["path"]); } catch { }
    try { temperature = (data.current["temps"][0]); } catch { }

    if(activeFile) {
        if(activeFile != lastActiveFile)
        {
            console.log("HERE!");
            lastActiveFile = activeFile;
            lastSpokenStatus = 0;
        }
    }

    let reply = "";
    switch (state) {
        case "Cancelling":
            if (lastSpokenStatus !== "Cancelling") {
                reply = "Cancelling the print";
                lastSpokenStatus = state;
                callback(reply);
            }
            break;
        case "Pausing":
            reply = "Printer is pausing...";
            break;
        case "Operational":
            if (lastSpokenStatus !== "Operational") {
                reply = "Printer is operational.";
                lastSpokenStatus = state;
                callback(reply);
            }
            break;
        case "Paused":
            break;
        case "Printing":
            if (!firstStatusUpdated && temperature) {
                reply = "Your print is " + progress + "% complete and the " + checkTemperature();
                callback(reply);
                firstStatusUpdated = true;
            }
            // Only update for every 10th percent progress
            else if ((progress > lastSpokenProgress) && firstStatusUpdated) {
                if (progress % process.env.PROGRESS_UPDATE_EVERY === 0 && temperature) {
                    lastSpokenProgress = progress;
                    reply = "Your print is " + progress + "% complete and the " + checkTemperature();
                    callback(reply);
                }
            }
            break;
        case "Resuming":
            if (lastSpokenStatus !== "Resuming") {
                reply = "Printer is resuming.";
                lastSpokenStatus = state;
                callback(reply);
            }
            break;
        case "SdReady":
            reply = "How you like them apples?";
            break;
        case "Error":
            if (lastSpokenStatus !== "Error") {
                reply = "Something is wrong with the printer, please check.";
                lastSpokenStatus = state;
                callback(reply);
            }
            break;
        case "Ready":
            if (lastSpokenStatus !== "Ready") {
                reply = "Printer is ready!";
                lastSpokenStatus = state;
                callback(reply);
            }
            break;
        case "Finishing":
            if (lastSpokenStatus !== "Finishing") {
                reply = "Printer is finishing up!";
                lastSpokenStatus = state;
                callback(reply);
            }
            break;
        case "ClosedOrError":
            if (lastSpokenStatus !== "ClosedOrError") {
                reply = "Printer has closed or there is an error...";
                lastSpokenStatus = state;
                callback(reply);
            }
            break;

        default:
            console.log("Ehm, this is the default...");
    }
}

function checkTemperature() {
    let bedTarget = temperature["bed"]["target"];
    let bedCurrent = temperature["bed"]["actual"];

    let toolTarget = temperature["tool0"]["actual"];
    let toolCurrent = temperature["tool0"]["actual"];

    let bedOk = false;
    let toolOk = false;

    if (utils.between(bedCurrent, bedTarget - 5.0, bedTarget + 5.0)) {
        bedOk = true;
    }
    else if (!bedOk && state === "Printing") {
        return "bed has a problem, currently " + bedCurrent + " degrees.";
    }

    if (utils.between(toolCurrent, toolTarget - 5.0, toolTarget + 5.0)) {
        toolOk = true;
    }
    else if (!bedOk && state === "Printing") {
        return "tool has a problem, currently " + toolCurrent + " degrees.";
    }

    if (toolOk && bedOk) {
        return ("overall temperature is good!");
    }
}

module.exports = {
    processStatus
}

/*  Example Json of the current websocket message
{
    "current": {
        "logs": [
            "Recv:  T:24.10 /0.00 B:24.61 /0.00 @:0 B@:0"
        ],
        "offsets": {},
        "serverTime": 1601963712.133178,
        "busyFiles": [],
        "messages": [],
        "job": {
            "averagePrintTime": null,
            "lastPrintTime": null,
            "user": "chris",
            "file": {
                "origin": "local",
                "name": "c1_bottom.gcode",
                "date": 1601915890,
                "path": "c1_bottom.gcode",
                "display": "c1_bottom.gcode",
                "size": 7534422
            },
            "estimatedPrintTime": 32776.217222180516,
            "filament": {
                "tool0": {
                    "volume": 0,
                    "length": 15630.717020001013
                }
            }
        },
        "temps": [],
        "state": {
            "text": "Operational",
            "flags": {
                "cancelling": false,
                "pausing": false,
                "operational": true,
                "paused": false,
                "printing": false,
                "resuming": false,
                "sdReady": false,
                "error": false,
                "ready": true,
                "finishing": false,
                "closedOrError": false
            }
        },
        "currentZ": null,
        "progress": {
            "completion": null,
            "printTimeLeft": null,
            "printTime": null,
            "printTimeLeftOrigin": null,
            "filepos": null
        }
    }
}
*/