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
        router.navigate('home', {}, {}, function (err, state) {
            expect(state).toEqual(homeState);

            router.navigate('users', {}, {}, function (err, state) {
                expect(state).toEqual({name: 'users', params: {}, path: '/users'});
                // router.registerComponent('users', {canDeactivate: function () { return false; }});
                history.back();
                setTimeout(function () {
                    expect(router.getState()).toEqual(homeState);
                    history.forward();
                    // Push to queue
                    setTimeout(function () {
                        expect(router.getState()).toEqual({name: 'users', params: {}, path: '/users'});
                        router.deregisterComponent('users');
                        done();
                    });
                });
            });
        });
    });
});
