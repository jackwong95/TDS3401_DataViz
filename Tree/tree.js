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
		this.r1        = 4;
		this.r2        = 6;

		// Tree
		this.i      = 0;
		this.root   = null;
		this.radius = Math.min(this.width - this.margin.left - this.margin.right, this.height - this.margin.top - this.margin.bottom) / 2.0;
		this.length = this.radius / 3.0;

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
					.on("mouseover", function() {
						var n = d3.select(this);
						n.selectAll("circle").style("r", obj.r2);
						n.selectAll("text").style("font-weight", "bold");
					})
					.on("mouseout", function() {
						var n = d3.select(this);
						n.selectAll("circle").style("r", obj.r1);
						n.selectAll("text").style("font-weight", "normal");
					})
					.on("click", click);

				nodeEnter.append("circle")
					.attr("r", obj.r1)
					.style("fill", function(d) { return (d._children) ? "lightsteelblue" : "#fff"; })
					.style("stroke", "steelblue")
					.style("stroke-width", "1px");

				nodeEnter.append("text")
					.attr("x", 10)
					.attr("dy", 0)
					.attr("text-anchor", "start")
					.text(function(d) { return d.name; })
					.style("font-family", obj.font)
					.style("font-size", "12px")
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

				nodeExit.select("circle")
					.attr("r", obj.r1);

				nodeExit.select("text")
					.style("fill-opacity", 0.0);

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
	}
}
