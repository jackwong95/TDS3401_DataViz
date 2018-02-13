function concordance(text, data, sentence_access = null, sentiment_access = null) {

	// Creates "modal dialog".
	var modal = document.createElement('div');
	modal.className = 'modal';
	modal.style.display = 'block';

	var content = document.createElement('div');
	content.className = 'modal-content';

	var close = document.createElement('span');
	close.className = 'close';
	close.innerHTML = "&times;";

	// Content.
	var concordance = document.createElement('table');
	concordance.className = "modal-table";

	if (sentence_access != null)
	{
		for (var i = 0; i < data.length; i ++) {

			var str = sentence_access(data[i]);

			// Find text.
			var n = str.search(text);

			if (n === -1) {
				continue;
			}

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
				if (sentiment_access(data[i])) {
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
		}
	}

	content.appendChild(close);
	content.appendChild(concordance);
	modal.appendChild(content);

	// Write to document.
	document.body.appendChild(modal);

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
}
