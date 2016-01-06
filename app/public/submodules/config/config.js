angular
    .module('hapi-learning.config', [])
    .constant('$config', {
        $apiPrefix: '',
        $apiLoginEndpoint: '/login',
        $apiLogoutEndpoint: '/logout',
        $apiMeEndpoint: '/me',
        $loginState: 'login',
        $afterLoginState: 'root.home',
        $beginSessionEvent: 'begin-session',
        $endSessionEvent: 'end-session',
        uri: function (uri) {
            return this.$apiPrefix + uri;
        }

}).service('AuthStorage', ['store', function (store) {
    return store.getNamespacedStore('auth');
}])
