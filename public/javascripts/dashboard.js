$(function() {
	let $drawer = $('.drawer .content');
	var challenging = false;

	$('.field').on('focus', function() {
		$drawer.empty();
		$('.searchBox').addClass('is-focus');
		$('.dashboard').css({
			'filter': 'blur(3px)'
		});
		$('.background').css({
			'filter': 'blur(3px)'
		});
		$('.drawer').addClass('active');
		if (challenging === false) {
			$('.title').html('Search for a user');
			challenging = false;
		}
	});

	$('#challengeFriend').click(function() {
		$('.field').focus();
		$('.title').html('Challenge a friend');
		challenging = true;
	});

	$('.mainContent').click(function(event) {
		if (!$(event.target).is('#challengeFriend *') && !$(event.target).is(
				'.drawer *') && !$(event.target).is('.drawer') && !$(event.target).is(
				'.field')) {
			challenging = false;
			$('.searchBox').removeClass('is-focus is-type');
			$('.dashboard').css({
				'filter': 'blur(0px)'
			});
			$('.background').css({
				'filter': 'blur(0px)'
			});
			$('.drawer').removeClass('active');
		}
	});

	$('.field').on('keyup', function(event) {
		var text = $(this).val();
		text = text.trim();
		if (text) {
			if (challenging)
				socket.emit('challengeSearch', text);
			else
				socket.emit('searchByUsername', text);
		}
		$('.searchBox').addClass('is-type');
		if ((event.which === 8) && $(this).val() === '') {
			$('.searchBox').removeClass('is-type');
			$drawer.empty();
		}
	});

	socket.on('searchResultByUsername', function(data) {
		$drawer.empty();
		$('.searchBox').removeClass('is-type');
		data.forEach(function(result) {
			console.log(result);
			$drawer.append('<div class="searchResult"> \
						<a href="profile/' +
				result.username + '"><img class="dProfilePic" src="/uploads/' +
				result.profilePicture +
				'.jpg"/> </a> \
						<div class="dText dName">' + result.firstName +
				' ' + result.lastName +
				'</div> \
						<div class="dText dUsername">@' + result.username +
				'</div> \
						<div class="dText dRating">' + result.rating +
				'</div> \
					</div>')
		});
		if (!data.length) {
			$drawer.append('<div class="noResults">No users found.</div>');
		}
	});

	socket.on('challengeSearchResult', function(data) {
		$drawer.empty();
		$('.searchBox').removeClass('is-type');
		data.forEach(function(result) {
			console.log(result);
			opponent = result.username;
			$drawer.append(
				'<div class="searchResult"> \
						<div style="cursor: pointer;" onclick="sendChallengeRequest(opponent);"><img class="dProfilePic" src="/uploads/' +
				result.profilePicture +
				'.jpg"/> </div> \
						<div class="dText dName">' + result.firstName +
				' ' + result.lastName +
				'</div> \
						<div class="dText dUsername">@' + result.username +
				'</div> \
						<div class="dText dRating">' + result.rating +
				'</div> \
					</div>')
		});
		if (!data.length) {
			$drawer.append('<div class="noResults">No users found.</div>');
		}
	});

	// socket.emit('searchFriendsForChat', text);
	// socket.on('friendsChatResult', function(data){

	// })
	$('#startAIButton').on("click", function() {
		console.log('AI Game to start');
		socket.emit('start ai');
	});

	$('#randomOpponent').click(function() {
		socket.emit('quick play');
		enableCover();
		setTimeout(function() {
			disableCover()
		}, 10 * 1000);
		// console.log(snackbarData);
		// snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	});

	socket.on('ai game started', function() {
		$(location).attr('href', '/practise');
	});

	socket.on('game started', function(data) {
		console.log('START GAME');
	});
});
