var User = require('./models/user');
var Game = require('./models/game');

var onWin = function(firstUser, secondUser) {
	User.findOne({
		username: firstUser
	}, function(err, first) {
		User.findOne({
			username: secondUser
		}, function(err, second) {
			if (first && second) {
				let r1 = first['rating'],
					r2 = second['rating'];
				let R1 = Math.pow(10, r1 / 400),
					R2 = Math.pow(10, r2 / 400);
				let E1 = R1 / (R1 + R2),
					E2 = R2 / (R1 + R2);
				let S1 = 1,
					S2 = 0;

				first['rating'] = Math.round(r1 + (1 << 7) * (S1 - E1));
				second['rating'] = Math.round(r2 + (1 << 7) * (S2 - E2));

				first['playing'] = false;
				second['playing'] = false;

				first['wins'] += 1;
				second['loss'] += 1;

				first.save();
				second.save();

				Game.findOne({
					$or: [{
						'firstPlayer.username': firstUser,
						'secondPlayer.username': secondUser,
						isRunning: true
					}, {
						'firstPlayer.username': secondUser,
						'secondPlayer.username': firstUser,
						isRunning: true
					}]
				}, function(err, game) {
					if (game) {
						game['isRunning'] = false;
						game.save();
					}
				});
			}
		})
	});
}

var onDraw = function(firstUser, secondUser, isAI) {
	User.findOne({
		username: firstUser
	}, function(err, first) {
		User.findOne({
			username, secondUser
		}, function(err, second) {
			if (first && second) {
				let r1 = first['rating'],
					r2 = second['rating'];
				let R1 = Math.pow(10, r1 / 400),
					R2 = Math.pow(10, r2 / 400);
				let E1 = R1 / (R1 + R2),
					E2 = R2 / (R1 + R2);
				let S1 = 0,
					S2 = 0;

				first['rating'] = Math.round(r1 + (1 << 7) * (S1 - E1));
				second['rating'] = Math.round(r2 + (1 << 7) * (S2 - E2));

				first['playing'] = false;
				second['playing'] = false;

				first['draws'] += 1;
				second['draws'] += 1;

				first.save();
				second.save();

				Game.findOne({
					$or: [{
						'firstPlayer.username': firstUser,
						'secondPlayer.username': secondUser,
						isRunning: true
					}, {
						'firstPlayer.username': secondUser,
						'secondPlayer.username': firstUser,
						isRunning: true
					}]
				}, function(err, game) {
					if (game) {
						game['isRunning'] = false;
						game.save();
					}
				});
			}
		})
	});
}

var onAI = function(firstUser) {
	User.findOne({
		username: firstUser
	}, function(err, first) {
		if (first) {
			first['playing'] = false;
			first.save();
			Game.findOne({
				'firstPlayer.username': firstUser,
				'secondPlayer.username': null,
				isRunning: true
			}, function(err, game) {
				if (game) {
					game['isRunning'] = false;
					game.save();
				}
			});
		}
	});
}

module.exports.onWin = onWin;
module.exports.onDraw = onDraw;
module.exports.onAI = onAI;
