'use strict'

const tools = require('a-toolbox')
const chalk = require('chalk')
const fs = require('fs-extra')
const nodemailer = require('nodemailer')

const mode = {
  CONSOLE: 0,
  FILE: 1,
  EMAIL: 2
}

/**
 * @class
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
      marker: '✔'
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
      marker: '😱'
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

  /**
   * @constructor
   * @param {Object} params
   */
  const __init = function (params) {
    __markers = {}
    __setLevels(__levels)
  }

  /**
   * @param {Object} params
   */
  const set = function (params) {
    if (!params) {
      return
    }

    __reset()

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
   * @return current settings
   */
  const get = function () {
    return {
      levels: Object.assign({}, __levels),
      segments: Object.assign({}, __segments),
      enabled: Object.assign({}, __enabled)
    }
  }

  /**
   * add segment: if already exists, override
   * add level: if already exists, override
   */
  const add = function (params) {
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

  /**
   * @param {string} label
   * @param {*} value
   */
  const value = function (label, value) {
    return function () {
      if (typeof value === 'object') {
        if (value instanceof Error) {
          return value.stack
        }
        if (value instanceof Date) {
          return value.toISOString()
        }
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

  const __setSegments = function (segments) {
    __segments = {}
    __addSegments(segments)
  }

  const __addSegments = function (segments) {
    for (const i in segments) {
      if (__segments[i]) {
        console.warn('log-segment, override segment', i)
      }
      let _segment = segments[i]
      __checkSetting(_segment, 'segment')
      __segments[i] = _segment
    }
  }

  const __setLevels = function (levels) {
    // remove current levels
    for (const i in __levels) {
      delete Log.prototype[i]
    }
    // set new levels
    __markers = {}
    __levels = {}
    __addLevels(levels)
  }

  const __addLevels = function (levels) {
    for (const i in levels) {
      let _level = levels[i]
      if (__levels[i]) {
        delete Log.prototype[i]
        console.warn('log-segment, override level', i)
      }
      Log.prototype[i] = __print(i)
      __checkSetting(_level, 'level')
      // cache markers
      if (_level.marker) {
        if (_level.color && chalk[_level.color]) {
          __markers[i] = chalk[_level.color](_level.marker)
        } else {
          __markers[i] = _level.marker
        }
      }
      __levels[i] = _level
    }
  }

  const __checkSetting = function (setting, part) {
    switch (setting.mode) {
      case mode.EMAIL:
        if (!setting.email) {
          console.warn('log-segment, mode is EMAIL but email settings missing for', part, 'fallback to console')
          setting.mode = mode.CONSOLE
        }
        break
      case mode.FILE:
        if (!setting.file) {
          console.warn('log-segment, mode is FILE but no file specified for', part, 'fallback to console')
          setting.mode = mode.CONSOLE
        }
        break
      case mode.CONSOLE:
      default:
        if (setting.color && !chalk[setting.color]) {
          console.warn('log-segment, unknown color', setting.color, 'for', part)
        }
        break
    }
  }

  const __reset = function () {
    __resetFiles()
  }

  /**
   * clear file streams
   */
  const __resetFiles = function () {
    for (const _file in __files) {
      __files[_file].stream.end()
      process.removeListener('beforeExit', __files[_file].onProcessExit)
      delete __files[_file]
    }
  }

  /**
   * @param {string} segment
   * @param {string} level
   * @return bool
   */
  const __check = function (segment, level) {
    return ((segment === '*') ||
      __enabled.segments === '*' ||
      tools.array.contains(__enabled.segments, segment)) &&
      ((__enabled.levels === '*') ||
      tools.array.contains(__enabled.levels, level))
  }

  /**
   *
   * @param {string} level level name
   */
  const __print = function (level) {
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

  /**
   * @todo custom format
   */
  const __output = function (segment, level, data) {
    // email
    if (__segments[segment] && __segments[segment].mode === mode.EMAIL) {
      return __outputEmail(__segments[segment].email, data)
    }
    if (__levels[level] && __levels[level].mode === mode.EMAIL) {
      return __outputEmail(__levels[level].email, data)
    }

    // file
    if (__segments[segment] && __segments[segment].mode === mode.FILE) {
      return __outputFile(__segments[segment].file, data)
    }
    if (__levels[level].mode === mode.FILE) {
      return __outputFile(__levels[level].file, data)
    }

    // console
    return __outputConsole(data)
  }

  const __outputConsole = function (data) {
    console.log.apply(console, data)
    return true
  }

  /**
   * @param {string} file /path/to/file
   * @param {string[]} data
   */
  const __outputFile = function (file, data) {
    // open stream, if not already opened
    if (!__files[file]) {
      fs.ensureFile(file, (err) => {
        if (err) {
          throw new Error('unable to write', file)
        }
        __files[file] = {
          stream: fs.createWriteStream(file, {flags: 'a', defaultEncoding: 'utf8'}),
          onProcessExit: () => {
            if (__files[file].stream) {
              __files[file].stream.end()
            }
          }
        }
        process.on('beforeExit', __files[file].onProcessExit)
        /* debug
        __files[file].on('finish', function () {
          console.log('file has been written')
        })
        __files[file].on('open', function () {
          console.log('file has been open')
        })
        */
        __outputFile(file, data)
      })
      return true
    }

    data.push('\n')
    __files[file].stream.write(data.join(' '))
    return true
  }

  /**
   * @todo html
   * @param {*} email
   * @param {*} data
   */
  const __outputEmail = function (email, data) {
    if (!email._transporter) {
      email._transporter = nodemailer.createTransport(email.transporter)
    }

    const _options = Object.assign(email.options)
    _options.text = data.join('\n')

    email._transporter.sendMail(_options, (err, info) => {
      if (err) {
        __outputConsole(['ERROR SENDING EMAIL', _options])
        __outputConsole([data])
      }
    })
    return true
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
  Log.prototype.get = get
  Log.prototype.add = add
  Log.prototype.value = Log.prototype.val = Log.prototype.v = value

  Log.prototype.mode = mode
}

const log = new Log()

module.exports = log
