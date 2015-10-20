var base = window.location.pathname;
var router;

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
        router = createRouter(base, useHash);
        router.usePlugin(router5HistoryPlugin());
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
            expect(getPath(useHash)).toBe('/home');
            done();
        });
    });
});
