/*\
title: $:/plugins/yourname/json-dsl/json-debug.js
type: application/javascript
module-type: widget
\*/
(function(){
"use strict";
var Widget = require("$:/core/modules/widgets/widget.js").widget;

function getJsonContext(widget){ var w=widget; while(w){ if(w.jsonBuilderContext){return w.jsonBuilderContext;} w=w.parentWidget; } return null; }

function JsonDebugWidget(parseTreeNode,options){ this.initialise(parseTreeNode,options); }
JsonDebugWidget.prototype = new Widget();

JsonDebugWidget.prototype.render = function(parent,nextSibling){
  this.parentDomNode = parent;
  this.execute();
  var pre = this.document.createElement("pre");
  pre.appendChild(this.document.createTextNode(this.outputText || ""));
  parent.insertBefore(pre,nextSibling);
  this.domNodes.push(pre);
};

JsonDebugWidget.prototype.execute = function() {
  this.computeAttributes();
  var mode = this.getAttribute("mode","full");
  var ctx = getJsonContext(this);

  if(!ctx) {
    this.outputText = "json-debug: no json-builder-context (place inside <$json-obj>/<$json-array>)";
    return;
  }

  var payload = (mode === "warnings") ? {
    debug: !!ctx.debug,
    warnings: ctx.warnings || []
  } : (mode === "root" ? ctx.root : {
    debug: !!ctx.debug,
    root: ctx.root,
    stackDepth: (ctx.stack || []).length,
    captureDepth: (ctx.captureStack || []).length,
    warnings: ctx.warnings || []
  });

  this.outputText = JSON.stringify(payload,null,2);
};

JsonDebugWidget.prototype.refresh = function(changedTiddlers){ this.refreshSelf(); return true; };

exports["json-debug"] = JsonDebugWidget;
})();
