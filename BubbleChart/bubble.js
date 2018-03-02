function bubble_pie_chart(div_id) {

	// Container.
	var container = d3v4.select("#" + div_id);
	var width     = parseInt(container.style("width"));
	var height    = parseInt(container.style("height"));
	var color     = d3v4.scaleOrdinal(d3v4.schemeCategory20c);
	var time      = 200;
	var opaque    = 0.6;
	var font      = "'Helvetica', Helvetica, Arial, sans-serif";

	// Pie.
	var pie_width  = width * 0.3;
	var pie_height = height * 0.3;
	var pie_radius = Math.min(pie_width, pie_height) / 2.0;
	var pie_color = d3v4.scaleOrdinal()
		.domain(["positive", "negative"])
		.range(["#11AA00", "#C70039"]);
	var pie = d3v4.pie()
		.value(function(d) {
			return d["count"];
		})
		.sort(function(a, b) {
			return b["count"] - a["count"];
		});
	var legend_size = 15;
	var legend_space = 3;

	// Filter.
	var option = ["Amazon", "IMDb", "Yelp"];
	var filter = container.append("div")
		.append("select")
		.style("position", "absolute")
		.style("display", "inline-block")
		.style("margin", "5px");

	filter.selectAll("option").remove();
	filter.selectAll("option")
		.data(option).enter()
		.append("option")
			.attr("value", function(option) {
				return option;
			})
			.text(function(option) {
				return option;
			});

	// SVG.
	var svg = container.append("svg")
		.style("width", width + "px")
		.style("height", height + "px");

	// Tooltip.
	var tooltip = container.append("div")
		.attr("class", "tooltip")
		.style("opacity", 0.0)
		.style("position", "absolute")
		.style("background-color", "white")
		.style("text-align", "center")
		.style("padding", "10px")
		.style("font-family", font)
		.style("pointer-events", "none")
		.style("box-shadow", "0px 0px 8px 0px black");

	// Pie.
	var pie_chart = tooltip.append("svg")
		.attr("width", pie_width)
		.attr("height", pie_height)
		.append("g")
			.attr("transform", "translate(" + (pie_width / 2.0) +  "," + (pie_height / 2.0) + ")");

	var pie_legend = tooltip.append("svg")
		.attr("width", 75)
		.attr("height", pie_height);

	var arc = d3v4.arc()
		.innerRadius(0)
		.outerRadius(pie_radius);

	// Data.
	var bubble_data = {};

	// Asynchronous load and wait.
	d3v4.queue()
		.defer(d3v4.json, "Data/amazon_bubble.json")
		.defer(d3v4.json, "Data/imdb_bubble.json")
		.defer(d3v4.json, "Data/yelp_bubble.json")
		.await(function(error, amazon, imdb, yelp) {
			if (error) throw error;

			bubble_data[option[0]] = amazon;
			bubble_data[option[1]] = imdb;
			bubble_data[option[2]] = yelp

			draw_bubble(option[0]);

			filter.on("change", function() {
				draw_bubble(this.value);
			});
		});

	function draw_bubble(selection = "Amazon") {

		for (var o = 0; o < option.length; o ++) {
			if (selection == option[o]) {

				// Data hierarchy.
				var root = d3v4.hierarchy({"children": bubble_data[option[o]]})
					.sum(function(d) { return d["count"]; })
					.sort(function(a, b) { return b["count"] - a["count"]; });

				// Pack chart.
				d3v4.pack().size([width, height]).padding(2.0)(root);

				// Nodes.
				svg.selectAll(".node").remove();
				var node = svg.selectAll(".node")
					.data(root.children).enter()
					.append("g")
						.attr("class", "node")
						.attr("transform", function(d) {
							return "translate(" + d.x + "," + d.y + ")";
						})
						.style("opacity", opaque)
						.on("mouseover", onmouseover)
						.on("mousemove", onmousemove)
						.on("mouseout", onmouseout)
						.on("click", onclick);

				// Circle.
				node.append("circle")
					// .transition().duration(time) // Looks disgusting.
					.attr("r", function(d) { return d.r; })
					.style("fill", function(d) {
						return color(d.data["subject"]);
					});

				// Nodes' style.
				node.append("text")
					.attr("dy", "0.3em")
					.text(function(d) {
						return d.data["subject"].substring(0, d.r / 3.0);
					})
					.style("font-size", "0.75em")
					.style("text-anchor", "middle")
					.style("fill", "#222")
					.style("pointer-events", "none")
					.style("font-family", font);

				break;
			}
		}
	}

	function onmouseover(d) {

		// Change node's style.
		d3v4.select(this)
			.style("opacity", 1.0)
			.style("font-weight", "bold")
			.selectAll("circle")
				.style("stroke", "white")
				.style("stroke-width", "1px");
		
		d3v4.select(this)
			.selectAll("text")
				.style("fill", "white");

		// Tooltip.
		tooltip.transition().duration(time)
			.style("opacity", 1.0);

		// Current selection.
		var selection = filter.property("value");
		for (var o = 0; o < option.length; o ++) {
			if (selection == option[o]) {

				tooltip.selectAll("p")
					.remove();

				tooltip.insert("p", "svg")
					.html("Sentiment Distribution for " + d.data["subject"]);

				tooltip.selectAll("p")
					.style("margin", "0px 6px 12px 6px");

				draw_pie(bubble_data[option[o]], d.data["subject"]);

				break;
			}
		}
	}

	function onmousemove() {
		
		tooltip
			.style("left", d3v4.event.pageX + 15 + "px")
			.style("top", d3v4.event.pageY + 15 + "px");
	}

	function onmouseout() {

		// Reset node's style.
		d3v4.select(this)
			.style("opacity", opaque)
			.style("font-weight", "normal")
			.selectAll("circle")
				.style("stroke-width", "0px");
				
		d3v4.select(this)
			.selectAll("text")
				.style("fill", "#222");

		// Hide tooltip.
		tooltip.transition().duration(time)
			.style("opacity", 0.0);
	}

	function onclick() {
		console.log("ONCLICK - CONCORDANCE");
	}

	function draw_pie(data, selection) {

		var pie_data;
		for (var i = 0; i < data.length; i ++ ) {
			if (data[i]["subject"] == selection) {
				pie_data = data[i];
				break;
			}
		}

		pie_chart.selectAll("path").remove();
		pie_chart.selectAll("path")
			.data(pie(pie_data["sentiments"])).enter()
			.append("path")
				.attr("d", arc)
				.attr("fill", function(d, i) {
					return pie_color(d.data["sentiment"]);
				})
				.attr("text-anchor", "middlea")
				.exit();

		pie_chart.selectAll("text").remove();
		pie_chart.selectAll("text")
			.data(pie(pie_data["sentiments"])).enter()
			.append("text")
				.attr("transform", function(d) {
					d.innerRadius = 0;
					d.outerRadius = pie_radius;
					return "translate(" + arc.centroid(d) + ")";
				})
				.attr("text-anchor", "middle")
				.text(function(d, i) {
					if (d.data["count"] != 0) {
						return d.data["count"] + " (" + Math.round(d.data["count"] / pie_data["count"] * 100) + "%)";
					}
				})
				.style("font-size", "9px");

		var legend = pie_legend.selectAll(".legend")
			.data(pie_color.domain()).enter()
			.append("g")
				.attr("class", "legend")
				.attr("transform", function(d, i) {
					var h   = legend_size + legend_space;
					var x   = legend_size;
					var y   = i * h;
					return "translate(" + x + "," + y + ")";
				})

		legend.append("rect")
			.attr("width", legend_size)
			.attr("height", legend_size)
			.style("fill", pie_color);

		legend.append("text")
			.attr("x", legend_size + legend_space)
			.attr("y", legend_size - legend_space)
			.text(function(d) {
				return d;
			})
			.style("font-size", "10px");
	}
}