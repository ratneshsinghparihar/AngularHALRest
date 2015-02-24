!(function () {

    'use strict';

    angular.module("common.springRestService", [])
        .factory("springRestService", ['$http', '$q', 'SpringDataRestAdapter',
            function ($http, $q, SpringDataRestAdapter) {

                var Item = function (item) {
                    if (item._resources) {
                        item.resources = item._resources("self", {}, {
                            update: {
                                method: 'PUT'
                            }
                        });
                        item.save = function (callback) {
                            item.resources.update(item, function () {
                                callback && callback(item);
                            });
                        };

                        item.remove = function (callback) {
                            item.resources.remove(function () {
                                callback && callback(item);
                            });
                        };
                    } else {
                        item.save = function (callback) {
                            Item.resources.save(item, function (item, headers) {
                                var deferred = $http.get(headers().location);
                                return SpringDataRestAdapter.processWithPromise(deferred).then(function (newItem) {
                                    callback && callback(new Item(newItem));
                                });
                            });
                        };
                    }

                    return item;
                }

                var Query = function (url) {
                    var deferred = $q.defer();

                    $http.get(url)
                        .success(function (data, status, headers, config) {
                            var response = SpringDataRestAdapter.process(data);
                            if (response._resources) {
                                Item.resources = response._resources("self");
                            }
                            if (response._embeddedItems) {

                            _.map(response._embeddedItems, function (item) {
                                return new Item(item);
                            });
                        }
                            deferred.resolve(response);
                        }).
                        error(function (data, status, headers, config) {
                            console.log(data + status);
                        });
                    return deferred.promise;
                }

                Item.prototype.resources = null;

                return{
                    Item: Item,
                    Query: Query
                }
            }]
        );
}());