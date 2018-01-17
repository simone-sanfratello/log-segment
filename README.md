# log-segment

[![NPM Version](http://img.shields.io/npm/v/log-segment.svg?style=flat)](https://www.npmjs.org/package/log-segment)
[![NPM Downloads](https://img.shields.io/npm/dm/log-segment.svg?style=flat)](https://www.npmjs.org/package/log-segment)

[![JS Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

javascript logger with partition

## Purpose

Quickly manage logs by two **level** and **segment**.  

## Install

````bash
$ npm i log-segment --save
````

### Quick start

``log-segment`` is singleton, so just require and use everywhere.

````js
const log = require('log-segment')

const sql = 'INSERT INTO users (username, name) VALUES ($1, $2)'
log.info('sql', 'create user', log.value('sql', sql), log.chrono('insert-user'))
db.query(sql)
.then(() => {
  log.success('sql', 'user created.', log.value('sql', sql), log.chrono('insert-user'))
})
.catch((err) => {
  log.error('sql', 'user not created', log.value('sql', sql), log.value('error', err), log.chrono('insert-user'))
})
````

````js
const log = require('log-segment')

require('express')().all('/*', (request, response) => {
  log.info('http', 'request', request.method, request.baseUrl)
  
  doSomething(request)
  .then((output) => {
    response.send(output)
    log.success('http', 'response on request', request.method, request.baseUrl)
  })
  .catch((err) => {
    response.sendStatus(500)
    log.error('http', 'response on request', request.method, request.baseUrl, log.value('err', err))
  })
})
````

![quickstart](./doc/img/quickstart.png  "quickstart")

#### Default settings

Default settings provide any levels and segments enabled to console output.  
Default levels are: *info, success, warning, error, panic*.  
There is no hierarchy by levels.

````js
{ 
  levels: {
     '*': { color: 'white' },
     info: { color: 'blue', marker: 'ℹ️' },
     success: { color: 'green', marker: '✔' },
     warning: { color: 'yellow', marker: '❗️️' },
     error: { color: 'red', marker: '✗️' },
     panic: { color: 'magenta', marker: '😱' }
  },
  segments: { '*': { color: 'white' } },
  format: '{segment} | {marker} [{timestamp}] {message}',
  enabled: { segments: '*', levels: '*' } 
}
````

![default](./doc/img/default.png  "default")

##### Custom segments

````js
const log = require('log-segment')

log.set({
  segments: {
    http: {
      color: 'cyan'
    },
    html: {
      color: 'magenta'
    },
    sql: {
      mode: log.mode.FILE,
      file: '/tmp/myapp/sql.log'
    },
    sys: {
      mode: log.mode.FILE,
      file: '/tmp/myapp/sys.log',
      format: '{timestamp} {message}'
    },
  }
})

const sql = 'INSERT INTO table ...'

log.info('sql', 'executing query ...', log.value('sql', sql))
log.success('sql', 'query done.', log.value('sql', sql))

const request = {
  method: 'GET',
  baseUrl: '/it/4x/api.html#req'
}

const err = new Error('file not found')

log.info('http', 'request', request.method, request.baseUrl)
log.error('http', 'response on request', request.method, request.baseUrl, log.value('err', err))

let username = null
log.warning('html', 'rendering missing value', log.value('username', username))

````

![custom segments](./doc/img/custom-segments.png  "custom segments")

#### Custom levels

````js
const log = require('log-segment')

log.set({
  levels: {
    trace: {
      marker: '[TRACE]'
    },
    warning: {
      marker: '[WARN]'
    },
    error: {
      marker: '[ERR]',
      mode: log.mode.FILE,
      file: '/tmp/myapp/error.log',
      format: '{timestamp} {message}'
    }
  }
})

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
````

![custom levels](./doc/img/custom-levels.png  "custom levels")

#### Custom format

Default format is ``'{segment} | {marker} [{timestamp}] {message}'``.  
You can optionally add ``{trace}``  

````js
log.set({
  format: '{marker} [{timestamp}] {message} {trace}'
})
````

### Use Cases

````js
log.set({
  segments: {
    http: { color: 'cyan' },
    network: { color: 'blue' },
    db: { color: 'yellow' },
    sql: { }
  }
})
````

**Development**  

Just enable everything on console

````js
log.set({ enabled: { segments: '*', levels: '*' } })
````

**Debug**  

Enable only segments to focus on, at any levels, to find that bug

````js
log.set({ enabled: { segments: ['sql', 'network'] } })
````

**Beta**  

Enable all segments, disable info and success level

````js
log.set({ disabled: { levels: ['info', 'success'] } })
````

**Production**

Different behaviour for each level:
  - disable not interesting parts: success level
  - different file for each type: *info, warning, error*
    and remove marks
  - separate sql file
  - on panic send email

````js
log.set({
  enabled: {
    segments: ['sql'],
    levels: ['info', 'warning', 'error', 'panic']
  },
  segments: {
      sql: {
        mode: log.mode.FILE,
        file: '/var/log/myapp/sql'
      }
  },
  levels: {
    info: {
      marker: '[i]',
      mode: log.mode.FILE,
      file: '/var/log/myapp/info'
    },
    warning: {
      marker: '[warn]',
      mode: log.mode.FILE,
      file: '/var/log/myapp/warn'
    },
    error: {
      marker: '[err]',
      mode: log.mode.FILE,
      file: '/var/log/myapp/error'
    },
    panic: {
      mode: log.mode.EMAIL,
        email: {
          transporter: {
            service: 'gmail',
            auth: {
              user: '***@gmail.com',
              pass: '***'
            }
          }
        }
        options: {
          from: '"log-segment" <log-segment@test.test>',
          to: 'sys-admin@gmail.com',
          subject: 'myapp PANIC'
        }
      }
    }
  }
})
````

## Documentation

See [documentation](./doc/README.md) for further informations.

## Changelog

v. 1.7.0

- Add custom format to ``level``, optionally add ``{segment}``
- Default format review as ``'{segment} | {marker} [{timestamp}] {message}'``

v. 1.6.0

- Add chrono function ``log.chrono('tag')``

v. 1.3.0

- Add customizable output default format
- Add message info ``trace``, ``timestamp``

v. 1.2.0

- Add ``.check()`` to check settings for 
  - console > color
  - files > write permission
  - emails > sending settings

v. 1.1.0

- Add support for email mode

## TODO

- [ ] browser support, only console mode (!colors) ``console.log('%c message', 'color: red');``
- [ ] custom mode: stream, (sms, telegram and whatever)
- [ ] custom format in log.value
- [ ] multiple mode for each setting (example: on panic send email + log to file + send sms + call mom)
- [ ] (evaluate) support workers (as transport)
  - [pino](https://github.com/pinojs/pino)
  - [npmlog](https://github.com/npm/npmlog)
  - [winston](https://github.com/winstonjs/winston)
  - [log](https://github.com/tj/log.js)
  - [debug](https://github.com/visionmedia/debug)
  - [bunyan](https://github.com/trentm/node-bunyan)
  - others?

---

## License

The MIT License (MIT)

Copyright (c) 2017-2018, [braces lab](https://braceslab.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
