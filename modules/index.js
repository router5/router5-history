const pluginName = 'HISTORY';
import { pushState, replaceState, addPopstateListener, removePopstateListener, getLocation } from 'browser';

function historyPlugin() {
    let router;

    function updateBrowserState(state, url, replace) {
        if (replace) replaceState(state, '', url);
        else pushState(state, '', url);
    }

    function onPopState(evt) {
        // Do nothing if no state or if last know state is poped state (it should never happen)
        const newState = !evt.state || !evt.state.name;
        const state = evt.state || router.matchPath(browser.getLocation(router.options));
        const {defaultRoute, defaultParams} = router.options;

        if (!state) {
            // If current state is already the default route, we will have a double entry
            // Navigating back and forth will emit SAME_STATES error
            router.navigate(defaultRoute, defaultParams, {reload: true, replace: true});
            return;
        }
        if (router.lastKnownState && router.areStatesEqual(state, router.lastKnownState, false)) {
            return;
        }

        router._transition(state, router.lastKnownState, (err, toState) => {
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


    return { name: pluginName, init, onStart, onStop, onTransitionSuccess, onPopState };
}

export default historyPlugin;
