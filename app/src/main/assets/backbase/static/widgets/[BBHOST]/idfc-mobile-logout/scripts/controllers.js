define(function(require, exports) {
    'use strict';
    var $ = require('jquery');
    var idfcHanlder = require('idfcerror');
    idfcHanlder.callSession = false;
    exports.NavBarAdvancedController = function($scope, $timeout, $http,
        $window, lpWidget, lpPortal, lpCoreBus, lpCoreUtils) {
        var bus = lpCoreBus;
        var util = lpCoreUtils;
        $scope.logout = function() {
            var logoutUrl = lpCoreUtils.resolvePortalPlaceholders(
                lpWidget.getPreference('logoutUrl'));
            var logoutRequest = $http({
                method: 'GET',
                url: logoutUrl,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            logoutRequest.success(function(data) {
                var replaceUrl = $http({
                    method: 'GET',
                    url: (lpPortal +
                        '/j_spring_security_logout?portalName=' +
                        lpPortal.name),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data) {
                    $scope.errorSpin = true;
                    localStorage.removeItem("cqVisted");
                   // gadgets.pubsub.publish('launchpad-retail.userLogOut');
                    gadgets.pubsub.publish('cxplogout');
                    console.log("in success");
                }).error(function(data, status) {
                    $scope.errorSpin = true;
                    //gadgets.pubsub.publish('launchpad-retail.userLogOut');
                    gadgets.pubsub.publish('cxplogout');
                    console.log("in error");
                });
            }).error(function(response, status) {
                $scope.errorSpin = true;
                if (status == "") {
                    gadgets.pubsub.publish(
                        "no.internet");
                }
                if (status == 404) {
                console.log("session timeout");
                    setTimeout(function() {
                    //gadgets.pubsub.publish('launchpad-retail.userLogOut');
                        gadgets.pubsub.publish(
                            'cxplogout');
                    }, 500);
                }
            });
        };
        var initialize = function() {
            $scope.errorSpin = true;
            $scope.logout();
        }
        initialize();
          $timeout(function(){
                gadgets.pubsub.publish('cxp.item.loaded', {
                    id: widget.id
                });
            }, 10);
    };
});