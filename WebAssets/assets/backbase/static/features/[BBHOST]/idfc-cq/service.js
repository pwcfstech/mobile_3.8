define(function (require, exports, module) {
    'use strict';

    /*exports.CQService = {

            getResponse : function(url){
            console.log("inside cq module");
            var u = url;
            return u;
        }
    }*/

   /* exports.getResponse = function(url){
            console.log("inside cq module");
            var u = url;
            return u;
        }*/

    function CQService($http){
        this.$http = $http;
        this.errorMsg = "Hello Error";
        this.CHALLENGE_MESSAGE = 'This transaction has been selected for enhanced security. Kindly answer the below question to proceed.';
        this.WRONG_CQ_ANSWER = 'Seems like you have entered incorrect answer. Please try again';
        this.CQ_ANSWER_ATTEMPT_EXCEED = 'That’s 3 incorrect attempts. We have locked your access for your safety. Kindly call 1800 419 4332 to unlock your account.';
        this.RSA_DENY_MESSAGE = 'Sorry! We are unable to process the transaction. Kindly call on 1800 419 4332 for more details.';
        this.CANCEL_TRANSACTION = 'Sorry! The transaction could not be processed as Challenge Questions have not been updated. Please update and reinitiate the transaction.';
        this.SETUP_CQ_MESSAGE = 'Seems like you have not set up your challenge questions. You need to set them up first and reinitiate the transaction. Please do this before you proceed.';
        this.ECOM_RSAUNVERIFIED = 'Challenge Questions has not been set. Please use Internet Banking or Mobile Banking for setting up Challenge Questions';
    };

    CQService.prototype.getResponse = function(url){
        console.log("inside cq module");
        var u = url;
        return u;
    };

    CQService.prototype.analyzeRSA = function(analyzeURL, analyzeData){
        var xhr = this.$http({
                method: 'POST',
                url: analyzeURL,
                data: analyzeData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });

            return xhr;
    };

    CQService.prototype.challengeRSA = function(challengeURL, challengeData){
         var xhr = this.$http({
                method: 'POST',
                url: challengeURL,
                data: challengeData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });

            return xhr;
    };

    CQService.prototype.verifyRSA = function(verifyRSAURL, verifyRSAData){
         var xhr = this.$http({
                method: 'POST',
                url: verifyRSAURL,
                data: verifyRSAData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });

            return xhr;
    };

    CQService.prototype.notifyRSA = function(notifyURL, notifyData){
         var xhr = this.$http({
                method: 'POST',
                url: notifyURL,
                data: notifyData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });

            return xhr;
    };

    //exports.CQService;
    module.exports = CQService;

});
