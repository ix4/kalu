;(function () {

	editur = window.editur || {};

	var updateTimer,
		updateDelay = 100,
		widgets = [];
		frame = document.querySelector('#demo-frame');

	// editur.demoFrameDocument = frame.contentDocument || frame.contentWindow.document;

	window.onunload = function () {
		editur.saveContent(editur.cm.getValue());
	};

	editur.saveContent = function (content) {
		window.localStorage.editur = content;
	};

	editur.getLastSavedContent = function () {
		return window.localStorage.editur || "";
	};

	editur.setPreviewContent = function (content) {
		var self = this;

		var r1 = /(\d+.*)\n/g;
			r2 = /(\d+.*)$/gm;
		var searches = editur.cm.getSearchCursor(r2),
			match,
			result,
			node;

		widgets.forEach(function (node) {
			node.remove();
		});

		while (match = searches.findNext()) {
			match[1] = match[1].replace(/=\s*$/, '');
			try {
				result = eval(match[1]);
			} catch (e) {
				result = 'undefined';
			}
			node = document.createElement('div');
			node.classList.add('result');
			node.textContent = result;
			editur.cm.addWidget(searches.to(), node);
			widgets.push(node);
		}
	};

	editur.cm = CodeMirror(document.body, {
		lineNumbers: true,
		mode:  "javascript",
		theme: 'monokai',
		lineWrapping: true,
		autofocus: true
	});

	editur.cm.on("change", function (instance, change) {
		clearTimeout(updateTimer);
		updateTimer = setTimeout(function () {
			editur.setPreviewContent(instance.getValue());
		}, updateDelay);
	});

	function init () {
		var content = editur.getLastSavedContent();

		// load demo content for new user
		if (!content) {
			var reqListener = function () {
				content = this.responseText;
				editur.cm.setValue(content);
				editur.cm.refresh();
				editur.setPreviewContent(content);
			};

			var oReq = new XMLHttpRequest();
			oReq.onload = reqListener;
			oReq.open("get", "demo.html", true);
			oReq.send();
		}
		// load saved content for returning user
		else {
			editur.setPreviewContent(content);
			editur.cm.setValue(content);
			editur.cm.refresh();
		}
	}

	init();

})();