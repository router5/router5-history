var base = window.location.pathname;
var router;
var hashPrefix = '!';
var plugin = router5HistoryPlugin;

function getPath(useHash) {
    if (useHash) return window.location.hash.replace(new RegExp('#' + hashPrefix), '') + window.location.search;
    return window.location.pathname.replace(new RegExp('^' + base), '') + window.location.search;
}

function withoutMeta(state) {
    return {
        name: state.name,
        params: state.params,
        path: state.path
    };
}

describe('historyPlugin', function () {
    test(true);
    test(false);
});

function test(useHash) {
    describe(useHash ? 'With hash' : 'Without hash', function () {
        beforeAll(function () {
            window.history.replaceState({}, '', base);
            if (router) router.stop();
            router = createRouter(base, useHash, hashPrefix);
            router.usePlugin(plugin());
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
                expect(getPath(useHash)).toBe(useHash ? '/' : '/home');
                done();
            });
        });

        it('should update on route change', function (done) {
            router.navigate('users', {}, {}, function (err, state) {
                expect(window.history.state).toEqual(state);
                expect(getPath(useHash)).toBe('/users');
                done();
            });
        });

        it('should handle popstate events', function (done) {
            var homeState = {name: 'home', params: {}, path: '/home'};
            var evt = {};
            router.navigate('home', {}, {}, function (err, state) {
                expect(withoutMeta(state)).toEqual(homeState);

                router.navigate('users', {}, {}, function (err, state) {
                    expect(withoutMeta(state)).toEqual({name: 'users', params: {}, path: '/users'});
                    // router.registerComponent('users', {canDeactivate: function () { return false; }});
                    history.back();
                    setTimeout(function () {
                        expect(withoutMeta(router.getState())).toEqual(homeState);
                        history.forward();
                        // Push to queue
                        setTimeout(function () {
                            expect(withoutMeta(router.getState())).toEqual({name: 'users', params: {}, path: '/users'});
                            // router.canDeactivate('users');
                            done();
                        });
                    });
                });
            });
        });
    });
}
