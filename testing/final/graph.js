window.onload = function() {
	var chart = new CanvasJS.Chart("chartContainer", {
		title: {
			text: "Match Stats"
		},
		theme: "theme11",
		animationEnabled: true,
		axisX: {
			valueFormatString: "MM-YY",
		},
		axisY: {
			valueFormatString: "#",
			stripLines: [{
				startValue: 0,
				endValue: 20,
				color: "#ff944d"
			}, {
				startValue: 20,
				endValue: 40,
				color: "#99ff33"
			}, {
				startValue: 40,
				endValue: 60,
				color: "#f8c8fc"
			}, {
				startValue: 60,
				endValue: 80,
				color: "#e8cece"
			}, {
				startValue: 80,
				endValue: 100,
				color: "#fff89c"
			}, ]
		},
		data: [{
			type: "line",
			showInLegend: false,
			legendText: "Chess Match Statistics",
			dataPoints: [{
				x: new Date(2012, 01, 1),
				y: 71,
				indexLabel: "win",
				markerType: "triangle",
				markerColor: "#6B8E23",
				markerSize: 12
			}, {
				x: new Date(2012, 02, 1),
				y: 55,
				indexLabel: "loss",
				markerType: "cross",
				markerColor: "tomato",
				markerSize: 12
			}, {
				x: new Date(2012, 03, 1),
				y: 50,
				indexLabel: "loss",
				markerType: "cross",
				markerColor: "tomato",
				markerSize: 12
			}, {
				x: new Date(2012, 04, 1),
				y: 65,
				indexLabel: "win",
				markerType: "triangle",
				markerColor: "#6B8E23",
				markerSize: 12
			}, {
				x: new Date(2012, 05, 1),
				y: 85,
				indexLabel: "win",
				markerType: "triangle",
				markerColor: "#6B8E23",
				markerSize: 12
			}, {
				x: new Date(2012, 06, 1),
				y: 68,
				indexLabel: "loss",
				markerType: "cross",
				markerColor: "tomato",
				markerSize: 12
			}, {
				x: new Date(2012, 07, 1),
				y: 28,
				indexLabel: "loss",
				markerType: "cross",
				markerColor: "tomato",
				markerSize: 12
			}, {
				x: new Date(2012, 08, 1),
				y: 34,
				indexLabel: "win",
				markerType: "triangle",
				markerColor: "#6B8E23",
				markerSize: 12
			}, {
				x: new Date(2012, 09, 1),
				y: 24,
				indexLabel: "loss",
				markerType: "cross",
				markerColor: "tomato",
				markerSize: 12
			}, {
				x: new Date(2013, 08, 1),
				y: 34,
				indexLabel: "win",
				markerType: "triangle",
				markerColor: "#6B8E23",
				markerSize: 12
			}, {
				x: new Date(2014, 08, 1),
				y: 37,
				indexLabel: "win",
				markerType: "triangle",
				markerColor: "#6B8E23",
				markerSize: 12
			}, {
				x: new Date(2015, 05, 12),
				y: 39,
				indexLabel: "win",
				markerType: "triangle",
				markerColor: "#6B8E23",
				markerSize: 12
			}, {
				x: new Date(2015, 05, 22),
				y: 45,
				indexLabel: "win",
				markerType: "triangle",
				markerColor: "#6B8E23",
				markerSize: 12
			}, {
				x: new Date(2015, 06, 12),
				y: 80,
				indexLabel: "win",
				markerType: "triangle",
				markerColor: "#6B8E23",
				markerSize: 12
			}, {
				x: new Date(2015, 07, 12),
				y: 70,
				indexLabel: "win",
				markerType: "triangle",
				markerColor: "#6B8E23",
				markerSize: 12
			}, {
				x: new Date(2015, 08, 12),
				y: 65,
				indexLabel: "win",
				markerType: "triangle",
				markerColor: "#6B8E23",
				markerSize: 12
			}, {
				x: new Date(2015, 09, 12),
				y: 71,
				indexLabel: "win",
				markerType: "triangle",
				markerColor: "#6B8E23",
				markerSize: 12
			}, {
				x: new Date(2015, 09, 18),
				y: 73,
				indexLabel: "win",
				markerType: "triangle",
				markerColor: "#6B8E23",
				markerSize: 12
			}, {
				x: new Date(2015, 10, 12),
				y: 80,
				indexLabel: "win",
				markerType: "triangle",
				markerColor: "#6B8E23",
				markerSize: 12
			}]
		}]
	});

	chart.render();
};
