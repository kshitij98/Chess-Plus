// app/models/challenges.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our challenges model
var challengeSchema = mongoose.Schema({
	opponent1: {
		type: String,
		required: true
	},
	opponent2: {
		type: String,
		required: true
	},
	status: {
		type: Number,
		required: true,
		default: 0
	}
	// status -> 0 : Challenge is not used yet
	// status -> 1 : Challenge has been used or is no longer valid
});

// create the model for challenges and expose it to our app
module.exports = mongoose.model('Challenge', challengeSchema);
