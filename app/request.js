var User = require('../app/models/user');
var Messages = require('../app/models/message');
var Request = require('../app/models/friendRequests');

module.exports = function(io, socket) {
	var socketDetails = socket.request.user;

	var makeFriends = function(firstUser, secondUser){
		//Accepts usernames of both users
		User.findOne({username: firstUser}, function(err, first){
			User.findOne({username: secondUser}, function(err, second){
				Request.findOne({first: firstUser, second: secondUser}, function(err, request){
					if(request && first && second){
						first.friends.push(second._id);
						second.friends.push(first._id);
						request.status = 1;
						request.save();
						first.save();
						second.save();
					}
				});
			});
		});
	}

	var declineRequest = function(firstUser, secondUser){
		//Accepts usernames of both users
		Request.findOne({first: firstUser, second: secondUser}, function(err, request){
			if(request){
				request.status = 2;
				request.save();
			}
		});		
	}

	var addFriend = function(data){
		User.findOne({username: socketDetails['username']}, function(err, firstUser){
			User.findOne({username: data}, function(err, secondUser){
				if(firstUser && secondUser && firstUser.username != secondUser.username){
					Request.findOne({first: firstUser.username, second: secondUser.username}, function(err, firstRequest) {
						if(firstRequest){
							if(firstRequest.status == 2){
								//was declined earlier
								firstRequest.status = 0;
								firstRequest.save(function(err){
									if(err)
										console.log(err);
								});
							}
						}
						else{
							Request.findOne({first: secondUser.username, second: firstUser.username}, function(err, secondRequest) {
								if(secondRequest && secondRequest.status == 0) makeFriends(secondUser.username, firstUser.username);	
								else if(secondRequest && secondRequest.status == 1);
								else{
									var request = new Request();
									request.first = firstUser.username;
									request.second = secondUser.username;
									request.status = 0;
									request.save(function(err){
										if(err)
											console.log(err);
									});
								}
							});
						}
					});
				}
			});
		});
	};
	socket.on('addFriend', addFriend);
	socket.on('acceptRequest', makeFriends);
	socket.on('declineRequest', declineRequest);
	// console.log(socketDetails['username']);
	// console.log(data);
};
