define(function (require, exports) {
    'use strict';

    exports.IdfcError = {
        checkTimeout: function (response) {
            if (response.cd === '901') {
                window.location.replace(window.location);
            }
        },
        checkGlobalError: function (response) {
            return response.cd === '501';
        },
        checkOTPError: function (response) {
            return response.cd === '08';
        }
    };
});
