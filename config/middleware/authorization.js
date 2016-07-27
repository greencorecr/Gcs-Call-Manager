/** Greencore Solutions QueueMonitor Authorization Middleware
 *  Perform authorization functions
 **/

'use strict';
exports.requiresLogin = function (req, res, next) {
	if (!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl;
		return res.redirect('/login');
	}
	next();
};

exports.ensureAdmin = function (req, res, next) {
	if (req.user && req.user.role) {
		next();
	} else {
		res.send(401, 'Unauthorized');
	}
};