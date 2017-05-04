// app/models/game.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our game model
var gameSchema = mongoose.Schema({
	firstPlayer: {
		username: {
			type: String,
			required: true
		},
		color: {
			type: String,
			required: true
		}
	},
	secondPlayer: {
		username: {
			type: String,
			default: null
		},
		color: {
			type: String,
			required: true
		}
	},
	status: {
		type: String,
		default: '',
	},
	isRunning: {
		type: Boolean,
		default: false,
		required: true
	}
});

module.exports = mongoose.model('Game', gameSchema);
