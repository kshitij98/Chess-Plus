// app/models/gameQueues.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our gameQueues model
var gameQueueSchema = mongoose.Schema({
	opponent: {
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

// create the model for game queue and expose it to our app
module.exports = mongoose.model('GameQueue', gameQueueSchema);
