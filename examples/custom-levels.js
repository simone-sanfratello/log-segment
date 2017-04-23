'use strict'

const log = require('../main')

log.set({
  segments: {
    http: {
      color: 'yellow'
    },
    sql: {
      color: 'white'
    }
  },
  levels: {
    trace: {
      marker: '[TRACE]'
    },
    warning: {
      marker: '[WARN]'
    },
    error: {
      marker: '[ERR]'
    }
  }
})

console.log(log.get())

const sql = 'INSERT INTO table ...'

log.trace('sql', 'executing query ...', log.value('sql', sql))
log.trace('sql', 'query done.', log.value('sql', sql))

const request = {
  method: 'GET',
  baseUrl: '/it/4x/api.html#req'
}

const err = new Error('file not found')

log.trace('http', 'request', request.method, request.baseUrl)
log.error('http', 'response on request', request.method, request.baseUrl, log.value('err', err))

let username = null
log.warning('html', 'rendering missing value', log.value('username', username))
