!(function () {

    'use strict';

    angular.module("common.angularRest", [])
        .factory("angularRest", ['$http', '$q', 'common.notificationService',
            function ($http, $q, notificationService) {

                var serviceName = 'angularRest';

                var restConfig = {
                    self: 'self',
                    links: '_links',
                    page: 'page',
                    embedded: '_embedded',
                    linksUrl: 'href'
                };

                // Private methods
                var logNotify = function (message, type, toToastMessage) {
                    if (type == eBmrApp.enums.messageType.SUCCESS) {
                        console.info(message);
                    }
                    else {
                        console.error(message);
                    }
                };

                var Response = function (resultStatus, data, links, page, isArray, dtoFn) {
                    this.status = resultStatus;
                    // this.data = data;
                    this.data = isArray ? Enumerable.From(data).OrderBy("$.seq").ToArray() : data;
                    this.links = links;
                    this.page = page;
                    this.isArray = isArray;
                    this.dtoFn = dtoFn;
                };

                var mapper = function (obj, dtoFn) {
                    // If null, return as it is. (No need to process null object.)
                    if (obj == null) {
                        return obj;
                    }

                    var newObj = dtoFn ? new dtoFn(obj) : obj;
                    newObj._links = obj ? obj[restConfig.links] : null;
                    newObj.create = createItem;
                    newObj.update = updateItem;
                    newObj.delete = deleteItem;
                    return newObj;
                };

                // return first key
                var getFirstKeyFromEmbedded = function (data) {
                    var key = '';
                    console.log(data);
                    for (var prop in data) {
                        key = prop;
                    }
                    return key;
                };

                var checkNested = function checkNested(obj /*, level1, level2, ... levelN*/) {
                    var args = Array.prototype.slice.call(arguments),
                        obj = args.shift();

                    for (var i = 0; i < args.length; i++) {
                        if (!obj || !obj.hasOwnProperty(args[i])) {
                            return false;
                        }
                        obj = obj[args[i]];
                    }
                    return true;
                }

                var cloneAndFormat = function (obj) {
                    var clone = angular.copy(obj);
                    //if obj has _links
                    if (obj[restConfig.links]) {
                        for (var prop in obj[restConfig.links]) {
                            // Copy only url from object for each property in _links
                            if (prop != restConfig.self) {
                                if (obj[prop] instanceof Object) {
                                    // If type of object and _links.self.href exist, then replace object with _links.self.href
                                    // because that is the format accepted by rest apis.
                                    if (checkNested(obj[prop], restConfig.links, restConfig.self, restConfig.linksUrl)) {
                                        clone[prop] = obj[prop][restConfig.links][restConfig.self][restConfig.linksUrl];
                                    }
                                    // Else type of object and _links.self.href does not exist, then obj is probably not created yet. Create separtely, so delete from here.
                                    else {
                                        delete clone[prop];
                                    }

                                }
                                // If array, we can directly delete the prop as it will be created separately with parentid.
                                else if(obj[prop] instanceof Array){
                                    delete clone[prop];
                                }
                            }
                        }
                    }
                    else{
                        for (var prop in obj) {
                            // If obj is array or object, then delete from parent object. Create parent and update the objects separately.
                            if (obj[prop] instanceof Array) {
                                delete clone[prop];
                            }
                            else if (obj[prop] instanceof Object) {
                                if(checkNested(obj[prop], restConfig.links, restConfig.self, restConfig.linksUrl)){
                                    clone[prop] = obj[prop][restConfig.links][restConfig.self][restConfig.linksUrl];
                                }
                            }
                        }
                    }
                    return clone;
                };

                var getFromUrl = function (url, dtoFn) {
                    var deferred = $q.defer();

                    $http.get(url)
                        .then(function (result) {
                            var response;
                            var data = result.data;

                            // Data can only be null if tried to access nested object and url not found.
                            if (data == null) {
                                response = new Response(eBmrApp.enums.resultStatus.SUCCESS, data, null, null, false, dtoFn);
                            }
                            else if (data[restConfig.embedded]) {
                                var responseData = [];
                                var key = getFirstKeyFromEmbedded(data[restConfig.embedded]);
                                angular.forEach(data[restConfig.embedded][key], function (value, index) {
                                    var newObj = mapper(value, dtoFn);
                                    responseData.push(newObj);
                                });
                                response = new Response(
                                    eBmrApp.enums.resultStatus.SUCCESS, responseData, data[restConfig.links], data[restConfig.page], true, dtoFn);
                            }
                            else {
                                var newObj = mapper(data, dtoFn);
                                response = new Response(
                                    eBmrApp.enums.resultStatus.SUCCESS, newObj, data[restConfig.links], data[restConfig.page], false, dtoFn);
                            }
                            deferred.resolve(response);
                        },
                        function (error) {
                            return new Response(eBmrApp.enums.resultStatus.ERROR, error);
                        });
                    return deferred.promise;
                };

                var getFromUrlList = function (urlDtoList) {
                    var deferred = $q.defer();

                    var urlCalls = [];
                    angular.forEach(urlDtoList, function (value, key) {
                        if (value.fetchNested) {
                            urlCalls.push(getFromUrlNested(value.url, value.dto));
                        }
                        else {
                            urlCalls.push(getFromUrl(value.url, value.dto));
                        }
                    });
                    $q.all(urlCalls)
                        .then(
                            function(results){
                                deferred.resolve(results);
                            },
                            function(error){
                                deferred.reject(error);
                            });
                    return deferred.promise;
                }

                var getFromUrlNested = function (url, dtoFn) {
                    var deferred = $q.defer();

                    var parentResponse = null;
                    getFromUrl(url, dtoFn)
                        .then(function (success) {
                            var newUrls = [];
                            parentResponse = success;
                            var toFetchArray = parentResponse.isArray ? parentResponse.data : [parentResponse.data];
                            // foreach objects in the response array / object
                            angular.forEach(toFetchArray, function (obj, index) {
                                // foreach property in the object
                                angular.forEach(obj[restConfig.links], function (value, key) {
                                    if (key != restConfig.self) {
                                        newUrls.push({ url: value[restConfig.linksUrl], dto: null, key: key, obj: obj });
                                    }
                                });
                            });
                            // If nested properties are present, fetch them.
                            if (newUrls.length > 0) {
                                getFromUrlList(newUrls)
                                   .then(
                                       function (success) {
                                           angular.forEach(newUrls, function (urlObj, index) {
                                               urlObj.obj[urlObj.key] = success[index].data;
                                           });
                                           var response = new Response(
                                                eBmrApp.enums.resultStatus.SUCCESS,
                                                parentResponse.data,
                                                parentResponse.data[restConfig.links],
                                                parentResponse.data[restConfig.page],
                                                parentResponse.isArray,
                                                dtoFn);
                                           deferred.resolve(response);
                                       },
                                       function (error) {
                                           console.log('Error fetching nesting objects - ' + error);
                                       }
                                   );
                            }
                            // else just return the parent.
                            else {
                                deferred.resolve(parentResponse);
                            }
                           
                        },
                        function (error) {
                            deferred.reject();
                        });
                    return deferred.promise;
                }

                var createNew = function (rootUrl, dtoFn, params) {
                    var obj = dtoFn
                        ? (new dtoFn(params || {}))
                        : this.dtoFn
                            ? new this.dtoFn(params || {})
                            : {};
                    obj.create = createItem;

                    var strFnBody = 'return "' + rootUrl + '";';
                    obj.getSaveUrl = new Function(strFnBody)

                    return obj;
                }

                var updateItem = function () {
                    if (!this[restConfig.links] || !this[restConfig.links][restConfig.self][restConfig.linksUrl]) {
                        alert(eBmrApp.resources.messages.urlBlankorEmpty);
                        return;
                    }
                    var deferred = $q.defer();

                    var obj = cloneAndFormat(this);
                    $http.put(this[restConfig.links][restConfig.self][restConfig.linksUrl], obj)
                        .then(
                            function (success) {
                                console.log('Update successful - ' + serviceName);
                                deferred.resolve();
                            },
                            function (success) {
                                console.error('Update failed - ' + serviceName);
                                deferred.reject();
                            });
                    return deferred.promise;
                }

                var createItem = function (saveUrl) {
                    var deferred = $q.defer();
                    var obj = cloneAndFormat(this);
                    var currentObj = this;

                    saveUrl = saveUrl || currentObj.getSaveUrl();

                    $http.post(saveUrl, obj)
                        .then(
                            function (success) {
                                console.log('Create successful - ' + serviceName);
                                var newLink = success.headers().location;

                                var _links = currentObj._links || { self: {} };
                                _links.self.href = newLink;
                                currentObj._links = _links;

                                deferred.resolve(newLink);
                            },
                            function (error) {
                                console.error('Create failed - ' + serviceName);
                                deferred.reject();
                            });
                    return deferred.promise;
                }

                var deleteItem = function () {

                    if (!this[restConfig.links] || !this[restConfig.links][restConfig.self][restConfig.linksUrl]) {
                        alert(eBmrApp.resources.messages.urlBlankorEmpty);
                        return;
                    }
                    var deferred = $q.defer();

                    $http.delete(this[restConfig.links][restConfig.self][restConfig.linksUrl])
                        .then(
                            function (success) {
                                console.log('Delete successful - ' + serviceName);
                                deferred.resolve();
                            },
                            function (error) {
                                console.error('Delete failed - ' + serviceName);
                                deferred.reject();
                            });
                    return deferred.promise;
                }

                return {
                    updateItem: updateItem,
                    createItem: createItem,
                    createNew: createNew,
                    deleteItem: deleteItem,
                    getFromUrlList: getFromUrlList,
                    getFromUrl: getFromUrl,
                    getFromUrlNested: getFromUrlNested
                }
            }]
        );
}());