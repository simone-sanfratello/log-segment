const log = require('../main')

log.set({
  segments: { db: { color: 'red' } }
})

log.info('db', 'data1')
