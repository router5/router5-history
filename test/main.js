var base = window.location.pathname;
var router;
var hashPrefix = '!';
var plugin = router5HistoryPlugin();

function getExpectedPath(useHash, path) {
    return useHash ? '#' + hashPrefix + path : path;
}

function getPath(useHash) {
    if (useHash) return window.location.hash + window.location.search;
    return window.location.pathname.replace(new RegExp('^' + base), '') + window.location.search;
}

describe('historyPlugin', function () {
    var useHash = false;

    beforeAll(function () {
        router = createRouter(base, useHash, hashPrefix);
        router.usePlugin(plugin);
    });

    afterAll(function () {
        router.stop();
    });

    it('should be registered', function () {
        expect(Object.keys(router.registeredPlugins)).toContain('HISTORY');
    });

    it('should update history on start', function (done) {
        router.start(function (err, state) {
            expect(window.history.state).toEqual(state);
            expect(getExpectedPath(useHash, getPath(useHash))).toBe('/home');
            done();
        });
    });

    it('should update on route change', function (done) {
        router.navigate('users', {}, {}, function (err, state) {
            expect(window.history.state).toEqual(state);
            expect(getExpectedPath(useHash, getPath(useHash))).toBe('/users');
            done();
        });
    });

    it('should handle popstate events', function (done) {
        var homeState = {name: 'home', params: {}, path: '/home'};
        var evt = {};
        plugin.onPopState(evt);
        setTimeout(function () {
            expect(router.getState()).not.toEqual(homeState);

            evt.state = homeState;
            plugin.onPopState(evt);

            setTimeout(function () {
                expect(router.getState()).toEqual(homeState);

                router.navigate('users', {}, {}, function () {
                    router.registerComponent('users', {canDeactivate: function () { return false; }});
                    // Nothing will happen
                    plugin.onPopState(evt);
                    // Push to queue
                    setTimeout(function () {
                        expect(router.getState()).not.toEqual(homeState);
                        router.deregisterComponent('users');
                        done();
                    });
                });
            });
        });
    });
});
