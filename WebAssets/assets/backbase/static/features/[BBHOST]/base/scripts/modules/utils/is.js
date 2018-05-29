/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - Launchpad
 *  Filename : is.js
 *  Description: Checking utilities.
 *  ----------------------------------------------------------------
 */
define(function(require, exports, module) {

    'use strict';

    var _ = require('lodash');
    var NS = require('../../config').NS;
    var global = window;
    /**
     * Check and return true if mobile device/mobile SDK is detected or return false otherwise
     * @return {Boolean}
     */
    exports.isMobileDevice = function() {
        //return true if mobile SDK is present
        if (global[NS].mobileSDK) {
            return true;
        }

        var deviceTypes = [
            /iPhone|iPad|iPod/i,
            /Android/i,
            /BlackBerry/i,
            /Opera Mini/i,
            /IEMobile/i,
            /MeeGo/i
        ];

        for (var i = 0, l = deviceTypes.length; i < l; i++) {
            if (navigator.userAgent.match(deviceTypes[i])) {
                return true;
            }
        }

        return false;
    };

    /**
     * Check if b$ is available and is not mocked
     * @return {Boolean}
     * @todo remove b$.bdom check after b$.isMocked as flag is added on all b$'s mock libs
     */
    exports.isb$Mocked = function() {
        var b$ = global.b$;
        return _.isUndefined(b$)
                || Boolean(b$.isMocked) === true
                || _.isUndefined(b$.bdom);
    };
});
