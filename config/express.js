'use strict';
var express = require('express'),
	mongoStore = require('connect-mongo')(express),
	flash = require('connect-flash');

module.exports = function (app, config, passport) {
	app.set('showStackError', true);

	//Compress needs to be called high in the stack
	app.use(express.compress ({
		filter: function(req, res) {
			return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
		},
		level: 9
	}));

	app.use(express.favicon(config.root + '/public/images/favicon.ico'));
	app.use(express.static(config.root + '/public'));

	app.use(express.logger('dev'));

	app.set('views', config.root+ '/views');
	app.set('view engine', 'jade');

	app.configure(function () {
		app.set('port', process.env.PORT || 3001);
		//multipart not needed, so instead of body parser, we use json() and urlencoded() only for better security
		app.use(express.json());
		app.use(express.urlencoded());
		app.use(express.cookieParser());
		app.use(express.methodOverride());

		//Store sessions in Mongo 
		app.use(express.session({
			secret: 'We4aN6chi7',
			store: new mongoStore({
				url: config.db,
				collection: 'sessions'
			}, function() {
				console.log('Mongo Store up');
			})
		}));

		//Use Passport Session
		app.use(passport.initialize());
		app.use(passport.session());

		app.use(flash());
/*
		//Add CSRF protection (if it hurts surround it with an if to setup only in production)
		app.use(express.csrf());
		app.use(function(req, res, next){
			res.locals.csrf_token = req.csrfToken();
			next();
		});
*/
		app.use(app.router);

		app.configure('development', function () {
			app.locals.pretty = true;
		});
	});
};