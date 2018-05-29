/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - Launchpad
 *  Filename : is.spec.js
 *  Description:
 *  ----------------------------------------------------------------
 */
'use strict';

var utils = require('./is');

// HACK: Let values be assigned to window.navigator
(function () {
    var mockNavigator = window.navigator;
    window.__defineGetter__('navigator',  function() {
        return mockNavigator;
    });
    window.__defineSetter__('navigator',  function(value) {
        return mockNavigator = value;
    });
}());

describe('is utilities', function() {

    it('should export a function', function() {
        expect(utils).toBeObject();
    });

    describe('isMobileDevice', function() {
        var navigator;

        beforeEach(function() {
            navigator = window.navigator;
        });

        afterEach(function() {
            window.launchpad.mobileSDK = false;
            window.navigator = navigator;
        });

        it('should return true if mobile SDK is present', function() {
            window.launchpad.mobileSDK = true;

            expect(utils.isMobileDevice()).toBe(true);
        });

        it('should return correct value based on user agent', function() {
            //desktop
            window.navigator = {
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.151 Safari/535.19'
            };
            expect(utils.isMobileDevice()).toBe(false);

            //Iphone
            window.navigator = {
                userAgent: 'Mozilla/5.0 (iPhone; U; CPU like Mac OS X; en) AppleWebKit/420+ (KHTML, like Gecko) Version/3.0 Mobile/1A543 Safari/419.3'
            };
            expect(utils.isMobileDevice()).toBe(true);

            //Android
            window.navigator = {
                userAgent: 'Mozilla/5.0 (Linux; <Android Version>; <Build Tag etc.>) AppleWebKit/<WebKit Rev> (KHTML, like Gecko) Chrome/<Chrome Rev> Mobile Safari/<WebKit Rev>'
            };
            expect(utils.isMobileDevice()).toBe(true);

            //Windows
            window.navigator = {
                userAgent: 'Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0)'
            };

            //Opera mini
            window.navigator = {
                userAgent: 'Opera/9.80 (J2ME/MIDP; Opera Mini/9.80 (S60; SymbOS; Opera Mobi/23.348; U; en) Presto/2.5.25 Version/10.54'
            };
            expect(utils.isMobileDevice()).toBe(true);
        });
    });

    describe('isb$Mocked', function() {
        it('should return true if b$ function is not available', function() {
            expect(utils.isb$Mocked()).toBe(true);
        });
        it('should return true if b$ is available and bdom is not available', function() {
            window.b$ = function() {};
            expect(utils.isb$Mocked()).toBe(true);
        });

    });
});



