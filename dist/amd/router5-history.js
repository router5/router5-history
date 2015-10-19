/**
 * @license
 * @version 1.0.0
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 
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

    var pluginName = 'HISTORY';
    
    function historyPlugin() {
        var router = undefined;
    
        function updateBrowserState(state, url, replace) {
            if (replace) replaceState(state, url, '');else pushState(state, url, '');
        }
    
        function onPopState(evt) {
            // Do nothing if no state or if last know state is poped state (it should never happen)
            var newState = !evt.state || !evt.state.name;
            var state = evt.state || router.matchPath(browser.getLocation());
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
                    if (err === constants.CANNOT_DEACTIVATE) {
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
        }
    
        function onStart() {
            addPopstateListener(onPopState);
        }
    
        function onStop() {
            removePopstateListener(onPopState);
        }
    
        function onTransitionSuccess(toState, fromState, opts) {
            updateBrowserState(toState, router.buildUrl(toState.name, toState.params), opts.replace || opts.reload);
        }
    
        return { name: pluginName, init: init, onTransitionSuccess: onTransitionSuccess, flush: flush };
    }

    return historyPlugin;
});
