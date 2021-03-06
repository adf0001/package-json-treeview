
var { satisfy: semver_satisfies } = require("package-json-version-tool");
var { hasAnyDependencies } = require("package-json-tool");

var formatContent = function (pkgItem, name, versionText, toExpand) {
	var verMatch = pkgItem ? semver_satisfies(pkgItem.pkg.version, versionText) : null;

	if (toExpand) {
		if (pkgItem && verMatch &&
			!hasAnyDependencies(pkgItem.pkg)) {
			toExpand = false;
		}
	}

	var a = [];

	a[a.length] = "<span class='tree-to-expand" + (toExpand ? "" : " tree-disable") + "'>" +
		(toExpand ? "+" : ".") +
		"</span>";

	a[a.length] = "<span class='tree-name'>" + name + "</span>";

	a[a.length] = "<span class='pkg-version'>" + versionText + "</span>";

	a[a.length] = "<span class='pkg-dependent'></span>";

	return a.join("");
}

//module exports

module.exports = {
	formatContent,
};
