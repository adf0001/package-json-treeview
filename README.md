# package-json-treeview
explore a top package.json in treeview

# Install
```
npm install package-json-treeview
```

# Usage
```javascript
var package_json_treeview = require("package-json-treeview");

//prepare dataset, like package-json-data-set @ npm
var pkgTop = require("../package.json");
var pkgTopPath = "/virtual-path";
var loadPackageFunc = function (pathFrom, name, cb, noLoop) {
	...
}

var package_json_data_set = require("package-json-data-set");
var dataset = new package_json_data_set.class(pkgTop, pkgTopPath, loadPackageFunc);

//dom
document.getElementById('divResult3').innerHTML =
	"<div class='tree-container' id='pkg-treeview'></div>";

var el = document.getElementById('pkg-treeview');

//.class(el, packageDataset)
package_json_treeview.updateView(el, dataset);

el.addEventListener("click", function (evt) {
	var target = evt.target;
	if (target && target.classList.contains("pkg-dependent") && target.title) {
		alert(target.title);
	}
})

```
