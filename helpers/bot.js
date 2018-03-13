var SlackBot = require('slackbots');
var mongoose = require('mongoose');
var TimeInput = require('../models/TimeInput.js');

var bot = new SlackBot({
    token: 'TOKEN_GOES_HERE',
    name: 'SlackBot'
});


var onStart = () => {
    console.log('Bot started');
}

var saveTime = (userName, inputText) => {
    TimeInput.create({
        userName,
        inputText
    }, (err, post) => {
        if (err) {
            console.log(err);
            return;
        } else {
            bot.postMessageToUser(userName, 'Your Time was logged.', { as_user: true });
        }
    });
}

var onMessage = (message) => {
  users = [];
  channels = [];
  var botUsers = bot.getUsers();
  users = botUsers._value.members;
  var botChannels = bot.getChannels();
  channels = botChannels._value.channels;

  if(message.type === 'message' && Boolean(message.text)) {
    console.log(message);
    // var channel = channels.find(channel => channel.id === message.channel);
    var usr = users.find(user => user.id === message.user);

    if(usr.name !== 'timbot' && message.user) {
        saveTime(usr.name, message.text);
        // bot.postMessageToUser(usr.name, 'Your Time was logged.', {as_user: true});
    }
  }
}

exports.run = () => {
    bot.on('start', onStart);
    bot.on('message', onMessage);
}