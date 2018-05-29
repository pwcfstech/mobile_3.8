/**
 * Models
 *
 * @module models
 */
define(function(require, exports) {

	'use strict';

	//@ngInject
	function ChallengeQuestionService($http) {
		return {
			showCQAlertService: function(cQAlertServiceURL, postData) {
				return $http({
					method: 'POST',
					url: cQAlertServiceURL,
					data: postData,
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/x-www-form-urlencoded;'
					}
				});
			},
			rsaAnalyzeService: function(rsaEndpoint, postData) {
				return $http({
					method: 'POST',
					url: rsaEndpoint,
					data: postData,
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/x-www-form-urlencoded;'
					}
				});
			},
			generateOTPService: function(generateOTPEndpoint, postData) {
				return $http({
					method: 'POST',
					url: generateOTPEndpoint,
					data: postData,
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/x-www-form-urlencoded;'
					}
				});
			},
			updateChallengeQuestion: function(updateChallengeQuestionsURL, postData) {
				return $http({
					method: 'POST',
					url: updateChallengeQuestionsURL,
					data: postData,
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/x-www-form-urlencoded;'
					}
				});
			}
		};
	}

	exports.ChallengeQuestionService = ChallengeQuestionService;
});
