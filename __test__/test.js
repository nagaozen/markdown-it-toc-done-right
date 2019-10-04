const md = require("markdown-it")({
	html: false,
	xhtmlOut: true,
	typographer: true
}).use( require("markdown-it-anchor"), { permalink: true, permalinkBefore: true, permalinkSymbol: '§' } )
  .use( require('../dist/markdownItTocDoneRight.js') );





const uslug = require("uslug");
function uslugify(x) {
	return uslug(x);
}
function custom_format(x, h) {
	return `<span>${h(x)}</span>`;
}
const umd = require("markdown-it")({
	html: false,
	xhtmlOut: true,
	typographer: true
}).use( require("markdown-it-anchor"), { permalink: true, permalinkBefore: true, permalinkSymbol: '§', slugify: uslugify } )
  .use( require('../dist/markdownItTocDoneRight.js'), {
	placeholder: "\\@\\[\\[TOC\\]\\]",
	slugify: uslugify,
	containerClass: "user-content-toc",
	listClass: "my-list",
	itemClass: "my-item",
	linkClass: "my-link",
	listType: "ul",
	format: custom_format
} );





const level_md = require("markdown-it")({
	html: false,
	xhtmlOut: true,
	typographer: true
}).use( require("markdown-it-anchor"), { permalink: true, permalinkBefore: true, permalinkSymbol: '§', level: 2 } )
  .use( require('../dist/markdownItTocDoneRight.js'), { level: 2 } );





const level_md_array = require("markdown-it")({
	html: false,
	xhtmlOut: true,
	typographer: true
}).use( require("markdown-it-anchor"), { permalink: true, permalinkBefore: true, permalinkSymbol: '§', level: [1, 2] } )
  .use( require('../dist/markdownItTocDoneRight.js'), { level: [1, 2] } );





const containerId_md = require("markdown-it")({
	html: false,
	xhtmlOut: true,
	typographer: true
}).use( require('../dist/markdownItTocDoneRight.js'), { containerId: "toc" } );





test("empty set", () => {
	expect( md.render("${toc}") ).toBe('<nav class="table-of-contents"></nav>');
});

test("containerId is set correctly", () => {
	expect( containerId_md.render("${toc}") ).toBe('<nav id="toc" class="table-of-contents"></nav>');
});

test("single element", () => {
	expect( md.render("${toc}\n\n# Title") ).toBe('<nav class="table-of-contents"><ol><li><a href="#title"> Title</a></li></ol></nav><h1 id="title"><a class="header-anchor" href="#title" aria-hidden="true">§</a> Title</h1>\n');
});

test("single element doesn't need to be h1", () => {
	expect( md.render("${toc}\n\n## Section") ).toBe('<nav class="table-of-contents"><ol><li><a href="#section"> Section</a></li></ol></nav><h2 id="section"><a class="header-anchor" href="#section" aria-hidden="true">§</a> Section</h2>\n');
});

test("main heading usually comes first", () => {
	expect( md.render("${toc}\n\n# Title\n\n## Section 1\n\n### Sub Section 1\n\n### Sub Section 2\n\n## Section 2") ).toBe(`<nav class="table-of-contents"><ol><li><a href="#title"> Title</a><ol><li><a href="#section-1"> Section 1</a><ol><li><a href="#sub-section-1"> Sub Section 1</a></li><li><a href="#sub-section-2"> Sub Section 2</a></li></ol></li><li><a href="#section-2"> Section 2</a></li></ol></li></ol></nav><h1 id="title"><a class="header-anchor" href="#title" aria-hidden="true">§</a> Title</h1>
<h2 id="section-1"><a class="header-anchor" href="#section-1" aria-hidden="true">§</a> Section 1</h2>
<h3 id="sub-section-1"><a class="header-anchor" href="#sub-section-1" aria-hidden="true">§</a> Sub Section 1</h3>
<h3 id="sub-section-2"><a class="header-anchor" href="#sub-section-2" aria-hidden="true">§</a> Sub Section 2</h3>
<h2 id="section-2"><a class="header-anchor" href="#section-2" aria-hidden="true">§</a> Section 2</h2>
`);
});

test("but sometimes it comes after navigation", () => {
	expect( md.render("${toc}\n\n## Navigation Menu\n\n## Sidebar\n\n### More news\n\n### What our clients say\n\n### Ratings\n\n# Title\n\n## Section 1\n\n### Sub Section 1\n\n### Sub Section 2\n\n## Section 2") ).toBe(`<nav class="table-of-contents"><ol><li><a href="#navigation-menu"> Navigation Menu</a></li><li><a href="#sidebar"> Sidebar</a><ol><li><a href="#more-news"> More news</a></li><li><a href="#what-our-clients-say"> What our clients say</a></li><li><a href="#ratings"> Ratings</a></li></ol></li><li><a href="#title"> Title</a><ol><li><a href="#section-1"> Section 1</a><ol><li><a href="#sub-section-1"> Sub Section 1</a></li><li><a href="#sub-section-2"> Sub Section 2</a></li></ol></li><li><a href="#section-2"> Section 2</a></li></ol></li></ol></nav><h2 id="navigation-menu"><a class="header-anchor" href="#navigation-menu" aria-hidden="true">§</a> Navigation Menu</h2>
<h2 id="sidebar"><a class="header-anchor" href="#sidebar" aria-hidden="true">§</a> Sidebar</h2>
<h3 id="more-news"><a class="header-anchor" href="#more-news" aria-hidden="true">§</a> More news</h3>
<h3 id="what-our-clients-say"><a class="header-anchor" href="#what-our-clients-say" aria-hidden="true">§</a> What our clients say</h3>
<h3 id="ratings"><a class="header-anchor" href="#ratings" aria-hidden="true">§</a> Ratings</h3>
<h1 id="title"><a class="header-anchor" href="#title" aria-hidden="true">§</a> Title</h1>
<h2 id="section-1"><a class="header-anchor" href="#section-1" aria-hidden="true">§</a> Section 1</h2>
<h3 id="sub-section-1"><a class="header-anchor" href="#sub-section-1" aria-hidden="true">§</a> Sub Section 1</h3>
<h3 id="sub-section-2"><a class="header-anchor" href="#sub-section-2" aria-hidden="true">§</a> Sub Section 2</h3>
<h2 id="section-2"><a class="header-anchor" href="#section-2" aria-hidden="true">§</a> Section 2</h2>
`);
});

test("markup inside the heading should be treated", () => {
	expect( md.render("${toc}\n\n# A **heading** with *markup* `code` [link](https://github.com)") ).toBe('<nav class="table-of-contents"><ol><li><a href="#a-heading-with-markup-code-link"> A heading with markup code link</a></li></ol></nav><h1 id="a-heading-with-markup-code-link"><a class="header-anchor" href="#a-heading-with-markup-code-link" aria-hidden="true">§</a> A <strong>heading</strong> with <em>markup</em> <code>code</code> <a href="https://github.com">link</a></h1>\n');
});

test("especially < and >", () => {
	expect( md.render("${toc}\n\n# > Title\n\n## < Section\n\n## > Another Section") ).toBe(`<nav class="table-of-contents"><ol><li><a href="#%3E-title"> &gt; Title</a><ol><li><a href="#%3C-section"> &lt; Section</a></li><li><a href="#%3E-another-section"> &gt; Another Section</a></li></ol></li></ol></nav><h1 id="%3E-title"><a class="header-anchor" href="#%3E-title" aria-hidden="true">§</a> &gt; Title</h1>
<h2 id="%3C-section"><a class="header-anchor" href="#%3C-section" aria-hidden="true">§</a> &lt; Section</h2>
<h2 id="%3E-another-section"><a class="header-anchor" href="#%3E-another-section" aria-hidden="true">§</a> &gt; Another Section</h2>
`);
});

test("skipping heading ranks should work", () => {
	expect( md.render("${toc}\n\n## Foo\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce tempus porta nulla id porttitor. Vivamus sagittis, leo eget gravida euismod, justo ex dignissim sem, in tempus turpis libero quis velit. Aliquam sit amet ultricies quam.\n\n#### Bar\nSuspendisse ornare pellentesque nibh non tristique. Suspendisse potenti. Nunc id dui non diam luctus imperdiet.\n\n## Grob\nQuisque fringilla urna sit amet elit ultrices tincidunt. Interdum et malesuada fames ac ante ipsum primis in faucibus. In posuere tellus suscipit sapien rhoncus euismod. Phasellus eu ligula mollis, finibus tortor ut, consectetur metus. Vestibulum eget leo felis.") ).toBe(`<nav class="table-of-contents"><ol><li><a href="#foo"> Foo</a><ol><li><a href="#bar"> Bar</a></li></ol></li><li><a href="#grob"> Grob</a></li></ol></nav><h2 id="foo"><a class="header-anchor" href="#foo" aria-hidden="true">§</a> Foo</h2>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce tempus porta nulla id porttitor. Vivamus sagittis, leo eget gravida euismod, justo ex dignissim sem, in tempus turpis libero quis velit. Aliquam sit amet ultricies quam.</p>
<h4 id="bar"><a class="header-anchor" href="#bar" aria-hidden="true">§</a> Bar</h4>
<p>Suspendisse ornare pellentesque nibh non tristique. Suspendisse potenti. Nunc id dui non diam luctus imperdiet.</p>
<h2 id="grob"><a class="header-anchor" href="#grob" aria-hidden="true">§</a> Grob</h2>
<p>Quisque fringilla urna sit amet elit ultrices tincidunt. Interdum et malesuada fames ac ante ipsum primis in faucibus. In posuere tellus suscipit sapien rhoncus euismod. Phasellus eu ligula mollis, finibus tortor ut, consectetur metus. Vestibulum eget leo felis.</p>
`);
})

test("code blocks should not be confused as headings", () => {
	expect( md.render("[[_toc_]]\n\n## Foo\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce tempus porta nulla id porttitor. Vivamus sagittis, leo eget gravida euismod, justo ex dignissim sem, in tempus turpis libero quis velit. Aliquam sit amet ultricies quam.\n\n#### Bar\nSuspendisse ornare pellentesque nibh non tristique. Suspendisse potenti. Nunc id dui non diam luctus imperdiet.\n\n    ## Grob\n    Quisque fringilla urna sit amet elit ultrices tincidunt. Interdum et malesuada fames ac ante ipsum primis in faucibus. In posuere tellus suscipit sapien rhoncus euismod. Phasellus eu ligula mollis, finibus tortor ut, consectetur metus. Vestibulum eget leo felis.") ).toBe(`<nav class="table-of-contents"><ol><li><a href="#foo"> Foo</a><ol><li><a href="#bar"> Bar</a></li></ol></li></ol></nav><h2 id="foo"><a class="header-anchor" href="#foo" aria-hidden="true">§</a> Foo</h2>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce tempus porta nulla id porttitor. Vivamus sagittis, leo eget gravida euismod, justo ex dignissim sem, in tempus turpis libero quis velit. Aliquam sit amet ultricies quam.</p>
<h4 id="bar"><a class="header-anchor" href="#bar" aria-hidden="true">§</a> Bar</h4>
<p>Suspendisse ornare pellentesque nibh non tristique. Suspendisse potenti. Nunc id dui non diam luctus imperdiet.</p>
<pre><code>## Grob
Quisque fringilla urna sit amet elit ultrices tincidunt. Interdum et malesuada fames ac ante ipsum primis in faucibus. In posuere tellus suscipit sapien rhoncus euismod. Phasellus eu ligula mollis, finibus tortor ut, consectetur metus. Vestibulum eget leo felis.</code></pre>
`);
});

test("headers innerText may happen more than once", () => {
	expect( md.render("[toc]\n\n# Title\n\n## Section 1\n\n### Subsection 1\n\n### Subsection 2\n\n## Section 2\n\n### Subsection 1\n\n### Subsection 2\n\n## Section 3\n\n### Subsection 1\n\n### Subsection 2") ).toBe(`<nav class="table-of-contents"><ol><li><a href="#title"> Title</a><ol><li><a href="#section-1"> Section 1</a><ol><li><a href="#subsection-1"> Subsection 1</a></li><li><a href="#subsection-2"> Subsection 2</a></li></ol></li><li><a href="#section-2"> Section 2</a><ol><li><a href="#subsection-1-2"> Subsection 1</a></li><li><a href="#subsection-2-2"> Subsection 2</a></li></ol></li><li><a href="#section-3"> Section 3</a><ol><li><a href="#subsection-1-3"> Subsection 1</a></li><li><a href="#subsection-2-3"> Subsection 2</a></li></ol></li></ol></li></ol></nav><h1 id="title"><a class="header-anchor" href="#title" aria-hidden="true">§</a> Title</h1>
<h2 id="section-1"><a class="header-anchor" href="#section-1" aria-hidden="true">§</a> Section 1</h2>
<h3 id="subsection-1"><a class="header-anchor" href="#subsection-1" aria-hidden="true">§</a> Subsection 1</h3>
<h3 id="subsection-2"><a class="header-anchor" href="#subsection-2" aria-hidden="true">§</a> Subsection 2</h3>
<h2 id="section-2"><a class="header-anchor" href="#section-2" aria-hidden="true">§</a> Section 2</h2>
<h3 id="subsection-1-2"><a class="header-anchor" href="#subsection-1-2" aria-hidden="true">§</a> Subsection 1</h3>
<h3 id="subsection-2-2"><a class="header-anchor" href="#subsection-2-2" aria-hidden="true">§</a> Subsection 2</h3>
<h2 id="section-3"><a class="header-anchor" href="#section-3" aria-hidden="true">§</a> Section 3</h2>
<h3 id="subsection-1-3"><a class="header-anchor" href="#subsection-1-3" aria-hidden="true">§</a> Subsection 1</h3>
<h3 id="subsection-2-3"><a class="header-anchor" href="#subsection-2-3" aria-hidden="true">§</a> Subsection 2</h3>
`);
});

test("and sometimes slugify with suffix may generate another existing header", () => {
	expect( md.render("[[toc]]\n\n# header\n\n## header\n\n## header 2") ).toBe(`<nav class="table-of-contents"><ol><li><a href="#header"> header</a><ol><li><a href="#header-2"> header</a></li><li><a href="#header-2-2"> header 2</a></li></ol></li></ol></nav><h1 id="header"><a class="header-anchor" href="#header" aria-hidden="true">§</a> header</h1>
<h2 id="header-2"><a class="header-anchor" href="#header-2" aria-hidden="true">§</a> header</h2>
<h2 id="header-2-2"><a class="header-anchor" href="#header-2-2" aria-hidden="true">§</a> header 2</h2>
`);
});

test("level(Int Type) option should work as expected", () => {
	expect( level_md.render("${toc}\n\n# header\n\n## header\n\n## header 2") ).toBe(`<nav class="table-of-contents"><ol><li><a href="#header"> header</a></li><li><a href="#header-2"> header 2</a></li></ol></nav><h1>header</h1>
<h2 id="header"><a class="header-anchor" href="#header" aria-hidden="true">§</a> header</h2>
<h2 id="header-2"><a class="header-anchor" href="#header-2" aria-hidden="true">§</a> header 2</h2>
`);
});

test("level(Array Type) option should work as expected", () => {
	expect( level_md_array.render("${toc}\n\n# header\n\n## header\n\n## header 2\n\n# header 4\n\n## header 5\n\n## header 2") ).toBe(`<nav class="table-of-contents"><ol><li><a href="#header"> header</a><ol><li><a href="#header-2"> header</a></li><li><a href="#header-2-2"> header 2</a></li></ol></li><li><a href="#header-4"> header 4</a><ol><li><a href="#header-5"> header 5</a></li><li><a href="#header-2-3"> header 2</a></li></ol></li></ol></nav><h1 id="header"><a class="header-anchor" href="#header" aria-hidden="true">§</a> header</h1>
<h2 id="header-2"><a class="header-anchor" href="#header-2" aria-hidden="true">§</a> header</h2>
<h2 id="header-2-2"><a class="header-anchor" href="#header-2-2" aria-hidden="true">§</a> header 2</h2>
<h1 id="header-4"><a class="header-anchor" href="#header-4" aria-hidden="true">§</a> header 4</h1>
<h2 id="header-5"><a class="header-anchor" href="#header-5" aria-hidden="true">§</a> header 5</h2>
<h2 id="header-2-3"><a class="header-anchor" href="#header-2-3" aria-hidden="true">§</a> header 2</h2>
`);
});

test("all other options should work as expected", () => {
	expect( umd.render("@[[TOC]]\n\n# 日本語\n\n    # should be considered as code") ).toBe('<nav class="user-content-toc"><ul class="my-list"><li class="my-item"><a class="my-link" href="#日本語"><span> 日本語</span></a></li></ul></nav><h1 id="日本語"><a class="header-anchor" href="#日本語" aria-hidden="true">§</a> 日本語</h1>\n<pre><code># should be considered as code</code></pre>\n');
});
