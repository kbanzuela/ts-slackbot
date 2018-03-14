var TimeInput = require('../models/TimeInput.js');

class Parser {
    
    getSpecialCommands() {
        return {
            'list projects': this.listProjects,
            'help': this.help
        }
    }

    listProjects(userName, bot) {
        bot.postMessageToUser(userName, `List projects triggered`, { as_user: true });
    }

    help(userName, bot) {
        bot.postMessageToUser(userName, `help triggered`, { as_user: true });
    }
    
    constructor(bot) {
        this.bot = bot;
        this.specialCommands = ['list projects'];
    }


    saveTime(log){
        TimeInput.create(log, (err, post) => {
            if (err) {
                console.log(err);
                return;
            } else {
                this.bot.postMessageToUser(log.userName, `Think Sumo po! Enjoy your day! \n ${log.date.toISOString().slice(0, 10)} - ${log.project}: ${log.hours}hr(s)`, { as_user: true });
            }
        });
    }

    parseLine(userName, inputText){
        let err = '';
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

    parse(userName, message){

        let exec = this.getSpecialCommands()[message];
        if (exec) {
            this.getSpecialCommands()[message](userName, this.bot);
            return;
        }

        let err = [];
        let logs = [];
        let msgArray = message.split(',');

        msgArray.forEach(msg => {
            let log = this.parseLine(userName, msg.trim());
            if (typeof log === 'string') {
                // this means that this125 returned an error
                err.push(log);
            } else {
                logs.push(log);
            }
        });

        if (err.length > 0) {
            err.forEach(msg => {
                this.bot.postMessageToUser(userName, msg, { as_user: true });
            });
        } else {
            logs.forEach((log) => {
                saveTime(log);
            });
            // save time logs
        }
    }
}

module.exports = Parser;