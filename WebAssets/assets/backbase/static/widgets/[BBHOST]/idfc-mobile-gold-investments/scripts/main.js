/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Filename : main.js
 *  Description: idfc-gold-investments
 *  ----------------------------------------------------------------
 */

define(function (require, exports, module) {

    'use strict';

    module.name = 'idfc-gold-investments';

    var base = require('base');
    var core = require('core');
    var ui = require('ui');
    var idfcUtils = require('idfc-utils-module');
   // var accounts = require('idfc-accounts-module');


    var deps = [
        core.name,
        ui.name,
        idfcUtils.name
    ];


    module.exports = base.createModule(module.name, deps)
        .service(require('./services/GoldInvestmentServices'))
        .controller(require('./controllers/GoldInvestmentsController'));
});
