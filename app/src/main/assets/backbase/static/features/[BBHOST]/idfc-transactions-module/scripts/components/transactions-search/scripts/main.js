define( function (require, exports, module) {

    'use strict';

    module.name = 'component.transactions-search';

    var base = require('base');
    var ui = require('ui');
    var tags = require('module-tags');
    var contacts = require('module-contacts');

    var deps = [
        ui.name,
        tags.name,
        contacts.name
    ];

    module.exports = base.createModule(module.name, deps)
        .directive(require('./directives'));

});
