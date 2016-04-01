import browser from './browser';

var pushState = browser.pushState;
var replaceState = browser.replaceState;
var addPopstateListener = browser.addPopstateListener;
var removePopstateListener = browser.removePopstateListener;
var getLocation = browser.getLocation;
var getBase = browser.getBase;
var getState = browser.getState;

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

            var fromState = babelHelpers.extends({}, router.getState());

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

export default historyPlugin;