
// package-json-treeview @ npm, explore a top package.json in treeview.

//module exports

Object.assign(exports,
	require("treeview-model"),

	require("./lib/set-on-click.js"),
	require("./lib/format-content.js"),
	require("./lib/load-from-node.js"),
	require("./lib/update-children.js"),
	require("./lib/update-version-and-children-state.js"),
	require("./lib/update-view.js"),

);
