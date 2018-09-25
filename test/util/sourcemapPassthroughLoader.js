const path = require('path')

const postcss = require('postcss')

const emptyPlugin = postcss.plugin('postcss-noop', () => {
  return (css) => {}
})

module.exports = function (css, map, meta) {
  const cb = this.async()
  const postcssOptions = {
    from: this.resourcePath,
    map: { inline: false, annotation: false }
  }
  postcss([emptyPlugin()])
    .process(css, postcssOptions)
    .then((result) => {
      let { css, map } = result
      map = map ? map.toJSON() : null
      if (map) {
        map.file = path.resolve(map.file)
        map.sources = map.sources.map(src => path.resolve(src))
      }

      cb(null, css, map, meta)
    })
}
