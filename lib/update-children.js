
var { setToExpandState, addNode, nodePart, nodeName, getOptionsProperty,
	getNode, getNodeInfo, INFO_TYPE, getOptionsProperty } = require("treeview-model");

var ele_id = require("ele-id");

var { hasDependencies, anyDependencies } = require("package-json-tool");

var { formatContent } = require("./format-content.js");
var { updateVersionAndChildrenState } = require("./update-version-and-children-state");

/*
update a node children
updateChildren(elChildrenContainer, pkgItem [, options]])

	options
		.develope
			boolean type; flag for 'devDependencies';
		
		.hide
			boolean type; flag to hide the children;
*/
var updateChildren = function (elChildren, pkgItem, options) {
	var ni = getNodeInfo(elChildren);
	if (!ni[INFO_TYPE]) {
		throw Error("not a children container");
	}

	var pkg = pkgItem.pkg;

	if (!anyDependencies(pkg)) {
		if (ni[INFO_TYPE] !== "container") setToExpandState(getNode(elChildren), "disable");
		return;
	}

	if (ni[INFO_TYPE] !== "container" && options?.hide) elChildren.style.display = "none";

	if (!options?.develope) {
		if (pkg.dependencies) {
			addDependItems(elChildren, pkg.dependencies, options);
		}
		if (hasDependencies(pkg, "dev")) {
			var outerHtml = "<div class='tree-delay'><span class='pkg-dev'>... devDependencies</span></div>";
			addNode(elChildren, { outerHtml: outerHtml }, null, true);
		}
	}
	else {
		if (elChildren.lastElementChild?.classList.contains("tree-delay")) {
			elChildren.removeChild(elChildren.lastElementChild);

			addDependItems(elChildren, pkg.devDependencies, options);
		}
	}
}

var addDependItems = function (elChildren, items, options) {
	var parentName = nodeName(elChildren).textContent;

	var dataset = getOptionsProperty(elChildren, options, "dataset", true);
	var dependent = getOptionsProperty(elChildren, options, "dependent", true);

	var i, innerHtml, el;
	for (i in items) {
		innerHtml = formatContent(dataset[i], i, items[i], true);
		el = addNode(elChildren, { innerHtml: innerHtml }, null, true);
		dependent.add(i, parentName, ele_id(nodePart(el, "pkg-dependent")));

		if (options?.develope) el.classList.add("pkg-develope");	//set develope flag

		var mainItem = dataset.get(i);
		if (mainItem) {
			var depItem = dependent.data[i];
			updateVersionAndChildrenState(
				depItem ? Object.keys(depItem.fromData) : el, mainItem.pkg, mainItem
			);
		}
	}
}

//module exports

module.exports = {
	updateChildren,
};
