'use strict';

exports.set = function (req, res, next) {
	if (req.user) {
		var userInfo = req.user.userInfo;
		userInfo.name = encodeURI(req.user.userInfo.name);
		res.cookie('user', JSON.stringify(userInfo));
	}
	next();
};