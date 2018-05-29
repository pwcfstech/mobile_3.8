/**
 * Models
 * @module models
 */
define(function(require, exports) {

	'use strict';

	/**
	 * @constructor
	 * @ngInject
	 */
	function WidgetModel(lpWidget) {
		this.data = [];
		this.widget = lpWidget;
	}
	function shareModels() {
		var model = {
			categories: 'Deposits',
			subCategoryList: '',
			serviceCode: '',
			formCode: '',
			subCategorySearch: ''
		};
		//var formCodeValue = '';
	}
	function sharedProperties() {

		var accountNumbersPassed = {
			accountNumber: ''
		};
		return {
			getProperty: function() {
				return accountNumbersPassed;
			},
			setProperty: function(value) {
				accountNumbersPassed.accountNumber = value;
			}
		};

	}

	/**
	 * Export Models
	 */
	exports.WidgetModel = WidgetModel;
	exports.shareModels = shareModels;
	exports.sharedProperties = sharedProperties;
});
