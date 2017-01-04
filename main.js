'use strict'

const tools = require('a-toolbox')
const chalk = require('chalk')

// @todo transport for each level
// console, file, stream, email (telegram, sms ...)
// @todo format

/**
 * @todo params.format
 */
const Log = function (params) {
  let __levels = {
    '*': {
      color: 'white'
    },
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
  let __segments = {'*': { color: 'white' }}

  let __markers = {}

  const __enabled = {
    segments: '*',
    levels: '*'
  }

  const __init = function (params) {
    __setLevels(__levels)
  }

  const set = function (params) {
    if (!params) {
      return
    }

    if (params.segments) {
      __segments = params.segments
      for (const i in __segments) {
        let _segment = __segments[i]
        if (!chalk[_segment.color]) {
          console.warn('log-segment, unknown color', _segment.color, 'for segment', i)
        }
      }
    }
    if (params.levels) {
      __setLevels(params.levels)
    }
    if (params.enabled) {
      if (params.enabled.segments === null) {
        __enabled.segments = []
      } else {
        __enabled.segments = params.enabled.segments
      }

      if (params.enabled.levels === null) {
        __enabled.levels = []
      } else {
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
      if (_level.marker) {
        if (!chalk[_level.color]) {
          console.warn('log-segment, unknown color', _level.color, 'for level', i)
        }

        if (_level.color && chalk[_level.color]) {
          __markers[i] = chalk[_level.color](_level.marker)
        } else {
          __markers[i] = _level.marker
        }
      }
    }
  }

  const __print = function (level) {
    return function (segment) {
      if (!__check(segment, level)) {
        return false
      }
      let _args = Array.prototype.slice.call(arguments)

      // add segment color
      if (__segments[segment] && __segments[segment].color) {
        _args = _args.map((message) => {
          if (chalk[__segments[segment].color]) {
            return chalk[__segments[segment].color](message)
          } else {
            return message
          }
        })
      }

      // add marker
      if (__levels[level].marker) {
        _args.unshift(__markers[level])
      }

      // @todo transport for each level
      // console, file, stream, email (telegram, sms ...)
      // @todo format
      console.log.apply(console, _args)
      return true
    }
  }

  const __check = function (segment, level) {
    return ((segment === '*') ||
      __enabled.segments === '*' ||
      tools.array.contains(__enabled.segments, segment)) &&
      ((__enabled.levels === '*') ||
      tools.array.contains(__enabled.levels, level))
  }

  __init(params)

  Object.defineProperty(Log.prototype, 'levels', {
    get: function () { return Object.assign({}, __levels) }
  })
  Object.defineProperty(Log.prototype, 'segments', {
    get: function () { return Object.assign({}, __segments) }
  })
  Object.defineProperty(Log.prototype, 'enabled', {
    get: function () { return Object.assign({}, __enabled) }
  })
  Log.prototype.set = set
}

const log = new Log()

module.exports = log
