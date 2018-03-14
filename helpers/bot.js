var SlackBot = require('slackbots');
var mongoose = require('mongoose');
var TimeInput = require('../models/TimeInput.js');

var bot = new SlackBot({
    token: 'xoxb-328763882387-tDSGGxWozp3vspLCdLez6JUt',
    name: 'timbot'
});

var specialCommands = [
    'list projects' // lists all project slugs
]

var onStart = () => {
    console.log('Bot started');
}

var saveTime = (log) => {
    TimeInput.create(log , (err, post) => {
        if (err) {
            console.log(err);
            return;
        } else {
            bot.postMessageToUser(log.userName, `Think Sumo po! Enjoy your day! \n ${log.date.toISOString().slice(0, 10)} - ${log.project}: ${log.hours}hr(s)`, { as_user: true });
        }
    });
}

var parseLine = (userName, inputText) => {
    let items = inputText.split(' ');
    if (items.length < 2 || items.length > 3) {
        err = `Wat do wid dis? '${inputText}' \nShould be <date (yyyy-mm-dd) -- optional> <project-name> <# of hours>`;
    } else {
        // default to yesterday
        try {
            let date = new Date();
            date.setDate(date.getDate() - 1);
            // items = items.reverse();
            console.log(items);
            let hours = Number(items.pop());

            let project = items.pop();
            if (items.length > 0) {
                date = new Date(items.pop());
            }
            let log = {
                userName,
                date,
                project,
                hours,
                inputText
            };
            return log;
        } catch (e) {
            console.log('Error occured!', e);
            // console.log(e);
            err = `Wat do wid dis? '${inputText}' \nShould be <date (yyyy-mm-dd) -- optional> <project-name> <# of hours>`;
        }
    }
    return err;
}

var parser = (userName, message) => {
    let err = [];
    let logs = [];
    let msgArray = message.split(',');

    msgArray.forEach(msg => {
        let log = parseLine(userName, msg.trim());
        if (typeof log === 'string')  {
            // this means that this125 returned an error
            err.push(log);
        } else {
            logs.push(log);
        }
    });

    if (err.length > 0) {
        err.forEach(msg => {
            bot.postMessageToUser(userName, msg, { as_user: true });
        });
    } else {
        logs.forEach((log) => {
            saveTime(log);
        });
        // save time logs
    }
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
        parser(usr.name, message.text);
        // bot.postMessageToUser(usr.name, 'Your Time was logged.', {as_user: true});
    }
  }
}

exports.run = () => {
    bot.on('start', onStart);
    bot.on('message', onMessage);
}