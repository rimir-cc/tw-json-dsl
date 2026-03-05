/*\
title: $:/plugins/yourname/json-dsl/json-val.js
type: application/javascript
module-type: widget
\*/
(function(){
"use strict";
var Widget = require("$:/core/modules/widgets/widget.js").widget;

function getJsonContext(widget){ var w=widget; while(w){ if(w.jsonBuilderContext){return w.jsonBuilderContext;} w=w.parentWidget; } return null; }

function JsonValWidget(parseTreeNode,options){ this.initialise(parseTreeNode,options); }
JsonValWidget.prototype = new Widget();

JsonValWidget.prototype.render = function(parent,nextSibling){ this.parentDomNode = parent; this.execute(); };

JsonValWidget.prototype.execute = function() {
  this.computeAttributes();
  var ctx = getJsonContext(this), cap, value, type;
  if(!ctx || !ctx.captureStack || !ctx.captureStack.length) return;

  cap = ctx.captureStack[ctx.captureStack.length - 1];
  if(!cap) return;

  // Only direct child of json-prop may claim capture
  if(cap.claimed) {
    if(ctx.debug) { ctx.warnings.push("json-val: capture collision (extra scalar ignored)"); }
    return;
  }

  value = this.getAttribute("value","");
  type = (this.getAttribute("type","string") || "string").toLowerCase();

  cap.value = this.coerceValue(value,type);
  cap.hasValue = true;
  cap.claimed = true; // <-- consume capture
};

JsonValWidget.prototype.coerceValue = function(value,type){
  switch(type){
    case "string": return String(value);
    case "number": return (value === "" ? null : Number(value));
    case "boolean":
    case "bool": return /^(true|yes|1)$/i.test(String(value));
    case "null": return null;
    case "raw": try { return JSON.parse(value); } catch(e) { return value; }
    default: return String(value);
  }
};

JsonValWidget.prototype.refresh = function(changedTiddlers){ this.refreshSelf(); return true; };

exports["json-val"] = JsonValWidget;
})();
