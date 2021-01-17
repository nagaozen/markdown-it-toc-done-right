/* eslint-env jest */
/* eslint-disable no-template-curly-in-string */

const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')
const markdownItTocDoneRight = require('../dist/markdownItTocDoneRight')
const uslug = require('uslug')

function getMarkdownIt () {
  return markdownIt({
    html: false,
    xhtmlOut: true,
    typographer: true
  })
}

function uslugify (text) {
  return uslug(text)
}

function customFormat (content, htmlEncoder) {
  return `<span>${htmlEncoder(content)}</span>`
}

const commonMd = getMarkdownIt()
  .use(markdownItAnchor, {
    permalink: true,
    permalinkBefore: true,
    permalinkSymbol: '§'
  })
  .use(markdownItTocDoneRight)

test('empty set', () => {
  const mdContent = '${toc}'
  const htmlContent = '<nav class="table-of-contents" aria-label="Table of contents"></nav>'
  expect(commonMd.render(mdContent)).toBe(htmlContent)
})

test('single element', () => {
  const mdContent = '${toc}\n\n# Title'
  const htmlContent = '<nav class="table-of-contents" aria-label="Table of contents"><ol><li><a href="#title"> Title</a></li></ol></nav><h1 id="title"><a class="header-anchor" href="#title">§</a> Title</h1>\n'
  expect(commonMd.render(mdContent)).toBe(htmlContent)
})

test("single element doesn't need to be h1", () => {
  const mdContent = '${toc}\n\n## Section'
  const htmlContent = '<nav class="table-of-contents" aria-label="Table of contents"><ol><li><a href="#section"> Section</a></li></ol></nav><h2 id="section"><a class="header-anchor" href="#section">§</a> Section</h2>\n'
  expect(commonMd.render(mdContent)).toBe(htmlContent)
})

test('main heading usually comes first', () => {
  const mdContent = '${toc}\n\n# Title\n\n## Section 1\n\n### Sub Section 1\n\n### Sub Section 2\n\n## Section 2'
  const htmlContent = `<nav class="table-of-contents" aria-label="Table of contents"><ol><li><a href="#title"> Title</a><ol><li><a href="#section-1"> Section 1</a><ol><li><a href="#sub-section-1"> Sub Section 1</a></li><li><a href="#sub-section-2"> Sub Section 2</a></li></ol></li><li><a href="#section-2"> Section 2</a></li></ol></li></ol></nav><h1 id="title"><a class="header-anchor" href="#title">§</a> Title</h1>
<h2 id="section-1"><a class="header-anchor" href="#section-1">§</a> Section 1</h2>
<h3 id="sub-section-1"><a class="header-anchor" href="#sub-section-1">§</a> Sub Section 1</h3>
<h3 id="sub-section-2"><a class="header-anchor" href="#sub-section-2">§</a> Sub Section 2</h3>
<h2 id="section-2"><a class="header-anchor" href="#section-2">§</a> Section 2</h2>
`
  expect(commonMd.render(mdContent)).toBe(htmlContent)
})

test('but sometimes it comes after navigation', () => {
  const mdContent = '${toc}\n\n## Navigation Menu\n\n## Sidebar\n\n### More news\n\n### What our clients say\n\n### Ratings\n\n# Title\n\n## Section 1\n\n### Sub Section 1\n\n### Sub Section 2\n\n## Section 2'
  const htmlContent = `<nav class="table-of-contents" aria-label="Table of contents"><ol><li><a href="#navigation-menu"> Navigation Menu</a></li><li><a href="#sidebar"> Sidebar</a><ol><li><a href="#more-news"> More news</a></li><li><a href="#what-our-clients-say"> What our clients say</a></li><li><a href="#ratings"> Ratings</a></li></ol></li><li><a href="#title"> Title</a><ol><li><a href="#section-1"> Section 1</a><ol><li><a href="#sub-section-1"> Sub Section 1</a></li><li><a href="#sub-section-2"> Sub Section 2</a></li></ol></li><li><a href="#section-2"> Section 2</a></li></ol></li></ol></nav><h2 id="navigation-menu"><a class="header-anchor" href="#navigation-menu">§</a> Navigation Menu</h2>
<h2 id="sidebar"><a class="header-anchor" href="#sidebar">§</a> Sidebar</h2>
<h3 id="more-news"><a class="header-anchor" href="#more-news">§</a> More news</h3>
<h3 id="what-our-clients-say"><a class="header-anchor" href="#what-our-clients-say">§</a> What our clients say</h3>
<h3 id="ratings"><a class="header-anchor" href="#ratings">§</a> Ratings</h3>
<h1 id="title"><a class="header-anchor" href="#title">§</a> Title</h1>
<h2 id="section-1"><a class="header-anchor" href="#section-1">§</a> Section 1</h2>
<h3 id="sub-section-1"><a class="header-anchor" href="#sub-section-1">§</a> Sub Section 1</h3>
<h3 id="sub-section-2"><a class="header-anchor" href="#sub-section-2">§</a> Sub Section 2</h3>
<h2 id="section-2"><a class="header-anchor" href="#section-2">§</a> Section 2</h2>
`
  expect(commonMd.render(mdContent)).toBe(htmlContent)
})

test('markup inside the heading should be treated', () => {
  const mdContent = '${toc}\n\n# A **heading** with *markup* `code` [link](https://github.com)'
  const htmlContent = '<nav class="table-of-contents" aria-label="Table of contents"><ol><li><a href="#a-heading-with-markup-code-link"> A heading with markup code link</a></li></ol></nav><h1 id="a-heading-with-markup-code-link"><a class="header-anchor" href="#a-heading-with-markup-code-link">§</a> A <strong>heading</strong> with <em>markup</em> <code>code</code> <a href="https://github.com">link</a></h1>\n'
  expect(commonMd.render(mdContent)).toBe(htmlContent)
})

test('especially < and >', () => {
  const mdContent = '${toc}\n\n# > Title\n\n## < Section\n\n## > Another Section'
  const htmlContent = `<nav class="table-of-contents" aria-label="Table of contents"><ol><li><a href="#%3E-title"> &gt; Title</a><ol><li><a href="#%3C-section"> &lt; Section</a></li><li><a href="#%3E-another-section"> &gt; Another Section</a></li></ol></li></ol></nav><h1 id="%3E-title"><a class="header-anchor" href="#%3E-title">§</a> &gt; Title</h1>
<h2 id="%3C-section"><a class="header-anchor" href="#%3C-section">§</a> &lt; Section</h2>
<h2 id="%3E-another-section"><a class="header-anchor" href="#%3E-another-section">§</a> &gt; Another Section</h2>
`
  expect(commonMd.render(mdContent)).toBe(htmlContent)
})

test('skipping heading ranks should work', () => {
  const mdContent = '${toc}\n\n## Foo\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce tempus porta nulla id porttitor. Vivamus sagittis, leo eget gravida euismod, justo ex dignissim sem, in tempus turpis libero quis velit. Aliquam sit amet ultricies quam.\n\n#### Bar\nSuspendisse ornare pellentesque nibh non tristique. Suspendisse potenti. Nunc id dui non diam luctus imperdiet.\n\n## Grob\nQuisque fringilla urna sit amet elit ultrices tincidunt. Interdum et malesuada fames ac ante ipsum primis in faucibus. In posuere tellus suscipit sapien rhoncus euismod. Phasellus eu ligula mollis, finibus tortor ut, consectetur metus. Vestibulum eget leo felis.'
  const htmlContent = `<nav class="table-of-contents" aria-label="Table of contents"><ol><li><a href="#foo"> Foo</a><ol><li><a href="#bar"> Bar</a></li></ol></li><li><a href="#grob"> Grob</a></li></ol></nav><h2 id="foo"><a class="header-anchor" href="#foo">§</a> Foo</h2>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce tempus porta nulla id porttitor. Vivamus sagittis, leo eget gravida euismod, justo ex dignissim sem, in tempus turpis libero quis velit. Aliquam sit amet ultricies quam.</p>
<h4 id="bar"><a class="header-anchor" href="#bar">§</a> Bar</h4>
<p>Suspendisse ornare pellentesque nibh non tristique. Suspendisse potenti. Nunc id dui non diam luctus imperdiet.</p>
<h2 id="grob"><a class="header-anchor" href="#grob">§</a> Grob</h2>
<p>Quisque fringilla urna sit amet elit ultrices tincidunt. Interdum et malesuada fames ac ante ipsum primis in faucibus. In posuere tellus suscipit sapien rhoncus euismod. Phasellus eu ligula mollis, finibus tortor ut, consectetur metus. Vestibulum eget leo felis.</p>
`
  expect(commonMd.render(mdContent)).toBe(htmlContent)
})

test('code blocks should not be confused as headings', () => {
  const mdContent = '[[_toc_]]\n\n## Foo\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce tempus porta nulla id porttitor. Vivamus sagittis, leo eget gravida euismod, justo ex dignissim sem, in tempus turpis libero quis velit. Aliquam sit amet ultricies quam.\n\n#### Bar\nSuspendisse ornare pellentesque nibh non tristique. Suspendisse potenti. Nunc id dui non diam luctus imperdiet.\n\n    ## Grob\n    Quisque fringilla urna sit amet elit ultrices tincidunt. Interdum et malesuada fames ac ante ipsum primis in faucibus. In posuere tellus suscipit sapien rhoncus euismod. Phasellus eu ligula mollis, finibus tortor ut, consectetur metus. Vestibulum eget leo felis.'
  const htmlContent = `<nav class="table-of-contents" aria-label="Table of contents"><ol><li><a href="#foo"> Foo</a><ol><li><a href="#bar"> Bar</a></li></ol></li></ol></nav><h2 id="foo"><a class="header-anchor" href="#foo">§</a> Foo</h2>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce tempus porta nulla id porttitor. Vivamus sagittis, leo eget gravida euismod, justo ex dignissim sem, in tempus turpis libero quis velit. Aliquam sit amet ultricies quam.</p>
<h4 id="bar"><a class="header-anchor" href="#bar">§</a> Bar</h4>
<p>Suspendisse ornare pellentesque nibh non tristique. Suspendisse potenti. Nunc id dui non diam luctus imperdiet.</p>
<pre><code>## Grob
Quisque fringilla urna sit amet elit ultrices tincidunt. Interdum et malesuada fames ac ante ipsum primis in faucibus. In posuere tellus suscipit sapien rhoncus euismod. Phasellus eu ligula mollis, finibus tortor ut, consectetur metus. Vestibulum eget leo felis.</code></pre>
`
  expect(commonMd.render(mdContent)).toBe(htmlContent)
})

test('headers innerText may happen more than once', () => {
  const mdContent = '[toc]\n\n# Title\n\n## Section 1\n\n### Subsection 1\n\n### Subsection 2\n\n## Section 2\n\n### Subsection 1\n\n### Subsection 2\n\n## Section 3\n\n### Subsection 1\n\n### Subsection 2'
  const htmlContent = `<nav class="table-of-contents" aria-label="Table of contents"><ol><li><a href="#title"> Title</a><ol><li><a href="#section-1"> Section 1</a><ol><li><a href="#subsection-1"> Subsection 1</a></li><li><a href="#subsection-2"> Subsection 2</a></li></ol></li><li><a href="#section-2"> Section 2</a><ol><li><a href="#subsection-1-1"> Subsection 1</a></li><li><a href="#subsection-2-1"> Subsection 2</a></li></ol></li><li><a href="#section-3"> Section 3</a><ol><li><a href="#subsection-1-2"> Subsection 1</a></li><li><a href="#subsection-2-2"> Subsection 2</a></li></ol></li></ol></li></ol></nav><h1 id="title"><a class="header-anchor" href="#title">§</a> Title</h1>
<h2 id="section-1"><a class="header-anchor" href="#section-1">§</a> Section 1</h2>
<h3 id="subsection-1"><a class="header-anchor" href="#subsection-1">§</a> Subsection 1</h3>
<h3 id="subsection-2"><a class="header-anchor" href="#subsection-2">§</a> Subsection 2</h3>
<h2 id="section-2"><a class="header-anchor" href="#section-2">§</a> Section 2</h2>
<h3 id="subsection-1-1"><a class="header-anchor" href="#subsection-1-1">§</a> Subsection 1</h3>
<h3 id="subsection-2-1"><a class="header-anchor" href="#subsection-2-1">§</a> Subsection 2</h3>
<h2 id="section-3"><a class="header-anchor" href="#section-3">§</a> Section 3</h2>
<h3 id="subsection-1-2"><a class="header-anchor" href="#subsection-1-2">§</a> Subsection 1</h3>
<h3 id="subsection-2-2"><a class="header-anchor" href="#subsection-2-2">§</a> Subsection 2</h3>
`
  expect(commonMd.render(mdContent)).toBe(htmlContent)
})

test('and sometimes slugify with suffix may generate another existing header', () => {
  const mdContent = '[[toc]]\n\n# header\n\n## header\n\n## header 1'
  const htmlContent = `<nav class="table-of-contents" aria-label="Table of contents"><ol><li><a href="#header"> header</a><ol><li><a href="#header-1"> header</a></li><li><a href="#header-1-1"> header 1</a></li></ol></li></ol></nav><h1 id="header"><a class="header-anchor" href="#header">§</a> header</h1>
<h2 id="header-1"><a class="header-anchor" href="#header-1">§</a> header</h2>
<h2 id="header-1-1"><a class="header-anchor" href="#header-1-1">§</a> header 1</h2>
`
  expect(commonMd.render(mdContent)).toBe(htmlContent)
})

test('containerId is set correctly', () => {
  const md = getMarkdownIt()
    .use(markdownItTocDoneRight, {
      containerId: 'toc'
    })
  const mdContent = '${toc}'
  const htmlContent = '<nav id="toc" class="table-of-contents" aria-label="Table of contents"></nav>'
  expect(md.render(mdContent)).toBe(htmlContent)
})

test('level(Int Type) option should work as expected', () => {
  const md = getMarkdownIt()
    .use(markdownItAnchor, {
      permalink: true,
      permalinkBefore: true,
      permalinkSymbol: '§',
      level: 2
    })
    .use(markdownItTocDoneRight, { level: 2 })
  const mdContent = '${toc}\n\n# header\n\n## header\n\n## header 2'
  const htmlContent = `<nav class="table-of-contents" aria-label="Table of contents"><ol><li><a href="#header"> header</a></li><li><a href="#header-2"> header 2</a></li></ol></nav><h1>header</h1>
<h2 id="header"><a class="header-anchor" href="#header">§</a> header</h2>
<h2 id="header-2"><a class="header-anchor" href="#header-2">§</a> header 2</h2>
`
  expect(md.render(mdContent)).toBe(htmlContent)
})

test('level(Array Type) option should work as expected', () => {
  const md = getMarkdownIt()
    .use(markdownItAnchor, {
      permalink: true,
      permalinkBefore: true,
      permalinkSymbol: '§',
      level: [1, 2]
    })
    .use(markdownItTocDoneRight, { level: [1, 2] })
  const mdContent = '${toc}\n\n# header\n\n## header\n\n## header 1\n\n# header 4\n\n## header 5\n\n## header 1'
  const htmlContent = `<nav class="table-of-contents" aria-label="Table of contents"><ol><li><a href="#header"> header</a><ol><li><a href="#header-1"> header</a></li><li><a href="#header-1-1"> header 1</a></li></ol></li><li><a href="#header-4"> header 4</a><ol><li><a href="#header-5"> header 5</a></li><li><a href="#header-1-2"> header 1</a></li></ol></li></ol></nav><h1 id="header"><a class="header-anchor" href="#header">§</a> header</h1>
<h2 id="header-1"><a class="header-anchor" href="#header-1">§</a> header</h2>
<h2 id="header-1-1"><a class="header-anchor" href="#header-1-1">§</a> header 1</h2>
<h1 id="header-4"><a class="header-anchor" href="#header-4">§</a> header 4</h1>
<h2 id="header-5"><a class="header-anchor" href="#header-5">§</a> header 5</h2>
<h2 id="header-1-2"><a class="header-anchor" href="#header-1-2">§</a> header 1</h2>
`
  expect(md.render(mdContent)).toBe(htmlContent)
})

test('uniqueSlugStartIndex set to 0', () => {
  const md = getMarkdownIt()
    .use(markdownItAnchor, {
      permalink: true,
      permalinkBefore: true,
      permalinkSymbol: '§',
      level: [1, 2],
      uniqueSlugStartIndex: 0
    })
    .use(markdownItTocDoneRight, { uniqueSlugStartIndex: 0 })
  const mdContent = '[toc]\n\n# header\n\n## header'
  const htmlContent = `<nav class="table-of-contents" aria-label="Table of contents"><ol><li><a href="#header"> header</a><ol><li><a href="#header-0"> header</a></li></ol></li></ol></nav><h1 id="header"><a class="header-anchor" href="#header">§</a> header</h1>
<h2 id="header-0"><a class="header-anchor" href="#header-0">§</a> header</h2>
`
  expect(md.render(mdContent)).toBe(htmlContent)
})

test('all other options should work as expected', () => {
  const md = getMarkdownIt()
    .use(markdownItAnchor, {
      permalink: true,
      permalinkBefore: true,
      permalinkSymbol: '§',
      slugify: uslugify
    })
    .use(markdownItTocDoneRight, {
      placeholder: '\\@\\[\\[TOC\\]\\]',
      slugify: uslugify,
      containerClass: 'user-content-toc',
      containerLabel: 'User TOC label',
      listClass: 'my-list',
      itemClass: 'my-item',
      linkClass: 'my-link',
      listType: 'ul',
      format: customFormat,
      callback: function (html, ast) {
        console.log(ast)
      }
    })
  const mdContent = '@[[TOC]]\n\n# 日本語\n\n# 日本語\n\n    # should be considered as code'
  const htmlContent = '<nav class="user-content-toc" aria-label="User TOC label"><ul class="my-list"><li class="my-item"><a class="my-link" href="#日本語"><span> 日本語</span></a></li><li class="my-item"><a class="my-link" href="#日本語-1"><span> 日本語</span></a></li></ul></nav><h1 id="日本語"><a class="header-anchor" href="#日本語">§</a> 日本語</h1>\n<h1 id="日本語-1"><a class="header-anchor" href="#日本語-1">§</a> 日本語</h1>\n<pre><code># should be considered as code</code></pre>\n'
  expect(md.render(mdContent)).toBe(htmlContent)
})
