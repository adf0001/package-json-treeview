
var { setToExpandState, nodePart, getNode } = require("treeview-model");
var { satisfy: semver_satisfies } = require("package-json-version-tool");
var { hasAnyDependencies } = require("package-json-tool");

var updateVersionAndChildrenState = function (elArray, mainPkg, mainItem) {
	if (!(elArray instanceof Array)) elArray = [elArray];

	var mainVer = mainPkg.version;

	//console.log(mainItem);
	var vka = [];	//version key-name array

	var i, verCnt = 0;
	for (i in mainItem.versionPkg) {
		vka[vka.length] = (vka.length ? ", " : "") + mainItem.versionPkg[i].pkg.version;
		verCnt++;
	}
	if (vka.length) {
		vka.unshift("\nother" + ((vka.length > 1) ? "s" : "") + ": ");
		vka[vka.length] = "\nversion count: " + vka.length;
	}

	var imax = elArray.length, elNode, elVer, verMatch, hasOther, mainList = [];
	for (i = 0; i < imax; i++) {
		elNode = getNode(elArray[i]);
		elVer = nodePart(elNode, "pkg-version");

		elNode.classList.add("pkg-loaded");

		verMatch = semver_satisfies(mainVer, elVer.textContent);

		//console.log(el.getAttribute("pkg-path"));

		//elVer.style.color = verMatch ? (vka.length ? "darkred" : "black") : "red";
		if (verMatch) {
			if (vka.length) elNode.classList.add("pkg-ver-main");
			else mainList.push(elNode);
		}
		else {
			elNode.classList.add("pkg-ver-other");
			hasOther = true;
		}

		elVer.title = (verMatch && !vka.length) ? "" : ('top version is ' + mainVer + vka.join(""));

		//children state
		if (verMatch) {
			if (!hasAnyDependencies(mainPkg)) {
				setToExpandState(elNode, "disable");
			}
		}
	}

	if (hasOther && verCnt === 0) {
		//other version unloaded
		imax = mainList.length;
		for (i = 0; i < imax; i++) mainList[i].classList.add("pkg-ver-main");
	}

}

//module exports

module.exports = {
	updateVersionAndChildrenState,
};
