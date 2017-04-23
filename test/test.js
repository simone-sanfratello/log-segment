'use strict'
/**
 * @todo test add funciton: segments, levels
 */
const tap = require('tap')

const log = require('../main')

const samples = require('./samples/sample.json')

let segments, levels, enabled, scenarios

const result = function (level, segment) {
  try {
    return (segment === '*' ||
      enabled.segments === '*' ||
      enabled.segments.indexOf(segment) !== -1) &&
      (enabled.levels === '*' ||
      enabled.levels.indexOf(level) !== -1)
  } catch (e) {}
  return false
}

const test = function () {
  console.log('settings', log.get())

  Object.keys(log.levels).forEach(function (level) {
    samples.forEach((sample) => {
      tap.test('print', (test) => {
        test.plan(1)
        let _print = log[level](sample.segment, sample.message)
        test.equal(_print, result(level, sample.segment))
      // console.log(level, sample.segment, _print, result(level, sample.segment))
      // log[level](sample.segment, sample.message)
      })
    })
  })
// }
}

// default settings
segments = log.segments
levels = log.levels
enabled = log.enabled
test()

// custom settings
segments = {
  '*': {
    color: 'white'
  },
  http: {
    color: 'cyan'
  },
  sql: {
    mode: log.mode.FILE,
    file: '/tmp/log-segment-test.log'
  }
}

levels = {
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
    color: 'red',
    mode: log.mode.EMAIL,
    email: {
      transporter: {
        service: 'gmail',
        auth: {
          user: '***@gmail.com',
          pass: '***'
        }
      },
      options: {
        from: '"log-segment" <log-segment@test.test>',
        to: 'braceslab0@gmail.com',
        subject: 'YOUR-APPLICATION: PANIC ERROR'
      }
    }
  }
}

scenarios = {
  dev: {
    segments: [ 'http', 'sql' ],
    levels: [ 'error', 'warning', 'info', 'success' ]
  },
  beta: {
    segments: [ 'http' ],
    levels: [ 'error', 'success' ]
  },
  all: {
    segments: '*',
    levels: '*'
  },
  none: {
    segments: null,
    levels: null
  },
  prod: {
    segments: [ 'sql' ],
    levels: [ 'panic' ]
  }
}

for (const env in scenarios) {
  enabled = scenarios[env]

  log.set({
    segments: segments,
    levels: levels,
    enabled: enabled
  })
  test()
}

// weird settings
segments = {
  http: {
    color: 'purple'
  },
  sql: {
    color: 'magenta'
  }
}

levels = {
  warning: {
    color: 'orange',
    marker: 'WARNING'
  },
  custom: {
  }
}

scenarios = {
  dev: {
    segments: [ 'http', 'sql', 'unknown' ],
    levels: [ 'error', 'warning', 'info', 'success' ]
  },
  beta: {
    segments: [ 'http' ],
    levels: [ 'custom', 'success', 'unknown' ]
  }
}

for (const env in scenarios) {
  enabled = scenarios[env]

  log.set({
    segments: segments,
    levels: levels,
    enabled: enabled
  })
  test()
}
