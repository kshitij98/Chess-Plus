var Stopwatch = function(options) {

	var offset;
	var clock;
	var interval;
	var formatter;

	// default options
	options = options || {};
	options.delay = options.delay || 1;


	//clock = options.clock;
	if (options.format)
		formatter = options.format;
	else
		formatter = function(sec, min, hr) {
			console.log(hr + ':' + min + ':' + sec);
		};

	// initialize
	reset();



	// start the clock

	function start() {
		if (!interval) {
			offset = Date.now();
			interval = setInterval(update, options.delay);
		}
	}

	// stop the clock

	function stop() {
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
	}

	// reset the clock

	function reset() {
		clock = 0;
		render();
	}

	// updating the current time

	function update() {
		clock += delta();
		render();
	}

	// function to format output

	function render() {
		var tym = Math.floor(clock / 1000);
		//var mili = clock % 1000;
		var sec = tym % 60;
		tym = Math.floor(tym / 60);
		var min = tym % 60;
		tym = Math.floor(tym / 60);
		var hr = tym;

		//var str = hr + ":" + min + ":" + sec; //+ ":";  mili;
		// console.log(str);  testing
		//return str;
		formatter(sec, min, hr);
	}

	// calculating change in time

	function delta() {
		var now = Date.now(),
			d = now - offset;

		offset = now;
		return d;
	}

	// setting the start time

	function set(sec = 0, min = 0, hr = 0) {
		clock = (sec + (min + hr * 60) * 60) * 1000;
	}

	// public API

	this.start = start;
	this.stop = stop;
	this.reset = reset;
	this.set = set;
};
