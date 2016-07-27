'use strict';
var express = require('express'),
	favicon = require('static-favicon'),
	session = require('express-session'),
	expressJson = require('body-parser').json,
	expressUrlencoded = require('body-parser').urlencoded,
	// bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	cookieParser = require('cookie-parser'),
	mongoStore = require('connect-mongo')(session),
	compression = require('compression'),
	flash = require('connect-flash');

module.exports = function (app, config, passport) {
	var env = process.env.NODE_ENV || 'development';
	app.set('showStackError', true);

	//Compress needs to be called high in the stack
	app.use(compression ({
		filter: function(req, res) {
			return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
		},
		level: 9
	}));

	app.use(favicon(config.root + '/public/images/favicon.ico'));
	app.use(express.static(config.root + '/public'));

	// app.use(express.logger('dev'));

	app.set('views', config.root+ '/views');
	app.set('view engine', 'jade');

	app.set('port', process.env.PORT || 3001);
	//multipart not needed, so instead of body parser, we use json() and urlencoded() only for better security
	app.use(expressJson());
	app.use(expressUrlencoded());
	app.use(cookieParser());
	app.use(methodOverride());

	//Store sessions in Mongo
	app.use(session({
		secret: 'We4aN6chi7',
		cookie: {
			httpOnly: true,
			secure: true
		},
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
	// app.use(app.router);

	if ('development' === env || 'test' === env) {
		app.locals.pretty = true;
	}

};
