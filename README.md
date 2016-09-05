[![npm version](https://badge.fury.io/js/router5-history.svg)](https://badge.fury.io/js/router5-history)
[![Build Status](https://travis-ci.org/router5/router5-history.svg?branch=master)](https://travis-ci.org/router5/router5-history?branch=master)
[![Coverage Status](https://coveralls.io/repos/router5/router5-history/badge.svg?branch=master&service=github)](https://coveralls.io/github/router5/router5-history?branch=master)

# [DEPRECATED] router5-history

## From version 4 and above of router5, this module is no longer needed and code has been moved to [router5](https://github.com/router5/router5) main repo. Refer to http://router5.github.io/docs/migration-4.html for more details.

### How to install

The `dist` folder contains:
- AMD bundled (with minifed version) named `router5HistoryPlugin`
- Browser module-less bundle (with minified version) adding to the globals `router5HistoryPlugin`
- UMD and CommonJs files

Sources are distributed through:
- bower (`bower install router5-history`)
- npm (`npm install --save router5-history`)

### How to use

```javascript
import { Router5 }     from 'router5';
import historyPlugin   from 'router5-history';

const router = new Router5()
    .addNode('home', '/home')
    .usePlugin(historyPlugin());
```

### Options

You can specify whether or not current active segments deactivation should be forced on popstate events. By default this is `false` but I recommend setting it to `true` to keep a clean history.

```js
router.usePlugin(historyPlugin({ forceDeactivate: true }));
```

### What does it do?

- Uses the history API to update history state and URL on router5 state changes
- Listens to popstate events (back and forward buttons, manual changes of URL)


### Replacing history

Sometimes, you might want to silently replace the current history entry. This plugin decorates your router instance with a `replaceHistoryState(name, params)` function. The new state provided will also replace the router last known state. Use with care, this could affect the next transition.

### Contributing

Please read [contributing guidelines](https://github.com/router5/router5/blob/master/CONTRIBUTING.md) on router5 repository.
