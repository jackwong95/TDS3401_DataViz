
function draw_wordcloud(graph_properties)
{
	graph_properties.size.height = graph_properties.size.height - graph_properties.legend_height_offset;
	
	d3.csv(graph_properties.data, function(error, data) {
		if (error) throw error;
		

		var categories = d3.keys(d3.nest().key(function(d) { return d.source; }).map(data));
		var color = d3.scale.ordinal().range(graph_properties.color);
		var fontSize = d3.scale.pow().exponent(5).domain([0,1]).range([10,80]);

		var layout = d3.layout.cloud()
			.timeInterval(10)
			.size([graph_properties.size.width, graph_properties.size.height])
			.words(data)
			.rotate(function(d) { return 0; })
			.font('monospace')
			.fontSize(function(d,i) { return fontSize(Math.random()); })
			.text(function(d) { return d.word; })
			.spiral("archimedean")
			.on("end", draw)
			.start();

		var svg = d3.select(graph_properties.svg_id)
			.attr("width", graph_properties.size.width + graph_properties.margin.left + graph_properties.margin.right)
			.attr("height", graph_properties.size.height + graph_properties.margin.top + graph_properties.margin.bottom + graph_properties.legend_height_offset)
				.append("g")
				.attr("transform", "translate(" + graph_properties.margin.left + "," + graph_properties.margin.top + ")");
		
		var wordcloud = svg.append("g")
			.attr('class','wordcloud')
			.attr("transform", "translate(" + graph_properties.size.width/2 + "," + graph_properties.size.height/2 + ")");

		var x0 = d3.scale.ordinal()
			.rangeRoundBands([0, graph_properties.size.width], .1)
			.domain(categories);

		var xAxis = d3.svg.axis()
			.scale(x0)
			.orient("bottom");

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + graph_properties.size.height + ")")
			.call(xAxis)
				.selectAll('text')
				.attr("class", "wc_text")
				.style('fill',function(d) { console.log(d); return color(d); })
				.on('click',function(d) { graph_properties.category.click(d); })
				.on('mouseover',function(d) { d3.select(this).style("fill", graph_properties.category.outline_bg); })
				.on('mouseout',function(d) { d3.select(this).style("fill", color(d)); });
				
		
		// remove x ticks
		d3.select(graph_properties.svg_id)
			.select(".axis")
			.selectAll("line").remove()
			
		// remove x ticks
		d3.select(graph_properties.svg_id)
			.select(".axis")
			.selectAll("line").remove()
		
		var prev_col = "";
		
		function draw(words)
		{
			wordcloud.selectAll("text")
				.data(words)
				.enter().append("text")
				.attr('class','word')
				.style("font-size", function(d) { return d.size + "px"; })
				.style("font-family", function(d) { return d.font; })
					.style("fill", function(d) { 
						var paringObject = data.filter(function(obj) { return obj.word === d.text});
						return color(paringObject[0].source); 
					})
					.attr("text-anchor", "middle")
					.attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
					.text(function(d) { return d.text; })
					.on("click", function(d){ graph_properties.words.click(d); })
					.on('mouseover',function(d) { prev_col = d3.rgb(d3.select(this).attr("style")); d3.select(this).style("fill", graph_properties.words.outline_bg); })
					.on('mouseout',function(d) { d3.select(this).style("fill", prev_col); });
		};
  
	});
	
}
	