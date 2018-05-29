'use strict';
var portal = require('./portal');

describe('Portal utility', function() {
    it('should export a function', function() {
        expect(portal).toBeFunction();
    });
});
