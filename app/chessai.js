var Chess = require('chess.js').Chess; // chess.js for move validation
var stockfish = require("stockfish"); // for AI
var Game = require('./models/game'); // importing the game schema
var User = require('./models/user'); // importing the user schema

module.exports = function(io, socket) {

	// Forfeit the game
	socket.on('forfeit ai', function() {
		require('../app/gameEnd.js').onAI(socket.request.user['username']);
	});
	// start the game with AI
	socket.on('start ai', function() {
		User.findOne({
			'username': socket.request.user['username'] // extracting the username of user from socket
		}, function(err, usr) {
			if (usr) {
				if (!usr['playing']) {
					usr['playing'] = true;
					usr.save(); // saving the state of user in database
					// randomly assigning the color to the AI and USER
					var firstColor = (((Math.round(Math.random() * 100 + 1)) % 2) == 1) ?
						'black' : 'white';
					console.log(firstColor);
					var secondColor = 'black';
					var status = '';
					if (firstColor == 'black') {
						status = '1.Nf3';
						secondColor = 'white';
					}
					// creating the new Game object
					var tempGame = new Game({
						'firstPlayer': {
							'username': usr['username'],
							'color': firstColor
						},
						'secondPlayer': {
							'username': null,
							'color': secondColor
						},
						'status': status,
						'isRunning': true
					});
					// console.log(tempGame);
					//	saving the game in database
					tempGame.save(function(err) {
						console.log(err);
					});

				}
				socket.emit('ai game started'); // designating that the game has started
			}
		});
	});

	// What happens and how AI moves is decided here
	socket.on('ai move', function(skill, source, target, promotion) {
		if (typeof skill !== 'number') {
			return;
		}
		if (skill < 1 || skill > 10) {
			return;
		}
		Game.findOne({
			'firstPlayer.username': socket.request.user['username'],
			'secondPlayer.username': null,
			isRunning: true
		}, function(err, game) {
			if (game) {
				var chess = new Chess();
				chess.load_pgn(game.status);
				if (chess.turn() == game.firstPlayer.color.slice(0, 1)) {
					var res = chess.move({
						from: source,
						to: target,
						promotion: promotion
					});
					if (chess.game_over()) {
						require('../app/gameEnd.js').onAI(socket.request.user['username']);
					}
					if (res) {
						// to sync the game across tabs broadcast to the room of the username
						socket.broadcast.to(socket.request.user['username']).emit(
							'own ai move', source, target, promotion);
						var engine = stockfish();
						engine.postMessage("uci");
						engine.onmessage = function(line) {
							var match;
							var got_uci;
							var started_thinking;
							var position = chess.history({
								verbose: true
							}).reduce(function(total, move) {
								return total + move.from + move.to + (move.promotion || '') +
									' ';
							}, '');
							if (!got_uci && line === "uciok") {
								got_uci = true;
								engine.postMessage("position startpos moves " + position);
								engine.postMessage("eval");
								engine.postMessage("d");
								engine.postMessage("go ponder");
							} else if (!started_thinking && line.indexOf("info depth") > -1) {
								started_thinking = true;
								setTimeout(function() {
									engine.postMessage("stop"); // after some seconds tell the AI to stop thinking and make the move.
								}, 1000 * skill);
							} else if (line.indexOf("bestmove") > -1) {
								match = line.match(/bestmove\s+(\S+)/);
								if (match) {
									io.to(game.firstPlayer.username).emit('ai moved', match[1]);
									chess.move(match[1], {
										sloppy: true
									});
									game['status'] = chess.pgn();
									game.save(); // save the game in database
									if (chess.game_over()) {
										require('../app/gameEnd.js').onAI(socket.request.user[
											'username']);
									}
									engine.postMessage("quit"); // end the game
								}
							}
						};
					}
				}
			}
		});
	});
};
