[![npm version](https://badge.fury.io/js/router5-history.svg)](https://badge.fury.io/js/router5-history)
[![Build Status](https://travis-ci.org/router5/router5-history.svg?branch=master)](https://travis-ci.org/router5/router5-history?branch=master)
[![Coverage Status](https://coveralls.io/repos/router5/router5-history/badge.svg?branch=master&service=github)](https://coveralls.io/github/router5/router5-history?branch=master)

# router5-history

HTML5 history for router5: http://router5.github.io

### How to install

The `dist` folder contains:
- AMD bundled (with minifed version) named `router5HistoryPlugin`
- Browser module-less bundle (with minified version) adding to the globals `router5HistoryPlugin`
- UMD and CommonJs files

Sources are distributed through:
- bower (`bower install router5-history`)
- npm (`bower install --save router5-history`)

### How to use

```javascript
import { Router5 }     from 'router5'
import historyPlugin   from 'router5-history';

const router = new Router5()
    .addNode('home', '/home')
    .usePlugin(historyPlugin());
```

### What does it do?

- Uses the history API to update history state and URL on router5 state changes
- Listens to popstate events (back and forward buttons, manual changes of URL)


### Contributing

Please read [contributing guidelines](https://github.com/router5/router5/blob/master/CONTRIBUTING.md) on router5 repository.
