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
		placeholder: "(\\$\\{toc\\}|\\[\\[?_?toc_?\\]?\\])",
		slugify: slugify,
		containerClass: "table-of-contents",
		listClass: undefined,
		itemClass: undefined,
		linkClass: undefined,
		level: 1,
		listType: "ol",
		format: undefined
	}, options);

	let ast;
	const pattern = new RegExp("^" + options.placeholder + "$", "i");

	function toc(state, startLine/*, endLine, silent*/) {
		let token;
		const pos = state.bMarks[startLine] + state.tShift[startLine];
		const max = state.eMarks[startLine];

		// if it's indented more than 3 spaces, it should be a code block
		/*if(state.sCount[startLine] - state.blkIndent >= 4) return false;*/

		// use whitespace as a line tokenizer and extract the first token
		// to test against the placeholder anchored pattern, rejecting if false
		const line_first_token = state.src.slice(pos, max).split(" ")[0];
		if (!pattern.test(line_first_token)) return false;

//		if(silent) return true;

		state.line = startLine + 1;

		token        = state.push("toc_open", "nav", 1);
		token.markup = "";
		token.map    = [ startLine, state.line ];

		token          = state.push("toc_body", "", 0);
		token.markup   = "";
		token.map      = [ startLine, state.line ];
		token.children = [];

		token        = state.push("toc_close", "nav", -1);
		token.markup = "";

		return true;
	}

	md.renderer.rules.toc_open = function(/*tokens, idx, options, env, renderer*/) {
		return `<nav class="${htmlencode(options.containerClass)}">`;
	}

	md.renderer.rules.toc_close = function(/*tokens, idx, options, env, renderer*/) {
		return '</nav>';
	}

	md.renderer.rules.toc_body = function(/*tokens, idx, options, env, renderer*/) {
		return ast_html(ast);
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

		const list_class = options.listClass
		                 ? ` class="${htmlencode(options.listClass)}"`
		                 : "";
		const item_class = options.itemClass
		                 ? ` class="${htmlencode(options.itemClass)}"`
		                 : "";
		const link_class = options.linkClass
		                 ? ` class="${htmlencode(options.linkClass)}"`
		                 : "";

		const keys = Object.keys(tree.c);
		if ( keys.length === 0 ) return "";

		let buffer = (`<${htmlencode(options.listType) + list_class}>`);
		keys.forEach(function(key){
			const node = tree.c[key];
			buffer += (`<li${item_class}><a${link_class} href="#${unique(options.slugify(key))}">${typeof options.format === "function" ? options.format(key,htmlencode) : htmlencode(key)}</a>${ast_html(node, uniques)}</li>`);
		});
		buffer += (`</${htmlencode(options.listType)}>`);

		return buffer;
	}

	function headings_ast(tokens) {
		const ast   = { l: 0, n: "", c: {} };
		const stack = [ast];

		const isLevelSelectedNumber = selection => level => level >= selection
		const isLevelSelectedArray = selection => level => selection.includes(level)
		
		const isLevelSelected = Array.isArray(options.level)
      		? isLevelSelectedArray(options.level)
			  : isLevelSelectedNumber(options.level)
			  
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

				if (isLevelSelected(node.l)) {
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

	md.core.ruler.push("generate_toc_ast", function(state){
		const tokens = state.tokens;
		ast = headings_ast(tokens);
	});

	md.block.ruler.before("heading", "toc", toc, {
		alt: [ "paragraph", "reference", "blockquote" ]
	});

}
