# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.0.0] - 2019-05-19
### Changed
-  browser global changed from `markdownitTocDoneRight` to `markdownItTocDoneRight`
-  filename changed from `markdown-it-toc-made-right.min.js` to `markdownItTocDoneRight.umd.js`
### Removed
- `babel`
- `babelify`
- `browserify`
- `eslint`
- `uglify`
### Added
- `microbundle`
- `standard`

## [3.0.0] - 2019-03-18
### Added
- `listClass`, `itemClass` and `linkClass` options.
### Changed
- placeholder as a regular expression pattern

## [2.1.0] - 2019-02-23
### Added
- `level` option. Default is 1
- test for using `level` option
### Changed
- update `demo.html` to test the new level option

## [2.0.3] - 2018-06-19
### Changed
- update to keep compat with `markdown-it-anchor` `v5.0.2`

## [2.0.2] - 2018-06-15
### Changed
- tests cover 100%

## [2.0.0] - 2018-06-14
### Changed
- dropped package `string` as dependency

## [1.0.5] - 2018-06-12
### Added
- `markdown-it` as `peerDependencies`

### Changed
- better `headings_ast(tokens)` with support for skipping heading ranks

## [1.0.4] - 2018-06-11
### Fixed
- tests

## [1.0.3] - 2018-06-08
### Changed
- **WAI-ARIA** `role='navigation'` isn't required

## [1.0.2] - 2018-06-04
### Added
- travis

## [1.0.1] - 2018-06-04
### Added
- linting
- testing
- runkit
- unicode support example

[Unreleased]: https://github.com/nagaozen/markdown-it-toc-done-right/compare/v4.0.0...HEAD
[4.0.0]: https://github.com/nagaozen/markdown-it-toc-done-right/compare/v3.0.0...v4.0.0
[3.0.0]: https://github.com/nagaozen/markdown-it-toc-done-right/compare/v2.1.0...v3.0.0
[2.1.0]: https://github.com/nagaozen/markdown-it-toc-done-right/compare/v2.0.3...v2.1.0
[2.0.3]: https://github.com/nagaozen/markdown-it-toc-done-right/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/nagaozen/markdown-it-toc-done-right/compare/v2.0.0...v2.0.2
[2.0.0]: https://github.com/nagaozen/markdown-it-toc-done-right/compare/v1.0.5...v2.0.0
[1.0.5]: https://github.com/nagaozen/markdown-it-toc-done-right/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/nagaozen/markdown-it-toc-done-right/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/nagaozen/markdown-it-toc-done-right/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/nagaozen/markdown-it-toc-done-right/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/nagaozen/markdown-it-toc-done-right/compare/v1.0.0...v1.0.1
