var move = function() {
	var ele1 = $('#scrollMap1');
	var ele2 = $('#scrollMap2');
	ele1.css('height', height + 'px');
	ele2.css('height', height + 'px');

	var p1 = parseInt(ele1.css('left'));
	var p2 = parseInt(ele2.css('left'));

	//var delta = 10;
	//var interval = 200;

	if (p2 <= 0) {
		p1 = 0;
		p2 = parseInt(height * (2.0625));
	} else {
		p1 -= 5;
		p2 -= 5;
	}
	ele1.css('left', p1);
	ele2.css('left', p2);
};

var step = function() {
	// console.log(window.innerWidth);
	// width = window.innerWidth;
	// height = window.innerHeight;
	var ele2 = $('#scrollMap2');
	var ele1 = $('#scrollMap1');
	ele2.css('left', (height * (2.0625) + 'px'));
	ele1.css('height', height + 'px');
	ele1.css('left', (0 + 'px'));
	// ele1.css('width', width + 'px');
	ele2.css('height', height + 'px');
	// ele2.css('width', width + 'px');
	setInterval(move, 30);
};
// var updateLeft = function() {
// $('#scrollMap2').css('left', (height * (2.0625) + 'px' + $('#scrollMap1').css(
// 'left', (0 + 'px'));));
// }
step();
};
