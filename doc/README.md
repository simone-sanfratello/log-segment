# log-segment

# WORK IN PROGRESS


## API

.set

one point settings to rule them all

.get

.add

log.v alias log.val alias log.value
encapsulate to prevent JSON.strigify to the needed point
may be not be executed

mode:

CONSOLE -> use console log
FILE -> use fs
MAIL -> use nodemailer

If segment and level have different output mode, only one is performed.
The priority is:

- segment mode EMAIL -> send email segment settings
- level mode EMAIL -> send email level settings
- segment mode FILE -> write to file segment settings
- level mode FILE -> write to file level settings
- write to console

settings:
* every level
* every segment

can be call to unknow level, even empty string, if settings is * will be output

### Default settings

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
    },
    panic: {
      color: 'magenta',
      marker: '😱'
    }
  }
})

log.info('*', 'info message')
log.success('*', 'success message')
log.warning('*', 'warning message')
log.error('*', 'error message')
log.panic('*', 'panic message')
````
