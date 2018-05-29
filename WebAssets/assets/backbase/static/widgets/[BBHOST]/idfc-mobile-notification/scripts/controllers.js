/**
 * Controllers
 *
 * @module controllers
 */

define(function(require, exports) {
    'use strict';
   /* var CONSTANTS = {

    };*/



    /**
     * Main controller
     *
     * @ngInject
     * @constructor
     */
    function NotificationCtrl($scope, $http, i18nUtils, lpCoreUtils, lpWidget,
            $window, lpPortal, lpCoreBus, $q, $timeout) {

        var deferred = $q.defer();

        var month = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

        $scope.deviceId = '';
        //$scope.channel = data['channel'];
        $scope.ipAddress = '';
        $scope.timeZone = '';
        $scope.nwProvider = '';
        $scope.connectionMode = '';
        $scope.geoLatitude = '';
        $scope.geoLongitude = '';
        $scope.isUserLoggedIn = false;
        $scope.isMpinRegistered = false;

        $scope.msgHeader = {};

        $scope.errorSpin = true;

        $scope.error = {
                            happened: false,
                            msg: ''
                        };

        $scope.control = {
                            'notificationList' : [],
                            'notificationDtls' : {},
                            'showCallToActionBtn' : false,
                            'detailScreen' : false,
                            'firstScreen' : true
                        };

        // Add the navigation property as attribute
        // and value as true for a pre-login hamburger
        // menu if newly added
        $scope.preLoginMenu =  {
                                'launchpad-retail.goToCreateUsername':true, 'launchpad-retail.goToCreateDebitCard':true,
                                'launchpad-retail.goToForgotUsername':true, 'launchpad-retail.goToForgotPassword':true,
                                'launchpad-retail.goToApplyNow':true
                             };

        //Mock Request for PushNotification
        /*$scope.pushNotificationRequest = {
            'vendorMsgHeader': {
            'consumerId': '4321',
            'accessToken': 'dsdsdadasee',
            'txnId': '111111111111111111111111167811111119',
            'checkSum': '1'
          },
            'data': {
            'ucic': '1000050453',
            'notificationCat': 'A',
            'notificationText':'Sample text',
            'notificationDetail':'Sample notification detail',
            'notificationDetailUrl':'some url',
            'imageUrl':'image url',
            'callToAction':'call to action'
          }
        };*/

        $scope.isSuccess = false;

        $scope.openNotificationDetails = function(notification){
            console.log('Detail Screen '+notification.notificationDetail);
            //check if notification details exist
            if(null!==notification.notificationDetail && ''!==notification.notificationDetail){
                console.log('Notification details is not null');
                //notification details exist
                //take user to details screen
                if(null===notification.callToAction || ''===notification.callToAction){
                    //call to action is blank
                    //dont show the button to user
                    $scope.control.showCallToActionBtn = false;
                }else{
                    $scope.control.showCallToActionBtn = true;
                }
                $scope.control.notificationDtls = notification;
                $scope.control.detailScreen = true;
                $scope.control.firstScreen = false;
            }else{
                console.log('Notification details is null');
                //notification details is not present
                //call to action
                if(null!==notification.callToAction){
                    //call to action is not blank
                    //take user directly to the call to action
                    $scope.callToAction(notification.callToAction);
                }

            }
        };

        $scope.goBackToFirstScreen = function(){
            console.log('Back clicked');
            $scope.control.detailScreen = false;
            $scope.control.firstScreen = true;
        };

        $scope.transformTime = function(time) {
            var meridian = 'am';
            var hour = parseInt(time.split('.')[0], 10);
            var min = parseInt(time.split('.')[1], 10);
            if(min < 10){
                min = '0'+min;
            }

            if(hour>12){
                hour = hour - 12;
                meridian = 'pm'
            } else if(hour === 0){
                hour = 12;
                meridian = 'am'
            } else if(hour === 12){
                meridian = 'pm'
            }
            return hour+':'+min+' '+meridian;
        };

        $scope.callToAction = function(widgetName){
            console.log('Call to Action ::'+widgetName);
            //check if user is logged in
            if($scope.isUserLoggedIn){
                //user is logged in
                gadgets.pubsub.publish(widgetName);
            }else{
                //user is not logged in
                //take user to login screen
                console.log('List of prelogin menu ::'+$scope.preLoginMenu[widgetName]);
                if($scope.preLoginMenu[widgetName]){
                    gadgets.pubsub.publish(widgetName);

                }else{
                    if($scope.isMpinRegistered){
                         resetMVisaLoginFlag();
                         resetScanAndPayFlag();
                        gadgets.pubsub.publish('launchpad-mpinlogin');
                    }else{
                         resetMVisaLoginFlag();
                        resetScanAndPayFlag();
                        gadgets.pubsub.publish('getBackToLoginScreen');
                    }
                }

            }
        };

        //mvisa-clear flag to clear earlier scanned qr or key entry data if app killed or repopend
        var resetScanAndPayFlag = function(){
            console.log("called clearScanAndPayFlag:");
            var globalVariablePlugin1 = cxp.mobile.plugins['GlobalVariables'];
            if(globalVariablePlugin1){
                globalVariablePlugin1.clearScanAndPayFlag(null,null,'');
            }
            else{
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        }

         var resetMVisaLoginFlag = function(){
            console.log("called resetMVisaLoginFlag:");
            var globalVariablePlugin1 = cxp.mobile.plugins['GlobalVariables'];
            if(globalVariablePlugin1){
                globalVariablePlugin1.clearMVisaLoginFlag(null,null,'');
            }
            else{
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        }


        $scope.formatDateTime = function(timestamp) {
            var daysAgo = 0;

            var sentDt = timestamp;
            console.log('Sent Date:'+sentDt);
            console.log('Sent Time:'+sentDt.substring(11));
            var sentTime = sentDt.substring(11);
            var hh = sentTime.split('.')[0];
            var mm = sentTime.split('.')[1];
            var ss = sentTime.split('.')[2];
            var mnth = parseInt(sentDt.substring(5, 7), 10);
            var date = parseInt(sentDt.substring(8, 10), 10);
            var year = parseInt(sentDt.substring(0, 4), 10);

            var newDate = date+' '+month[mnth]+', '+$scope.transformTime(sentDt.substring(11));

            //console.log('Date previous shown ::'+newDate);
            var today = new Date();
            //console.log('Today '+today);
            var sntDt = new Date(year, mnth-1, date, hh, mm, ss);
            //console.log('Sent date :'+sntDt);

            var hourDiff = Math.abs(today - sntDt) / 36e5;

            console.log('Hour difference :'+hourDiff);

            if(hourDiff>=24 && Math.floor(hourDiff)<=144){
                daysAgo = Math.floor(hourDiff/24);
                if(1==daysAgo){
                    daysAgo = daysAgo+' day ago';
                }else{
                    daysAgo = daysAgo+' days ago';
                }
                console.log('Diff---->'+ daysAgo);
            }else if(hourDiff<24){
                if(0==Math.floor(hourDiff)){
                    daysAgo = hourDiff*60;
                    if(1==daysAgo){
                        daysAgo = Math.floor(daysAgo);
                        daysAgo = daysAgo + ' min ago'
                    } else {
                        daysAgo = Math.floor(daysAgo);
                        daysAgo = daysAgo + ' mins ago'
                    }
                }else if(1==Math.floor(hourDiff)){
                    daysAgo = Math.floor(hourDiff);
                    daysAgo = daysAgo+' hour ago';
                }else{
                    daysAgo = Math.floor(hourDiff);
                    daysAgo = daysAgo+' hours ago';
                }
                console.log('Diff---->'+ daysAgo);
            } else {
                daysAgo = newDate;
            }

            return daysAgo;

        };

        $scope.getNotification = function (url) {
            console.log('getNotification called');
            console.log('Request URL >>>'+url);

            //$scope.errorSpin = true;
            var request = JSON.stringify($scope.msgHeader);
            $scope.postData = {
                'msgHeader' : request
            };
            console.log('Request for getNotifications >>>'+JSON.stringify($scope.postData));
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
            $http.defaults.headers.post['Accept'] = 'application/json';
            $scope.postData = $.param($scope.postData || {});
            $http({
                method : 'POST',
                url : url,
                data : $scope.postData
            }).success(function(response, status, headers, config){
                console.log('Success '+JSON.stringify(response.data.notification));
                $scope.errorSpin = false;

                var array = response.data.notification;
                if(undefined!=response.msgHeader.error){
                    var errorBlock = response.msgHeader.error;
                    if((undefined!=errorBlock.errorCode || ''!=errorBlock.errorCode) &&
                        (undefined!=errorBlock.errorMessage || ''!=errorBlock.errorMessage)){
                        $scope.error = {
                            happened : true,
                            msg : errorBlock.errorMessage
                        }
                    }

                }else {
                    //array = []; for testing no notifications
                    if(undefined!=array && null!=array && array.length>0){
                        $scope.error = {
                            happened : false,
                            msg : ''
                        }
                        console.log('Notification Array :'+array);
                        for (var i = 0; i < array.length; i++) {
                            console.log('time before >>>'+array[i].sentDate);
                            array[i].sentDate = $scope.formatDateTime(array[i].sentDate);
                            console.log('time after >>>'+array[i].sentDate);
                            $scope.control.notificationList.push(array[i]);
                        }
                    }else{
                        $scope.error = {
                            happened : true,
                            msg : 'You have not received any notifications from us'
                        }
                    }
                }
            }).error(function(response, status, headers, config){
                $scope.errorSpin = false;
                $scope.error = {
                                    happened: true,
                                    msg: response.rsn
                                };

            });


        };

        $scope.initialize = function(){
           //$scope.errorSpin = true;
           var globalVariablePlugin = cxp.mobile.plugins['GlobalVariables'];
            if(globalVariablePlugin){
                var getDeviceFootPrintSuccessCallback = function(data) {

                    if(data!=undefined) {
                        console.log('Device Footprint data ::'+JSON.stringify(data));
                        $scope.deviceId = data['deviceId'];
                        //$scope.channel = data['channel'];
                        $scope.ipAddress = data['ipAddress'];
                        $scope.timeZone = data['timeZone'];
                        $scope.nwProvider = data['nwProviderLine1'];
                        $scope.connectionMode = data['connectionMode'];
                        $scope.geoLatitude = data['geoLatitude'];
                        $scope.geoLongitude = data['geoLongitude'];

                        $scope.msgHeader.deviceId = $scope.deviceId;
                        $scope.msgHeader.ipAddress = $scope.ipAddress;
                        $scope.msgHeader.timeZone = $scope.timeZone;
                        $scope.msgHeader.nwProvider = $scope.nwProvider;
                        $scope.msgHeader.connectionMode = $scope.connectionMode;
                        $scope.msgHeader.geoLatitude = $scope.geoLatitude;
                        $scope.msgHeader.geoLongitude = $scope.geoLongitude;




                        /////////// check if user is logged in and call respective getNotifications url ///////////

                        var sessionUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('sessionValidator'));  //--> $(servicesPath)/rs/SessionValidateService
                        console.log('Session URL ---> '+sessionUrl);
                        var sessionRequest = $http({
                                                method: 'GET',
                                                url: sessionUrl,
                                                headers: {
                                                   'Accept': 'application/json',
                                                   'Content-Type': 'application/x-www-form-urlencoded;'
                                                }
                                             });
                        sessionRequest.success(function(response){
                            console.log('Session service success');
                            $scope.isUserLoggedIn = true;
                            //$scope.errorSpin = false;
                            $scope.error = {
                                                happened: false,
                                                msg: ''
                                            };
                            var getNotificationURL = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getPostLoginNotificationUrl')); //-> $(servicesPath)/rs/getNotifications
                            $scope.getNotification(getNotificationURL);
                        }).error(function(response, status){
                            console.log('Session service error');
                            $scope.isUserLoggedIn = false;
                            //$scope.errorSpin = false;

                            var getNotificationURL = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getPreLoginNotificationUrl')); //-> $(servicesPath)/rs/getNotifications
                            $scope.getNotification(getNotificationURL);
                        });


                    }else {
                        console.log('Failure: '+ JSON.stringify(data));
                    }
                };
                 var getDeviceFootPrintErrorCallback = function(data) {
                        console.log('Something really bad happened');
                 };

                 globalVariablePlugin.getDeviceFootPrintHeader(
                      getDeviceFootPrintSuccessCallback,
                      getDeviceFootPrintErrorCallback
                 );
            }
            else{
                    console.log('globalVariablePlugin is '+globalVariablePlugin);
            }

               $scope.isMpinRegistered = false;
               if (globalVariablePlugin) {
                 var isMpinSuccessCallback = function(data) {
                     console.log('success: ' + JSON.stringify(data));
                     if (data['mpinFlag'] == 'true') {
                        console.log('inside if success: ' + JSON.stringify(data));
                       $scope.isMpinRegistered = true;
                     } else {
                       console.log('inside else success: ' + data['mpinFlag']);
                       $scope.isMpinRegistered = false;
                       console.log('Failure: ' + JSON.stringify(data));
                     }
                 };
                 var isMpinErrorCallback = function(data) {
                     console.log('Something really bad happened');
                 };
                 globalVariablePlugin.getMpinFlag(
                     isMpinSuccessCallback,
                     isMpinErrorCallback
                 );
               } else {
                 console.log('Cant find Plugin');
               }

        };

        /*IDFC 2.5 notifications Option to be given on the top right corner prelogin*/
        gadgets.pubsub.subscribe("NOTIFICATIONS", function(){
            console.log("in notifications subscribe");
            $scope.goToNotification();
        });

        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            gadgets.pubsub.publish("device.GoBack");
        });

        $scope.initialize();

        $scope.goToNotification = function(){
            console.log("in goToNotification");
            gadgets.pubsub.publish('launchpad-retail.goToNotification');
         /*$timeout(function() {
           var item = $document[0].activeElement;
           if(!angular.isUndefined(item))item.blur();
           gadgets.pubsub.publish('launchpad-retail.goToNotification');
         } , 500);*/
         };
           $timeout(function(){
                gadgets.pubsub.publish('cxp.item.loaded', {
                    id: widget.id
                });
            }, 10);
    }




    /**
     * Export Controllers
     */
    exports.NotificationCtrl = NotificationCtrl;
});
