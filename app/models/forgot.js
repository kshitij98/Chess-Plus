// app/models/forgot.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var forgotSchema = mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	code: {
		type: String,
		required: true,
		unique: true
	},
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Forgot', forgotSchema);
