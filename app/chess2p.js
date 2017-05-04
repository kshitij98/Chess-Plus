var Chess = require('chess.js').Chess; // For move validation
var Game = require('./models/game'); // import game model
var User = require('./models/user'); // import user model
var Challenge = require('./models/challenges'); //	import challenges models
var Request = require('./models/friendRequests.js'); // import friend request model
var GameQueue = require('./models/gameQueue.js'); // import game queue model

module.exports = function(io, socket) {
	// forfeit game
	socket.on('forfeit 2p', function() {
		Game.findOne({
			$or: [{
				'firstPlayer.username': socket.request.user['username'],
				'secondPlayer.username': {
					"$ne": null
				},
				isRunning: true
			}, {
				'firstPlayer.username': {
					"$ne": null
				},
				'secondPlayer.username': socket.request.user['username'],
				isRunning: true
			}]
		}, function(err, game) {
			if (game) {
				var thisPlayer = socket.request.user['username']; // extract username from socket
				var otherPlayer = game.firstPlayer.username;
				if (otherPlayer == thisPlayer) {
					otherPlayer = game.secondPlayer.username;
				}
				require('../app/gameEnd.js').onWin(otherPlayer, thisPlayer);
			}
		});
	});

	socket.on('send challenge', function(user2) {
		Request.findOne({
			$or: [{
				'first': socket.request.user['username'], // extract username from socket
				'second': user2,
				'status': 1,
			}, {
				'first': user2,
				'second': socket.request.user['username'], //	extract username from socket
				'status': 1,
			}]

		}, function(err, request) {
			if (request) {
				Challenge.findOne({
					'opponent1': socket.request.user['username'], // extract username from socket
					'opponent2': user2,
					'status': 0,
				}, function(err, challenge) {
					if (!challenge) {
						User.findOne({
							'username': socket.request.user['username'], // extract username from socket
						}, function(err, usr) {
							if (usr) {
								io.to(user2).emit('received challenge', {
									'firstName': usr.firstName,
									'lastName': usr.lastName,
									'username': usr.username,
								});
							}
						});
						var tempChallenge = new Challenge({
							'opponent1': socket.request.user['username'], // extract username from socket
							'opponent2': user2,
							'status': 0
						});
						//	save the challenge in the schema
						tempChallenge.save(function(err) {
							console.log(err);
						});
						//	check if challenge is accepted within ten seconds
						setTimeout(function() {
							Challenge.findOne({
								'opponent1': socket.request.user['username'],
								'opponent2': user2,
								'status': 0,
							}, function(err, challenge) {
								if (challenge) {
									challenge['status'] = 1;
									challenge.save(); // save the challenge in schema
								}
							});
						}, 10 * 1000);
					}
				});
			}
		});
	});
	// if challenge is accepted
	socket.on('accept challenge', function(user1) {
		console.log('##### Challenge accepted by : ', user1);
		Challenge.findOne({
			'opponent1': user1,
			'opponent2': socket.request.user['username'],
			'status': 0,
		}, function(err, challenge) {
			if (challenge) {
				User.findOne({
					'username': user1,
					'playing': false,
				}, function(err, usr1) {
					if (usr1) {
						User.findOne({
							'username': socket.request.user['username'],
							'playing': false,
						}, function(err, usr2) {
							if (usr2) {
								usr1['playing'] = true;
								usr1.save();
								usr2['playing'] = true;
								usr2.save();
								challenge['status'] = 1;
								challenge.save();
								// assign the color to the players ranomly
								var firstColor = (((Math.round(Math.random() * 100 + 1)) % 2) ==
									1) ? 'black' : 'white';
								var secondColor = 'black';
								var status = '';
								if (firstColor == 'black') {
									secondColor = 'white';
								}
								// save the game
								var tempGame = new Game({
									'firstPlayer': {
										'username': user1,
										'color': firstColor
									},
									'secondPlayer': {
										'username': socket.request.user['username'],
										'color': secondColor
									},
									'status': status,
									'isRunning': true
								});
								// save the game
								tempGame.save(function(err) {
									console.log(err);
								});
								io.to(user1).emit('2p game started'); // designating that 2 player game has started
								io.to(socket.request.user['username']).emit('2p game started'); // syncing across tabs
							}
						});
					}
				});
			}
		});
	});
	// logic denoting quick play
	socket.on('quick play', function() {
		GameQueue.findOne({
			'status': 0,
		}, function(err, gameQ) {
			if (gameQ) {
				User.findOne({
					'username': gameQ['opponent'],
					'playing': false,
				}, function(err, usr1) {
					if (usr1 && gameQ['opponent'] != socket.request.user['username']) { // check if the user is not challenging itself
						User.findOne({
							'username': socket.request.user['username'],
							'playing': false,
						}, function(err, usr2) {
							if (usr2) {
								usr1['playing'] = true;
								usr1.save();
								usr2['playing'] = true;
								usr2.save();
								gameQ['status'] = 1;
								gameQ.save();
								// randomly assinging the colors to the players
								var firstColor = (((Math.round(Math.random() * 100 + 1)) % 2) ==
									1) ? 'black' : 'white';
								var secondColor = 'black';
								var status = '';
								if (firstColor == 'black') {
									secondColor = 'white';
								}
								//	instatiate the new game object
								var tempGame = new Game({
									'firstPlayer': {
										'username': gameQ['opponent'],
										'color': firstColor
									},
									'secondPlayer': {
										'username': socket.request.user['username'],
										'color': secondColor
									},
									'status': status,
									'isRunning': true
								});
								//	save the game in database
								tempGame.save(function(err) {
									console.log(err);
								});
								io.to(gameQ['opponent']).emit('2p game started');
								io.to(socket.request.user['username']).emit('2p game started');
							}
						});
					}
				});
			} else {
				//		instantiate new Game queue
				var nextInQueue = new GameQueue({
					'opponent': socket.request.user['username'],
					'status': 0
				});
				// save in the database
				nextInQueue.save(function(err) {
					console.log(err);
				});
				//	timeout of ten seconds to start the game
				setTimeout(function() {
					GameQueue.findOne({
						'opponent': socket.request.user['username'],
						'status': 0,
					}, function(err, challenge) {
						if (challenge) {
							challenge['status'] = 1;
							challenge.save();
						}
					});
				}, 10 * 1000);
			}
		});
	});
	//		on moving a chess piece
	socket.on('chess move', function(source, target, promotion) {
		Game.findOne({
			$or: [{
				'firstPlayer.username': socket.request.user['username'],
				'secondPlayer.username': {
					"$ne": null
				},
				isRunning: true
			}, {
				'firstPlayer.username': {
					"$ne": null
				},
				'secondPlayer.username': socket.request.user['username'],
				isRunning: true
			}]
		}, function(err, game) {
			if (game) {
				var thisPlayer = socket.request.user['username']; // getting the username
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
				// initialize the new Chess game (chess.js)
				var chess = new Chess();
				chess.load_pgn(game.status);
				if (chess.turn() == thisColor.slice(0, 1)) {
					var res = chess.move({
						from: source,
						to: target,
						promotion: promotion
					});

					if (res) {
						game['status'] = chess.pgn();
						game.save();
						io.to(otherPlayer).emit('chess moved', source, target, promotion);
						socket.broadcast.to(socket.request.user['username']).emit(
							'own 2p move', source, target, promotion);
					}
					// game over logic
					if (chess.game_over()) {
						if (chess.in_checkmate()) {
							if (chess.turn() == thisColor.slice(0, 1)) require(
								'../app/gameEnd.js').onWin(otherPlayer, thisPlayer);
							else require('../app/gameEnd.js').onWin(thisPlayer, otherPlayer); // game end logic
						} else {
							require('../app/gameEnd.js').onDraw(thisPlayer, otherPlayer); // importing the game end logic
						}
					}
				}
			}
		});
	});

};
