"use strict"

const S = require("string");

function htmlencode(x) {
	// safest, delegate task to native -- IMPORTANT: enabling this breaks both jest and runkit
/*	if(document && document.createElement) {
		const el = document.createElement("div");
		el.innerText = x;
		return el.innerHTML;
	}*/

	// string.js uses a hard-coded list of entities based on underscore.string, so it's possible that something is missing out.
	return S(x).escapeHTML();
}

module.exports = function toc_plugin(md, options) {

	options = Object.assign({}, {
		placeholder: "${toc}",
		slugify: function(s) {
			return S(s).slugify().toString();
		},
		containerClass: "table-of-contents",
		listType: "ol",
		format: undefined
	}, options);

	let final_state;

	function toc(state, startLine, endLine, silent) {
		let token;
		const pos = state.bMarks[startLine] + state.tShift[startLine];
		const max = state.eMarks[startLine];

		// if it's indented more than 3 spaces, it should be a code block
		if(state.sCount[startLine] - state.blkIndent >= 4) return false;

		// check starting chars and reject fast if they doesn't match
		for(let i = 0, len = options.placeholder.length; i < len; i++) {
			if (state.src.charCodeAt(pos + i) !== options.placeholder.charCodeAt(i) || pos >= max) return false;
		}

		if(silent) return true;

		state.line = startLine + 1;

		token        = state.push("toc_open", "nav", 1);
		token.markup = options.placeholder;
		token.map    = [ startLine, state.line ];

		token          = state.push("toc_body", "", 0);
		token.markup   = options.placeholder;
		token.map      = [ startLine, state.line ];
		token.children = [];

		token        = state.push("toc_close", "nav", -1);
		token.markup = options.placeholder;

		return true;
	}

	md.renderer.rules.toc_open = function(/*tokens, idx, options, env, renderer*/) {
		return `<nav class="${htmlencode(options.containerClass)}">`;
	}

	md.renderer.rules.toc_close = function(/*tokens, idx, options, env, renderer*/) {
		return '</nav>';
	}

	md.renderer.rules.toc_body = function(/*tokens, idx, options, env, renderer*/) {
		return ast_html( headings_ast( final_state.tokens ) );
	}

	function ast_html(tree) {
		const keys = Object.keys(tree);
		if( keys.length === 0 ) return "";

		let buffer = (`<${htmlencode(options.listType)}>`);
		keys.forEach(function(key){
			const node = tree[key];
			buffer += (`<li><a href="#${options.slugify(key)}">${typeof options.format === "function" ? options.format(key) : htmlencode(key)}</a>${ast_html(node)}</li>`);
		});
		buffer += (`</${htmlencode(options.listType)}>`);

		return buffer;
	}

	function headings_ast(tokens) {
		const headings = {};
		let initial_depth = -1;
		const stack = [];
		let depth;
		let latest;
		for(let i = 0, iK = tokens.length, token; i < iK; i++) {
			token = tokens[i];
			if(token.type === "heading_open") {
				const current_depth = parseInt(token.tag.substr(1), 10);
				const current_heading = tokens[i+1].children
				                                   .filter(function(token){return token.type === 'text' || token.type === 'code_inline'})
				                                   .reduce(function(acc, t){return acc + t.content}, '');

				if( initial_depth === -1 ) {
					initial_depth = current_depth;
					depth = current_depth;
					stack.unshift(headings);
				}

				if( current_depth > depth ) {
					stack.unshift(latest);
					depth = current_depth;
				} else if( current_depth < depth ) {
					for(let j = Math.max(initial_depth, current_depth), jK = depth; j < jK; j++) stack.shift();
					depth = current_depth;
				}
				latest = {};
				stack[0][current_heading] = latest;
			}
		}
		return headings;
	}

	md.core.ruler.push("final_state", function(state){
		final_state = state;
	});

	md.block.ruler.before("heading", "toc", toc, {
		alt: [ "paragraph", "reference", "blockquote" ]
	});

}
