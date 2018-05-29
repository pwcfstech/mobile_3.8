/*globals bd*/

/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : main.js
 *  Description: ${widget.description}
 *  ----------------------------------------------------------------
 */

define( function (require, exports, module) {

    'use strict';

    module.name = 'widget-navbar-advanced';

    var base = require('base');
    var core = require('core');
    var ui = require('ui');

    var deps = [
        core.name,
        ui.name
    ];

    // @ngInject
    function run(lpWidget, lpPortal) {

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

