
function draw_multibarchart(graph_properties)
{

	var sentiment = [{key:'negative', values:[]}, {key:'positive', values:[]}];
	
	d3.json(graph_properties.data, function(error, data)
	{
		if (error) throw error;
		sentiment[0].values.push({"label":"amazon", "value":data.amazon.negative});
		sentiment[0].values.push({"label":"yelp", "value":data.yelp.negative});
		sentiment[0].values.push({"label":"imbd", "value":data.imbd.negative}); 
		sentiment[1].values.push({"label":"amazon", "value":data.amazon.positive});
		sentiment[1].values.push({"label":"yelp", "value":data.yelp.positive});
		sentiment[1].values.push({"label":"imbd", "value":data.imbd.positive}); //["label":"amazon", "value":data.amazon.negative]
		// facebook multi chart
		var chart;
		nv.addGraph(function() {
			chart = nv.models.multiBarHorizontalChart()
				.x(function(d) { return d.label })
				.y(function(d) { return d.value })
				.yErr(function(d) { return [-Math.abs(d.value * Math.random() * 0.3), Math.abs(d.value * Math.random() * 0.3)] })
				.duration(250)
				.showControls(false)
				.showLegend(false)
				.legendPosition("right")
				.controlsPosition("bottom")
				.margin(graph_properties.margin)
				.showYAxis(true)
				.showXAxis(true)
				.stacked(true)
				.width(graph_properties.size.width - graph_properties.margin.left - graph_properties.margin.right)
				.height(graph_properties.size.height - graph_properties.margin.top - graph_properties.margin.bottom)
				.color(function(d){
					if (d.key=="negative")
					{
						return graph_properties.color.negative;
					}
					return graph_properties.color.positive;
				});

			chart.yAxis.tickFormat(function(d) {
				return Math.abs(d).toFixed(0).toString();
			});

			chart.legend.dispatch.legendClick = function(d, i)
			{
				// remove the qq plot
				d3.selectAll(".nv-bar")
					.selectAll("polyline")
					.remove();
			};

			d3.select(graph_properties.svg_id+' svg')
				.datum(sentiment)
				.call(chart);

			nv.utils.windowResize(chart.update);
			
			// change font
			d3.selectAll(".nv-x .nv-axis").selectAll(".tick")
				.selectAll("text")
				.attr("style", "text-anchor: end; font-size:0.8em");
			
			// remove the qq plot
			d3.selectAll(".nv-bar")
				.selectAll("polyline")
				.remove();
			

			return chart;
		});
	});
}