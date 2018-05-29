/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - Launchpad
 *  Filename : migrate.spec.js
 *  Description:
 *  ----------------------------------------------------------------
 */
'use strict';

var utils = require('./portal');

describe('Portal utilities', function() {
    it('should export an object', function() {
        expect(utils).toBeObject();
    });

    it('should have a resolvePortalPlaceholders function', function() {
        expect(utils.resolvePortalPlaceholders).toBeFunction();
    });

    describe('resolvePortalPlaceholders function', function() {
        beforeEach(function() {
            this.b$backup = window.b$;
            window.b$ = { portal: { config: { serverRoot: 'TEST_SERVER_ROOT' } } };
        });

        afterEach(function() {
            window.b$ = this.b$backup;
        });


        it('should replace occurences of "$(contextRoot)"', function() {
            var input = '$(contextRoot)/some/path';
            var actual = utils.resolvePortalPlaceholders(input);
            var expected = 'TEST_SERVER_ROOT/some/path';
            expect(actual).toEqual(expected);
        });

        it('should replace occurences of "$(contextPath)"', function() {
            var input = '$(contextPath)/some/path';
            var actual = utils.resolvePortalPlaceholders(input);
            var expected = 'TEST_SERVER_ROOT/some/path';
            expect(actual).toEqual(expected);
        });

        it('should replace occurences of "$(servicesPath)"', function() {
            var input = '$(servicesPath)/some/path';
            var actual = utils.resolvePortalPlaceholders(input);
            var expected = 'TEST_SERVER_ROOT/some/path';
            expect(actual).toEqual(expected);
        });

    });

});



