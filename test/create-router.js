var usersRoute = new RouteNode('users', '/users', [
    new RouteNode('view', '/view/:id'),
    new RouteNode('list', '/list')
]);

var ordersRoute = new RouteNode('orders', '/orders', [
    new RouteNode('view', '/view/:id'),
    new RouteNode('pending', '/pending'),
    new RouteNode('completed', '/completed')
]);

var sectionRoute = new RouteNode('section', '/:section<section[\\d]+>', [
    new RouteNode('view', '/view/:id'),
    new RouteNode('query', '/query?param2&param3')
]);

function createRouter(base, useHash, hashPrefix) {
    return new Router5([
            usersRoute,
            sectionRoute
        ], {
            defaultRoute: 'home'
        })
        .setOption('useHash', useHash)
        .setOption('hashPrefix', hashPrefix)
        .setOption('base', base)
        .add(ordersRoute)
        .addNode('index', '/')
        .addNode('home', '/home')
        .addNode('admin', '/admin', function canActivate() { return false; });
}
