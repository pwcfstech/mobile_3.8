'use strict';

var error = require('./main');

describe('Error module', function() {
    it('should export an object', function() {
        expect(error).toBeObject();
    });

    it('should contain methods', function() {
        expect(error.createException).toBeFunction();
    });

    describe('createException function', function () {
        beforeEach(function () {
            this.ErrorException = error.createException('Test');
        });

        it('should create a new `Error` constructor', function () {
            var exception = new this.ErrorException('A Message');
            expect(exception instanceof Error).toBeTrue();
        });

        it('should set the exceptions name and message', function () {
            var exception = new this.ErrorException('A Message');
            expect(exception.name).toEqual('Test');
            expect(exception.message).toEqual('A Message');
        });

    });

});
