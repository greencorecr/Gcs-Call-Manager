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
			//host: '10.42.20.20',
			host: 'colas.greencore.int',
			port: 'default',
			username: 'dev',
			password: 'phos7oH6'
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
			//host: '10.42.20.20',
			host: 'colas.greencore.int',
			port: 'default',
			username: 'dev',
			password: 'phos7oH6'
		}
	}
};
