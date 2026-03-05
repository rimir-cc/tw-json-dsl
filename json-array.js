/*\
title: $:/plugins/yourname/json-dsl/json-array.js
type: application/javascript
module-type: widget
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

function coerceValue(value,type) {
  switch(type) {
    case "string": return String(value);
    case "number": return (value === "" ? null : Number(value));
    case "boolean":
    case "bool": return /^(true|yes|1)$/i.test(String(value));
    case "null": return null;
    case "raw": try { return JSON.parse(value); } catch(e) { return value; }
    default: return String(value);
  }
}

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

function JsonArrayWidget(parseTreeNode,options) {
  this.initialise(parseTreeNode,options);
}
JsonArrayWidget.prototype = new Widget();

JsonArrayWidget.prototype.render = function(parent,nextSibling) {
  this.parentDomNode = parent;
  this.execute();

  // Scalar mode: filter + type → push coerced values directly, no child iteration
  if(this.scalarType && this.items) {
    var arr = this.jsonBuilderContext.stack[this.jsonBuilderContext.stack.length - 1];
    for(var i = 0; i < this.items.length; i++) {
      arr.push(coerceValue(this.items[i], this.scalarType));
    }
  } else if(!this.items) {
    this.renderChildren(parent,nextSibling);
  } else {
    for(var i = 0; i < this.items.length; i++) {
      var item = this.items[i];
      this.makeChildWidgets();

      if(this.iterationVariable) {
        this.setVariable(this.iterationVariable,item);
      }
      this.setVariable("currentTiddler",item);
      this.setVariable("item",item);

      this.renderChildren(parent,nextSibling);
    }
  }

  if(this.jsonBuilderContext && this.didPushToStack) {
    this.jsonBuilderContext.stack.pop();
  }
};

JsonArrayWidget.prototype.execute = function() {
  this.computeAttributes();
  this.key = this.getAttribute("key",null);
  this.filter = this.getAttribute("filter",null);
  this.scalarType = this.getAttribute("type",null);
  this.iterationVariable = this.getAttribute("variable","item");

  this.makeChildWidgets();

  var ctx = getJsonContext(this);
  if(!ctx || typeof ctx !== "object") {
    ctx = {root: null, stack: [], captureStack: [], debug: false, warnings: []};
  } else {
    ctx.captureStack = ctx.captureStack || [];
    ctx.warnings = ctx.warnings || [];
  }

  var arr = [];
  var parentNode = ctx.stack.length ? ctx.stack[ctx.stack.length - 1] : null;
  var capture = ctx.captureStack.length ? ctx.captureStack[ctx.captureStack.length - 1] : null;

  // Capture only if not already claimed
  if(capture && !capture.claimed) {
    if(!capture.hasValue) {
      capture.value = arr;
      capture.hasValue = true;
      capture.claimed = true; // <-- consume capture for direct child only
    } else if(ctx.debug) {
      ctx.warnings.push("json-array: capture collision (extra nested value ignored)");
    }
  } else if(parentNode && !Array.isArray(parentNode)) {
    if(this.key) {
      parentNode[this.key] = arr;
    } else if(ctx.root === null) {
      ctx.root = arr;
    } else if(ctx.debug) {
      ctx.warnings.push("json-array: unattached array (missing key on object parent)");
    }
  } else if(Array.isArray(parentNode)) {
    parentNode.push(arr);
  } else if(ctx.root === null) {
    ctx.root = arr;
  } else if(ctx.debug) {
    ctx.warnings.push("json-array: unattached array (root already set)");
  }

  ctx.stack.push(arr);
  this.didPushToStack = true;
  this.jsonBuilderContext = ctx;

  this.items = this.filter ? this.wiki.filterTiddlers(this.filter,this) : null;
};

JsonArrayWidget.prototype.refresh = function(changedTiddlers) {
  this.refreshSelf();
  return true;
};

exports["json-array"] = JsonArrayWidget;

})();
