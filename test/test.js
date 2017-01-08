'use strict'

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
  Object.keys(log.levels).forEach(function (level) {
    samples.forEach((sample) => {
      tap.test('print', (test) => {
        test.plan(1)
        let _print = log[level](sample.segment, sample.message)
        test.equal(_print, result(level, sample.segment))
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
    color: 'magenta'
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
