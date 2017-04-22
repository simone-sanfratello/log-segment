# log-segment

## API

.set

one point settings to rule them all

.add

log.v alias log.val alias log.value
encapsulate to prevent JSON.strigify to the needed point
may be not be executed

mode:

CONSOLE -> use console log
FILE -> use fs
MAIL -> use nodemailer

mode

if segment is file, output only to this file
if level is file, output only to this file

else write to console

level
* unknow level, or empty

#### Default

````js
const log = require('log-segment')
log.info('*', 'info message')
log.success('*', 'success message')
log.warning('*', 'warning message')
log.error('*', 'error message')
log.panic('*', 'panic message')
````

output
(attach screenshot)

DEFAULT

````js
const log = require('log-segment')
log.set({
  segments: {
    http: {
      color: 'white'
    },
    sql: {
      color: 'magenta'
    }
  },
  levels: {
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
    }
  }
})

log.info('*', 'info message')
log.success('*', 'success message')
log.warning('*', 'warning message')
log.error('*', 'error message')
````
