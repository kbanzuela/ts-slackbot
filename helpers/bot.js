var SlackBot = require('slackbots');
var mongoose = require('mongoose');
var Parser = require('./parser');

var bot = new SlackBot({
    token: '',
    name: 'timbot'
});

var onStart = () => {
    console.log('Bot started');
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

    if(usr.name !== bot.name && message.user) {
        // saveTime(usr.name, message.text);
        const parser = new Parser(bot);
        parser.parse(usr.name, message.text);
        // bot.postMessageToUser(usr.name, 'Your Time was logged.', {as_user: true});
    }
  }
}

exports.run = () => {
    bot.on('start', onStart);
    bot.on('message', onMessage);
}