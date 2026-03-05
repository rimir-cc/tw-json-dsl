/*\
title: $:/plugins/rimir/json-dsl/json-save.js
type: application/javascript
module-type: widget

Writes built JSON into a tiddler field
\*/
(function(){

"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

function getJsonContext(widget) {
	var w = widget;
	while(w) {
		if(w.jsonBuilderContext) {
			return w.jsonBuilderContext;
		}
		w = w.parentWidget;
	}
	return null;
}

function JsonSaveWidget(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
}
JsonSaveWidget.prototype = new Widget();

JsonSaveWidget.prototype.render = function(parent,nextSibling) {
	this.parentDomNode = parent;
	this.execute();
};

JsonSaveWidget.prototype.execute = function() {
	this.computeAttributes();
	this.saveTiddler = this.getAttribute("$tiddler","");
	this.saveField = this.getAttribute("$field","text");
	this.saveIndent = parseInt(this.getAttribute("indent","2"),10);
	if(isNaN(this.saveIndent)) this.saveIndent = 2;

	if(!this.saveTiddler) return;

	var ctx = getJsonContext(this);
	if(!ctx) return;

	var json;
	try {
		json = JSON.stringify(ctx.root, null, this.saveIndent);
	} catch(e) {
		json = '{"error":"JSON save: stringify failed"}';
	}

	this.wiki.setText(this.saveTiddler, this.saveField, undefined, json);
};

JsonSaveWidget.prototype.refresh = function(changedTiddlers) {
	this.refreshSelf();
	return true;
};

exports["json-save"] = JsonSaveWidget;

})();
