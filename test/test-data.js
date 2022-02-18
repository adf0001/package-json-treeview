
//global variable, for html page, refer tpsvr @ npm.
package_json_treeview = require("../package-json-treeview.js");

module.exports = {

	"package_json_treeview": function (done) {
		if (typeof window === "undefined") throw "disable for nodejs";

		//prepare dataset
		var pkgTop = require("../package.json");
		var pkgTopPath = "/virtual-path";
		var loadPackageFunc = function (pathFrom, name, cb, noLoop) {
			var packagePath = pathFrom + "/node_modules/" + name;
			var url = "../" + pathFrom.slice(pkgTopPath.length) + "/node_modules/" + name + "/package.json";
			url = url.replace(/\/+/g, "/");
			console.log("load from url, " + name + ", " + url);

			var xq = new XMLHttpRequest();
			xq.open("GET", url, true);
			xq.onreadystatechange = function () {
				if (xq.readyState === 4) {
					if (xq.status == 404) {
						if (pathFrom != pkgTopPath && !noLoop) {
							loadPackageFunc(pkgTopPath, name, cb, true);	//load from top
						}
						else { cb("404 unfound"); }
						return;
					}
					cb(null, { path: packagePath, pkg: JSON.parse(xq.responseText) });
				}
			}
			xq.send();
		}

		var package_json_data_set = require("package-json-data-set");
		var dataset = new package_json_data_set.class(pkgTop, pkgTopPath, loadPackageFunc);

		//dom
		document.getElementById('divResult3').innerHTML =
			"<div style='color:blue;' id='name-click-msg'></div><div id='pkg-treeview'></div>";

		var el = document.getElementById('pkg-treeview');

		//.class(el, packageDataset)
		var tv = new package_json_treeview.class(el, dataset);
		tv.nameClickCallback = function (err, data) {
			document.getElementById('name-click-msg').innerHTML = err || (data.pkg.name + " clicked");
		}

		el.addEventListener("click", function (evt) {
			var target = evt.target;
			if (target && target.classList.contains("pkg-dependent") && target.title) {
				alert(target.title);
			}
		})

		return "ui-test";
	},

};

// for html page
//if (typeof setHtmlPage === "function") setHtmlPage("title", "10em", 1);	//page setting
if (typeof showResult !== "function") showResult = function (text) { console.log(text); }

//for mocha
if (typeof describe === "function") describe('package_json_treeview', function () { for (var i in module.exports) { it(i, module.exports[i]).timeout(5000); } });
