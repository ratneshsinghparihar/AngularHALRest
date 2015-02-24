
!(function () {
    'use strict';

    toastr.options = {
        "closeButton": true,
        "debug": false,
        "progressBar": false,
        "positionClass": "toast-bottom-right",
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "500",
        "timeOut": "5000",
        "extendedTimeOut": "500",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    angular.module('common.notificationService', [])
        .factory('common.notificationService', ['$log', function ($log) {
            return {
                toastAndLogMessage: function (messageType, message, messageTitle) {
                    $log.log(message);
                    toastr[messageType](message, messageTitle);
                },

                logMessage: function (message) {
                    var date = new Date();
                    $log.log(date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ' - ' + message);
                },

                toastMessage: function (messageType, message, messageTitle) {
                    toastr[messageType](message, messageTitle);
                }
            }
        }]);
})();