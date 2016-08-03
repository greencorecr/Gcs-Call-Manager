'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var pauseSchema = new Schema({
	epochStart: {type: Number, default: 0},
	epochFinish: {type: Number, default: 0},
	timeDiff: {type: Number, default: 0},
	epochS: {type: String, default: ''},
	epochF: {type: String, default: ''},
	timeD: {type: String, default: ''},
	state: {type: Number, default: 0},
	agent: {type: String, default:''},
});

module.exports = mongoose.model('pause', pauseSchema);