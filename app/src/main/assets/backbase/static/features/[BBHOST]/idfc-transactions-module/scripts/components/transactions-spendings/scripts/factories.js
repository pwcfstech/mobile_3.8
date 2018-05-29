define(function(require, exports, module) {
    'use strict';

    // @ngInject
    exports.CategorySpendingsResource = function($resource, lpWidget, lpCoreUtils) {
        var spendingsDataSrc = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('categorySpendingDataSrc'));
        return $resource(spendingsDataSrc, null, {
            'get': {method: 'GET'}
        });
    };

    // @ngInject
    exports.CategoriesResource = function($resource, lpWidget, lpCoreUtils) {
        var categoriesDataSrc = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('categoriesDataSrc'));
        return $resource(categoriesDataSrc, null, {
            'get': {method: 'GET', isArray: true}
        });
    };
});
