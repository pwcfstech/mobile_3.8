/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - Launchpad
 *  Filename : backbase-widget.js
 *  Description: Add Launchpad custom chrome support
 *  ----------------------------------------------------------------
 */

define(function(require, exports, module) {

    'use strict';
    var utils = require('../utils/main');

    module.exports = function(chromes, portal) {
        chromes = chromes || [];
        var isChromesPref = function(pref) {
            return pref.name === 'widgetChrome' && (!pref.inputType.options || pref.inputType.options.length === 0);
        };

        return {
            handlers: {
                'preferences-form': function (ev) {
                    var widget = ev.detail.context;
                    var prefs = portal.portalModel.filterPreferences(widget.model.preferences.array);
                    ev.detail.customPrefsModel = utils.each(prefs, function(pref) {
                            if(isChromesPref(pref)){
                                pref.inputType.name = 'select-one';
                                pref.inputType.options = chromes;
                            }
                        });
                }
            }
        };
    };
});
