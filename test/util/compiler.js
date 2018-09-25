const path = require('path')

const memoryfs = require('memory-fs')
const merge = require('webpack-merge')
const webpack = require('webpack')

module.exports = (fixture, instanceConfig = {}) => {

  const compiler = webpack(merge({
    context: __dirname,
    entry: path.resolve(__dirname, `../fixture/${fixture}`),
    output: {
      path: path.resolve(__dirname, '../dist'),
      filename: 'bundle.js'
    },
  }, instanceConfig))

  // compiler.outputFileSystem = new memoryfs()

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err || stats.hasErrors()) {
        reject(err || new Error(stats.toJson().errors.join('\n')))
        return
      }

      resolve(stats)
    })
  })
}
