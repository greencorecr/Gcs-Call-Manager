'use strict';

var mongoose = require('mongoose'),
	User = mongoose.model('User');

// Clear old users, then add a default admin user and a normal user
User.find({}).remove(function() {
	User.create({
		provider: 'local',
		name: 'Admin Sample User',
		username: 'admin',
		email: 'admin@nowhere.com',
		role: true,
		password: 'greencoreAdmin'
	}, function(){console.log('Sample admin user added - admin/greencoreAdmin');});
	User.create({
		provider: 'local',
		name: 'Sample User',
		username: 'greencore',
		email: 'greencore@nowhere.com',
		role: false,
		password: 'greencore'
	}, function() {
		console.log('Sample normal user added - greencore/greencore');
		console.log('finished populating users');
	});
});
