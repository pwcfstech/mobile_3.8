/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : main.spec.js
 *  Description:
 *  ----------------------------------------------------------------
 */

var main = require('../../scripts/main');

/*----------------------------------------------------------------*/
/* Unit testing with jasmine
/*----------------------------------------------------------------*/
describe('Base Resource public API ', function() {

    it('should export', function() {
        expect(main).toBeObject();
    });
});
