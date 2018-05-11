let log4js = require('jm-log4js')

function getLine () {
  let e = new Error()
  // now magic will happen: get line number from callstack
  let line = e.stack.split('\n')[3].split(':')[1]
  return line
}

function colorizeStart (style) {
  return style ? '\x1B[' + styles[style][0] + 'm' : ''
}

function colorizeEnd (style) {
  return style ? '\x1B[' + styles[style][1] + 'm' : ''
}

/**
 * Taken from masylum's fork (https://github.com/masylum/log4js-node)
 */
function colorize (str, style) {
  return colorizeStart(style) + str + colorizeEnd(style)
}

let styles = {
  // styles
  'bold': [1, 22],
  'italic': [3, 23],
  'underline': [4, 24],
  'inverse': [7, 27],
  // grayscale
  'white': [37, 39],
  'grey': [90, 39],
  'black': [90, 39],
  // colors
  'blue': [34, 39],
  'cyan': [36, 39],
  'green': [32, 39],
  'magenta': [35, 39],
  'red': [31, 39],
  'yellow': [33, 39]
}

let colours = {
  'all': 'grey',
  'trace': 'blue',
  'debug': 'cyan',
  'info': 'green',
  'warn': 'yellow',
  'error': 'red',
  'fatal': 'magenta',
  'off': 'grey'
}

module.exports = function (categoryName) {
  let args = arguments
  let prefix = ''
  for (let i = 1; i < args.length; i++) {
    if (i !== args.length - 1) { prefix = prefix + args[i] + '] [' } else { prefix = prefix + args[i] }
  }
  if (typeof categoryName === 'string') {
    // category name is __filename then cut the prefix path
    categoryName = categoryName.replace(process.cwd(), '')
  }
  let logger = log4js.getLogger(categoryName)
  let pLogger = {}
  for (let key in logger) {
    pLogger[key] = logger[key]
  }

  ['log', 'debug', 'info', 'warn', 'error', 'trace', 'fatal'].forEach(function (item) {
    pLogger[item] = function () {
      let p = ''
      if (!process.env.RAW_MESSAGE) {
        if (args.length > 1) {
          p = '[' + prefix + '] '
        }
        if (args.length && process.env.LOGGER_LINE) {
          p = getLine() + ': ' + p
        }
        p = colorize(p, colours[item])
      }

      if (args.length) {
        arguments[0] = p + arguments[0]
      }
      logger[item].apply(logger, arguments)
    }
  })
  return pLogger
}
