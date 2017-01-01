'use strict'

// https://github.com/pinojs/pino/blob/master/docs/API.md
const pino = require('pino')()
const colors = require('colors')

const log = function (params) {
  let __levels = {
    info: {
      color: 'blue',
      marker: 'ℹ️'
    },
    success: {
      color: 'green',
      marker: '✔' // ✔ ✔️
    },
    warning: {
      color: 'yellow',
      marker: '❗️️'
    },
    error: {
      color: 'red',
      marker: '✗️'
    }
  }
  let __segments = []

  const __enabled = {
    segments: '*',
    levels: '*'
  }

  const set = function (params) {
    if (params.segments) {
      __segments = params.segments
    }
    if (params.levels) {
      __levels = params.levels
    }
    if (params.enabled) {
      if (params.enabled.segments) {
        __enabled.segments = params.enabled.segments
      }
      if (params.enabled.levels) {
        __enabled.levels = params.enabled.levels
        __pinoSync()
      }
    }
  }

  const __pinoSync = function() {
    pino.level = 1
    // remove all levels
    /*
    for(const _level in pino.levels) {
      pino.removeLevel(_level)
    }
    */
    // add levels
    pino.addLevel(level, i*10)
  }

  /*
      MARKER_SUCCESS = colors.green(MARKER_SUCCESS)
      MARKER_ERROR = colors.red(MARKER_ERROR)
      MARKER_INFO = colors.blue(MARKER_INFO)
      MARKER_WARNING = colors.yellow(MARKER_WARNING)
  */


  const __check = function (segment, level) {
    return (__enabled.segments === '*' || __enabled.segments.indexOf(segment) !== -1) &&
      (__levels === '*' || __enabled.levels.indexOf(level) !== -1)
  }

/*
  const __print = function (segment, level) {
    __check(segment, level)
    const _args = Array.prototype.slice.call(arguments)
  }

  const info = function () {
    const _args = Array.prototype.slice.call(arguments)
    _args[1] = MARKER_INFO
    // pino.warn.apply(console, _args)
    __print(__segment(_args), 'info')
  }
*/

  set(params)

  return {
    set: set
  }
}

const _log = log()

module.exports = _log
