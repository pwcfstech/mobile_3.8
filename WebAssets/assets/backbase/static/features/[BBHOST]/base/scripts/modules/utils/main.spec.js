/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : utils.spec.js
 *  Description:
 *  ----------------------------------------------------------------
 */
'use strict';

var utils = require('./main');

/*----------------------------------------------------------------*/
/* Unit testing with jasmine
/*----------------------------------------------------------------*/
describe('Base Utils functions', function() {

    it('should export a function', function() {
        expect(utils).toBeFunction();
    });

    describe('migration utilities', function() {
        it('export deprecate', function() {
            expect(utils.deprecate).toBeFunction();
        });
    });

    describe('is utilities', function() {
        it('export deprecate', function() {
            expect(utils.isMobileDevice).toBeFunction();
        });
    });

    describe('portal utilities', function() {
        it('export deprecate', function() {
            expect(utils.resolvePortalPlaceholders).toBeFunction();
        });
    });
});



