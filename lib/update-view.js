
var { getContainer, addNode, nodeChildren } = require("treeview-model");

var link_to_count_data_set = require("link-to-count-data-set");

var { setOnClick } = require("./set-on-click.js");
var { updateChildren } = require("./update-children.js");
var { formatContent } = require("./format-content.js");

var path_tool = require("path-tool");

//css style
var add_css_text = require("add-css-text");
var css = require("../package-json-treeview.css");

/*
update view / init
	options:
		.dataset
			internal; a package_json_data_set object, refer package-json-data-set @ npm

		.dependent
			internal; a link_to_count_data_set object, link name->parentName
*/
var updateView = function (el, packageDataset, options) {
	//arguments
	var container = getContainer(el);
	if (!container) return;

	container.classList.add("package-json-treeview");

	//init css
	if (css) {
		add_css_text(css, "package-json-treeview-css");
		css = null;
	}

	if (!options) options = {};

	//dataset
	options.dataset = packageDataset;
	options.dependent = new link_to_count_data_set.class(formatDependent);

	//on-click event
	setOnClick(container, options);

	//update view
	container.innerHTML = "";

	//add root
	var topItem = packageDataset.top;
	var topPkg = topItem.pkg;

	var elRoot = addNode(container,
		{ innerHtml: formatContent(topItem, topPkg.name, topPkg.version), }, null, true);

	elRoot.classList.add("pkg-loaded");		//loaded flag

	//console.log(topItem.path);
	elRoot.setAttribute("pkg-path", path_tool.keyString(topItem.path));

	if (typeof packageDataset !== "undefined") updateChildren(nodeChildren(elRoot, true), topItem, options);

	setTimeout(function () { container.scrollTop = 0; }, 0);	//scroll to top
}

var formatDependent = function (eleId, dependItem) {
	if (dependItem.count < 2) return;

	var el = (typeof eleId === "string") ? document.getElementById(eleId) : eleId;

	el.title = "Dependents count: " + dependItem.count + "\n" + Object.keys(dependItem.to).join(", ");
	el.textContent = "[" + dependItem.count + "]";
}

//module exports

module.exports = {
	updateView,

	initView: updateView,	//to initialize view
};
