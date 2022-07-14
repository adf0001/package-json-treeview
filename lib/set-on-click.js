
var { getContainer, getNode, setOnClick: baseSetOnClick, nodeChildren,
	nodeName, setToExpandState, getToExpandState } = require("treeview-model");
var { hasAnyDependencies } = require("package-json-tool");

var { loadFromNode } = require("./load-from-node");
var { updateChildren } = require("./update-children");

/*
	option
		.nameClickCallback

*/
var setOnClick = function (el, options) {
	var container = getContainer(el);
	if (!container) return;

	baseSetOnClick(container, options);
	var baseOnClick = container.onclick;
	options = baseOnClick("get-options");

	container.onclick = function (evt) {
		if (evt === "get-options") return options;

		//call treeview_model onclick as base
		var baseReturn = baseOnClick?.(evt);

		//this onclick
		var el = evt.target;

		if (el.classList.contains("tree-to-expand")) {
			var state = getToExpandState(el);
			if (state === "disable") return;

			var elChildren = nodeChildren(el.parentNode);
			if (!elChildren || !elChildren.firstElementChild) {
				var elNode = getNode(el);

				loadFromNode(elNode, options.dataset, options.dependent, function (err, data) {
					if (err) {
						setToExpandState(elNode, true, "?");
						return;
					}

					if (hasAnyDependencies(data.pkg)) {
						setToExpandState(elNode, false);
					}
				});
			}
			return;
		}
		else if (el.classList.contains("pkg-dev")) {
			var elNode = getNode(el.parentNode.parentNode);
			var elName = nodeName(elNode);
			updateChildren(nodeChildren(elNode, true), options.dataset.get(elName.textContent), { develope: true });
			return;
		}
		else if (el.classList.contains("tree-name")) {
			var elNode = getNode(el);

			loadFromNode(elNode, options.dataset, options.dependent, function (err, data) {
				if (err) return;
				if (options.nameClickCallback) options.nameClickCallback(err, data);
			});

			return;
		}

		return baseReturn;
	}
}

//module exports

module.exports = {
	setOnClick,		//overwrite
}
