
function barchart(data, chart_sz, svg_id = "svg_bar", margin = {left:0, top:0, right:0, bottom:0}, graph_properties = {colors:["#11AA00", "#C70039"], show:40, order:"DSC"})
{
	var svg = d3.select("body")
		.append("svg")
		.attr("id", svg_id)
		.attr("width", chart_sz.width + margin.left + margin.right)
		.attr("height", chart_sz.height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	data.sort(function(a, b)
	{ 
		var a = parseInt(a.positive) + parseInt(a.negative);
		var b = parseInt(b.positive) + parseInt(b.negative);
		return (graph_properties.order=="ASC"?(a - b):(b - a));
	});
	
	data = data.slice(1, graph_properties.show+1);
	
	// Transpose the data into layers
	var dataset = d3.layout.stack()(["positive", "negative"].map(function(sentiment)
	{
		return data.map(function(d)
		{
			return {x: d.word, y: +d[sentiment]}; // +d to get sum length of the current bar
		});
	}));

	// Set x, y and colors
	var x = d3.scale.ordinal()
		.domain(dataset[0].map(function(d) { return d.x; }))
		.rangeRoundBands([10, chart_sz.width-10], 0.02);

	var y = d3.scale.linear()
		.domain([0, d3.max(dataset, function(d) {  return d3.max(d, function(d) { return d.y0 + d.y; });  })])
		.range([chart_sz.height, 0]);


	// Define and draw axes
	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(5)
		.tickSize(-chart_sz.width, 0, 0)
		.tickFormat( function(d) { return d } );

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis);

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + chart_sz.height + ")")
		.call(xAxis);

	// Create groups for each series, rects for each segment 
	var groups = svg.selectAll("g.cost")
		.data(dataset)
		.enter().append("g")
		.attr("class", "cost")
		.style("fill", function(d, i) { return graph_properties.colors[i]; });

	// Prep the tooltip bits, initial display is hidden
	var tooltip = svg.append("g")
		.attr("class", "tooltip")
		.style("display", "none");
		
	tooltip.append("rect")
		.attr("width", 30)
		.attr("height", 20)
		.attr("fill", "white")
		.style("opacity", 0.5);

	tooltip.append("text")
		.attr("x", 15)
		.attr("dy", "1.2em")
		.style("text-anchor", "middle")
		.attr("font-size", "12px")
		.attr("font-weight", "bold");

	var rect = groups.selectAll("rect")
		.data(function(d) { return d; })
		.enter()
		.append("rect")
		.attr("x", function(d) { return x(d.x); })
		.attr("y", function(d) { return y(d.y0 + d.y); })
		.attr("height", 0)
		.attr("width", x.rangeBand())
		.on("mouseover", function() { tooltip.style("display", null); })
		.on("mouseout", function() { tooltip.style("display", "none"); })
		.on("mousemove", function(d) 
			{
				var xPosition = d3.mouse(this)[0] - 15;
				var yPosition = d3.mouse(this)[1] - 25;
				tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
				tooltip.select("text").text(d.y);
			}
		)
		.transition()
		.duration(1500)
		.delay(function(d, i) { return i * 250; }) // different delay for each bar
		.attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); });

	// Draw legend
	var legend = svg.selectAll(".legend")
		.data(graph_properties.colors)
		.enter().append("g")
		.attr("class", "legend")
		.attr("transform", function(d, i) { return "translate(30," + i * 19 + ")"; });
	 
	legend.append("rect")
		.attr("x", chart_sz.width - 18)
		.attr("width", 18)
		.attr("height", 18)
		.style("fill", function(d, i) {return graph_properties.colors.slice().reverse()[i];});
	 
	legend.append("text")
		.attr("x", chart_sz.width + 5)
		.attr("y", 9)
		.attr("dy", ".35em")
		.style("text-anchor", "start")
		.text(function(d, i)
		{ 
			switch (i)
			{
				case 0: return "Negative";
				case 1: return "Positive";
			}
		});
}