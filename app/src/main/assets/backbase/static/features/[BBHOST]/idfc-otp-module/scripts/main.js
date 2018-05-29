define(function (require, exports, module){
    'use strict';
    var base = require('base'),
        deps = [];

    module.name = 'idfc-otp-module';

    module.exports = base.createModule(module.name, deps)
        .value(require('./otpGenerate'))
		.service(require('./services/otpService'));
       
});