/*globals bd*/


define( function (require, exports, module) {

    'use strict';

    module.name = 'idfc-logout-marketing';

    var base = require('base');
    var core = require('core');
    var ui = require('ui');

    var deps = [
        core.name,
        ui.name
    ];

    // @ngInject
    function run(lpWidget, lpPortal, $http) {


		$http.defaults.headers.get = { 'If-Modified-Since': 'Mon, 26 Jul 1997 05:00:00 GMT', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache'};

        // set default navigation root
        var navRoot = lpWidget.getPreference('navRoot');
        var links = top && top.bd && top.bd.pm && top.bd.pm.model && top.bd.pm.model.links;
        if(lpPortal.designMode && links && !navRoot) {
            navRoot = Object.keys(links).filter(function(id){
                return links[id].linkname === 'navroot_mainmenu';
            });
            if(navRoot && navRoot[0]){
                lpWidget.setPreference('navRoot', navRoot[0]);
                lpWidget.model.save(function(){
                    lpWidget.refreshHTML();
                });
            }
        }


    }

    module.exports = base.createModule(module.name, deps)
        .controller( require('./controllers') )
        .run( run );
});

