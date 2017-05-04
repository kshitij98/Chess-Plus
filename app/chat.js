var User = require('../app/models/user');
var Game = require('./models/game');
var Messages = require('../app/models/message');

module.exports = function(io, socket) {
	console.log('user connected..!! ');
	var socketDetails = socket.request.user;
	socket.join(socketDetails['username']);
	var user;
	var msg = {};
	User.findOne({
		'username': socketDetails['username']
	}, function(err, data) {
		//user = data;
	if(data){

		data['sessionCount'] += 1;
		data.save();
		
		user = {
			name: data['firstName'] + " " + data['lastName'],
			username: socketDetails['username'],
			profilePicture: data['profilePicture'],
			status: (data['sessionCount'] > -1) ? true : false,
			friends: [],
			sessionCount: data['sessionCount'],
			theme: data['theme']
		};

		// if (!data['friends'].length)
		// 	socket.emit('online', user);

		// fetching friends from the database and much more...
		var friendCount = data['friends'].length;
		var usernameToIndex = {};
		var currIndex = 0;
		var timer = 0;
		for (var i = 0; i < data['friends'].length; i++) {
			User.findOne({
				'_id': data['friends'][i] + ''
			}, function(err, friend) {
				--friendCount;
				var temp = {
					name: friend.firstName + " " + friend.lastName,
					profilePicture: friend.profilePicture,
					status: ((friend['sessionCount'] > 0) ? true : false),
					username: friend.username,
					unread: 0,
					lastMessage: -1,
					firstName: friend.firstName,
					lastName: friend.lastName,
					rating: friend.rating
				};


				// TODO: Emit 'userOnline' to friend.username
				io.to(friend.username).emit('userOnline', {
					'username': socketDetails['username'],
					'name': user.name,
					'profilePicture': user.profilePicture,
				});

				usernameToIndex[friend.username] = currIndex++;
				user['friends'].push(temp);

				if (!friendCount) {
					Messages.find({
						$or: [{
							'from': socketDetails['username']
						}, {
							'to': socketDetails['username']
						}]
					}, null, {
						time: -1
					}, function(err, dataMsg) {

						for (var j = 0; j < dataMsg.length; ++j) {
							var sender = dataMsg[j]['from'];
							var receiver = dataMsg[j]['to'];

							if (!msg[sender])
								msg[sender] = {
									'messages': []
								};
							if (!msg[receiver])
								msg[receiver] = {
									'messages': []
								};
							if (sender == socketDetails['username'])
								msg[receiver]['messages'].push(dataMsg[j]);

							if (receiver == socketDetails['username']) {
								msg[sender]['messages'].push(dataMsg[j]);
								if (!msg[sender]['unread'])
									msg[sender]['unread'] = 0;
								msg[sender]['unread'] += (dataMsg[j]['read'] ? 0 : 1);
								user['friends'][usernameToIndex[sender]].unread = msg[sender][
									'unread'
								];
								user['friends'][usernameToIndex[sender]].lastMessage = ++timer;
							}
						}

						// socket.emit('online', user);
					});
				}
			});
		}

		socket.on('get data', function() {
			socket.emit('online', user);
		});

		socket.on('logout', function() {
			data['sessionCount'] = 1;
			data.save();
			user['sessionCount'] = 0;
			for (var i = 0; i < user['friends'].length; i++) {
				io.to(user['friends'][i]['username']).emit('userOffline', {
					'username': socketDetails['username']
				});
			}
			console.log(socket.id);
			console.log('data[sessionCount] = ', data['sessionCount']);
		});
	}
	});

	// Search
	socket.on('searchByUsername', function(username) {
		User.find({
			username: {
				"$regex": username
			}
		}, function(err, data) {
			var result = [];
			for (user in data) {
				result.push({
					username: data[user].username,
					rating: data[user].rating,
					profilePicture: data[user].profilePicture,
					firstName: data[user].firstName,
					lastName: data[user].lastName
				});
			}
			// Order By username length
			result.sort(function(a, b) {
				return a.username.length - b.username.length
			});
			socket.emit('searchResultByUsername', result);
		});
	});

	socket.on('challengeSearch', function(username) {
		var result = [];
		if (user['friends']) {
			for (var i = 0; i < user['friends'].length; i++) {
				var friend = user['friends'][i];
				if (friend.username.includes(username)) {
					result.push({
						username: friend.username,
						firstName: friend.firstName,
						lastName: friend.lastName,
						profilePicture: friend.profilePicture,
						onlineStatus: (friend.sessionCount > 0),
						rating: friend.rating,
					});
				}
			}
			// Order By username length
			result.sort(function(a, b) {
				return a.username.length - b.username.length
			});
		}
		console.log(result);
		socket.emit('challengeSearchResult', result);
	});

	socket.on('searchFriendsForChat', function(username) {
		var result = [];
		for (var i = 0; i < user['friends'].length; i++) {
			var friend = user['friends'][i];
			result.push({
				username: friend.username,
				firstName: friend.firstName,
				lastName: friend.lastName,
				profilePicture: friend.profilePicture,
				onlineStatus: (friend.sessionCount > 0),
				unreadCount: friend.unreadCount
			});
		}
		socket.emit('friendsChatResult', result);
	});

	socket.on('getMessages', function(data) {
		// get requested user's messages in ='messages'= variable && do preprocessing
		// sort(messages)
		// ===============  Messages.insert();
		// console.log("getMessages: ", data);
		// console.log(msg);
		socket.emit('receiveMessage', msg[data['username']]);
	});


	socket.on('message', function(data) {
		// store message   ==============
		console.log("###", data);

		if (!msg[data.sender])
			msg[data.sender] = {
				'messages': []
			};

		if (!msg[data.receiver])
			msg[data.receiver] = {
				'messages': []
			};

		data.message = data.message.replace(/&/g, '&amp;').replace(/</g, '&lt;');
		console.log("onNewMessage: ", msg);
		var tempMsg = new Messages({
			'from': data['sender'],
			'to': data['receiver'],
			'message': data['message']
		});
		msg[data.sender]['messages'].push(tempMsg);
		msg[data.receiver]['messages'].push(tempMsg);

		tempMsg.save(function(err) {
			if (err) {
				return err;
			} else {
				console.log("Post saved");
			}
		});
		socket.broadcast.to(socket.request.user['username']).emit('own message',
			data);
		io.to(data['receiver']).emit('newMessage', data);
	});


	// ON disconnect............
	socket.on('disconnect', function() {
		User.findOne({
			'username': socketDetails['username']
		}, function(err, data) {
			console.log("data[sessionCount] = ", data['sessionCount']);
			--data['sessionCount'];
			data.save(function(err){
				if(err){
					console.log('session count error');
				}
			});
			user['sessionCount'] = data['sessionCount'];
			// data.save();
			console.log("oops" + data['sessionCount']);
			if (user['sessionCount'] == 0) {
				for (var i = 0; i < user['friends'].length; i++) {
					console.log(i, "emitting...");
					io.to(user['friends'][i]['username']).emit('userOffline', {
						'username': socketDetails['username'],
						'name': user['name']
					});
				}

				setTimeout(function() {
					User.findOne({
						'username': socketDetails['username'],
						'sessionCount': 0
					}, function(err, user) {
						if (user) {
							Game.findOne({
								'firstPlayer.username': socketDetails['username'],
								'secondPlayer.username': null,
								isRunning: true
							}, function(err, game) {
								if (game) {
									require('../app/gameEnd.js').onAI(socketDetails['username']);
								}
							});

							Game.findOne({
								$or: [{
									'firstPlayer.username': socketDetails['username'],
									'secondPlayer.username': {
										"$ne": null
									},
									isRunning: true
								}, {
									'firstPlayer.username': {
										"$ne": null
									},
									'secondPlayer.username': socketDetails['username'],
									isRunning: true
								}]
							}, function(err, game) {
								if (game && game.firstPlayer.username == socketDetails[
										'username']) {
									require('../app/gameEnd.js').onWin(game.secondPlayer.username,
										socketDetails['username']);
								} else if (game) {
									require('../app/gameEnd.js').onWin(game.firstPlayer.username,
										socketDetails['username']);
								}
							});
						}
					});

				}, 3000);

			}
			socket.leave(socketDetails['username']);
			console.log('disconnected..');
		});
	});

	socket.on('updateMsg', function(data) {
		if (!msg[data.sender])
			msg[data.sender] = {
				'messages': []
			};

		if (!msg[data.receiver])
			msg[data.receiver] = {
				'messages': []
			};

		var temp = {
			'from': data.sender,
			'to': data.receiver,
			'message': data.message
		};

		msg[data.sender]['messages'].push(temp);
		msg[data.receiver]['messages'].push(temp);
	});

	socket.on('setRead', function(data) {
		console.log('setRead: ', data);

		Messages.find({
			'from': user['username'],
			'to': data['receiver'],
			read: false
		}).then(function(dataArray) {
			dataArray.forEach(function(data) {
				data['read'] = true;
				data.save();
			});
		});
		Messages.find({
			'to': user['username'],
			'from': data['receiver'],
			read: false
		}).then(function(dataArray) {
			dataArray.forEach(function(data) {
				data['read'] = true;
				data.save();
			});
		});

		io.to(data.receiver).emit('friendRead', data);
	});

	socket.on('startedTyping', function(data) {
		console.log('startedTyping', data);
		io.to(data['receiver']).emit('friendStartedTyping', data);
	});

	socket.on('stoppedTyping', function(data) {
		console.log('stoppedTyping', data);
		io.to(data['receiver']).emit('friendStoppedTyping', data);
	});
};
