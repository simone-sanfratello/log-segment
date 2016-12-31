'use strict'

/*
const chai = require('chai')
const assert = chai.assert
const expect = chai.expect
const should = chai.should()
*/

// http://www.zsoltnagy.eu/writing-automated-tests-with-mocha-and-chai/
// https://mochajs.org/#assertions

const log = require('../main')

const config = {
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
  for (const env in config) {
    describe(env, () => {
      before(function () {
        log.set({
          segments: config.dev.segments,
          levels: config.dev.levels
        })
      })

      log.levels().forEach(function (level) {
        it(`print ${level}`, function () {
          log[level]('message: the sun is shining')
          log[level]('db', 'connected to db')
          log[level]('sql', 'INSERT INTO (...) ')
          log[level]('http', '/api/user/123')
        })
      })
    })
  }
})
