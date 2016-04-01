define('router5HistoryPlugin', function () { 'use strict';

    var babelHelpers_extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    /**
     * Dumb functions
     */
    // istanbul ignore next
    var identity = function identity(arg) {
        return function () {
            return arg;
        };
    };
    // istanbul ignore next
    var noop = function noop() {};

    /**
     * Browser detection
     */
    var isBrowser = typeof window !== 'undefined';

    /**
     * Browser functions needed by router5
     */
    var getBase$1 = function getBase() {
        return window.location.pathname.replace(/\/$/, '');
    };

    var pushState$1 = function pushState(state, title, path) {
        return window.history.pushState(state, title, path);
    };

    var replaceState$1 = function replaceState(state, title, path) {
        return window.history.replaceState(state, title, path);
    };

    var addPopstateListener$1 = function addPopstateListener(fn) {
        return window.addEventListener('popstate', fn);
    };

    var removePopstateListener$1 = function removePopstateListener(fn) {
        return window.removeEventListener('popstate', fn);
    };

    var getLocation$1 = function getLocation(opts) {
        var path = opts.useHash ? window.location.hash.replace(new RegExp('^#' + opts.hashPrefix), '') : window.location.pathname.replace(new RegExp('^' + opts.base), '');
        return (path || '/') + window.location.search;
    };

    var getState$1 = function getState() {
        return window.history.state;
    };

    /**
     * Export browser object
     */
    var browser = {};
    if (isBrowser) {
        browser = { getBase: getBase$1, pushState: pushState$1, replaceState: replaceState$1, addPopstateListener: addPopstateListener$1, removePopstateListener: removePopstateListener$1, getLocation: getLocation$1, getState: getState$1 };
    } else {
        // istanbul ignore next
        browser = {
            getBase: identity(''),
            pushState: noop,
            replaceState: noop,
            addPopstateListener: noop,
            removePopstateListener: noop,
            getLocation: identity(''),
            getState: identity(null)
        };
    }

    var browser$1 = browser;

    var pushState = browser$1.pushState;
    var replaceState = browser$1.replaceState;
    var addPopstateListener = browser$1.addPopstateListener;
    var removePopstateListener = browser$1.removePopstateListener;
    var getLocation = browser$1.getLocation;
    var getBase = browser$1.getBase;
    var getState = browser$1.getState;

    var pluginName = 'HISTORY';

    var historyPlugin = function historyPlugin() {
        var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var forceDeactivate = _ref.forceDeactivate;
        return function (router) {
            router.getLocation = function () {
                return getLocation(router.options);
            };

            router.replaceHistoryState = function (name) {
                var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

                var state = router.buildState(name, params);
                var url = router.buildUrl(name, params);
                router.lastKnownState = state;
                replaceState(state, '', url);
            };

            var updateBrowserState = function updateBrowserState(state, url, replace) {
                if (replace) replaceState(state, '', url);else pushState(state, '', url);
            };

            var onPopState = function onPopState(evt) {
                // Do nothing if no state or if last know state is poped state (it should never happen)
                var newState = !evt.state || !evt.state.name;
                var state = newState ? router.matchPath(getLocation(router.options)) : evt.state;
                var _router$options = router.options;
                var defaultRoute = _router$options.defaultRoute;
                var defaultParams = _router$options.defaultParams;

                if (!state) {
                    // If current state is already the default route, we will have a double entry
                    // Navigating back and forth will emit SAME_STATES error
                    router.navigate(defaultRoute, defaultParams, { forceDeactivate: forceDeactivate, reload: true, replace: true });
                    return;
                }
                if (router.lastKnownState && router.areStatesEqual(state, router.lastKnownState, false)) {
                    return;
                }

                var fromState = babelHelpers_extends({}, router.getState());

                router._transition(state, fromState, { forceDeactivate: forceDeactivate }, function (err, toState) {
                    if (err) {
                        if (err.redirect) {
                            router.navigate(err.redirect.name, err.redirect.params, { forceDeactivate: forceDeactivate, replace: true });
                        } else if (err === 'CANNOT_DEACTIVATE') {
                            var url = router.buildUrl(router.lastKnownState.name, router.lastKnownState.params);
                            if (!newState) {
                                // Keep history state unchanged but use current URL
                                updateBrowserState(state, url, true);
                            }
                            // else do nothing or history will be messed up
                            // TODO: history.back()?
                        } else {
                                // Force navigation to default state
                                router.navigate(defaultRoute, defaultParams, { forceDeactivate: forceDeactivate, reload: true, replace: true });
                            }
                    } else {
                        router._invokeListeners('$$success', toState, fromState, { replace: true });
                    }
                });
            };

            var onStart = function onStart() {
                // Guess base
                if (router.options.useHash && !router.options.base) {
                    router.options.base = getBase();
                }
                addPopstateListener(onPopState);
            };

            var onStop = function onStop() {
                removePopstateListener(onPopState);
            };

            var onTransitionSuccess = function onTransitionSuccess(toState, fromState, opts) {
                var historyState = getState();
                var replace = opts.replace || fromState && router.areStatesEqual(toState, fromState, false) || opts.reload && historyState && router.areStatesEqual(toState, historyState, false);
                updateBrowserState(toState, router.buildUrl(toState.name, toState.params), replace);
            };

            return { name: pluginName, onStart: onStart, onStop: onStop, onTransitionSuccess: onTransitionSuccess, onPopState: onPopState };
        };
    };

    return historyPlugin;

});