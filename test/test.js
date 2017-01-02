'use strict'

const chai = require('chai')
const assert = chai.assert
const expect = chai.expect
const should = chai.should()

// http://www.zsoltnagy.eu/writing-automated-tests-with-mocha-and-chai/
// https://mochajs.org/#assertions

const log = require('../main')

const segments = {
  http: {
    color: 'yellow'
  },
  sql: {
    color: 'green'
  }
}

const levels = {
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

describe('log', () => {
  for (const env in enabled) {
    describe(env, () => {
      log.set({
        enabled: {
          segments: enabled[env].segments,
          levels: enabled[env].levels
        }
      })

      log.levels.forEach(function (level) {
        it(`print ${level}`, function () {
          log[level]('*', 'message: the sun is shining')
          log[level]('db', 'connected to db')
          log[level]('sql', 'INSERT INTO (...) ')
          log[level]('http', '/api/user/123')
        })
      })
    })
  }
})
