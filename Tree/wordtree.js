/**
 * @brief	word_tree		Creates a table display for sentences along with Google's double-sided word tree upon clicking a word.
 * @param	data			Data, an array of objects which should contain at least one sentence field.
 * @param	header			Displayed text for the table's header.
 * @param	sentence_access		Access function to "sentence".
 * @param	row_color		Color function with one parameter, data[i].
 * @param	page_size		Page size.
 * @param	type			Word tree type: "double", "prefix", "suffix".
 */

function word_tree(placeholder_id, data, header, sentence_access = null, row_color = null, page_size = 10, type = "double") {

	google.charts.load('current', {packages:['wordtree']});
	google.charts.setOnLoadCallback(draw);

	function draw() {

		// Validate.
		var placeholder = document.getElementById(placeholder_id);
		if (placeholder == null) return;

		// Concatenated data.
		var tree_data;
		if (sentence_access) {
			tree_data = google.visualization.arrayToDataTable([
				['Phrases'],
				[data.map(sentence_access).join(' ')]
			]);
		}

		// Paging variables.
		var page = 1;
		var current = 0;
		var last = [];
		last[page] = current;

		// Containers.
		var container = document.createElement("div");

		// Create table.
		var table = document.createElement("table");
		var thead = document.createElement("thead");
		var tbody = document.createElement("tbody");

		// Add classes.
		table.className = placeholder_id + "_table";
		thead.className = placeholder_id + "_thead";
		tbody.className = placeholder_id + "_tbody";

		// Fill header.
		var tr = document.createElement("tr");
		var th = document.createElement("th");
		th.innerHTML = header;
		tr.appendChild(th);
		thead.appendChild(tr);
		table.appendChild(thead);
		table.appendChild(tbody);

		// Click to bring up word tree.
		// Reference: "jsfiddle.net/Vap7C/80".
		// ** May have some problems depending on browser. **

		table.onclick = function() {
			var sel;
			var t = "";
			if (window.getSelection && (sel = window.getSelection()).modify) {
				var s = window.getSelection();
				if (s.isCollapsed) {
					s.modify('move', 'forward', 'character');
					s.modify('move', 'backward', 'word');
					s.modify('extend', 'forward', 'word');
					t = s.toString();
					s.modify('move', 'forward', 'character');
				}
			}
			if (t != "") {
				show(false);
				options.wordtree.word = (t.replace(/\W/g, '') == "") ? t : t.replace(/\W/g, '');
				wordtree.draw(tree_data, options);
			}
		};

		var options = {
			backgroundColor: '#eceff1',
			fontName: 'arial',
			maxFontSize: 24,
			wordtree: {
				format: 'implicit',
				type: type,
				word: ''
			}
		};

		// Create word tree.
		var tree = document.createElement("div");
		tree.className = placeholder_id + "_wordtree";
		var wordtree = new google.visualization.WordTree(tree);

		// Controls.
		var controls = document.createElement('div');
		controls.style.height = "32px";
		controls.style.paddingLeft = "8px";
		controls.style.paddingRight = "8px";
		controls.style.backgroundColor = "#00000000";

		var back = document.createElement('span');
		back.className = 'static navigate';
		back.innerHTML = "&#x25C5;";

		var number = document.createElement('span');
		number.className = 'static';
		number.innerHTML = "&nbsp;" + page + "&nbsp;";

		var next = document.createElement('span');
		next.className = 'static navigate';
		next.innerHTML = "&#x25BB;";

		var close = document.createElement('span');
		close.className = 'static close';
		close.innerHTML = "&times;";
		
		controls.appendChild(back);
		controls.appendChild(number);
		controls.appendChild(next);
		controls.appendChild(close);

		update();
		show(true);

		container.appendChild(controls);
		container.appendChild(table);
		container.appendChild(tree);

		// Write to document.
		placeholder.appendChild(container);

		function show(param = true) {
			table.style.display = (param) ? 'block' : 'none';
			back.style.display = number.style.display = next.style.display = (param) ? 'inline-block' : 'none';
			tree.style.display = close.style.display = (param) ? 'none' : 'block';
		}

		// Back.
		back.onclick = function() {
			if (page > 1) {
				page --;
				current = last[page];
				update();
			}
		}

		// Next.
		next.onclick = function() {
			if (current < data.length - 1) {
				current ++;
				page ++;
				last[page] = current;
				update();
			}
		}

		// Close word tree.
		close.onclick = function() {
			show(true);
		}

		// Fill content.
		function update() {

			if (sentence_access == null) {
				return;
			}

			tbody.innerHTML = "";
			number.innerHTML = "&nbsp;" + page + "&nbsp;";

			for (var j = 0; current < data.length; current ++) {

				var tr = document.createElement("tr");
				tr.style.color = row_color(data[current]);

				var td = document.createElement("td");
				td.innerHTML = sentence_access(data[current]);

				tr.appendChild(td);
				tbody.appendChild(tr);

				j ++;

				if (j == page_size) {
					break;
				}
			}
		}
	}
}
