/*\
title: $:/plugins/rimir/json-dsl/test/test-json-building.js
type: application/javascript
tags: [[$:/tags/test-spec]]

Tests for json-dsl features that need JS assertions (json-save, raw type, empty number).
Most json-dsl tests are wiki-based — see test/*.tid files.

\*/
"use strict";

describe("json-dsl: JS-only tests", function() {

	function renderAndGetText(wiki, wikitext) {
		wiki.addTiddler({title: "Root", text: wikitext, type: "text/vnd.tiddlywiki"});
		var widgetNode = wiki.makeTranscludeWidget("Root", {document: $tw.fakeDocument});
		var container = $tw.fakeDocument.createElement("div");
		widgetNode.render(container, null);
		return container.textContent || "";
	}

	function setupWiki(tiddlers) {
		var wiki = new $tw.Wiki();
		wiki.addTiddlers(tiddlers || []);
		wiki.addIndexersToWiki();
		return wiki;
	}

	it("should coerce raw JSON type via json-prop", function() {
		var wiki = setupWiki();
		var wikitext = '<$json-obj><$json-prop key="data" value=\'{"x":1}\' type="raw"/><$json-emit indent="0"/></$json-obj>';
		var output = renderAndGetText(wiki, wikitext);
		var parsed = JSON.parse(output);
		expect(parsed.data).toEqual({x: 1});
	});

	it("should return null for empty string number coercion", function() {
		var wiki = setupWiki();
		var wikitext = '<$json-obj><$json-prop key="n" value="" type="number"/><$json-emit indent="0"/></$json-obj>';
		var output = renderAndGetText(wiki, wikitext);
		var parsed = JSON.parse(output);
		expect(parsed.n).toBeNull();
	});

	it("should save JSON to a tiddler with json-save", function() {
		var wiki = setupWiki();
		var wikitext = '<$json-obj><$json-prop key="saved" value="yes"/><$json-save $tiddler="OutputTiddler"/></$json-obj>';
		renderAndGetText(wiki, wikitext);
		var output = wiki.getTiddlerText("OutputTiddler");
		expect(output).toBeDefined();
		var parsed = JSON.parse(output);
		expect(parsed.saved).toBe("yes");
	});

	it("should save JSON to a custom field", function() {
		var wiki = setupWiki();
		var wikitext = '<$json-obj><$json-prop key="x" value="1"/><$json-save $tiddler="Out" $field="my-data"/></$json-obj>';
		renderAndGetText(wiki, wikitext);
		var tiddler = wiki.getTiddler("Out");
		expect(tiddler).toBeDefined();
		var parsed = JSON.parse(tiddler.fields["my-data"]);
		expect(parsed.x).toBe("1");
	});
});
