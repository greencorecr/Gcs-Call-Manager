'use strict';
/**
 * Module dependencies.
 **/

var express = require('express'),
	http = require('http'),
//	fs = require('fs'),
	passport = require('passport'),
	GcsAmi = require('./gcs_modules/gcs_ami'),
	gcsAmi = new GcsAmi();

var env = process.env.NODE_ENV || 'development',
	config = require('./config/config')[env],
	// cookie = require('express/node_modules/cookie'),
	// connect = require('express/node_modules/connect'),
	cookieParser = require('cookie-parser'),
	mongoose = require('mongoose');

mongoose.connect(config.db);

require('./models/user'); //If more models change to "for *js"

require('./config/passport')(passport, config);


/**
 * To ease development process, we create some initial users, don't use them in production before changing their passwords or
 *  creating your own users
 *
 * set env var GCS_NODEREFRESH to the string 'true' if you want to leave the database as is
 *
 */
if ('development' === env && 'true' !== process.env.GCS_NOREFRESH) {
	console.log('Data is beeing loaded into database, all prev data in the collections is lost');
	require('./config/initDevData');
}

var app = express();

require('./config/express')(app, config, passport);
require('./config/routes')(app, passport);


// server = http.createServer(app).listen(app.get('port'), function(){
//   console.log('Express server listening on port ' + app.get('port'));
// });
var server = http.createServer(app);

gcsAmi.connect(config.ami); //This call opens the connection to asterisk AMI
gcsAmi.on('error', function(error){
	console.log('AMI error: '+error);
});



/**
 * Authorize socket.io for logged users only
 *
 **/
var io = require('socket.io').listen(server, {log: false});

io.set('authorization', function (handshakeData, accept) {

  if (handshakeData.headers.cookie) {

    handshakeData.cookie = cookieParser(handshakeData.headers.cookie);

    handshakeData.sessionID = cookieParser(handshakeData.cookie['connect.sid'], 'We4aN6chi7');

    if (handshakeData.cookie['connect.sid'] === handshakeData.sessionID) {
      return accept('Cookie is invalid.', false);
    }

  } else {
    return accept('No cookie transmitted.', false);
  }

  accept(null, true);
});

/**
 * React to client events from socket.io
 *
 **/
io.sockets.on('connection', function(socket){

	socket.on('userPrefs', function	(data) {
		var User = mongoose.model('User');
		User.findById(data.userId, function(err, user) {
			if (!err) {
				var index = user.queues.map(function(q) {return q.queueId;}).indexOf(data.queueId);
				if (-1 !== index) {
					user.queues[index].view = data.view;
				} else {
					user.queues.push({queueId: data.queueId, view: data.view});
				}
				user.save(function(err) {
					if (err) {
						console.log('error saving user prefs '+err);
					}
				});
			}
		});
	});

	socket.on('pauseAgent', function(data){ //Toggle Paused state for an agent in a queue
		var pkg = {
			action: 'QueuePause',
			queue: data.queue,
			interface: data.interface,
			paused: data.paused
		};
		gcsAmi.send({order: 'QueuePause', payload: pkg});
	});

	socket.on('removeAgent', function(data){ //Remove an agent from a queue
		var pkg = {
			action: 'QueueRemove',
			queue: data.queue,
			interface: data.interface
		};
		gcsAmi.send({order: 'QueueRemove', payload: pkg});
	});

	socket.on('spyAgent', function(data){ //Create ChannelSpy channel for the supervisor
		/*var pkg = {
			action: 'Originate',
			application: 'ExtenSpy',
			options: 'qES',
			context: 'from-internal',
			timeout: '30000',
			supervisor: data.supervisorId,
			agent: data.agentId
		};*/ //This pkg was intended to use extenSpy, but asterisk did not cooperate, so chanspy was used with the next pkg
		var pkg = {
			action: 'Originate',
			channel: 'Local/'+data.supervisorId,
			exten: '556',
			timeout: '30000',
			priority: '1',
			variable: 'agent='+data.agentId,
			context: 'from-internal'
		};
		gcsAmi.send({order: 'spyAgent', payload: pkg});
	});

	/**
	 *  In order to safely unbind the listeners when the user disconnect, they must be called with a named callback
	 *   not an anonymous function, so here are the callbacks
	 *
	 */
	function freshData(payload) {
		socket.emit('freshData', payload);
	}

	function newAgent(payload) {
		socket.emit('newAgent', payload);
	}

	function agentRemoved(payload) {
		socket.emit('agentRemoved', payload);
	}

	/** Then we add the listeners **/
	gcsAmi.on('newAgent', newAgent);
	gcsAmi.on('agentRemoved', agentRemoved);
	gcsAmi.on('freshData', freshData);

	socket.on('disconnect', function() {
		/** All non socket.io listeners must be cleaned at disconnect **/
		gcsAmi.removeListener('newAgent', newAgent);
		gcsAmi.removeListener('agentRemoved', agentRemoved);
		gcsAmi.removeListener('freshData', freshData);
	});

});

server.listen(config.port, function () {
  console.log('Express server listening on port %d in %s mode', config.port, app.get('env'));
});


/*exports = module.exports = server;

exports.use = function() {
	app.use.apply(app, arguments);
};*/
