'use strict'

const tools = require('a-toolbox')
const chalk = require('chalk')
const fs = require('fs')

// @todo transport for each level
// console, file, stream, email (telegram, sms ...)
// @todo custom format messages

const mode = {
  CONSOLE: 0,
  FILE: 1
// STREAM
// EMAIL
// OTHERS (telegram, sms ...)
}

/**
 * @todo params.format
 */
const Log = function (params) {
  // default console
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
    },
    panic: {
      color: 'magenta',
      marker: '😱' // ☠'
    }
  }
  let __segments = {'*': { color: 'white' }}

  let __markers

  const __enabled = {
    segments: '*',
    levels: '*'
  }

  /**
   * files stream.Writable
   */
  const __files = {}

  function __init (params) {
    __markers = {}
    __setLevels(__levels)
  }

  function set (params) {
    if (!params) {
      return
    }

    if (params.segments) {
      __setSegments(params.segments)
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

  /**
   * add segment: if already exists, override
   * add level: if already exists, override
   */
  function add (params) {
    if (!params) {
      return
    }

    if (params.segments) {
      __addSegments(params.segments)
    }
    if (params.levels) {
      __addLevels(params.levels)
    }
  }

  function value (label, value) {
    return function () {
      if (typeof value === 'object') {
        try {
          return `[${label}=${JSON.stringify(value)}]`
        } catch (e) {
          return `[${label}=INVALID-JSON]`
        }
      } else {
        return `[${label}=${value}]`
      }
    }
  }

  function __setSegments (segments) {
    __segments = {}
    __addSegments(segments)
  }

  function __addSegments (segments) {
    for (const i in segments) {
      if (__segments[i]) {
        console.warn('log-segment, override segment', i)
      }
      let _segment = segments[i]
      if (!chalk[_segment.color]) {
        console.warn('log-segment, unknown color', _segment.color, 'for segment', i)
      }
      __segments[i] = _segment
    }
  }

  function __setLevels (levels) {
    // remove current levels
    for (const i in __levels) {
      delete Log.prototype[i]
    }
    // set new levels
    __markers = {}
    __levels = {}
    __addLevels(levels)
  }

  function __addLevels (levels) {
    for (const i in levels) {
      let _level = levels[i]
      if (__levels[i]) {
        delete Log.prototype[i]
        console.warn('log-segment, override level', i)
      }
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
      __levels[i] = _level
    }
  }

  /**
   *
   * @param {string} level level name
   */
  function __print (level) {
    return function (segment) {
      if (!__check(segment, level)) {
        return false
      }

      let _data = Array.prototype.slice.call(arguments)
      _data = _data.map((message) => {
        // stringify an object
        if (typeof message === 'object') {
          try {
            message = JSON.stringify(message)
          } catch (e) {
            message = '[INVALID-JSON]'
          }
        } else if (typeof message === 'function') {
          message = message()
        }
        // add segment color
        // paint the message
        if (__segments[segment] &&
          __segments[segment].color &&
          chalk[__segments[segment].color]) {
          return chalk[__segments[segment].color](message)
        }
        return message
      })

      // add marker
      if (__levels[level].marker) {
        _data.unshift(__markers[level])
      }

      return __output(segment, level, _data)
    }
  }

  function __output (segment, level, data) {
    // @todo custom format
    if (__segments[segment] && __segments[segment].mode === mode.FILE) {
      return __outputFile(__segments[segment].file, data)
    }
    if (__levels[level].mode === mode.FILE) {
      return __outputFile(__segments[segment].file, data)
    }

    // mode console
    console.log.apply(console, data)
    return true
  }

  /**
   * @todo open file err
   * @param {string} file /path/to/file
   * @param {string[]} data
   */
  function __outputFile (file, data) {
    // open stream, if not already opened
    if (!__files[file]) {
      __files[file] = fs.createWriteStream(file, {flags: 'a', defaultEncoding: 'utf8'})

      /* debug
      __files[file].on('finish', function () {
        console.log('file has been written')
      })
      __files[file].on('open', function () {
        console.log('file has been open')
      })
      */

      process.on('beforeExit', () => {
        if (__files[file]) {
          __files[file].end()
          __files[file] = null
        }
      })
    }

    data.push('\n')
    return __files[file].write(data.join(' '))
  }

  function __check (segment, level) {
    return ((segment === '*') ||
      __enabled.segments === '*' ||
      tools.array.contains(__enabled.segments, segment)) &&
      ((__enabled.levels === '*') ||
      tools.array.contains(__enabled.levels, level))
  }

  __init(params)

  Object.defineProperty(Log.prototype, 'levels', {
    get: () => {
      return Object.assign({}, __levels)
    }
  })
  Object.defineProperty(Log.prototype, 'segments', {
    get: () => {
      return Object.assign({}, __segments)
    }
  })
  Object.defineProperty(Log.prototype, 'enabled', {
    get: () => {
      return Object.assign({}, __enabled)
    }
  })
  Log.prototype.set = set
  Log.prototype.add = add
  Log.prototype.value = Log.prototype.val = Log.prototype.v = value

  Log.prototype.mode = mode
}

const log = new Log()

module.exports = log
