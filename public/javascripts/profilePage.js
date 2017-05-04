$(function() {
	console.log("Attached.");
	$('.card_circle').mouseover(function() {
		$('.hoverText').css({'opacity': '0'});
	});
	$('.card_circle').mouseout(function() {
		$('.hoverText').css({'opacity': '1'});
	});
});