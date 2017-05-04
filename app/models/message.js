// app/models/message.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our message model
var messageSchema = mongoose.Schema({
	from: {
		type: String,
		required: true
	},
	to: {
		type: String,
		required: true
	},
	message: {
		type: String,
		required: true
	},
	time: {
		type: Date,
		default: Date.now()
	},
	read: {
		type: Boolean,
		default: false
	}
});

// create the model for messages and expose it to our app
module.exports = mongoose.model('Message', messageSchema);
