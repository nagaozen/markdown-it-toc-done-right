/*! markdown-it-toc-done-right 2.0.3 https://github.com//nagaozen/markdown-it-toc-done-right @license MIT */(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.markdownitTocDoneRight = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function slugify(x) {
	return encodeURIComponent(String(x).trim().toLowerCase().replace(/\s+/g, '-'));
}

function htmlencode(x) {
	// safest, delegate task to native -- IMPORTANT: enabling this breaks both jest and runkit, but with browserify it's fine
	/*	if(document && document.createElement) {
 		const el = document.createElement("div");
 		el.innerText = x;
 		return el.innerHTML;
 	}*/

	return String(x).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

module.exports = function toc_plugin(md, options) {

	options = Object.assign({}, {
		placeholder: "${toc}",
		slugify: slugify,
		containerClass: "table-of-contents",
		level: 1,
		listType: "ol",
		format: undefined
	}, options);

	var final_state = void 0;

	function toc(state, startLine /*, endLine, silent*/) {
		var token = void 0;
		var pos = state.bMarks[startLine] + state.tShift[startLine];
		var max = state.eMarks[startLine];

		// if it's indented more than 3 spaces, it should be a code block
		/*if(state.sCount[startLine] - state.blkIndent >= 4) return false;*/

		// check starting chars and reject fast if they doesn't match
		for (var i = 0, len = options.placeholder.length; i < len; i++) {
			if (state.src.charCodeAt(pos + i) !== options.placeholder.charCodeAt(i) || pos >= max) return false;
		}

		//		if(silent) return true;

		state.line = startLine + 1;

		token = state.push("toc_open", "nav", 1);
		token.markup = options.placeholder;
		token.map = [startLine, state.line];

		token = state.push("toc_body", "", 0);
		token.markup = options.placeholder;
		token.map = [startLine, state.line];
		token.children = [];

		token = state.push("toc_close", "nav", -1);
		token.markup = options.placeholder;

		return true;
	}

	md.renderer.rules.toc_open = function () /*tokens, idx, options, env, renderer*/{
		return "<nav class=\"" + htmlencode(options.containerClass) + "\">";
	};

	md.renderer.rules.toc_close = function () /*tokens, idx, options, env, renderer*/{
		return '</nav>';
	};

	md.renderer.rules.toc_body = function () /*tokens, idx, options, env, renderer*/{
		return ast_html(headings_ast(final_state.tokens));
	};

	function ast_html(tree, uniques) {
		uniques = uniques || {};
		function unique(s) {
			var u = s;
			var i = 2;
			while (uniques.hasOwnProperty(u)) {
				u = s + "-" + i++;
			}uniques[u] = true;
			return u;
		}

		var keys = Object.keys(tree.c);
		if (keys.length === 0) return "";

		var buffer = "<" + htmlencode(options.listType) + ">";
		keys.forEach(function (key) {
			var node = tree.c[key];
			buffer += "<li><a href=\"#" + unique(options.slugify(key)) + "\">" + (typeof options.format === "function" ? options.format(key, htmlencode) : htmlencode(key)) + "</a>" + ast_html(node, uniques) + "</li>";
		});
		buffer += "</" + htmlencode(options.listType) + ">";

		return buffer;
	}

	function headings_ast(tokens) {
		var ast = { l: 0, n: "", c: {} };
		var stack = [ast];
		for (var i = 0, iK = tokens.length; i < iK; i++) {
			var token = tokens[i];
			if (token.type === "heading_open") {
				var node = {
					l: parseInt(token.tag.substr(1), 10),
					n: tokens[i + 1].children.filter(function (token) {
						return token.type === "text" || token.type === "code_inline";
					}).reduce(function (acc, t) {
						return acc + t.content;
					}, ""),
					c: {}
				};

				if (node.l >= options.level) {
					if (node.l > stack[0].l) {
						stack[0].c[node.n] = node;
						stack.unshift(node);
					} else if (node.l === stack[0].l) {
						stack[1].c[node.n] = node;
						stack[0] = node;
					} else {
						while (node.l <= stack[0].l) {
							stack.shift();
						}stack[0].c[node.n] = node;
						stack.unshift(node);
					}
				}
			}
		}
		return ast;
	}

	md.core.ruler.push("final_state", function (state) {
		final_state = state;
	});

	md.block.ruler.before("heading", "toc", toc, {
		alt: ["paragraph", "reference", "blockquote"]
	});
};

},{}]},{},[1])(1)
});
