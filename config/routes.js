/** Greencore Solutions QueueMonitor Router
 *
 * 
 * 
 *
 **/
'use strict';
//var async = require('async')

/** Route Middlewares
 *
 **/

var auth = require('./middleware/authorization'),
	users = require('./middleware/users'),
	userCookie = require('./middleware/userCookie');

/** Finally Expose routes
 *
 **/

module.exports = function (app, passport) {

	app.get('/', function(req, res){
		if (req.user) {
			res.redirect('/queueMonitor');
		} else {
			res.redirect('/login');
		}
	});

	app.get('/login', function(req, res){
		res.render('login', {user: req.user, message: req.flash('error')});
	});

	app.post('/login', passport.authenticate('local', 
			{
				failureRedirect: '/login', 
				failureFlash: 'Invalid username or password'
			}),
		function (req, res) {
            req.session.role = req.user.role;
            req.session.role ? res.redirect('/queueMonitor') : res.redirect('/reportsAgents');
		}
	);

	app.get('/userAdmin', auth.requiresLogin, auth.ensureAdmin, function(req, res) {
		res.render('users', {user: req.user, role: req.session.role});
	});

	app.get('/api/users', auth.requiresLogin, auth.ensureAdmin, users.list);

	app.post('/api/users', auth.requiresLogin, auth.ensureAdmin, users.add, function(req, res) {
		res.render('users');
	});

	app.put('/api/users', auth.requiresLogin, auth.ensureAdmin, users.set);
	app.delete('/api/users', auth.requiresLogin, auth.ensureAdmin, users.remove);

	app.get('/queueMonitor', auth.requiresLogin, userCookie.set, function(req, res){
		res.render('queueMonitor', {title: 'Greencore Solutions Queue Monitor', role: req.session.role});
	});

	app.get('/reports', auth.requiresLogin, userCookie.set, function(req, res){
		res.render('reports', {title: 'Greencore Solutions Queue Monitor', role: req.session.role});
	});

	app.get('/reportsAgents', auth.requiresLogin, userCookie.set, function(req, res){
		res.render('reportsAgents', {title: 'Greencore Solutions Queue Monitor', role: req.session.role, exten: req.user.exten});
	});

	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/login');
	});
};
