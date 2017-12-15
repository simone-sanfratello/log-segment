const log = require('../main')

const f = (ok) => {
  log.info('tag', 'start', log.chrono('timer', true))

  setTimeout(() => {
    log.info('tag', 'first lap', log.chrono('timer'))
  }, 50)

  if (ok) {
    setTimeout(() => {
      log.success('tag', 'success', log.chrono('timer'))
    }, 100)
  } else {
    setTimeout(() => {
      log.error('tag', 'error', log.chrono('timer'))
    }, 150)
  }
}

f(true)
setTimeout(f, 200)
