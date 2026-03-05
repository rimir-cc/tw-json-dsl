/*\
title: $:/plugins/yourname/json-dsl/json-obj.js
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

function JsonObjWidget(parseTreeNode,options) {
  this.initialise(parseTreeNode,options);
}
JsonObjWidget.prototype = new Widget();

JsonObjWidget.prototype.render = function(parent,nextSibling) {
  this.parentDomNode = parent;
  this.execute();
  this.renderChildren(parent,nextSibling);

  if(this.jsonBuilderContext && this.didPushToStack) {
    this.jsonBuilderContext.stack.pop();
  }
};

JsonObjWidget.prototype.execute = function() {
  this.computeAttributes();
  this.makeChildWidgets();

  var ctx = getJsonContext(this);
  if(!ctx || typeof ctx !== "object") {
    ctx = {
      root: null,
      stack: [],
      captureStack: [],
      debug: false,
      warnings: []
    };
  } else {
    ctx.captureStack = ctx.captureStack || [];
    ctx.warnings = ctx.warnings || [];
  }

  if(this.getAttribute("debug","no") === "yes") {
    ctx.debug = true;
  }

  var obj = {};
  var parentNode = ctx.stack.length ? ctx.stack[ctx.stack.length - 1] : null;
  var capture = ctx.captureStack.length ? ctx.captureStack[ctx.captureStack.length - 1] : null;

  // Capture only if not already claimed
  if(capture && !capture.claimed) {
    if(!capture.hasValue) {
      capture.value = obj;
      capture.hasValue = true;
      capture.claimed = true; // <-- consume capture for direct child only
    } else if(ctx.debug) {
      ctx.warnings.push("json-obj: capture collision (extra nested value ignored)");
    }
  } else if(Array.isArray(parentNode)) {
    parentNode.push(obj);
  } else if(ctx.root === null) {
    ctx.root = obj;
  } else if(ctx.debug) {
    ctx.warnings.push("json-obj: unattached object (no array parent, root already set)");
  }

  ctx.stack.push(obj);
  this.didPushToStack = true;
  this.jsonBuilderContext = ctx;
};

JsonObjWidget.prototype.refresh = function(changedTiddlers) {
  var changedAttributes = this.computeAttributes();
  if(Object.keys(changedAttributes).length > 0) {
    this.refreshSelf();
    return true;
  }
  return this.refreshChildren(changedTiddlers);
};

exports["json-obj"] = JsonObjWidget;

})();
