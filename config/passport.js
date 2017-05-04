// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var User = require('../app/models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

	// sanitize the mongoDB imputs
	var sanitizer = require('mongo-sanitize');

	// used to serialize the user for the session
	passport.serializeUser(function(user, done) {
		done(null, {
			username: sanitizer(user.username),
			email: sanitizer(user.email)
		});
	});

	// used to deserialize the user
	passport.deserializeUser(function(username, done) {
		done(null, username);
	});

	// SIGNUP
	passport.use('local-signup', new LocalStrategy({
			passReqToCallback: true // allows us to pass back the entire request to the callback
		},
		function(req, username, password, done) {
			// asynchronous
			// User.findOne wont fire unless data is sent back
			process.nextTick(function() {

				// find a user whose username is the same as the forms username
				// we are checking to see if the user trying to login already exists
				User.findOne({
					'username': sanitizer(username)
				}, function(err, user) {
					// if there are any errors, return the error
					if (err)
						return done(err);
					// check to see if theres already a user with that username
					if (user) {
						return done(null, false, req.flash('signupMessage',
							'That username is already taken.'));
					} else {

						// find a user whose email is the same as the forms email
						// we are checking to see if the user trying to login already exists
						User.findOne({
							'email': sanitizer(req.body.email)
						}, function(err, user) {
							// if there are any errors, return the error
							if (err)
								return done(err);

							// check to see if theres already a user with that email
							if (user) {
								return done(null, false, req.flash('signupMessage',
									'That email is already taken.'));
							} else {

								// if there is no user with that email
								// create the user
								var newUser = new User();

								// set the user's local credentials

								newUser.firstName = sanitizer(req.body.firstName);
								newUser.lastName = sanitizer(req.body.lastName);
								newUser.username = sanitizer(req.body.username);
								newUser.email = sanitizer(req.body.email);
								newUser.password = newUser.generateHash(sanitizer(req.body.password));
								newUser.rating = 1500;
								newUser.age = sanitizer(req.body.age);
								newUser.profilePicture = '_default';
								newUser.sex = sanitizer(req.body.sex);
								newUser.theme = sanitizer(req.body.theme);

								// save the user
								newUser.save(function(err) {
									if (err)
										throw err;
									return done(null, newUser);
								});

							}
						});

					}

				});

			});

		}));


	// LOGIN

	passport.use('local-login', new LocalStrategy({
			passReqToCallback: true // allows us to pass back the entire request to the callback
		},
		function(req, username, password, done) { // callback with username and password from our form

			// find a user whose username is the same as the forms username
			// we are checking to see if the user trying to login already exists
			User.findOne({
				'username': sanitizer(username)
			}, function(err, user) {
				// if there are any errors, return the error before anything else
				if (err)
					return done(err);

				// if no user is found, return the message
				if (!user)
					return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

				// if the user is found but the password is wrong
				if (!user.validPassword(sanitizer(password)))
					return done(null, false, req.flash('loginMessage',
						'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

				// all is well, return successful user
				return done(null, user);
			});

		}));

};
