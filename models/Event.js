'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

// User Schema 
var eventSchema = new Schema({
	events: [{
        status: {type: String, default: ''},
		exten: {type: String, default: ''},
		epoch: {type: String, default: ''},
		name: {type: String, default: ''}
     },{_id:false}],
	date: {type: String, default: ''},
	queue:{type: String, default: ''},
	uniqueid: {type: String, default: ''},
	status: {type: String, default: ''},
	channel: {type: String, default: ''},
	calleridnum: {type: String, default:''},
	calleridname: {type: String, default: ''},
	connectedlinenum: {type: String, default: ''},
	connectedlinename: {type: String, default: ''}
});


module.exports = mongoose.model('Event', eventSchema);
