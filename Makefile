NPM_PACKAGE := $(shell node -e 'process.stdout.write(require("./package.json").name)')
NPM_VERSION := $(shell node -e 'process.stdout.write(require("./package.json").version)')

GITHUB_PROJ := https://github.com//nagaozen/${NPM_PACKAGE}



build:
	rm -rf ./dist
	mkdir dist
	# Browserify
	( printf "/*! ${NPM_PACKAGE} ${NPM_VERSION} ${GITHUB_PROJ} @license MIT */" ; \
		npx browserify -s markdownitTocDoneRight -t babelify --presets [ "@babel/preset-env" ] . \
		) > dist/markdown-it-toc-made-right.js
	# Minify
	npx uglifyjs dist/markdown-it-toc-made-right.js -c -m \
		--preamble "/*! ${NPM_PACKAGE} ${NPM_VERSION} ${GITHUB_PROJ} @license MIT */" \
> dist/markdown-it-toc-made-right.min.js

upddemo:
	rm -rf ./lib
	mkdir lib
	curl -o lib/markdown-it-anchor.js https://wzrd.in/standalone/markdown-it-anchor@latest
	curl -o lib/uslug.js https://wzrd.in/standalone/uslug@latest
