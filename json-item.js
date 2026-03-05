/*\
title: $:/plugins/yourname/json-dsl/json-item.js
type: application/javascript
module-type: widget
\*/
(function(){
"use strict";
var Widget = require("$:/core/modules/widgets/widget.js").widget;

function getJsonContext(widget){ var w=widget; while(w){ if(w.jsonBuilderContext){return w.jsonBuilderContext;} w=w.parentWidget; } return null; }

function JsonItemWidget(parseTreeNode,options){ this.initialise(parseTreeNode,options); }
JsonItemWidget.prototype = new Widget();

JsonItemWidget.prototype.render = function(parent,nextSibling){ this.parentDomNode = parent; this.execute(); };

JsonItemWidget.prototype.execute = function() {
  this.computeAttributes();
  var ctx = getJsonContext(this), current, value, type;
  if(!ctx || !ctx.stack || !ctx.stack.length) return;
  current = ctx.stack[ctx.stack.length-1];
  if(!Array.isArray(current)) return;

  value = this.getAttribute("value","");
  type = (this.getAttribute("type","string") || "string").toLowerCase();
  current.push(this.coerceValue(value,type));
};

JsonItemWidget.prototype.coerceValue = function(value,type){
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

JsonItemWidget.prototype.refresh = function(changedTiddlers){ this.refreshSelf(); return true; };

exports["json-item"] = JsonItemWidget;
})();
