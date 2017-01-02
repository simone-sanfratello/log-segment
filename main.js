'use strict'

// https://github.com/pinojs/pino/blob/master/docs/API.md
const pino = require('pino')
const tools = require('a-toolbox')
const colors = require('colors')

/**
 * @todo format, pino settings
 * api
 */
const Log = function (params) {
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
  let __segments = {}
  let __markers = {}
  let __pino

  const __enabled = {
    segments: '*',
    levels: '*'
  }

  // @todo format pino - segment.color
  const __format = function(a,b,c) {
    console.log('pino format', a)
  }

  const __init = function (params) {
    __pino = pino({
      // @todo pino.settings
    }, __format)
    __pino.addLevel('segment', 1)
    __pino.level = 'segment'

    set(params)
  }

  const set = function (params) {
    if (!params) {
      return
    }

    if (params.segments) {
      __segments = params.segments
    }
    if (params.levels) {
      __setLevels(params.levels)
    }
    if (params.enabled) {
      if (params.enabled.segments) {
        __enabled.segments = params.enabled.segments
      }
      if (params.enabled.levels) {
        __enabled.levels = params.enabled.levels
      }
    }
  }

  const __setLevels = function (levels) {
    // remove current levels
    for (const i in __levels) {
      delete Log.prototype[i]
    }
    // set new levels
    __levels = levels
    __markers = {}
    for (const i in __levels) {
      let _level = __levels[i]
      Log.prototype[i] = __print(i)
      // cache markers
      __markers[i] = colors[_level.color](_level.marker)
    }
  }

  const __print = function (level) {
    return function (segment) {
      if (!__check(segment, level)) {
        return false
      }
      const _args = Array.prototype.slice.call(arguments)
      tools.array.insert(_args, 1, __markers[level])
      __pino.segment.apply(__pino, _args)
    }
  }

  const __check = function (segment, level) {
    return (segment === '*' ||
      __enabled.segments === '*' ||
      __enabled.segments.indexOf(segment) !== -1) &&
      (__enabled.levels === '*' ||
      __enabled.levels.indexOf(level) !== -1)
  }

  __init(params)

  Object.defineProperty(Log.prototype, 'levels', {
    get: function () { return Object.keys(__levels) }
  })
  Log.prototype.set = set
}

const log = new Log()

module.exports = log
