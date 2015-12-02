const pluginName = 'HISTORY';
import { pushState, replaceState, addPopstateListener, removePopstateListener, getLocation, getBase } from './browser';

function historyPlugin() {
    let router;

    function updateBrowserState(state, url, replace) {
        if (replace) replaceState(state, '', url);
        else pushState(state, '', url);
    }

    function onPopState(evt) {
        // Do nothing if no state or if last know state is poped state (it should never happen)
        const newState = !evt.state || !evt.state.name;
        const state = newState ? router.matchPath(getLocation(router.options)) : evt.state;
        const {defaultRoute, defaultParams} = router.options;

        if (!state) {
            // If current state is already the default route, we will have a double entry
            // Navigating back and forth will emit SAME_STATES error
            router.navigate(defaultRoute, defaultParams, {reload: true, replace: true});
            return;
        }
        if (router.lastKnownState && router.areStatesEqual(state, router.lastKnownState, true)) {
            return;
        }

        const fromState = { ...router.getState() };

        router._transition(state, fromState, (err, toState) => {
            if (err) {
                if (err === 'CANNOT_DEACTIVATE') {
                    const url = router.buildUrl(router.lastKnownState.name, router.lastKnownState.params);
                    if (!newState) {
                        // Keep history state unchanged but use current URL
                        updateBrowserState(state, url, true);
                    }
                    // else do nothing or history will be messed up
                    // TODO: history.back()?
                } else {
                    // Force navigation to default state
                    router.navigate(defaultRoute, defaultParams, {reload: true, replace: true});
                }
            } else {
                router._invokeListeners('$$success', toState, fromState, { replace: true });
            }
        });
    }

    function init(target) {
        router = target;
        // Monkey patch getLocation
        router.getLocation = function () {
            return getLocation(router.options);
        };
    }

    function onStart() {
        // Guess base
        if (router.options.useHash && !router.options.base) {
            router.options.base = getBase();
        }
        addPopstateListener(onPopState);
    }

    function onStop() {
        removePopstateListener(onPopState);
    }

    function onTransitionSuccess(toState, fromState, opts) {
        updateBrowserState(toState, router.buildUrl(toState.name, toState.params), opts.replace || opts.reload);
    }


    return { name: pluginName, init, onStart, onStop, onTransitionSuccess, onPopState };
}

export default historyPlugin;
