[npm]: https://img.shields.io/npm/v/rollup-plugin-define
[npm-url]: https://www.npmjs.com/package/rollup-plugin-define
[size]: https://packagephobia.now.sh/badge?p=rollup-plugin-define
[size-url]: https://packagephobia.now.sh/result?p=rollup-plugin-define

[![npm][npm]][npm-url]
[![size][size]][size-url]
[![libera manifesto](https://img.shields.io/badge/libera-manifesto-lightgrey.svg)](https://liberamanifesto.com)

# rollup-plugin-define

> Replace AST nodes while bundling

<!-- prettier-ignore-start -->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Install](#install)
- [Usage](#usage)
- [Options](#options)
- [Available Scripts](#available-scripts)
- [Create a release](#create-a-release)
- [Folder Structure](#folder-structure)
- [Meta](#meta)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
<!-- prettier-ignore-end -->

## Install

Using npm:

```console
npm install rollup-plugin-define --save-dev
```

## Usage

Create a `rollup.config.js` [configuration file](https://www.rollupjs.org/guide/en/#configuration-files) and import the plugin:

```js
import define from 'rollup-plugin-define'

export default {
  input: 'src/index.js',
  output: {
    dir: 'output',
    format: 'cjs',
  },
  plugins: [
    define({
      replacements: {
        'process.env.NODE_ENV': '"production"',
        __buildDate__: () => JSON.stringify(new Date()),
      },
    }),
  ],
}
```

Then call `rollup` either via the [CLI](https://www.rollupjs.org/guide/en/#command-line-reference) or the [API](https://www.rollupjs.org/guide/en/#javascript-api).

The configuration above will replace every instance of `process.env.NODE_ENV` with `"production"` and `__buildDate__` with the result of the given function in any file included in the build. _Note: Values have to be valid javascript_

Typically, `rollup-plugin-define` should be placed in `plugins` _before_ other plugins so that they may apply optimizations, such as dead code removal.

## Options

In addition to the properties and values specified for replacement, users may also specify the options below.

### `exclude`

Type: `String` | `Array[...String]`<br>
Default: `null`

A [minimatch pattern](https://github.com/isaacs/minimatch), or array of patterns, which specifies the files in the build the plugin should _ignore_. By default no files are ignored.

### `include`

Type: `String` | `Array[...String]`<br>
Default: `null`

A [minimatch pattern](https://github.com/isaacs/minimatch), or array of patterns, which specifies the files in the build the plugin should operate on. By default all files are targeted.

## Available Scripts

### npm test

Two sub scripts will came in handy from time to time:

- `npm start test.watch`: re-run tests on change
- `npm start test.coverage`: creates a coverage report at `coverage/lcov-report/index.html`

### npm run format

Formats all sources using prettier.

## Create a release

1. Update changelog
2. `npm run format`
3. `npm test`
4. git commit -a -m "chore: prepare release`
5. [npm version [\<newversion> | major | minor | patch] -m "chore: release"](https://docs.npmjs.com/cli/version)

## Folder Structure

### `src/`

Put all your source code including your test files here. Test files
are matched using the following regexp:

- `src/**/__tests__/*.{js,jsx,ts,tsx}`: matches every file within a `__tests__` directory but not in child directories
- `src/**/*.{spec,test}.{js,jsx,ts,tsx}`: matches `*.test.js` and `*.spec.js` files; some for the other extensions

## Meta

[LICENSE (MIT)](/LICENSE)
