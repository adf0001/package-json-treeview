
//global variable, for html page, refer tpsvr @ npm.
package_json_treeview = require("../index.js");
__package_json = require("../package.json");
package_json_data_set = require("package-json-data-set");

base_test_data = require("treeview-model/test/test-data.js");

module.exports = {

	"package_json_treeview": function (done, treeviewModel) {
		if (typeof window === "undefined") throw "disable for nodejs";

		if (treeviewModel) package_json_treeview = treeviewModel;

		base_test_data["level-2"](
			function (err, data) {
				if (err) { done(err); return; }

				//prepare dataset
				var pkgTop = __package_json;
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

				var dataset = new package_json_data_set.class(pkgTop, pkgTopPath, loadPackageFunc);

				//dom
				var elTool = document.getElementById('div-tool');
				elTool.insertAdjacentHTML("beforeend",
					"level-4: <span id='name-click-msg' style='color:blue;border:1px solid lightgrey;margin:0.1em;display:inline-block;min-width:30em;'>&nbsp;</span>"
				);

				var container = package_json_treeview.getContainer("nd1");

				package_json_treeview.updateView(container, dataset,
					{
						nameClickCallback: function (err, data) {
							document.getElementById('name-click-msg').innerHTML = err || (data.pkg.name + " clicked");
						}
					}
				);

				container.addEventListener("click", function (evt) {
					var target = evt.target;
					if (target && target.classList.contains("pkg-dependent") && target.title) {
						alert(target.title);
					}
				});
			},
			package_json_treeview,
			true
		);

		return "ui-test";
	},

};

// for html page
//if (typeof setHtmlPage === "function") setHtmlPage("title", "10em", 1);	//page setting
if (typeof showResult !== "function") showResult = function (text) { console.log(text); }

//for mocha
if (typeof describe === "function") describe('package_json_treeview', function () { for (var i in module.exports) { it(i, module.exports[i]).timeout(5000); } });
