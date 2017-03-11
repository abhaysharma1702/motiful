const config = require('../userconfig/config.json'); // Import configuration
const fs = require('fs'); // For custom emotes
const moment = require('moment'); // For logs
const globalEmotes = require('../twitchemotes/global.json'); // Load global emotes list
const subEmotes = require('../twitchemotes/subscriber.json'); // Load subscriber emote list
const bttv = require('../twitchemotes/bttv.json') // Load bttv emote list
const favs = require('../userconfig/favorite_emotes.json'); // Load favorite emotes object

exports.main = function(selfbot, msg, msgArray, chalk) { // Export command function
    var command = "emote";
    if(msg.content == config.commandPrefix + command.toLowerCase()) {
    // If no emote was specified...
        return msg.edit('Specify an emote!').then(msg => msg.delete(2000));
        // ...tell the user to do so and set auto-delete to 2s and abort command execution
    };
    var timestamp = moment().format('DD/MM/YYYY HH:mm:ss');
	// Define timestamp
    var twChannel = "";
    // Define twChannel placeholder
    if(msgArray[1].startsWith('"')) {
    // If the twChannel name is a multi-word channel...
        twChannel = msg.content.substring(msg.content.indexOf('"')+1, msg.content.lastIndexOf('"')).replace(/ /g,"_");
        // ...assign the twChannel value to the cut-out "" part and replace all spaces with underscores.
    }
    else {
    // If the twChannel is a single-word channel...
        twChannel = msgArray[1];
        // ...assign the twitch channel out of array.
    };
    var emoteName = msgArray[2];
    // Assing emote name out of array
    var emoteURL = "";
    // Define emote URL placeholder
    var emoteSize = msgArray[3];
    // Assign emote size out of array
    var emoteID = "";
    // Define subscriber emoteID placeholder
    msg.delete();
    // Delete the command call
    if(emoteSize == undefined || ( emoteSize !== "1.0" && emoteSize !== "2.0" && emoteSize !== "3.0" )) { emoteSize = "1.0" };
    // Default to 1.0 emote size if none given
    var customPath = require("path").join(__dirname, "../customemotes/");
    // Set path custom emotes are saved in
    if(globalEmotes["emotes"][msgArray[1]] !== undefined) {
    // If the emote name can be found within the global emotes...
         emoteName = msgArray[1];
         /*
		 ...change the order of array objects...
		*/
        emoteSize = msgArray[2];
        if(msgArray[2] == undefined || ( msgArray[2] !== "1.0" && msgArray[2] !== "2.0" && msgArray[2] !== "3.0" )) { msgArray[2] = "1.0" };
        emoteSize = msgArray[2];
        // ...default to 1.0 emote size if none given or it is not 1.0, 2.0 or 3.0...
        twChannel = "";
        // ...and empty the twitch channel argument.
        emoteID = globalEmotes["emotes"][emoteName]["image_id"];
        emoteURL = `https://static-cdn.jtvnw.net/emoticons/v1/${emoteID}/${emoteSize}`;
        // Grab the emote's ID out of the global emotes list and assign the emote URL...
        return msg.channel.sendFile(emoteURL, `${emoteName}.png`);
        // ...then send the emote into the channel the command was called in and abort command execution.
    };
    if(subEmotes["channels"][twChannel.toLowerCase()] !== undefined) {
    // If the channel argument can be found in the twitch channel list...
        twChannel = twChannel.toLowerCase();
        // ...make twitch channel input lowercase...
        for(var i = 0; i < Object.keys(subEmotes["channels"][twChannel]["emotes"]).length; i++) {
        // ...loop through the specified channel's emotes...
            if(subEmotes["channels"][twChannel]["emotes"][i]["code"] == emoteName) {
                // ...and if the emote name matches up with the argument...
                emoteID = subEmotes["channels"][twChannel]["emotes"][i]["image_id"];
                // ...assign the image id of the matched emote as emoteID...
                emoteURL = `https://static-cdn.jtvnw.net/emoticons/v1/${emoteID}/${emoteSize}`;
                // ...then assign the emote URL using emoteID and emoteSize.
            };
        };
        if(emoteID == "") { return };
        // If emoteID is empty (no name could be matched, emote not found), abort command execution
        return msg.channel.sendFile(emoteURL, emoteName + ".png");
        // Send the emote into the channel the command was called in and abort command execution.
    };
    if(twChannel.toLowerCase() == "ffz") {
    // If the channel was specified as ffz...
        require('request').get(`http://api.frankerfacez.com/v1/emoticons?q=${emoteName}&page=1&private=on`, function(error, response, body) {
        // ...search FrankerFaceZ for the emote name (emote input).
	        if(error) {console.log(`[${timestamp}]${chalk.red("[REQUEST-ERROR]")} Error searching FrankerFaceZ emote list occurred: ${error}`); msg.edit("Error contacting the website! (Try again?)").then(msg => msg.delete(2000)); return;};
		    // Log any errors|undefined responses, notify the user and abort command execution
       	    if(response == undefined) {console.log(`[${timestamp}]${chalk.red("[REQUEST-ERROR]")} FrankerFaceZ emote list response undefined`); msg.edit("Error contacting the website! (Try again?)").then(msg => msg.delete(2000)); return;};
            if(body) {
            // Once body exists...
                if(msgArray[3] == undefined || ( msgArray[3] !== "1" && msgArray[3] !== "2" && msgArray[3] !== "4" )) { msgArray[3] = "1" };
                // ...check the value of the 3rd argument, if it is not 1, 2 or 4 default to 1...
                emoteSize = msgArray[3];
                // ...and reassign emote size.
                var emoteList = JSON.parse(body);
                // Define the emote list as parsed body...
                for(var i = 0; i < emoteList["emoticons"].length; i++) {
                // ...loop through the list of emotes...
                    if(emoteList["emoticons"][i]["name"] == emoteName && emoteID == "") {
                    // ...and if the emote name matches up with the argument while the emoteID is not yet assigned...
                        emoteID = emoteList["emoticons"][i]["id"];
                        // ...assign the emote id of the matched emote as emoteID...
                        emoteURL = `http://cdn.frankerfacez.com/emoticon/${emoteID}/${emoteSize}`;
                        // ...assign the emoteURL accordingly...
                        return msg.channel.sendFile(emoteURL, emoteName + ".png");
                        // ...send the emote and abort command execution to prevent multi-post of emotes with same name
                    };
                };
            };
        });
    };
    if(twChannel.toLowerCase() == "bttv") {
    // If the channel was specified as bttv...
        if(msgArray[3] == undefined || ( msgArray[3] !== "1" && msgArray[3] !== "2" && msgArray[3] !== "3" )) { msgArray[3] = "1" };
        // ...check the value of the 3rd argument, if it is not 1, 2 or 3 default to 1...
        emoteSize = msgArray[3];
        // ...and reassign the emoteSize.
        for(var i = 0; i < bttv["emotes"].length; i++) {
        // Loop through the list of emotes...
            if(bttv["emotes"][i]["code"] == emoteName && emoteID == "") {
            // ...and if the emote name matches up with the argument while the emoteID is not yet assigned...
                emoteID = bttv["emotes"][i]["id"];
                // ...assign the emote id of the matched emote as emoteID...
                emoteURL = `https://cdn.betterttv.net/emote/${emoteID}/${emoteSize}x`;
                // ...assign the emoteURL accordingly...
                return msg.channel.sendFile(emoteURL, emoteName + "." + bttv["emotes"][i]["imageType"]);
                // ...send the emote and abort command execution to prevent multi-post of emotes with same name
            };
        };
    };
    if(fs.existsSync(`${customPath + twChannel.replace(/ /g,"_")}.png`) || fs.existsSync(`${customPath + twChannel.replace(/ /g,"_")}.jpg`) || fs.existsSync(`${customPath + twChannel.replace(/ /g,"_")}.gif`)) {
    // If the channel argument can be found within the custom emotes as png, jpg or gif...
        if(fs.existsSync(`${customPath + twChannel}.png`)) {
        // ... 1) and if the file is a png file...
            emoteURL =  customPath + twChannel + ".png";
            // ...set emoteURL to the emote path plus the twitch channel (emote name in this case) and add the png extension...
        };
        if(fs.existsSync(`${customPath + twChannel}.jpg`)) {
        // ... 2) and if the file is a jpg file...
            emoteURL =  customPath + twChannel + ".jpg";
            // ...set emoteURL to the emote path plus the twitch channel (emote name in this case) and add the jpg extension...
        };
        if(fs.existsSync(`${customPath + twChannel}.gif`)) {
        // ... 3) and if the file is a gif file...
            emoteURL =  customPath + twChannel + ".gif";
            // ...set emoteURL to the emote path plus the twitch channel (emote name in this case) and add the gif extension...
        };
        emoteName = emoteURL.replace(customPath, '');
        // ...and then define emote name as the filename.
        msg.channel.sendFile(emoteURL, emoteName);
        // Send the emote
    };
    if(favs.hasOwnProperty(twChannel)) {
    // If the emote is on the favorites list....
        emoteName = favs[twChannel]["emoteName"];
        twChannel = favs[twChannel]["twChannel"];
        // ...redefine twChannel and emoteName to favorite values.
        if(favs[emoteName]["twChannel"] == "bttv") {
        // If the favorite is a BTTV emote...
            if(msgArray[2] == undefined || ( msgArray[2] !== "1" && msgArray[2] !== "2" && msgArray[2] !== "3" )) { msgArray[2] = "1" };
            // ...default emote size to 1 if given one is not 1, 2 or 3.
            emoteSize = msgArray[2];
            for(var i = 0; i < bttv["emotes"].length; i++) {
            // Loop through the list of emotes...
                if(bttv["emotes"][i]["code"] == emoteName && emoteID == "") {
                // ...and if the emote name matches up with the argument while the emoteID is not yet assigned...
                    emoteID = bttv["emotes"][i]["id"];
                    // ...assign the emote id of the matched emote as emoteID...
                    emoteURL = `https://cdn.betterttv.net/emote/${emoteID}/${emoteSize}x`;
                    // ...assign the emoteURL accordingly...
                    return msg.channel.sendFile(emoteURL, emoteName + "." + bttv["emotes"][i]["imageType"]);
                    // ...send the emote and abort command execution to prevent multi-post of emotes with same name
                };
            };
        }
        else if(favs[emoteName]["twChannel"] == "ffz") {
        // If the favorite is a FFZ emote....
            if(msgArray[2] == undefined || ( msgArray[2] !== "1" && msgArray[2] !== "2" && msgArray[2] !== "4" )) { msgArray[2] = "1" };
            // ...default emote size to 1 if given one is not 1, 2 or 4.
            emoteSize = msgArray[2];
            require('request').get(`http://api.frankerfacez.com/v1/emoticons?q=${emoteName}&page=1&private=on`, function(error, response, body) {
            // Get the list of valid FrankerFaceZ emotes using the emoteName
	            if(error) {console.log(`[${timestamp}]${chalk.red("[REQUEST-ERROR]")} Error searching FrankerFaceZ emote list occurred: ${error}`); msg.edit("Error contacting the website! (Try again?)").then(msg => msg.delete(2000)); return;};
		        // Log any errors|undefined responses, notify the user and abort command execution
       	        if(response == undefined) {console.log(`[${timestamp}]${chalk.red("[REQUEST-ERROR]")} FrankerFaceZ emote list response undefined`); msg.edit("Error contacting the website! (Try again?)").then(msg => msg.delete(2000)); return;};
                if(body) {
                // Once body exists...
                    var emoteList = JSON.parse(body);
                    // ...define the emote list as parsed body...
                    for(var i = 0; i < emoteList["emoticons"].length; i++) {
                    // ...loop through the list of emotes...
                        if(emoteList["emoticons"][i]["name"] == emoteName && emoteID == "") {
                        // ...and if the emote name matches up with the argument while the emoteID is not yet assigned...
                            emoteID = emoteList["emoticons"][i]["id"];
                            // ...assign the emote id of the matched emote as emoteID...
                            emoteURL = `http://cdn.frankerfacez.com/emoticon/${emoteID}/${emoteSize}`;
                            // ...assign the emoteURL accordingly...
                            return msg.channel.sendFile(emoteURL, emoteName + ".png");
                            // ...send the emote and abort command execution to prevent multi-post of emotes with same name
                        };
                    };
                };
            });
        }
        else {
        // If the favorite is a twitch subscriber emote...
            if(msgArray[2] == "2.0" || msgArray[2] == "3.0") {emoteSize = msgArray[2]; };
            // ...default emote size to 1.0 if given one is not 1.0, 2.0 or 3.0.
            for(var i = 0; i < Object.keys(subEmotes["channels"][twChannel]["emotes"]).length; i++) {
            // Loop through the specified channel's emotes...
                if(subEmotes["channels"][twChannel]["emotes"][i]["code"] == emoteName) {
                    // ...if the emote name matches up with the argument...
                    emoteID = subEmotes["channels"][twChannel]["emotes"][i]["image_id"];
                    // ...assign the image id of the matched emote as emoteID...
                    emoteURL = `https://static-cdn.jtvnw.net/emoticons/v1/${emoteID}/${emoteSize}`;
                    // ...then assign the emote URL using emoteID and emoteSize.
                    return msg.channel.sendFile(emoteURL, emoteName + ".png");
                    // Send the emote into the channel the command was called in and abort command execution.
                };
            };
        };
    };
};

exports.desc = "Post a twitch (global or subscriber), FrankerFaceZ, BetterTwitchTV or custom emote into chat - Multi-word custom emotes need to be enclosed by quotes."; // Export command description
exports.syntax = "<global emote, 'ffz', 'bttv', custom emote, favorite emote or twitch channel> <bttv emote if bttv, ffz emote if ffz, channel emote if twitch channel or emote size if global or fav emote> <emote size if subscriber, bttv or ffz emote>"; // Export command syntax
