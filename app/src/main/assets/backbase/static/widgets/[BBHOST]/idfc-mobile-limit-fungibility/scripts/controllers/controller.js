/**
 * Controllers
 * @module controllers
 */
define(function(require, exports) {

    'use strict';


    var $ = require('jquery');
    var uislider = require('uislider');
    var roundslider = require('roundslider');
    var angular = require('base').ng;
    var IdfcError = require('idfcerror');
    var IdfcConstants = require('idfccommon');
    var angularSwitch = require('uiSwitch');
    var angularTouch = require('angular-touch');
    //var idfcErrorSpin = require('idfc-error-spin');
    var idfcHanlder = require('idfcerror');
    //Xebia Refactoring
    var d3 = require('d3');
    var piechart  = require('n3-pie-chart');
    //Xebia Refactoring ends

    /**
     * Main controller
     * @ngInject
     * @constructor
     */
    exports.LimitFungibilityController = function($scope, lpCoreUtils, lpWidget, $timeout, lpCoreBus, $http, limitFungibilityService, lpPortal, httpService,
        IdfcUtils, $filter, $window,$interval, CQService) {

        //*****************local variables****************//
        $scope.data = [{
                label: "25%",
                value: 25,
                color: "#00ff00"
            }, {
                label: "",
                value: 75,
                color: "#aaaaaa"
            }

        ];

        $scope.options = {
            thickness: 7
        };

        $scope.arrowImagePath = "";
        $scope.atmImagePath = "";
        $scope.purchaseImagePath = "";

        $scope.otpScreenToBeHidden = true;

        $scope.data1 = [{
                label: "25%",
                value: 25,
                color: "#00ff00"
            }, {
                label: "",
                value: 75,
                color: "#aaaaaa"
            }

        ];
        $scope.options1 = {
            thickness: 7
        };

        $scope.transactionType = '';

        $scope.operationType = '';
		
        var limitMgmtCtrl = this;

        var sliderUpdtCount = 0;
        var vOldOnOffSwitchValue;
        var vNewOnOffSwitchValue;
        var atmDomSlider = document.getElementById('atmSliderD');
        var atmIntnlSlider = document.getElementById('atmSliderI');
        var prchsDomSlider = document.getElementById('prchsSliderD');
        var prchsIntSlider = document.getElementById('prchsSliderI');
        console.log("atmDomSlider :: " + atmDomSlider + " || atmIntnlSlider :: " + atmIntnlSlider + " || prchsDomSlider :: " + prchsDomSlider + " || prchsIntSlider :: " + prchsIntSlider);

        var customerMob;

        $scope.atmTabActive = true;
        $scope.purchaseTabActive = false;
        $scope.initialPageLoad = true;

        // RSA changes by Xebia start
        limitMgmtCtrl.cqObject = CQService;
        var getChallengeQuestionUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
            .getPreference('getCQUrl'));
        var verifyCQAnswerUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
            .getPreference('verifyCQAnswerUrl'));
        // to fetch mobile specific data
           /* gadgets.pubsub.publish("getMobileSdkData");
            gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
              $scope.mobileSdkData = response.data;
            });*/
              var globalPreferences   = cxp.mobile.plugins['GlobalVariables']; //3.6 change
                                            if (globalPreferences) {
                                                           var rsaSuccessCallback = function(data) {
                                                               var rsaObj = data['rsaData'];
                                                                var rsaJson = JSON.parse(rsaObj);
                                                                $scope.mobileSdkData = rsaJson.data;
                                                           };
                                                           var rsaErrorCallback = function(data) {
                                                               console.log('Something really bad happened');
                                                           };
                                                           globalPreferences.getRSAObject(
                                                               rsaSuccessCallback,
                                                               rsaErrorCallback
                                                           );
                                                       } else {
                                                           console.log('Cant find Plugin');
                                                       }
        // RSA changes by Xebia ends

        $scope.updateEventTriggerCountForSlider = 0;

        var partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partial';

        limitMgmtCtrl.templates = {
            switchConfirmTemplate: partialsDir + '/switchConfirm.html'
        };

        var commonPath = lpCoreUtils.getWidgetBaseUrl(lpWidget); //'static/idfc/banking/widgets/idfc-block-card';//lpCoreUtils.getWidgetBaseUrl(lpWidget);
        console.log('commonPath ' + commonPath);
        $scope.arrowImagePath = commonPath + '/media/arrow.png';
        $scope.atmImagePath = commonPath + '/media/atm-icon.png';
        $scope.purchaseImagePath = commonPath + '/media/purchase.png';
        console.log('arrowImagePath ' + $scope.arrowImagePath);
        console.log('atmImagePath ' + $scope.atmImagePath);
        console.log('purchaseImagePath ' + $scope.purchaseImagePath);
        console.log();

        var generateOTPEndPoint = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('generateOTPService'), {
            servicesPath: lpPortal.root
        });

        var limitChangeEndPoint = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('IntlimitDataSrc'), {
            servicesPath: lpPortal.root
        });

        var urlcardLimit = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('CardLimitingSrc'), {
            servicesPath: lpPortal.root
        });

        var enquirCardEndPoint = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('cardDetailsSrc'), {
            servicesPath: lpPortal.root
        });

        var rsaAnalyzeService = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference("rsaAnalyzeService"), {
            servicesPath: lpPortal.root
        });

        limitMgmtCtrl.limitExcdAtmMsg = false;
        limitMgmtCtrl.limitExcdPrchsMsg = false;

        var setdeviceprint = function() {
            return encode_deviceprint();
        };
		
		limitMgmtCtrl.changCardData = function(chkFlg) { // changed - function defined before use
            $('.updateLimitBtn').hide();
            sliderUpdtCount = 1;
            limitMgmtCtrl.debitCardNum = $scope.detail[limitMgmtCtrl.dbtnmcount].crdNb;
            limitMgmtCtrl.cardAccntNum = $scope.detail[limitMgmtCtrl.dbtnmcount].acctDtls[0].acctNb;
            limitMgmtCtrl.cardEnd = maskCardNo(limitMgmtCtrl.debitCardNum);


            //Start of code added by Arnab
            limitMgmtCtrl.expryDt = $scope.detail[limitMgmtCtrl.dbtnmcount].expryDt;

            limitMgmtCtrl.cardName = $scope.detail[limitMgmtCtrl.dbtnmcount].cardName;

            limitMgmtCtrl.cstmrNm = $scope.detail[limitMgmtCtrl.dbtnmcount].cstmrNm;



            //Start of code added by Arnab

            limitMgmtCtrl.cashDomLmt = $scope.detail[limitMgmtCtrl.dbtnmcount].cashDomLmt;
            limitMgmtCtrl.cashIntLmt = $scope.detail[limitMgmtCtrl.dbtnmcount].cashIntLmt;
            limitMgmtCtrl.purDomLmt = $scope.detail[limitMgmtCtrl.dbtnmcount].purDomLmt;
            limitMgmtCtrl.purIntLmt = $scope.detail[limitMgmtCtrl.dbtnmcount].purIntLmt;

            limitMgmtCtrl.atmLimit = +limitMgmtCtrl.cashDomLmt + +limitMgmtCtrl.cashIntLmt;
            limitMgmtCtrl.purchaseLimit = +limitMgmtCtrl.purDomLmt + +limitMgmtCtrl.purIntLmt;

            limitMgmtCtrl.aodLmt = $scope.detail[limitMgmtCtrl.dbtnmcount].aodLmt;
            limitMgmtCtrl.aoiLmt = $scope.detail[limitMgmtCtrl.dbtnmcount].aoiLmt;
            limitMgmtCtrl.podLmt = $scope.detail[limitMgmtCtrl.dbtnmcount].podLmt;
            limitMgmtCtrl.poiLmt = $scope.detail[limitMgmtCtrl.dbtnmcount].poiLmt;

            limitMgmtCtrl.cardaodLmt = limitMgmtCtrl.aodLmt;
            limitMgmtCtrl.cardaoiLmt = limitMgmtCtrl.aoiLmt;
            limitMgmtCtrl.dcplimitValue = limitMgmtCtrl.podLmt;
            limitMgmtCtrl.dcplimitValue1 = limitMgmtCtrl.poiLmt;

            setSlider();
            //limitMgmtCtrl.showSwitch = ($scope.detail[limitMgmtCtrl.dbtnmcount].cardOnlyDomestic == 'Y' ? false : true);
            $scope.showOrHideIntSwitch(limitMgmtCtrl.dbtnmcount);
            setMaxLimit();

            if (chkFlg) {
                limitMgmtCtrl.intlmtswtch = $scope.detail[limitMgmtCtrl.dbtnmcount].intlLmtSwtch;
                limitBtnSwitch();
				limitMgmtCtrl.chkUpdateCount;
                
                //$scope.enableOrDisableIntSlider();
            } else {
                setSlider();
            }
            limitMgmtCtrl.checkFlgOff();

        }
		
		limitMgmtCtrl.chkUpdateCount = function() { // Changed - function defined before use

            if (sliderUpdtCount == '0') {
                limitMgmtCtrl.createSliders('atmSliderD', 'getAtmD', limitMgmtCtrl.aodLmt, limitMgmtCtrl.atmLimit, limitMgmtCtrl.intlmtswtch);
                limitMgmtCtrl.createSliders('atmSliderI', 'getAtmI', limitMgmtCtrl.aoiLmt, limitMgmtCtrl.atmLimit, limitMgmtCtrl.intlmtswtch);
                limitMgmtCtrl.createSliders('prchsSliderD', 'getPrchsD', limitMgmtCtrl.podLmt, limitMgmtCtrl.purchaseLimit, limitMgmtCtrl.intlmtswtch);
                limitMgmtCtrl.createSliders('prchsSliderI', 'getPrchsI', limitMgmtCtrl.poiLmt, limitMgmtCtrl.purchaseLimit, limitMgmtCtrl.intlmtswtch);
                $scope.initialPageLoad = false;
            } else {


                setSlider();
                limitBtnSwitch();

            }

        }
		
		limitMgmtCtrl.checkFlgOff = function() { // Changed - function defined before use
            if (!limitMgmtCtrl.IntOnOff) {


                if (limitMgmtCtrl.aoiLmt > 0 && (+limitMgmtCtrl.aodLmt + +limitMgmtCtrl.aoiLmt) >= (limitMgmtCtrl.atmLimit) && $scope.atmTabActive && $scope.updateEventTriggerCountForSlider > 4 && !$scope.initialPageLoad) {
                    limitMgmtCtrl.AtmLimitNote = true;
                     $window.scrollTo(0,100);
                } else {
                    limitMgmtCtrl.AtmLimitNote = false;
                }

                if (limitMgmtCtrl.poiLmt > 0 && (+limitMgmtCtrl.podLmt + +limitMgmtCtrl.poiLmt) >= (limitMgmtCtrl.purchaseLimit) && $scope.purchaseTabActive && $scope.updateEventTriggerCountForSlider > 4 && !$scope.initialPageLoad) {
                    limitMgmtCtrl.prchaseLimitNote = true;
                     $window.scrollTo(0,100);
                } else {
                    limitMgmtCtrl.prchaseLimitNote = false;
                }

            } else {
                limitMgmtCtrl.AtmLimitNote = false;
                limitMgmtCtrl.prchaseLimitNote = false;
            }
        }

        $scope.keydownevt_domestic = function () {
            limitMgmtCtrl.updateSliderValue('atmSliderD','getAtmD');
        }

		$scope.keydownevt_international = function () {
            limitMgmtCtrl.updateSliderValue('atmSliderI','getAtmI');
        }

        $scope.keydownevt_domesticpurchase = function () {
            limitMgmtCtrl.updateSliderValue('prchsSliderD','getPrchsD');
        }

        $scope.keydownevt_internationalpurchase = function () {
            limitMgmtCtrl.updateSliderValue('prchsSliderI','getPrchsI');
        }


		limitMgmtCtrl.updateSliderValue = function(sliderName, modelName){ // trigger on textbox change
			var value = this[modelName];
			var maxValue = 0;//limitMgmtCtrl['maxValue_' + modelName]; //  Get corresponding max value
			limitMgmtCtrl.changeAtmPurchsLimit(modelName, value); // This function updates limits according to percentage
			if (sliderName == 'atmSliderD'){ //  Get corresponding max value
				 maxValue = limitMgmtCtrl.aodLmt;
			} 
			else if (sliderName == 'atmSliderI'){
				maxValue = limitMgmtCtrl.aoiLmt;
			} 
			else if(sliderName == 'prchsSliderD') {
				maxValue = limitMgmtCtrl.podLmt;
			} 
			else if (sliderName == 'prchsSliderI') {
				maxValue = limitMgmtCtrl.poiLmt;
			}
			console.clear();
			console.log("Max value", maxValue);
			if (parseInt(value) < 0 || value==null){
				value = 0;
				console.log("Less than min, so value is : ", value);
			}
			else if (parseInt(value) > parseInt(maxValue)){ // maxValue gets set to last entered valid slider value - verify if this is the correct flow
				value = parseInt(maxValue);
				console.log("Greater than max, so value is : ", value, parseInt(maxValue));
			}
			else {
				value = limitMgmtCtrl.roundToNearestHundred(value);
				console.log("Within range, so value is : ", value);
			}
			this[modelName] = value; // set textbox
			var slider = document.getElementById(sliderName);
			console.log(slider.noUiSlider.options.range.max);
			slider.noUiSlider.set([value]); // set slider
			//console.log(slider.noUiSlider.options.range);
		}
		
		limitMgmtCtrl.roundToNearestHundred = function(value) { // round value to nearest hundred and return
			if (value % 100 != 0) { 
				var currHundred = parseInt(value/100);
				value = (currHundred + 1) * 100;
			}
			return value;
		}

        //*****************local functions****************//
        var initialize = function() {
            $scope.updateEventTriggerCountForSlider = 0;
            $scope.initialPageLoad = true;
            idfcHanlder.validateSession($http);

            var intSlider = $("#atmSliderI");
            if (angular.isDefined(intSlider)) {
                $("#atmSliderI").attr("disabled", "disabled");
				$("#txtAtmI").attr("disabled", "disabled");
            }
            limitMgmtCtrl.limitExcdAtmMsg = false;
            limitMgmtCtrl.limitExcdPrchsMsg = false;

            limitMgmtCtrl.hideOTPFlag = true;
            limitMgmtCtrl.updteLimitFlg = false;
            $('.updateLimitBtn').hide();
            limitMgmtCtrl.ModalhideOTPFlag = false;
            limitMgmtCtrl.dcmsAndCrmError = {
                happened: false,
                msg: ''
            };
            limitMgmtCtrl.cardLimitSuccess = {
                happened: false,
                msg: ''
            };

            limitMgmtCtrl.modalSwitchChange = false;
            limitMgmtCtrl.dbtnmcount = 0;

            getLimit();
            cardcwlimit();
            cardprcslimit();

            // RSA changes by Xebia start
            limitMgmtCtrl.showSetupCQMessage = false;
            limitMgmtCtrl.showCancelTransactionMessage = false;
            limitMgmtCtrl.challengeQuestion={};
            limitMgmtCtrl.showCQError = "";
            limitMgmtCtrl.challengeQuestionCounter = 0;
            limitMgmtCtrl.showDenyMessage = false;
            limitMgmtCtrl.showWrongAnswerMessage = false;
            // RSA changes by Xebia ends

			
            var request = $http({
                method: 'GET',
                url: enquirCardEndPoint,
                data: null,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });

            request.success(function(data, status, headers, config) {
				
				console.log("Data :: " + JSON.stringify(data));
                //limitMgmtCtrl.serviceError = false;
                var bodyDiv = $('#bodyDiv');
                if(angular.isDefined(bodyDiv)){
                    $('#bodyDiv').show();
                }
                $scope.detail = [];
                if (data != undefined && data != null && $.trim(data) != '' && data.crdDtls != undefined && data.crdDtls != null && $.trim(data.crdDtls) != '') {
                    var detailCount = 0;


                    for (var i = 0; i < data.crdDtls.length; i++) {
                       if (data.crdDtls[i].crdSts == 'ACTIVE')
                       {
                                $scope.detail[detailCount] = data.crdDtls[i];
                                $scope.detail[detailCount].crdSts = 'Active';
                                detailCount = detailCount + 1;
                       }
                    }
                }

                if ($scope.detail.length >= 1) {
                    //$scope.detail = data.crdDtls;
                    $scope.maskAccountNo($scope.detail);
                    //$scope.changeStatusFormat($scope.detail);   //method call for change status format
                    for (var i = 0; i < $scope.detail.length; i++) {
                        for (var innerCount = 0; innerCount < $scope.detail[i].acctDtls.length; innerCount++) {
                            $scope.detail[i].acctDtls[innerCount].acctNb = $scope.detail[i].acctDtls[innerCount].acctNb.replace(/^0+/, '');
                        }
                    }
                    limitMgmtCtrl.rightArrowLock = true;

                    if ($scope.detail.length == 1) {
                        limitMgmtCtrl.rightArrowLock = false;
                        limitMgmtCtrl.leftArrowLock = false;
                    }

                    limitMgmtCtrl.debitCardNum = $scope.detail[0].crdNb;
                    limitMgmtCtrl.cardEnd = maskCardNo(limitMgmtCtrl.debitCardNum);
                    limitMgmtCtrl.cashDomLmt = $scope.detail[0].cashDomLmt;
                    limitMgmtCtrl.cashIntLmt = $scope.detail[0].cashIntLmt;
                    limitMgmtCtrl.purDomLmt = $scope.detail[0].purDomLmt;
                    limitMgmtCtrl.purIntLmt = $scope.detail[0].purIntLmt;
                    limitMgmtCtrl.atmLimit = +limitMgmtCtrl.cashDomLmt + +limitMgmtCtrl.cashIntLmt;
                    limitMgmtCtrl.purchaseLimit = +limitMgmtCtrl.purDomLmt + +limitMgmtCtrl.purIntLmt;

                    limitMgmtCtrl.aodLmt = $scope.detail[0].aodLmt;
                    limitMgmtCtrl.aoiLmt = $scope.detail[0].aoiLmt;
                    limitMgmtCtrl.podLmt = $scope.detail[0].podLmt;
                    limitMgmtCtrl.poiLmt = $scope.detail[0].poiLmt;
                    limitMgmtCtrl.cardAccntNum = $scope.detail[0].acctDtls[0].acctNb;
                    limitMgmtCtrl.intlmtswtch = $scope.detail[0].intlLmtSwtch;

                    //Start of code added by Arnab
                    limitMgmtCtrl.expryDt = $scope.detail[0].expryDt;

                    limitMgmtCtrl.cardName = $scope.detail[0].cardName;

                    limitMgmtCtrl.cstmrNm = $scope.detail[0].cstmrNm;



                    //Start of code added by Arnab
                    limitMgmtCtrl.cardaodLmt = limitMgmtCtrl.aodLmt;
                    limitMgmtCtrl.cardaoiLmt = limitMgmtCtrl.aoiLmt;
                    limitMgmtCtrl.dcplimitValue = limitMgmtCtrl.podLmt;
                    limitMgmtCtrl.dcplimitValue1 = limitMgmtCtrl.poiLmt;

                    limitMgmtCtrl.errorSpin = false;

                    //limitMgmtCtrl.showSwitch = ($scope.detail[0].cardOnlyDomestic == 'Y' ? false : true);
                    $scope.showOrHideIntSwitch(0);
                    setMaxLimit();
                    limitBtnSwitch();
                    limitMgmtCtrl.chkUpdateCount();
                    limitMgmtCtrl.checkFlgOff();



                    //limitMgmtCtrl.canShowUpdateLimitButton = true;

                } else if ($scope.detail.length === 0) {

                    limitMgmtCtrl.cardEnquiryErr = {
                        happened: true,
                        msg: 'Limits can be changed only for active cards, please get your card activated or reissued if it is blocked permanently.'
                    };
                    limitMgmtCtrl.errorSpin = false;
                    limitMgmtCtrl.serviceError = true;
                }

                limitMgmtCtrl.atmWidrwlTabActive();

            }).error(function(data, status, headers, config) {
                console.log("Error :: " + JSON.stringify(data));
                limitMgmtCtrl.errorSpin = false;
                limitMgmtCtrl.serviceError = true;

                if (data.cd === '302') {
                    limitMgmtCtrl.cardEnquiryErr = {
                        happened: true,
                        msg: 'Limits can be changed only for active cards, please get your card activated or reissued if it is blocked permanently.'
                    };
                } else {
                    limitMgmtCtrl.cardEnquiryErr = {
                        happened: true,
                        msg: IdfcConstants.TECHNICAL_ERROR
                    };
                }
            });
            $scope.initializeSwitchOnOffValues();
            $scope.startTimer();
        }

        $scope.showOrHideIntSwitch=function(index){
                console.log($scope.detail[index].cardOnlyDomestic);
                if(($scope.detail[index].cardOnlyDomestic == 'Y') ||($scope.detail[index].cardOnlyDomestic == 'true')
                || ($scope.detail[index].cardOnlyDomestic == true)){
                    limitMgmtCtrl.showSwitch = false;// ($scope.detail[0].cardOnlyDomestic == 'Y' ? false : true);
                }
               if(($scope.detail[index].cardOnlyDomestic == 'N') ||($scope.detail[0].cardOnlyDomestic == 'false')
                   || ($scope.detail[index].cardOnlyDomestic == false)){
                     limitMgmtCtrl.showSwitch = true;// ($scope.detail[0].cardOnlyDomestic == 'Y' ? false : true);
               }

        }

        $scope.startTimer = function(){
           $interval(function(){
                $scope.currentSwitchOnOffValue = limitMgmtCtrl.IntOnOff;
                if($scope.currentSwitchOnOffValue !== $scope.previousSwitchOnOffValue){
                    $scope.setEnableStatusOfIntSlider();
                }
                $scope.previousSwitchOnOffValue = $scope.currentSwitchOnOffValue;
            },500);
        }

        $scope.initializeSwitchOnOffValues = function(){
            $scope.currentSwitchOnOffValue = limitMgmtCtrl.IntOnOff;
            $scope.previousSwitchOnOffValue = limitMgmtCtrl.IntOnOff;
        }

        $scope.enableOrDisableIntSlider = function() {
           console.log('Within enableOrDisableIntSlider function');
             $scope.initializeSwitchOnOffValues();
           $scope.setEnableStatusOfIntSlider();
            if(!$scope.otpScreenToBeHidden){
                limitMgmtCtrl.buttonchange(limitMgmtCtrl.IntOnOff);
            }else{
                $scope.otpScreenToBeHidden = false;
            }
            $('.updateLimitBtn').hide();

        }


        $scope.setEnableStatusOfIntSlider=function(){
           console.log('Within setEnableStatusOfIntSlider function');
           //$scope.hideSpinner();
            var intATMSlider = $('#atmSliderI');
            var intPurchaseSlider = $('#prchsSliderI');
            // $scope.switchOn = !$scope.switchOn;
            console.log('Switch On ::' + limitMgmtCtrl.IntOnOff);
            if (angular.isDefined(intATMSlider) && angular.isDefined(intPurchaseSlider)) {
                console.log('Slider found');
                if (limitMgmtCtrl.IntOnOff) {
                    if ($scope.atmTabActive) {
                        $('#atmSliderI').removeAttr('disabled');
						$('#txtAtmI').removeAttr('disabled'); // enable corresponding textbox
                        $('#atmSliderI').find("div[class*='noUi-handle-lower']").removeClass('noUi-handle-Grey');
                        $('#atmSliderI').find("div[class*='noUi-handle-lower']").addClass('noUi-handle');
                    }

                    //$('#atmSliderI').removeClass('noUi-handle-Grey');
                    // $('#atmSliderI').addClass('noUi-handle');

                    if ($scope.purchaseTabActive) {
                        $('#prchsSliderI').removeAttr('disabled');
						$('#txtPrchsI').removeAttr('disabled'); // enable corresponding textbox
                        $('#prchsSliderI').find("div[class*='noUi-handle-lower']").removeClass('noUi-handle-Grey');
                        $('#prchsSliderI').find("div[class*='noUi-handle-lower']").addClass('noUi-handle');
                    }


                    //$('#prchsSliderI').removeClass('noUi-handle-Grey');
                    // $('#prchsSliderI').addClass('noUi-handle');
                    console.log('noUi-handle-Grey  changed to noUi-handle');
                } else {
                    if ($scope.atmTabActive) {
                        $('#atmSliderI').attr('disabled', 'disabled');
						$('#txtAtmI').attr('disabled', 'disabled'); // disable corresponding textbox
                        $('#atmSliderI').find("div[class*='noUi-handle-lower']").removeClass('noUi-handle');
                        $('#atmSliderI').find("div[class*='noUi-handle-lower']").addClass('noUi-handle-Grey');
                    }
                    if ($scope.purchaseTabActive) {
                        $('#prchsSliderI').attr('disabled', 'disabled');
						$('#txtPrchsI').attr('disabled', 'disabled'); // disable corresponding textbox
                        $('#prchsSliderI').find("div[class*='noUi-handle-lower']").removeClass('noUi-handle');
                        $('#prchsSliderI').find("div[class*='noUi-handle-lower']").addClass('noUi-handle-Grey');
                    }

                    // $('#atmSliderI').removeClass('noUi-handle');
                    //$('#atmSliderI').addClass('noUi-handle-Grey');

                    //$('#prchsSliderI').removeClass('noUi-handle');
                    //$('#prchsSliderI').addClass('noUi-handle-Grey');
                    console.log('noUi-handle  changed to noUi-handle-Grey');
                }
            }

        }

        limitMgmtCtrl.atmWidrwlTabActive = function() {
            console.log('Inside atmWidrwlTabActive function');
            $scope.updateEventTriggerCountForSlider = 0;
            $scope.otpScreenToBeHidden = true;
            $scope.atmTabActive = true;
            $scope.purchaseTabActive = false;
            limitMgmtCtrl.changCardData(true);
            limitMgmtCtrl.atmWidrwlTabLock = true;
            limitMgmtCtrl.purchseTabLock = false;
            limitMgmtCtrl.hideOTPFlag = true;
            limitMgmtCtrl.updteLimitFlg = false;

            $('.updateLimitBtn').hide();
            document.getElementById("MyElement").className = "active";
            document.getElementById("MyElement1").className = document.getElementById("MyElement1").className.replace(/(?:^|\s)active(?!\S)/g, '')

            $('#dbtprchsLimitMeter .rs-tooltip').css({
                "margin-top": "-17%",
                "margin-left": "-22%"
            });
            $('#dbtcwLimitMeter .rs-tooltip').css({
                "margin-top": "-17%",
                "margin-left": "-22%"
            });
            $scope.initializeSwitchOnOffValues();
            $scope.enableOrDisableIntSlider();

        }

        limitMgmtCtrl.purchseTabActive = function() {
            console.log('Inside purchseTabActive function');
            $scope.updateEventTriggerCountForSlider = 0;
            $scope.otpScreenToBeHidden = true;
            $scope.atmTabActive = false;
            $scope.purchaseTabActive = true;
            limitMgmtCtrl.changCardData(true);
            limitMgmtCtrl.atmWidrwlTabLock = false;
            limitMgmtCtrl.purchseTabLock = true;
            limitMgmtCtrl.hideOTPFlag = true;
            limitMgmtCtrl.updteLimitFlg = false;
            $('.updateLimitBtn').hide();
            document.getElementById("MyElement").className = document.getElementById("MyElement").className.replace(/(?:^|\s)active(?!\S)/g, '')
            document.getElementById("MyElement1").className = "active";
		
			

            $('#dbtprchsLimitMeter .rs-tooltip').css({
                "margin-top": "-17%",
                "margin-left": "-22%"
            });
            $('#dbtcwLimitMeter .rs-tooltip').css({
                "margin-top": "-17%",
                "margin-left": "-22%"
            });
            $scope.initializeSwitchOnOffValues();
            $scope.enableOrDisableIntSlider();

        }


        limitMgmtCtrl.createSliders = function(sliderId, spanId, initVal, maxLimit, limitSwitch) {
			console.log("MAXX",maxLimit);
			limitMgmtCtrl['maxValue_' + spanId] = maxLimit; // set scope variables for max limit of textbox assoiated with slider
            var slider = document.getElementById(sliderId);
            noUiSlider.create(slider, {
                start: [parseInt(initVal)],
                step: 100,
                range: {
                    min: [0],
                    max: [maxLimit]
                },
                tooltips: false,
                animate: false
                // slide: function(event, ui) { 
					// //$(ui.handle).find('span').text('$' + ui.value);
				// }
            });

            slider.noUiSlider.on("update", function(v, h, u, t, p) {
                console.log('Inside slider update', spanId);
				
                var value = v[h];
                value = Number(value).toFixed(0);
                var showAmount = $filter('currency')(value, '&#8377;&nbsp;', '0');
				limitMgmtCtrl[spanId] = parseInt(value); // update textbox model - this will take care of setting initVal on textbox too
                // //document.getElementById(spanId).innerHTML = showAmount.replace('.00', ''); //$filter('currency')(value,'&#8377;&nbsp;','0'); // Changed - the label no lnger exists
                limitMgmtCtrl.hideOTPFlag = true;
                limitMgmtCtrl.updteLimitFlg = true;
                $('.updateLimitBtn').show(); 

                limitMgmtCtrl.changeAtmPurchsLimit(spanId, value);
            });
        }


        function limitBtnSwitch() {
            if (limitMgmtCtrl.intlmtswtch == 'Y') {
                limitMgmtCtrl.IntOnOff = true;
                limitMgmtCtrl.intLimitLock = false;
                if(angular.isDefined(atmIntnlSlider)){
                    atmIntnlSlider.removeAttribute('disabled');
					$('#txtAtmI').removeAttr('disabled'); // enable corresponding textbox
                }
                if(angular.isDefined(prchsIntSlider)){
                    prchsIntSlider.removeAttribute('disabled');
					$('#txtPrchsI').removeAttr('disabled'); // enable corresponding textbox
                }
                //$scope.enabled = true;
            }
            if (limitMgmtCtrl.intlmtswtch == 'N') {
                limitMgmtCtrl.IntOnOff = false;
                limitMgmtCtrl.intLimitLock = true;
                if(angular.isDefined(atmIntnlSlider)){
                    atmIntnlSlider.setAttribute('disabled', true);
					$('#txtAtmI').attr('disabled', 'disabled'); // disable corresponding textbox
                }
                if(angular.isDefined(prchsIntSlider)){
                    prchsIntSlider.setAttribute('disabled', true);
					$('#txtPrchsI').attr('disabled', 'disabled'); // disable corresponding textbox
                }
                //$scope.enabled = false;
            }
        }



        function setMaxLimit() {
            //var maxMessage = '<br/> Maximum Limit';
            var maxMessage = 'Maximum Limit';
            /*var atmMaxLimit = $filter('currency')(limitMgmtCtrl.atmLimit,'&nbsp;&nbsp;&nbsp;&#8377;&nbsp;','0');
            var purchseMaxLimit = $filter('currency')(limitMgmtCtrl.purchaseLimit,'&nbsp;&nbsp;&nbsp;&#8377;&nbsp;','0');*/
            var atmMaxLimit = limitMgmtCtrl.atmLimit + '';
            var purchseMaxLimit = limitMgmtCtrl.purchaseLimit + '';
            var showAtmMaxLimit = atmMaxLimit.concat(maxMessage);
            var showPurchseMaxLimit = purchseMaxLimit.concat(maxMessage);
            /*document.getElementById('atmMaxLimit').innerHTML = showAtmMaxLimit.replace('.00','');
            document.getElementById('prchaseMaxLimit').innerHTML = showPurchseMaxLimit.replace('.00','');*/
            //$("#atmMaxLimit").html(showAtmMaxLimit.replace('.00',''));
            $scope.maxATMLimit = showAtmMaxLimit.replace('.00', '');
            $scope.maxPurchaseLimit = showPurchseMaxLimit.replace('.00', '');
        }


        limitMgmtCtrl.changeAtmPurchsLimit = function(srcSlider, value) {
            //limitMgmtCtrl.canShowUpdateLimitButton = false;
            $scope.updateEventTriggerCountForSlider++;
            console.log('Update Event Trigger Count :: '+$scope.updateEventTriggerCountForSlider);
            console.log('Id :: '+srcSlider);
            console.log('Slider Value :: '+value);
            if (srcSlider == 'getAtmD' || srcSlider == 'getAtmI') {

                if (srcSlider == 'getAtmD') {
                    limitMgmtCtrl.aodLmt = value;
                    // checkForUpdateButton(limitMgmtCtrl.aodLmt,limitMgmtCtrl.cardaodLmt);
                } else {
                    limitMgmtCtrl.aoiLmt = value;
                    // checkForUpdateButton(limitMgmtCtrl.aoiLmt,limitMgmtCtrl.cardaoiLmt);
                }
                limitMgmtCtrl.checkFlgOff();
                limitMgmtCtrl.wdrwlprcntValue = ((+limitMgmtCtrl.aodLmt + +limitMgmtCtrl.aoiLmt) / (limitMgmtCtrl.atmLimit)) * 100;

                var vWdPercent = limitMgmtCtrl.wdrwlprcntValue;
                if (limitMgmtCtrl.wdrwlprcntValue > 100) {

                    if (srcSlider == 'getAtmD') {
                        limitMgmtCtrl.aodLmt = +limitMgmtCtrl.atmLimit - +limitMgmtCtrl.aoiLmt;

                    } else {
                        limitMgmtCtrl.aoiLmt = +limitMgmtCtrl.atmLimit - +limitMgmtCtrl.aodLmt;
                    }

                    if(angular.isDefined(atmDomSlider) && angular.isDefined(atmDomSlider.noUiSlider)){
                        atmDomSlider.noUiSlider.set([limitMgmtCtrl.aodLmt]);
                    }
                    if(angular.isDefined(atmIntnlSlider) && angular.isDefined(atmIntnlSlider.noUiSlider)){
                        atmIntnlSlider.noUiSlider.set([limitMgmtCtrl.aoiLmt]);
                    }

                    sliderUpdtCount++;
                    return false;
                }

                limitMgmtCtrl.wdrwlprcntValue = limitMgmtCtrl.wdrwlprcntValue.toFixed(2);
                console.log('Percentage Value in changeAtmPurchsLimit :: ' + limitMgmtCtrl.wdrwlprcntValue);
                //$("#dbtcwLimitMeter").roundSlider("setValue", limitMgmtCtrl.wdrwlprcntValue);
                //Start of Code added by Arnab

                $timeout(function() {
                    $scope.data[0].value = Math.round(limitMgmtCtrl.wdrwlprcntValue);
                    $scope.data[0].label = $scope.data[0].value + '%';
                    $scope.data[1].value = 100 - Math.round(limitMgmtCtrl.wdrwlprcntValue);
                }, 5);

                //End of Code added by Arnab
                $('#dbtprchsLimitMeter .rs-tooltip').css({
                    "margin-top": "-17%",
                    "margin-left": "-22%"
                });
                $('#dbtcwLimitMeter .rs-tooltip').css({
                    "margin-top": "-17%",
                    "margin-left": "-22%"
                });


                if($scope.atmTabActive && $scope.updateEventTriggerCountForSlider > 4 && !$scope.initialPageLoad){
                  if (limitMgmtCtrl.wdrwlprcntValue == "100.00") {

                      //limitMgmtCtrl.limitExcdAtmMsg = true;
                      console.log("$scope.atmTabActive", $scope.atmTabActive);
                      console.log("$scope.purchaseTabActive", $scope.purchaseTabActive);
                      if($scope.atmTabActive == true){
                        $('.atmNote').show();
                        $('.atmNote').css('margin-bottom', '30px');
                        $('.purchaseNote').hide();
                      }
                  } else {
                        if($scope.atmTabActive == true){
                            $('.atmNote').hide();
                            $('.atmNote').css('margin-bottom', '0px');
                        }
                         else if($scope.purchaseTabActive == true){
                            $('.atmNote').hide();
                            $('.atmNote').css('margin-bottom', '0px');
                            $('.purchaseNote').show();
                        }
                  }
                }else{
                    $('.atmNote').hide();
					$('.atmNote').css('margin-bottom', '0px');
					$('.purchaseNote').hide();
					$('.purchaseNote').css('margin-bottom', '0px');
                }


            } else if (srcSlider == 'getPrchsD' || srcSlider == 'getPrchsI') {

                if (srcSlider == 'getPrchsD') {
                    limitMgmtCtrl.podLmt = value;
                    // checkForUpdateButton(limitMgmtCtrl.podLmt,limitMgmtCtrl.dcplimitValue);
                } else {
                    limitMgmtCtrl.poiLmt = value;
                    // checkForUpdateButton(limitMgmtCtrl.poiLmt,limitMgmtCtrl.dcplimitValue1);
                }
                limitMgmtCtrl.checkFlgOff();

                limitMgmtCtrl.purchseprcntValue = ((+limitMgmtCtrl.podLmt + +limitMgmtCtrl.poiLmt) / (limitMgmtCtrl.purchaseLimit)) * 100;

                if (limitMgmtCtrl.purchseprcntValue > 100) {

                    if (srcSlider == 'getPrchsD') {
                        limitMgmtCtrl.podLmt = +limitMgmtCtrl.purchaseLimit - +limitMgmtCtrl.poiLmt;
                    } else {
                        limitMgmtCtrl.poiLmt = +limitMgmtCtrl.purchaseLimit - +limitMgmtCtrl.podLmt;
                    }

                    console.log("after prchsDomSlider :: " + prchsDomSlider);
                    console.log("after prchsIntSlider :: " + prchsIntSlider);
                    if (!angular.isUndefined(prchsDomSlider) && !angular.isUndefined(prchsDomSlider.noUiSlider)) {
                        prchsDomSlider.noUiSlider.set([limitMgmtCtrl.podLmt]);
                    }
                    if (!angular.isUndefined(prchsIntSlider) && !angular.isUndefined(prchsIntSlider.noUiSlider)) {
                        prchsIntSlider.noUiSlider.set([limitMgmtCtrl.poiLmt]);
                    }

                    //prchsDomSlider.noUiSlider.set([limitMgmtCtrl.podLmt]);
                    //prchsIntSlider.noUiSlider.set([limitMgmtCtrl.poiLmt]);
                    sliderUpdtCount++;
                    return false;
                }

                limitMgmtCtrl.purchseprcntValue = limitMgmtCtrl.purchseprcntValue.toFixed(2);

                //Start of code added by Arnab
                $timeout(function() {
                    $scope.data1[0].value = Math.round(limitMgmtCtrl.purchseprcntValue);
                    $scope.data1[0].label = $scope.data1[0].value + '%';
                    $scope.data1[1].value = 100 - Math.round(limitMgmtCtrl.purchseprcntValue);
                }, 5);
                //End of code added by Arnab

                $("#dbtprchsLimitMeter").roundSlider("setValue", limitMgmtCtrl.purchseprcntValue);
                $('#dbtprchsLimitMeter .rs-tooltip').css({
                    "margin-top": "-17%",
                    "margin-left": "-22%"
                });
                $('#dbtcwLimitMeter .rs-tooltip').css({
                    "margin-top": "-17%",
                    "margin-left": "-22%"
                });


                if($scope.purchaseTabActive && $scope.updateEventTriggerCountForSlider > 4 && !$scope.initialPageLoad){
                    if (limitMgmtCtrl.purchseprcntValue == "100.00") {
                        limitMgmtCtrl.limitExcdPrchsMsg = true;
                        if($scope.purchaseTabActive == true)
                        $('.purchaseNote').show();
                        $('.atmNote').hide();
						$('.purchaseNote').css('margin-bottom', '30px');
                    } else {
                        if($scope.purchaseTabActive == true){
                            $('.purchaseNote').hide();
					        $('.purchaseNote').css('margin-bottom', '0px');
                       }
                       else if($scope.purchaseTabActive == true){
                            $('.purchaseNote').hide();
                       		$('.purchaseNote').css('margin-bottom', '0px');
                            $('.atmNote').show();
                       }
                    }
                }else{
                       $('.purchaseNote').hide();
					   $('.purchaseNote').css('margin-bottom', '0px');
					   $('.atmNote').hide();
					   $('.atmNote').css('margin-bottom', '0px');
				}

            }
        };


        $scope.applyScope = function() {
            $scope.$apply();
        }


        function maskCardNo(cardNo) {
            var accountNumber = cardNo;
            var cardEndNo = accountNumber.substring(accountNumber.length - 4, accountNumber.length);
            return cardEndNo;
        };




        $scope.maskAccountNo = function(listOfAccNo) {
            for (var countNo in listOfAccNo) {
                var accountNumber = listOfAccNo[countNo].crdNb;
                var nonMaskedAccStart = accountNumber.substring(0, 4);
                var nonMaskedAccEnd = accountNumber.substring(accountNumber.length - 4, accountNumber.length);
                // limitMgmtCtrl.cardEnd = accountNumber.substring(accountNumber.length - 4, accountNumber.length);
                var maskPart = repeat('X', accountNumber.length - 9);
                $scope.detail[countNo].crdNb = nonMaskedAccStart + ' ' + maskPart.substring(0, 4) + ' ' + maskPart.substring(4, 8) + ' ' + nonMaskedAccEnd;

            }
        };

        var repeat = function(String, count) {
            return count > 0 ? String + repeat(String, count - 1) : String;
        };

        // Fetch Transfer Limit from DB
        function getLimit() {

            limitMgmtCtrl.errorSpin = true;
            limitMgmtCtrl.limitFormFlag = true;
            limitMgmtCtrl.successPage = false;
            limitMgmtCtrl.buttonFlag = false;
            limitMgmtCtrl.serviceError = false;
            limitMgmtCtrl.checkLimit = false;
            limitMgmtCtrl.lockFieldsOTP = false;
            limitMgmtCtrl.lockFields = false;
            limitMgmtCtrl.OTPFlag = true;
            limitMgmtCtrl.viewLimit = false;
            limitMgmtCtrl.otpValue = '';
            limitMgmtCtrl.atmWidrwlTabLock = true;
            limitMgmtCtrl.purchseTabLock = false;
            limitMgmtCtrl.dbtcrdcnt = 1;
            // limitMgmtCtrl.dbtnmcount = 0;
            limitMgmtCtrl.leftArrowLock = false;

        }

        // Remove specific alert
        function closeAlert(index) {
            limitMgmtCtrl.alerts.splice(index, 1);
        }

        function setLimit() {
            if (limit === -1) {
                limitMgmtCtrl.limitmanagement.limit = '';
            } else {
                limitMgmtCtrl.limitmanagement.limit = limit;
            }
        }


        function cardprcslimit() {
            $("#dbtprchsLimitMeter").roundSlider({
                radius: 60,
                width: 8,
                circleShape: "half-top",
                sliderType: "min-range",
                showTooltip: true,
                tooltipFormat: function(e) {
                    return e.value + "% <br/>Limit used";
                },
                editableTooltip: false,
                min: 0,
                max: 100,
                disabled: false,
                keyboardAction: true,
                mouseScrollAction: true,
                readOnly: true
            });
        }

        function cardcwlimit() {
            $("#dbtcwLimitMeter").roundSlider({
                radius: 60,
                width: 8,
                circleShape: "half-top", //"custom-half",//"half-top",
                sliderType: "min-range",
                showTooltip: true,
                tooltipFormat: function(e) {
                    return e.value + "% <br/>Limit used";
                },
                editableTooltip: false,
                min: 0,
                max: 100,
                disabled: false,
                keyboardAction: true,
                mouseScrollAction: true,
                readOnly: true

            });
        }

         //added for mobile
        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            gadgets.pubsub.publish("device.GoBack");
        });

        // widget Refresh code
        //LauncherDeckRefreshContent.setup(lpCoreBus, initialize).listen(lpWidget);
        initialize();

        //*****************scope variables****************//
        limitMgmtCtrl.alerts = [];
        limitMgmtCtrl.viewLimit = false;
        limitMgmtCtrl.error = {
            happened: false,
            msg: ''
        };
        // Model to bind the data
        limitMgmtCtrl.limitmanagement = {
            limit: ''

        };


        /*
        Tejas:-added code to refresh widget again on click on OK button*/

        limitMgmtCtrl.refreshPage = function() {
            //lpCoreBus.publish("launchpad-retail.limitFungibility");
            gadgets.pubsub.publish("launchpad-retail.limitFungibility");
        };



        // Function to check and set Sliders according to flags

        function setIntlSlider() {

            if (!limitMgmtCtrl.IntOnOff) {

                limitMgmtCtrl.intLimitLock = true;
                if(angular.isDefined(atmIntnlSlider)){
                    atmIntnlSlider.setAttribute('disabled', true);
					$('#txtAtmI').attr('disabled', 'disabled'); // disable corresponding textbox
                }
                if(angular.isDefined(prchsIntSlider)){
                    prchsIntSlider.setAttribute('disabled', true);
					$('#txtPrchsI').attr('disabled', 'disabled'); // disable corresponding textbox
                }

                $('#atmWidIntVal').html(limitMgmtCtrl.aoiLmt);
                $('#purCurIntVal').html(limitMgmtCtrl.poiLmt);

                limitMgmtCtrl.wdrwlprcntValue = (((+limitMgmtCtrl.aodLmt + +limitMgmtCtrl.aoiLmt) / (limitMgmtCtrl.atmLimit)) * 100).toFixed(2);
                console.log('Percentage Value in setIntlSlider :: ' + limitMgmtCtrl.wdrwlprcntValue);
                //$("#dbtcwLimitMeter").roundSlider("setValue", limitMgmtCtrl.wdrwlprcntValue);
                //Start of code added by Arnab

                $timeout(function() {
                    $scope.data[0].value = Math.round(limitMgmtCtrl.wdrwlprcntValue);
                    $scope.data[0].label = $scope.data[0].value + '%';
                    $scope.data[1].value = 100 - Math.round(limitMgmtCtrl.wdrwlprcntValue);

                }, 5);

                //End of code added by Arnab



                limitMgmtCtrl.purchseprcntValue = (((+limitMgmtCtrl.podLmt + +limitMgmtCtrl.poiLmt) / (limitMgmtCtrl.purchaseLimit)) * 100).toFixed(2);
                //$("#dbtprchsLimitMeter").roundSlider("setValue", limitMgmtCtrl.purchseprcntValue);
                $timeout(function() {
                    $scope.data1[0].value = Math.round(limitMgmtCtrl.purchseprcntValue);
                    $scope.data1[0].label = $scope.data1[0].value + '%';
                    $scope.data1[1].value = 100 - Math.round(limitMgmtCtrl.purchseprcntValue);

                }, 5);
                $('#dbtprchsLimitMeter .rs-tooltip').css({
                    "margin-top": "-17%",
                    "margin-left": "-22%"
                });
                $('#dbtcwLimitMeter .rs-tooltip').css({
                    "margin-top": "-17%",
                    "margin-left": "-22%"
                });

            } else {
                limitMgmtCtrl.intLimitLock = false;
                if(angular.isDefined(atmIntnlSlider)){
                    atmIntnlSlider.removeAttribute('disabled');
					$('#txtAtmI').removeAttribute('disabled'); // enable corresponding textbox
                }
                if(angular.isDefined(prchsIntSlider)){
                    prchsIntSlider.removeAttribute('disabled');
					$('#txtPrchsI').removeAttribute('disabled'); // enable corresponding textbox
                }

            }


        }


        function setSlider() {


            if(angular.isDefined(atmDomSlider) && angular.isDefined(atmDomSlider.noUiSlider)){
                atmDomSlider.noUiSlider.updateOptions({	start:[parseInt(limitMgmtCtrl.aodLmt)], range: { 'min': 0,	'max': limitMgmtCtrl.atmLimit 	} 	});
            }
            if(angular.isDefined(atmIntnlSlider) && angular.isDefined(atmIntnlSlider.noUiSlider)){
                atmIntnlSlider.noUiSlider.updateOptions({ start:[parseInt(limitMgmtCtrl.aoiLmt)],	range: { 'min': 0,	'max': limitMgmtCtrl.atmLimit 	} 	});
            }
            if(angular.isDefined(prchsDomSlider) && angular.isDefined(prchsDomSlider.noUiSlider)){
                prchsDomSlider.noUiSlider.updateOptions({ start:[parseInt(limitMgmtCtrl.podLmt)],	range: { 'min': 0,	'max': limitMgmtCtrl.purchaseLimit 	} 	});
            }
            if(angular.isDefined(prchsIntSlider) && angular.isDefined(prchsIntSlider.noUiSlider)){
                prchsIntSlider.noUiSlider.updateOptions({ start:[parseInt(limitMgmtCtrl.poiLmt)],	range: { 'min': 0,	'max': limitMgmtCtrl.purchaseLimit 	} 	});
            }
console.log("MAXX IN SETSLIDER: ", atmDomSlider.noUiSlider.options.range.max);
            /*atmDomSlider.noUiSlider.set([limitMgmtCtrl.aodLmt]);
			atmIntnlSlider.noUiSlider.set([limitMgmtCtrl.aoiLmt]);
            prchsDomSlider.noUiSlider.set([limitMgmtCtrl.podLmt]);
            prchsIntSlider.noUiSlider.set([limitMgmtCtrl.poiLmt]);
			*/

        }




        //*****************scope functions****************//


        var count1 = 0;
        var count = 0;

        limitMgmtCtrl.resendfunction = function() {
        if (count == 5) {

                        limitMgmtCtrl.abc = true;
                        //added to address issue 5561
                        limitMgmtCtrl.error={
                                                happened: true,
                                                msg: "We have tried 5 times to send you a code."
                                            };
                        limitMgmtCtrl.success={
                                                happened: false,
                                                msg: ''
                                            };
                        ++count;
                    } else {
                        ++count;
                        limitMgmtCtrl.abc = false;
                        //added to address issue 5561
                        limitMgmtCtrl.generateOTP('resend');
                        return count;
                    }
//            if (count == 3) {
//
//                limitMgmtCtrl.abc = true;
//                ++count;
//            } else {
//                ++count;
//                return count;
//                limitMgmtCtrl.abc = false;
//            }
        }


        limitMgmtCtrl.submitfunction = function() {

            if (count1 == 3) {

                limitMgmtCtrl.xyz = true;
                limitMgmtCtrl.abc = true;

            } else {
                limitMgmtCtrl.xyz = false;
            }

        }



        var otpVrfyCount = 0;
        var otpResendCount = 0;

        limitMgmtCtrl.otpResendFnctn = function() {
             $scope.displaySpinner();
            if (otpResendCount == 5) {

                limitMgmtCtrl.resendBtnLock = true;


                //added to address issue 5561
                limitMgmtCtrl.error={
                                        happened: true,
                                        msg: "We have tried 5 times to send you a code."
                                    };
                limitMgmtCtrl.success={
                                        happened: false,
                                        msg: ''
                                    };



                ++otpResendCount;
                $scope.hideSpinner();
            } else {
                ++otpResendCount;
                limitMgmtCtrl.resendBtnLock = false;

                //added to address issue 5561
                limitMgmtCtrl.generateOTP('resend');

                return otpResendCount;

            }

        }

        limitMgmtCtrl.otpSbmtFncn = function() {

            if (otpVrfyCount == 3) {

                limitMgmtCtrl.vrfyBtnLock = true;
                limitMgmtCtrl.resendBtnLock = true;

            } else {
                limitMgmtCtrl.vrfyBtnLock = false;
            }


        }

        limitMgmtCtrl.switchcard = function(action) {
            //limitMgmtCtrl.canShowUpdateLimitButton = true;
            // limitMgmtCtrl.hideOTPFlag = true;
            // limitMgmtCtrl.updteLimitFlg = false;
            $scope.updateEventTriggerCountForSlider = 0;

            if (action == 'left') {
                limitMgmtCtrl.dbtcrdcnt = limitMgmtCtrl.dbtcrdcnt - 1;
                limitMgmtCtrl.dbtnmcount = limitMgmtCtrl.dbtnmcount - 1;

                if (limitMgmtCtrl.dbtcrdcnt == 1) {
                    limitMgmtCtrl.leftArrowLock = false;
                    limitMgmtCtrl.rightArrowLock = true;
                }else if(limitMgmtCtrl.dbtcrdcnt > 1 && limitMgmtCtrl.dbtcrdcnt < $scope.detail.length){
                    limitMgmtCtrl.leftArrowLock = true;
                    limitMgmtCtrl.rightArrowLock = true;
                }else {
                    limitMgmtCtrl.leftArrowLock = true;
                }
                limitMgmtCtrl.changCardData(true);
                $('.updateLimitBtn').hide();

            }

            if (action == 'right') {
                limitMgmtCtrl.dbtcrdcnt = limitMgmtCtrl.dbtcrdcnt + 1;
                limitMgmtCtrl.dbtnmcount = limitMgmtCtrl.dbtnmcount + 1;

                if (limitMgmtCtrl.dbtcrdcnt == $scope.detail.length) {
                    limitMgmtCtrl.rightArrowLock = false;
                    limitMgmtCtrl.leftArrowLock = true;

                }else if(limitMgmtCtrl.dbtcrdcnt > 1 && limitMgmtCtrl.dbtcrdcnt < $scope.detail.length){
                     limitMgmtCtrl.leftArrowLock = true;
                     limitMgmtCtrl.rightArrowLock = true;
                }
                else {
                    limitMgmtCtrl.rightArrowLock = true;
                }
                limitMgmtCtrl.changCardData(true);
                $('.updateLimitBtn').hide();

            }
            $scope.initializeSwitchOnOffValues();
            $scope.setEnableStatusOfIntSlider();
            $scope.showOrHideIntSwitch(limitMgmtCtrl.dbtcrdcnt);
           /* $timeout(function(){
                angular.element('#MyElement').triggerHandler('click');
            },5);*/


        }

        limitMgmtCtrl.backOnScreen = function() {
            $('.updateLimitBtn').show();
            $scope.OTPFlag = false;
            limitMgmtCtrl.lockFieldsOTP = false;
            limitMgmtCtrl.successPage = false;
            $scope.hideQuesFlag = true;
            $scope.hideCombineFlag = true;
            limitMgmtCtrl.hideOTPFlag = true;
            limitMgmtCtrl.ModalhideOTPFlag = false;
            limitMgmtCtrl.modalSwitchChange = false;
            // RSA changes by Xebia start
            limitMgmtCtrl.showSetupCQMessage = false;
            limitMgmtCtrl.showCancelTransactionMessage = false;
            limitMgmtCtrl.challengeQuestionAnswer="";
            limitMgmtCtrl.showCQError = "";
            limitMgmtCtrl.challengeQuestionCounter = 0;
            limitMgmtCtrl.showDenyMessage = false;
            limitMgmtCtrl.showWrongAnswerMessage = false;
            // RSA changes by Xebia ends
        };

        var setdeviceprint = function() {
            return encode_deviceprint();
        };

        var resetEveryThing = function() {

        }

        limitMgmtCtrl.updateLimitOTP = function() {
            $scope.displaySpinner();
            limitMgmtCtrl.resendBtnLock = false;
            limitMgmtCtrl.vrfyBtnLock = false;

            // RSA changes by Xebia start
            limitMgmtCtrl.cqFlaglmt = true;
            limitMgmtCtrl.cqFlagIntlmt = false;
            limitMgmtCtrl.showSetupCQMessage = false;
            limitMgmtCtrl.showCancelTransactionMessage = false;
            limitMgmtCtrl.challengeQuestionAnswer="";
            limitMgmtCtrl.showCQError = "";
            limitMgmtCtrl.challengeQuestionCounter = 0;
            limitMgmtCtrl.showDenyMessage = false;
            limitMgmtCtrl.showWrongAnswerMessage = false;
            // RSA changes by Xebia ends

            otpVrfyCount = 0;
            otpResendCount = 0;

            limitMgmtCtrl.otpValue = '';
            limitMgmtCtrl.lockFieldsOTP = false;

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
            $scope.buttonError = false;
            var xhr;

            var res;
            var challengeQuestions = [];
            limitMgmtCtrl.errorSpinDetail = true;
            var rsaAnalyzeService = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference("rsaAnalyzeService"));

            $scope.postData = {

                'transaction': 'cardLimiting',
                //'instructedAmount':$scope.atmDomLimit,
                'ATMD': limitMgmtCtrl.aodLmt,
                'ATMI': limitMgmtCtrl.aoiLmt,
                'PURCHASED': limitMgmtCtrl.podLmt,
                'PURCHASEI': limitMgmtCtrl.poiLmt,
                'ATMDS': limitMgmtCtrl.cashDomLmt,
                'ATMIS': limitMgmtCtrl.cashIntLmt,
                'PURCHASEDS': limitMgmtCtrl.purDomLmt,
                'PURCHASEIS': limitMgmtCtrl.purIntLmt,
                'acctNb': limitMgmtCtrl.cardAccntNum

            };
            $scope.postData.devicePrint = setdeviceprint();
            // to fetch mobile specific data
            /*gadgets.pubsub.publish("getMobileSdkData");
            gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
              $scope.mobileSdkData = response.data;
            });*/
            $scope.postData.mobileSdkData = JSON.stringify($scope.mobileSdkData);
            var data1 = $.param($scope.postData || {});
            console.log('updateLimitOTP request :'+JSON.stringify($scope.postData));
            res = $http({
                method: "POST",
                url: rsaAnalyzeService,
                data: data1,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            res.success(function(data) {
                limitMgmtCtrl.errorSpinDetail = false;
                //$scope.displayErrorSpin();
                $scope.hideSpinner();
                limitMgmtCtrl.credentialType = data.credentialType;

                // RSA changes by Xebia starts
                    if (data.actionStatus === 'DENY' || data.userStatus === 'DELETE' || data.userStatus === 'LOCKOUT' ) 
                    {
                            limitMgmtCtrl.errorSpin = false;
                            limitMgmtCtrl.showDenyMessage = true;
                            $('.updateLimitBtn').hide();
                    }
                    else if(data.userStatus === 'UNVERIFIED' || data.userStatus === 'NOTENROLLED')
                        {
                            limitMgmtCtrl.showSetupCQMessage = true;
                            limitMgmtCtrl.errorSpin = false;
                            $('.updateLimitBtn').hide();
                        }  
                    else if ( data.actionStatus === 'ALLOW' &&  ( data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED' ) ) 
                        {
                            limitMgmtCtrl.errorSpin = true;
                            limitMgmtCtrl.generateOTP("generate");
                            $scope.transactionType = 'updateLimitOTP';
                            $scope.readSMS('');
                            limitMgmtCtrl.hideOTPFlag = false;
                            $('.updateLimitBtn').hide();
                        } 
                    else if (data.actionStatus === 'CHALLENGE' && ( data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED' ) )
                        {
                            limitMgmtCtrl.errorSpin = false;
                            limitMgmtCtrl.showCQError=CQService.CHALLENGE_MESSAGE;
                            limitMgmtCtrl.challengeQuestionCounter++;
                            limitMgmtCtrl.challengeQuestions = data.challengeQuestionList[0].questionText;
                            limitMgmtCtrl.challengeQuestionsId = data.challengeQuestionList[0].questionId;
                            limitMgmtCtrl.hideQuesFlag = false;
                            limitMgmtCtrl.btnFlag = false;
                            limitMgmtCtrl.showQuestionDiv = true;
                            limitMgmtCtrl.hideOTPFlag = true;
                            limitMgmtCtrl.hideCombineFlag = true;
                            $('.updateLimitBtn').hide();
                        }
                // RSA changes by Xebia ends

            });
            res.error(function(data) {

                 limitMgmtCtrl.errorSpinDetail = false;
                 $scope.errorSpin = false;
                //$scope.displayErrorSpin();
                $scope.hideSpinner();
                IdfcError.checkTimeout(data);
                $scope.globalerror = IdfcError.checkGlobalError(data);
                if ($scope.globalerror) {
                    $scope.err = {
                        happened: true,
                        msg: data.rsn
                    };
                    $scope.buttonError = true;
                }
                limitMgmtCtrl.error = {
                    happened: true,
                    msg: data.rsn
                };
                limitMgmtCtrl.success = {
                    happened: false,
                    msg: ''
                };

                //Calling stop SMS reading
                /*gadgets.pubsub.publish("stopReceiver",{
                    data:"Stop Reading OTP"
                });*/
            });

        }

        // showSetupCQ function by Xebia
        limitMgmtCtrl.showSetupCQ = function()
        {
            gadgets.pubsub.publish('openCQ');
        }

        // cancel Transaction function by Xebia
        limitMgmtCtrl.cancelRSATransaction = function()
        {
            gadgets.pubsub.publish("launchpad-retail.backToDashboard")  
        }

        // verify challenge question answer function by Xebia
        limitMgmtCtrl.verifyCQAnswer = function(tnx)
        {
            limitMgmtCtrl.errorSpin = true;
            var postdata = {
                questionID : limitMgmtCtrl.challengeQuestionsId,
                question : limitMgmtCtrl.challengeQuestions,
                answer : limitMgmtCtrl.challengeQuestion.answer,
                credentialType : 'QUESTION'
            }
            postdata.mobileSdkData = JSON.stringify($scope.mobileSdkData);
            postdata= $.param(postdata);

            var xhr = CQService.verifyRSA(verifyCQAnswerUrl, postdata);
            xhr.success(function(response){
                    if(response.correctlyAnswered)
                    {
                        limitMgmtCtrl.errorSpin = true;
                        if(tnx==="cardLimiting"){
                            limitMgmtCtrl.hideOTPFlag = false;
                            $scope.transactionType = 'updateLimitOTP';
                        }    
                        else{
                            limitMgmtCtrl.offSwitchFLg = false;
                            $scope.transactionType = 'RSA';
                        }    
                        limitMgmtCtrl.hideQuesFlag = true;
                        limitMgmtCtrl.showQuestionDiv = false;
                        limitMgmtCtrl.showWrongAnswerMessage = false;
                        limitMgmtCtrl.generateOTP("generate");  
                        $scope.readSMS(''); 
                    }
                    else
                    {
                        if($scope.challengeQuestionCounter <= 2)
                        {
                            limitMgmtCtrl.errorSpin = false;
                            limitMgmtCtrl.showCQError = CQService.WRONG_CQ_ANSWER;
                            limitMgmtCtrl.showWrongAnswerMessage = true;
                            limitMgmtCtrl.showQuestionDiv = false;   
                        }
                        else
                        {
                            limitMgmtCtrl.errorSpin = false;
                            limitMgmtCtrl.showQuestionDiv = false;  
                            limitMgmtCtrl.showCQError = CQService.CQ_ANSWER_ATTEMPT_EXCEED;
                        }
                    }
                    
                    
                })
            xhr.error(function (data, status) {
                        limitMgmtCtrl.errorSpinDetail = false;
                        $scope.errorSpin = false;
                        $scope.hideSpinner();
                        IdfcError.checkTimeout(data);
                        $scope.globalerror = IdfcError.checkGlobalError(data);
                        if ($scope.globalerror) {
                            $scope.err = {
                                happened: true,
                                msg: data.rsn
                            };
                            $scope.buttonError = true;
                        }
                        limitMgmtCtrl.error = {
                            happened: true,
                            msg: data.rsn
                        };
                        limitMgmtCtrl.success = {
                            happened: false,
                            msg: ''
                        };
                    });

        };

        // fetch challenge question function by Xebia
        $scope.fetchCQ = function(tnx)
        {
            limitMgmtCtrl.errorSpin = true;
            limitMgmtCtrl.challengeQuestion.answer="";
            limitMgmtCtrl.showCQError="";
            var postdata = {};
            
            var xhr = CQService.challengeRSA(getChallengeQuestionUrl, postdata);

            xhr.success(function(response){
                limitMgmtCtrl.showWrongAnswerMessage = false;
                limitMgmtCtrl.challengeQuestionCounter++;
                limitMgmtCtrl.challengeQuestionsId = response.challengeQuestionList[0].questionId;
                limitMgmtCtrl.challengeQuestions = response.challengeQuestionList[0].questionText;
                limitMgmtCtrl.errorSpin = false;
                if(tnx==="cardLimiting")
                    limitMgmtCtrl.hideOTPFlag = true;
                else
                    limitMgmtCtrl.offSwitchFLg = true;
                limitMgmtCtrl.hideQuesFlag = false;
                limitMgmtCtrl.showQuestionDiv = true;
                limitMgmtCtrl.hideCombineFlag = true;
            })

            xhr.error(function (data, status) {
                        limitMgmtCtrl.errorSpinDetail = false;
                        $scope.errorSpin = false;
                        $scope.hideSpinner();
                        IdfcError.checkTimeout(data);
                        $scope.globalerror = IdfcError.checkGlobalError(data);
                        if ($scope.globalerror) {
                            $scope.err = {
                                happened: true,
                                msg: data.rsn
                            };
                            $scope.buttonError = true;
                        }
                        limitMgmtCtrl.error = {
                            happened: true,
                            msg: data.rsn
                        };
                        limitMgmtCtrl.success = {
                            happened: false,
                            msg: ''
                        };
                });
        };

        $scope.displaySpinner = function(){
            console.log('Inside displaySpinner function');
            $scope.errorSpin = true;
            limitMgmtCtrl.errorSpin = true;
        }

        $scope.hideSpinner = function(){
            console.log('Inside hideSpinner function');
            $scope.errorSpin = false;
            limitMgmtCtrl.errorSpin = false;
        }


        function callRSA() {
            $scope.displaySpinner();

            // RSA changes by Xebia start
            limitMgmtCtrl.cqFlaglmt = false;
            limitMgmtCtrl.cqFlagIntlmt = true;
            limitMgmtCtrl.showSetupCQMessage = false;
            limitMgmtCtrl.showCancelTransactionMessage = false;
            limitMgmtCtrl.challengeQuestion={};
            limitMgmtCtrl.showCQError = "";
            limitMgmtCtrl.challengeQuestionCounter = 0;
            limitMgmtCtrl.showDenyMessage = false;
            limitMgmtCtrl.showWrongAnswerMessage = false;
            // RSA changes by Xebia ends

            $scope.postData = {
                'transaction': 'cardSwitchLimit',
                //'transaction' : 'cardLimiting',
                'ATMD': limitMgmtCtrl.aodLmt,
                'ATMI': limitMgmtCtrl.aoiLmt,
                'PURCHASED': limitMgmtCtrl.podLmt,
                'PURCHASEI': limitMgmtCtrl.poiLmt,
                'ATMDS': limitMgmtCtrl.cashDomLmt,
                'ATMIS': limitMgmtCtrl.cashIntLmt,
                'PURCHASEDS': limitMgmtCtrl.purDomLmt,
                'PURCHASEIS': limitMgmtCtrl.purIntLmt,
                'acctNb': limitMgmtCtrl.cardAccntNum

            };
            // to fetch mobile specific data
            /*gadgets.pubsub.publish("getMobileSdkData");
            gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
              $scope.mobileSdkData = response.data;
            });*/
            $scope.postData.mobileSdkData = JSON.stringify($scope.mobileSdkData);
            var data1 = $.param($scope.postData || {});
            console.log('RSA request data->'+JSON.stringify($scope.postData));
            var request = $http({
                method: "POST",
                url: rsaAnalyzeService,
                data: data1,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            request.success(function(data) {
                console.log('RSA success');
                $scope.hideSpinner();
                limitMgmtCtrl.errorSpinDetail = false;
                limitMgmtCtrl.credentialType = data.credentialType;

                // RSA changes by Xebia start

                limitMgmtCtrl.ModalhideOTPFlag = true;
                limitMgmtCtrl.modalSwitchChange = true;
                limitMgmtCtrl.hideOTPFlag = true;
                $('.updateLimitBtn').hide();

                    if (data.actionStatus === 'DENY' || data.userStatus === 'DELETE' || data.userStatus === 'LOCKOUT' ) 
                    {
                            $scope.hideSpinner();
                            limitMgmtCtrl.showDenyMessage = true;
                    }
                    else if(data.userStatus === 'UNVERIFIED' || data.userStatus === 'NOTENROLLED')
                        {
                            limitMgmtCtrl.showSetupCQMessage = true;
                            $scope.hideSpinner();
                        }  
                    else if ( data.actionStatus === 'ALLOW' &&  ( data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED' ) ) 
                        {
                            $scope.displaySpinner();
                            limitMgmtCtrl.generateOTP("generate");
                            $scope.readSMS('');
                            $scope.transactionType = 'RSA';
                            limitMgmtCtrl.offSwitchFLg = false;
                        } 
                    else if (data.actionStatus === 'CHALLENGE' && ( data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED' ) )
                        {
                            limitMgmtCtrl.showCQError = CQService.CHALLENGE_MESSAGE;
                            limitMgmtCtrl.challengeQuestionCounter++;
                            limitMgmtCtrl.challengeQuestions = data.challengeQuestionList[0].questionText;
                            limitMgmtCtrl.challengeQuestionsId = data.challengeQuestionList[0].questionId;
                            limitMgmtCtrl.hideQuesFlag = false;
                            limitMgmtCtrl.showQuestionDiv = true;
                            limitMgmtCtrl.offSwitchFLg = true;
                        }
                    // RSA changes by Xebia ends

                /*if (data.mandatoryOTP == "false" && (data.actionStatus == "ALLOW" || data.actionStatus == "REVIEW")) {
                    limitMgmtCtrl.hideOTPFlag = true;
                    $scope.ShowForgotPasswordForm = !$scope.ShowForgotPasswordForm;
                } else {
                    if (data.credentialType == 'OTP' || data.mandatoryOTP == "true" || data.credentialType == 'OTPANDQUESTION' ||
                        data.credentialType == 'RSAOTPANDQUESTION' || data.credentialType == 'RSAOTP') {
                        $scope.OTPFlag = true;
                        limitMgmtCtrl.hideOTPFlag = true;
                        limitMgmtCtrl.updteLimitFlg = false;
                        $('.updateLimitBtn').hide();

                        $scope.lockFields = true;
                        $scope.btnFlag = false;
                        $scope.showButton = false;
                        $scope.demoFlag = true;
                        limitMgmtCtrl.ModalhideOTPFlag = true;
                        limitMgmtCtrl.modalSwitchChange = true;
                        if ((typeof data.mobileNumber != 'undefined') && (data.mobileNumber != null))
                            limitMgmtCtrl.customerMobMasked = '******' + data.mobileNumber.substr(data.mobileNumber.length - 4);
                        limitMgmtCtrl.success = {
                            happened: true,
                            msg: 'OTP has been successfully sent to your registered mobile number'
                        };

                        //Auto read SMS
                        $scope.transactionType = 'RSA';
                        $scope.readSMS($scope.transactionType);

                        limitMgmtCtrl.error = {
                            happened: false,
                            msg: ''
                        };
                    }
                    if (data.credentialType == 'QUESTION' || data.credentialType == 'OTPANDQUESTION' || data.credentialType == 'RSAOTPANDQUESTION') {
                        $scope.challengeQuestions = data.challengeQuestionList;
                        $scope.hideQuesFlag = false;
                        $scope.showButton = false;
                        $scope.showQuestionDiv = true;
                        $scope.lockFields = true;
                        $scope.btnFlag = false;
                        if ($scope.demoFlag == true) {
                            $scope.hideQuesFlag = true;
                            limitMgmtCtrl.hideOTPFlag = true;
                            $scope.hideCombineFlag = false;
                            $scope.OTPFlag = true;
                        }
                    }
                }*/

            });
            request.error(function(data) {
                console.log('RSA fail');
                 $scope.hideSpinner();
                limitMgmtCtrl.errorSpinDetail = false;
                $scope.errorSpin = false;
                IdfcError.checkTimeout(data);
                $scope.globalerror = IdfcError.checkGlobalError(data);
                if ($scope.globalerror) {
                    $scope.err = {
                        happened: true,
                        msg: data.rsn
                    };
                    $scope.buttonError = true;
                }
                limitMgmtCtrl.error = {
                    happened: true,
                    msg: data.rsn
                };
                limitMgmtCtrl.success = {
                    happened: false,
                    msg: ''
                };
            });

        }

        limitMgmtCtrl.buttonchange = function(vOnOffSwitchValueFlag) {

            limitMgmtCtrl.error = {
                happened: false,
                msg: ''
            };

            limitMgmtCtrl.success = {
                happened: false,
                msg: ''
            };

            limitMgmtCtrl.otpValue = '';
            //limitMgmtCtrl.hideOTPFlag = false;
            limitMgmtCtrl.updteLimitFlg = false;
            $('.updateLimitBtn').hide();

            vNewOnOffSwitchValue = vOnOffSwitchValueFlag; // New Value
            vOldOnOffSwitchValue = !vOnOffSwitchValueFlag; // Existing Value
            count1 = 0;
            count = 0;
            limitMgmtCtrl.xyz = false;
            limitMgmtCtrl.abc = false;
            limitMgmtCtrl.IntOnOff = vOldOnOffSwitchValue;
            limitMgmtCtrl.changCardData(false);
            //limitMgmtCtrl.generateOTP('send');

            if (vNewOnOffSwitchValue == true) {
                //limitMgmtCtrl.offSwitchFLg = false;
                callRSA();

            } else if (vNewOnOffSwitchValue == false) {
                limitMgmtCtrl.ModalhideOTPFlag = true;
                limitMgmtCtrl.modalSwitchChange = true
                limitMgmtCtrl.offSwitchFLg = true;
            }




        }

        function getMessage(errorResp) {
            var message = {
                happened: true,
                msg: errorResp.rsn
            };
            return message;
        }

        //To receive events if user has cliked on resend OTP
        gadgets.pubsub.subscribe("resend.otp", function(evt) {
            console.log(evt.resendOtpFlag);
            //Call function that is called on a click of "Resend OTP" button available on Widget
            $scope.readSMS('resend');
            //limitMgmtCtrl.generateOTP('resend');

        });

        $scope.readSMS = function(transactionFlag) {
            console.log('Read SMS called');
            console.log('Transaction flag->' + transactionFlag);
            //Step 1: Check whether user has provided SMS reading permission or not through SMS plugin
            var smsPlugin = cxp.mobile.plugins['SMSPlugin'];
            if (smsPlugin) {
                var isCheckSuccessCallback = function(data) {
                    if (data) {
                        var smsPermissionFlag = data['successFlag'];

                        if (smsPermissionFlag) {
                            //User has already given permission for reading SMS
                            //Step 1. publish SMS reading pubsub
                            console.log('SMS permission flag' + smsPermissionFlag);
                            gadgets.pubsub.publish("readSMS", {
                                //Data contains name of the Widget. This ensures no interception between multiple
                                //widgets, publish the same event
                                data: "LimitFungibility"
                            });

                            //Step 2. Send request to "sendOTP service
                            if ('resend' === transactionFlag) {
                                limitMgmtCtrl.generateOTP(transactionFlag);
                            }

                            //Step 3: Subscribes for the event for receiving OTP
                            //While subscribing, event name has to be same as the DATA sent at the time of sending request for reading OTP
                            gadgets.pubsub.subscribe("LimitFungibility", function(evt) {
                                //alert(evt.otp);
                                //var receivedOtp = evt.data;
                                var receivedOtp = evt.otp;
                                console.log('OTP: ' + evt.otp);
                                //Sending event for stopping OTP reading
                                gadgets.pubsub.publish("stopReceiver", {
                                    data: "Stop Reading OTP"
                                });

                                //Step 4: Send request to verify OTP service. OTP should be in receiveOtp popup
                                console.log('receivedOtp' + receivedOtp);
                                limitMgmtCtrl.otpValue = receivedOtp;
                                $scope.$apply();
                                console.log('OTP value :' + limitMgmtCtrl.otpValue);
                                if ('updateLimitOTP' == $scope.transactionType) {
                                    angular.element('#verify-btn-updateLimit').triggerHandler('click');
                                } else if ('RSA' == $scope.transactionType ){
                                    angular.element('#verify-btn-switchOnOff').triggerHandler('click');
                                }


                            });
                        } else {
                            //User has not provided permission for SMS reading
                            //1. Send request to "sendOTP" service
                            if ('resend' === transactionFlag) {
                                limitMgmtCtrl.generateOTP(transactionFlag);
                            }
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

        //SMS Reading -- End

        // Generate OTP request
        limitMgmtCtrl.generateOTP = function(value, modalVal) {
            limitMgmtCtrl.otpValue = '';
            limitMgmtCtrl.errorSpin = true;
            var resendOTP = false;

            if (value === 'resend') {
                resendOTP = true;
            }

            var postData = {
                'resendOTP': resendOTP
            };

            postData = $.param(postData || {});

            limitFungibilityService.setup({
                    generateOTPEndPoint: generateOTPEndPoint,
                    postData: postData,
                })
                .generateOTP()
                .success(
                    function(resp) {
                        $scope.hideSpinner();
                        console.log('Service call of OTP generation is successful ::'+count);
                        limitMgmtCtrl.errorSpin = false;
                       // if (count < 4) {
                        limitMgmtCtrl.success = {
                            happened: true,
                            msg: 'OTP has been successfully sent to your registered mobile number'
                        };

                        limitMgmtCtrl.error = {
                            happened: false,
                            msg: ''
                        };

                            //Automate OTP read
                            //$scope.readSMS();
                       // }

                      /*  if (count == 4) {
                            limitMgmtCtrl.success = {
                                happened: false,
                                msg: ''
                            };

                            limitMgmtCtrl.error = {
                                happened: true,
                                msg: 'We have tried 5 times to send you a code.'
                            };
                        } */

                        customerMob = resp.mobileNumber;

                        if (modalVal === 'modalShow') {
                            limitMgmtCtrl.ModalhideOTPFlag = true;
                            limitMgmtCtrl.modalSwitchChange = true;
                        }

                        if (IdfcUtils.hasContentData(resp)) {

                            limitMgmtCtrl.customerMobMasked = IdfcUtils.mobileMask(customerMob);
                        }
                    }).error(
                    function(errorResp) {
                    $scope.hideSpinner();
                    limitMgmtCtrl.errorSpin = false;
                        //Dismiss popup
                        console.log('Service call of OTP generation has failed');
                        gadgets.pubsub.publish("stopReceiver", {
                            data: "Stop Reading OTP"
                        });
                        limitMgmtCtrl.success = {
                            happened: false,
                            msg: ''
                        };
                        if (modalVal === 'modalShow') {
                            limitMgmtCtrl.ModalhideOTPFlag = false;
                            limitMgmtCtrl.modalSwitchChange = false;
                        }

                        limitMgmtCtrl.globalerror = IdfcError.checkGlobalError(errorResp);
                        if (limitMgmtCtrl.globalerror) {
                            limitMgmtCtrl.err = getMessage(errorResp);
                        }
                        limitMgmtCtrl.error = getMessage(errorResp);

                    });


        };

        limitMgmtCtrl.updateCardLimit = function(isValid, action) {
            /*$scope.errorSpin = true;
            limitMgmtCtrl.errorSpin = true;*/
            limitMgmtCtrl.updateErrorSpin = true;
            limitMgmtCtrl.errorSpinDetail = true;
            $scope.displaySpinner();
            limitMgmtCtrl.hideOTPFlag = false;
            limitMgmtCtrl.updteLimitFlg = false;
            $('.updateLimitBtn').hide();


            if (!isValid) {
                limitMgmtCtrl.errorSpinDetail = false;
                $scope.hideSpinner();
                return true;
            } else {
                var cardLimitingDetails = {};

                cardLimitingDetails.acctNb = limitMgmtCtrl.cardAccntNum;
                cardLimitingDetails.cardNum = limitMgmtCtrl.debitCardNum;

                if (limitMgmtCtrl.atmWidrwlTabLock) {
                    cardLimitingDetails.limitType = 'ATM';
                } else {
                    cardLimitingDetails.limitType = 'POS'
                }

                if (cardLimitingDetails.limitType === 'ATM') {
                    cardLimitingDetails.domesticLimit = Number(limitMgmtCtrl.aodLmt).toFixed(0);
                    cardLimitingDetails.intlLimit = Number(limitMgmtCtrl.aoiLmt).toFixed(0);
                } else if (cardLimitingDetails.limitType === 'POS') {
                    cardLimitingDetails.domesticLimit = Number(limitMgmtCtrl.podLmt).toFixed(0);
                    cardLimitingDetails.intlLimit = Number(limitMgmtCtrl.poiLmt).toFixed(0);
                }

                cardLimitingDetails.otpValue = limitMgmtCtrl.otpValue;
                otpVrfyCount++;
                cardLimitingDetails.credentialType = action;

                var data1 = $.param(cardLimitingDetails || {});

                var request = $http({
                    method: 'POST',
                    url: urlcardLimit,
                    data: data1,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }

                }).success(function(data, status, headers, config) {
                    $scope.hideSpinner();
                    console.log("data:",data);
                    console.log('Service call for limit change has become successful');
                    $window.scrollTo(0, 0);

                    limitMgmtCtrl.updateErrorSpin = false;
                    limitMgmtCtrl.successPage = true;
                    limitMgmtCtrl.errorSpinDetail = false;
                    var atmLimitChanged = (parseInt(limitMgmtCtrl.cardaodLmt) != parseInt(limitMgmtCtrl.aodLmt)) || (parseInt(limitMgmtCtrl.cardaoiLmt) != parseInt(limitMgmtCtrl.aoiLmt));
                    console.log("atmLimitChanged",atmLimitChanged);
                    var purchaseLimitChanged = (parseInt(limitMgmtCtrl.dcplimitValue) != parseInt(limitMgmtCtrl.podLmt)) || (parseInt(limitMgmtCtrl.dcplimitValue1) != parseInt(limitMgmtCtrl.poiLmt));

                    console.log("purchaseLimitChanged",purchaseLimitChanged);
                    console.log("cardLimitingDetails.limitType",cardLimitingDetails.limitType);
                    console.log(purchaseLimitChanged," ",atmLimitChanged);
                    if (data.csSts === 'Success' || data.csSts.indexOf('DCMS Status : Success') > -1) {
                        if (!purchaseLimitChanged) {
                            limitMgmtCtrl.cardLimitSuccess = {
                                happened: true,
                                msg: 'Congratulations ! The new limit for ATM withdrawals for card ending ' + limitMgmtCtrl.cardEnd + ' has been set.'
                            };
                            console.log("if",limitMgmtCtrl.cardLimitSuccess.msg);
                        }
                        if (!atmLimitChanged) {

                            limitMgmtCtrl.cardLimitSuccess = {
                                happened: true,
                                msg: 'Congratulations ! The new limit for Purchase transactions for card ending ' + limitMgmtCtrl.cardEnd + ' has been set.'
                            };

                            console.log("if",limitMgmtCtrl.cardLimitSuccess.msg);
                        }
                         /*limitMgmtCtrl.cardLimitSuccess = {
                            happened: true,
                            msg: 'Congratulations ! The new limit for ATM withdrawals for card ending ' + limitMgmtCtrl.cardEnd + ' has been set.'
                         };*/
                    } else {

                        limitMgmtCtrl.dcmsAndCrmError = {
                            happened: true,
                            msg: 'Sorry, something went wrong and your new limit has not been set. Please try in sometime.'

                        };
                        console.log("else",limitMgmtCtrl.dcmsAndCrmError.msg);

                    }

                    console.log(limitMgmtCtrl.cardLimitSuccess.msg);
                    console.log(limitMgmtCtrl.dcmsAndCrmError.msg);

                }).error(function(data, status, headers, config) {
                    $scope.hideSpinner();
                    limitMgmtCtrl.updateErrorSpin = false;
                    limitMgmtCtrl.errorSpinDetail = false;

                    limitMgmtCtrl.success = {
                        happened: false,
                        msg: ''
                    };


                    if (data.cd === 'NARR999') {
                        // $scope.serviceError = idfcHanlder.checkGlobalError(data);
                        limitMgmtCtrl.successPage = true;
                        limitMgmtCtrl.dcmsAndCrmError = {
                            happened: true,
                            msg: 'Sorry, something went wrong and your new limit has not been set. Please try in sometime.'
                        };
                    } else if (otpVrfyCount == 3) {
                        limitMgmtCtrl.error = {
                            happened: true,
                            msg: '3 strikes and you are out! You entered the wrong code thrice. Start the process again please.'
                        };
                    } else if (data.cd === '02') {
                        limitMgmtCtrl.error = {
                            happened: true,
                            msg: "That's the wrong code! Please try again."
                        };
                    } else {
                        limitMgmtCtrl.error = {
                            happened: true,
                            msg: 'Sorry Our Machines are not talking to each other. Humans are tying to fix the problem.'
                        };
                        limitMgmtCtrl.vrfyBtnLock = true;
                        limitMgmtCtrl.resendBtnLock = true;

                    }

                    console.log(limitMgmtCtrl.dcmsAndCrmError.msg);
                    console.log(limitMgmtCtrl.error.msg);

                });
            }
        };

        //fund transfer processing for immediate transactions////////
        function cardLimitToToEsb(orders, action) {

            var postData = $.param(orders || {});

            limitFungibilityService.setup({
                    limitChangeEndPoint: limitChangeEndPoint,
                    postData: postData,
                }).flagChange()
                .success(
                    function(response) {
                        $scope.hideSpinner();
                        if (response.csSts === 'Success' || response.csSts.indexOf('DCMS Status : Success') > -1) {
                            /*If DCMS success*/
                            limitMgmtCtrl.ModalhideOTPFlag = false;
                            limitMgmtCtrl.modalSwitchChange = false;
                            limitMgmtCtrl.IntOnOff = vNewOnOffSwitchValue;
                            $scope.detail[limitMgmtCtrl.dbtnmcount].intlLmtSwtch = (vNewOnOffSwitchValue == true ? 'Y' : 'N');
                            limitMgmtCtrl.checkFlgOff();
                            setIntlSlider();
                        } else {
                            /*If DCMS Fails*/
                            limitMgmtCtrl.ModalhideOTPFlag = true;
                            limitMgmtCtrl.modalSwitchChange = true;
                            limitMgmtCtrl.IntOnOff = vOldOnOffSwitchValue;

                            limitMgmtCtrl.error = {
                                happened: true,
                                msg: 'Oops! Something went wrong. Please try again'
                            };
                            limitMgmtCtrl.success = {
                                happened: false
                            };

                            limitMgmtCtrl.checkFlgOff();
                            setIntlSlider();

                        }
                        /*limitMgmtCtrl.success = {
                            happened: false
                        };*/
                        //limitMgmtCtrl.errorSpin = false;


                    }).error(function(errorResp) {

                    limitMgmtCtrl.success = {
                        happened: false
                    };
                    limitMgmtCtrl.IntOnOff = vOldOnOffSwitchValue;
                    limitMgmtCtrl.checkFlgOff();
                    //limitMgmtCtrl.errorSpin = false;
                    $scope.hideSpinner();
                    limitMgmtCtrl.ModalhideOTPFlag = true;
                    limitMgmtCtrl.modalSwitchChange = true;

                    //limitMgmtCtrl.offSwitchFLg = true;

                    if (count1 == 3) {
                        limitMgmtCtrl.error = {
                            happened: true,
                            msg: '3 strikes and you are out! You entered the wrong code thrice. Start the process again please.'
                        };
                    } else if (errorResp.cd == '02') {
                       /* limitMgmtCtrl.error = {
                            happened: true,
                            msg: "That's the wrong code! Please try again."
                        };*/
                         limitMgmtCtrl.error = {
                            happened: true,
                            msg: errorResp.rsn
                        };
                    } else {
                        limitMgmtCtrl.error = {
                            happened: true,
                            msg: 'Oops! Something went wrong. Please try again'
                        };
                    }

                    console.log('Error message :: '+limitMgmtCtrl.error.msg);

                });
        }

        // checkFlgOff function was here, moved to beginning - Changed

        // Manage fund transfer request against different transaction modes and perform appropriate action
        function authorizePayment(action) {
            var selectedOption = {};
            if (action === 'OTP' || action === 'OTPANDQUESTION' || action === 'RSAOTPANDQUESTION') {

                selectedOption.otpValue = limitMgmtCtrl.otpValue;
                count1++;

            }
            selectedOption.credentialType = action;
            selectedOption.flag = (vNewOnOffSwitchValue == true ? 'Y' : 'N'); //  limitMgmtCtrl.intlmtswtch;
            selectedOption.cardNb = limitMgmtCtrl.debitCardNum;
            selectedOption.acctNb = limitMgmtCtrl.cardAccntNum;

            var orders = selectedOption;

            cardLimitToToEsb(orders, action);
        }


        limitMgmtCtrl.submitForm = function(otpForm, action) {

            if (!otpForm.$valid) {
                return false;
            } else {
                limitMgmtCtrl.errorSpin = true;
                authorizePayment(action);
            }
        };

        limitMgmtCtrl.switchOffSubmit = function() {
            //limitMgmtCtrl.errorSpin = true;
            limitMgmtCtrl.ModalhideOTPFlag = false;
            limitMgmtCtrl.modalSwitchChange = false;
            $scope.displaySpinner();
            authorizePayment('OTP');

        };

        limitMgmtCtrl.closePopop = function() {
            limitMgmtCtrl.ModalhideOTPFlag = false;
            limitMgmtCtrl.modalSwitchChange = false;
	        //$scope.enabled = true;
	        limitMgmtCtrl.IntOnOff = true;
	        $scope.otpScreenToBeHidden = true;
            $scope.enableOrDisableIntSlider();
        };



        // Change Card Data Function was here - moved to beginning - Changed

        // Change Update Function was here - moved to beginning - Changed
		
		//Tab Js//
		function resetTabs() {
			       $('#tabs li').toggleClass('selectedLi');
				   //$('#tabs li:eq(1)').toggleClass('activePurchase');
                   $("#content > div").hide(); //Hide all content
                   $("#tabs a").attr("id", ""); //Reset id's      
               }
               
               var myUrl = window.location.href; //get URL
               var myUrlTab = myUrl.substring(myUrl.indexOf("#")); // For localhost/tabs.html#tab2, myUrlTab = #tab2     
               var myUrlTabName = myUrlTab.substring(0, 4); // For the above example, myUrlTabName = #tab
               
               (function () {
                   $("#content > div").hide(); // Initially hide all content
                   $("#tabs li:first a").attr("id", "current"); // Activate first tab
                   $("#content > div:first").fadeIn(); // Show first tab content
               
                   $("#tabs a").on("click", function (e) {
                       e.preventDefault();
                       if ($(this).attr("id") == "current") { //detection for current tab
                           return
                       }
                       else {
                           resetTabs();
                           $(this).attr("id", "current"); // Activate this
                           $($(this).attr('name')).fadeIn(); // Show content for current tab
                       }
                   });
               
                   for (var i = 1; i <= $("#tabs li").length; i++) {
                       if (myUrlTab == myUrlTabName + i) {
                           resetTabs();
                           $("a[name='" + myUrlTab + "']").attr("id", "current"); // Activate url tab
                           $(myUrlTab).fadeIn(); // Show url tab content        
                       }
                   }
               })();
		//Tab Js//
          // $timeout(function(){
          //       gadgets.pubsub.publish('cxp.item.loaded', {
          //           id: widget.id
          //       });
          //   }, 10);
    };
});