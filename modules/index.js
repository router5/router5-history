import browser from './browser';

const { pushState, replaceState, addPopstateListener, removePopstateListener, getLocation, getBase } = browser;
const pluginName = 'HISTORY';

const historyPlugin = ({ forceDeactivate }) => (router) => {
    router.getLocation = function () {
        return getLocation(router.options);
    };

    const updateBrowserState = (state, url, replace) => {
        if (replace) replaceState(state, '', url);
        else pushState(state, '', url);
    };

    const onPopState = (evt) => {
        // Do nothing if no state or if last know state is poped state (it should never happen)
        const newState = !evt.state || !evt.state.name;
        const state = newState ? router.matchPath(getLocation(router.options)) : evt.state;
        const {defaultRoute, defaultParams} = router.options;

        if (!state) {
            // If current state is already the default route, we will have a double entry
            // Navigating back and forth will emit SAME_STATES error
            router.navigate(defaultRoute, defaultParams, {forceDeactivate, reload: true, replace: true});
            return;
        }
        if (router.lastKnownState && router.areStatesEqual(state, router.lastKnownState, false)) {
            return;
        }

        const fromState = { ...router.getState() };

        router._transition(state, fromState, {forceDeactivate}, (err, toState) => {
            if (err) {
                if (err.redirect) {
                    router.navigate(err.redirect.name, err.redirect.params, {forceDeactivate, replace: true});
                } else if (err === 'CANNOT_DEACTIVATE') {
                    const url = router.buildUrl(router.lastKnownState.name, router.lastKnownState.params);
                    if (!newState) {
                        // Keep history state unchanged but use current URL
                        updateBrowserState(state, url, true);
                    }
                    // else do nothing or history will be messed up
                    // TODO: history.back()?
                } else {
                    // Force navigation to default state
                    router.navigate(defaultRoute, defaultParams, {forceDeactivate, reload: true, replace: true});
                }
            } else {
                router._invokeListeners('$$success', toState, fromState, {replace: true});
            }
        });
    };

    const onStart = () => {
        // Guess base
        if (router.options.useHash && !router.options.base) {
            router.options.base = getBase();
        }
        addPopstateListener(onPopState);
    };

    const onStop = () => {
        removePopstateListener(onPopState);
    };

    const onTransitionSuccess = (toState, fromState, opts) => {
        updateBrowserState(toState, router.buildUrl(toState.name, toState.params), opts.replace || opts.reload);
    };

    return { name: pluginName, onStart, onStop, onTransitionSuccess, onPopState };
};

export default historyPlugin;
