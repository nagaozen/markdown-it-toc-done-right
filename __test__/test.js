const md = require("markdown-it")({
	html: false,
	xhtmlOut: true,
	typographer: true
}).use( require("markdown-it-anchor"), { permalink: true, permalinkBefore: true, permalinkSymbol: '§' } )
  .use( require("../index.js") );

const uslug = require("uslug");
function uslugify(x) {
	return uslug(x);
}
const umd = require("markdown-it")({
	html: false,
	xhtmlOut: true,
	typographer: true
}).use( require("markdown-it-anchor"), { permalink: true, permalinkBefore: true, permalinkSymbol: '§', slugify: uslugify } )
  .use( require("../index.js"), { slugify: uslugify } );





test("empty set", () => {
	expect( md.render("${toc}") ).toBe('<nav role="navigation" class="table-of-contents"></nav>');
});

test("single element", () => {
	expect( md.render("${toc}\n\n# Title") ).toBe('<nav role="navigation" class="table-of-contents"><ol><li><a href="#title"> Title</a></li></ol></nav><h1 id="title"><a class="header-anchor" href="#title" aria-hidden="true">§</a> Title</h1>\n');
});

test("single element doesn't need to be h1", () => {
	expect( md.render("${toc}\n\n## Section") ).toBe('<nav role="navigation" class="table-of-contents"><ol><li><a href="#section"> Section</a></li></ol></nav><h2 id="section"><a class="header-anchor" href="#section" aria-hidden="true">§</a> Section</h2>\n');
});

test("first found element level works as the base for the ast, typo in the middle", () => {
	expect( md.render("${toc}\n\n## Section\n\n# Probably a typo\n\n## Another Section") ).toBe(`<nav role="navigation" class="table-of-contents"><ol><li><a href="#section"> Section</a></li><li><a href="#probably-a-typo"> Probably a typo</a><ol><li><a href="#another-section"> Another Section</a></li></ol></li></ol></nav><h2 id="section"><a class="header-anchor" href="#section" aria-hidden="true">§</a> Section</h2>
<h1 id="probably-a-typo"><a class="header-anchor" href="#probably-a-typo" aria-hidden="true">§</a> Probably a typo</h1>
<h2 id="another-section"><a class="header-anchor" href="#another-section" aria-hidden="true">§</a> Another Section</h2>
`);
});

test("first found element level works as the base for the ast, typo in the beginning", () => {
	expect( md.render("${toc}\n\n## maybe the typo comes first\n\n# Title\n\n## Section\n\n## Another Section") ).toBe(`<nav role="navigation" class="table-of-contents"><ol><li><a href="#maybe-the-typo-comes-first"> maybe the typo comes first</a></li><li><a href="#title"> Title</a><ol><li><a href="#section"> Section</a></li><li><a href="#another-section"> Another Section</a></li></ol></li></ol></nav><h2 id="maybe-the-typo-comes-first"><a class="header-anchor" href="#maybe-the-typo-comes-first" aria-hidden="true">§</a> maybe the typo comes first</h2>
<h1 id="title"><a class="header-anchor" href="#title" aria-hidden="true">§</a> Title</h1>
<h2 id="section"><a class="header-anchor" href="#section" aria-hidden="true">§</a> Section</h2>
<h2 id="another-section"><a class="header-anchor" href="#another-section" aria-hidden="true">§</a> Another Section</h2>
`);
});

test("markup in the heading should be treated", () => {
	expect( md.render("${toc}\n\n# A **heading** with *markup* `code` [link](https://github.com)") ).toBe('<nav role="navigation" class="table-of-contents"><ol><li><a href="#a-heading-with-markup-code-link"> A heading with markup code link</a></li></ol></nav><h1 id="a-heading-with-markup-code-link"><a class="header-anchor" href="#a-heading-with-markup-code-link" aria-hidden="true">§</a> A <strong>heading</strong> with <em>markup</em> <code>code</code> <a href="https://github.com">link</a></h1>\n');
});

test("especially < and >", () => {
	expect( md.render("${toc}\n\n# > Title\n\n## < Section\n\n## > Another Section") ).toBe(`<nav role="navigation" class="table-of-contents"><ol><li><a href="#title"> &gt; Title</a><ol><li><a href="#section"> &lt; Section</a></li><li><a href="#another-section"> &gt; Another Section</a></li></ol></li></ol></nav><h1 id="title"><a class="header-anchor" href="#title" aria-hidden="true">§</a> &gt; Title</h1>
<h2 id="section"><a class="header-anchor" href="#section" aria-hidden="true">§</a> &lt; Section</h2>
<h2 id="another-section"><a class="header-anchor" href="#another-section" aria-hidden="true">§</a> &gt; Another Section</h2>
`);
});

test("unicode can be handled with uslug", () => {
	expect( umd.render("${toc}\n\n# 日本語") ).toBe('<nav role="navigation" class="table-of-contents"><ol><li><a href="#日本語"> 日本語</a></li></ol></nav><h1 id="日本語"><a class="header-anchor" href="#日本語" aria-hidden="true">§</a> 日本語</h1>\n');
});
