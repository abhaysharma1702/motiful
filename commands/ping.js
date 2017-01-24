var Commands = require('../command_handler.js'); // Load command handler

exports.main = function(selfbot, msg, msgArray) { // Export command's function
    var command = "ping";
    msg.delete()
    msg.channel.sendMessage('Pong?').then(message => {
            message.edit(`Pong'ed in ${message.createdTimestamp - msg.createdTimestamp}ms!`)
            message.delete(2000);
    });
};

exports.desc = "Measure the delay between your input and the selfbot's execution"; // Export command description
exports.syntax = "" // Export command syntax 