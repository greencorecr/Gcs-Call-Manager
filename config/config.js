/*
* Greencore Solutions Queue Monitor, 
* Configuration options for Development and Production enviroments
*
* db   is for mongodb db to use
* root is the application's root path 
* app  is the application's details
* ami  is the location, username and secret for the Asterisk host to monitor
*
*/



var path = require('path'),
	rootPath = path.normalize(__dirname + '/..');

module.exports = {
	development: {
		port: 3001,
		db: 'mongodb://localhost/queueMonitorDB_dev',
		root: rootPath,
		app: {
			name: 'Greencore Solutions Queue Monitor'
		},
		ami: {
			host: 'manager-ip',
			port: 'default',
			username: 'user',
			password: 'password'
		}
	},
	production: {
		port: 3001,
		db: 'mongodb://localhost/queueMonitorDB',
		root: rootPath,
		app: {
			name: 'Greencore Solutions Queue Monitor'
		},
		ami: {
			host: 'manager-ip',
			port: 'default',
			username: 'user',
			password: 'password'
		}
	}
};
