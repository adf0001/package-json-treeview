
var { getNode, nodePart, nodeName, nodeChildren, setToExpandState } = require("treeview-model");
var { anyDependencies } = require("package-json-tool");
var { keyString: pathKeyString } = require("path-tool");
var { anyDependencies } = require("package-json-tool");

var { updateVersionAndChildrenState } = require("./update-version-and-children-state");
var { updateVersionAndChildrenState } = require("./update-version-and-children-state");
var { updateChildren } = require("./update-children");

var getParentPath = function (elNode) {
	var elParent = getNode(elNode.parentNode);
	return elParent && elParent.getAttribute("pkg-path");
}

var loadFromNode = function (elNode, dataset, dependent, cb) {
	var elName = nodeName(elNode);
	var elVersion = nodePart(elNode, 'pkg-version');

	var name = elName.textContent;

	dataset.load(getParentPath(elNode), name, elVersion.textContent,
		function (err, data) {
			if (err) { cb(err, data); return; }

			elNode.setAttribute("pkg-path", pathKeyString(data.path));

			var mainItem = dataset.get(name);
			//update other nodes
			var depItem = dependent.data[name];
			updateVersionAndChildrenState(
				depItem ? Object.keys(depItem.fromData) : elNode, mainItem.pkg, mainItem
			);

			if (anyDependencies(data.pkg)) {
				var elChildren = nodeChildren(elNode, true);
				if (!elChildren.firstElementChild) {
					updateChildren(elChildren, data, { hide: true });
				}
			}
			else {
				setToExpandState(elNode, "disable");
			}
			cb(err, data);
		}
	);
}

//module exports

module.exports = {
	loadFromNode,
	getParentPath,
};
