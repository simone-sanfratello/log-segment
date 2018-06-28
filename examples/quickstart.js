'use strict'

const log = require('../main')

console.log(log.get())

const sql = 'INSERT INTO users (username, name) VALUES ($1, $2)'

log.info('sql', 'create user', log.value('sql', sql), log.chrono('insert-user'))
log.success('sql', 'user created.', log.value('sql', sql), log.chrono('insert-user'))

const request = {
  method: 'GET',
  baseUrl: '/it/4x/api.html#req'
}

const err = new Error('file not found')

log.info('http', 'request', request.method, request.baseUrl)
log.error('http', 'response on request', request.method, request.baseUrl, log.value('err', err))
