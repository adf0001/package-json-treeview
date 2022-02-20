
// package-json-treeview @ npm, explore a top package.json in treeview.

var package_json_tool = require("package-json-tool");

var link_to_count_data_set = require("link-to-count-data-set");
var ui_model_treeview = require("ui-model-treeview");
var path_tool = require("path-tool");
var ele_id = require("ele-id");

require("htm-tool-css");	//require ht css

var semver_satisfies = require("package-json-version-tool").satisfy;

var packageJsonTreeview = {

	eleId: null,

	packageDataset: null,		//a package_json_data_set object, refer package-json-data-set @ npm
	packageDependent: null,		//a link_to_count_data_set object, link name->parentName

	lastSelected: null,		//the name item of the tree-item

	init: function (el, packageDataset) {
		this.eleId = ele_id(el);

		el.onclick = this._onClickPackageList
			|| (this._onClickPackageList = this.onClickPackageList.bind(this));

		if (packageDataset) this.updateView(packageDataset);
	},

	updateVersion: function (elArray, mainVer) {
		if (!(elArray instanceof Array)) elArray = [elArray];

		var i, imax = elArray.length, el, elVer, verMatch;
		for (i = 0; i < imax; i++) {
			el = ui_model_treeview.getNode(elArray[i]);
			elVer = ui_model_treeview.nodePart(el, "pkg-version");

			verMatch = semver_satisfies(mainVer, elVer.textContent);
			elVer.style.color = verMatch ? "black" : "red";
			elVer.title = verMatch ? "" : ('top version is ' + mainVer);
		}
	},

	loadFromNode: function (elNode, cb) {
		var elName = ui_model_treeview.nodeName(elNode);
		var elVersion = ui_model_treeview.nodePart(elNode, 'pkg-version');
		var _this = this;

		var name = elName.textContent;

		var isNew = !this.packageDataset.get(name);

		this.packageDataset.load(this.getParentPath(elNode), name, elVersion.textContent,
			function (err, data) {
				if (err) { cb(err, data); return; }

				elNode.setAttribute("pkg-path", path_tool.keyString(data.path));

				var mainItem = _this.packageDataset.get(name);
				_this.updateVersion(elNode, mainItem.pkg.version);
				if (isNew) {
					//update unloaded nodes
					var depItem = _this.packageDependent.data[name];
					if (depItem) {
						_this.updateVersion(Object.keys(depItem.fromData), mainItem.pkg.version);
					}
				}

				if (package_json_tool.anyDependencies(data.pkg)) {
					if (!ui_model_treeview.nodeChildren(elNode)) {
						_this.addPackageChildren(elNode, data, false, true);
					}
				}
				else {
					ui_model_treeview.setToExpandState(elNode, "disable");
					ui_model_treeview.nodeToExpand(elNode).classList.remove("cmd");
				}
				cb(err, data);
			}
		);
	},

	onClickPackageList: function (evt) {
		var el = evt.target;
		if (!el.classList.contains("cmd")) return;
		var _this = this;

		if (el.classList.contains("tree-to-expand")) {
			var elChildren = ui_model_treeview.nodeChildren(el.parentNode);
			if (elChildren) {
				var toShow = (elChildren.style.display == "none");

				ui_model_treeview.setToExpandState(el.parentNode, toShow ? false : true);
				elChildren.style.display = toShow ? "" : "none";
			}
			else {
				var elNode = ui_model_treeview.getNode(el);

				this.loadFromNode(elNode, function (err, data) {
					if (err) return;

					if (package_json_tool.anyDependencies(data.pkg)) {
						ui_model_treeview.setToExpandState(elNode, false);
						ui_model_treeview.nodeChildren(elNode).style.display = "";
					}
				});
			}
			return;
		}
		else if (el.classList.contains("pkg-dev")) {
			var elNode = ui_model_treeview.getNode(el.parentNode.parentNode);
			var elName = ui_model_treeview.nodeName(elNode);
			this.addPackageChildren(elNode, this.packageDataset.get(elName.textContent), true);
			return;
		}
		else if (el.classList.contains("tree-name")) {
			if (this.lastSelected) this.lastSelected.classList.remove("selected");
			el.classList.add("selected");
			this.lastSelected = el;

			var elNode = ui_model_treeview.getNode(el);

			this.loadFromNode(elNode, function (err, data) {
				if (err) return;
				if (_this.nameClickCallback) _this.nameClickCallback(err, data);
			});

			return;
		}
	},
	_onClickPackageList: null,	//binding this

	nameClickCallback: null,		//function(err,data)

	getParentPath: function (elNode) {
		var elParent = ui_model_treeview.getNode(elNode.parentNode);
		return elParent && elParent.getAttribute("pkg-path");
	},

	formatContent: function (name, versionText, toExpand, isDevelope) {

		var pkgItem = this.packageDataset.get(name);
		var verMatch = pkgItem ? semver_satisfies(pkgItem.pkg.version, versionText) : null;

		if (toExpand) {
			if (pkgItem && verMatch &&
				!package_json_tool.hasAnyDependencies(pkgItem.pkg)) {
				toExpand = false;
			}
		}

		var a = [];
		
		a[a.length] = "<span" +
			(toExpand ? " class='ht cmd tree-to-expand'" : "") +
			" style='padding:0em 0.5em;text-decoration:none;font-family:monospace;font-size:9pt;'>" +
			(toExpand ? "+" : ".") +
			"</span>";

		a[a.length] = "<span class='ht cmd tree-name'" + (isDevelope ? " style='color:black;'" : "") + ">" + name + "</span>";

		//version

		var verColor = pkgItem ? (verMatch ? "black" : "red") : "gray";
		var verTitle = pkgItem ? (verMatch ? "" : (" title='top version is " + pkgItem.pkg.version + "'")) : "";

		a[a.length] = "<span class='pkg-version' style='margin-left:0.5em;font-size:9pt;" +
			"color:" + verColor + ";" + "'" + verTitle +
			">" + versionText + "</span>";

		a[a.length] = "<span class='pkg-dependent' style='margin-left:1em;font-size:9pt;'></span>";

		return a.join("");
	},

	addDependItems: function (elChildren, items, isDevelope) {
		var parentName = ui_model_treeview.nodeName(elChildren).textContent;

		var i, content, el;
		for (i in items) {
			content = this.formatContent(i, items[i], true, isDevelope);
			el = ui_model_treeview.addChild(elChildren, { content: content }, true);
			this.packageDependent.add(i, parentName, ele_id(ui_model_treeview.nodePart(el, "pkg-dependent")));
		}
	},

	addPackageChildren: function (elNode, pkgItem, isDevelope, hide) {
		var pkg = pkgItem.pkg;

		if (!package_json_tool.anyDependencies(pkg)) {
			ui_model_treeview.setToExpandState(elNode, "disable");
			return;
		}

		var elChildren = ui_model_treeview.nodePart(elNode, "tree-children", true);
		if (elChildren && hide) elChildren.style.display = "none";

		if (!isDevelope) {
			if (pkg.dependencies) {
				this.addDependItems(elChildren, pkg.dependencies);
			}
			if (package_json_tool.hasDependencies(pkg, "dev")) {
				var html = "<div class='tree-delay'><span class='ht cmd pkg-dev' style='color:gray;margin-left:1em;text-decoration:none;'>... devDependencies</span></div>";
				ui_model_treeview.addChild(elChildren, { html: html }, true);
			}
		}
		else {
			if (elChildren.lastChild && elChildren.lastChild.classList.contains("tree-delay")) {
				elChildren.removeChild(elChildren.lastChild);

				this.addDependItems(elChildren, pkg.devDependencies, true);
			}
		}
	},

	formatDependent: function (eleId, dependItem) {
		if (dependItem.count < 2) return;

		var el = (typeof eleId === "string") ? document.getElementById(eleId) : eleId;

		el.title = "Dependents count: " + dependItem.count + "\n" + Object.keys(dependItem.to).join(", ");
		el.textContent = "[" + dependItem.count + "]";

	},

	updateView: function (packageDataset) {

		var elView = document.getElementById(this.eleId);

		this.packageDataset = packageDataset;

		this.packageDependent = new link_to_count_data_set.class(this.formatDependent);

		this.lastSelected = null;

		//add root
		elView.innerHTML = "";

		var topItem = packageDataset.top;
		var topPkg = topItem.pkg;

		var elRoot = ui_model_treeview.addChild(elView,
			{ contentHtml: this.formatContent(topPkg.name, topPkg.version), }, true);

		//console.log(topItem.path);
		elRoot.setAttribute("pkg-path", path_tool.keyString(topItem.path));

		//children
		this.addPackageChildren(elRoot, topItem);
	},
};

//module

exports.class = function (el, packageDataset) {
	var o = Object.create(packageJsonTreeview);
	o.init(el, packageDataset);
	return o;
}
