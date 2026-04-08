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

	it("should save JSON with indent=0 (compact)", function() {
		var wiki = setupWiki();
		var wikitext = '<$json-obj><$json-prop key="a" value="1"/><$json-prop key="b" value="2"/><$json-save $tiddler="CompactOut" indent="0"/></$json-obj>';
		renderAndGetText(wiki, wikitext);
		var output = wiki.getTiddlerText("CompactOut");
		expect(output).toBe('{"a":"1","b":"2"}');
	});

	it("should save JSON with indent=4 (pretty)", function() {
		var wiki = setupWiki();
		var wikitext = '<$json-obj><$json-prop key="x" value="1"/><$json-save $tiddler="PrettyOut" indent="4"/></$json-obj>';
		renderAndGetText(wiki, wikitext);
		var output = wiki.getTiddlerText("PrettyOut");
		expect(output).toBe('{\n    "x": "1"\n}');
	});

	it("should fall back to string for invalid raw JSON", function() {
		var wiki = setupWiki();
		var wikitext = '<$json-obj><$json-prop key="bad" value="not{json" type="raw"/><$json-emit indent="0"/></$json-obj>';
		var output = renderAndGetText(wiki, wikitext);
		var parsed = JSON.parse(output);
		expect(parsed.bad).toBe("not{json");
	});

	it("should produce no output when json-prop has no key", function() {
		var wiki = setupWiki();
		var wikitext = '<$json-obj><$json-prop value="orphan"/><$json-emit indent="0"/></$json-obj>';
		var output = renderAndGetText(wiki, wikitext);
		var parsed = JSON.parse(output);
		expect(Object.keys(parsed).length).toBe(0);
	});

	it("should handle json-item with raw type", function() {
		var wiki = setupWiki();
		var wikitext = '<$json-obj><$json-prop key="list"><$json-array><$json-item value=\'[1,2]\' type="raw"/><$json-item value="plain"/></$json-array></$json-prop><$json-emit indent="0"/></$json-obj>';
		var output = renderAndGetText(wiki, wikitext);
		var parsed = JSON.parse(output);
		expect(parsed.list[0]).toEqual([1,2]);
		expect(parsed.list[1]).toBe("plain");
	});

	it("should handle json-item with invalid raw type gracefully", function() {
		var wiki = setupWiki();
		var wikitext = '<$json-obj><$json-prop key="list"><$json-array><$json-item value="broken{" type="raw"/></$json-array></$json-prop><$json-emit indent="0"/></$json-obj>';
		var output = renderAndGetText(wiki, wikitext);
		var parsed = JSON.parse(output);
		expect(parsed.list[0]).toBe("broken{");
	});

	it("should not save when $tiddler is empty", function() {
		var wiki = setupWiki();
		var wikitext = '<$json-obj><$json-prop key="x" value="1"/><$json-save $tiddler=""/></$json-obj>';
		renderAndGetText(wiki, wikitext);
		expect(wiki.getTiddler("")).toBeUndefined();
	});

	it("should use default indent=2 for invalid indent value", function() {
		var wiki = setupWiki();
		var wikitext = '<$json-obj><$json-prop key="x" value="1"/><$json-save $tiddler="BadIndent" indent="abc"/></$json-obj>';
		renderAndGetText(wiki, wikitext);
		var output = wiki.getTiddlerText("BadIndent");
		expect(output).toBe('{\n  "x": "1"\n}');
	});
});

describe("json-dsl: json-debug", function() {

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

	it("should show no-context message outside json-obj", function() {
		var wiki = setupWiki();
		var output = renderAndGetText(wiki, '<$json-debug/>');
		expect(output).toContain("no json-builder-context");
	});

	it("should show full context in default mode", function() {
		var wiki = setupWiki();
		var output = renderAndGetText(wiki, '<$json-obj debug="yes"><$json-prop key="a" value="1"/><$json-debug/></$json-obj>');
		var parsed = JSON.parse(output);
		expect(parsed.debug).toBe(true);
		expect(parsed.root).toBeDefined();
		expect(typeof parsed.stackDepth).toBe("number");
		expect(typeof parsed.captureDepth).toBe("number");
		expect(Array.isArray(parsed.warnings)).toBe(true);
	});

	it("should show only warnings in warnings mode", function() {
		var wiki = setupWiki();
		var output = renderAndGetText(wiki, '<$json-obj debug="yes"><$json-debug mode="warnings"/></$json-obj>');
		var parsed = JSON.parse(output);
		expect(parsed.debug).toBe(true);
		expect(Array.isArray(parsed.warnings)).toBe(true);
		expect(parsed.root).toBeUndefined();
		expect(parsed.stackDepth).toBeUndefined();
	});

	it("should show only root in root mode", function() {
		var wiki = setupWiki();
		var output = renderAndGetText(wiki, '<$json-obj><$json-prop key="x" value="1"/><$json-debug mode="root"/></$json-obj>');
		var parsed = JSON.parse(output);
		expect(parsed.x).toBe("1");
		expect(parsed.debug).toBeUndefined();
	});
});

describe("json-dsl: json-array iteration", function() {

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

	it("should iterate with default variable name", function() {
		var wiki = setupWiki([
			{title: "P1", text: "Alice"},
			{title: "P2", text: "Bob"}
		]);
		var wikitext = '<$json-obj><$json-prop key="names"><$json-array filter="P1 P2"><$json-item value=<<item>>/></$json-array></$json-prop><$json-emit indent="0"/></$json-obj>';
		var output = renderAndGetText(wiki, wikitext);
		var parsed = JSON.parse(output);
		expect(parsed.names).toEqual(["P1","P2"]);
	});

	it("should iterate with custom variable name", function() {
		var wiki = setupWiki([
			{title: "T1", myfield: "val1"},
			{title: "T2", myfield: "val2"}
		]);
		var wikitext = '<$json-obj><$json-prop key="data"><$json-array filter="T1 T2" variable="t"><$json-obj><$json-prop key="id" value=<<t>>/></$json-obj></$json-array></$json-prop><$json-emit indent="0"/></$json-obj>';
		var output = renderAndGetText(wiki, wikitext);
		var parsed = JSON.parse(output);
		expect(parsed.data).toEqual([{id:"T1"},{id:"T2"}]);
	});

	it("should produce empty array for empty filter result", function() {
		var wiki = setupWiki();
		var wikitext = '<$json-obj><$json-prop key="empty"><$json-array filter="[[nonexistent]]"><$json-item value=<<item>>/></$json-array></$json-prop><$json-emit indent="0"/></$json-obj>';
		var output = renderAndGetText(wiki, wikitext);
		var parsed = JSON.parse(output);
		expect(parsed.empty).toEqual(["nonexistent"]);
	});

	it("should build nested arrays in objects during iteration", function() {
		var wiki = setupWiki([
			{title: "G1", tags: "alpha beta"},
			{title: "G2", tags: "gamma"}
		]);
		var wikitext = '<$json-obj><$json-prop key="groups"><$json-array filter="G1 G2" variable="g"><$json-obj><$json-prop key="name" value=<<g>>/><$json-prop key="tags"><$json-array filter="[<g>get[tags]enlist-input[]]" type="string"/></$json-prop></$json-obj></$json-array></$json-prop><$json-emit indent="0"/></$json-obj>';
		var output = renderAndGetText(wiki, wikitext);
		var parsed = JSON.parse(output);
		expect(parsed.groups[0].name).toBe("G1");
		expect(parsed.groups[0].tags).toEqual(["alpha","beta"]);
		expect(parsed.groups[1].name).toBe("G2");
		expect(parsed.groups[1].tags).toEqual(["gamma"]);
	});

	it("should handle no-children no-filter array (manual items only)", function() {
		var wiki = setupWiki();
		var wikitext = '<$json-obj><$json-prop key="arr"><$json-array><$json-item value="a"/><$json-item value="b"/></$json-array></$json-prop><$json-emit indent="0"/></$json-obj>';
		var output = renderAndGetText(wiki, wikitext);
		var parsed = JSON.parse(output);
		expect(parsed.arr).toEqual(["a","b"]);
	});
});
