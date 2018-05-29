define(function (require, exports, module){
    'use strict';
    var base = require('base'),
        deps = [];

    module.name = 'idfc-refresh-module';

	/**
	*Export the Dependency and creation of Modules.
	*/
    module.exports = base.createModule(module.name, deps)
        .value(require('./values'));
});