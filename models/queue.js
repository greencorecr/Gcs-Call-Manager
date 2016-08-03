'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

// User Schema 
var queueSchema = new Schema({
	epoch: {type: String, default: ''},
	queues: [{
        abandoned: {type: Number, default: 0},
		name: {type: String, default: ''},
		code: {type: String, default: ''}
     },{_id:false}]
});


module.exports = mongoose.model('queue', queueSchema);
