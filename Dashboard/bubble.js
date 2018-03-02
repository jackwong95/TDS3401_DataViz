/**
 * Only used for a very specific data.
 * Therefore, data linking mechanism is not provided. (Modify the code)
 */

class Bubble {

	constructor(div_id, onclick = null) {

		// Source.
		this.options = ["Amazon", "IMDb", "Yelp"];
		this.source  = ["Data/amazon_bubble.json", "Data/imdb_bubble.json", "Data/yelp_bubble.json"];
		this.loaded  = false;

		// Bubble style.
		this.container = d3v4.select("#" + div_id);
		this.width     = parseInt(this.container.style("width"));
		this.height    = parseInt(this.container.style("height"));
		this.color     = d3v4.scaleOrdinal(d3v4.schemeCategory20c);
		this.time      = 1000;
		this.opaque    = 0.6;
		this.font      = "'Helvetica', Helvetica, Arial, sans-serif";

		// Pie style.
		this.pie_width    = this.width * 0.3;
		this.pie_height   = this.height * 0.3;
		this.pie_radius   = Math.min(this.pie_width, this.pie_height) / 2.0;
		this.pie_color    = d3v4.scaleOrdinal().domain(["positive", "negative"]).range(["#11AA00", "#C70039"]);
		this.legend_size  = 15;
		this.legend_space = 3;

		// Filter.
		this.filter = this.container.append("div")
			.append("select")
				.style("position", "absolute")
				.style("display", "inline-block")
				.style("margin", "5px");

		this.filter.selectAll("option")
			.remove();

		this.filter.selectAll("option")
			.data(this.options).enter()
			.append("option")
				.attr("value", function(opt) { return opt;})
				.text(function(opt) { return opt; });

		// Bubble.
		this.svg = this.container.append("svg")
			.style("width", this.width + "px")
			.style("height", this.height + "px");

		// Tooltip.
		this.tooltip = this.container.append("div")
			.attr("class", "tooltip")
			.style("opacity", 0.0)
			.style("position", "absolute")
			.style("background-color", "white")
			.style("text-align", "center")
			.style("text-align", "center")
			.style("padding", "10px")
			.style("font-family", this.font)
			.style("pointer-events", "none")
			.style("box-shadow", "0px 0px 8px 0px black");

		// Pie.
		this.pie_chart = this.tooltip.append("svg")
			.attr("width", this.pie_width)
			.attr("height", this.pie_height)
			.append("g")
				.attr("transform", "translate(" + (this.pie_width / 2.0) +  "," + (this.pie_height / 2.0) + ")");

		this.pie_legend = this.tooltip.append("svg")
			.attr("width", 75)
			.attr("height", this.pie_height);

		// Data.
		var obj = this;
		obj.bubble_data = {};
		d3v4.queue()
			.defer(d3v4.json, obj.source[0])
			.defer(d3v4.json, obj.source[1])
			.defer(d3v4.json, obj.source[2])
			.await(function(error, d1, d2, d3) {
				if (error) throw error;

				obj.bubble_data[obj.options[0]] = d1;
				obj.bubble_data[obj.options[1]] = d2;
				obj.bubble_data[obj.options[2]] = d3;

				obj.loaded = true;

				obj.update(obj.options[0]);
				obj.filter.on("change", function() { obj.update(this.value); });
			});

		// Data access.
		this.pie = d3v4.pie()
			.value(function(d) {
				return d["count"];
			})
			.sort(function(a, b) {
				return b["count"] - a["count"];
			});

		// Pie arc.
		this.arc = d3v4.arc()
			.innerRadius(0.0)
			.outerRadius(this.pie_radius);

		// Click event.
		this.click = onclick;
	}

	update(selection) {

		// Reference obj.
		var obj = this;

		// Draw accordingly.
		for (var o = 0; o < obj.options.length; o ++) {
			if (selection == obj.options[o]) {

				if (obj.loaded) draw_bubble();
				return;
			}
		}

		// Option nots in obj.
		throw "Invalid option";

		function draw_bubble() {

			for (var o = 0; o < obj.options.length; o ++) {
				if (selection == obj.options[o]) {

					// Update filter.
					obj.filter
						.property("value", selection)
						.property("text", selection);

					// Data hierarchy.
					var root = d3v4.hierarchy({"children": obj.bubble_data[obj.options[o]]})
						.sum(function(d) { return d["count"]; })
						.sort(function(a, b) { return b["count"] - a["count"]; });

					// Pack chart.
					d3v4.pack().size([obj.width, obj.height]).padding(2.0)(root);

					// Nodes.
					obj.svg.selectAll(".node")
						.remove();

					var node = obj.svg.selectAll(".node")
						.data(root.children).enter()
						.append("g")
							.attr("class", "node")
							.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
							.style("opacity", obj.opaque)
							.on("mouseover", onmouseover)
							.on("mousemove", onmousemove)
							.on("mouseout", onmouseout)
							.on("click", onclick);

					var fade_in = function(d) {
						return obj.time * (2.0 - (d.r / obj.pie_radius)); // Largest (obj.time), smallest (2.0 obj.time)
					}

					// Circle.
					node.append("circle")
						.attr("r", function(d) { return d.r; })
						.style("fill", function(d) {
							return obj.color(d.data["subject"]);
						})
						.style("opacity", 0.0)
						.transition().duration(fade_in)
						.style("opacity", 1.0);

					// Nodes' style.
					node.append("text")
						.attr("dy", "0.3em")
						.text(function(d) { return d.data["subject"].substring(0, d.r / 3.0); })
						.style("font-size", "0.75em")
						.style("text-anchor", "middle")
						.style("fill", "#222")
						.style("pointer-events", "none")
						.style("font-family", obj.font)
						.style("opacity", 0.0)
						.transition().duration(fade_in)
						.style("opacity", 1.0);

					break;
				}
			}
		}

		function onclick(d) {
			console.log(d);
			if (obj.click) {
				obj.click(d.data["subject"]);
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
			obj.tooltip.transition().duration(obj.time)
				.style("opacity", 1.0);

			// Current selection.
			var selection = obj.filter.property("value");
			for (var o = 0; o < obj.options.length; o ++) {
				if (selection == obj.options[o]) {

					obj.tooltip.selectAll("p")
						.remove();

					obj.tooltip.insert("p", "svg")
						.html("Sentiment Distribution for " + d.data["subject"]);

					obj.tooltip.selectAll("p")
						.style("margin", "0px 6px 12px 6px");

					draw_pie(obj.bubble_data[obj.options[o]], d.data["subject"]);

					break;
				}
			}
		}

		function onmousemove() {

			// Move tooltip.
			obj.tooltip
				.style("left", d3v4.event.pageX + 15 + "px")
				.style("top", d3v4.event.pageY + 15 + "px");
		}

		function onmouseout() {

			// Reset node's style.
			d3v4.select(this)
				.style("opacity", obj.opaque)
				.style("font-weight", "normal")
				.selectAll("circle")
					.style("stroke-width", "0px");

			d3v4.select(this)
				.selectAll("text")
					.style("fill", "#222");

			// Hide tooltip.
			obj.tooltip.transition().duration(obj.time)
				.style("opacity", 0.0);
		}

		function draw_pie(data, selection) {

			var pie_data;
			for (var i = 0; i < data.length; i ++ ) {
				if (data[i]["subject"] == selection) {
					pie_data = data[i];
					break;
				}
			}

			// Pie arc.
			obj.pie_chart.selectAll("path")
				.remove();

			obj.pie_chart.selectAll("path")
				.data(obj.pie(pie_data["sentiments"])).enter()
				.append("path")
					.attr("d", obj.arc)
					.attr("fill", function(d, i) {
						return obj.pie_color(d.data["sentiment"]);
					})
					.attr("text-anchor", "middle")
					.exit();

			// Pie text.
			obj.pie_chart.selectAll("text")
				.remove();

			obj.pie_chart.selectAll("text")
				.data(obj.pie(pie_data["sentiments"])).enter()
				.append("text")
					.attr("transform", function(d) {
						d.innerRadius = 0;
						d.outerRadius = obj.pie_radius;
						return "translate(" + obj.arc.centroid(d) + ")";
					})
					.attr("text-anchor", "middle")
					.text(function(d, i) {
						if (d.data["count"] != 0) {
							return d.data["count"] + " (" + Math.round(d.data["count"] / pie_data["count"] * 100) + "%)";
						}
					})
					.style("font-size", "9px");

			var legend = obj.pie_legend.selectAll(".legend")
				.data(obj.pie_color.domain()).enter()
				.append("g")
					.attr("class", "legend")
					.attr("transform", function(d, i) {
						var h   = obj.legend_size + obj.legend_space;
						var x   = obj.legend_size;
						var y   = i * h;
						return "translate(" + x + "," + y + ")";
					})

			legend.append("rect")
				.attr("width", obj.legend_size)
				.attr("height", obj.legend_size)
				.style("fill", obj.pie_color);

			legend.append("text")
				.attr("x", obj.legend_size + obj.legend_space)
				.attr("y", obj.legend_size - obj.legend_space)
				.text(function(d) { return d; })
				.style("font-size", "10px");
		}
	}
}
