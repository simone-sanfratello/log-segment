'use strict'

const tools = require('a-toolbox')
const colors = require('colors')

/**
 * @todo params.format
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
  let __format
  let __segments = {}
  let __markers = {}

  const __enabled = {
    segments: '*',
    levels: '*'
  }

  const __init = function (params) {
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
        if (_level.color && colors[_level.color]) {
          __markers[i] = colors[_level.color](_level.marker)
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
      if (__segments[segment].color) {
        _args = _args.map((message) => {
          if(!colors[__segments[segment].color]) {
            console.log('missing color', __segments[segment].color)
          }
          return colors[__segments[segment].color](message)
        })
      }

      // add marker
      if (__levels[level].marker) {
        tools.array.insert(_args, 1, __markers[level])
      }

      // @todo transport for each level
      // console, file, stream, email (telegram, sms ...)
      // @todo format
      console.log.apply(console, _args)
      return true
    }
  }

  const __check = function (segment, level) {
    return (__segments[segment] && __levels[level]) &&
      (segment === '*' ||
      __enabled.segments === '*' ||
      tools.array.contains(__enabled.segments, segment)) &&
      (__enabled.levels === '*' ||
      tools.array.contains(__enabled.levels, level))
  }

  __init(params)

  Object.defineProperty(Log.prototype, 'levels', {
    get: function () { return Object.keys(__levels) }
  })
  Log.prototype.set = set
}

const log = new Log()

module.exports = log
