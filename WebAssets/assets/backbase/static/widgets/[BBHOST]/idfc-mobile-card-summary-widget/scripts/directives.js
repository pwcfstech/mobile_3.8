define(function(require, exports, module) {
	'use strict';
	//var $ = window.jQuery;
	var $ = require('jquery');
	exports.lazyLoader = function(lpCoreUtils, $window, $scope, lpCoreBus, lpWidget) {
        return {
            restrict: 'A',
            scope: {
                callBack: '=',
                stopLoading: '='
            },
            link: function(scope, element, attrs) {
                var window;

                var getHeight = function() {
                    return scope.widgetElement.height() + scope.widgetElement.offset().top;
                };

                var doLoadMore = util.debounce(function() {

                    if (window.scrollTop() > (getHeight() - 150)) {
                        window.off('scroll', doLoadMore);
                        scope.callBack(true).then(function() {
                            if (!scope.stopLoading) {
                                window.on('scroll', doLoadMore);
                            }
                        });
                    }
                }, 10);


                var initialize = function() {
                    window = $($window);
                    scope.widgetElement = element.closest('.widget');
                    $('#recurringDepositDiv').hide();
                    $('#termsDepositDiv').show();
                    scope.control = {
                        preferredName: {
                            value: 'Year',
                            errors: [],
                            loading: false,
                            validate: function(name) {
                                if (name.length < 3) {
                                    return 'invalid_name';
                                }
                                return true;
                            }
                        },
                        locale: {
                            value: '',
                            options: [{
                                'value': 'en',
                                'text': 'English'
                            }, {
                                'value': 'fr',
                                'text': 'French'
                            }, {
                                'value': 'nl',
                                'text': 'Dutch'
                            }, {
                                'value': 'it',
                                'text': 'Italian'
                            }],
                            loading: false
                        },
                        defaultView: {
                            value: '',
                            options: [],
                            loading: false
                        },
                        defaultAccount: {
                            value: '',
                            options: [],
                            loading: false
                        },
                        preferredBalanceView: {
                            value: '',
                            options: [{
                                'value': 'current',
                                'text': "Use 'Current Balance'"
                            }, {
                                'value': 'available',
                                'text': "Use 'Available Balance'"
                            }],
                            loading: false
                        },
                        pfm: {
                            value: '',
                            options: [{
                                'value': true,
                                'text': 'Enabled'
                            }, {
                                'value': false,
                                'text': 'Disabled'
                            }],
                            loading: false
                        }
                    };

                    window.on('scroll', doLoadMore);


                };

                scope.$watch('stopLoading', function(newValue, oldValue) {

                    if (newValue) {
                        $($window).off('scroll', doLoadMore);
                    } else if (oldValue && !newValue) {
                        window.on('scroll', doLoadMore);
                    }
                });

                initialize();
            }

        };
	};


});
