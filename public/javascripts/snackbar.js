$(function() {
	var acceptRequestOf = '',
		challengeAcceptedHandler = function() {
			console.log('Accepted');
			socket.emit('accept challenge', acceptRequestOf);
		},
		snackbarContainer = document.querySelector('#demo-snackbar-example'),
		snackbarData = {
			message: 'Someone has challenged you.',
			timeout: 5000,
			actionHandler: challengeAcceptedHandler,
			actionText: 'Accept'
		};

	$('.declineButton').click(function() {
		console.log('Declined.');
		$('#demo-snackbar-example').removeClass('mdl-snackbar--active');
	});

	socket.on('received challenge', function(response) {
		console.log(response);

		acceptRequestOf = response.username;
		snackbarData.message = response.firstName + ' ' + response.lastName +
			' (@' + response.username + ') has challenged you.';

		console.log('New challenge request from ', response);
		$('#demo-snackbar-example').removeClass('mdl-snackbar--active');
		snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	});

	socket.on('2p game started', function() {
		$(location).attr('href', '/play');
	});
});