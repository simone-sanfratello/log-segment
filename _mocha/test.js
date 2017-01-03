'use strict'

/*
const chai = require('chai')
const assert = chai.assert
// const expect = chai.expect
// const should = chai.should()

// http://www.zsoltnagy.eu/writing-automated-tests-with-mocha-and-chai/
// https://mochajs.org/#assertions

/*
const log = require('../../main')

const segments = {
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

const levels = {
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

log.set({
  segments: segments,
  levels: levels
})

const enabled = {
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

const samples = [
  {
    segment: '*',
    message: 'message: the sun is shining'
  },
  {
    segment: 'db',
    message: 'connected to db'
  },
  {
    segment: 'sql',
    message: 'INSERT INTO (...) '
  },
  {
    segment: 'http',
    message: '/api/user/123'
  },
  {
    segment: 'unknown',
    message: 'doh'
  }
]

const result = function (env, level, segment) {
  try {
    return (segment === '*' ||
      enabled[env].segments === '*' ||
      enabled[env].segments.indexOf(segment) !== -1) &&
      (enabled[env].levels === '*' ||
      enabled[env].levels.indexOf(level) !== -1)
  } catch (e) {}
  return false
}

describe('log', () => {
  for (const env in enabled) {
    describe(`env = ${env}`, () => {
      beforeEach(() => {
        log.set({
          enabled: {
            segments: enabled[env].segments,
            levels: enabled[env].levels
          }
        })
      })

      log.levels.forEach(function (level) {
        it(`print ${level}`, function () {
          samples.forEach((sample) => {
            assert.isOk(log[level](sample.segment, sample.message) == result(env, level, sample.segment))
          })
        })
      })
    })
  }
})
*/
