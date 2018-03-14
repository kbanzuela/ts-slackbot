var mongoose = require('mongoose');

var TimeInputSchema = new mongoose.Schema({
    userName: String,
    date: Date,
    project: String,
    hours: Number,
    inputText: String,
    receive_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TimeInput', TimeInputSchema);