'use strict';

// Rest In Peace !
angular.module('rip', ['ngLodash'])
    .service('Rip', ['$http', 'lodash', '$q', function ($http, _, $q) {

        var self = this;
        var internals = {};

        internals.removeTrailingSlash = function (str) {

            return _.endsWith(str, '/') ? str.slice(0, -1) : str;
        };

        internals.call = function (config) {
            var d = $q.defer();

            $http(config).then(function (response) {
                d.resolve(response.data, _.omit(response, 'data'));
            }, d.reject);

            return d.promise;
        };

        internals.baseUri = '';
        internals.baseHeaders = null;

        this.setBaseUri = function (uri) {

            internals.baseUri = uri;
        };

        this.baseUri = function () {

            return internals.baseUri;
        };

        this.setBaseHeaders = function (headers) {

            if (headers) {
                internals.baseHeaders = headers;
            }
        };

        this.baseHeaders = function () {

            return internals.baseHeaders;
        };

        internals.UriBuilder = function (base) {

            this._uri = [];
            this._uri.push(internals.removeTrailingSlash(base));
        };

        internals.UriBuilder.prototype.one = function (resource, id) {

            this._uri.push(resource);

            if (id) {
                this._uri.push(id);
            }

            return this;
        };

        internals.UriBuilder.prototype.all = function (resource) {

            this._uri.push(resource);
            return this;
        };

        internals.UriBuilder.prototype.uri = function () {

            return this._uri.join('/');
        };

        internals.Request = function (name) {

            this._uriBuilder = new internals.UriBuilder(internals.baseUri);

            if (name) {
                this._uriBuilder.all(name);
            }

            this._config = {};
            this._custom = {
                uri: false,
                method: false
            };

            if (internals.baseHeaders) {
                this._config.headers = internals.baseHeaders;
            }
        };



        internals.Request.prototype.all = function (resource) {
            this._uriBuilder.all(resource);
            return this;
        };

        internals.Request.prototype.one = function (resource, id) {
            this._uriBuilder.one(resource, id);
            return this;
        };

        internals.Request.prototype.headers = function (headers) {

            if (headers) {
                if (!this._config.headers) {
                    this._config.headers = {};
                }
                _.defaultsDeep(this._config.headers, headers);
            }

            return this;
        };

        internals.Request.prototype.data = function (data) {

            if (data) {
                this._config.data = data;
            }

            return this;
        };

        internals.Request.prototype.params = function (params) {

            if (params) {
                this._config.params = params;
            }

            return this;
        };

        internals.Request.prototype.config = function (config) {

            if (config) {
                _.defaultsDeep(this._config, config);
            }

            return this;
        };

        internals.Request.prototype.uri = function (uri) {

            if (uri && !this._custom.uri) {
                this._config.url = uri;
                this._custom.uri = true;
            }

            return this;
        };

        internals.Request.prototype.method = function (method) {

            if (method && !this._custom.method) {
                this._config.method = method;
                this._custom.method = true;
            }

            return this;
        };

        internals.Request.prototype.call = function () {
            return internals.call(this._config);
        };

        internals.Request.prototype.get = function (/*params*/) {
            return this.uri(this._uriBuilder.uri()).method('GET').params(arguments[0]).call();
        };

        _.each(['post', 'put', 'patch', 'delete'], function (method) {
            internals.Request.prototype[method] = function (/* data, params */) {
                return this.uri(this._uriBuilder.uri())
                    .method(method)
                    .data(arguments[0])
                    .params(arguments[1])
                    .call();
            };
        });

        this.Model = this.Request = function (name) {
            this.name = name;
        };

        this.Model.prototype.one = function (resource, id) {
            return new internals.Request(this.name).one(resource, id);
        };

        this.Model.prototype.all = function (resource) {
            return new internals.Request(this.name).one(resource);
        };

        internals.argumentsArray = function (args) {

            var array = [];
            for (var i = 0; i < args.length; ++i) {
                array.push(args[i]);
            }

            return array;
        };

        _.each(['get', 'patch', 'post', 'delete', 'call'], function (method) {

            self.Model.prototype[method] = function () {

                return new internals.Request(this.name)[method](...internals.argumentsArray(arguments));
            };
        });

    }]);
