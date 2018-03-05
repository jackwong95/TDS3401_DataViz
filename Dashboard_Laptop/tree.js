/**
 * @brief	Tree	Creates a tree and bar chart (requires a specific data format).
 * @param	div_id	ID of the containing div.
 * @param	name	Options.
 * @param	file	Data files location.
 */

 // Original Reference: http://jsfiddle.net/rabimba/WbTKr/

class Tree {

	constructor(
		div_id,
		name=["Amazon", "IMDb", "Yelp"],
		file=["../Data/Tree/amazon_tree.json", "../Data/Tree/imdb_tree.json", "../Data/Tree/yelp_tree.json"]
		) {

		// Source.
		this.option = name;
		this.source = file;
		this.loaded = false;

		// Tree style.
		this.container = d3.select("#" + div_id);
		this.width     = parseInt(this.container.style("width"));
		this.height    = parseInt(this.container.style("height"));
		this.margin    = {"top": 20, "right": 20, "bottom": 20, "left": 20},
		this.time      = 1000;
		this.opaque    = 0.6;
		this.font      = "'Helvetica', Helvetica, Arial, sans-serif";

		// Bar style.
		this.bar_width  = this.width * 0.3;
		this.bar_height = this.height * 0.3;
		this.bar_color  = d3.scale.ordinal().domain(["positive", "negative"]).range(["#11AA00", "#C70039"]);
		this.bar_margin = {"top": 10, "right": 10, "bottom": 20, "left": 25};
		
		this.bar_width  -= (this.bar_margin.left + this.bar_margin.right);
		this.bar_height  -= (this.bar_margin.top + this.bar_margin.bottom);

		// Tree
		this.i            = 0;
		this.root         = null;
		this.radius       = Math.min(this.width - this.margin.left - this.margin.right, this.height - this.margin.top - this.margin.bottom) / 2.0;
		this.length       = this.radius / 2.5;
		this.node_radius  = this.length * 0.4;
		this.node_stroke1 = "1px";
		this.node_stroke2 = "3px";
		this.font_size    = "14px";

		// Filter.
		var obj = this;
		this.filter = this.container.append("div")
			.append("select")
				.style("position", "absolute")
				.style("display", "inline-block")
				.style("margin", "5px")
				.on("change", function() { obj.update(this.value); });

		this.filter.selectAll("option")
			.remove();

		this.filter.selectAll("option")
			.data(this.option).enter()
			.append("option")
				.attr("value", function(opt) { return opt;})
				.text(function(opt) { return opt; });

		// Tooltip.
		this.tooltip = this.container.append("div")
			.attr("class", "tooltip")
			.style("opacity", 0.0)
			.style("position", "absolute")
			.style("background-color", "white")
			.style("text-align", "center")
			.style("padding", "10px")
			.style("font-family", this.font)
			.style("pointer-events", "none")
			.style("box-shadow", "0px 0px 8px 0px black");

		// Bar.
		this.bar_chart = this.tooltip.append("svg")
			.attr("width", this.bar_width + this.bar_margin.left + this.bar_margin.right)
			.attr("height", this.bar_height + this.bar_margin.top + this.bar_margin.bottom)
			.append("g")
				.attr("transform", "translate(" + this.bar_margin.left + "," + this.bar_margin.top + ")");

		// Axis and scale.
		this.bar_x = d3.scale.ordinal().rangeRoundBands([0, this.bar_width], 0.05);
		this.bar_y = d3.scale.linear().range([this.bar_height, 0]);

		this.bar_xAxis = d3.svg.axis()
			.scale(this.bar_x)
			.orient("bottom");

		this.bar_yAxis = d3.svg.axis()
			.scale(this.bar_y)
			.orient("left")
			.ticks(5);

		// Tree.
		this.tree = d3.layout.tree()
			.size([360.0, this.radius])
			.separation(function(a, b) { return (a.depth == 0) ? 1 : ((a.parent == b.parent) ? 1 : 10) / a.depth; });

		this.diagonal = d3.svg.diagonal.radial()
			.projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

		this.svg = this.container.append("svg")
			.attr("width", this.width)
			.attr("height", this.height)
			.append("g")
				.attr("transform", "translate(" + this.width / 2.0 + "," + this.height / 2.0 + ")");

		// Data.
		var obj = this;
		obj.tree_data = {};
		queue()
			.defer(d3.json, obj.source[0])
			.defer(d3.json, obj.source[1])
			.defer(d3.json, obj.source[2])
			.await(function(error, d1, d2, d3) {
				if (error) throw error;

				obj.tree_data[obj.option[0]] = d1;
				obj.tree_data[obj.option[1]] = d2;
				obj.tree_data[obj.option[2]] = d3;

				obj.loaded = true;
				obj.update(obj.option[0]);
			});
	}

	update(selection) {

		// Reference obj.
		var obj = this;

		// Draw accordingly.
		for (var o = 0; o < obj.option.length; o ++) {
			if (selection == obj.option[o]) {

				if (obj.loaded) draw_tree();
				return;
			}
		}

		// Option nots in obj.
		throw "Invalid option";

		function draw_tree() {

			for (var o = 0; o < obj.option.length; o ++) {
				if (selection == obj.option[o]) {

					// Update filter.
					obj.filter
						.property("value", selection)
						.property("text", selection);

					// Data hierarchy.
					obj.root = obj.tree_data[obj.option[o]];
					obj.root.x0 = obj.height / 2.0;
					obj.root.y0 = 0;

					obj.root.children.forEach(collapse);
					update_tree(obj.root);
				}
			}

			function update_tree(source) {

				var nodes = obj.tree.nodes(obj.root);
				var links = obj.tree.links(nodes);

				nodes.forEach(function(d) { d.y = d.depth * obj.length; });

				var node = obj.svg.selectAll("g.node")
					.data(nodes, function(d) { return d.id || (d.id = ++ obj.i); });

				// Node enter.
				var nodeEnter = node.enter().append("g")
					.attr("class", "node")
					.style("cursor", "pointer")
					.on("click", click)
					.on("mouseover", onmouseover)
					.on("mousemove", onmousemove)
					.on("mouseout", onmouseout);

				nodeEnter.append("circle")
					.attr("r", function(d) { return node_radius(d); })
					.style("fill", function(d) { return (d._children) ? "lightsteelblue" : "#fff"; })
					.style("stroke", "steelblue")
					.style("stroke-width", obj.node_stroke1);

				nodeEnter.append("text")
					.attr("x", 10)
					.attr("dy", 0)
					.attr("text-anchor", "start")
					.text(function(d) { return (d.name == "root") ? selection : d.name; })
					.style("font-family", obj.font)
					.style("font-size", obj.font_size)
					.style("opacity", 0.0);

				// Node movement.
				var nodeUpdate = node.transition().duration(obj.time)
					.attr("transform", function(d) { return "rotate(" + (isNaN(d.x) ? 0 : d.x - 90) + ") translate(" + d.y + ")"; })

				nodeUpdate.select("circle")
					.style("fill", function(d) { return (d._children) ? "lightsteelblue" : "#fff"; });

				nodeUpdate.select("text")
					.style("opacity", 1.0);

				// Nove exit.
				var nodeExit = node.exit().remove();

				var link = obj.svg.selectAll("path.link")
					.data(links, function(d) { return d.target.id; });

				link.enter().insert("path", "g")
					.attr("class", "link")
					.attr("d", function(d) {
						var o = {x: source.x0, y: source.y0};
						return obj.diagonal({source: o, target: o});
					})
					.style("fill", "none")
					.style("stroke", "#999")
					.style("stroke-width", "1px");

				link.transition()
					.duration(obj.time * 1.5)
					.attr("d", obj.diagonal);

				link.exit().transition()
					.duration(obj.time)
					.attr("d", function(d) {
						var o = {x: source.x, y: source.y};
						return obj.diagonal({source: o, target: o});
					})
				.remove();

				nodes.forEach(function(d) {
					d.x0 = d.x;
					d.y0 = d.y;
				});
			}

			function node_radius(d) {
				return Math.sqrt((d.sentiment[0] + d.sentiment[1]) / (obj.root.sentiment[0] + obj.root.sentiment[1])) * obj.node_radius;
			}

			function collapse(d) {
				if (d.children) {
					d._children = d.children;
					d._children.forEach(collapse);
					d.children = null;
				}
			}

			function click(d) {
				d.children = [d._children, d._children = d.children][0];
				update_tree(d);
			}
		}

		function onmouseover(d) {

			// Node.
			var n = d3.select(this);

			n.selectAll("circle")
				.style("stroke-width", obj.node_stroke2);

			n.selectAll("text")
				.style("font-weight", "bold");

			// Tooltip.
			obj.tooltip.transition().duration(obj.time)
				.style("opacity", 1.0);

			obj.tooltip.selectAll("p")
				.remove();

			obj.tooltip.insert("p", "svg")
				.html("Sentiment Distribution for " + ((d.name == "root") ? selection : d.name));

			obj.tooltip.selectAll("p")
				.style("margin", "0px 6px 12px 6px");

			draw_bar([
				{"sentiment": "positive", "value": d.sentiment[1]},
				{"sentiment": "negative", "value": d.sentiment[0]}
			]);
		}

		function onmousemove() {

			// Move tooltip.
			obj.tooltip
				.style("left", d3.event.layerX + 15 + "px")
				.style("top", d3.event.layerY + 15 + "px");
		}

		function onmouseout() {

			// Node.
			var n = d3.select(this);

			n.selectAll("circle")
				.style("stroke-width", obj.node_stroke1);

			n.selectAll("text")
				.style("font-weight", "normal");

			// Tooltip.
			obj.tooltip.transition().duration(obj.time)
				.style("opacity", 0.0);
		}

		function draw_bar(sentiment_data) {

			obj.bar_x.domain(sentiment_data.map(function(d) { return d.sentiment; }));
			obj.bar_y.domain([0, d3.max(sentiment_data, function(d) { return d.value; })]);

			obj.bar_chart.html("");

			obj.bar_chart.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(0," + obj.bar_height + ")")
				.style("font-family", obj.font)
				.call(obj.bar_xAxis)
				.selectAll("text")
					.style("text-anchor", "end")
					.attr("dx", "14px")
					.attr("dy", "5px");

			obj.bar_chart.append("g")
				.attr("class", "axis")
				.call(obj.bar_yAxis);

			obj.bar_chart.selectAll(".axis")
				.style("font-size", "8px")
				.selectAll("path, line")
					.style("fill", "none")
					.style("shape-rendering", "crispEdges");

			obj.bar_chart.selectAll("rect")
				.data(sentiment_data)
				.enter().append("rect")
					.style("fill", function(d) { return obj.bar_color(d.sentiment); })
					.attr("x", function(d) { return obj.bar_x(d.sentiment); })
					.attr("width", obj.bar_x.rangeBand())
					.attr("y", function(d) { return obj.bar_y(d.value); })
					.attr("height", function(d) { return obj.bar_height - obj.bar_y(d.value); });
		}
	}
}
