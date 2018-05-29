/**
 * Models
 *
 * @module models
 */
define(function(require, exports) {
	'use strict';
	//@ngInject
	function AccountUnlockService($http) {
		return {
			
			registerUserService: function(registerUserServiceURL, postData) {
				return $http({
					method: 'POST',
					url: registerUserServiceURL,
					data: postData,
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/x-www-form-urlencoded;'
					}
				});
			}
		};
	}
	exports.AccountUnlockService = AccountUnlockService;
});
