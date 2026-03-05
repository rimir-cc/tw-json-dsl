/*\
title: $:/plugins/yourname/json-dsl/json-emit.js
type: application/javascript
module-type: widget
\*/
(function(){
"use strict";
var Widget = require("$:/core/modules/widgets/widget.js").widget;

function getJsonContext(widget){ var w=widget; while(w){ if(w.jsonBuilderContext){return w.jsonBuilderContext;} w=w.parentWidget; } return null; }

function JsonEmitWidget(parseTreeNode,options){ this.initialise(parseTreeNode,options); }
JsonEmitWidget.prototype = new Widget();

JsonEmitWidget.prototype.render = function(parent,nextSibling){
  this.parentDomNode = parent;
  this.execute();
  var textNode = this.document.createTextNode(this.outputText || "");
  parent.insertBefore(textNode,nextSibling);
  this.domNodes.push(textNode);
};

JsonEmitWidget.prototype.execute = function() {
  this.computeAttributes();
  var indent = parseInt(this.getAttribute("indent","2"),10);
  if(isNaN(indent)) indent = 2;

  var ctx = getJsonContext(this);
  try {
    this.outputText = JSON.stringify(ctx ? ctx.root : null, null, indent);
  } catch (e) {
    this.outputText = "{\"error\":\"JSON emit failed\"}";
  }
};

JsonEmitWidget.prototype.refresh = function(changedTiddlers){ this.refreshSelf(); return true; };

exports["json-emit"] = JsonEmitWidget;
})();
