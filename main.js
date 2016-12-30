'use strict'

const pino = require('pino')()

/**
 * @constructor
 * @param {Object} params
 * @param {string[]|string} params.segments enabled segments or '*' for all
 * @param {string[]|string} params.levels enabled level or '*' for all; levels are: info, warning, error
 */
const log = function (params) {
    var __segments
    var __levels
    var __browser
    var MARKER_SUCCESS, MARKER_ERROR, MARKER_INFO, MARKER_WARNING

    var __init = function (params) {
      __segments = params.segments
      __levels = params.levels
      __browser = tools.core.onBrowser()
      // @todo const __mode = params.mode console, file, email ...
      MARKER_SUCCESS = '✔' // ✔ ✔️
      MARKER_ERROR = '✗️'
      MARKER_INFO = 'ℹ️'
      MARKER_WARNING = '❗️️'
      if (!__browser) {
        var colors = require('colors')
        MARKER_SUCCESS = colors.green(MARKER_SUCCESS)
        MARKER_ERROR = colors.red(MARKER_ERROR)
        MARKER_INFO = colors.blue(MARKER_INFO)
        MARKER_WARNING = colors.yellow(MARKER_WARNING)
      } else {
      }
    }

    var verbose = function (segment, level) {
      if ((__segments === '*' || tools.array.contains(__segments, segment)) &&
        (__levels === '*' || tools.array.contains(__levels, level))) {
        var _args = Array.prototype.slice.call(arguments)
        if (level === tools.Log.level.ERROR) {
          _args[1] = MARKER_ERROR
          console.error.apply(console, _args)
        } else if (level === tools.Log.level.WARNING) {
          _args[1] = MARKER_WARNING
          console.warn.apply(console, _args)
        } else if (level === tools.Log.level.SUCCESS) {
          _args[1] = MARKER_SUCCESS
          console.log.apply(console, _args)
        } else {
          _args[1] = MARKER_INFO
          console.log.apply(console, _args)
        }
      }
    }

    __init(params)

    return {
      verbose: verbose
    }
  }


// enums
tools.Log.level = {
  ERROR: 'ERROR',
  WARNING: 'WARNING',
  INFO: 'INFO',
  SUCCESS: 'SUCCESS'
}

module.exports = log
