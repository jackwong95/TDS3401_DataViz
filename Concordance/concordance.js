/**
 * @brief	concordance			Creates a concordance in a "modal dialog" form.
 * @param	text				Root word or phrase.
 * @param	data				Data.
 * @param	sentence_access		Access function to "sentence".
 * @param	sentiment_access	Access function to "sentiment".
 * @param	page_size			Page size.
 */

function concordance(text, data, sentence_access = null, sentiment_access = null, page_size = 10) {

	// Creates "modal dialog".
	var modal = document.createElement('div');
	modal.className = 'modal';
	modal.style.display = 'block';

	var content = document.createElement('div');
	content.className = 'modal-content';

	// Paging variables.
	var page = 1;
	var current = 0;
	var last = [];
	last[page] = current;

	// Controls.
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

	// Content.
	var concordance = document.createElement('table');
	concordance.className = "modal-table";

	content.appendChild(back);
	content.appendChild(number);
	content.appendChild(next);
	content.appendChild(close);
	content.appendChild(concordance);
	modal.appendChild(content);

	// Write to document.
	document.body.appendChild(modal);

	// Update.
	update();

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

	// Closes "modal dialog".
	var restore = window.onclick;

	function exit() {
		modal.outerHTML = "";
		window.onclick = restore;
	}

	close.onclick = function() {
		exit();
	}

	window.onclick = function(event) {
		if (event.target == modal) {
			exit();
		}
	}

	// Fill content.
	function update() {

		if (sentence_access == null) {
			return;
		}

		concordance.innerHTML = "";
		number.innerHTML = "&nbsp;" + page + "&nbsp;";

		for (var j = 0; current < data.length; current ++) {

			var str = sentence_access(data[current]);

			// Find text.
			var n = str.search(text);

			if (n === -1) {
				continue;
			}

			j ++;

			// Creates new entry.
			var row = document.createElement('tr');

			var left = document.createElement('td');
			var center = document.createElement('td');
			var right = document.createElement('td');

			// Alignment.
			left.className = 'modal-text-left';
			center.className = 'modal-text-center';
			right.className = 'modal-text-right';

			// Text.
			left.innerHTML = str.substr(0, n);
			center.innerHTML = text;
			right.innerHTML = str.substr(n + text.length);

			// Color.
			if (sentiment_access != null)
			{
				if (sentiment_access(data[current])) {
					center.className += " positive";
				}
				else {
					center.className += " negative";
				}
			}

			row.appendChild(left);
			row.appendChild(center);
			row.appendChild(right);

			concordance.appendChild(row);

			if (j === page_size) {
				break;
			}
		}
	}
}
