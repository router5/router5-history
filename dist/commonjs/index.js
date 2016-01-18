'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _browser = require('./browser');

var _browser2 = _interopRequireDefault(_browser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pushState = _browser2.default.pushState;
var replaceState = _browser2.default.replaceState;
var addPopstateListener = _browser2.default.addPopstateListener;
var removePopstateListener = _browser2.default.removePopstateListener;
var getLocation = _browser2.default.getLocation;
var getBase = _browser2.default.getBase;

var pluginName = 'HISTORY';

var historyPlugin = function historyPlugin() {
    return function (router) {
        router.getLocation = function () {
            return getLocation(router.options);
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
                router.navigate(defaultRoute, defaultParams, { reload: true, replace: true });
                return;
            }
            if (router.lastKnownState && router.areStatesEqual(state, router.lastKnownState, true)) {
                return;
            }

            var fromState = _extends({}, router.getState());

            router._transition(state, fromState, function (err, toState) {
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
            updateBrowserState(toState, router.buildUrl(toState.name, toState.params), opts.replace || opts.reload);
        };

        return { name: pluginName, onStart: onStart, onStop: onStop, onTransitionSuccess: onTransitionSuccess, onPopState: onPopState };
    };
};

exports.default = historyPlugin;
module.exports = exports['default'];