// register the interceptor as a service

angular.module('httpInterceptor', [])
    .factory('httpInterceptor', ['$q', function ($q) {
        //// optional method
        //'request': function (config) {
        //    // do something on success
        //    return config;
        //},

        //// optional method
        //'requestError': function (rejection) {
        //    // do something on error
        //    if (canRecover(rejection)) {
        //        return responseOrNewPromise
        //    }
        //    return $q.reject(rejection);
        //},

        // optional method
        //'response': function (response) {
        //    // do something on success
        //    return response;
        //},

        // handle error on response
        var responseError = function (response) {
            // do something on error
            var regex = '[a-zA-Z0-9]*\/[0-9]*\/[a-zA-Z0-9]*'; // eg. */equipment/1/area/*
            if (response.status === 404 && response.config.url.match(regex)) {
                console.log('Handled fail for url:' + response.url);
                response.data = null;
                return response;
            }
            return $q.reject(response);
        }

        return {
            responseError: responseError
        };
    }]);