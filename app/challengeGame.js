var Game = require('./models/game'); // include Game model
var User = require('./models/user'); // include User model
var firstUser;
var secondUser;
var firstColor;
var secondColor;
var isRunning = false;
var tempGame;
var flag = false;

var checkPlay = function(data) {
	User.findOne({
		'username': data['firstPlayer']
	}, function(err, usr1) {

		User.findOne({
				'username': data['secondPlayer']
			},
			function(err, usr2) {
				if (usr1['friends'].indexOf(usr2['_id']) != -1 && !usr1['playing'] && !
					usr2['playing']) {
					socket.emit('createChallenge');
				} else {
					socket.emit('wrongGame');
				}
			});
	});
};


socket.on('initChallenge', function(data) {
	isRunning = false;
	firstUser = data['firstPlayer'];
	secondUser = data['secondPlayer'];
	firstColor = (((Math.random() * 100 + 1) % 2) == 1) ? 'black' : 'white';
	secondColor = 'black';
	if (firstColor == 'black')
		secondColor = 'white';
	tempGame = new Game({
		'firstPlayer': {
			'username': firstUser,
			'color': firstColor
		},
		'secondPlayer': {
			'username': secondUser,
			'color': secondColor
		}
	});
	tempGame.save();
	checkPlay(data);
});



socket.on('answerChallenge', function(data) {
	User.findOne({
		'username': firstUser
	}, function(err, usr1) {
		User.findOne({
			'username': secondUser
		}, function(err, usr2) {
			if (data['answer'] && !usr1['playing'] && !usr2['playing']) {
				usr1['playing'] = usr2['playing'] = true;
				usr1.save();
				usr2.save();
				isRunning = true;
				tempGame['isRunning'] = isRunning;
				tempGame.save();
			} else {
				socket.emit('busyPlayer');
			}
		});
	});
});


socket.on('endGame', function(data) {
	isRunning = false;
	tempGame['isRunning'] = isRunning;
	User.findOne({
		'username': firstPlayer
	}, function(err, usr1) {
		User.findOne({
			'username': secondPlayer,
			function(err, usr2) {
				usr1['playing'] = usr2['playing'] = false;
				usr1.save();
				usr2.save();
			}
		});
	});
	tempGame.save();
});
