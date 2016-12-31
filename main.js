'use strict'

// https://github.com/pinojs/pino/blob/master/docs/API.md
const pino = require('pino')()
const colors = require('colors')

const log = function (params) {
  const __levels = [ 'error', 'warning', 'info', 'success' ]
  const __enabled = {
    segments: '*',
    levels: '*'
  }

  let MARKER_SUCCESS, MARKER_ERROR, MARKER_INFO, MARKER_WARNING

  var __init = function (params) {
    set(params)

    pino.addLevel('success', 20)

    MARKER_SUCCESS = '✔' // ✔ ✔️
    MARKER_ERROR = '✗️'
    MARKER_INFO = 'ℹ️'
    MARKER_WARNING = '❗️️'

    MARKER_SUCCESS = colors.green(MARKER_SUCCESS)
    MARKER_ERROR = colors.red(MARKER_ERROR)
    MARKER_INFO = colors.blue(MARKER_INFO)
    MARKER_WARNING = colors.yellow(MARKER_WARNING)
  }

  const set = function (params) {
    __enabled.segments = params.segments
    __enabled.levels = params.levels
    // pino ...
  }

  const __check = function (segment, level) {
    return ((__enabled.segments === '*' || __enabled.segments.indexOf(segment) !== -1) &&
      (__levels === '*' || __enabled.levels.indexOf(level) !== -1)) 
  }

  const __verbose = function(segment) {
    
  }

      const _args = Array.prototype.slice.call(arguments)

      if (level === 'error') {
        _args[1] = MARKER_ERROR
//        pino.warn.apply(console, _args)
        pino.error(_args)
      } else if (level === 'warning') {
        _args[1] = MARKER_WARNING
        pino.warn(_args)
      } else if (level === 'success') {
        _args[1] = MARKER_SUCCESS
        pino.success(_args)
      } else {
        _args[1] = MARKER_INFO
        pino.info(_args)
      }
    }
  }

  __init(params)


  return {
    info: info,
    error: error,
    warning: warning,
    success: success
  }
}

module.exports = log()
