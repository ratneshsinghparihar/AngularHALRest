
!(function () {
    'use strict';

    angular.module('common.masterDataService', [])
        .factory('common.masterDataService', ['$log', '$http', '$q', '$timeout', 'common.notificationService', 'SpringDataRestAdapter', 'springRestService',
        function ($log, $http, $q, $timeout, notificationService, SpringDataRestAdapter, springRestService) {

                // Private methods
                var logNotifyAndCallback = function (message, type, toToastMessage, callBack) {
                    if (type == eBmrApp.enums.messageType.SUCCESS) {
                        console.info(message);
                    }
                    else {
                        console.error(message);
                    }
                    if (toToastMessage) {
                        notificationService.toastMessage(type, message);
                    }
                    // Call the onSuccess function
                    if (angular.isFunction(callBack)) {
                        callBack();
                    }
                }

                var getProperties = function (obj) {
                    var properties = [];
                    for (var prop in obj) {
                        if (typeof obj[prop] != 'function' && prop != 'self') {
                            //properties.push({ name: prop, url: obj[prop].href });
                            properties.push({ name: prop });
                        }
                    }
                    return properties;
                }

                var fetchData = function (url, itemArray, toToastMessage, embeddedProperty) {
                    $http.get(url)
                        .success(function (data, status) {
                            // Clear array.
                            if (itemArray) {
                                itemArray.length = 0;
                            }
                            var length = 0;
                            if (embeddedProperty && data._embedded[embeddedProperty]) {
                                Array.prototype.push.apply(itemArray, data._embedded[embeddedProperty]);
                                length = data._embedded[embeddedProperty].length;

                            }
                            else {
                                Array.prototype.push.apply(itemArray, data);
                                length = data.length;
                            }
                            console.log(eBmrApp.enums.messageType.SUCCESS,
                                sprintf(eBmrApp.resources.messages.masterDataFetchSucceedful, url, itemArray.length));
                            if (toToastMessage) {
                                notificationService.toastMessage(eBmrApp.enums.messageType.SUCCESS,
                                    sprintf(eBmrApp.resources.messages.masterDataFetchSucceedful, url, itemArray.length));
                            }
                        })
                        .error(function (data, status) {
                            if (toToastMessage) {
                                notificationService.toastMessage(eBmrApp.enums.messageType.ERROR,
                                    sprintf(eBmrApp.resources.messages.masterDataFetchFailed, url, status));
                            }
                            sprintf(eBmrApp.resources.messages.masterDataFetchFailed, url, status);
                        });
                }


                var fetchNested = function (data) {
                    var deferred = $q.defer();

                   
                    var newUrlCalls = [];
                    angular.forEach(data, function (value, key) {
                        newUrlCalls.push(value._resources("area").get().$promise);
                    });
                    $q.all(newUrlCalls)
                    .then(
                         function (results) {
                             for (var i = 0; i < results.length; i++) {
                                 data[i].__area = SpringDataRestAdapter.process(results[i]);
                             }
                             angular.forEach(results, function (x) {
                                 console.log(SpringDataRestAdapter.process(x));
                             });
                             deferred.resolve();
                             console.log('nested resolved');
                         },
                        function (errors) {
                            deferred.reject(errors);
                        },
                        function (updates) {
                            deferred.update(updates);
                        });

                    return deferred.promise;
                }

                var fetchAllDataAsyncWithSpring = function (urls) {
                    var deferred = $q.defer();

                    var urlCalls = [],
                        data = [],
                        nestedObjs = [];

                    angular.forEach(urls, function (value, key) {
                        urlCalls.push(springRestService.Query(value.url));
                    });
                    $q.all(urlCalls)
                        .then(
                            function (results) {
                                angular.forEach(urls, function (value, key) {
                                    data.push({ url: value.url, data: results[key]._embeddedItems });
                                    if (value.isFetchNested === true) {
                                        nestedObjs = nestedObjs.concat(results[key]._embeddedItems);
                                        console.log('nested');
                                        angular.forEach(results[key]._embeddedItems, function (value, key) {

                                            var processedResponse = SpringDataRestAdapter.process(value, 'area');
                                            value['__area'] = processedResponse.area;

                                            //SpringDataRestAdapter.processWithPromise($http.get('/data/equipment/4')).then(function(response) {
                                            //    var processedResponse = SpringDataRestAdapter.process(value, 'area');
                                            //    //var processedResponse1 = SpringDataRestAdapter.process(value, '_allLinks', true);
                                            //    //var b = processedResponse.area;
                                            //    SpringDataRestAdapter.processWithPromise(response, 'area')
                                            //        .then(function(processedResponse) {
                                            //            console.log(processedResponse.area);
                                            //        });
                                            //    var availableResources = response._resources();
                                            //    //var promise = value._resources("area").get().$promise;
                                            //    //promise.then(function (data) {
                                            //    //    console.log(data);
                                            //    //});
                                            //    //console.log(processedResponse.area);
                                            //});
                                        });
                                        

                                    }
                                });
                                if (nestedObjs && nestedObjs.length > 0) {
                                    var promise = fetchNested(nestedObjs);

                                    promise
                                        .then(function (results) {
                                            deferred.resolve(data);
                                        },
                                        function (errors) {
                                            deferred.reject(errors);
                                        })
                                    .catch(function (exception) {
                                        deferred.reject(exception);
                                    });
                                }
                                else {
                                    deferred.resolve(data);
                                    console.log('resolved');
                                }
                            },
                            function (errors) {
                                deferred.reject(errors);
                            })
                            .catch(function (exception) {
                                deferred.reject(exception);
                            })
                            .finally(function (x) {
                                console.log('finally');
                            });

                            
                    return deferred.promise;
                }

                var updateMasterData = function (saveUrl,
                                           data,
                                           otherUrls,
                                           successMessge, 
                                           failureMessage, 
                                           toToastMessage,
                                           onSuccessCallback, 
                                           onFailureCallback) {
                    if (saveUrl == null || saveUrl == '') {
                        alert(eBmrApp.resources.messages.urlBlankorEmpty);
                        return;
                    }
                    $http.put(saveUrl, data)
                        .success(function (data, status) {
                            logNotifyAndCallback(successMessge, eBmrApp.enums.messageType.SUCCESS, toToastMessage, onSuccessCallback);
                        })
                        .error(function (data, status) {
                            logNotifyAndCallback(failureMessage + status, eBmrApp.enums.messageType.ERROR, toToastMessage, onFailureCallback);
                        });
                }

                var createMasterData = function (saveUrl,
                                            data,
                                            successMessge,
                                            failureMessage,
                                            toToastMessage,
                                            onSuccessCallback,
                                            onFailureCallback) {
                    if (!saveUrl) {
                        alert(eBmrApp.resources.messages.urlBlankorEmpty);
                        return;
                    }
                    $http.post(saveUrl, data)
                        .success(function (data1, status) {
                            data._links.self.href = data1.result;
                            logNotifyAndCallback(successMessge, eBmrApp.enums.messageType.SUCCESS, toToastMessage, onSuccessCallback);
                        })
                        .error(function (data, status) {
                            logNotifyAndCallback(failureMessage + status, eBmrApp.enums.messageType.ERROR, toToastMessage, onFailureCallback);
                        });
                }

                var deleteMasterData = function (deleteUrl,
                                            successMessge,
                                            failureMessage,
                                            toToastMessage,
                                            onSuccessCallback,
                                            onFailureCallback) {
                    if (!deleteUrl) {
                        alert(eBmrApp.resources.messages.urlBlankorEmpty);
                        return;
                    }
                    $http.delete(deleteUrl)
                        .success(function (data, status) {
                            logNotifyAndCallback(successMessge, eBmrApp.enums.messageType.SUCCESS, toToastMessage, onSuccessCallback);
                        })
                        .error(function (data, status) {
                            logNotifyAndCallback(failureMessage + status, eBmrApp.enums.messageType.ERROR, toToastMessage, onFailureCallback);
                        });
                }

                return {
                    fetchData: fetchData,

                    fetchAllDataAsyncWithSpring: fetchAllDataAsyncWithSpring,

                    updateMasterData: updateMasterData,

                    createMasterData: createMasterData,

                    deleteMasterData: deleteMasterData
            }
        }]);
})();