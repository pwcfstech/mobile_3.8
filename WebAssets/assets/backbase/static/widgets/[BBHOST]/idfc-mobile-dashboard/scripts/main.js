define( function (require, exports, module) {

    'use strict';

    module.name = 'idfc-navfooter';

    var base = require('base');
    var core = require('core');
    var ui = require('ui');
    var accounts = require('module-accounts');
    var deps = [
        core.name,
        ui.name,
         accounts.name
    ];

    function run() {
    }

    module.exports = base.createModule(module.name, deps)
        .constant('WIDGET_NAME', module.name )
        .controller( require('./controllers') )
        .service( require('./models') )
        .run( run );
});
