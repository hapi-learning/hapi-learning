'use strict';

// Rest In Peace !
angular.module('rip', ['ngLodash'])
    .service('Rip', ['$http', 'lodash', function ($http, _) {

        var internals = {};

        internals.removeTrailingSlash = function (str) {

            return _.endsWith(str, '/') ? str.slice(0, -1) : str;
        };

        internals.call = function (config) {

            return new Promise(function (resolve, reject) {

                $http(config).then(function (response) {
                    return resolve(response.data, _.omit(response, 'data'));
                }, reject);
            });
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
            this._uri.push(id);
            return this;
        };

        internals.UriBuilder.prototype.all = function (resource) {

            this._uri.push(resource);
            return this;
        };

        internals.UriBuilder.prototype.uri = function () {

            return this._uri.join('/');
        };


        this.Model = function (name) {

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
                _.defaultsDeep(this._config.headers, internals.baseHeaders);
            }
        };

        this.Model.prototype.one = function (resource, id) {

            this._uriBuilder.one(resource, id);
            return this;
        };

        this.Model.prototype.all = function (resource) {

            this._uriBuilder.all(resource);
            return this;
        };

        this.Model.prototype.headers = function (headers) {

            if (headers) {
                _.defaultsDeep(this._config.headers, headers);
            }

            return this;
        };

        this.Model.prototype.data = function (data) {

            if (data) {
                this._config.data = data;
            }

            return this;
        };

        this.Model.prototype.params = function (params) {

            if (params) {
                this._config.params = params;
            }

            return this;
        };

        this.Model.prototype.config = function (config) {

            if (config) {
                _.defaultsDeep(this._config, config);
            }

            return this;
        };

        this.Model.prototype.uri = function (uri) {

            if (uri && !this._custom.uri) {
                this._config.url = uri;
                this._custom.uri = true;
            }

            return this;
        };

        this.Model.prototype.method = function (method) {

            if (method && !this._custom.method) {
                this._config.method = method;
                this._custom.method = true;
            }

            return this;
        };

        this.Model.prototype.call = function () {

            return internals.call(this._config);
        };

        this.Model.prototype.get = function (params) {

            return this.uri(this._uriBuilder.uri()).method('GET').params(params).call();
        };

        this.Model.prototype.post = function (data, params) {

            return this.uri(this._uriBuilder.uri()).method('POST').data(data).params(params).call();
        };

        this.Model.prototype.put = function (data, params) {

            return this.uri(this._uriBuilder.uri()).method('PUT').data(data).params(params).call();
        };

        this.Model.prototype.patch = function (data, params) {

            return this.uri(this._uriBuilder.uri()).method('PATCH').data(data).params(params).call();
        };

        this.Model.prototype.delete = function (data, params) {

            return this.uri(this._uriBuilder.uri()).method('DELETE').data(data).params(params).call();
        };

        // For calls that are not models (semantics)
        this.Request = this.Model;

    }]);
