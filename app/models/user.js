// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true,
		unique: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	rating: {
		type: Number,
		required: true,
		default: 100
	},
	age: {
		type: Number,
		required: true
	},
	profilePicture: {
		type: String
	},
	sex: {
		type: String
	},
	theme: {
		type: String
	},
	friends: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: userSchema
	}],
	sessionCount: {
		type: Number,
		default: 0
	},
	wins: {
		type: Number,
		default: 0
	},
	loss: {
		type: Number,
		default: 0
	},
	draws: {
		type: Number,
		default: 0
	},
	playing: {
		type: Boolean,
		default: false
	}
});

// methods
// generating a hash
userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
