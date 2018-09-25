const path = require('path')

const { getOptions } = require('loader-utils')
const validateOptions = require('schema-utils')

const postcss = require('postcss')
const prependPlugin = require('./plugin')

const LOADER_NAME = 'Gutenberg Scope Loader'

const optionSchema = {
  type: 'object',
  properties: {
    files: {
      type: 'array',
      items: {
        anyOf: [
          { instanceof: 'RegExp' },
          { type: 'string' }
        ]
      }
    },
    selector: {
      type: 'string'
    },
    sourceMap: {
      type: 'boolean'
    },
  }
}

const loader = function (css, map, meta) {
  const loaderOptions = Object.assign({
    files: [],
    selector: '.editor-block-list__block',
    sourceMap: false,
  }, getOptions(this))
  validateOptions(optionSchema, loaderOptions, LOADER_NAME)

  const cb = this.async()

  if (this.loaderIndex === 0) {
    cb(new Error(`${LOADER_NAME} cannot be the first loader in the chain.`))

    return
  }

  const file = this.resourcePath

  let match = false
  for (let i = 0; i < loaderOptions.files.length; i++) {
    let test = loaderOptions.files[i]
    if (typeof test === 'string' && file.indexOf(test) > -1) {
      match = true
    } else if (test.constructor.name === 'RegExp' && test.test(file)) {
      match = true
    }
    if (match) {
      break
    }
  }

  if (!match) {
    cb(null, css, map, meta)
    return
  }

  const plugins = [
    prependPlugin({ selector: `${loaderOptions.selector} ` })
  ]

  const postcssOptions = {
    from: file,
    map: loaderOptions.sourceMap
      ? { inline: false, annotation: false }
      : false
  }

  if (loaderOptions.sourceMap) {
    /* istanbul ignore next: too hard to mock */
    if (typeof map === 'string') {
      map = JSON.parse(map)
    }
    /* istanbul ignore next: too hard to mock */
    if (map) {
      postcssOptions.map.prev = map
    }
  }

  postcss(plugins)
    .process(css, postcssOptions)
    .then(result => {
      let { css, map, root, processor, messages } = result

      map = map ? map.toJSON() : null
      if (map) {
        map.file = path.resolve(map.file)
        map.sources = map.sources.map(src => path.resolve(src))
      }

      cb(null, css, map, meta)
    })
}

module.exports = loader
