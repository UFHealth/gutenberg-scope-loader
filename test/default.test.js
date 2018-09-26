const path = require('path')

const sha = require('js-sha1')

const compile = require('./util/compiler')

/**
 * Generate loader configuration.
 *
 * @param {object} options Loader options.
 *
 * @return {object} Resolved loader configuration.
 */
const getLoader = (options = {}) => {
  return {
    loader: path.resolve(__dirname, '../src/index.js'),
    options: Object.assign({}, options)
  }
}

/**
 * Generate the compiler config used for most of the tests.
 *
 * @param {obeject} loaderOptions Options to be passed to the scope loader.
 *
 * @return {object} Resolved compiler config.
 */
const defaultConfig = (loaderOptions = {}) => {
  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            'css-loader',
            getLoader(loaderOptions)
          ]
        }
      ]
    }
  }
}

/**
 * Generate the base compiler config used for sourcemap-based tests.
 *
 * @param {obeject} loaderOptions Options to be passed to the scope loader.
 *
 * @return {object} Resolved compiler config.
 */
const sourcemappedConfig = (loaderOptions = {}) => {
  return {
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            { loader: 'css-loader', options: { sourceMap: true } },
            getLoader(loaderOptions)
          ]
        }
      ]
    }
  }
}

/**
 * Extract the source text of a given module after compilation.
 *
 * @param {object} stats Webpack stats.
 * @param {number} index Module index.
 *
 * @return {string} Compiled source.
 */
const extractModuleOutput = (stats, moduleIndex) => {
  const obj = stats.toJson()
  if (obj.modules[moduleIndex]) {
    return obj.modules[moduleIndex].source
  }
  return false
}

test('does nothing if no file patterns are passed', () => {
  return compile('simple.css', defaultConfig()).then((stats) => {
    expect(extractModuleOutput(stats, 0)).toMatch('a.link { color: blue; }\\n')
  }, (err) => {
    throw err
  })
})

test('appends scope selector', () => {
  const options = {
    files: ['simple.css']
  }

  return compile('simple.css', defaultConfig(options)).then((stats) => {
    expect(extractModuleOutput(stats, 0)).toMatch('.editor-block-list__block a.link { color: blue; }\\n')
  }, (err) => {
    throw err
  })
})

test('supports string or regex file patterns', () => {
  return Promise.all([
    compile('simple.css', defaultConfig({ files: ['simple.css'] })),
    compile('simple.css', defaultConfig({ files: [/simp.*\.css$/] }))
  ]).then((results) => {
    expect(extractModuleOutput(results[0], 0)).toMatch(extractModuleOutput(results[1], 0))
  }, (err) => {
    throw err
  })
})

test('allows a custom scope selector', () => {
  const options = {
    files: ['simple.css'],
    selector: '.custom-scope-selector'
  }

  return compile('simple.css', defaultConfig(options)).then((stats) => {
    expect(extractModuleOutput(stats, 0)).toMatch('.custom-scope-selector a.link { color: blue; }\\n')
  }, (err) => {
    throw err
  })
})

test('modifies sourcemaps', () => {
  const _config = (options) => {
    return sourcemappedConfig(Object.assign(options, { files: ['multiple.css'] }))
  }

  return Promise.all([
    compile('multiple.css', _config({ sourceMap: false })),
    compile('multiple.css', _config({ sourceMap: true }))
  ]).then((results) => {
    const outputBefore = extractModuleOutput(results[0], 0)
    const outputAfter = extractModuleOutput(results[1], 0)
    expect(sha(outputAfter)).not.toEqual(sha(outputBefore))
  }, (err) => {
    throw err
  })
})

test('cannot be the first loader in a chain', () => {
  const compilerConfig = defaultConfig({ files: ['simple.css'] })
  compilerConfig.module.rules[0].use.shift()
  expect.assertions(1)
  return expect(compile('simple.css', compilerConfig)).rejects.toThrow(/cannot be the first loader in the chain/)
})

test('does nothing if the scope selector is empty', () => {
  const options = { files: ['simple.css'], selector: '' }
  return compile('simple.css', defaultConfig(options)).then((stats) => {
    expect(extractModuleOutput(stats, 0)).toMatch('a.link { color: blue; }\\n')
  }, (err) => {
    throw err
  })
})

test('skips keyframe declarations', () => {
  const options = { files: ['keyframes.css'] }
  return compile('keyframes.css', defaultConfig(options)).then((stats) => {
    expect(extractModuleOutput(stats, 0)).toMatch('".editor-block-list__block a.link { color: blue; }\\n@keyframes test { from { opacity: 0; } to { opacity: 1; } }\\n')
  }, (err) => {
    throw err
  })
})

test('skips selectors if already prefixed', () => {
  const _config = (options) => {
    return defaultConfig(Object.assign(options, { files: ['prefixed.css'] }))
  }

  return Promise.all([
    compile('prefixed.css', _config({})),
    compile('prefixed.css', _config({ selector: '.custom' }))
  ]).then((results) => {
    expect(extractModuleOutput(results[0], 0)).toMatch('".editor-block-list__block .custom-scope a.link { color: blue; }')
    expect(extractModuleOutput(results[1], 0)).toMatch('".custom-scope a.link { color: blue; }')
  }, (err) => {
    throw err
  })
})
