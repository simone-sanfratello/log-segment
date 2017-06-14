'use strict'

const tools = require('a-toolbox')
const chalk = require('chalk')
const fs = require('fs-extra')
const nodemailer = require('nodemailer')

// ? Error.stackTraceLimit = Infinity;

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
  let __template = {
    string: '{marker} [{timestamp}] {message}',
    timestamp: true,
    marker: true,
    trace: false
  }

  let __markers

  const __enabled = {
    segments: '*',
    levels: '*'
  }

  /**
   * files stream.Writable
   */
  const __files = {}

  const __memoize = {
    printable: {}
  }

  /**
   * @constructor
   * @param {Object} params
   * @param {string} template default '{marker} [{timestamp}] {message}'
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

    if (params.format) {
      __setTemplate(params.format)
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
      enabled: Object.assign({}, __enabled),
      format: __template.string
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

  const __setTemplate = function (template) {
    __template.string = template
    __template.marker = template.indexOf('{marker}') !== -1
    __template.timestamp = template.indexOf('{timestamp}') !== -1
    __template.trace = template.indexOf('{trace}') !== -1
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
      __checkSetting(_segment, {segment: i})
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
      __checkSetting(_level, {level: i})
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
        let _check = __checkConsole(setting)
        if (_check.err) {
          console.warn('log-segment, unknown color', setting.color, 'for', part)
        }
        break
    }
  }

  const __reset = function () {
    __memoize.printable = {}
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
   * memoized
   * @param {string} segment
   * @param {string} level
   * @return bool
   */
  const __printable = function (segment, level) {
    if (!__memoize.printable[segment + level]) {
      __memoize.printable[segment + level] = ((segment === '*') ||
        __enabled.segments === '*' ||
        tools.array.contains(__enabled.segments, segment)) &&
        ((__enabled.levels === '*') ||
        tools.array.contains(__enabled.levels, level))
    }

    return __memoize.printable[segment + level]
  }

  /**
   *
   * @param {string} level level name
   */
  const __print = function (level) {
    return function (segment) {
      if (!__printable(segment, level)) {
        return false
      }

      const _data = {}

      _data.message = Array.prototype.slice.call(arguments).map((message) => {
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
        return __color(segment, message)
      })

      // add marker
      if (__levels[level].marker) {
        _data.marker = __markers[level]
      }

      return __output(segment, level, __color(segment, __format(_data)))
    }
  }

  const __color = function (segment, message) {
    if (__segments[segment] &&
      __segments[segment].color &&
      chalk[__segments[segment].color]) {
      return chalk[__segments[segment].color](message)
    }
    return message
  }

  /**
   * @param {Object} data {message, marker}
   * @return string
   */
  const __format = function (data) {
    if (__template.timestamp) {
      data.timestamp = __timestamp()
    }
    if (__template.trace) {
      data.trace = __trace()
    }
    data.message = data.message.join(' ')
    return tools.string.template(__template.string, data, true)
  }

  /**
   * nb heavy operation
   */
  const __timestamp = function () {
    return new Date().toISOString()
  }

  /**
   * nb heavy operation
   * nb split last 4 entries
   */
  const __trace = function () {
    return '\n' + (new Error().stack.split('\n').splice(4).join('\n'))
  }

  /**
   * @param {string} message
   */
  const __output = function (segment, level, message) {
    // email
    if (__segments[segment] && __segments[segment].mode === mode.EMAIL) {
      return __outputEmail(__segments[segment].email, message)
    }
    if (__levels[level] && __levels[level].mode === mode.EMAIL) {
      return __outputEmail(__levels[level].email, message)
    }

    // file
    if (__segments[segment] && __segments[segment].mode === mode.FILE) {
      return __outputFile(__segments[segment].file, message)
    }
    if (__levels[level].mode === mode.FILE) {
      return __outputFile(__levels[level].file, message)
    }

    // console
    return __outputConsole(message)
  }

  /**
   * @param {string} message
   */
  const __outputConsole = function (message) {
    console.log(message)
    return true
  }

  /**
   * @param {string} file /path/to/file
   * @param {string} message
   */
  const __outputFile = function (file, message) {
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
        __outputFile(file, message)
      })
      return true
    }

    __files[file].stream.write(message + '\n')
    return true
  }

  /**
   * @todo html?
   * @param {*} email
   * @param {string} message
   */
  const __outputEmail = function (email, message) {
    if (!email._transporter) {
      email._transporter = nodemailer.createTransport(email.transporter)
    }

    const _options = Object.assign(email.options)
    _options.text = message + '\n'

    email._transporter.sendMail(_options, (err, info) => {
      if (err) {
        __outputConsole(['ERROR SENDING EMAIL', _options])
        __outputConsole(message)
      }
    })
    return true
  }

  /**
   * @see ./doc/README.md#.check
   */
  const check = function () {
    return new Promise((resolve, reject) => {
      // run all promises, whatever success or not
      const _tasks = []
      let _errors = []
      const _promise = function (promise, p0, p1) {
        return new Promise((resolve, reject) => {
          promise(p0)
            .then(resolve)
            .catch((err) => {
              _errors.push({err: err, part: p1})
              resolve()
            })
        })
      }
      for (const i in __levels) {
        _tasks.push(_promise(__check, __levels[i], `level ${i}`))
      }
      for (const i in __segments) {
        _tasks.push(_promise(__check, __segments[i], `segments ${i}`))
      }

      Promise.all(_tasks)
        .then(() => {
          _errors.length > 0
            ? reject(_errors)
            : resolve()
        })
    })
  }

  const __check = function (setting) {
    switch (setting.mode) {
      case mode.EMAIL:
        return __checkEmail(setting)
      case mode.FILE:
        return __checkFile(setting)
      default:
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            let _check = __checkConsole(setting)
            if (_check.err) {
              reject(_check.message)
              return
            }
            resolve()
          }, 0)
        })
    }
  }

  /**
   * @param {Object} setting
   */
  const __checkConsole = function (setting) {
    if (setting.color && !chalk[setting.color]) {
      return {err: true, message: 'unknown color' + setting.color}
    }
    return {err: false}
  }

  const __checkFile = function (setting) {
    return new Promise((resolve, reject) => {
      fs.ensureFile(setting.file, (err) => {
        if (err) {
          reject(err)
          return
        }
        // test write
        const _data = '*** log-segment.check settings: mode file ***'

        let _stream = fs.createWriteStream(setting.file, {flags: 'a', defaultEncoding: 'utf8'})
        _stream.on('close', function () {
          resolve()
        })
        _stream.on('error', function (err) {
          reject(err)
        })

        _stream.write(_data)
        _stream.end()
      })
    })
  }

  const __checkEmail = function (setting) {
    return new Promise((resolve, reject) => {
      let _transporter = nodemailer.createTransport(setting.email.transporter)

      const _options = Object.assign(setting.email.options)
      _options.text = '*** log-segment.check settings: mode email ***'

      _transporter.sendMail(_options, (err, info) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
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
  Log.prototype.check = check
  Log.prototype.value = Log.prototype.val = Log.prototype.v = value

  Log.prototype.mode = mode
}

const log = new Log()

module.exports = log
