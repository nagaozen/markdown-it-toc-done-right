"use strict"

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

	return String(x).replace(/&/g, "&amp;")
	                .replace(/"/g, "&quot;")
	                .replace(/'/g, "&#39;")
	                .replace(/</g, "&lt;")
	                .replace(/>/g, "&gt;");
}

module.exports = function toc_plugin(md, options) {

	options = Object.assign({}, {
		placeholder: "${toc}",
		slugify: slugify,
		containerClass: "table-of-contents",
		listClass: undefined,
		listElementClass: undefined,
		linkClass: undefined,
		level: 1,
		listType: "ol",
		format: undefined
	}, options);

	let final_state;

	function toc(state, startLine/*, endLine, silent*/) {
		let token;
		const pos = state.bMarks[startLine] + state.tShift[startLine];
		const max = state.eMarks[startLine];

		// if it's indented more than 3 spaces, it should be a code block
		/*if(state.sCount[startLine] - state.blkIndent >= 4) return false;*/

		// check starting chars and reject fast if they doesn't match
		for (let i = 0, len = options.placeholder.length; i < len; i++) {
			if (state.src.charCodeAt(pos + i) !== options.placeholder.charCodeAt(i) || pos >= max) return false;
		}

//		if(silent) return true;

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

	function ast_html(tree, uniques) {
		uniques = uniques || {};
		function unique(s) {
			let u = s;
			let i = 2;
			while (uniques.hasOwnProperty(u)) u = `${s}-${i++}`;
			uniques[u] = true;
			return u;
		}

		const keys = Object.keys(tree.c);
		if ( keys.length === 0 ) return "";

		let buffer = (`<${htmlencode(options.listType)}${options.listClass ? ` class="${options.listClass}"` : ""}>`);
		keys.forEach(function(key){
			const node = tree.c[key];
			buffer += (`<li${options.listElementClass ? ` class="${options.listElementClass}"` : ""}><a href="#${unique(options.slugify(key))}"${options.linkClass ? ` class="${options.linkClass}"` : ""}>${typeof options.format === "function" ? options.format(key,htmlencode) : htmlencode(key)}</a>${ast_html(node, uniques)}</li>`);
		});
		buffer += (`</${htmlencode(options.listType)}>`);

		return buffer;
	}

	function headings_ast(tokens) {
		const ast   = { l: 0, n: "", c: {} };
		const stack = [ast];
		for (let i = 0, iK = tokens.length; i < iK; i++) {
			const token = tokens[i];
			if(token.type === "heading_open") {
				const node = {
					l: parseInt(token.tag.substr(1), 10),
					n: ( tokens[i+1].children
					                .filter(function(token){return token.type === "text" || token.type === "code_inline"})
					                .reduce(function(acc, t){return acc + t.content}, "") ),
					c: {}
				};

				if (node.l >= options.level) {
					if ( node.l > stack[0].l ) {
						stack[0].c[node.n] = node;
						stack.unshift(node);
					} else if ( node.l === stack[0].l ) {
						stack[1].c[node.n] = node;
						stack[0] = node;
					} else {
						while( node.l <= stack[0].l ) stack.shift();
						stack[0].c[node.n] = node;
						stack.unshift(node);
					}
				}
			}
		}
		return ast;
	}

	md.core.ruler.push("final_state", function(state){
		final_state = state;
	});

	md.block.ruler.before("heading", "toc", toc, {
		alt: [ "paragraph", "reference", "blockquote" ]
	});

}
