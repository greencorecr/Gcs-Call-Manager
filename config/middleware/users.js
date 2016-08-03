'use strict';

var mongoose = require('mongoose'),
	User = mongoose.model('User');

exports.add = function(req, res) {
	var user = new User(req.body);
	user.provider = 'local';

	user.save(function(err) {
		if (err) {
			res.json(400, err);
		} else {
			res.json({ok:1});
		}
	});
};

exports.set = function(req, res) {
	var userData = req.body;
	User.findById(userData.id, function(err, user) {
		if (err) {
			res.json(400, err);
		} else {
			user.name = userData.name;
			user.username = userData.username;
			user.role = userData.role;
			user.email = userData.email;
			user.exten = userData.exten;
			if (userData.password) {
				user.password = userData.password;
			}
			user.save(function(err) {
				if (err) {
					res.json(400, err);
				} else {
					res.json({ok:1});
				}
			});
		}
	});
};

exports.remove = function(req, res) {
	User.findById(req.body.id, function(err, user) {
		if (err) {
			res.json(400, err);
		} else {
			user.remove(function(err) {
				if (err) {
					res.json(400, err);
				} else {
					res.json({ok:1});
				}
			});
		}
	});
};

exports.list = function (req, res) {
	User.find({}, function(err, users) {
		if (err) {
			res.send(400, err);
		} else {
			var userList = [];
			users.forEach(function(user) {
				userList.push(user.userInfo);
			});
			res.json(userList);
		}
	});
};