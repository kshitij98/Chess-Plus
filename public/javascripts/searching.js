var disableCover = function() {
	$('.cover-dashboard').removeClass('enabled');
	$('.mainContent').css('filter', 'blur(0px)');
	$('.spinner').css('visibility', 'hidden');
	$('.searching-text').removeClass('enabled');
	myFunction();
}

var enableCover = function() {
	$('.mainContent').css('filter', 'blur(2px)');
	$('.cover-dashboard').addClass('enabled');
	$('.searching-text').addClass('enabled');
	$('.spinner').css('visibility', 'visible');
}

function myFunction() {
	// Get the snackbar DIV
	var x = document.getElementById("snackbar")

	// Add the "show" class to DIV
	x.className = "show";

	// After 3 seconds, remove the show class from DIV
	setTimeout(function() {
		x.className = x.className.replace("show", "");
	}, 3000);
}
