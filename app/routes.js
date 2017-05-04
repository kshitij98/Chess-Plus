var middlewares = require('./middleware');
var Request = require('../app/models/friendRequests');
var User = require('../app/models/user');
var Forgot = require('../app/models/forgot');
var Game = require('./models/game');
var sanitizer = require('mongo-sanitize');
var asynchronous = require('async');
var configDB = require('./../config/database.js');
var randomstring = require("randomstring");
var bcrypt = require('bcrypt-nodejs');

// expresss-brute to prevent DOS attacks

var ExpressBrute = require('express-brute');
var MongooseStore = require('express-brute-mongoose');
var BruteForceSchema = require('express-brute-mongoose/dist/schema');
var MongooseClient = require('mongoose');

var model = MongooseClient.model('bruteforce', BruteForceSchema);
var store = new MongooseStore(model);

var bruteforce = new ExpressBrute(store, {
	freeRetries: 15000,
	minWait: 20 * 1000,
	maxWait: 2 * 60 * 1000,
	//	failCallback: failCallback
});

module.exports = function(app, passport, upload) {

	app.get('/', bruteforce.prevent, middlewares.isNotLoggedIn, function(req, res) {
		var errors = req.session['errors'];
		req.session['errors'] = null;
		console.log(errors);
		res.render('index.ejs', {
			csrfTokenFromServer: req.csrfToken(),
			errors: errors
		}); // load the index.ejs file
	});

	app.get('/play', bruteforce.prevent, middlewares.isLoggedIn, middlewares.game2POn,
		function(req, res) {
			Game.findOne({
				$or: [{
					'firstPlayer.username': req.user.username,
					'secondPlayer.username': {
						"$ne": null
					},
					isRunning: true
				}, {
					'firstPlayer.username': {
						"$ne": null
					},
					'secondPlayer.username': req.user.username,
					isRunning: true
				}]
			}, function(err, game) {
				if (game) {
					var thisPlayer = req.user.username; // getting the username
					var otherPlayer = game.firstPlayer.username;
					if (otherPlayer == thisPlayer) {
						otherPlayer = game.secondPlayer.username;
					}
					var thisColor = game.firstPlayer.color;
					var otherColor = game.secondPlayer.color;
					if (thisPlayer == game.secondPlayer.username) {
						thisColor = game.secondPlayer.color;
						otherColor = game.firstPlayer.color;;
					}
					User.findOne({
						username: thisPlayer
					}, function(err, firstUser) {
						User.findOne({
							username: otherPlayer
						}, function(err, secondUser) {
							res.render('chess.ejs', {
								pgnString: game.status,
								myColor: thisColor,
								playAI: 0,
								first: {
									name: firstUser.firstName + ' ' + firstUser.lastName,
									profilePicture: firstUser.profilePicture,
									username: firstUser.username
								},
								second: {
									name: secondUser.firstName + ' ' + secondUser.lastName,
									profilePicture: secondUser.profilePicture,
									username: secondUser.username
								}
							}); // load the chess.ejs file
						})
					})
				}
			});
		});

	app.get('/practise', bruteforce.prevent, middlewares.isLoggedIn, middlewares.gameAIOn,
		function(req, res) {
			Game.findOne({
				'firstPlayer.username': req.user.username,
				'secondPlayer.username': null,
				isRunning: true
			}, function(err, game) {
				if(game) {
					User.findOne({username: req.user.username}, function(err, firstUser){
						if(firstUser){
							res.render('chess.ejs', {
								pgnString: game.status,
								myColor: game.firstPlayer.color,
								playAI: 1,
								first: {
									name: firstUser.firstName + ' ' + firstUser.lastName,
									profilePicture: firstUser.profilePicture,
									username: firstUser.username
								},	
								second: {
									name: 'Computer',
									profilePicture: firstUser.profilePicture,
									username: 'AI'
								}														
							})
						}
					})
				}
			}); // load the chess.ejs file
		});

	// process the login form
	app.post('/login', bruteforce.prevent, middlewares.validateLogin, passport.authenticate(
		'local-login', {
			successRedirect: '/dashboard', // redirect to the secure dashboard section
			failureRedirect: '/', // redirect back to the signup page if there is an error
			failureFlash: true // allow flash messages
		}));

	app.post('/signup', bruteforce.prevent, middlewares.validateRegister,
		passport.authenticate('local-signup', {
			failureRedirect: '/', // redirect back to the signup page if there is an error
		}),
		function(req, res) {
			app.mailer.send('email', {
				to: sanitizer(req.user.email),
				subject: 'Battle your wits',
				username: sanitizer(req.user.username)
			}, function(err) {
				if (err) console.log(err);
			});
			res.redirect('/dashboard');
		});


	// Dashboard
	app.get('/dashboard', bruteforce.prevent, middlewares.isLoggedIn,
		function(req, res) {
			console.log(req.user);
			User.findOne({username: req.user.username}, function(err, user){
				console.log(user.profilePicture);
				res.render('dashboard.ejs', {
					user: {
						profilePicture: user.profilePicture,
						name: user.firstName + ' ' + user.lastName
					}
				})
			})
		}
	);

	app.get('/profile', bruteforce.prevent, middlewares.isLoggedIn, function(req,
		res) {
		res.redirect('/profile/' + sanitizer(req.user.username));
	});

	app.get('/profile/:targetUser', middlewares.isLoggedIn, middlewares.checkUser,
		function(req, res) {
			User.findOne({
				'username': sanitizer(req.params.targetUser)
			}, function(err, result) {
				// console.log(req.params.targetUser, req.user.username);
				Request.findOne({
					$or: [{
						first: req.params.targetUser,
						second: req.user.username
					}, {
						second: req.params.targetUser,
						first: req.user.username
					}, ]
				}, function(err, query) {
					var sameUser, requestStatus = 0;
					// status = 0 -> no request
					// status = 1 -> request is pending (to accpet)
					// status = 2 -> request is sent by logged in user
					// status = 3 -> friends
					if (sanitizer(req.params.targetUser) == sanitizer(req.user.username))
						sameUser = 1;
					else sameUser = 0;

					if (query) {
						// console.log('found');
						if (query.first == req.user.username) {
							if (query.status == 0) requestStatus = 2;
							else if (query.status == 1) requestStatus = 3;
							else requestStatus = 0;
						} else {
							if (query.status == 0) requestStatus = 1;
							else if (query.status == 1) requestStatus = 3;
							else requestStatus = 0;
						}
					}
					// console.log('Request status', requestStatus);
					res.render('profile.ejs', {
						user: {
							firstName: sanitizer(result.firstName),
							lastName: sanitizer(result.lastName),
							username: sanitizer(result.username),
							profilePicture: sanitizer(result.profilePicture),
							wins: sanitizer(result.wins),
							loss: sanitizer(result.loss),
							draws: sanitizer(result.draws),
							rating: sanitizer(result.rating),
							theme: sanitizer(result.theme)
						},
						sameUser: sameUser,
						requestStatus: requestStatus
					});
				});
			});
		});

	// Friend Requests
	app.get('/friendrequests', bruteforce.prevent, middlewares.isLoggedIn,
		function(req, res) {
			Request.find({
				second: req.user.username,
				status: 0
			}, function(err, result) {
				var array = [];
				asynchronous.each(result, function(item, callback) {
					User.findOne({
						username: item.first
					}, function(err, user) {
						array.push({
							username: user.username,
							profilePicture: user.profilePicture
						});
						callback(err);
					});
				}, function(err) {
					User.findOne({
						username: req.user.username
					}, function(err, thisUser) {
						res.render('friendRequests.ejs', {
							user: {
								username: req.user.username,
								profilePicture: thisUser.profilePicture,
								email: req.user.email,
								friendRequests: array
							}
						});
					});
				})
			});
		});

	// LOGOUT
	app.get('/logout', bruteforce.prevent, function(req, res) {
		req.logout();
		res.redirect('/');
	});

	// Profile Picture
	app.get('/updatePicture', bruteforce.prevent, middlewares.isLoggedIn,
		function(req, res) {
			res.render('pp.ejs');
		});

	app.post('/updatePicture', bruteforce.prevent, function(req, res) {
		upload(req, res, function(err) {
			if (err) {
				return res.end("Error uploading file.");
			}
			User.findOne({
				username: sanitizer(req.user.username)
			}, function(err, doc) {
				doc['profilePicture'] = sanitizer(req.user.username);
				doc.save();
			});
			res.redirect("/profile");
		});
	});

	app.get('/forgot', bruteforce.prevent, middlewares.isNotLoggedIn, function(
		req, res) {
		res.render('forgot.ejs', {
			csrfTokenFromServer: req.csrfToken()
		});
	});

	app.post('/forgot', bruteforce.prevent, middlewares.isNotLoggedIn, function(
		req, res) {
		var user = req.body.username;
		var code = randomstring.generate(20) + req.body.username + randomstring.generate(
			20);
		console.log('/reset/' + code);
		User.findOne({
			username: user
		}, function(err, foundUser) {
			if (foundUser) {
				console.log('FOUND!');
				Forgot.findOne({
					username: user
				}, function(err, data) {
					if (data) {
						console.log('FOUND AGAIN!');
						data.code = code;
						data.save(function(err) {
							if (err)
								console.log(err);
							else {
								app.mailer.send('forgotPasswordEmail', {
									to: foundUser.email,
									subject: 'Reset Password',
									link: code
								}, function(err) {
									if (err)
										console.log(err);
								});
							}
							res.redirect('/');
						});
					} else {
						var add = new Forgot();
						add.username = user;
						add.code = code;
						add.save(function(err) {
							if (err)
								console.log(err);
							else {
								app.mailer.send('forgotPasswordEmail', {
									to: foundUser.email,
									subject: 'Reset Password',
									link: code
								}, function(err) {
									if (err)
										console.log(err);
								});
							}
							res.redirect('/');
						});
					}
				})
			} else res.redirect('/');
		})
	});

	app.get('/reset/:code', bruteforce.prevent, middlewares.isNotLoggedIn,
		function(req, res) {
			console.log(req.params);
			Forgot.findOne({
				code: req.params.code
			}, function(err, data) {
				if (data) {
					res.render('reset.ejs', {
						csrfTokenFromServer: req.csrfToken(),
						user: data.username,
						code: req.params.code
					});
				} else res.redirect('http://lmgtfy.com/?q=how+to+type+properly');
			});
		});

	app.post('/reset', bruteforce.prevent, middlewares.isNotLoggedIn, function(
		req, res) {
		var user = req.body.user;
		var password = req.body.password;
		var code = req.body.code;
		console.log(user, password, code);
		Forgot.findOne({
			username: user,
			code: code
		}, function(err, data) {
			if (data) {
				User.findOne({
					username: data.username
				}, function(err, user) {
					if (user) {
						user.password = bcrypt.hashSync(password);
						user.save(function(err) {
							if (err)
								console.log(err);
							res.redirect('/');
						});
					} else res.redirect('/');
				});
			} else res.redirect('/');
		});
	});

	app.get('/*', bruteforce.prevent, function(req, res) {
		res.redirect('http://lmgtfy.com/?q=how+to+type+properly');
	});

};
