var renderChatList = function(contacts) {
	$('.contactsWrapper').empty();
	for (contact of contacts) { 
		$('.contactsWrapper').append('<div class="contact" id="user_' + contact.username + '"><img src="/uploads/' + contact.profilePicture + '.jpg" alt="" class="contact__photo" /><span class="contact__name">' + contact.name + '</span>' + (contact.unread > 0 ? '<span class="unreadBadge" badge-data="' + contact.unread + '"> </span>' : ' ') + '<span class="contact__status ' + (contact.status ? 'online' : ' ') + '"> </span></div>');      
	}
};

$(function() {
	var $svg = $(".sidebar"),
		$chatBar = $(".chatBar"),
		$path = $(".s-path"),
		$sCont = $(".sidebar-content"),
		$chat = $(".chat"),
		chatBarTop = $chatBar.offset().top,
		chatBarLeft = $chatBar.offset().left,
		diffX = 0,
		curX = 0,
		finalX = 0,
		frame = 1000 / 60,
		animTime = 600,
		sContTrans = 200,
		animating = false,
		height = $(window).height(),
		receiverUsername,
		startedTyping = false,
		lastMsg = undefined;

	var startD = createD(64,0,1),
		midD = createD(125,75,0),
		finalD = createD(200,0,1),
		clickMidD = createD(300,80,0),
		clickMidDRev = createD(200,100,1),
		clickD = createD(300,0,1),
		currentPath = startD;
		$path.attr({ "d": startD });

	socket.emit('get data');
	
	var resizePath = function(path) {
		if (path === undefined)
			return;
		path = path.replace(/,(\d+) 0 1,/gi, "," + (height >> 1) + " 0 1,");
		path = path.replace(/0,(\d+) L0,(\d+)/gi, "0," + height + " L0," + height);
		return path;
	}

	var updatePathHeight = function() {
		height = $(window).height();
		var d = $path.attr("d");
		$path.attr({ "d": resizePath(d) });
		startD = resizePath(startD);
		midD = resizePath(midD);
		finalD = resizePath(finalD);
		clickMidD = resizePath(clickMidD);
		clickMidDRev = resizePath(clickMidDRev);
		clickD = resizePath(clickD);
		currentPath = resizePath(currentPath);
	};

	var easings = {
		smallElastic: function(t,b,c,d) {
			var ts = (t/=d)*t;
			var tc = ts*t;
			return b + c * (33*tc*ts + -106*ts*ts + 126*tc + -67*ts + 15*t);
		},
		inCubic: function(t,b,c,d) {
			var tc = (t/=d) * t * t;
			return b + c*(tc);
		}
	};

	function createD(top, ax, dir) {
		return "M0,0 " + top + ",0 a" + ax + "," + (height>>1) + " 0 1," + dir + " 0," + height + " L0," + height;
	}

	function newD(num1, num2) {
		var d = $path.attr("d"),
			num2 = num2 || ((height>>1)).toString(),
			nd = d.replace(/\ba(\d+),(\d+)\b/gi, "a" + num1 + "," + num2);
		return nd;
	}

	function animatePathD(path, d, time, handlers, callback, easingTop, easingX) {
		var steps = Math.floor(time / frame),
			curStep = 0,
			oldArr = currentPath.split(" "),
			newArr = d.split(" "),
			oldLen = oldArr.length,
			newLen = newArr.length,
			oldTop = +oldArr[1].split(",")[0],
			topDiff = +newArr[1].split(",")[0] - oldTop,
			nextTop,
			nextX,
			easingTop = easings[easingTop] || easings.smallElastic,
			easingX = easings[easingX] || easingTop;

		$(document).off("mousedown mouseup");

		function animate() {
			curStep++;
			nextTop = easingTop(curStep, oldTop, topDiff, steps);
			nextX = easingX(curStep, curX, finalX-curX, steps);
			oldArr[1] = nextTop + ",0";
			oldArr[2] = "a" + Math.abs(nextX) + "," + (height>>1);
			oldArr[4] = (nextX >= 0) ? "1,1" : "1,0";
			$path.attr("d", oldArr.join(" "));
			if (curStep > steps) {
				curX = 0;
				diffX = 0;
				$path.attr("d", d);
				currentPath = d;
				if (handlers) handlers1();
				if (callback) callback();
				return;
			}
			requestAnimationFrame(animate);
		}
		animate();
	}

	function handlers1() {
		$(document).on("mousedown touchstart", ".s-path", function(e) {
			var startX =  e.pageX || e.originalEvent.touches[0].pageX;

			$(document).on("mousemove touchmove", function(e) {
				var x = e.pageX || e.originalEvent.touches[0].pageX;
				diffX = x - startX;
				if (diffX < 0) diffX = 0;
				if (diffX > 300) diffX = 300;
				curX = Math.floor(diffX/2);
				$path.attr("d", newD(curX));
			});
		});

		$(document).on("mouseup touchend", function() {
			$(document).off("mousemove touchmove");
			if (animating) return;
			if (!diffX) return;
			if (diffX < 40) {
				animatePathD($path, newD(0), animTime, true);
			}
			else {
				animatePathD($path, finalD, animTime, false, function() {
					$sCont.addClass("active");
					$('.mainContent').css({'width': 'calc(100% - 200px)', 'left': '200px'});
					$('.contactsWrapper').addClass("active");
					setTimeout(function() {
						$(document).on("click", closeSidebar);
					}, sContTrans);
				});
			}
		});
	}

	handlers1();

	function closeSidebar(e) {
		if ($(e.target).closest(".sidebar-content").length || $(e.target).closest(".chat").length) return;
		if (animating) return;
		animating = true;
		$sCont.removeClass("active");
		$('.mainContent').css({'width': 'calc(100% - 64px)', 'left': '64px'});
		$('.contactsWrapper').removeClass("active");
		$chat.removeClass("active");
		$(".cloned").addClass("removed");
		finalX = -75;
		setTimeout(function() {
			animatePathD($path, midD, animTime/3, false, function() {
				$chat.hide();
				$(".cloned").remove();
				finalX = 0;
				curX = -75;
				animatePathD($path, startD, animTime/3*2, true);
				animating = false;
			}, "inCubic");
		}, sContTrans);
		$(document).off("click", closeSidebar);
	}

	function moveImage(that) {
		$('.contact__photo, .contact__status, .unreadBadge').fadeOut(300).delay(300).fadeIn(300)
		var $img = $(that).find(".contact__photo"),
			top = $img.offset().top - chatBarTop,
			left = $img.offset().left - chatBarLeft,
			$clone = $img.clone().addClass("cloned");

		$clone.css({top: top, left: left});
		$chatBar.append($clone);
		$clone.css("top");
		$clone.css({top: "1.8rem", left: "1.4rem"});
		$('.colourStatus').addClass('yes');
	}

	$(document).on("click", ".contact", function(e) {
		if (animating) return;
		$('.cloned').remove();
		animating = true;
		$(document).off("click", closeSidebar);
		var that = this,
			name = $(this).find(".contact__name").text(),
			online = $(this).find(".contact__status").hasClass("online");
		
		$(this).find('.unreadBadge').remove();
		receiverUsername = $(this).attr('id').replace(/^user_/gi, '');
		$(".chat__name").text(name);

		$('#chatbar').removeClass('isOnline');
		if (online)
			$('#chatbar').addClass('isOnline');

		// $('.chat__messages').scrollTop = $('.chat__messages').scrollTop.height;
		setTimeout(function() {
			$sCont.removeClass("active");
			$('.mainContent').css({'width': 'calc(100% - 300px)', 'left': '300px'});
			$('.contactsWrapper').removeClass("active");
			startedTyping = false;
			moveImage(that);
			finalX = -80;
			setTimeout(function() {
				animatePathD($path, clickMidD, animTime/3, false, function() {
					curX = -80;
					finalX = 0;
					animatePathD($path, clickD, animTime*2/3, true, function() {
						$chat.show();
						$chat.css("top");
						$chat.addClass("active");
						animating = false;
						$(that).remove();
						$('.cloned').remove();
						$('.contactsWrapper').prepend(that);
						getMessages(receiverUsername);
						$('.chat__input').focus();
						$('.chat__messages').scrollTop($('.chat__messages')[0].scrollHeight);
					});
				}, "inCubic"); 
			}, 200);
		}, sContTrans);
	});

	$(document).on("click", ".chat__back", function() {
		$('.cloned').remove();
		if (animating) return;
		receiverUsername = '';
		animating = true;
		$chat.removeClass("active");
		$('.mainContent').css({'width': 'calc(100% - 200px)', 'left': '200px'});
		$(".cloned").addClass("removed");
		$('.colourStatus').removeClass('yes');
		$('.cloned').remove();
		setTimeout(function() {
			$(".cloned").remove();
			$chat.hide();
			finalX = 100;
			animatePathD($path, clickMidDRev, animTime/3, false, function() {
				curX = 100;
				finalX = 0;
				animatePathD($path, finalD, animTime*2/3, true, function() {
					$sCont.addClass("active");
					$('.contactsWrapper').addClass("active");
					$(document).on("click", closeSidebar);
					animating = false;
				});
			}, "inCubic");
		}, sContTrans);
	});

	$(window).on("resize", function() {
		chatBarTop = $chatBar.offset().top;
		chatBarLeft = $chatBar.offset().left;
		updatePathHeight();
	});

	$('.chat__input').keyup(function(e) {
		var text = $('.chat__input').val();
		if(e.keyCode == 13) {
			text = $.trim(text);
			if (text != '') {
				sendMessage(receiverUsername, text);
				text = text.replace(/&/g, '&amp;');
				text = text.replace(/</g, '&lt;');
				$('.chat__messages').append('<div class="chat__msgRow"><div class="chat__message mine">' + text + '</div></div>');
				$('.chat__input').val('');
				if ($('.typing').length > 0) {
					$('.typing').remove();
					$('.chat__messages').append('<div class="chat__msgRow typing"><div class="chat__message notMine"><img src="/images/typing.gif" style="height: 8px"/></div></div>');
				}
				$('.seen').remove();
				$('.chat__messages').scrollTop($('.chat__messages')[0].scrollHeight);
				lastMsg = 'mine';
			}
			text = '';
		}
		if (!startedTyping && text != '') {
			startedTyping = true;
			socket.emit('startedTyping', {
				'sender': senderId,
				'receiver': receiverUsername
			});
		}
		else if (startedTyping && text === '') {
			startedTyping = false;
			socket.emit('stoppedTyping', {
				'sender': senderId,
				'receiver': receiverUsername
			});
		}
	});

	$('.search__input').keyup(function(e) {
		var text = $('.search__inpudt').val();
		console.log(text);
		// TODO: Search text and console.log(return-value)
	});

	function sortByTime(a, b){
		if (a.lastMesssage < b.lastMesssage)
			return -1;
		if (a.lastMesssage > b.lastMesssage) 
			return 1;
		return 0;
	}

	function sortByName(a, b){
		if (a.name < b.name)
			return -1;
		if (a.name > b.name) 
			return 1;
		return 0;
	}


	// Adding chat listeners
	socket.on('connection', function(data) {
		console.log('Hello..');
	});


	var senderId;
	socket.on('online', function(data) {
		senderId = data['username'];
		// handle(data);
		console.log(data);    

		data['friends'].sort(sortByTime);
		var timeSortedContacts = [];
		for (var i=0 ; i<data['friends'].length ; ++i) {
			timeSortedContacts.push(data['friends'][i]);
			// socket.emit()
		}

		data['friends'].sort(sortByName);
		nameSortedContacts = [];
		for (var i=0 ; i<data['friends'].length ; ++i)
			nameSortedContacts.push(data['friends'][i]);
	
		var contacts = [];
		for (var i=data['friends'].length-1 ; i>=0 ; --i) {
			if (timeSortedContacts[i].unread > 0)
				contacts.push(timeSortedContacts[i]);
		}
		for (var i=0 ; i<data['friends'].length ; ++i) {
			if (nameSortedContacts[i].status === true && nameSortedContacts[i].unread === 0)
				contacts.push(nameSortedContacts[i]);
		}

		renderChatList(contacts); 
	});


	socket.on('disconnect', function() {
		console.log('disconnect');
	});

	socket.on('own message', function(data) {
		$('.chat__messages').append('<div class="chat__msgRow"><div class="chat__message mine">' + data.message + '</div></div>');
		socket.emit('updateMsg', data);
		if ($('.typing').length > 0) {
			$('.typing').remove();
			$('.chat__messages').append('<div class="chat__msgRow typing"><div class="chat__message notMine"><img src="/images/typing.gif" style="height: 8px"/></div></div>');
		}
		$('.seen').remove();
		$('.chat__messages').scrollTop($('.chat__messages')[0].scrollHeight);
		lastMsg = 'mine';
	});

	// data = {username, name, profilePicture}
	socket.on('userOnline', function(data) {
		console.log("userOnline: ", data);

		var newContact = '<div class="contact" id="user_' + data.username + '"><img src="/uploads/' + data.profilePicture + '.jpg" alt="" class="contact__photo" /><span class="contact__name">' + data.name + '</span>' + (data.unread > 0 ? '<span class="unreadBadge" badge-data="' + data.unread + '"> </span>' : ' ') + '<span class="contact__status online"> </span></div>'

		if (receiverUsername === data.username)
			$('#chatbar').addClass('isOnline');
		if ($('#user_' + data.username).length > 0)
			$('#user_' + data.username + ' .contact__status').addClass('online');
		else
			$('.contactsWrapper').append(newContact);
	});


	// data = {username, name}
	socket.on('userOffline', function(data) {
		console.log("userOffline: ", data);

		$('#user_' + data.username + ' .contact__status').removeClass('online');
		if ($('#user_' + data.username + ' .unreadBadge').length == 0 && receiverUsername != data.username)
			$('#user_' + data.username).remove();
		else if (receiverUsername === data.username)
			$('#chatbar').removeClass('isOnline');
	});


	socket.on('receiveMessage', function(data) {
		$('.chat__messages').empty();
		console.log("receiveMessage:", data);
		if (data) {
			for (currMessage of data.messages) {
				// console.log(currMessage);
				if (receiverUsername === currMessage.to)
					$('.chat__messages').append('<div class="chat__msgRow"><div class="chat__message mine">' + currMessage.message + '</div></div>');
				else
					$('.chat__messages').append('<div class="chat__msgRow"><div class="chat__message notMine">' + currMessage.message + '</div></div>');      
			}
			console.log('me', data.messages[data.messages.length-1]);
			$('.seen').remove();
			if (data.messages[data.messages.length-1].from === senderId && data.messages[data.messages.length-1].read === true) {
				lastMsg = 'mine';
				$('.chat__messages').append('<img src="/images/seen.png" class="seen"></div>');
			}

			$('.chat__messages').scrollTop($('.chat__messages')[0].scrollHeight);
		}
	});

	// send Message to a specific user
	var sendMessage = function(receiverId, message) {
		var data = {
			'sender': senderId,
			'receiver': receiverId,
			'message': message
		};
		console.log(data);
		socket.emit('message', data);
	};


	var logout = function() {
		console.log('bye');
		//socket.emit('logout', {});
		$.get('http://localhost:8080/logout');
	};


	var getMessages = function(data) {
		console.log("getMessages from", data);
		setRead(receiverUsername);
		socket.emit('getMessages', {
			'username': data
		});
	}


	var setRead = function(data) {
		socket.emit('setRead', {
			'sender': senderId,
			'receiver': data
		});
	};


	socket.on('newMessage', function(data) {
		console.log(data);
		var audioElement = document.getElementById("newMessageAudio");
		console.log(audioElement);
		audioElement.play();

		if (data.sender != receiverUsername) {
			// TODO: Clean this: use 'this'
			if ($('#user_' + data.sender + ' .unreadBadge').length > 0)
				$('#user_' + data.sender + ' .unreadBadge').attr('badge-data', parseInt($('#user_' + data.sender + ' .unreadBadge').attr('badge-data')) + 1);
			else {
				$('<span class="unreadBadge" badge-data="1"> </span>').insertAfter('#user_' + data.sender + ' .contact__name')
			// $('#user_' + data.sender + ' .contact__name')
			}
		}
		else {
			lastMsg = 'notMine';
			$('.chat__messages').append('<div class="chat__msgRow"><div class="chat__message notMine">' + data.message + '</div></div>');
			$('.chat__messages').scrollTop($('.chat__messages')[0].scrollHeight);
			$('.seen').remove();

			setRead(receiverUsername);
		}

		socket.emit('updateMsg', data);
		//socket.emit('storeNew');
		// newMessageHandler(data);
	});

	socket.on('friendStartedTyping', function(data) {
		console.log('friendStartedTyping');
		if (receiverUsername === data.sender) {
			$('.chat__messages').append('<div class="chat__msgRow typing"><div class="chat__message notMine"><img src="/images/typing.gif" style="height: 8px"/></div></div>');
			$('.chat__messages').scrollTop($('.chat__messages')[0].scrollHeight);
		}
	});

	socket.on('friendStoppedTyping', function(data) {
		console.log('friendStoppedTyping');
		if (receiverUsername === data.sender) {
			$('.typing').remove();
		}
	});

	socket.on('friendRead', function(data) {
		$('.seen').remove();
		if (receiverUsername === data.sender && lastMsg === 'mine') {
		console.log('Seen: ', data);
			$('.chat__messages').append('<img src="/images/seen.png" class="seen"></div>');
			$('.chat__messages').scrollTop($('.chat__messages')[0].scrollHeight);
		}
	})
});