/**
 * @brief	ListView	Creates a collapsable list view
 * @param	div_id	ID of the containing div.
 * @param	name	Options.
 * @param	file	Data files location.
 */
class WordCloud {
	
	constructor(
		div_id,
		width, height, 
		legend_height_offset,
		threshold,
		corcordance = null,
		mouse_events={"category_clicked":null, "word_clicked":null},
		word_hover_col = "#FFFFFF",
		color=["#FF6E40","#448AFF","#E040FB"],
		name=["Amazon", "IMDb", "Yelp"],
		file=["../Data/Cloud/Amazon.csv", "../Data/Cloud/IMDb.csv", "../Data/Cloud/Yelp.csv"]
		) {
			
			this.div_id = div_id;
			this.name = name;
			this.file = file;
			this.animation_duration = 2000;
			this.threshold = threshold;
			this.width = width;
			this.height = height - legend_height_offset;
			this.color = color;
			this.legend_height_offset = legend_height_offset;
			this.mouse_events = mouse_events;
			this.word_hover_col = word_hover_col;
			this.corcordance = corcordance;
			
			this.min_max = [];
			this.selected_min_max = [];
			this.raw_data = [];
			this.selected_data = [];
			// Data.
			var obj = this;
			
			d3v4.queue()
				.defer(d3v4.csv, obj.file[0])
				.defer(d3v4.csv, obj.file[1])
				.defer(d3v4.csv, obj.file[2])
				.await(function(error, d1, d2, d3) {
					if (error) throw error;
					
					var p1 = process(d1);
					var p2 = process(d2);
					var p3 = process(d3);
					
					obj.min_max[name[0]] = [p1.min, p1.max];
					obj.min_max[name[1]] = [p2.min, p2.max];
					obj.min_max[name[2]] = [p3.min, p3.max];
					
					obj.raw_data[name[0]] = p1.data;
					obj.raw_data[name[1]] = p2.data;
					obj.raw_data[name[2]] = p3.data;
					
					function process(raw_data)
					{
						var min = Number.MAX_VALUE;
						var max = Number.MIN_VALUE;
						
						var temp = [];
						for (var key in raw_data)
						{
							if (raw_data[key].source == null || raw_data[key].word == null
								|| raw_data[key].freq == null)
								continue;
							var temp_freq = parseInt(raw_data[key].freq);
							
							min = Math.min(temp_freq, min);
							max = Math.max(temp_freq, max);
							
							temp.push({source:raw_data[key].source, word:raw_data[key].word, freq:temp_freq});
						}
						return {"data":temp, "min":min, "max":max};
					}
				
					obj.update_wordcloud("Amazon");
				});
				
		}
		
		update_wordcloud(selection)
		{
			this.selected_min_max = this.min_max[selection];
			
			this.selected_data = [];
			
			// threshold here
			for (var key in this.raw_data[selection])
			{
				var entry = this.raw_data[selection][key];
				
				if (entry.freq <= this.threshold)
					continue;
				
				this.selected_data.push(entry);
			}
			
			draw_wordcloud(this);
		}
}


function draw_wordcloud(wc_inst)
{
	d3.select(wc_inst.div_id)
		.selectAll("*")
		.remove();

	var color = {'amazon':wc_inst.color[0], 'yelp':wc_inst.color[1], 'imdb':wc_inst.color[2]};
	var fontSize = d3.scale.pow().exponent(5).domain([wc_inst.selected_min_max[0], wc_inst.selected_min_max[1]]).range([10,80]);

	var layout = d3.layout.cloud()
		.timeInterval(10)
		.size([wc_inst.width, wc_inst.height])
		.words(wc_inst.selected_data)
		.rotate(function(d) { return 0; })
		.font('monospace')
		.fontSize(function(d,i) { return fontSize(d.freq); })
		.text(function(d) { return d.word; })
		.spiral("archimedean")
		.on("end", draw)
		.start();
	
	var svg = d3.select(wc_inst.div_id)
			.attr("width", wc_inst.width)
			.attr("height", wc_inst.height + wc_inst.legend_height_offset)
				.append("g")
				.attr("transform", "translate(0,0)");
				
	var wordcloud = svg.append("g")
			.attr('class','wordcloud')
			.attr("transform", "translate(" + wc_inst.width/2 + "," + wc_inst.height/2 + ")");

	var x0 = d3.scale.ordinal()
		.rangeRoundBands([0, wc_inst.width], .1)
		.domain(wc_inst.name);

	var xAxis = d3.svg.axis()
		.scale(x0)
		.orient("bottom");
		
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + wc_inst.height + ")")
		.call(xAxis)
			.selectAll('text')
			.attr("class", "wc_text")
			.style('fill',function(d) { return color[d.toLowerCase()]; })
			.on('click',function(d) { if (wc_inst.mouse_events.category_clicked != null ) wc_inst.mouse_events.category_clicked(d); })
			.on('mouseover',function(d) { d3.select(this).style("fill", wc_inst.word_hover_col); })
			.on('mouseout',function(d) { d3.select(this).style("fill", color[d.toLowerCase()]); });

	// remove x ticks
	d3.select(wc_inst.div_id)
		.select(".axis")
		.selectAll("line").remove();
	
	// word events
	function word_mouseover(d, i)
	{
		// set word to the current color
		d3.select(this).style("fill", wc_inst.word_hover_col);
	}
	
	function word_mouseout(d, i)
	{
		// reset to what was previously colored
		d3.select(this).style("fill", color[d.source]);
	}
	
	function word_clicked(d, i)
	{
		if (wc_inst.mouse_events.word_clicked != null )
		{
			wc_inst.mouse_events.word_clicked(d);
		} 
		if (wc_inst.corcordance != null) 
		{ 
			wc_inst.corcordance(d.word); 
		}
	}
			
	function draw(words)
	{
		wordcloud.selectAll("text")
			.data(words)
			.enter().append("text")
			.on('mouseover',word_mouseover)
			.on('mouseout', word_mouseout)
			.on("click", word_clicked)
			.style("opacity", 0.0)
			.transition()
			.duration(2000)
			.style("opacity", 1.0)
			.attr('class','word')
			.style("font-size", function(d) { return d.size + "px"; })
			.style("font-family", function(d) { return d.font; })
				.style("fill", function(d) { 
					var paringObject = wc_inst.selected_data.filter(function(obj) { return obj.word === d.text});
					return color[paringObject[0].source]; 
				})
				.attr("text-anchor", "middle")
				.attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
				.text(function(d) { return d.text; });
	};
			
}
