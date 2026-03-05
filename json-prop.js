/*\
title: $:/plugins/yourname/json-dsl/json-prop.js
type: application/javascript
module-type: widget
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
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

function JsonPropWidget(parseTreeNode,options) {
  this.initialise(parseTreeNode,options);
}
JsonPropWidget.prototype = new Widget();

JsonPropWidget.prototype.render = function(parent,nextSibling) {
  this.parentDomNode = parent;
  this.execute();

  if(this.useBodyValue && this.currentObject && this.key) {
    this.renderChildren(parent,nextSibling);

    var ctx = this.jsonBuilderContext;
    if(ctx && ctx.captureStack && ctx.captureStack.length) {
      var cap = ctx.captureStack[ctx.captureStack.length - 1];
      if(cap && cap.hasValue) {
        this.currentObject[this.key] = cap.value;
      } else if(!this.omitEmpty) {
        this.currentObject[this.key] = null;
      }
      ctx.captureStack.pop();
    }
  }
};

JsonPropWidget.prototype.execute = function() {
  this.computeAttributes();
  this.makeChildWidgets();

  this.key = this.getAttribute("key","");
  this.type = (this.getAttribute("type","string") || "string").toLowerCase();
  this.omitEmpty = this.getAttribute("omit-empty","no") === "yes";
  this.filter = this.getAttribute("filter",null);

  if(!this.key) return;

  var ctx = getJsonContext(this);
  if(!ctx || !ctx.stack || !ctx.stack.length) return;

  var current = ctx.stack[ctx.stack.length - 1];
  if(!current || Array.isArray(current)) return;

  this.jsonBuilderContext = ctx;
  this.currentObject = current;

  this.useBodyValue = !!(this.parseTreeNode.children && this.parseTreeNode.children.length);
  if(this.useBodyValue) {
    ctx.captureStack.push({
      hasValue: false,
      claimed: false,   // <-- important
      value: null,
      key: this.key
    });
    return;
  }

  var value;
  if(this.filter) {
    var results = this.wiki.filterTiddlers(this.filter,this);
    value = results.length ? results[0] : "";
  } else {
    value = this.getAttribute("value","");
  }

  if(this.omitEmpty && (value === "" || value == null)) return;

  current[this.key] = this.coerceValue(value,this.type);
};

JsonPropWidget.prototype.coerceValue = function(value,type) {
  switch(type) {
    case "string": return String(value);
    case "number": return (value === "" ? null : Number(value));
    case "boolean":
    case "bool": return /^(true|yes|1)$/i.test(String(value));
    case "null": return null;
    case "raw":
      try { return JSON.parse(value); } catch (e) { return value; }
    default: return String(value);
  }
};

JsonPropWidget.prototype.refresh = function(changedTiddlers) {
  return this.refreshChildren(changedTiddlers) || (this.refreshSelf(), true);
};

exports["json-prop"] = JsonPropWidget;

})();
