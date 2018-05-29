define( function (require, exports, module) {
    'use strict';

    module.name = 'idfc-mb-view-marketing';

    var base = require('base');
    var core = require('core');
    var ui = require('ui');

    var deps = [
        core.name,
        ui.name,
        'angular-carousel'

    ];

    /**
     * @ngInject
     */
    function run() {
        // Module is Bootstrapped
    }

    module.exports = base.createModule(module.name, deps)
        .constant('WIDGET_NAME', module.name )
        .controller( require('./controllers') )
        .service( require('./models' ) )
		.run( run );
});

