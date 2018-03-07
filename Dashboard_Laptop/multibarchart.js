
class Bar {
	
	constructor(
		div_id,
		width, height, 
		margin={"top":0, "left":0, "right":0, "bottom":0},
		name=["Amazon", "IMDb", "Yelp"],
		color={"negative":"#B71C1C","positive":"#1B5E20"},
		file="Data/bar.json"
		) {
			
			this.div_id = div_id;
			this.width = width;
			this.height = height;
			this.animation_duration = 2000;
			this.margin = margin;
			this.color = color;
			this.file = file;
			this.name = name;
			this.data = [];
			
			// Data.
			var obj = this;
			
			d3.json(this.file, function(error, data)
			{
				if (error) throw error;

				obj.data.push({"name":"Amazon", "negative":data.amazon.negative, "positive":data.amazon.positive});
				obj.data.push({"name":"IMDb", "negative":data.imbd.negative, "positive":data.imbd.positive});
				obj.data.push({"name":"Yelp", "negative":data.yelp.negative, "positive":data.yelp.positive});
				
				obj.width = obj.width - obj.margin.left - obj.margin.right;
				obj.height = obj.height - obj.margin.top - obj.margin.bottom;
				
				obj.draw_bar();
			});
				
		}
		
		draw_bar()
		{
			var svg = d3.select(this.div_id)
				.attr("width", this.width + this.margin.left + this.margin.right)
				.attr("height", this.height + this.margin.top + this.margin.bottom)
				.append("g")
				.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
			
			var obj = this;
			
			// Transpose the data into layers
			var dataset = d3.layout.stack()(['negative', 'positive'].map(function(sent) {
				return obj.data.map(function(data) {
					return {x: data.name, y: +data[sent]};
				});
			}));
			
			// Set x, y and colors
			var x = d3.scale.ordinal()
				.domain(dataset[0].map(function(d) { return d.x; }))
				.rangeRoundBands([10, this.width-10], 0.25);

			var y = d3.scale.linear()
				.domain([0, d3.max(dataset, function(d) {  return d3.max(d, function(d) { return d.y0 + d.y; });  })])
				.range([this.height, 0]);
			
			// Define and draw axes
			var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left")
				.ticks(2)
				.tickSize(-this.width, 0, 0)
				.tickFormat( function(d) { return d } );

			var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom")
				.tickFormat(function(d) { return d } );
			
			svg.append("g")
				.attr("class", "y axis")
				.call(yAxis);

			var x_ticks = svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + this.height + ")")
				.call(xAxis);
				
			var colors = [obj.color.negative, obj.color.positive];
				
			// Create groups for each series, rects for each segment 
			var groups = svg.selectAll("g.cost")
				.data(dataset)
				.enter().append("g")
				.attr("class", "cost")
				.style("fill", function(d, i) { return colors[i]; });

			var rect = groups.selectAll("rect")
				.data(function(d) { return d; })
				.enter()
				.append("rect")
				.on("mouseover", function() { tooltip.style("display", null); })
				.on("mouseout", function() { tooltip.style("display", "none"); })
				.on("mousemove", function(d) {
					var xPosition = d3.mouse(this)[0] - 15;
					var yPosition = d3.mouse(this)[1] - 25;
					tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
					tooltip.select("text").text(d.y);
				})
				.style("opacity", 0.0)
				.attr("y", 0)
				.attr("x", function(d) { return x(d.x); })
				.attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
				.attr("width", x.rangeBand())
					.transition().duration(obj.animation_duration)
				.style("opacity", 1.0)
				.attr("y", function(d) { return y(d.y0 + d.y); });
				
				// Draw legend
				var legend = svg.selectAll(".legend")
					.data(colors)
					.enter().append("g")
					.attr("class", "legend")
					.attr("transform", function(d, i) { return "translate(30," + i * 19 + ")"; });

				legend.append("rect")
					.attr("x", obj.width - 18)
					.attr("width", 18)
					.attr("height", 18)
					.style("fill", function(d, i) {return colors.slice().reverse()[i];});

				legend.append("text")
					.attr("x", obj.width + 5)
					.attr("y", 9)
					.attr("dy", ".35em")
					.style("font-family", "'Helvetica', Helvetica, Arial, sans-serif")
					.style("text-anchor", "start")
					.text(function(d, i) { 
						switch (i) {
							  case 0: return "Negative";
							  case 1: return "Positive";	
						}
					});


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
				
			d3.select(this.div_id)
				.select(".x")
				.selectAll("line")
				.remove();
		}
}
