/*globals jQuery*/
/**
 * Controllers
 * @module controllers
 */
define(function (require, exports) {
    'use strict';

    var $ = require('jquery');
    var angular = require('angular');
    var idfcHanlder = require('idfcerror');
    idfcHanlder.callSession = false;

    // @ngInject

    function userLogOutController($scope, lpCoreBus, lpCoreUtils, lpWidget, httpService, $http,lpPortal,lpCoreError,$anchorScroll, $timeout ) {

        this.utils = lpCoreUtils;
        this.widget = lpWidget;
        var userLogOutCtrl = this;
        var imageNumber = 1;
		
        var initialize = function () {
            userLogOutCtrl.errorSpin = true;
            console.log("check for log out");
            var path = lpCoreUtils.getWidgetBaseUrl(lpWidget);
            console.log("path"+path);

            imageNumber = Math.floor((Math.random() * 7) + 1);
            if(imageNumber!=5)
                var marketingImage = 'marketingImage'+imageNumber+'.jpg';
            else
                var marketingImage = 'marketingImage'+imageNumber+'.JPG';

            userLogOutCtrl.headerImagePath = path + '/media/'+marketingImage;
            userLogOutCtrl.lockImagePath = path + '/media/lock_round_2.png';
           /* userLogOutCtrl.twitterImagePath = path + '/media/bitmap1.png';
            userLogOutCtrl.facebookImagePath = path + '/media/bitmap3.png';
            userLogOutCtrl.linkedInImagePath = path + '/media/bitmap2.png';
            userLogOutCtrl.youtubeImagePath = path + '/media/bitmap.png';*/
            userLogOutCtrl.errorSpin = false;
        };

        userLogOutCtrl.loginClick = function(){
            gadgets.pubsub.publish('cxpGoToSignIn');
        }

        //added for mobile
        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            gadgets.pubsub.publish("device.GoBack");
        });

        initialize();
          $timeout(function(){
                gadgets.pubsub.publish('cxp.item.loaded', {
                    id: widget.id
                });
            }, 10);
    };
    exports.userLogOutController = userLogOutController;
});
