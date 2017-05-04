// app/models/friendRequests.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our requests model
var requestSchema = mongoose.Schema({
	first: {
		type: String,
		required: true
	},
	second: {
		type: String,
		required: true
	},
	status: {
		type: Number,
		required: true,
		default: 0
	}
	//status = 0 -> request pending, users 
	//status = 1 -> request accept, users are friends
	//status = 2 -> request declined
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Request', requestSchema);
