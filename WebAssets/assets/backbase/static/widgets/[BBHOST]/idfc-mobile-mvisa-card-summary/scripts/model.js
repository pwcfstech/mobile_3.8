/**
 * Models
 * @module models
 */
define( function (require, exports, module) {

    'use strict';

    /**
     * @constructor
     * @ngInject
     */
    function WidgetModel(lpWidget, lpCoreUtils) {
        var utils = lpCoreUtils;
        var state = {
            title: lpWidget.getPreference('title'),
            icon: utils.resolvePortalPlaceholders(lpWidget.getPreference('thumbnailUrl'))
        };

        var model = {};
        /**
         * @public
         * @return {Object} current model state
         */
        model.getState = function getState() {
            return state;
        };


        return model;
    }

    module.exports = WidgetModel;
});
