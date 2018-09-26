const postcss = require('postcss')

/**
 * Generated PostCSS plugin that prepends a specified selector when applicable.
 *
 * @type {function}
 */
const plugin = postcss.plugin('postcss-prepend-selector', (options) => {
  options = Object.assign({
    selector: ''
  }, options)
  return (css) => {
    if (typeof options.selector !== 'string' || !options.selector.trim().length) {
      return
    }
    css.walkRules((rule) => {
      rule.selectors = rule.selectors.map((selector) => {
        if (/^([0-9]*[.])?[0-9]+%$|^from$|^to$/.test(selector)) {
          // Skip keyframes
          return selector
        }
        if (selector.startsWith(options.selector.trim())) {
          // Skip selector paths with the prefix selector already hard-coded
          return selector
        }
        return options.selector + selector
      })
    })
  }
})

module.exports = plugin
