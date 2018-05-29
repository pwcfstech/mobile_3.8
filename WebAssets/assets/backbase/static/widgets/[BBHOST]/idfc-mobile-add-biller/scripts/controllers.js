/**
 * Controllers
 * @module controllers
 */
define(function (require, exports) {

    'use strict';

    var idfcConstants = require('idfccommon').idfcConstants;
    var idfcHanlder = require('idfcerror');
    var OTP_SUCCESS_MESSAGE = idfcConstants.OTP_SUCCESS_MESSAGE;
    var $ = require('jquery');

    /**
     * Main controller
     * @ngInject
     * @constructor
     */
    function addBillerCtrl($scope, $timeout, $rootElement, lpWidget, lpCoreUtils, $http, httpService, lpCoreBus, lpPortal, CQService) {

        this.utils = lpCoreUtils;
        this.widget = lpWidget;
        var tempFrom;
        var tempTo;

        // RSA changes by Xebia start
        $scope.cqObject = CQService;
        var getChallengeQuestionUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
            .getPreference('getCQUrl'));
        var verifyCQAnswerUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
            .getPreference('verifyCQAnswerUrl'));
        // to fetch mobile specific data
            gadgets.pubsub.publish("getMobileSdkData");
            gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
              $scope.mobileSdkData = response.data;
            });
        // RSA changes by Xebia ends



         var initialize = function(){

            //Session Management Call
         	idfcHanlder.validateSession($http);

             $scope.billerCategoryReq=false;
			 $scope.billerProviderReq=false;
             $scope.OTPFlag = true;
             $scope.hideOTPFlag = true;
             $scope.billerCategorySelected ='';
            $scope.billerProviderSelected ='';
             $scope.billerNickName='';
             $scope.authCount='';
             $scope.authenticator1='';
             $scope.authenticator2='';
             $scope.authenticator3='';
             $scope.authenticator4='';
             $scope.authenticator5='';
             $scope.accountSelected='';
             $scope.billerCategoryMaster=[];
             $scope.billerProviderMaster=[];
             $scope.frequencyMaster=[];
             $scope.accountList=[];
             $scope.setAutoPayFlag = false;
             $scope.successForm = false;
             $scope.fromDate = '';
             $scope.toDate = '';
             $scope.amount='';
             $scope.frequency='';
             $scope.setLimitAmtFlag=true;
             $scope.ConfirmBillerDetailsflg=false;
             $scope.cancelTransaction = false;
             $scope.customerMob = '';
             $scope.customerMobMasked = '';
             $scope.todaysDate = new Date();
             $scope.todateFinaltimestamp='';
             $scope.fromDateFinal='';
             $scope.datecheck = new Date();
			$scope.isClear1=false;
			 $scope.isClear2=false;
			 $scope.isClear3=false;
			 $scope.isClear4=false;
			 $scope.isClear5=false;
             // RSA changes by Xebia start
            $scope.showSetupCQMessage = false;
            $scope.showCancelTransactionMessage = false;
            $scope.challengeQuestion={};
            $scope.showCQError = "";
            $scope.challengeQuestionCounter = 0;
            $scope.showDenyMessage = false;
            $scope.showWrongAnswerMessage = false;
            // RSA changes by Xebia ends
             $scope.controlPass = {
                 otpValue: ''
             };


             $scope.showButton=true;
             $scope.hideSubmit=false;


             $scope.err = {
                 happened: false,
                 msg: ""
             };
             $scope.error = {
                 happened: false,
                 msg: ""
             };
             $scope.success = {
                 happened: false,
                 msg: ""
             };
             $scope.success.tranx = {
                 happened: false,
                 msg: ""
             };
             if((typeof $scope.challengeQuesAnswers != 'undefined') && ($scope.challengeQuesAnswers != null))
             {
                 for (var i = 0; i < $scope.challengeQuesAnswers.length; i++) {
                     $scope.challengeQuesAnswers[i].answer = "";
                 }
             }
             $("#trbd").show();
             $scope.buttonSuccess=false;
             $scope.hideOTPFlag=true;

             $scope.hideQuesFlag=true;
             $scope.hideCombineFlag=true;
             $scope.globalerror=false;

             $scope.challengeQuesAnswers =[
                 {
                     'answer' : '',
                     'question' : ''
                 }
             ]

             $scope.controlPass = {
                 otpValue: ''
             };



             $scope.billerProviderListEndPoint = lpWidget.getPreference('BillerMasterDbDataSrc');
             $scope.addBillerEndPoint = lpWidget.getPreference('AddBillerDataSrc');
             $scope.generateOTPServiceEndPoint = lpWidget.getPreference('generateOTPService');
             $scope.verifyOTPServiceEndPoint = lpWidget.getPreference('verifyOTPService');




             $scope.getBillerCategoryMaster();
            // $scope.getaccountDetails();
             $scope.getFrequencyList();
        $scope.origin = '';
       $scope.backToViewBills = false;
} ;
                        if(localStorage.getItem("navigationFlag")){

                                if(localStorage.getItem("origin") == "view-bills"){
                                $scope.origin ="view-bills";
                                $scope.backToViewBills = true;
                                }
                        };

//       launchpad-billPay.add-biller
       $scope.showBackButton = function (){
       gadgets.pubsub.publish("js.back", {
                              data: "ENABLE_BACK"
                              });
       };
       
       
       

        $scope.checkAlphanumeric = function (rege)
        {
            if(!rege)
            {
                    return 'text';
            }

            var letters = /[a-zA-Z]/;
            if(rege.match(letters))
            {
                    return 'text';
            }
                return 'tel';
        }
        /**
         * to clear the fields on selection on provider and category.
         * @param value
         */
        $scope.clearValues = function(value) {

            $scope.fromDate = '';
            $scope.toDate = '';

            $scope.billerNickName=''
            $scope.authenticator1='';
            $scope.authenticator2='';
            $scope.authenticator3='';
            $scope.authenticator4='';
            $scope.authenticator5='';
            $scope.accountSelected='';
            $scope.frequency='';
            $scope.amount='';
            $scope.disableDateCheck = true;
            //$scope.errorMessage='';
            $scope.setAutoPayFlag = false;
			
			$scope.check1=false;
			$scope.check2=false;
			$scope.check3=false;
			$scope.check4=false;
			$scope.check5=false;
			$scope.submitted = false;
        }

        /**
         * frequency for making date null
         */
        $scope.$watch('frequency',function() {

            if(!angular.isUndefined($scope.frequency) || $scope.frequency != null || $scope.frequency != ''){
                $scope.fromDate='';
                $scope.toDate = '';

            }

        },true);


        /**
         *on the basic of fromDate todate will be selected.
         */
        $scope.$watch('fromDate',function() {

            if(!angular.isUndefined($scope.fromDate)){

                if(  $scope.fromDate!=null || $scope.fromDate!=''){
                    $scope.toDate = '';
                    $scope.todateFinal = new Date($scope.toDate);
                    $scope.fromDateFinal = new Date($scope.fromDate);

                if($scope.frequency === 'MONTHLY'){
                    $scope.disableDateCheck = false;
                    console.log("MONTHLY");
                    $scope.datecheck = new Date(new Date($scope.fromDateFinal).setMonth($scope.fromDateFinal.getMonth()+1));
                    console.log("Date check"+$scope.datecheck);

                }else if($scope.frequency === 'QUARTERLY'){
                    $scope.disableDateCheck = false;
                    console.log("QUARTERLY");
                    $scope.datecheck = new Date(new Date($scope.fromDateFinal).setMonth($scope.fromDateFinal.getMonth()+3));
                    console.log("Date check"+$scope.datecheck);

                } if($scope.frequency === 'HALFYEARLY'){
                        $scope.disableDateCheck = false;
                        console.log("HALFYEARLY");
                        $scope.datecheck = new Date(new Date($scope.fromDateFinal).setMonth($scope.fromDateFinal.getMonth()+6));
                        console.log("Date check"+$scope.datecheck);

                }if($scope.frequency === 'YEARLY'){
                        $scope.disableDateCheck = false;
                        console.log("YEARLY");
                        $scope.datecheck = new Date(new Date($scope.fromDateFinal).setMonth($scope.fromDateFinal.getMonth()+12));
                        console.log("Date check"+$scope.datecheck);

                }

                }

            }

        },true);

        /**
         * Watch Function when  billerProviderSelected for Authenticator to be shown on screen
         */
        $scope.$watch('billerProviderSelected',function() {

            $scope.authenticator4='';
            $scope.authenticator5='';
            $scope.clearValues();

            /* Few biller need Hard coded Authenticator */

            if($scope.billerProviderSelected.billerId === 'CHILDLINE'  || $scope.billerProviderSelected.billerId === 'CRYREL' ||
                $scope.billerProviderSelected.billerId === 'NAB'){

                $scope.authenticator4='Education';
                $scope.authenticator5='0';
            }else if($scope.billerProviderSelected.billerId === 'CPAA'){

                $scope.authenticator4='Cancer Screening';
                $scope.authenticator5='0';
            } else if($scope.billerProviderSelected.billerId === 'PETA'){

                $scope.authenticator4='Member';
                $scope.authenticator5='0';
            } else if($scope.billerProviderSelected.billerId === 'SAVE'){

                $scope.authenticator4='Daily Nutritious Meal';
                $scope.authenticator5='0';
            } else if($scope.billerProviderSelected.billerId === 'INDTOD'){

                $scope.authenticator4='English 5 yrs Rs. 5100.00';
            }

            /* Few biller need Hard coded Authenticator */

            console.log("Selected billerProviderSelected"+$scope.billerProviderSelected);
            console.log($scope.billerProviderSelected);

            $scope.authCount = $scope.billerProviderSelected.authenticatorCount;

            console.log($scope.authCount);

        },true);




        /**
         * Watch Function when  billerCategorySelected hit the service  to fetch the Provide Details
         */
        $scope.$watch('billerCategorySelected',function() {

            $scope.clearValues();
           $scope.billerProviderSelected ='';
            $scope.authCount=0;

            console.log("Selected billerCategorySelected"+$scope.billerCategorySelected);
            console.log("Selected setAutoPayFlag   "+$scope.setAutoPayFlag);
            $scope.providerFlag=true;




            if($scope.billerCategorySelected==null || $scope.billerCategorySelected==''){

                $scope.providerFlag=false;
            }

            if($scope.providerFlag=true){
                generateBillerProviderList();

            }

            console.log($scope.authCount);

        },true);


         /**
         *  generateBillerProvider List
         * @desc Method to generate the dropdown list of BillerProvider on the basics of billerCategorySelected
         */
      /*  var generateBillerProviderList = function(value) {


            $scope.errorSpin = true;
            var xhr;
            var billerProviderServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.billerProviderListEndPoint, {
                servicesPath: lpPortal.root
            });
            var postData = {
                'billerCategory': $scope.billerCategorySelected,
                'requestId': 'Category'
            };
            postData = $.param(postData || {});
            xhr = $http({
                method: 'POST',
                url: billerProviderServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            xhr.success(function(data, status, headers, config) {
                $scope.errorSpin = false;
                if (data && data !== 'null') {
                    console.log(data);
                    $scope.billerProviderMaster = data;
                    $scope.billerProviderSelected = $scope.billerProviderMaster[0].billerName;
                }
            });
            xhr.error(function(data, status, headers, config) {
                $scope.errorSpin = false;
                if(data.cd) {
                    // If session timed out, redirect to login page
                    //checkTimeout(data);
                    // If service not available, set error flag
                    //$scope.serviceErrorAPIN = checkGlobalError(data);
                }
                $scope.alert = {
                    messages: {
                        cd: data.rsn
                    }
                };
                $scope.addAlert('cd', 'error', false);

            });
        };*/

        //SMS Reading -- Start
        //To receive events if user has cliked on resend OTP
        gadgets.pubsub.subscribe("resend.otp", function(evt){
            console.log(evt.resendOtpFlag)
            //Call function that is called on a click of "Resend OTP" button available on Widget
            $scope.readSMS('resend');
        });


        $scope.readSMS = function(resendFlag){
            console.log('Read SMS called');
            //Step 1: Check whether user has provided SMS reading permission or not through SMS plugin
            var smsPlugin = cxp.mobile.plugins['SMSPlugin'];
            if(smsPlugin){
                var isCheckSuccessCallback = function(data) {
                    if(data) {
                        var smsPermissionFlag = data['successFlag'];

                        if(smsPermissionFlag){
                            //User has already given permission for reading SMS
                            //Step 1. publish SMS reading pubsub
                            console.log('SMS permission flag' + smsPermissionFlag);
                            gadgets.pubsub.publish("readSMS",{
                                //Data contains name of the Widget. This ensures no interception between multiple
                                //widgets, publish the same event
                                data: "AddBiller"
                            });

                            //Step 2. Send request to "sendOTP service
                            if('resend'===resendFlag){
                                console.log('Resend OTP');
                                $scope.generateOTP(resendFlag);
                            }else{
                                // logic changed after RSA implementation 
                                /*console.log('enableDisableOTPorQuestion called');
                                $scope.enableDisableOTPorQuestion();*/
                            }

                            //Step 3: Subscribes for the event for receiving OTP
                            //While subscribing, event name has to be same as the DATA sent at the time of sending request for reading OTP
                            gadgets.pubsub.subscribe("AddBiller", function(evt){
                                //alert(evt.otp);
                                //var receivedOtp = evt.data;
                                var receivedOtp = evt.otp;
                                console.log('OTP: '+evt.otp);
                                //Sending event for stopping OTP reading
                                gadgets.pubsub.publish("stopReceiver",{
                                    data:"Stop Reading OTP"
                                });

                            //Step 4: Send request to verify OTP service. OTP should be in receiveOtp popup
                                console.log('receivedOtp'+receivedOtp);
                                $scope.controlPass.otpValue = receivedOtp;
                                $scope.$apply();
                                console.log('OTP value :'+$scope.controlPass.otpValue);
                                angular.element('#verifyOTP-btn-addBiller').triggerHandler('click');
                            });
                        }
                        else{
                            // logic changed after RSA implementation
                            //User has not provided permission for SMS reading
                            //1. Send request to "sendOTP" service
                            /*if('resend'===resendFlag){
                                console.log('Resend OTP');
                                $scope.generateOTP(resendFlag);
                            }else{
                                console.log('enableDisableOTPorQuestion called');
                                $scope.enableDisableOTPorQuestion();
                            }*/
                        }

                    } else {
                        console.log('Some error. Dont initiate SMS reading');
                        //1. Send request to "sendOTP" service
                    }
                };
                var isCheckErrorCallback = function(data) {
                    console.log('Some error: Dont initiate SMS reading');
                };

                smsPlugin.checkSMSReadPermission(
                    isCheckSuccessCallback,
                    isCheckErrorCallback
                );
            }
        };

        /***
         * RSA Integration With setDevice from RSA Files
         * @returns {*}
         */
        var setdeviceprint=function(){
            return encode_deviceprint();
        };

        <!--- Enable disable OTP or Question-->
        $scope.enableDisableOTPorQuestion=function(){
            $scope.controlPass.otpValue='';
            $scope.lockFieldsOTP=false;
            $scope.err = {
                happened: false,
                msg: ''
            };
            $scope.error = {
                happened: false,
                msg: ''
            };
            //alert("Inside enable disable");
            $scope.errors = {};
            $scope.alerts = [];
            $scope.buttonError=false;
            var xhr;

            var res;
            var challengeQuestions = [];

            var rsaAnalyzeService = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference("rsaAnalyzeService"));

             $scope.postData = {
           
                 'transaction':'addbiller',
				 'billerCategory':$scope.billerCategorySelected
            };
            $scope.postData.devicePrint = setdeviceprint();
            // to fetch mobile specific data
            gadgets.pubsub.publish("getMobileSdkData");
            gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
              $scope.mobileSdkData = response.data;
            });
            $scope.postData.mobileSdkData = JSON.stringify($scope.mobileSdkData);
            var data1 = $.param($scope.postData || {});

            res = $http({
                method: "POST",
                url: rsaAnalyzeService,
                data: data1,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type':'application/x-www-form-urlencoded;'
                }
            });
            res.success(function (data) {

                $scope.credentialType = data.credentialType;
                $scope.isRibUser = data.ribuser;

                // RSA changes by Xebia starting
                    if (data.actionStatus === 'DENY' || data.userStatus === 'DELETE' || data.userStatus === 'LOCKOUT' ) 
                    {
                            $scope.errorSpin = false;
                            $scope.showDenyMessage = true;
                            $scope.showButton = false;
                    }
                    else if(data.userStatus === 'UNVERIFIED' || data.userStatus === 'NOTENROLLED')
                        {
                            $scope.showSetupCQMessage = true;
                            $scope.errorSpin = false;
                            $scope.showButton = false;
                        }  
                    else if ( data.actionStatus === 'ALLOW' &&  ( data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED' ) ) 
                        {
                            $scope.errorSpin = true;
                            $scope.generateOTP("generate");
                            $scope.readSMS('');
                        } 
                    else if (data.actionStatus === 'CHALLENGE' && ( data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED' ) )
                        {
                            $scope.errorSpin = false;
                            $scope.showCQError=CQService.CHALLENGE_MESSAGE;
                            $scope.challengeQuestionCounter++;
                            $scope.challengeQuestions = data.challengeQuestionList[0].questionText;
                            $scope.challengeQuestionsId = data.challengeQuestionList[0].questionId;
                            $scope.hideQuesFlag = false;
                            $scope.showButton = false;
                            $scope.showQuestionDiv = true;
                            $scope.hideOTPFlag = true;
                            $scope.hideCombineFlag = true;
                        }
                // RSA changes by Xebia ends

            });
            res.error(function(data) {
                idfcError.checkTimeout(data);
                $scope.globalerror=idfcError.checkGlobalError(data);
                if($scope.globalerror){
                    $scope.err = {
                        happened: true,
                        msg: data.rsn
                    };
                    $scope.buttonError=true;
                }
                $scope.error = {
                    happened: true,
                    msg: data.rsn
                };
                $scope.success = {
                    happened: false,
                    msg: ''
                };
            });


        };

        // showSetupCQ function by Xebia
        $scope.showSetupCQ = function()
        {
            gadgets.pubsub.publish('openCQ');
        }

        // cancel Transaction function by Xebia
        $scope.cancelRSATransaction = function()
        {
            gadgets.pubsub.publish("launchpad-retail.backToDashboard")  
        }

        // verify challenge question answer function by Xebia
        $scope.verifyCQAnswer = function()
        {
            $scope.errorSpin = true;
            var postdata = {
                questionID : $scope.challengeQuestionsId,
                question : $scope.challengeQuestions,
                answer : $scope.challengeQuestion.answer,
                credentialType : 'QUESTION'
            }
            // to fetch mobile specific data
            gadgets.pubsub.publish("getMobileSdkData");
            gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
                $scope.mobileSdkData = response.data;
            });
            postdata.mobileSdkData = JSON.stringify($scope.mobileSdkData);
            postdata= $.param(postdata);

            var xhr = CQService.verifyRSA(verifyCQAnswerUrl, postdata);
            xhr.success(function(response){
                    if(response.correctlyAnswered)
                    {
                        $scope.errorSpin = true;
                        $scope.hideQuesFlag = true;
                        $scope.showQuestionDiv = false;
                        $scope.showWrongAnswerMessage = false;
                        $scope.generateOTP("generate");   
                        $scope.readSMS('');
                    }
                    else
                    {
                        if($scope.challengeQuestionCounter <= 2)
                        {
                            $scope.errorSpin = false;
                            $scope.showCQError = CQService.WRONG_CQ_ANSWER;
                            $scope.showWrongAnswerMessage = true;
                            $scope.showQuestionDiv = false;   
                        }
                        else
                        {
                            $scope.errorSpin = false;
                            $scope.showQuestionDiv = false;  
                            $scope.showCQError = CQService.CQ_ANSWER_ATTEMPT_EXCEED;
                        }
                    }
                    
                    
                })
            xhr.error(function (data, status) {
                        $scope.errorSpin = false;
                        idfcError.checkTimeout(data);
                        $scope.globalerror=idfcError.checkGlobalError(data);
                        if($scope.globalerror){
                            $scope.err = {
                                happened: true,
                                msg: data.rsn
                            };
                            $scope.buttonError=true;
                        }
                        $scope.error = {
                            happened: true,
                            msg: data.rsn
                        };
                        $scope.success = {
                            happened: false,
                            msg: ''
                        };
                    });

        };

        // fetch challenge question function by Xebia
        $scope.fetchCQ = function()
        {
            $scope.errorSpin = true;
            $scope.challengeQuestion.answer="";
            $scope.showCQError="";
            var postdata = {};
            
            var xhr = CQService.challengeRSA(getChallengeQuestionUrl, postdata);

            xhr.success(function(response){
                $scope.showWrongAnswerMessage = false;
                $scope.challengeQuestionCounter++;
                $scope.challengeQuestionsId = response.challengeQuestionList[0].questionId;
                $scope.challengeQuestions = response.challengeQuestionList[0].questionText;
                $scope.errorSpin = false;
                $scope.hideQuesFlag = false;
                $scope.showQuestionDiv = true;
                $scope.showButton = false;
                $scope.hideOTPFlag = true;
                $scope.hideCombineFlag = true;
            })

            xhr.error(function (data, status) {
                        $scope.errorSpin = false;
                        idfcError.checkTimeout(data);
                        $scope.globalerror=idfcError.checkGlobalError(data);
                        if($scope.globalerror){
                            $scope.err = {
                                happened: true,
                                msg: data.rsn
                            };
                            $scope.buttonError=true;
                        }
                        $scope.error = {
                            happened: true,
                            msg: data.rsn
                        };
                        $scope.success = {
                            happened: false,
                            msg: ''
                        };
                });
        };

        /**
         *  generateBillerProvider List
         * @desc Method to generate the dropdown list of BillerProvider on the basics of billerCategorySelected
         */
        var generateBillerProviderList = function(value) {


            $scope.errorSpin = true;
            var xhr;
            var billerProviderServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.billerProviderListEndPoint, {
                servicesPath: lpPortal.root
            });
            var postData = {
                'billerCategory': $scope.billerCategorySelected,
                'requestId': 'Category'
            };
            postData = $.param(postData || {});
            xhr = $http({
                method: 'POST',
                url: billerProviderServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            xhr.success(function(data, status, headers, config) {
                $scope.errorSpin = false;
                if (data && data !== 'null') {
                    console.log("biller details"+data);
                    $scope.billerProviderMaster = data;
/**Fix for biller showing blank option*/
                $scope.billerProviderSelected= $scope.billerProviderMaster[0].billerName;
                   /* $timeout(function() {
                                $("#Provider option[value='? string: ?']").attr("style","display:none");

                     },1000);
*/

                }
            });
            xhr.error(function(data, status, headers, config) {
                $scope.errorSpin = false;
                if(data.cd) {
                    // If session timed out, redirect to login page
                    //checkTimeout(data);
                    // If service not available, set error flag
                    //$scope.serviceErrorAPIN = checkGlobalError(data);
                }
                $scope.alert = {
                    messages: {
                        cd: data.rsn
                    }
                };
                $scope.addAlert('cd', 'error', false);

            });
        };


        /**
         *  addBiller Hit
         * @desc Method to generate the dropdown list of BillerProvider on the basics of billerCategorySelected
         */
        $scope.addBiller = function(isFormValid,action) {

            if(!isFormValid) {
                return false;
            }
            /* Few biller need Hard coded Authenticator */

            if($scope.billerProviderSelected.billerId === 'CHILDLINE'  || $scope.billerProviderSelected.billerId === 'CRYREL' ||
                $scope.billerProviderSelected.billerId === 'NAB'){

                $scope.authenticator4='Education';
                $scope.authenticator5='0';
                $scope.authCount = 4;
            }else if($scope.billerProviderSelected.billerId === 'CPAA'){

                $scope.authenticator4='Cancer Screening';
                $scope.authenticator5='0';
                $scope.authCount = 4;
            } else if($scope.billerProviderSelected.billerId === 'PETA'){

                $scope.authenticator4='Member';
                $scope.authenticator5='0';
                $scope.authCount = 4;
            } else if($scope.billerProviderSelected.billerId === 'SAVE'){

                $scope.authenticator4='Daily Nutritious Meal';
                $scope.authenticator5='0';
                $scope.authCount = 4;
            } else if($scope.billerProviderSelected.billerId === 'INDTOD'){

                $scope.authenticator4='English 5 yrs Rs. 5100.00';
                $scope.authCount = 4;
            }

            /* Few biller need Hard coded Authenticator */



            if($scope.toDate!=null || $scope.toDate!='' ){


                $scope.todateFinal = new Date($scope.toDate);
                $scope.todateFinaltimestamp = $scope.todateFinal.getTime();

            }

            $scope.alerts = [];
            $scope.errorSpin = true;
            var xhr;
            var addBillerServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.addBillerEndPoint, {
                servicesPath: lpPortal.root
            });

            if($scope.setAutoPayFlag===false){
                                                    var postData = {
                                                        'billerId': $scope.billerProviderSelected.billerId,
                                                        'bllrNckNm': $scope.billerNickName,
                                                        'noOfAuthenticator': $scope.authCount,
                                                        'setAutoPay': 'false',
                                                        'Authenticator1':$scope.authenticator1,
                                                        'Authenticator2':$scope.authenticator2,
                                                        'Authenticator3':$scope.authenticator3,
                                                        'Authenticator4':$scope.authenticator4,
                                                        'Authenticator5':$scope.authenticator5
                                                    };

                                                }
                                        else if($scope.setAutoPayFlag===true)
                                        {

                                            if($scope.setLimitAmtFlag == true){

                                                var postData = {
                                                    'billerId': $scope.billerProviderSelected.billerId,
                                                    'bllrTp':$scope.billerProviderSelected.billerType,
                                                    'bllrNckNm': $scope.billerNickName,
                                                    'noOfAuthenticator': $scope.authCount,
                                                    'setAutoPay': 'true',
                                                    'Authenticator1':$scope.authenticator1,
                                                    'Authenticator2':$scope.authenticator2,
                                                    'Authenticator3':$scope.authenticator3,
                                                    'Authenticator4':$scope.authenticator4,
                                                    'Authenticator5':$scope.authenticator5,
                                                    'atPyLmt': 'Y',
                                                    'atPyLmtAmt': $scope.amount,
                                                    'atPyCrdtCrd':'N',
                                                    'atPyAcctNbr':$scope.accountSelected,
                                                    'atPyStrtDt': $scope.fromDate.getTime(),
                                                    'atPyEndDt': $scope.todateFinaltimestamp,
                                                    'atPyFrq': $scope.frequency
                                                };

                                            }else{


                                                var postData = {
                                                    'billerId': $scope.billerProviderSelected.billerId,
                                                    'bllrTp':$scope.billerProviderSelected.billerType,
                                                    'bllrNckNm': $scope.billerNickName,
                                                    'noOfAuthenticator': $scope.authCount,
                                                    'setAutoPay': 'true',
                                                    'Authenticator1':$scope.authenticator1,
                                                    'Authenticator2':$scope.authenticator2,
                                                    'Authenticator3':$scope.authenticator3,
                                                    'Authenticator4':$scope.authenticator4,
                                                    'Authenticator5':$scope.authenticator5,
                                                    'atPyLmt': 'N',
                                                    'atPyLmtAmt': 'NA',
                                                    'atPyCrdtCrd':'N',
                                                    'atPyAcctNbr':$scope.accountSelected,
                                                    'atPyStrtDt': $scope.fromDate.getTime(),
                                                    'atPyEndDt': $scope.todateFinaltimestamp,
                                                    'atPyFrq': $scope.frequency

                                                };


                                            }


                                        }

            postData.otpValue=$scope.controlPass.otpValue;
            count1++;
            postData.credentialType=action;

            postData = $.param(postData || {});
            xhr = $http({
                method: 'POST',
                url: addBillerServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            xhr.success(function(data, status, headers, config) {
                $scope.errorSpin = false;
                if (data && data !== 'null') {
                    console.log(data);
                    $scope.data = data;
                    $scope.successForm =true;

                }
            });
          /*  xhr.error(function(data, status, headers, config) {
                $scope.errorSpin = false;
                if(data.cd == '02' || data.cd == '04') {
					$scope.error = {
							happened: true,
							msg: data.rsn
						};
						$scope.success.happened = false;
                }
                else if(data.cd == 'BPAY:ERR_UBP_DUP_BILLER'){
                    $scope.error = {
                    		happened: true,
                    		msg: data.rsn
                    };
                    $scope.success.happened = false;
                }
				else if(data.cd == '08' ){
					$scope.error = {
							happened: true,
							msg: data.rsn
						};
						$scope.success.happened = false;
						$scope.cancelTransaction = true;
				}
				else{
					$scope.alert = {
						messages: {
							cd: data.rsn
                    }
                };
                $scope.addAlert('cd', 'error', false);

            };
        });*/
        // close handling for addbiller otp changes minor release 2.0
                   xhr.error(function(data, status, headers, config) {
                        $scope.errorSpin = false;
                        $scope.dataError = data;
                      	$scope.success.happened = false;
                             if(count1== 3){

                                 $scope.error = {
                                   happened: true,
                                   msg: '3 strikes and you are out! You entered the wrong code thrice. Start the process again please.'
                                };
                            }
                            else{

                                $scope.success.msg = '';
                                $scope.error = {
                                    happened: true,
                                    msg: "That's the wrong code! Please try again."
                                };



                                /*else
                                {
                                    if(data.cd == '02' || data.cd == '04') {
                                        $scope.error = {
                                                happened: true,
                                                msg: data.rsn
                                            };
                                            $scope.success.happened = false;
                                    }
                                    else if(data.cd == 'BPAY:ERR_UBP_DUP_BILLER'){
                                        $scope.error = {
                                                happened: true,
                                                msg: data.rsn
                                        };
                                        $scope.success.happened = false;
                                    }
                                    else if(data.cd == '08' ){
                                        $scope.error = {
                                                happened: true,
                                                msg: data.rsn
                                            };
                                            $scope.success.happened = false;
                                            $scope.cancelTransaction = true;
                                    }
                                    else{
                                        $scope.error = {
                                            happened: true,
                                            msg: ""
                                        };
                                        $scope.success.happened = false;
                                        $scope.alert = {
                                            messages: {
                                                cd: data.rsn
                                        }
                                    };
                                 }
                                */
                                 $scope.success.happened = false;
                                 $scope.cancelTransaction = true;
                                 $scope.addAlert('cd', 'error', false);

                            }
                        }
                    );
}
        /**
         * Alerts to push Alerts on screen
         */
        $scope.alerts = [];

        $scope.addAlert = function(code, type, timeout) {
            var customAlert = {
                type: type || 'error',
                msg: $scope.alert.messages[code]
            };

            $scope.alerts.push(customAlert);

            if (timeout !== false) {
                $timeout(function() {
                    $scope.closeAlert($scope.alerts.indexOf(customAlert));
                }, ALERT_TIMEOUT);
            }

        };

        // Remove specific alert
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };


        /**
         * Load Biller category Master From DB
         * @returns {xhr}
         */
        $scope.getBillerCategoryMaster = function() {
            var self = this;
            self.getBillerCategoryMasterLists = httpService.getInstance({
                endpoint: lpWidget.getPreference('billerCategoriesMasterDbDataSrc')
                //$scope.errorSpin = false;
            });

            var xhr = self.getBillerCategoryMasterLists.read();

            xhr.success(function(data) {
                //alert(data);
                console.log(data);
                $scope.billerCategoryMaster = data;
                $scope.errorSpin = false;
            });

            xhr.error(function(data) {
                $scope.errorSpin = false;
                //checkTimeout(data);
                //$scope.globalerror = checkGlobalError(data); //Commented For Now
                $scope.error = {
                    happened: true,
                    msg: data.rsn
                };
            });

            return xhr;
        };



        /**
         * Get account Details
         * @returns {xhr}
         */
        $scope.getaccountDetails = function() {
            var self = this;
            self.getaccountDetailsLists = httpService.getInstance({
                endpoint: lpWidget.getPreference('accountsDataSrc')
                //$scope.errorSpin = false;
            });
              $scope.errorSpin = true;
            var xhr = self.getaccountDetailsLists.read();
			
            xhr.success(function(data) {
                //alert(data);
				$scope.errorSpin = false;
                console.log(data);
                $scope.accountList = data;
                $scope.errorSpin = false;
            });

            xhr.error(function(data) {
                $scope.errorSpin = false;
                //checkTimeout(data);
                //$scope.globalerror = checkGlobalError(data); //Commented For Now
                $scope.error = {
                    happened: true,
                    msg: data.rsn
                };
            });

            return xhr;
        };


        /**
         * get Frequency List
         * @returns {xhr}
         */
        $scope.getFrequencyList = function() {
            var self = this;
            self.getFrequencyListDetails = httpService.getInstance({
                endpoint: lpWidget.getPreference('frequencyDataSrc')
                //$scope.errorSpin = false;
            });

            var xhr = self.getFrequencyListDetails.read();

            xhr.success(function(data) {
                //alert(data);
                console.log(data);
                $scope.frequencyMaster = data;
                $scope.errorSpin = false;
            });

            xhr.error(function(data) {
                $scope.errorSpin = false;
                //checkTimeout(data);
                //$scope.globalerror = checkGlobalError(data); //Commented For Now
                $scope.error = {
                    happened: true,
                    msg: data.rsn
                };
            });

            return xhr;
        };

        /**
         * Back button will take to the 1st screen of widget.
         *
         */
        $scope.backToFirstScreen = function() {
			$scope.ConfirmBillerDetailsflg=false;
       $scope.$apply();

        };
		
		/**
         * Add Biller button will reset the widget.
         *
         */
        $scope.back = function() {

		 /*   lpWidget.refreshHTML();*/
		 $scope.controlPass.otpValue = '';
            initialize();
        };
		
		$scope.loadAccounts = function(){
			if($scope.setAutoPayFlag === true){
				$scope.getaccountDetails();
			}
		};

        /**
         * Add biller Submit Page it will show hide the flag to take it to confirmation page.
         *
         */
        $scope.submit = function(nickName,auth1,auth2,auth3,auth4,auth5) {
            $scope.backToViewBills = false;

            if(!nickName) {

                console.log("nickName Error - Required");
                return false;
            }

            $scope.errorSpin = true;            
            $scope.alerts = [];
            //$scope.errorMessage='';
			$scope.accountSelectedFlag = false;
			$scope.frequencySelectedFlag = false;
			$scope.limitAmountSelectedFlag = false;


            switch($scope.billerProviderSelected.authenticatorCount){

                case 1 :

                        if(!auth1) {

                            console.log("auth1 Error - Required");
                            return false;
                        }

                    break;

                case 2 :

                        if(!auth1 || !auth2) {

                            console.log("auth1 and auth2 Error - Required");
                            return false;
                        }

                    break;
                case 3 :

                        if(!auth1 || !auth2 || !auth3) {

                            console.log("auth1 ,auth2 and auth3 Error - Required");
                            return false;
                        }

                    break;
                case 4:
                        if(!auth1 || !auth2 || !auth3 || !auth4) {

                            console.log("auth1 ,auth2, auth3 and auth4 Error - Required");
                            return false;
                        }

                    break;
                case 5:

                    if(!auth1 || !auth2 || !auth3 || !auth4 || !auth5) {

                        console.log("auth1 ,auth2 ,auth3 , auth4 and auth5 Error - Required");
                        return false;
                    }

                    break;

            }


			
            if($scope.setAutoPayFlag === false){
				var billerNickNameVar = $scope.billerNickName;

                 if($scope.billerCategorySelected===null || $scope.billerCategorySelected===''){
					$scope.billerCategoryReq= true;
                    $scope.errorMessageBillerCategory='You missed selecting Biller Category. Please select the same to go ahead';
					

                }else if($scope.billerProviderSelected===null || $scope.billerProviderSelected===''){
				     $scope.billerCategoryReq= false;
                     $scope.billerProviderReq= true;
                    $scope.errorMessageBillerProvider='You missed selecting Biller Provider. Please select the same to go ahead';
					

                }else if($scope.billerNickName===null ||  angular.isUndefined(billerNickNameVar) || $scope.billerNickName === '')
                {
				   $scope.billerCategoryReq= false;
                     $scope.billerProviderReq= false;
					 $scope.ConfirmBillerDetailsflg=false;
                    $scope.errorMessage='';
					
                }else if($scope.billerProviderSelected.authenticatorCount != null ){
                     $scope.billerCategoryReq= false;
                     $scope.billerProviderReq= false;
					switch($scope.billerProviderSelected.authenticatorCount){

                        case 1 :
                            if($scope.authenticator1===null || $scope.authenticator1==='' || $scope.check1===true ){
                                $scope.ConfirmBillerDetailsflg=false;
                            }else{
                                $scope.ConfirmBillerDetailsflg=true;
                                $scope.OTPFlag = false;
                                //$scope.generateOTP('send');
                                //Send OTP service replaced by auto read
                                $scope.enableDisableOTPorQuestion();
                                // logic change after RSA implementation
                                //$scope.readSMS('');
                                $scope.hideOTPFlag = true;
                            }

                            break;

                        case 2 :
                            if($scope.authenticator2===null || $scope.authenticator2==='' || $scope.check1===true ){
                                $scope.ConfirmBillerDetailsflg=false;
                            }else if($scope.check2===true){
                                $scope.ConfirmBillerDetailsflg=false;
                            }else{
                                $scope.ConfirmBillerDetailsflg=true;
                                $scope.OTPFlag = false;
                                //$scope.generateOTP('send');
                                //Send OTP service replaced by auto read
                                $scope.enableDisableOTPorQuestion();
                                // logic change after RSA implementation
                                //$scope.readSMS('');
                                $scope.hideOTPFlag = true;
                            }

                            break;
                        case 3 :
                            if($scope.authenticator3===null || $scope.authenticator3==='' || $scope.check3===true ){
                                $scope.ConfirmBillerDetailsflg=false;
                            }else if($scope.check2===true){
                                $scope.ConfirmBillerDetailsflg=false;
                            }else if($scope.check3===true){
                                $scope.ConfirmBillerDetailsflg=false;
                            }else{
                                $scope.ConfirmBillerDetailsflg=true;
                                $scope.OTPFlag = false;
                                //$scope.generateOTP('send');
                                //Send OTP service replaced by auto read
                                $scope.enableDisableOTPorQuestion();
                                // logic change after RSA implementation
                                //$scope.readSMS('');
                                $scope.hideOTPFlag = true;
                            }

                            break;
                        case 4:
                            if($scope.authenticator4===null || $scope.authenticator4==='' || $scope.check1===true ){
                                $scope.ConfirmBillerDetailsflg=false;
                            }else if($scope.check2===true){
                            $scope.ConfirmBillerDetailsflg=false;
                            }else if($scope.check3===true){
                            $scope.ConfirmBillerDetailsflg=false;
                            }else if($scope.check4===true){
                                $scope.ConfirmBillerDetailsflg=false;
                            }else{
                                $scope.ConfirmBillerDetailsflg=true;
                                $scope.OTPFlag = false;
                                //$scope.generateOTP('send');
                                //Send OTP service replaced by auto read
                                $scope.enableDisableOTPorQuestion();
                                // logic change after RSA implementation
                                //$scope.readSMS('');
                                $scope.hideOTPFlag = true;
                            }

                            break;
                        case 5:
                            if($scope.authenticator5===null || $scope.authenticator5==='' || $scope.check5===true ){
                                $scope.ConfirmBillerDetailsflg=false;
                            }else if($scope.check2===true){
                                $scope.ConfirmBillerDetailsflg=false;
                            }else if($scope.check3===true){
                                $scope.ConfirmBillerDetailsflg=false;
                            }else if($scope.check4===true){
                                $scope.ConfirmBillerDetailsflg=false;
                            }else if($scope.check5===true){
                            $scope.ConfirmBillerDetailsflg=false;
                            }   else{
                                $scope.ConfirmBillerDetailsflg=true;
                                $scope.OTPFlag = false;
                                //$scope.generateOTP('send');
                                //Send OTP service replaced by auto read
                                $scope.enableDisableOTPorQuestion();
                                // logic change after RSA implementation
                                //$scope.readSMS('');
                                $scope.hideOTPFlag = true;
                            }

                            break;

                    }

                }else {

                    $scope.ConfirmBillerDetailsflg=true;
                    $scope.OTPFlag = false;
                    //$scope.generateOTP('send');
                    //Send OTP service replaced by auto read
                    $scope.enableDisableOTPorQuestion();
                    // logic change after RSA implementation
                    //$scope.readSMS('');
                    $scope.hideOTPFlag = true;
                }


            }

           else  {

		   
                if($scope.billerProviderSelected.billerType==='PAYEE'){

                    if($scope.setLimitAmtFlag === true){

                        $scope.ConfirmBillerDetailsflg=false;


                        if($scope.billerNickName===null || $scope.billerNickName==='')
                        {
                            //$scope.errorMessage='Give this bill payment a nick name';

                        }else if($scope.billerCategorySelected===null || $scope.billerCategorySelected===''){

                            //$scope.errorMessage='You missed selecting Biller Category. Please select the same to go ahead';

                        }else if($scope.billerProviderSelected===null || $scope.billerProviderSelected===''){

                            //$scope.errorMessage='You missed selecting Biller Provider. Please select the same to go ahead';

                        }else if($scope.accountSelected===null || $scope.accountSelected===''){

                            //$scope.accountSelectedMessage='You missed selecting Account Number. Please select the same to go ahead';
							$scope.accountSelectedFlag = true;

                        }else if($scope.frequency===null || $scope.frequency===''){

                            //$scope.errorMessage='You missed selecting Frequency. Please select the same to go ahead';
							$scope.frequencySelectedFlag = true;

                        }else if($scope.fromDate===null || $scope.fromDate===''){

                            //$scope.errorMessage='You missed selecting Start Date. Please select the same to go ahead';
							

                        }else if($scope.toDate===null || $scope.toDate===''){

                            //$scope.errorMessage='You missed selecting End Date. Please select the same to go ahead';
							

                        }else if($scope.amount===null || $scope.amount===''){

                            //$scope.amountSelected='Pls set the limit for your bill'; // to check the amount
							$scope.limitAmountSelectedFlag = true;
                        }
                        else if($scope.amount !== ''){
                        if($scope.amount.length > 15){
                        $scope.limitAmountMaxlengthFlag = true;
                        }else{
                         $scope.limitAmountMaxlengthFlag = false;
                           $scope.limitAmountPatternFlag = false;
                            var regex = new RegExp('^[(0-9)]*[\.]?[(0-9)]*$');
                               if($scope.amount.match(regex)){
                                console.log("regex matched");
                                 $scope.ConfirmBillerDetailsflg=true;
                                $scope.OTPFlag = false;
                                  //$scope.generateOTP('send');
                                   //Send OTP service replaced by auto read
                                    $scope.enableDisableOTPorQuestion();
                                    // logic change after RSA implementation
                                    //$scope.readSMS('');
                                    $scope.hideOTPFlag = true;
                                      }
                                         else{
                                       $scope.limitAmountPatternFlag = true;
                                       }
                        }

                        }

                        else if($scope.billerProviderSelected.authenticatorCount != null ){

                            switch($scope.billerProviderSelected.authenticatorCount){

                                case 1 :
                                    if($scope.authenticator1===null || $scope.authenticator1==='' || $scope.check1===true ){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else{
                                        $scope.ConfirmBillerDetailsflg=true;
                                        $scope.hideOTPFlag = true;
                                        //$scope.generateOTP('send');
                                        //Send OTP service replaced by auto read
                                        $scope.enableDisableOTPorQuestion();
                                        // logic change after RSA implementation
                                        //$scope.readSMS('');
                                        $scope.OTPFlag = false;
                                    }

                                    break;

                                case 2 :
                                    if($scope.authenticator2===null || $scope.authenticator2==='' || $scope.check2===true ){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check2===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else{
                                        $scope.ConfirmBillerDetailsflg=true;
                                        $scope.hideOTPFlag = true;
                                        //$scope.generateOTP('send');
                                        //Send OTP service replaced by auto read
                                        $scope.enableDisableOTPorQuestion();
                                        // logic change after RSA implementation
                                        //$scope.readSMS('');
                                        $scope.OTPFlag = false;
                                    }

                                    break;
                                case 3 :
                                    if($scope.authenticator3===null || $scope.authenticator3==='' || $scope.check3===true ){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check2===true){
                                    $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check3===true){
                                    $scope.ConfirmBillerDetailsflg=false;
                                    }else{
                                        $scope.ConfirmBillerDetailsflg=true;
                                        $scope.OTPFlag = false;
                                        //$scope.generateOTP('send');
                                        //Send OTP service replaced by auto read
                                        $scope.enableDisableOTPorQuestion();
                                        // logic change after RSA implementation
                                        //$scope.readSMS('');
                                        $scope.hideOTPFlag = true;
                                    }

                                    break;
                                case 4:
                                    if($scope.authenticator4===null || $scope.authenticator4==='' || $scope.check4===true ){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check2===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check3===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check4===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else{
                                        $scope.ConfirmBillerDetailsflg=true;
                                        $scope.OTPFlag = false;
                                        //$scope.generateOTP('send');
                                        //Send OTP service replaced by auto read
                                        $scope.enableDisableOTPorQuestion();
                                        // logic change after RSA implementation
                                        //$scope.readSMS('');
                                        $scope.hideOTPFlag = true;
                                    }

                                    break;
                                case 5:
                                    if($scope.authenticator5===null || $scope.authenticator5==='' || $scope.check5===true ){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check2===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check3===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check4===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check5===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else{
                                        $scope.ConfirmBillerDetailsflg=true;
                                        $scope.OTPFlag = false;
                                        //$scope.generateOTP('send');
                                        //Send OTP service replaced by auto read
                                        $scope.enableDisableOTPorQuestion();
                                        // logic change after RSA implementation
                                        //$scope.readSMS('');
                                        $scope.hideOTPFlag = true;
                                    }
                                    break;

                            }

                        }else {

                            $scope.ConfirmBillerDetailsflg=true;
                            $scope.OTPFlag = false;
                            //$scope.generateOTP('send');
                            //Send OTP service replaced by auto read
                            $scope.enableDisableOTPorQuestion();
                            // logic change after RSA implementation
                            //$scope.readSMS('');
                            $scope.hideOTPFlag = true;
                        }

                    } else {


                        if($scope.billerNickName===null || $scope.billerNickName==='')
                            //$scope.errorMessage='Give this bill payment a nick name';
                        {

                        }else if($scope.billerCategorySelected===null || $scope.billerCategorySelected===''){

                            //$scope.errorMessage='You missed selecting Biller Category. Please select the same to go ahead';

                        }else if($scope.billerProviderSelected===null || $scope.billerProviderSelected===''){

                            //$scope.errorMessage='You missed selecting Biller Provider. Please select the same to go ahead';

                        }else if($scope.accountSelected===null || $scope.accountSelected===''){

                            //$scope.errorMessage='You missed selecting Account Number. Please select the same to go ahead';
								$scope.accountSelectedFlag = true;
                        }else if($scope.frequency===null || $scope.frequency===''){
								$scope.frequencySelectedFlag = true;
                            //$scope.errorMessage='You missed selecting Frequency. Please select the same to go ahead';

                        }else if($scope.fromDate===null || $scope.fromDate===''){

                            //$scope.errorMessage='You missed selecting Start Date. Please select the same to go ahead';

                        }else if($scope.toDate===null || $scope.toDate===''){

                            //$scope.errorMessage='You missed selecting End Date. Please select the same to go ahead';

                        }

                        /*else if($scope.amount!==''){
                                   var regex = new RegExp('^[0-9]*$');
                                   if($scope.amount.match(regex)){
                                     console.log("amount");
                                 }
                        }
*/
                         else if($scope.billerProviderSelected.authenticatorCount != null ){

                            switch($scope.billerProviderSelected.authenticatorCount){

                                case 1 :
                                    if($scope.authenticator1===null || $scope.authenticator1==='' || $scope.check1===true ){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else{
                                        $scope.ConfirmBillerDetailsflg=true;
                                        $scope.OTPFlag = false;
                                        //$scope.generateOTP('send');
                                        //Send OTP service replaced by auto read
                                        $scope.enableDisableOTPorQuestion();
                                        // logic change after RSA implementation
                                        //$scope.readSMS('');
                                        $scope.hideOTPFlag = true;
                                    }

                                    break;

                                case 2 :
                                    if($scope.authenticator2===null || $scope.authenticator2==='' || $scope.check2===true ){
                                        $scope.ConfirmBillerDetailsflg = false;
                                    }
                                    else if($scope.check2===true){
                                            $scope.ConfirmBillerDetailsflg=false;
                                        }else{
                                        $scope.ConfirmBillerDetailsflg=true;
                                        $scope.OTPFlag = false;
                                        //$scope.generateOTP('send');
                                        //Send OTP service replaced by auto read
                                        $scope.enableDisableOTPorQuestion();
                                        // logic change after RSA implementation
                                        //$scope.readSMS('');
                                        $scope.hideOTPFlag = true;
                                    }

                                    break;
                                case 3 :
                                    if($scope.authenticator3===null || $scope.authenticator3==='' || $scope.check3===true ){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check2===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check3===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else{
                                        $scope.ConfirmBillerDetailsflg=true;
                                        $scope.OTPFlag = false;
                                        //$scope.generateOTP('send');
                                        //Send OTP service replaced by auto read
                                        $scope.enableDisableOTPorQuestion();
                                        // logic change after RSA implementation
                                        //$scope.readSMS('');
                                        $scope.hideOTPFlag = true;
                                    }

                                    break;
                                case 4:
                                    if($scope.authenticator4===null || $scope.authenticator4==='' || $scope.check4===true ){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check2===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check3===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check4===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else{
                                        $scope.ConfirmBillerDetailsflg=true;
                                        $scope.OTPFlag = false;
                                        //$scope.generateOTP('send');
                                        //Send OTP service replaced by auto read
                                        $scope.enableDisableOTPorQuestion();
                                        // logic change after RSA implementation
                                        //$scope.readSMS('');
                                        $scope.hideOTPFlag = true;
                                    }

                                    break;
                                case 5:
                                    if($scope.authenticator5===null || $scope.authenticator5==='' || $scope.check5===true ){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check2===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check3===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check4===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check5===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else{
                                        $scope.ConfirmBillerDetailsflg=true;
                                        $scope.OTPFlag = false;
                                        //$scope.generateOTP('send');
                                        //Send OTP service replaced by auto read
                                        $scope.enableDisableOTPorQuestion();
                                        // logic change after RSA implementation
                                        //$scope.readSMS('');
                                        $scope.hideOTPFlag = true;
                                    }

                                    break;

                            }

                        }else {

                            $scope.ConfirmBillerDetailsflg=true;
                            $scope.OTPFlag = false;
                            //$scope.generateOTP('send');
                            //Send OTP service replaced by auto read
                            $scope.enableDisableOTPorQuestion();
                            // logic change after RSA implementation
                            //$scope.readSMS('');
                            $scope.hideOTPFlag = true;
                        }



                    }


                }else{

                    if($scope.setLimitAmtFlag === true){

                        $scope.ConfirmBillerDetailsflg=false;


                        if($scope.billerNickName===null || $scope.billerNickName==='')
                        {
                            //$scope.errorMessage='Give this bill payment a nick name';

                        }else if($scope.billerCategorySelected===null || $scope.billerCategorySelected===''){

                            //$scope.errorMessage='You missed selecting Biller Category. Please select the same to go ahead';

                        }else if($scope.billerProviderSelected===null || $scope.billerProviderSelected===''){

                            //$scope.errorMessage='You missed selecting Biller Provider. Please select the same to go ahead';

                        }else if($scope.accountSelected===null || $scope.accountSelected===''){

                            //$scope.errorMessage='You missed selecting Account Number. Please select the same to go ahead';
							$scope.accountSelectedFlag = true;
                        }else if($scope.fromDate===null || $scope.fromDate===''){

                            //$scope.errorMessage='You missed selecting Start Date. Please select the same to go ahead';

                        } 
						else if($scope.amount===null || $scope.amount===''){

                            //$scope.amountSelected='Pls set the limit for your bill'; // to check the amount

							$scope.limitAmountSelectedFlag = true;
                        }
                          else if($scope.amount !== ''){
                          if($scope.amount.length > 15){
                            $scope.limitAmountMaxlengthFlag = true;
                           }else{
                              $scope.limitAmountMaxlengthFlag = false;
                              $scope.limitAmountPatternFlag = false;
                             var regex = new RegExp('^[(0-9)]*[\.]?[(0-9)]*$');
                             if($scope.amount.match(regex)){
                              console.log("regex matched");
                              $scope.ConfirmBillerDetailsflg=true;
                               $scope.OTPFlag = false;
                                //$scope.generateOTP('send');
                                //Send OTP service replaced by auto read
                                $scope.enableDisableOTPorQuestion();
                                // logic change after RSA implementation
                                //$scope.readSMS('');
                                $scope.hideOTPFlag = true;
                             }
                                else{
                                 $scope.limitAmountPatternFlag = true;
                                 }
                                }
                            }
                         else if($scope.billerProviderSelected.authenticatorCount != null ){

                            switch($scope.billerProviderSelected.authenticatorCount){

                                case 1 :
                                    if($scope.authenticator1===null || $scope.authenticator1==='' || $scope.check1===true ){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else{
                                        $scope.ConfirmBillerDetailsflg=true;
                                        $scope.OTPFlag = false;
                                        //$scope.generateOTP('send');
                                        //Send OTP service replaced by auto read
                                        $scope.enableDisableOTPorQuestion();
                                        // logic change after RSA implementation
                                        //$scope.readSMS('');
                                        $scope.hideOTPFlag = true;
                                    }

                                    break;

                                case 2 :
                                    if($scope.authenticator2===null || $scope.authenticator2==='' || $scope.check2===true ){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check2===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else{
                                        $scope.ConfirmBillerDetailsflg=true;
                                        $scope.OTPFlag = false;
                                        //$scope.generateOTP('send');
                                        //Send OTP service replaced by auto read
                                        $scope.enableDisableOTPorQuestion();
                                        // logic change after RSA implementation
                                        //$scope.readSMS('');
                                        $scope.hideOTPFlag = true;
                                    }

                                    break;
                                case 3 :
                                    if($scope.authenticator3===null || $scope.authenticator3==='' || $scope.check3===true ){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check2===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check3===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else{
                                        $scope.ConfirmBillerDetailsflg=true;
                                        $scope.OTPFlag = false;
                                        //$scope.generateOTP('send');
                                        //Send OTP service replaced by auto read
                                        $scope.enableDisableOTPorQuestion();
                                        // logic change after RSA implementation
                                        //$scope.readSMS('');
                                        $scope.hideOTPFlag = true;
                                    }

                                    break;
                                case 4:
                                    if($scope.authenticator4===null || $scope.authenticator4==='' || $scope.check4===true ){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check2===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check3===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else{
                                        $scope.ConfirmBillerDetailsflg=true;
                                        $scope.hideOTPFlag = false;
                                    }

                                    break;
                                case 5:
                                    if($scope.authenticator5===null || $scope.authenticator5==='' || $scope.check1===true ){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check2===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check3===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else{
                                        $scope.ConfirmBillerDetailsflg=true;
                                        $scope.hideOTPFlag = false;
                                    }

                                    break;

                            }

                        }else {
                            $scope.ConfirmBillerDetailsflg=true;
                            $scope.OTPFlag = false;
                            //$scope.generateOTP('send');
                            //Send OTP service replaced by auto read
                            $scope.enableDisableOTPorQuestion();
                            // logic change after RSA implementation
                            //$scope.readSMS('');
                            $scope.hideOTPFlag = true;
                        }

                    } else {
                        if($scope.billerNickName===null || $scope.billerNickName==='')
                        {
                            //$scope.errorMessage='Give this bill payment a nick name';

                        }else if($scope.billerCategorySelected===null || $scope.billerCategorySelected===''){

                            //$scope.errorMessage='You missed selecting Biller Category. Please select the same to go ahead';

                        }else if($scope.billerProviderSelected===null || $scope.billerProviderSelected===''){

                            //$scope.errorMessage='You missed selecting Biller Provider. Please select the same to go ahead';

                        }
						else if($scope.accountSelected===null || $scope.accountSelected===''){

                            //$scope.errorMessage='You missed selecting Account Number. Please select the same to go ahead';
							$scope.accountSelectedFlag = true;
                        }else if($scope.fromDate===null || $scope.fromDate===''){

                            //$scope.errorMessage='You missed selecting Start Date. Please select the same to go ahead';

                        } else if($scope.billerProviderSelected.authenticatorCount != null ){

                            switch($scope.billerProviderSelected.authenticatorCount){

                                case 1 :
                                    if($scope.authenticator1===null || $scope.authenticator1==='' || $scope.check1===true ){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else{
                                        $scope.ConfirmBillerDetailsflg=true;
                                        $scope.OTPFlag = false;
                                        //$scope.generateOTP('send');
                                        //Send OTP service replaced by auto read
                                        $scope.enableDisableOTPorQuestion();
                                        // logic change after RSA implementation
                                        //$scope.readSMS('');
                                        $scope.hideOTPFlag = true;
                                    }

                                    break;

                                case 2 :
                                    if($scope.authenticator2===null || $scope.authenticator2==='' || $scope.check2===true ){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check2===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else{
                                        $scope.ConfirmBillerDetailsflg=true;
                                        $scope.OTPFlag = false;
                                        //$scope.generateOTP('send');
                                        //Send OTP service replaced by auto read
                                        $scope.enableDisableOTPorQuestion();
                                        // logic change after RSA implementation
                                        //$scope.readSMS('');
                                        $scope.hideOTPFlag = true;
                                    }

                                    break;
                                case 3 :
                                    if($scope.authenticator3===null || $scope.authenticator3==='' || $scope.check3===true ){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check2===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check3===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else{
                                        $scope.ConfirmBillerDetailsflg=true;
                                        $scope.OTPFlag = false;
                                        //$scope.generateOTP('send');
                                        //Send OTP service replaced by auto read
                                        $scope.enableDisableOTPorQuestion();
                                        // logic change after RSA implementation
                                        //$scope.readSMS('');
                                        $scope.hideOTPFlag = true;
                                    }

                                    break;
                                case 4:
                                    if($scope.authenticator4===null || $scope.authenticator4==='' || $scope.check4===true ){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check2===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else if($scope.check3===true){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else{
                                        $scope.ConfirmBillerDetailsflg=true;
                                        $scope.OTPFlag = false;
                                        //$scope.generateOTP('send');
                                        //Send OTP service replaced by auto read
                                        $scope.enableDisableOTPorQuestion();
                                        // logic change after RSA implementation
                                        //$scope.readSMS('');
                                        $scope.hideOTPFlag = true;
                                    }

                                    break;
                                case 5:
                                    if($scope.authenticator5===null || $scope.authenticator5==='' || $scope.check5===true ){
                                        $scope.ConfirmBillerDetailsflg=false;
                                    }else{
                                        $scope.ConfirmBillerDetailsflg=true;
                                        $scope.OTPFlag = false;
                                        //$scope.generateOTP('send');
                                        //Send OTP service replaced by auto read
                                        $scope.enableDisableOTPorQuestion();
                                        // logic change after RSA implementation
                                        //$scope.readSMS('');
                                        $scope.hideOTPFlag = true;
                                    }

                                    break;

                            }

                        }else {

                            $scope.ConfirmBillerDetailsflg=true;
                            $scope.OTPFlag = false;
                            //$scope.generateOTP('send');
                            //Send OTP service replaced by auto read
                            $scope.enableDisableOTPorQuestion();
                            // logic change after RSA implementation
                            //$scope.readSMS('');
                            $scope.hideOTPFlag = true;
                        }



                    }


                }





            }

        };
        /**
         * authenticator1 if  authenticator2 changes its regex will also changes on runtime.
         */
        $scope.$watch('authenticator1',function() {

            $scope.check1 =true;
			if(angular.isUndefined($scope.authenticator1)){
			 $scope.check1 =false;
			}
            var regex = new RegExp($scope.billerProviderSelected.authenticatorValidation1);
            if($scope.authenticator1.match(regex)){
                console.log("auth1Check");
                console.log($scope.billerProviderSelected.authenticatorValidation1);
                $scope.check1 =false;

            }

			if($scope.isClear1){
				$scope.check1 =false;
			}
			$scope.isClear1=false;
        },true);

        /**
         * authenticator2 if  authenticator2 changes its regex will also changes on runtime.
         */
        $scope.$watch('authenticator2',function() {

            $scope.check2 =true;
            if(angular.isUndefined($scope.authenticator2)){
			 $scope.check2 =false;
			}
			var regex = new RegExp($scope.billerProviderSelected.authenticatorValidation2);
            if($scope.authenticator2.match(regex)){
                console.log("auth2Check");
                console.log($scope.billerProviderSelected.authenticatorValidation2);
                $scope.check2 =false;

            }
			
			if($scope.isClear2){
				$scope.check2 =false;
			}
			$scope.isClear2=false;

        },true);

        /**
         * authenticator3 if  authenticator2 changes its regex will also changes on runtime.
         */
        $scope.$watch('authenticator3',function() {

            $scope.check3 =true;
            if(angular.isUndefined($scope.authenticator3)){
			 $scope.check3 =false;
			}
			var regex = new RegExp($scope.billerProviderSelected.authenticatorValidation3);
            if($scope.authenticator3.match(regex)){
                console.log("auth3Check");
                console.log($scope.billerProviderSelected.authenticatorValidation3);
                $scope.check3 =false;

            }
			
			if($scope.isClear3){
				$scope.check3 =false;
			}
			$scope.isClear3=false;
        },true);

        /**
         * authenticator4 if  authenticator2 changes its regex will also changes on runtime.
         */
        $scope.$watch('authenticator4',function() {

            $scope.check4 =true;
            if(angular.isUndefined($scope.authenticator4)){
			 $scope.check4 =false;
			}
			var regex = new RegExp($scope.billerProviderSelected.authenticatorValidation4);
            if($scope.authenticator4.match(regex)){
                console.log("auth3Check");
                console.log($scope.billerProviderSelected.authenticatorValidation4);
                $scope.check4 =false;

            }
			
			if($scope.isClear4){
				$scope.check4 =false;
			}
			$scope.isClear4=false;
			
        },true);

        /**
         * authenticator5 if  authenticator2 changes its regex will also changes on runtime.
         */
        $scope.$watch('authenticator5',function() {

            $scope.check5 =true;
            if(angular.isUndefined($scope.authenticator5)){
			 $scope.check5 =false;
			}
			var regex = new RegExp($scope.billerProviderSelected.authenticatorValidation5);
            if($scope.authenticator5.match(regex)){
                console.log("auth3Check");
                console.log($scope.billerProviderSelected.authenticatorValidation5);
                $scope.check5 =false;

            }
			
			if($scope.isClear5){
				$scope.check5 =false;
			}
			$scope.isClear5=false;
        },true);

         // handling for addbiller otp changes minor release 2.0
                 var count=0;
               		 $scope.resendfunction = function(){
               			 if(count== 3){

                            $scope.stop = true;
               			 ++count;
               		}
                      else
                      {
               		     ++count;
               			return count;
                           $scope.stop = false;
                      }

                	 }

               		   var count1=0;
               	 $scope.submitfunction = function(){

                          if(count1== 3){
               		  //alert("count1"+count1);
                            $scope.lockFieldsOTP = true;
               			 $scope.stop = true;

                      }
                      else
                      {
                           $scope.lockFieldsOTP = false;
                      }

               	}
               	 //close handling for addbiller otp changes minor release 2.0
        /**
         * generateOTP to generate OTP on click of submit button
         * @param value
         */
        $scope.generateOTP = function(value)
        {
           $scope.errorSpin = true;
            var resendOTP = null;

            var generateOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.generateOTPServiceEndPoint, {
                servicesPath: lpPortal.root
            });
            if (value === 'resend') {
                resendOTP = true;
            }else{
                resendOTP = false;
            }
            var postData = {
                'resendOTP': resendOTP
            };

            postData = $.param(postData || {});

            var xhr = $http({
                method: 'POST',
                url: generateOTPServiceURL,
                data: postData,
                headers: { 'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });

            /* Check whether the HTTP Request is successful or not. */
            xhr.success(function (data) {
             $scope.errorSpin = false;
             $scope.hideOTPFlag = false;
             $scope.showButton = false;
               /* $scope.success = {
                    happened: true,
                    msg: OTP_SUCCESS_MESSAGE
                };
                $scope.error = {
                    happened: false,
                    msg: ''
                };*/
                 // handling for addbiller otp changes minor release 2.0
                                	if(count < 4)
                                		{
                                			$scope.success = {
                                							    	happened: true,
                                									msg: OTP_SUCCESS_MESSAGE
                                								};
                                								$scope.error = {
                                									happened: false,
                                									msg: ''
                                								};
                                						}


                                					if(count== 4)
                                						{
                                					$scope.success =
                                					{
                                						happened: false,
                                						msg: ''
                                					};

                                					$scope.error =
                                					{
                                						happened: true,
                                						msg: 'We have tried 5 times to send you a code.'
                                                    };
                                					}
                               //close handling for addbiller otp changes minor release 2.0
                $scope.customerMob = data.mobileNumber;
                if ((typeof $scope.customerMob !== 'undefined') && ($scope.customerMob !== null)){
                    $scope.customerMobMasked = 'XXXXXX' + $scope.customerMob.substr($scope.customerMob.length - 4);
                    //$scope.OTPFlag = false;
                    $scope.lockFields = true;
                }
            }).error(function(data, status, headers, config) {
                $scope.errorSpin = false;
                //added for 5 times otp close popup
                gadgets.pubsub.publish("stopReceiver",{
                	data:"Stop Reading OTP"
                });
                if(data.cd && data.cd === '501') {
                    // If session timed out, redirect to login page
                    //checkTimeout(data);
                    // If service not available, set error flag
                    //$scope.serviceErrorAPIN = checkGlobalError(data);
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error', false);
                }
                $scope.error = {
                    happened: true,
                    msg: data.rsn
                };
                $scope.success = {
                    happened: false,
                    msg: ''
                };
            });
        };


        /**
         *
         * @param isFormValid
         * @returns {boolean}
         */
        $scope.verifyOTP = function(isFormValid)
        {
            if(!isFormValid) {
                return false;
            }

            var verifyOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.verifyOTPServiceEndPoint, {
                servicesPath: lpPortal.root
            });

            var postData = {
                'otpValue': $scope.controlPass.otpValue,
                'requestType': 'verifyOTP'
            };

            postData = $.param(postData || {});

            var xhr = $http({
                method: 'POST',
                url: verifyOTPServiceURL,
                data: postData,
                headers: { 'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });

            /* Check whether the HTTP Request is successful or not. */
            xhr.success(function (data) {

                $scope.controlPass.otpValue = '';
                $scope.OTPFlag = true;
                //$scope.addBiller();


            }).error(function(data, status, headers, config) {
                if(data.cd && data.cd === '501') {
                    // If session timed out, redirect to login page
                    //checkTimeout(data);
                    // If service not available, set error flag
                    //$scope.serviceErrorAPIN = checkGlobalError(data);
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error', false);
                }
                /*$scope.cancelTransaction = checkOTPError(data);*/
                $scope.error = {
                    happened: true,
                    msg: data.rsn
                };
                $scope.success = {
                    happened: false,
                    msg: ''
                };
            });
        };


        /**
         *  clearOTP method
         * @desc clears OTP form
         */
        $scope.clearOTP = function (){
            $scope.controlPass.otpValue = '';
        };

        /**
         *  cancelOTP method
         * @desc cancel the transaction
         */
        $scope.cancelOTP = function () {
            if($scope.forms.OTPform) {
                $scope.forms.OTPform.$setPristine();
                $scope.forms.OTPform.submitted = false;
            }
            if($scope.forms.changeAPINForm) {
                $scope.forms.changeAPINForm.$setPristine();
                $scope.forms.changeAPINForm.submitted = false;
            }
            $scope.cancelTransaction = false;
            initialize();
        };
		
		$scope.manageBiller = function() {
                   // lpCoreBus.publish('launchpad-billPay.manage-biller');
            gadgets.pubsub.publish('launchpad-billPay.manage-biller');
               };

       
        // change events for date pickers
        $scope.changeFromDate = function() {
            var FromDate = $scope.fromDate;
        };

        // change events for date pickers
        $scope.changeFromTo = function() {
            tempFrom = new Date($scope.fromDate);
            tempFrom.setDate(tempFrom.getDate() - 1);

            tempTo = new Date($scope.toDate);
            tempTo.setDate(tempTo.getDate() + 1);

        };

        $scope.openFromCalendar = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.isOpenDate1 = true;
        };

        $scope.openToCalendar = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.isOpenDate2 = true;
        };



        $scope.partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partial';
$scope.template = {

    ConfirmBillerDetails: $scope.partialsDir + '/ConfirmBillerDetails.html',
    SuccessAddBiller: $scope.partialsDir + '/SuccessAddBiller.html'

                };

        
        // Widget Refresh code
        var deckPanelOpenHandler;

        deckPanelOpenHandler = function(activePanelName) {
            if (activePanelName === lpWidget.parentNode.model.name) {
                lpCoreBus.flush('DeckPanelOpen');
                lpCoreBus.unsubscribe('DeckPanelOpen', deckPanelOpenHandler);
                lpWidget.refreshHTML(function(bresView){
                    lpWidget.parentNode = bresView.parentNode;
                });
            }
        };

        lpCoreBus.subscribe('DeckPanelOpen', deckPanelOpenHandler);
        // Widget Refresh code

        initialize();
        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
             gadgets.pubsub.publish("device.GoBack");
         });
   /*  } */
 }
    /**
     * Export Controllers
     */
exports.addBillerCtrl = addBillerCtrl;
});
