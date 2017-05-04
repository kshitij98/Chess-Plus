var csrf = require('csurf'); //	csrf protection 
var User = require('../app/models/user'); // import models
var Game = require('./models/game'); // import game model
var expressValidator = require('express-validator'); // import express model

// route middleware to make sure a user is logged in
var isLoggedIn = function(req, res, next) {
	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();
	// if they aren't redirect them to the home page
	res.redirect('/');
};

// route middleware to make sure a user is logged in
var isNotLoggedIn = function(req, res, next) {
	// if user is authenticated in the session, carry on
	if (!req.isAuthenticated())
		return next();
	// if they aren't redirect them to the home page
	res.redirect('/profile');
};
// check if the user is different or not
var checkDifferentUser = function(req, res, next) {
	if (req.user.username != req.params.targetUser)
		return next();
	res.redirect('/profile');
}

// CSRF middleware

var checkUser = function(req, res, next) {
	// console.log(req.params.targetUser);
	var ownProfile = '/profile/' + req.user.username;
	if (req.params.targetUser) {
		User.findOne({
			username: req.params.targetUser
		}, function(err, user) {
			if (user) return next();
			else res.redirect(ownProfile); // redirect to its own profile
		})
	} else res.redirect(ownProfile); // 	redirect to its own profile
}

// route middleware to check whether 2P game is running for user or not
var game2POn = function(req, res, next) {
	Game.findOne({
		'firstPlayer.username': req.user.username,
		'secondPlayer.username': {
			"$ne": null
		},
		isRunning: true
	}, function(err, game) {
		if (game) return next();
		else {
			Game.findOne({
				'firstPlayer.username': {
					"$ne": null
				},
				'secondPlayer.username': req.user.username,
				isRunning: true
			}, function(err, game) {
				if (game) return next();
				else res.redirect('/dashboard');
			});
		}
	});
}

// route middleware to check whether ai game is running for user or not
var gameAIOn = function(req, res, next) {
	Game.findOne({
		'firstPlayer.username': req.user.username,
		'secondPlayer.username': null,
		isRunning: true
	}, function(err, game) {
		if (game) return next();
		else res.redirect('/dashboard');
	});
}

var validateRegister = function(req, res, next) {
	// return next();
	req.body.username = req.body.username.toLowerCase();

	req.checkBody('firstName', 'Invalid First Name').notEmpty().isAlpha();
	req.checkBody('lastName', 'Invalid Last Name').notEmpty().isAlpha();
	req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
	req.checkBody('username', 'Invalid Username').notEmpty().matches(/^[a-z0-9_-]{3,16}$/);
	req.checkBody('age', 'Invalid Age').notEmpty().isInt().isAge();
	req.checkBody('sex', 'Invalid Sex').notEmpty().isGender();
	req.checkBody('theme', 'Invalid Theme').isTheme();

	req.getValidationResult().then(function(result){
		result = result.useFirstErrorOnly().array();
		req.session['errors'] = result;
		if(result.length){
			res.redirect('/');
		} 	
		else return next();
	});

}

// functions for validations
var validateLogin = function(req, res, next) {
	req.body.username = req.body.username.toLowerCase();
	//	check for valid username for duplicates and validity
	req.checkBody('username', 'Invalid Username').notEmpty().matches(
		/^[a-z0-9_-]{3,16}$/);

	req.getValidationResult().then(function(result) {
		result = result.useFirstErrorOnly().array();
		req.session['errors'] = result;
		if (result.length) {
			res.redirect('/');
		} else return next();
	});

}

// Exporting the functions

module.exports.isLoggedIn = isLoggedIn;
module.exports.isNotLoggedIn = isNotLoggedIn;
module.exports.checkUser = checkUser;
module.exports.gameAIOn = gameAIOn;
module.exports.validateRegister = validateRegister;
module.exports.validateLogin = validateLogin;
module.exports.game2POn = game2POn;
