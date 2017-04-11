# log-segment

Node.js logger with partition  

[![NPM Version](http://img.shields.io/npm/v/log-segment.svg?style=flat)](https://www.npmjs.org/package/log-segment)
[![NPM Downloads](https://img.shields.io/npm/dm/log-segment.svg?style=flat)](https://www.npmjs.org/package/log-segment)

[![JS Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

[![NPM](https://nodei.co/npm-dl/log-segment.png)](https://nodei.co/npm/log-segment/)

### Description

````log-segment```` provide a lightweight logger full customizable to quickly enable and disable segments and levels.

### Install

````bash
npm install log-segment --save
````

### Usage

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

<!--
#### Customize

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
-->

### API
...

### Roadmap

- add message info: trace, timestamp, chrono
- custom format in message
- custom format in log.value
- custom transport by segment and level: console, file, stream, email (sms, telegram and whatever)
- browser support (browserify?)
- (evaluate) support workers (as transport)
  - [pino](https://github.com/pinojs/pino)
  - [npmlog](https://github.com/npm/npmlog)
  - [winston](https://github.com/winstonjs/winston)
  - [log](https://github.com/tj/log.js)
  - [debug](https://github.com/visionmedia/debug)
  - others?

---

## License

The MIT License (MIT)

Copyright (c) 2016-2017 Simone Sanfratello

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
