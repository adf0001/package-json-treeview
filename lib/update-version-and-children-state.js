
var { setToExpandState, nodePart, getNode } = require("treeview-model");
var { satisfy: semver_satisfies } = require("package-json-version-tool");
var { hasAnyDependencies } = require("package-json-tool");

var updateVersionAndChildrenState = function (elArray, mainPkg, mainItem) {
	if (!(elArray instanceof Array)) elArray = [elArray];

	var mainVer = mainPkg.version;

	//console.log(mainItem);
	var vka = [];	//version key-name array

	var i;
	for (i in mainItem.versionPkg) {
		vka[vka.length] = (vka.length ? ", " : "") + mainItem.versionPkg[i].pkg.version;
	}
	if (vka.length) {
		vka.unshift("\nother" + ((vka.length > 1) ? "s" : "") + ": ");
		vka[vka.length] = "\nversion count: " + vka.length;
	}

	var imax = elArray.length, el, elVer, verMatch;
	for (i = 0; i < imax; i++) {
		el = getNode(elArray[i]);
		elVer = nodePart(el, "pkg-version");

		verMatch = semver_satisfies(mainVer, elVer.textContent);

		//console.log(el.getAttribute("pkg-path"));

		elVer.style.color = verMatch ? (vka.length ? "darkred" : "black") : "red";

		elVer.title = (verMatch && !vka.length) ? "" : ('top version is ' + mainVer + vka.join(""));

		if (verMatch) {
			if (!hasAnyDependencies(mainPkg)) {
				setToExpandState(el, "disable");
			}
		}
	}
}

//module exports

module.exports = {
	updateVersionAndChildrenState,
};
