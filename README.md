# [Gutenberg][gutenberg] Scope Loader

[![Build Status](https://travis-ci.org/UFHealth/gutenberg-scope-loader.svg?branch=master)](https://travis-ci.org/UFHealth/gutenberg-scope-loader)
[![Coverage Status](https://coveralls.io/repos/github/UFHealth/gutenberg-scope-loader/badge.svg)](https://coveralls.io/github/UFHealth/gutenberg-scope-loader)

Automatically prefix selectors in any stylesheet with the Gutenberg editor's scope selector `.editor-block-list__block`. This allows you to write editor stylesheets without uber-specific selectors and not have to worry about specificity issues. It also allows your editor stylesheets to follow the same Webpack pipeline as your other stylesheets, so you can have nice things like hot-reloading.

## But, why?

Gutenberg recently added [built-in support][gutenberg-pull-9008] for a similar behavior, which is enabled with the `editor-styles` theme feature. The difference is, the editor's built-in method involves the browser (your user) parsing and altering the selectors in a stylesheet **at runtime**, which can be an incredibly expensive process if the file is large. It also has no support for style injection or hot reloading, which gives a lot of developers a sad.

This loader leverages [postcss][postcss] within your build process to perform this task. This means your stylesheet already has those selectors in place when it's loaded, and the your user's browser doesn't have to do any work. Plus, if you're already using HMR on the front-end, you can use it on the back-end too just as easy, and get hot-reloaded stylesheets in your editor. Nice.

## Ok, so how do I use it?

Install:
```
yarn add -D gutenberg-scope-loader
```

Add to your Webpack config:

**`webpack.config.js`**
```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/, // Or .scss or whatever
        use: [
          'style-loader',
          {
            loader: 'gutenberg-scope-loader',
            options: {
              files: [
                /editor\.css$/
              ]
            }
          },
          // Other loaders and stuff
        ]
      }
    ]
  }
}
```

### Loader options

#### `files`
_Type: `Array` (required-ish)_  
_Default: `[]`_

An array of strings or regular expressions; only the source files matching these paths/patterns will have their contents prefixed. This means the loader can be included in your main stylesheet loader chain, but will only touch the necessary sources. If you don't provide any patterns to match, the loader just won't do anything.

#### `selector`
_Type: `string`_  
_Default: `.editor-block-list__block`_

The editor scope selector. You shouldn't need to change this, unless Gutenberg changes the selector in their source and you realize it before we do.

#### `sourceMap`
_Type: `boolean`_  
_Default: `false`_

Whether to include and transform a source map.

## Now what?

I dunno man, you take it from here—the world is your oyster.


[gutenberg]: https://wordpress.org/gutenberg/
[gutenberg-pull-9008]: https://github.com/WordPress/gutenberg/pull/9008
[postcss]: https://postcss.org/

[yarn]: https://yarnpkg.com/
