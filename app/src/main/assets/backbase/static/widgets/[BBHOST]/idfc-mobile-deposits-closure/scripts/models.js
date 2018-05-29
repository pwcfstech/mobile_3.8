/**
 * Models
 * @module models
 */
define( function (require, exports) {

    'use strict';

    /**
     * @constructor
     * @ngInject
     */
    function WidgetModel(lpWidget) {
        this.data = [];
        this.widget = lpWidget;
    }
    function sharedProperties(lpWidget) {
		this.data = [];
		this.widget = lpWidget;
		var closeDeposit = {
			tdAccountNumberId: '',
			repaymentAccountNumberId: '',
			tdClosureType: '',
			amount: ''
		};
		return {
			getProperty: function() {
				return closeDeposit;
			},
			setProperty: function(value) {
				closeDeposit.tdAccountNumberId = value.tdAccountNumberId;
				closeDeposit.repaymentAccountNumberId = value.repaymentAccountNumberId;
				closeDeposit.tdClosureType = value.tdClosureType;
				closeDeposit.amount = value.amount;
			}
		};
	}
    /**
     * Export Models
     */
    exports.WidgetModel = WidgetModel;
    exports.sharedProperties = sharedProperties;
    });
