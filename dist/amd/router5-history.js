/**
 * @license
 * @version 1.0.0-rc1
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Thomas Roch
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
define('router5HistoryPlugin', [], function () {
"use strict";

    /**
     * Dumb functions
     */
    var identity = function identity(arg) {
        return function () {
            return arg;
        };
    };
    var noop = function noop() {};
    
    /**
     * Browser detection
     */
    var isBrowser = typeof window !== 'undefined';
    
    /**
     * Browser functions needed by router5
     */
    var getBase = function getBase() {
        return window.location.pathname.replace(/\/$/, '');
    };
    
    var pushState = function pushState(state, title, path) {
        return window.history.pushState(state, title, path);
    };
    
    var replaceState = function replaceState(state, title, path) {
        return window.history.replaceState(state, title, path);
    };
    
    var addPopstateListener = function addPopstateListener(fn) {
        return window.addEventListener('popstate', fn);
    };
    
    var removePopstateListener = function removePopstateListener(fn) {
        return window.removeEventListener('popstate', fn);
    };
    
    var getLocation = function getLocation(opts) {
        var path = opts.useHash ? window.location.hash.replace(new RegExp('^#' + opts.hashPrefix), '') : window.location.pathname.replace(new RegExp('^' + opts.base), '');
        return path + window.location.search;
    };
    
    var getState = function getState() {
        return window.history.state;
    };
    
    /**
     * Export browser object
     */
    var browser = {};
    if (isBrowser) {
        browser = { getBase: getBase, pushState: pushState, replaceState: replaceState, addPopstateListener: addPopstateListener, removePopstateListener: removePopstateListener, getLocation: getLocation, getState: getState };
    } else {
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
    var pluginName = 'HISTORY';
    
    function historyPlugin() {
        var router = undefined;
    
        function updateBrowserState(state, url, replace) {
            if (replace) replaceState(state, '', url);else pushState(state, '', url);
        }
    
        function onPopState(evt) {
            // Do nothing if no state or if last know state is poped state (it should never happen)
            var newState = !evt.state || !evt.state.name;
            var state = evt.state || router.matchPath(browser.getLocation(router.options));
            var _router$options = router.options;
            var defaultRoute = _router$options.defaultRoute;
            var defaultParams = _router$options.defaultParams;
    
            if (!state) {
                // If current state is already the default route, we will have a double entry
                // Navigating back and forth will emit SAME_STATES error
                router.navigate(defaultRoute, defaultParams, { reload: true, replace: true });
                return;
            }
            if (router.lastKnownState && router.areStatesEqual(state, router.lastKnownState, false)) {
                return;
            }
    
            router._transition(state, router.lastKnownState, function (err, toState) {
                if (err) {
                    if (err === 'CANNOT_DEACTIVATE') {
                        var url = router.buildUrl(router.lastKnownState.name, router.lastKnownState.params);
                        if (!newState) {
                            // Keep history state unchanged but use current URL
                            updateBrowserState(state, url, true);
                        }
                        // else do nothing or history will be messed up
                        // TODO: history.back()?
                    } else {
                            // Force navigation to default state
                            router.navigate(defaultRoute, defaultParams, { reload: true, replace: true });
                        }
                } else {
                    updateBrowserState(toState, router.buildUrl(toState.name, toState.params), newState);
                }
            });
        }
    
        function init(target) {
            router = target;
            // Monkey patch getLocation
            router.getLocation = function () {
                return browser.getLocation(router.options);
            };
        }
    
        function onStart() {
            // Guess base
            if (router.options.useHash && router.options.base) {
                router.options.base = browser.getBase();
            }
            addPopstateListener(onPopState);
        }
    
        function onStop() {
            removePopstateListener(onPopState);
        }
    
        function onTransitionSuccess(toState, fromState, opts) {
            updateBrowserState(toState, router.buildUrl(toState.name, toState.params), opts.replace || opts.reload);
        }
    
        return { name: pluginName, init: init, onStart: onStart, onStop: onStop, onTransitionSuccess: onTransitionSuccess, onPopState: onPopState };
    }

    return historyPlugin;
});
