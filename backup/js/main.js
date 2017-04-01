window.onload = function() {
	var divs = $('.quoteBox').hide();
	var king = $('.king');
	var background = $('.background');
	var moved = false;

	var setSize = function() {
		width = $(window).width();
		height = $(window).height();
		r = Math.sqrt(width * width + height * height);
	};
	$(window).resize(setSize);

	king.trigger('click');
	var width = 0;
	var height = 0;
	var r = 0;
	setSize();
	var colour = ["#FF003D", "#9C27B0", "#F44336", "#FF5722"];
	colour = shuffle(colour);
	var currColour = 0;

	function shuffle(array) {
		var currentIndex = array.length, temporaryValue, randomIndex;
	
		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
		
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
	
		return array;
	}

	var e = new jQuery.Event("click");
	e.pageX = width/2;
	e.pageY = height/2;
	console.log(e);

    var indices = [];
    for (i=0 ; i<divs.length ; ++i)
    	indices.push(i);

    i=0;
    shuffle(indices);
	var cycle = function() { 
	    divs.eq(indices[i]).fadeIn(200).delay(3000).fadeOut(200, cycle);
	
	    i = ++i % divs.length;
	};

	king.click(function(e) {
		var circle = $("<div unselectable='on' id='circle'></div>");
		background.append(circle);
		circle.css({
			"z-index": -1,
			position: 'absolute',
			'background-color': colour[currColour % 4],
			width: 0,
			height: 0,
			"border-radius": "50%",
			left: e.pageX,
			top: e.pageY,
			'margin-left': 0,
			'margin-top': 0,
			'webkit-user-select': 'none',
			'-moz-user-select': 'none',
			'-ms-user-select': 'none'
		});
		currColour = currColour + 1;
		circle.animate({	
			width: (r * 2),
			height: (r * 2),
			'margin-left': -r,
			'margin-top': -r
		}, 
		{
			duration: 600,
			easing: "easeInOutCubic",
			queue: false,
			complete: function() {
				circle.parent().css('background-color', $(this).css('background-color'));
				circle.detach();
				if (moved == false) {
					moved = true;
					cycle();
				}
			}
		});
	});
	king.addClass('king-active');
	king.trigger(e);
};