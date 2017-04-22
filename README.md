# log-segment

[![NPM Version](http://img.shields.io/npm/v/log-segment.svg?style=flat)](https://www.npmjs.org/package/log-segment)
[![NPM Downloads](https://img.shields.io/npm/dm/log-segment.svg?style=flat)](https://www.npmjs.org/package/log-segment)

[![NPM](https://nodei.co/npm-dl/log-segment.png)](https://nodei.co/npm/log-segment/)

[![JS Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

Javascript logger with partition  

## Purpose

Not all logs are equal.
The scope is to have an easy way to quickly manage logs by two factors: level and segment.  
These two factors are fully customizable.  

## Installing

````bash
$ npm i -g log-segment
````

### Quick start

``log-segment`` is single-ton, so just require and use everywhere

````js
const log = require('log-segment')

const sql = 'INSERT INTO table ...'
log.info('sql', 'executing query ...', log.value('sql', sql))
db.query(sql)
.then(() => {
    log.success('sql', 'query done.', log.value('sql', sql))
})
.catch((err) => {
    log.error('sql', 'query error', log.value('sql', sql))
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

![quickstart](./doc/img/quickstart.jpg  "quickstart")

##### Customize levels

````js
const log = require('log-segment')

log.set()

// ...
````

##### Customize segments

````js
const log = require('log-segment')

log.set()

// ...
````

### Use Cases

Starting from this configuration

````js
// ... example
````

**Development**
Just enable everything on console

````js
// ... example
````

**Debug**
Enable only segments to focus on, at any levels, to find that bug

````js
// ... example
````

**Production**

Different behaviour for each level:
  - disable not interesting parts: success level, template rendering
  - different file for each type: warning, error, info
    and remove marks
  - on panic -> email
  - separate file of log sql

````js
// ... example
````

## Documentation

See [documentation](./doc/README.md) for further informations.

## Changelog

v. 1.1.0

- Add support for mail mode

## TODO

- add message info: trace, timestamp, chrono
- custom format in message
- custom format in log.value
- custom mode: stream, (sms, telegram and whatever)
- customizable action (example: on error run function)
- multiple mode for each settings (example: on panic send email, log to file, send sms, call mom)
- browser support (browserify?)
- (evaluate) support workers (as transport)
  - [pino](https://github.com/pinojs/pino)
  - [npmlog](https://github.com/npm/npmlog)
  - [winston](https://github.com/winstonjs/winston)
  - [log](https://github.com/tj/log.js)
  - [debug](https://github.com/visionmedia/debug)
  - [log](https://github.com/tj/log.js)
  - [bunyan](https://github.com/trentm/node-bunyan)
  - others?

---

## License

The MIT License (MIT)

Copyright (c) 2017, [braces lab](https://braceslab.com)

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
