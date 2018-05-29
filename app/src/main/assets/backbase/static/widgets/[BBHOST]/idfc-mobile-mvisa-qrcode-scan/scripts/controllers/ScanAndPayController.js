/**
 * Controllers
 * @module controllers
 */
define(function (require, exports, module) {

    'use strict';

    var uiSwitch = require('uiSwitch');
    var angularTouch = require('angular-touch');
    var idfcHanlder = require('idfcerror');
    var idfcConstants = require('idfccommon').idfcConstants;
    var manualTipCalcFlag = false;

    /**
     * Main controller
     * @ngInject
     * @constructor
     */
    function ScanAndPayController(model, lpWidget, lpCoreUtils,$timeout,$scope,$http, lpCoreStore,lpPortal) {

        this.state = model.getState();
        this.utils = lpCoreUtils;
        this.widget = lpWidget;


        var scanAndPayCtrl=this;
        scanAndPayCtrl.mVisaScannedJsonString='';

        var initialize = function() {
              console.log('initialize called');

             scanAndPayCtrl.partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partials';
             scanAndPayCtrl.template = {
               header: scanAndPayCtrl.partialsDir + '/header.html',
               manualPay: scanAndPayCtrl.partialsDir + '/key_entry.html',
               confirmationPage: scanAndPayCtrl.partialsDir + '/confirm.html',
             };

              gadgets.pubsub.publish("js.back", {
                   data: "ENABLE_BACK"
              });

              //calling config service to save the issuers which are allowed -visa,rupay
              //comment for local usage
              scanAndPayCtrl.getSetupConfiguration();

               //for local usage
               /*scanAndPayCtrl.issuerDetailsList=[];
               scanAndPayCtrl.issuerDetailsList[0]={
                                                        "issuerName":"Visa",
                                                        "issuerIdentCode":"4"
                                                   };
               scanAndPayCtrl.issuerDetailsList[1]={
                                                        "issuerName":"Rupay",
                                                        "issuerIdentCode":"6"
                                                   };
               scanAndPayCtrl.checkScanAndPayFlag();*/
               //for local usage

        };

         gadgets.pubsub.subscribe("mvisa.show.payeekey",showPayeeKeyPage);
         gadgets.pubsub.subscribe("scan.mvisa.success", showConfirmationPage);

         scanAndPayCtrl.resetVariables=function(){
            // Creating the object for payeeKey
            console.log('reset variables called');

              scanAndPayCtrl.serviceError = {
                happened: false,
                msg: ""
              };


              scanAndPayCtrl.showToggle=true;
              scanAndPayCtrl.showConfirmationTemplate = false;
              scanAndPayCtrl.showQrScan = true;
              $scope.$apply();


              //reset key entry page fields
              scanAndPayCtrl.payeeKeyObj={};

              scanAndPayCtrl.isValidIssuer=true;
              scanAndPayCtrl.mod10CheckError=false;

              //change title of the page to scanAndPay
              gadgets.pubsub.publish("mvisa.header.title", {
              				   data: "Scan and Pay"
              });

              //reset confirm page fields
              scanAndPayCtrl.billNumber="";
              scanAndPayCtrl.mobNumber="";
              scanAndPayCtrl.storeId="";
              scanAndPayCtrl.loyaltyNo="";
              scanAndPayCtrl.refId="";
              scanAndPayCtrl.consumerId="";
              scanAndPayCtrl.terminalId="";
              scanAndPayCtrl.purpose="";


              scanAndPayCtrl.secondTime=false;

              scanAndPayCtrl.showTip = false;
              scanAndPayCtrl.showBillNumber = false;
              scanAndPayCtrl.showMobNumber = false;
              scanAndPayCtrl.showStoreId = false;
              scanAndPayCtrl.showLoyaltyNo = false;
              scanAndPayCtrl.showFefId = false;
              scanAndPayCtrl.showConsumerId = false;
              scanAndPayCtrl.showTerminalId = false;

              scanAndPayCtrl.txnAmountReadOnly = false;
              scanAndPayCtrl.isTipMandatory = false;
              scanAndPayCtrl.tipReadOnly = false;
              scanAndPayCtrl.billNumberReadOnly = false;
              scanAndPayCtrl.mobileNumberReadOnly = false;
              scanAndPayCtrl.storeIdReadOnly = false;
              scanAndPayCtrl.loyaltyNumberReadOnly = false;
              scanAndPayCtrl.refIdReadOnly = false;
              scanAndPayCtrl.consumerIdReadOnly = false;
              scanAndPayCtrl.terminalIdReadOnly = false;

              scanAndPayCtrl.showTxnAmtError = false;
              scanAndPayCtrl.showMobNoError = false;
              scanAndPayCtrl.showMobNoErrorInitial = true;
              scanAndPayCtrl.showRemarksError = false;
              scanAndPayCtrl.showTipAmtError = false;
              scanAndPayCtrl.showBillNumError = false;
              scanAndPayCtrl.showBillNumErrInitial = false
              scanAndPayCtrl.showStoreIdErrorInitial = false;
              scanAndPayCtrl.showStoreIdError = false;
              scanAndPayCtrl.showLoyaltyErrorInitial  = false;
              scanAndPayCtrl.showLoyaltyErr = false;
              scanAndPayCtrl.showConsumerErrorInitial = false;
              scanAndPayCtrl.showConsumerErr = false;
              scanAndPayCtrl.showRefErrorInitial = false;
              scanAndPayCtrl.showRefErr = false;
              scanAndPayCtrl.showTerminalErrInitial = false;
              scanAndPayCtrl.showTerminalErr = false;
              scanAndPayCtrl.showPurposeErrInitial = false;
              scanAndPayCtrl.showPurposeErr = false;

              scanAndPayCtrl.additionalDataCount = 0;

         }

        /*This function will take user to confirmation template*/
         function showConfirmationPage(evt){
       
              console.log('showConfirmationPage called');

              scanAndPayCtrl.backFrom='confirmPage';

               scanAndPayCtrl.showQrScan = true;
               scanAndPayCtrl.showConfirmationTemplate = true;

               //change title of the page to confirm
               gadgets.pubsub.publish("mvisa.header.title", {
                                   data: "Confirm"
               });

               scanAndPayCtrl.showToggle=false;

              var globalVariablePlugin =  cxp.mobile.plugins['GlobalVariables'];
              if (globalVariablePlugin) {
                   var isMVisaQRJsonSuccessCallback = function(data) {
                      console.log('mVisaQRBefore',data['mVisaJsonString'])
                      scanAndPayCtrl.mVisaQR = angular.fromJson(data['mVisaJsonString']);
                      console.log('mVisaQR: ' , scanAndPayCtrl.mVisaQR);

                      //if user comes back from login page after scanning the values once, then if ,otherwise else
                      if(scanAndPayCtrl.lastVisitedPage=='scanConfirmPage'){
                          scanAndPayCtrl.mVisaQRJSON=scanAndPayCtrl.mVisaQR;
                          console.log('mVisaQRJSON: ' , scanAndPayCtrl.mVisaQRJSON);
       
                          /** iOS Neha Chandak **/
                          /** hide camera **/
                          gadgets.pubsub.publish('hide.mvisa.qr');
       
       

                      }else{
                          /** iOS  Neha Chandak**/
                        if(evt.OS == "iOS"){
                            scanAndPayCtrl.mVisaQRJSON=scanAndPayCtrl.mVisaQR;
                        }
                        else{
                          scanAndPayCtrl.mVisaQRJSON=scanAndPayCtrl.mVisaQR.qrCodeData;
                        }

                        /** In android getting blank values ios giving nil for blank values**/
       
                        if(evt.OS == "iOS"){
       
                        /** making ios and andorid json structure consistent **/
                            scanAndPayCtrl.iOSJson={
                               "addDataMasterCard1" : scanAndPayCtrl.mVisaQRJSON.addDataMasterCard1,
                               "addDataMasterCard2" : scanAndPayCtrl.mVisaQRJSON.addDataMasterCard2,
                               "addDataNpci1" : scanAndPayCtrl.mVisaQRJSON.addDataNpci1,
                               "addDataNpci2" : scanAndPayCtrl.mVisaQRJSON.addDataNpci2,
                               "additionalConsumerDataRequest" : scanAndPayCtrl.mVisaQRJSON.additionalConsumerDataRequest,
                               "additionalDataField" : scanAndPayCtrl.mVisaQRJSON.additionalDataField,
                               "billId" : scanAndPayCtrl.mVisaQRJSON.billID,
                               "cityName" : scanAndPayCtrl.mVisaQRJSON.cityName,
                               "consumerId" : scanAndPayCtrl.mVisaQRJSON.consumerID,
                               "convenienceFeeAmount" : scanAndPayCtrl.mVisaQRJSON.convenienceFeeAmount,
                               "convenienceFeePercentage" : scanAndPayCtrl.mVisaQRJSON.convenienceFeePercentage,
                               "countryCode" : scanAndPayCtrl.mVisaQRJSON.countryCode,
                               "crc" : scanAndPayCtrl.mVisaQRJSON.crc,
                               "currencyCode" : scanAndPayCtrl.mVisaQRJSON.currencyCode,
                               "isAddDataMasterCard1Mandatory" : scanAndPayCtrl.mVisaQRJSON.isAddDataMasterCard1Mandatory,
                               "isAddDataMasterCard2Mandatory" : scanAndPayCtrl.mVisaQRJSON.isAddDataMasterCard2Mandatory,
                               "isAddDataNpci1Mandatory" : scanAndPayCtrl.mVisaQRJSON.isAddDataNpci1Mandatory,
                               "isAddDataNpci2Mandatory" : scanAndPayCtrl.mVisaQRJSON.isAddDataNpci2Mandatory,
                               "isAdditonalConsumerDataRequestMandatory" : scanAndPayCtrl.mVisaQRJSON.isAdditonalConsumerDataRequestMandatory,
                               "isBillIdMandatory" : scanAndPayCtrl.mVisaQRJSON.isBillIDMandatory,
                               "isConsumerIdMandatory" : scanAndPayCtrl.mVisaQRJSON.isConsumerIDMandatory,
                               "isLoyaltyNumberMandatory" : scanAndPayCtrl.mVisaQRJSON.isLoyaltyNumberMandatory,
                               "isMobileNumberMandatory" : scanAndPayCtrl.mVisaQRJSON.isMobileNumberMandatory,
                               "isPrimaryIdMandatory" : scanAndPayCtrl.mVisaQRJSON.isPrimaryIDMandatory,
                               "isPurposeMandatory" : scanAndPayCtrl.mVisaQRJSON.isPurposeMandatory,
                               "isReferenceIdMandatory" : scanAndPayCtrl.mVisaQRJSON.isReferenceIDMandatory,
                               "isSecondaryIdMandatory" : scanAndPayCtrl.mVisaQRJSON.isSecondaryIDMandatory,
                               "isStoreIdMandatory" : scanAndPayCtrl.mVisaQRJSON.isStoreIDMandatory,
                               "isTerminalIdMandatory" : scanAndPayCtrl.mVisaQRJSON.isTerminalIDMandatory,
                               "loyaltyNumber" : scanAndPayCtrl.mVisaQRJSON.loyaltyNumber,
                               "mVisaMerchantId" : scanAndPayCtrl.mVisaQRJSON.mVisaMerchantID,
                               "mVisaMerchantPan" : scanAndPayCtrl.mVisaQRJSON.mVisaMerchantPAN,
                               "masterCardPan1" : scanAndPayCtrl.mVisaQRJSON.masterCardPAN1,
                               "masterCardPan2" :scanAndPayCtrl.mVisaQRJSON.masterCardPAN2,
                               "merchantCategoryCode" : scanAndPayCtrl.mVisaQRJSON.merchantCategoryCode,
                               "merchantName" : scanAndPayCtrl.mVisaQRJSON.merchantName,
                               "mobileNumber" :scanAndPayCtrl.mVisaQRJSON.mobileNumber,
                               "npciid1" : scanAndPayCtrl.mVisaQRJSON.npciid1,
                               "npciid2" : scanAndPayCtrl.mVisaQRJSON.npciid2,
                               "payloadFormatIndicator" : scanAndPayCtrl.mVisaQRJSON.payloadFormatIndicator,
                               "pointOfInitiation" : scanAndPayCtrl.mVisaQRJSON.pointOfInitiation,
                               "postalCode" : scanAndPayCtrl.mVisaQRJSON.postalCode,
                               "primaryId" : scanAndPayCtrl.mVisaQRJSON.primaryID,
                               "primaryIdLength" : scanAndPayCtrl.mVisaQRJSON.primaryIDLength,
                               "purpose" :scanAndPayCtrl.mVisaQRJSON.purpose,
                               "referenceId" :scanAndPayCtrl.mVisaQRJSON.referenceID,
                               "secondaryId" :scanAndPayCtrl.mVisaQRJSON.secondaryID,
                               "secondaryIdLength" :scanAndPayCtrl.mVisaQRJSON.secondaryIDLength,
                               "storeId" :scanAndPayCtrl.mVisaQRJSON.storeID,
                               "tag03"  :scanAndPayCtrl.mVisaQRJSON.tag03,
                               "tag08" :scanAndPayCtrl.mVisaQRJSON.tag08,
                               "tag09" :scanAndPayCtrl.mVisaQRJSON.tag09,
                               "tag10"  :scanAndPayCtrl.mVisaQRJSON.tag10,
                               "tag11"  :scanAndPayCtrl.mVisaQRJSON.tag11,
                               "tag12"  :scanAndPayCtrl.mVisaQRJSON.tag12,
                               "tag13" :scanAndPayCtrl.mVisaQRJSON.tag13,
                               "tag14"  :scanAndPayCtrl.mVisaQRJSON.tag14,
                               "tag15"  :scanAndPayCtrl.mVisaQRJSON.tag15,
                               "tagSixtyTwo10" :scanAndPayCtrl.mVisaQRJSON.tagSixtyTwo10,
                               "tagSixtyTwo15" :scanAndPayCtrl.mVisaQRJSON.tagSixtyTwo15,
                               "tagSixtyTwo16" :scanAndPayCtrl.mVisaQRJSON.tagSixtyTwo16,
                               "tagSixtyTwo17" :scanAndPayCtrl.mVisaQRJSON.tagSixtyTwo17,
                               "tagSixtyTwo18" :scanAndPayCtrl.mVisaQRJSON.tagSixtyTwo18,
                               "tagSixtyTwo19" :scanAndPayCtrl.mVisaQRJSON.tagSixtyTwo19,
                               "tagSixtyTwo20" :scanAndPayCtrl.mVisaQRJSON.tagSixtyTwo20,
                               "tagSixtyTwo21" :scanAndPayCtrl.mVisaQRJSON.tagSixtyTwo21,
                               "tagSixtyTwo22":scanAndPayCtrl.mVisaQRJSON.tagSixtyTwo22,
                               "terminalId" :scanAndPayCtrl.mVisaQRJSON.terminalID,
                               "tipAndFeeIndicator":scanAndPayCtrl.mVisaQRJSON.tipAndFeeIndicator,
                               "transactionAmount" :scanAndPayCtrl.mVisaQRJSON.transactionAmount
                             };

                               /** iOS data coming in string, android data coming in boolean **/
                               /** mVisa Neha Chandak **/

                               if(scanAndPayCtrl.iOSJson.isBillIdMandatory == "false"){
                                    scanAndPayCtrl.iOSJson.isBillIdMandatory = false;
                               }
                               else if (scanAndPayCtrl.iOSJson.isBillIdMandatory == "true")
                               {
                                    scanAndPayCtrl.iOSJson.isBillIdMandatory = true;
                               }

                               if(scanAndPayCtrl.iOSJson.isConsumerIdMandatory == "false"){
                                    scanAndPayCtrl.iOSJson.isConsumerIdMandatory = false;
                               }
                               else if (scanAndPayCtrl.iOSJson.isConsumerIdMandatory == "true")
                               {
                                    scanAndPayCtrl.iOSJson.isConsumerIdMandatory = true;
                               }

                               if(scanAndPayCtrl.iOSJson.isLoyaltyNumberMandatory == "false"){
                                    scanAndPayCtrl.iOSJson.isLoyaltyNumberMandatory = false;
                               }
                               else if (scanAndPayCtrl.iOSJson.isLoyaltyNumberMandatory == "true")
                               {
                                    scanAndPayCtrl.iOSJson.isLoyaltyNumberMandatory = true;
                               }


                               if(scanAndPayCtrl.iOSJson.isMobileNumberMandatory == "false"){
                                    scanAndPayCtrl.iOSJson.isMobileNumberMandatory = false;
                               }
                               else if (scanAndPayCtrl.iOSJson.isMobileNumberMandatory == "true")
                               {
                                    scanAndPayCtrl.iOSJson.isMobileNumberMandatory = true;
                               }


                               if(scanAndPayCtrl.iOSJson.isPrimaryIdMandatory == "false"){
                                    scanAndPayCtrl.iOSJson.isPrimaryIdMandatory = false;
                               }
                               else if (scanAndPayCtrl.iOSJson.isPrimaryIdMandatory == "true")
                               {
                                    scanAndPayCtrl.iOSJson.isPrimaryIdMandatory = true;
                               }


                               if(scanAndPayCtrl.iOSJson.isPurposeMandatory == "false"){
                                    scanAndPayCtrl.iOSJson.isPurposeMandatory = false;
                               }
                               else if (scanAndPayCtrl.iOSJson.isPurposeMandatory == "true")
                               {
                                    scanAndPayCtrl.iOSJson.isPurposeMandatory = true;
                               }


                               if(scanAndPayCtrl.iOSJson.isReferenceIdMandatory == "false"){
                                    scanAndPayCtrl.iOSJson.isReferenceIdMandatory = false;
                               }
                               else if (scanAndPayCtrl.iOSJson.isReferenceIdMandatory == "true")
                               {
                                    scanAndPayCtrl.iOSJson.isReferenceIdMandatory = true;
                               }


                               if(scanAndPayCtrl.iOSJson.isSecondaryIdMandatory == "false"){
                                    scanAndPayCtrl.iOSJson.isSecondaryIdMandatory = false;
                               }
                               else if (scanAndPayCtrl.iOSJson.isSecondaryIdMandatory == "true")
                               {
                                    scanAndPayCtrl.iOSJson.isSecondaryIdMandatory = true;
                               }

                               if(scanAndPayCtrl.iOSJson.isStoreIdMandatory == "false"){
                                    scanAndPayCtrl.iOSJson.isStoreIdMandatory = false;
                               }
                               else if (scanAndPayCtrl.iOSJson.isStoreIdMandatory == "true")
                               {
                                    scanAndPayCtrl.iOSJson.isStoreIdMandatory = true;
                               }


                               if(scanAndPayCtrl.iOSJson.isTerminalIdMandatory == "false"){
                                    scanAndPayCtrl.iOSJson.isTerminalIdMandatory = false;
                               }
                               else if (scanAndPayCtrl.iOSJson.isTerminalIdMandatory == "true")
                               {
                                    scanAndPayCtrl.iOSJson.isTerminalIdMandatory = true;
                               }

                               scanAndPayCtrl.mVisaQRJSON = scanAndPayCtrl.iOSJson;
                        }

                        scanAndPayCtrl.qrCodeMerchantId=scanAndPayCtrl.mVisaQRJSON.mVisaMerchantId;
       
                            console.log('merchant id: ' , scanAndPayCtrl.qrCodeMerchantId);

                            /*if(scanAndPayCtrl.qrCodeMerchantId==undefined || scanAndPayCtrl.qrCodeMerchantId=='nil'){
                                 scanAndPayCtrl.showConfirmationTemplate = false;
                                  //change title of the page to scanAndPay
                                 gadgets.pubsub.publish("mvisa.header.title", {
                                                   data: "Scan and Pay"
                                 });
                                 scanAndPayCtrl.showToggle=true;
                                 scanAndPayCtrl.backFrom="";
                                 gadgets.pubsub.publish('invalid.qr.merchant');
                            }else{
*/
                            /*scanAndPayCtrl.issuer-check if VISA see check digit is present in merchant id or not
                            for VISA check digit comes with scanned QR code*/
                            if(scanAndPayCtrl.qrCodeMerchantId.charAt(0)=="4"){
                                scanAndPayCtrl.issuer="VISA";

                                //set in widget preferences
                                /*scanAndPayCtrl.merchantType="6012";
                                scanAndPayCtrl.posEntryMd="010";*/

                                scanAndPayCtrl.merchantType = lpWidget.getPreference('visaMrchntTp');
                                console.log('merchantType:',scanAndPayCtrl.merchantType);
                                scanAndPayCtrl.posEntryMd = lpWidget.getPreference('visaPosEntryMd');
                                console.log('posEntryMd:',scanAndPayCtrl.posEntryMd);

                                scanAndPayCtrl.purpose=scanAndPayCtrl.mVisaQRJSON.purpose;
                           }else{
                                scanAndPayCtrl.issuer="";
                           }

                           //dont put in else part- for use case of multiple merchants
                           scanAndPayCtrl.merchantType=scanAndPayCtrl.mVisaQRJSON.merchantCategoryCode;//for Rupay get from QR

                           //scanAndPayCtrl.posEntryMd=scanAndPayCtrl.mVisaQRJSON.posEntryMd; //for Rupay get from QR
                           if(scanAndPayCtrl.mVisaQRJSON.pointOfInitiation!=undefined){
                               if(scanAndPayCtrl.mVisaQRJSON.pointOfInitiation.charAt(1)=="1"){
                                   scanAndPayCtrl.posEntryMd=scanAndPayCtrl.posEntryMd + "," + "080";
                               }
                               else if(scanAndPayCtrl.mVisaQRJSON.pointOfInitiation.charAt(1)=="3"){
                                   scanAndPayCtrl.posEntryMd=scanAndPayCtrl.posEntryMd + "," + "090";
                               }
                               else if(scanAndPayCtrl.mVisaQRJSON.pointOfInitiation.charAt(1)=="2"){
                                   scanAndPayCtrl.posEntryMd=scanAndPayCtrl.posEntryMd + "," + "100";
                               }
                           }

                            scanAndPayCtrl.interchangeType="";
                            //save interchangeType and send to offshore team
                            if(scanAndPayCtrl.mVisaQRJSON.mVisaMerchantId!=""){
                              scanAndPayCtrl.interchangeType="Visa";
                              //for only Rupay testing
                              /*scanAndPayCtrl.mVisaQRJSON.mVisaMerchantId="";
                              scanAndPayCtrl.mVisaQRJSON.npciid1="6100060000000034";
                              scanAndPayCtrl.interchangeType="";*/
                            }
                            if(scanAndPayCtrl.mVisaQRJSON.npciid1!="" && scanAndPayCtrl.mVisaQRJSON.npciid1!=undefined && scanAndPayCtrl.mVisaQRJSON.npciid1!="nil"){

                                //added to fix issue 7231- original merchant ID (less than 16 digit) shud be displayed to user
                                scanAndPayCtrl.mVisaQRJSON.npciMerchantId=scanAndPayCtrl.mVisaQRJSON.npciid1;

                                //generate 16 digit merchant id for Rupay
                                scanAndPayCtrl.mVisaQRJSON.npciid1=scanAndPayCtrl.generateMerchantPAN(scanAndPayCtrl.mVisaQRJSON.npciid1);

                                //get card type
                                scanAndPayCtrl.interchangeType=scanAndPayCtrl.interchangeType + "," + "Rupay";

                                if(scanAndPayCtrl.mod10Check(scanAndPayCtrl.mVisaQRJSON.npciid1)){
                                    scanAndPayCtrl.mod10CheckError=true;
                                }else{
                                    scanAndPayCtrl.mod10CheckError=false;
                                }
                            }
                            if(scanAndPayCtrl.mVisaQRJSON.masterCardPan1!="" && scanAndPayCtrl.mVisaQRJSON.masterCardPan1!=undefined && scanAndPayCtrl.mVisaQRJSON.masterCardPan1!="nil"){

                               //added to fix issue 7231- original merchant ID (less than 16 digit) shud be displayed to user
                               scanAndPayCtrl.mVisaQRJSON.masterCardMerchantId=scanAndPayCtrl.mVisaQRJSON.masterCardPan1;

                               //generate 16 digit merchant id for mastercard
                               scanAndPayCtrl.mVisaQRJSON.masterCardPan1=scanAndPayCtrl.generateMerchantPAN(scanAndPayCtrl.mVisaQRJSON.masterCardPan1);

                               //get card type
                               scanAndPayCtrl.interchangeType=scanAndPayCtrl.interchangeType + "," + "Mastercard";

                               if(scanAndPayCtrl.mod10Check(scanAndPayCtrl.mVisaQRJSON.masterCardPan1)){
                                   scanAndPayCtrl.mod10CheckError=true;
                               }else{
                                   scanAndPayCtrl.mod10CheckError=false;
                               }
                            }

                            console.log('interchange type:',scanAndPayCtrl.interchangeType);


                            /*if merchant id does not belong to valid issuers go to native
                              stop camera and show invalid QR code above it*/
                              for(var i = 0; i < scanAndPayCtrl.issuerDetailsList.length; i++){
                               //for local use
                              // for(var i = 0; i < 2; i++){
                                  if(scanAndPayCtrl.qrCodeMerchantId.charAt(0)==scanAndPayCtrl.issuerDetailsList[i].issuerIdentCode){
                                        scanAndPayCtrl.isValidIssuer=true;
                                       // if(scanAndPayCtrl.mod10Check(scanAndPayCtrl.qrCodeMerchantId)){
                                       //calculate mod10 check on first 15 digits of mVisa merchant pan
                                       if(scanAndPayCtrl.mod10Check(scanAndPayCtrl.mVisaQRJSON.mVisaMerchantPan)){
                                            scanAndPayCtrl.mod10CheckError=true;
                                        }else{
                                            scanAndPayCtrl.mod10CheckError=false;
                                        }
                                        break;
                                  }else{
                                        scanAndPayCtrl.isValidIssuer=false;
                                  }
                              }
                              if(!scanAndPayCtrl.isValidIssuer || scanAndPayCtrl.mod10CheckError){
                                 scanAndPayCtrl.showConfirmationTemplate = false;
                                  //change title of the page to scanAndPay
                                 gadgets.pubsub.publish("mvisa.header.title", {
                                                   data: "Scan and Pay"
                                 });
                                 scanAndPayCtrl.showToggle=true;
                                 scanAndPayCtrl.backFrom="";
                                 gadgets.pubsub.publish('invalid.qr.merchant');
                              }
                           // }
                      }

                      //scanAndPayCtrl.testForTag62();
                      scanAndPayCtrl.parseQRJson();
                      $scope.$apply();
                   };

                   var isMVisaQRJsonErrorCallback = function(data) {
                       console.log('Error happened while communicating between native and hybrid');
                   };

                   globalVariablePlugin.getMVisaJson(
                       isMVisaQRJsonSuccessCallback,
                       isMVisaQRJsonErrorCallback
                   );
                } else {
                   console.log('Cant find Plugin');
              }
         }

         /*This function will take user to payee key template*/
         function showPayeeKeyPage(evt){
                console.log('showPayeeKeyPage called');
                //console.log('evt.from:',evt.from);
                if((evt!=undefined && evt.from=='nativePayeeKeyBtn') || scanAndPayCtrl.lastVisitedPage=='keyentry'){
                    scanAndPayCtrl.showQrScan=true;
                    scanAndPayCtrl.triggerClickEvent('');
                    if(scanAndPayCtrl.lastVisitedPage=='keyentry'){
                        scanAndPayCtrl.secondTime=true;
                        scanAndPayCtrl.getLastKeyEntryJson();//to get state of keyentry page if coming back from login
                    }
                }
                else{
                    scanAndPayCtrl.showQrScan=false;
                    scanAndPayCtrl.secondTime=true;
                }
                scanAndPayCtrl.showToggle=true;
                scanAndPayCtrl.showConfirmationTemplate = false;
                 //change title of the page to scanAndPay
                gadgets.pubsub.publish("mvisa.header.title", {
                               data: "Scan and Pay"
                });
                $scope.$apply();
         }

         scanAndPayCtrl.getLastKeyEntryJson=function(){
              var globalVariablePlugin =  cxp.mobile.plugins['GlobalVariables'];
              if (globalVariablePlugin) {
                   var isMVisaKeyJsonSuccessCallback = function(data) {

                      scanAndPayCtrl.lastKeyEntryJson = angular.fromJson(data['mVisaJsonString']);
                      console.log('lastKeyEntryJson: ' , scanAndPayCtrl.lastKeyEntryJson);
                      scanAndPayCtrl.payeeKeyObj={};
                      scanAndPayCtrl.payeeKeyObj.merchantId=scanAndPayCtrl.lastKeyEntryJson.mVisaMerchantId;
                      scanAndPayCtrl.payeeKeyObj.amount=parseFloat(scanAndPayCtrl.lastKeyEntryJson.transactionAmount)-parseFloat(scanAndPayCtrl.lastKeyEntryJson.convenienceFeeAmount);
                      scanAndPayCtrl.payeeKeyObj.tip=scanAndPayCtrl.lastKeyEntryJson.convenienceFeeAmount;
                      scanAndPayCtrl.payeeKeyObj.remarks=scanAndPayCtrl.lastKeyEntryJson.remarks;

                   };
                   var isMVisaKeyJsonErrorCallback = function(data) {
                       console.log('Error happened while communicating between native and hybrid');
                   };

                   globalVariablePlugin.getMVisaJson(
                       isMVisaKeyJsonSuccessCallback,
                       isMVisaKeyJsonErrorCallback
                   );
              } else {
                   console.log('Cant find Plugin');
              }
         }

         scanAndPayCtrl.getLandingLoginPage=function(){
           var globalVariablePlugin =  cxp.mobile.plugins['GlobalVariables'];
           if (globalVariablePlugin) {
                var isMpinSetupSuccessCallback = function(data) {
                   console.log('mpinFlag: ' , data['mpinFlag']);
                   if(data['mpinFlag']=='true'){
                      gadgets.pubsub.publish('launchpad-mpinlogin');
                  }else{
                      gadgets.pubsub.publish('getBackToLoginScreen');
                  }
                };
                var isMpinSetupErrorCallback = function(data) {
                    console.log('Error happened while communicating between native and hybrid');
                };

                globalVariablePlugin.getMpinFlag(
                    isMpinSetupSuccessCallback,
                    isMpinSetupErrorCallback
                );
           } else {
                console.log('Cant find Plugin');
           }
        }

         //called when toggle is changed by swiping or when native payee key btn clicked. It toggles switch state
         scanAndPayCtrl.triggerClickEvent = function(from){
            //to stop toggling to qrsccan, when payee key lbl is pressed


            if((from=='key' && !scanAndPayCtrl.secondTime) || from!='key'){
                if(from=='key'){
                    scanAndPayCtrl.secondTime=true;
                }else{
                    scanAndPayCtrl.secondTime=false;
                }
               console.log('Inside triggerClickEvent function');
               var toggleSwitch = angular.element('#toggleSwitch');
               if(angular.isDefined(toggleSwitch)){
                console.log('click event is about to be triggered');
                $timeout(function(){
                    angular.element('#toggleSwitch').triggerHandler('click');
                },500);
               }
           }
         }

         //called on toggle change
         scanAndPayCtrl.setPayMode = function(){
            console.log("setPayMode called ");
            scanAndPayCtrl.showQrScan=!scanAndPayCtrl.showQrScan;
            scanAndPayCtrl.showConfirmationTemplate=false;
             //change title of the page to scanAndPay
            gadgets.pubsub.publish("mvisa.header.title", {
                           data: "Scan and Pay"
            });
            console.log("scanAndPayCtrl.showQrScan:"+scanAndPayCtrl.showQrScan);
            if(scanAndPayCtrl.showQrScan){
                 scanAndPayCtrl.secondTime=false;
                 scanAndPayCtrl.lastVisitedPage='';
                 scanAndPayCtrl.resetConfirmPageFields();
                 gadgets.pubsub.publish("scan.mvisa.qr",{
                              data: "4:from here"
                              });

            }else{
                gadgets.pubsub.publish('hide.mvisa.qr');
                if(scanAndPayCtrl.lastVisitedPage!='keyentry'){//otherwise it will go in infinite loop
                    showPayeeKeyPage();
                }
            }
        }

         //It will store the mVisa json in globalvariable and go to login page
         scanAndPayCtrl.proceedToLogin= function(isFormValid){
            console.log("isFormValid",isFormValid);
            scanAndPayCtrl.isValidIssuer=true;
            scanAndPayCtrl.payeeKeyFormSubmitted=true;

            scanAndPayCtrl.checkMerchantId();

            console.log("scanAndPayCtrl.mod10CheckError:",scanAndPayCtrl.mod10CheckError);
            var isInValidMerchant=scanAndPayCtrl.checkInValidUser(true);
            console.log("scanAndPayCtrl.checkInValidUser:",isInValidMerchant);

            if(isFormValid && !scanAndPayCtrl.mod10CheckError && !isInValidMerchant){
                scanAndPayCtrl.makeKeyStandardJson();
                scanAndPayCtrl.setMVisaLoginType();
                scanAndPayCtrl.saveScanAndPayFlag('keyentry');
                scanAndPayCtrl.getLandingLoginPage();
            }
            else{
                return false;
            }

        }

        scanAndPayCtrl.checkMerchantId=function(){
             //to check whether merchant id entered belongs to valid issuers or not. dont allow RUPAy for manual entry
              for(var i = 0; i < scanAndPayCtrl.issuerDetailsList.length; i++){
               //for local use
               // for(var i = 0; i < 2; i++){

                if(scanAndPayCtrl.payeeKeyObj.merchantId!=undefined){

                   /*scanAndPayCtrl.issuer-check if VISA see check digit is present in merchant id or not
                   for VISA check digit comes with scanned QR code*/
                   if(scanAndPayCtrl.payeeKeyObj.merchantId.charAt(0)=="4"){
                        scanAndPayCtrl.issuer="VISA";

                        //scanAndPayCtrl.purpose="";
                        /*scanAndPayCtrl.merchantType="6012";
                        scanAndPayCtrl.posEntryMd="010";*/

                        scanAndPayCtrl.merchantType = lpWidget.getPreference('visaMrchntTp');
                        console.log('merchantType:',scanAndPayCtrl.merchantType);
                        scanAndPayCtrl.posEntryMd = lpWidget.getPreference('visaPosEntryMd');
                        console.log('posEntryMd:',scanAndPayCtrl.posEntryMd);
                   }else{
                        scanAndPayCtrl.issuer="";
                   }

                   if(scanAndPayCtrl.payeeKeyObj.merchantId.charAt(0)==scanAndPayCtrl.issuerDetailsList[i].issuerIdentCode && scanAndPayCtrl.payeeKeyObj.merchantId.charAt(0)!="6"){
                       scanAndPayCtrl.interchangeType=scanAndPayCtrl.issuerDetailsList[i].issuerName; //only "VISA" for now;
                       scanAndPayCtrl.isValidIssuer=true;
                       break;
                   }else{
                     scanAndPayCtrl.isValidIssuer=false;
                   }
                }
              }
              return scanAndPayCtrl.isValidIssuer;
        }


        scanAndPayCtrl.checkInValidUser = function(formValid){
            console.log('checkInValidUser called');
            var flag = true;
            if(formValid){
                flag = scanAndPayCtrl.checkMerchantId();
            }
            console.log('checkInValidUser :',!flag);//!false=true
           
            return !flag;//true-invalid user
        }


        /*added for android- bcz type tel doesnt support ngmin-max*/
        scanAndPayCtrl.checkTipMax = function(tip){
          console.log('checkTipMax called');
          if(parseFloat(tip)<10000 || tip=="" || tip==undefined){
            return false;
          }else{
            return true;
          }
        }

        scanAndPayCtrl.checkAmtMax = function(amt){
          console.log('checkAmtMax called');
          if(parseFloat(amt)<1000000 || amt=="" || amt==undefined){
            return false;
          }else{
            return true;
          }
        }

        scanAndPayCtrl.checkAmtMin = function(amt){
          console.log('checkAmtMin called');
          if(parseFloat(amt)<1 && amt!="" && amt!=undefined){
            return true;
          }else{
            return false;
          }
        }
        /*added for android- bcz type tel doesnt support ngmin-max*/


         scanAndPayCtrl.confirmToLogin= function(){
              console.log('confirmToLogin called');
              scanAndPayCtrl.makeQRStandardJson();
              scanAndPayCtrl.setMVisaLoginType();
              scanAndPayCtrl.saveScanAndPayFlag('scanConfirmPage');
              scanAndPayCtrl.getLandingLoginPage();
         }

         //to store paymode scan/key entry, to come back to that page on back from login
          scanAndPayCtrl.saveScanAndPayFlag= function(page){
            console.log("saveScanAndPayFlag called",page);
            var globalVariablePluginSetLogin = cxp.mobile.plugins['GlobalVariables'];
            if(globalVariablePluginSetLogin){
            console.log('Global Variable plugin registered');
               globalVariablePluginSetLogin.setScanAndPayFlag(null,null,page);
            } else{
               console.log('Fatal Error: Global Variable plugin not registered');
            }
         };

        //to check which page was visited last before going to login. to come back on right page from login back
        scanAndPayCtrl.checkScanAndPayFlag = function(){
            console.log('checkScanAndPayFlag called');
            var globalVariablePlugin = cxp.mobile.plugins['GlobalVariables'];
            if(globalVariablePlugin){
                var scanAndPaySuccessCallback = function(data) {
                    console.log('success: ' + JSON.stringify(data));
                     if (data['scanAndPay'] == 'keyentry') {
                       console.log('inside if success: ' + JSON.stringify(data));
                         scanAndPayCtrl.lastVisitedPage='keyentry';
                         showPayeeKeyPage();
                     }else if(data['scanAndPay'] == 'scanConfirmPage'){
                        console.log('success:scanCofirmPage');
                        scanAndPayCtrl.lastVisitedPage='scanConfirmPage';
                        showConfirmationPage();
                     }else{
                        scanAndPayCtrl.resetVariables();
                        //set it to identify second Qr scn or key entry in one mvisa flow
                        scanAndPayCtrl.lastVisitedPage='';
                        scanAndPayCtrl.resetConfirmPageFields();

                        //timeout to let all templates first come properly then call native, to ask permission and show camera
                        $timeout(function(){
                                 console.log("1:from here");
                                 gadgets.pubsub.publish("scan.mvisa.qr",{
                                                        data: "1:from here"
                                                        });

                        },500)
                     }
                };
                var scanAndPayErrorCallback = function(data) {
                   console.log('failure: ' + JSON.stringify(data));
                };

                globalVariablePlugin.getScanAndPayFlag(
                    scanAndPaySuccessCallback,
                    scanAndPayErrorCallback
                );

            } else {
            }
        }

        scanAndPayCtrl.resetConfirmPageFields=function(){

          scanAndPayCtrl.mvisaConfirmFormSubmitted=false;

          scanAndPayCtrl.remarks='';
          scanAndPayCtrl.tipAmount='';
          scanAndPayCtrl.txnAmount='';
          scanAndPayCtrl.billNumber="";
          scanAndPayCtrl.mobNumber="";
          scanAndPayCtrl.storeId="";
          scanAndPayCtrl.loyaltyNo="";
          scanAndPayCtrl.refId="";
          scanAndPayCtrl.consumerId="";
          scanAndPayCtrl.terminalId="";
          scanAndPayCtrl.purpose="";

          scanAndPayCtrl.showTip=false;

          scanAndPayCtrl.showTxnAmtError = false;
          scanAndPayCtrl.showMobNoError = false;
          scanAndPayCtrl.showMobNoErrorInitial = false;
          scanAndPayCtrl.showRemarksError = false;
          scanAndPayCtrl.showTipAmtError = false;
          scanAndPayCtrl.showBillNumError = false;
          scanAndPayCtrl.showBillNumErrInitial = false
          scanAndPayCtrl.showStoreIdErrorInitial = false;
          scanAndPayCtrl.showStoreIdError = false;
          scanAndPayCtrl.showLoyaltyErrorInitial  = false;
          scanAndPayCtrl.showLoyaltyErr = false;
          scanAndPayCtrl.showConsumerErrorInitial = false;
          scanAndPayCtrl.showConsumerErr = false;
          scanAndPayCtrl.showRefErrorInitial = false;
          scanAndPayCtrl.showRefErr = false;
          scanAndPayCtrl.showTerminalErrInitial = false;
          scanAndPayCtrl.showTerminalErr = false;
          scanAndPayCtrl.showPurposeErrInitial = false;
          scanAndPayCtrl.showPurposeErr = false;

          scanAndPayCtrl.mVisaQRJSON={};
        }

         //to store mVisaJson created using payee key form in global variable
         scanAndPayCtrl.saveMVisaJson= function(mVisaJson){
           console.log("saveMVisaJson called",mVisaJson);
           var globalVariablePluginSetLogin = cxp.mobile.plugins['GlobalVariables'];
           if(globalVariablePluginSetLogin){
           console.log('Global Variable plugin registered');
              globalVariablePluginSetLogin.setMVisaJson(null,null,JSON.stringify(mVisaJson));
           } else{
              console.log('Fatal Error: Global Variable plugin not registered');
           }
        };

         //to store mVisaFlag in globalvariable to decide post login landing page
         scanAndPayCtrl.setMVisaLoginType= function(){
           var globalVariablePluginSetLogin = cxp.mobile.plugins['GlobalVariables'];
           if(globalVariablePluginSetLogin){
           console.log('Global Variable plugin registered');
              globalVariablePluginSetLogin.setMVisaLoginFlag(null,null,'true');
           } else{
              console.log('Fatal Error: Global Variable plugin not registered');
           }
         };

         //to handle mobile back events
         gadgets.pubsub.subscribe("native.back", function(event) {
                                  
            console.log("coming back from" + event.data);
            console.log("native.back handled in scanAndPayCtrl",scanAndPayCtrl.backFrom);
            //if back pressed on confirm page ..go back to scan page
            if(scanAndPayCtrl.backFrom=='confirmPage'){
                 console.log('inside if');
                 scanAndPayCtrl.showQrScan=true;
                 scanAndPayCtrl.showToggle=true;
                 scanAndPayCtrl.showConfirmationTemplate=false;
                 //change title of the page to scanAndPay
                 gadgets.pubsub.publish("mvisa.header.title", {
                               data: "Scan and Pay"
                 });
                 $scope.$apply();


                 scanAndPayCtrl.lastVisitedPage='';
                 scanAndPayCtrl.resetConfirmPageFields();
                 console.log("2:from here");
                 gadgets.pubsub.publish("scan.mvisa.qr",{
                    data: "2:from here"
                });


                 gadgets.pubsub.publish("js.back", {
                      data: "ENABLE_BACK"
                 });
                 scanAndPayCtrl.backFrom='';
            }else{
                //go back to login page
                 gadgets.pubsub.publish('hide.mvisa.qr');
                 console.log('inside else');
                 scanAndPayCtrl.getLandingLoginPage();
            }
        });

         //to handle mobile back events
         gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
           console.log("device back GoBackInitiate handled in scanAndPayCtrl");
           if(scanAndPayCtrl.backFrom=='confirmPage'){
                console.log('inside if');
                scanAndPayCtrl.showQrScan=true;
                scanAndPayCtrl.showToggle=true;
                scanAndPayCtrl.showConfirmationTemplate=false;
                 //change title of the page to scanAndPay
                gadgets.pubsub.publish("mvisa.header.title", {
                               data: "Scan and Pay"
                });
                $scope.$apply();
                scanAndPayCtrl.lastVisitedPage='';
                scanAndPayCtrl.resetConfirmPageFields();
                console.log("3:from here");
                gadgets.pubsub.publish("scan.mvisa.qr",{
                    data: "3:from here"
                });
                                  
                gadgets.pubsub.publish("js.back", {
                     data: "ENABLE_BACK"
                });
                scanAndPayCtrl.backFrom='';
           }else{
               localStorage.clear();
               scanAndPayCtrl.getLandingLoginPage();
               gadgets.pubsub.publish("js.back", {
                           data: "ENABLE_HOME"
               });
           }
       });

       scanAndPayCtrl.testForTag62 = function(){
         //user entry all ***
         /*scanAndPayCtrl.mVisaQRJSON.billId = "***";
         scanAndPayCtrl.mVisaQRJSON.mobileNumber = "***";
         scanAndPayCtrl.mVisaQRJSON.storeId = "***";
         scanAndPayCtrl.mVisaQRJSON.loyaltyNumber = "***";
         scanAndPayCtrl.mVisaQRJSON.referenceId = "***";
         scanAndPayCtrl.mVisaQRJSON.consumerId = "***";
         scanAndPayCtrl.mVisaQRJSON.terminalId = "***";
         scanAndPayCtrl.mVisaQRJSON.purpose = "***"*/

	     /*scanAndPayCtrl.mVisaQRJSON.isBillIdMandatory=true;
         scanAndPayCtrl.mVisaQRJSON.isMobileNumberMandatory=true;
         scanAndPayCtrl.mVisaQRJSON.isStoreIdMandatory=true;
         scanAndPayCtrl.mVisaQRJSON.isLoyaltyNumberMandatory=true;
         scanAndPayCtrl.mVisaQRJSON.isReferenceIdMandatory=true;
         scanAndPayCtrl.mVisaQRJSON.isConsumerIdMandatory=true;
         scanAndPayCtrl.mVisaQRJSON.isTerminalIdMandatory=true;
         scanAndPayCtrl.mVisaQRJSON.isPurposeMandatory=true;*/
       }

         //This function will perform all required validations basis business reuqirements, pull out reuqire data from JSON, prepopualte it on
                    //Screen data fields and show it to customer
        scanAndPayCtrl.parseQRJson = function(){

            scanAndPayCtrl.additionalDataCount=0;

            console.log('in parse QR json');
            console.log('transactionAmount from json:',scanAndPayCtrl.mVisaQRJSON.transactionAmount);
       
            console.log('convenienceFeeAmount from json:',scanAndPayCtrl.mVisaQRJSON.convenienceFeeAmount);

            if(scanAndPayCtrl.lastVisitedPage=='scanConfirmPage'){
                 //Check whether Transaction Amount field is available in QR or added before going to login screen
                  if(scanAndPayCtrl.mVisaQRJSON.transactionAmount!=undefined && scanAndPayCtrl.mVisaQRJSON.transactionAmount!='nil'){
                      if(scanAndPayCtrl.mVisaQRJSON.convenienceFeeAmount!=undefined && scanAndPayCtrl.mVisaQRJSON.convenienceFeeAmount!='' && scanAndPayCtrl.mVisaQRJSON.convenienceFeeAmount!='nil'){
                          console.log("I am here" + scanAndPayCtrl.mVisaQRJSON.transactionAmount);
                          scanAndPayCtrl.txnAmount =parseFloat(scanAndPayCtrl.mVisaQRJSON.transactionAmount)-parseFloat(scanAndPayCtrl.mVisaQRJSON.convenienceFeeAmount);
                      }else{
                          console.log("I am here1" + scanAndPayCtrl.mVisaQRJSON.transactionAmount);
                          scanAndPayCtrl.txnAmount =parseFloat(scanAndPayCtrl.mVisaQRJSON.transactionAmount);
                      }
                  }
            }else if(scanAndPayCtrl.mVisaQRJSON.transactionAmount!=undefined && scanAndPayCtrl.mVisaQRJSON.transactionAmount!='nil'){
                scanAndPayCtrl.txnAmount =parseFloat(scanAndPayCtrl.mVisaQRJSON.transactionAmount);
                scanAndPayCtrl.txnAmountReadOnly = true;
             }else{
               scanAndPayCtrl.txnAmountReadOnly = false;
             }

            //Check whether to show tip or not
            var tipIndicator = scanAndPayCtrl.mVisaQRJSON.tipAndFeeIndicator;
            console.log('Tip Indicator: '+ tipIndicator);
            if(tipIndicator == null){
              scanAndPayCtrl.showTip = false;
            }else{
              if(tipIndicator == '01' || tipIndicator == '02' || tipIndicator == '03'){
                scanAndPayCtrl.showTip = true;
                if (tipIndicator == '01'){
                  scanAndPayCtrl.isTipMandatory = true;
                  scanAndPayCtrl.tipReadOnly = false;
                  /*this if will check if user has filled values earlier and come back from login page
                  and populate them again*/
                   if(scanAndPayCtrl.mVisaQRJSON.convenienceFeeAmount!=undefined && scanAndPayCtrl.mVisaQRJSON.convenienceFeeAmount!='nil'){
                      scanAndPayCtrl.tipAmount =parseFloat(scanAndPayCtrl.mVisaQRJSON.convenienceFeeAmount);
                   }


                }else if(tipIndicator == '02'){
                  scanAndPayCtrl.isTipMandatory = true;
                  scanAndPayCtrl.tipReadOnly = true;
                  if(scanAndPayCtrl.mVisaQRJSON.convenienceFeeAmount!=undefined && scanAndPayCtrl.mVisaQRJSON.convenienceFeeAmount!='nil'){
                    scanAndPayCtrl.tipAmount =parseFloat(scanAndPayCtrl.mVisaQRJSON.convenienceFeeAmount);

                  }

                }
                else if(tipIndicator == '03'){
                  var convenienceFeePer = scanAndPayCtrl.mVisaQRJSON.convenienceFeePercentage;
                  var transactionAmount = scanAndPayCtrl.mVisaQRJSON.transactionAmount;

                  //if user comes back from login page, remove earlier calculated tip from transactionAmount
                  if(scanAndPayCtrl.lastVisitedPage=='scanConfirmPage'){
                    if(scanAndPayCtrl.mVisaQRJSON.convenienceFeeAmount!=''){
                        transactionAmount=parseFloat(transactionAmount)-parseFloat(scanAndPayCtrl.mVisaQRJSON.convenienceFeeAmount);
                    }
                  }

                  if(transactionAmount == 'nil' | transactionAmount == null | transactionAmount == "0"){
                    manualTipCalcFlag = true;
                  }else{

                    scanAndPayCtrl.mVisaQRJSON.convenienceFeeAmount = (parseFloat(transactionAmount) * parseFloat(convenienceFeePer))/100;
                    scanAndPayCtrl.tipAmount = parseFloat(scanAndPayCtrl.mVisaQRJSON.convenienceFeeAmount.toFixed(2));
                    manualTipCalcFlag = false;

                    console.log('tip indicator 3 tip amt calculated on percent:',scanAndPayCtrl.tipAmount);
                  }
                  scanAndPayCtrl.isTipMandatory = true;
                  scanAndPayCtrl.tipReadOnly = true;
                }
              }
            }

            //Checking whether BillNumber, Mobile Number, Store ID, Loyalty Number, Reference ID, Consumer ID, Terminal ID, Purpose are present or not
            // 1. Bill Number = tag01
            var billNumber = scanAndPayCtrl.mVisaQRJSON.billId;
            console.log('BIll Number:' + billNumber);
            if(scanAndPayCtrl.mVisaQRJSON.hasOwnProperty('billId')){
                if(billNumber != null && billNumber != 'nil' && billNumber.length>=1) {
                   // if(billNumber.includes('***')){
                   if(billNumber.indexOf('***')!=-1){
                        scanAndPayCtrl.showBillNumber = true;
                        scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                        billNumber = billNumber.replace('***','');
                        scanAndPayCtrl.mVisaQRJSON.billId = billNumber;
                        scanAndPayCtrl.billNumber = billNumber;
                        scanAndPayCtrl.billNumberReadOnly = false;
                    }
                    else if(scanAndPayCtrl.mVisaQRJSON.isBillIdMandatory==false){// && scanAndPayCtrl.lastVisitedPage=='scanConfirmPage'){
                       scanAndPayCtrl.showBillNumber = true;
                       scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                       scanAndPayCtrl.billNumberReadOnly = true;

                       //Check whether value captured from QR is valid or not
                       if(scanAndPayCtrl.validateCustomData(billNumber) == 'frmtErr'){
                         errMsg = "Bill Number captured in QR is incorrect (provided number is "+billNumber+")";
                       }else if (scanAndPayCtrl.validateCustomData(billNumber) == 'mxLnErr'){
                         errMsg = "Bill Number captured in QR is too long (provided number is "+billNumber+")";
                       }else if (scanAndPayCtrl.validateCustomData(billNumber) == 'mnLnErr'){
                         errMsg = "Bill Number is not available in QR code";
                       }else if (scanAndPayCtrl.validateCustomData(billNumber) == 'nilErr' | scanAndPayCtrl.validateCustomData(billNumber) == 'nullErr'){
                         errMsg = "Bill Number is not available in QR code";
                       }else{
                         errMsg = "";
                       }
                       if(errMsg == null | errMsg ==""){
                         scanAndPayCtrl.showBillNumErrInitial = false;
                         scanAndPayCtrl.showBillNumError  = false;
                         scanAndPayCtrl.billNumber = billNumber;
                       }else{
                         scanAndPayCtrl.showBillNumErrInitial = true;
                         scanAndPayCtrl.showBillNumError  = false;
                         scanAndPayCtrl.billNumErrInitial = errMsg;
                       }
                    }else{
                         scanAndPayCtrl.showBillNumber = true;
                         scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                         scanAndPayCtrl.billNumber=scanAndPayCtrl.mVisaQRJSON.billId;
                    }
                }else if(billNumber == null  || billNumber=="" || billNumber == 'nil'){
                  if(scanAndPayCtrl.mVisaQRJSON.isBillIdMandatory == false){
                      scanAndPayCtrl.showBillNumber = false;
                  }
                }
                else{
                    scanAndPayCtrl.showBillNumber = false;
                }
              }else if(scanAndPayCtrl.mVisaQRJSON.isBillIdMandatory==false){
                 scanAndPayCtrl.showBillNumber = false;
              }else if(scanAndPayCtrl.mVisaQRJSON.isBillIdMandatory == true){
                  scanAndPayCtrl.showBillNumber = true;
                  scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                  scanAndPayCtrl.mVisaQRJSON.billId = billNumber;
                  scanAndPayCtrl.billNumber = billNumber;
                  scanAndPayCtrl.billNumberReadOnly = false;
              }else{
                scanAndPayCtrl.showBillNumber = false;
              }

           // 2. Mobile number = tag02
           var mobileNumber = scanAndPayCtrl.mVisaQRJSON.mobileNumber;
           console.log('Mobile Number:' + mobileNumber);
           if(scanAndPayCtrl.mVisaQRJSON.hasOwnProperty('mobileNumber')){
             if (mobileNumber != null && mobileNumber != 'nil' && mobileNumber.length >= 1){
       
                //if(mobileNumber.includes('***')){
                if(mobileNumber.indexOf('***')!=-1){
                    scanAndPayCtrl.showMobNumber = true;
                    scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                    mobileNumber = mobileNumber.replace('***','');
                    scanAndPayCtrl.mVisaQRJSON.mobileNumber = mobileNumber;
                    scanAndPayCtrl.mobNumber = mobileNumber;
                    scanAndPayCtrl.mobileNumberReadOnly = false;
                }
       
                else if(scanAndPayCtrl.mVisaQRJSON.isMobileNumberMandatory==false){// && scanAndPayCtrl.lastVisitedPage=='scanConfirmPage'){
                     scanAndPayCtrl.showMobNumber = true;
                     scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                     scanAndPayCtrl.mobileNumberReadOnly = true;
                     if(!angular.isNumber(parseFloat(mobileNumber))){
                       scanAndPayCtrl.showMobNoErrorInitial = true;
                       scanAndPayCtrl.mobileNoErrorInitial = "Mobile number captured in QR is incorrect (provided number is "+mobileNumber+")";
                     }else if (mobileNumber.length > idfcConstants.MVISA_MAX_MOB_LENGTH){
                       scanAndPayCtrl.showMobNoErrorInitial = true;
                       scanAndPayCtrl.mobileNoErrorInitial = "Mobile number captured in QR too long (provided number is "+mobileNumber+")";
                     }else if(mobileNumber.length < idfcConstants.MVISA_MIN_MOB_LENGTH && mobileNumber.length != 0){
                       scanAndPayCtrl.showMobNoErrorInitial = true;
                       scanAndPayCtrl.mobileNoErrorInitial = "Mobile number captured in QR too short (provided number is "+mobileNumber+")";
                     }else if (mobileNumber.length ==0){
                       scanAndPayCtrl.showMobNoErrorInitial = true;
                       scanAndPayCtrl.mobileNoErrorInitial = "Mobile number is not available in QR";
                     }else if (mobileNumber == null | mobileNumber == 'nil'){
                       scanAndPayCtrl.showMobNoErrorInitial = true;
                       scanAndPayCtrl.mobileNoErrorInitial = "Mobile number captured in QR is invalid";
                     }
                     else{
                       scanAndPayCtrl.showMobNoErrorInitial = false;
                       scanAndPayCtrl.mobNumber = mobileNumber;
                     }
                }else{
                     scanAndPayCtrl.showMobNumber = true;
                     scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                     scanAndPayCtrl.mobNumber=scanAndPayCtrl.mVisaQRJSON.mobileNumber;
                }
             }else if(mobileNumber == null | mobileNumber == 'nil' | mobileNumber == ''){
                scanAndPayCtrl.showMobNumber = false;
             }
           }else if(scanAndPayCtrl.mVisaQRJSON.isMobileNumberMandatory==false){
             scanAndPayCtrl.showMobNumber = false;
           }
           else if(scanAndPayCtrl.mVisaQRJSON.isMobileNumberMandatory==true){
            scanAndPayCtrl.showMobNumber = true;
            scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
            scanAndPayCtrl.mVisaQRJSON.mobileNumber = mobileNumber;
            scanAndPayCtrl.mobNumber = mobileNumber;
            scanAndPayCtrl.mobileNumberReadOnly = false;
           }else{
             scanAndPayCtrl.showMobNumber = false;
           }

           // 3. Store ID = tag03
           var storeId = scanAndPayCtrl.mVisaQRJSON.storeId;
           console.log('Store ID:' + storeId);

           if(scanAndPayCtrl.mVisaQRJSON.hasOwnProperty('storeId')){
                 if (storeId != null && storeId != 'nil' && storeId.length >=1){
                    if(scanAndPayCtrl.additionalDataCount < idfcConstants.MVISA_MAX_ADDITIONAL_DP){
       
                       // if(storeId.includes('***')){
                       if(storeId.indexOf('***')!=-1){
                            storeId = storeId.replace('***','');
                            scanAndPayCtrl.showStoreId = true;
                            scanAndPayCtrl.mVisaQRJSON.storeId = storeId;
                            scanAndPayCtrl.storeId = storeId;
                            scanAndPayCtrl.storeIdReadOnly = false;
                            scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
       
                        }
       
                        else if(scanAndPayCtrl.mVisaQRJSON.isStoreIdMandatory==false){// && scanAndPayCtrl.mVisaQRJSON.lastVisitedPage=='scanConfirmPage'){
                             scanAndPayCtrl.showStoreId = true;
                             scanAndPayCtrl.storeIdReadOnly = true;
                             scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                             //Check whether value captured from QR is valid or not
                             if(scanAndPayCtrl.validateCustomData(storeId) == 'frmtErr'){
                               errMsg = "Store Id captured in QR is incorrect (provided number is "+storeId+")";
                             }else if (scanAndPayCtrl.validateCustomData(storeId) == 'mxLnErr'){
                               errMsg = "Store Id captured in QR is too long (provided number is "+storeId+")";
                             }else if (scanAndPayCtrl.validateCustomData(storeId) == 'mnLnErr'){
                               errMsg = "Store Id is not available in QR code";
                             }else if (scanAndPayCtrl.validateCustomData(storeId) == 'nilErr' | scanAndPayCtrl.validateCustomData(storeId) == 'nullErr'){
                               errMsg = "Store Id is not available in QR code";
                             }else{
                               errMsg = "";
                             }
                             if(errMsg == null | errMsg ==""){
                               scanAndPayCtrl.showStoreIdErrorInitial = false;
                               scanAndPayCtrl.showStoreIdError  = false;
                               scanAndPayCtrl.storeId = storeId;
                             }else{
                               scanAndPayCtrl.showStoreIdErrorInitial = true;
                               scanAndPayCtrl.showStoreIdError  = false;
                               scanAndPayCtrl.storeIdErrorInitial = errMsg;
                             }
                         }else{
                            //if user comes back from login and entered loyalty number manually earlier
                            scanAndPayCtrl.showStoreId = true;
                            scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                            scanAndPayCtrl.storeId=scanAndPayCtrl.mVisaQRJSON.storeId;
                         }
                    }else{
                        //dont show the fields-already 2 fields are there
                        scanAndPayCtrl.showStoreId = false;
                        scanAndPayCtrl.mVisaQRJSON.storeId = "";
                    }
                   }else if(storeId == null  || storeId=="" || storeId == 'nil'){
                       if(scanAndPayCtrl.mVisaQRJSON.isStoreIdMandatory == false){
                           scanAndPayCtrl.showStoreId = false;
                       }
                   }
           }
           else if(scanAndPayCtrl.mVisaQRJSON.isStoreIdMandatory == false){
                scanAndPayCtrl.showStoreId = false;
           }else if(scanAndPayCtrl.mVisaQRJSON.isStoreIdMandatory == true){
             if(scanAndPayCtrl.additionalDataCount < idfcConstants.MVISA_MAX_ADDITIONAL_DP){
                 scanAndPayCtrl.showStoreId = true;
                 scanAndPayCtrl.mVisaQRJSON.storeId = storeId;
                 scanAndPayCtrl.storeId = storeId;
                 scanAndPayCtrl.storeIdReadOnly = false;
                 scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
             }else{
                //already two fields are there
                scanAndPayCtrl.showStoreId = false;
             }
           }else{
             scanAndPayCtrl.showStoreId = false;
           }

           //4. Loyalty Number = tag04
           var loyaltyNumber = scanAndPayCtrl.mVisaQRJSON.loyaltyNumber;
           console.log('Loyalty Number:' + loyaltyNumber);
           //for iospassword
           if(scanAndPayCtrl.mVisaQRJSON.hasOwnProperty('loyaltyNumber') ){

               if (loyaltyNumber != null && loyaltyNumber != 'nil' && loyaltyNumber.length>=1){

                    if(scanAndPayCtrl.additionalDataCount < idfcConstants.MVISA_MAX_ADDITIONAL_DP){
       
                    //check if loyalty number needs to input from user
                       // if(loyaltyNumber.includes('***')){
                       if(loyaltyNumber.indexOf('***')!=-1){
                            loyaltyNumber = loyaltyNumber.replace('***','');
                            scanAndPayCtrl.showLoyaltyNo = true;
                            scanAndPayCtrl.mVisaQRJSON.loyaltyNumber = loyaltyNumber;
                            scanAndPayCtrl.loyaltyNo = loyaltyNumber;
                            scanAndPayCtrl.loyaltyNumberReadOnly = false;
                            scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                        }

                        //check the data is scanned from QR and its first time
                        else if(scanAndPayCtrl.mVisaQRJSON.isLoyaltyNumberMandatory==false){// && scanAndPayCtrl.lastVisitedPage!='scanConfirmPage'){
                         scanAndPayCtrl.loyaltyNumberReadOnly = true;
                         scanAndPayCtrl.showLoyaltyNo = true;
                         scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                         var errMsg = "";

                         if(scanAndPayCtrl.validateCustomData(loyaltyNumber) == 'frmtErr'){
                           errMsg = "Loyalty Number captured in QR is incorrect (provided number is "+loyaltyNumber+")";
                         }else if (scanAndPayCtrl.validateCustomData(loyaltyNumber) == 'mxLnErr'){
                           errMsg = "Loyalty Number captured in QR is too long (provided number is "+loyaltyNumber+")";
                         }else if (scanAndPayCtrl.validateCustomData(loyaltyNumber) == 'mnLnErr'){
                           errMsg = "Loyalty Number is not available in QR code";
                         }else if (scanAndPayCtrl.validateCustomData(loyaltyNumber) == 'nilErr' | scanAndPayCtrl.validateCustomData(loyaltyNumber) == 'nullErr'){
                           errMsg = "Loyalty Number is not available in QR code";
                         }else{
                           errMsg = "";
                         }
                         if(errMsg == null | errMsg ==""){
                           scanAndPayCtrl.showLoyaltyErrorInitial = false;
                           scanAndPayCtrl.showLoyaltyErr  = false;
                           scanAndPayCtrl.loyaltyNo = loyaltyNumber;
                         }else{
                           scanAndPayCtrl.showLoyaltyErrorInitial = true;
                           scanAndPayCtrl.showLoyaltyErr  = false;
                           scanAndPayCtrl.loyaltyErrInitial = errMsg;
                         }
                      }else{
                        //if user comes back from login and entered loyalty number manually earlier
                        scanAndPayCtrl.showLoyaltyNo = true;
                        scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                        scanAndPayCtrl.loyaltyNo=scanAndPayCtrl.mVisaQRJSON.loyaltyNumber;
                      }
                    }else{
                        //dont show already 2 fields are there
                        scanAndPayCtrl.showLoyaltyNo = false;
                        scanAndPayCtrl.mVisaQRJSON.loyaltyNumber  = "";
                    }
                }
                else if(loyaltyNumber == null  || loyaltyNumber=="" || loyaltyNumber == 'nil'){
                   if(scanAndPayCtrl.mVisaQRJSON.isLoyaltyNumberMandatory == false){
                       scanAndPayCtrl.showLoyaltyNo = false;
                   }
                }
       
                //for first time android
              }else if(scanAndPayCtrl.mVisaQRJSON.isLoyaltyNumberMandatory == false){
                     scanAndPayCtrl.showLoyaltyNo = false;
              }
              else if(scanAndPayCtrl.mVisaQRJSON.isLoyaltyNumberMandatory == true){
                if(scanAndPayCtrl.additionalDataCount < idfcConstants.MVISA_MAX_ADDITIONAL_DP){
                  scanAndPayCtrl.showLoyaltyNo = true;
                  scanAndPayCtrl.mVisaQRJSON.loyaltyNumber = loyaltyNumber;
                  scanAndPayCtrl.loyaltyNo = loyaltyNumber;
                  scanAndPayCtrl.loyaltyNumberReadOnly = false;
                  scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                }else{
                    //dont show already two fields are there
                    scanAndPayCtrl.showLoyaltyNo = false;
                }
              }else{
                scanAndPayCtrl.showLoyaltyNo = false;
              }

           //5. Reference ID = tag05
           var referenceId = scanAndPayCtrl.mVisaQRJSON.referenceId;
           console.log('Reference ID:' + referenceId);
           if(scanAndPayCtrl.mVisaQRJSON.hasOwnProperty('referenceId')){
              if(referenceId != null && referenceId != 'nil' && referenceId.length>=1){
                if(scanAndPayCtrl.additionalDataCount < idfcConstants.MVISA_MAX_ADDITIONAL_DP){
       
                   // if (referenceId.includes('***')){
                   if (referenceId.indexOf('***')!=-1){
                        scanAndPayCtrl.showRefId = true;
                        referenceId = referenceId.replace('***','');
                        scanAndPayCtrl.mVisaQRJSON.referenceId = referenceId;
                        scanAndPayCtrl.refId = referenceId;
                        scanAndPayCtrl.refIdReadOnly = false;
                        scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                    }
       
                    else if(scanAndPayCtrl.mVisaQRJSON.isReferenceIdMandatory==false){// && scanAndPayCtrl.lastVisitedPage=='scanConfirmPage'){
                     scanAndPayCtrl.showRefId = true;
                     scanAndPayCtrl.refIdReadOnly = true;
                     scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                     //Validate data provided in QR code
                     var errMsg = "";
                     if(scanAndPayCtrl.validateCustomData(referenceId) == 'frmtErr'){
                       errMsg = "Reference Id captured in QR is incorrect (provided number is "+referenceId+")";
                     }else if (scanAndPayCtrl.validateCustomData(referenceId) == 'mxLnErr'){
                       errMsg = "Reference Id captured in QR is too long (provided number is "+referenceId+")";
                     }else if (scanAndPayCtrl.validateCustomData(referenceId) == 'mnLnErr'){
                       errMsg = "Reference Id is not available in QR code";
                     }else if (scanAndPayCtrl.validateCustomData(referenceId) == 'nilErr' | scanAndPayCtrl.validateCustomData(referenceId) == 'nullErr'){
                       errMsg = "Reference Id is not available in QR code";
                     }else{
                       errMsg = "";
                     }
                     if(errMsg == null | errMsg ==""){
                       scanAndPayCtrl.showRefErrorInitial = false;
                       scanAndPayCtrl.showRefErr = false;
                       scanAndPayCtrl.refId = referenceId;
                     }else{
                       scanAndPayCtrl.showRefErrorInitial = true;
                       scanAndPayCtrl.showRefErr = false;
                       scanAndPayCtrl.refErrInitial = errMsg;
                     }
                  }else{
                     scanAndPayCtrl.showRefId = true;
                     scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                     scanAndPayCtrl.refId=scanAndPayCtrl.mVisaQRJSON.referenceId;
                  }
                }else{
                    // Already displaying 2 parameters hence dont display this
                    scanAndPayCtrl.showRefId = false;
                    scanAndPayCtrl.mVisaQRJSON.referenceId = "";
                }
              }else if(referenceId == null | referenceId == 'nil' | referenceId ==''){
                 if(scanAndPayCtrl.mVisaQRJSON.isReferenceIdMandatory == false){
                    scanAndPayCtrl.showRefId = false;
                 }
              }
           }else if(scanAndPayCtrl.mVisaQRJSON.isReferenceIdMandatory == false){
                    scanAndPayCtrl.showRefId = false;
           }else if(scanAndPayCtrl.mVisaQRJSON.isReferenceIdMandatory == true){
                 if(scanAndPayCtrl.additionalDataCount < idfcConstants.MVISA_MAX_ADDITIONAL_DP){
                    scanAndPayCtrl.showRefId = true;
                    scanAndPayCtrl.mVisaQRJSON.referenceId = referenceId;
                    scanAndPayCtrl.refId = referenceId;
                    scanAndPayCtrl.refIdReadOnly = false;
                    scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                }else{
                    //dont show already two fields are there
                    scanAndPayCtrl.showRefId = false;
                }
           }
           else{
             scanAndPayCtrl.showRefId = false;
           }

           //6. Consimer ID = tag06
           var consumerId = scanAndPayCtrl.mVisaQRJSON.consumerId;
           console.log('Consumer ID:' + consumerId);
           if(scanAndPayCtrl.mVisaQRJSON.hasOwnProperty('consumerId')){
                if (consumerId != null && consumerId != 'nil' && consumerId.length>=1){
                     if(scanAndPayCtrl.additionalDataCount < idfcConstants.MVISA_MAX_ADDITIONAL_DP){
       
                       // if(consumerId.includes('***')){
                       if(consumerId.indexOf('***')!=-1){
                            scanAndPayCtrl.showConsumerId = true;
                            consumerId = consumerId.replace('***','');
                            scanAndPayCtrl.mVisaQRJSON.consumerId = consumerId;
                            scanAndPayCtrl.consumerId = consumerId;
                            scanAndPayCtrl.consumerIdReadOnly = false;
                            scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                        }
       
       
       
                        else if(scanAndPayCtrl.mVisaQRJSON.isConsumerIdMandatory==false){// && scanAndPayCtrl.lastVisitedPage=='scanConfirmPage'){
                         scanAndPayCtrl.showConsumerId = true;
                         scanAndPayCtrl.consumerIdReadOnly = true;
                         scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                         //Validate data provided in QR for sanity
                         var errMsg = "";
                         if(scanAndPayCtrl.validateCustomData(consumerId) == 'frmtErr'){
                           errMsg = "Consumer Id captured in QR is incorrect (provided Id is "+consumerId+")";
                         }else if (scanAndPayCtrl.validateCustomData(consumerId) == 'mxLnErr'){
                           errMsg = "Consumer Id captured in QR is too long (provided Id is "+consumerId+")";
                         }else if (scanAndPayCtrl.validateCustomData(consumerId) == 'mnLnErr'){
                           errMsg = "Consumer Id is not available in QR code";
                         }else if (scanAndPayCtrl.validateCustomData(consumerId) == 'nilErr' | scanAndPayCtrl.validateCustomData(consumerId) == 'nullErr'){
                           errMsg = "Consumer Id is not available in QR code";
                         }else{
                           errMsg = "";
                         }
                         if(errMsg == null | errMsg ==""){
                           scanAndPayCtrl.showConsumerErrorInitial = false;
                           scanAndPayCtrl.showConsumerErr = false;
                           scanAndPayCtrl.consumerId = consumerId;
                         }else{
                           scanAndPayCtrl.showConsumerErrorInitial = true;
                           scanAndPayCtrl.showConsumerErr = false;
                           scanAndPayCtrl.consumerErrInitial = errMsg;
                         }
                        }else{
                             scanAndPayCtrl.showConsumerId = true;
                             scanAndPayCtrl.consumerId=scanAndPayCtrl.mVisaQRJSON.consumerId;
                             scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                        }
                     }else{
                            //Do not display as already 2 parameters are displayed
                            scanAndPayCtrl.showConsumerId = false;
                            scanAndPayCtrl.mVisaQRJSON.consumerId = "";
                     }
                }else if(consumerId == null | consumerId == 'nil' | consumerId == ''){
                   if(scanAndPayCtrl.mVisaQRJSON.isConsumerIdMandatory == false){
                       scanAndPayCtrl.showConsumerId = false;
                   }
                }
           }else if(scanAndPayCtrl.mVisaQRJSON.isConsumerIdMandatory == false){
                  scanAndPayCtrl.showConsumerId = false;
            }else if (scanAndPayCtrl.mVisaQRJSON.isConsumerIdMandatory == true){
                if(scanAndPayCtrl.additionalDataCount < idfcConstants.MVISA_MAX_ADDITIONAL_DP){
                     scanAndPayCtrl.showConsumerId = true;
                     scanAndPayCtrl.mVisaQRJSON.consumerId = consumerId;
                     scanAndPayCtrl.consumerId = consumerId;
                     scanAndPayCtrl.consumerIdReadOnly = false;
                     scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                }else{
                    scanAndPayCtrl.showConsumerId = false;
                }
           }
           else {
             scanAndPayCtrl.showConsumerId = false;
           }

           //7. Terminal ID = tag07
           var terminalId = scanAndPayCtrl.mVisaQRJSON.terminalId;
           console.log('Terminal ID:' + terminalId);
           if(scanAndPayCtrl.mVisaQRJSON.hasOwnProperty('terminalId')){
                if (terminalId != null && terminalId != 'nil' && terminalId.length>=1){
                    if(scanAndPayCtrl.additionalDataCount < idfcConstants.MVISA_MAX_ADDITIONAL_DP){
                       // if (terminalId.includes('***')){
                       if (terminalId.indexOf('***')!=-1){
                            scanAndPayCtrl.showTerminalId = true;
                            terminalId = terminalId.replace('***','');
                            scanAndPayCtrl.mVisaQRJSON.terminalId = terminalId;
                            scanAndPayCtrl.terminalId = terminalId;
                            scanAndPayCtrl.terminalIdReadOnly = false;
                            scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                        }
                        else if(scanAndPayCtrl.mVisaQRJSON.isTerminalIdMandatory==false){// && scanAndPayCtrl.lastVisitedPage=='scanConfirmPage'){
                             scanAndPayCtrl.showTerminalId = true;
                             scanAndPayCtrl.terminalIdReadOnly = true;
                             scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;

                             //Validate QR values
                             var errMsg = "";
                             if(scanAndPayCtrl.validateCustomData(terminalId) == 'frmtErr'){
                               errMsg = "Terminal Id captured in QR is incorrect (provided Id is "+terminalId+")";
                             }else if (scanAndPayCtrl.validateCustomData(terminalId) == 'mxLnErr'){
                               errMsg = "Terminal Id captured in QR is too long (provided Id is "+terminalId+")";
                             }else if (scanAndPayCtrl.validateCustomData(terminalId) == 'mnLnErr'){
                               errMsg = "Terminal Id is not available in QR code";
                             }else if (scanAndPayCtrl.validateCustomData(terminalId) == 'nilErr' | scanAndPayCtrl.validateCustomData(terminalId) == 'nullErr'){
                               errMsg = "Terminal Id is not available in QR code";
                             }else{
                               errMsg = "";
                             }
                             if(errMsg == null | errMsg ==""){
                               scanAndPayCtrl.showTerminalErrInitial = false;
                               scanAndPayCtrl.showTerminalErr = false;
                               scanAndPayCtrl.terminalId = terminalId;
                             }else{
                               scanAndPayCtrl.showTerminalErrInitial = true;
                               scanAndPayCtrl.showTerminalErr = false;
                               scanAndPayCtrl.terminalErrInitial = errMsg;
                             }
                       }else{
                             scanAndPayCtrl.showTerminalId = true;
                             scanAndPayCtrl.terminalId = scanAndPayCtrl.mVisaQRJSON.terminalId;
                             scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                       }
                    }else {
                     //Do not display as already 2 parameters are displayed
                     scanAndPayCtrl.showTerminalId = false;
                     scanAndPayCtrl.mVisaQRJSON.terminalId = "";
                    }
                }else if(terminalId == null | terminalId == 'nil' | terminalId == ''){
                  if(scanAndPayCtrl.mVisaQRJSON.isTerminalIdMandatory == false){
                     scanAndPayCtrl.showTerminalId = false;
                  }
                }
           }else if(scanAndPayCtrl.mVisaQRJSON.isTerminalIdMandatory==false){
                scanAndPayCtrl.showTerminalId = false;
           }else if(scanAndPayCtrl.mVisaQRJSON.isTerminalIdMandatory==true){
                if(scanAndPayCtrl.additionalDataCount < idfcConstants.MVISA_MAX_ADDITIONAL_DP){
                     scanAndPayCtrl.showTerminalId = true;
                     scanAndPayCtrl.mVisaQRJSON.terminalId = terminalId;
                     scanAndPayCtrl.terminalId = terminalId;
                     scanAndPayCtrl.terminalIdReadOnly = false;
                     scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                }
                else{
                   //Do not display as already 2 parameters are displayed
                     scanAndPayCtrl.showTerminalId = false;
                }
           }else{
             scanAndPayCtrl.showTerminalId = false;
           }


           //8. Purpose  = tag08
           var purpose = scanAndPayCtrl.mVisaQRJSON.purpose;
           console.log('Purpose :' + purpose);
           if(scanAndPayCtrl.mVisaQRJSON.hasOwnProperty('purpose')){
                if (purpose != null && purpose != 'nil' && purpose.length>=1){
                    if(scanAndPayCtrl.additionalDataCount < idfcConstants.MVISA_MAX_ADDITIONAL_DP){
                       // if (purpose.includes('***')){
                       if (purpose.indexOf('***')!=-1){
                            scanAndPayCtrl.showPurpose = true;
                            purpose = purpose.replace('***','');
                            scanAndPayCtrl.mVisaQRJSON.purpose = purpose;
                            scanAndPayCtrl.purpose = purpose;
                            scanAndPayCtrl.purposeReadOnly = false;
                            scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
       
                        }
                        else if(scanAndPayCtrl.mVisaQRJSON.isPurposeMandatory==false){// && scanAndPayCtrl.lastVisitedPage=='scanConfirmPage'){
                             scanAndPayCtrl.showPurpose = true;
                             scanAndPayCtrl.purposeReadOnly = true;
                             scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;

                             //Validate QR values
                             var errMsg = "";
                             if(scanAndPayCtrl.validateCustomData(purpose) == 'frmtErr'){
                               errMsg = "Purpose captured in QR is incorrect (provided Id is "+purpose+")";
                             }else if (scanAndPayCtrl.validateCustomData(purpose) == 'mxLnErr'){
                               errMsg = "Purpose captured in QR is too long (provided Id is "+purpose+")";
                             }else if (scanAndPayCtrl.validateCustomData(purpose) == 'mnLnErr'){
                               errMsg = "Purpose is not available in QR code";
                             }else if (scanAndPayCtrl.validateCustomData(purpose) == 'nilErr' | scanAndPayCtrl.validateCustomData(purpose) == 'nullErr'){
                               errMsg = "Purpose is not available in QR code";
                             }else{
                               errMsg = "";
                             }
                             if(errMsg == null | errMsg ==""){
                               scanAndPayCtrl.showPurposeErrInitial = false;
                               scanAndPayCtrl.showPurposeErr = false;
                               scanAndPayCtrl.purpose = purpose;
                             }else{
                               scanAndPayCtrl.showPurposeErrInitial = true;
                               scanAndPayCtrl.showPurposeErr = false;
                               scanAndPayCtrl.purposeErrInitial = errMsg;
                             }
                         }else{
                             scanAndPayCtrl.showPurpose = true;
                             scanAndPayCtrl.purpose=scanAndPayCtrl.mVisaQRJSON.purpose;
                             scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                         }
                   }
                   else{
                       // Do not display as already 2 parameters are displayed
                       scanAndPayCtrl.showPurpose = false;
                       scanAndPayCtrl.mVisaQRJSON.purpose = "";
                   }
                }else if(purpose == null | purpose == 'nil' | purpose == ''){
                    if(scanAndPayCtrl.mVisaQRJSON.isPurposeMandatory == false){
                       scanAndPayCtrl.showPurpose = false;
                    }
                }
             }else if(scanAndPayCtrl.mVisaQRJSON.isPurposeMandatory==false){
                scanAndPayCtrl.showPurpose = false;
             }else if(scanAndPayCtrl.mVisaQRJSON.isPurposeMandatory==true){
                if(scanAndPayCtrl.additionalDataCount < idfcConstants.MVISA_MAX_ADDITIONAL_DP){
                      scanAndPayCtrl.showPurpose = true;
                      scanAndPayCtrl.mVisaQRJSON.purpose = purpose;
                      scanAndPayCtrl.purpose = purpose;
                      scanAndPayCtrl.purposeReadOnly = false;
                      scanAndPayCtrl.additionalDataCount =scanAndPayCtrl.additionalDataCount + 1;
                 }else{
                  //Do not display as already 2 parameters are displayed
                  scanAndPayCtrl.showPurpose = false;
                }
             }else{
                   scanAndPayCtrl.showPurpose = false;
             }


            //for second qr code, if user comes back and change remarks put them in json
           if(scanAndPayCtrl.remarks!='' && scanAndPayCtrl.remarks!=undefined && scanAndPayCtrl.remarks!='nil'){
               scanAndPayCtrl.mVisaQRJSON.remarks=scanAndPayCtrl.remarks;
           }

           //for second qr/key if user comes back, show earlier remarks
           if(scanAndPayCtrl.mVisaQRJSON.remarks!=undefined && scanAndPayCtrl.remarks!='nil' && scanAndPayCtrl.lastVisitedPage!=''){
               scanAndPayCtrl.remarks=scanAndPayCtrl.mVisaQRJSON.remarks;
           }
        }

        //Data field validations
        scanAndPayCtrl.validateTxnAmount = function(isSubmitted){
          console.log('Trasaction amount provided by user: ' + scanAndPayCtrl.txnAmount);
          var temp = parseFloat(scanAndPayCtrl.txnAmount);
          if ((scanAndPayCtrl.txnAmount == '' | scanAndPayCtrl.txnAmount == undefined) && isSubmitted) {
            scanAndPayCtrl.showTxnAmtError = true;
            scanAndPayCtrl.txnAmtError = "Please provide amount";
            return true;
          }else if(!angular.isNumber(temp)){
            scanAndPayCtrl.showTxnAmtError = true;
            scanAndPayCtrl.txnAmtError = "Please provide valid amount";
            return true;
          }else if(scanAndPayCtrl.txnAmount < idfcConstants.MVISA_MIN_TXN_AMOUNT && scanAndPayCtrl.txnAmount!=""){
            scanAndPayCtrl.showTxnAmtError = true;
            scanAndPayCtrl.txnAmtError = "Amount has to be greater than 1";
            console.log('Trasaction amount provided by user: ' + scanAndPayCtrl.txnAmount);
            return true;
          }else if (scanAndPayCtrl.txnAmount > idfcConstants.MVISA_MAX_TXN_AMOUNT){
            scanAndPayCtrl.showTxnAmtError = true;
            scanAndPayCtrl.txnAmtError = "Amount has to be less than 10 lacs";
            console.log('Transaction amount greater than 999999.99');
            return true;
          }else{
            scanAndPayCtrl.showTxnAmtError = false;
            console.log('Its fine');
            if(manualTipCalcFlag == true && scanAndPayCtrl.mVisaQRJSON.tipAndFeeIndicator=="03"){

              var tempTipAmt = (parseFloat(scanAndPayCtrl.txnAmount) * parseFloat(scanAndPayCtrl.mVisaQRJSON.convenienceFeePercentage))/100;
              if(parseFloat(tempTipAmt) >= parseFloat(idfcConstants.MVISA_MAX_TIP_AMOUNT)){
                tempTipAmt = idfcConstants.MVISA_MAX_TIP_AMOUNT;
              }else if (parseFloat(tempTipAmt)< parseFloat(idfcConstants.MVISA_MIN_TIP_AMOUNT)){
                console.log("Tip amount minimum is defaulted")
                tempTipAmt = idfcConstants.MVISA_MIN_TIP_AMOUNT;
              }
              scanAndPayCtrl.mVisaQRJSON.convenienceFeeAmount = tempTipAmt;
              console.log("Calcualted Tip amount--------" + parseFloat(scanAndPayCtrl.mVisaQRJSON.convenienceFeeAmount).toFixed(2));
              scanAndPayCtrl.tipAmount = parseFloat((scanAndPayCtrl.mVisaQRJSON.convenienceFeeAmount).toFixed(2));
            }
            return false;
          }
        }

        scanAndPayCtrl.validateTipAmount = function(isFormValid){
          console.log('Tip amount provided by user or scanned or calculated: ' + scanAndPayCtrl.tipAmount);
          //first time-if user enters tip..should be stored in QRjson field
             if(scanAndPayCtrl.tipAmount!=undefined && scanAndPayCtrl.tipAmount!=""){
                  scanAndPayCtrl.mVisaQRJSON.convenienceFeeAmount=parseFloat(scanAndPayCtrl.tipAmount);
             }

              if (scanAndPayCtrl.tipAmount > idfcConstants.MVISA_MAX_TIP_AMOUNT){
                 scanAndPayCtrl.showTipAmtError = true;
                 scanAndPayCtrl.tipAmtError = "Tip amount has to be less than 10,000";
                 return true;
              }else{
                return false;
              }

            //if convenienceamt percentage is coming in Qr, tip amt will be null.allow to proceed

            //after CUG change- tip validation is not required
          /*if(scanAndPayCtrl.mVisaQRJSON.tipAndFeeIndicator=="03"){
            return false;
          }

          if((scanAndPayCtrl.tipAmount=="" | scanAndPayCtrl.tipAmount == 'nil' | scanAndPayCtrl.tipAmount == null | scanAndPayCtrl.tipAmount == undefined) && isFormValid){
            scanAndPayCtrl.showTipAmtError = true;
            scanAndPayCtrl.tipAmtError = "Please enter tip amount";
            return true;
          }if(scanAndPayCtrl.tipAmount < idfcConstants.MVISA_MIN_TIP_AMOUNT && scanAndPayCtrl.tipAmount!=""){
           scanAndPayCtrl.showTipAmtError = true;
           scanAndPayCtrl.tipAmtError = "Tip amount has to be greater than 1";
           return true;
          }
          else if (scanAndPayCtrl.tipAmount > idfcConstants.MVISA_MAX_TIP_AMOUNT){
            scanAndPayCtrl.showTipAmtError = true;
            scanAndPayCtrl.tipAmtError = "Tip amount has to be less than 10,000";
            return true;
          }else{
            console.log('Its fine');
            scanAndPayCtrl.showTipAmtError = false;
            return false;
          }*/
        }

        scanAndPayCtrl.validateRemarks = function(){

           //for first time
          console.log('Remarks provided by user: ' + scanAndPayCtrl.remarks);
          if(scanAndPayCtrl.remarks == undefined | scanAndPayCtrl.remarks == '' || scanAndPayCtrl.remarks=='nil'){
            scanAndPayCtrl.showRemarksError = true;
            scanAndPayCtrl.remarksErr = "It's too short";
            return true;
          }else if (scanAndPayCtrl.remarks.length < idfcConstants.MVISA_MIN_REMARKS_LENGTH){
            scanAndPayCtrl.showRemarksError = true;
            scanAndPayCtrl.remarksErr = "It's too short";
            return true;
          }else{
            console.log('Remarks is fine');
            scanAndPayCtrl.showRemarksError = false;
            return false;
          }
        }

         scanAndPayCtrl.validateBillNumber = function(){
          console.log('Bill number provided by user : '+ scanAndPayCtrl.billNumber);

           //store the value entered by user in json
          if(scanAndPayCtrl.billNumber!=""){
              scanAndPayCtrl.mVisaQRJSON.billId =scanAndPayCtrl.billNumber;
          }

          //When manual entry
          if(!scanAndPayCtrl.billNumberReadOnly){
            if(scanAndPayCtrl.billNumber == undefined){
              scanAndPayCtrl.showBillNumErrInitial = false;
              scanAndPayCtrl.showBillNumError = true;
              scanAndPayCtrl.billNumErr = "Please provide valid Bill Number";
              //scanAndPayCtrl.mvisaConfirmForm.$valid = false;
              return true;
            }else if(scanAndPayCtrl.billNumber.length > idfcConstants.MVISA_MAX_BILL_LENGTH){
              scanAndPayCtrl.showBillNumErrInitial = false;
              scanAndPayCtrl.showBillNumError = true;
              scanAndPayCtrl.billNumErr = "Bill Number is too long";
             // scanAndPayCtrl.mvisaConfirmForm.$valid = false;
              return true;
            }else if(scanAndPayCtrl.billNumber.length < idfcConstants.MVISA_MIN_BILL_LENGTH){// | scanAndPayCtrl.billNumber.length!=0){
              scanAndPayCtrl.showBillNumErrInitial = false;
              scanAndPayCtrl.showBillNumError = true;
              scanAndPayCtrl.billNumErr = "Bill Number is too short";
              //scanAndPayCtrl.mvisaConfirmForm.$valid = false;
              return true;
            }else if (scanAndPayCtrl.billNumber.length ==0){
              scanAndPayCtrl.billNumErr = "Please provide Bill Number";
              scanAndPayCtrl.showBillNumErrInitial = false;
              scanAndPayCtrl.showBillNumError = true;
              //scanAndPayCtrl.mvisaConfirmForm.$valid = false;
              return true;
            }else{
              scanAndPayCtrl.showBillNumErrInitial = false;
              scanAndPayCtrl.showBillNumError = false;
              return false;
            }
          }else{
            //var exp = /((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i;
            //var exp="/^[a-zA-Z0-9]*$/";

            var exp="^[a-zA-Z0-9]*$";

            if(scanAndPayCtrl.billNumber == undefined){
              scanAndPayCtrl.showBillNumErrInitial = false;
              scanAndPayCtrl.showBillNumError = true;
              scanAndPayCtrl.billNumErr  = "Bill Number captured in QR is incorrect (provided Id is "+scanAndPayCtrl.mVisaQRJSON.billId+")";
              //scanAndPayCtrl.mvisaConfirmForm.$valid = false;
              return true;
            }else if(!scanAndPayCtrl.billNumber.match(exp)){
              scanAndPayCtrl.showBillNumErrInitial = false;
              scanAndPayCtrl.showBillNumError = true;
              scanAndPayCtrl.billNumErr  = "Bill Number captured in QR is incorrect (provided Id is "+scanAndPayCtrl.billNumber+")";
             // scanAndPayCtrl.mvisaConfirmForm.$valid = false;
              return true;
            }else if(scanAndPayCtrl.billNumber.length > idfcConstants.MVISA_MAX_BILL_LENGTH | scanAndPayCtrl.billNumber.length < idfcConstants.MVISA_MIN_BILL_LENGTH){
              scanAndPayCtrl.billNumErr = "Please provide Bill Number";
              scanAndPayCtrl.showBillNumErrInitial = false;
              scanAndPayCtrl.showBillNumError = true;
              //scanAndPayCtrl.mvisaConfirmForm.$valid = false;
              return true;
            }else if(scanAndPayCtrl.billNumber.length ==0){
              scanAndPayCtrl.showBillNumErrInitial = false;
              scanAndPayCtrl.showBillNumError = true;
              scanAndPayCtrl.billNumErr = "Please provide Bill Number";
              //scanAndPayCtrl.mvisaConfirmForm.$valid = false;
              return true;
            }else{
              scanAndPayCtrl.showBillNumErrInitial = false;
              scanAndPayCtrl.showBillNumError = false;
              return false;
            }
          }
        }

        scanAndPayCtrl.validateMobNumber = function(){
          scanAndPayCtrl.showMobNoErrorInitial = false;

           //store the value entered by user in json
            if(scanAndPayCtrl.mobNumber!=""){
                scanAndPayCtrl.mVisaQRJSON.mobileNumber =scanAndPayCtrl.mobNumber;
            }

          if(!scanAndPayCtrl.mobileNumberReadOnly){
            if(scanAndPayCtrl.mobNumber==undefined || scanAndPayCtrl.mobNumber=='nil' || scanAndPayCtrl.mobNumber==''){
               scanAndPayCtrl.showMobNoErrorInitial = false;
               scanAndPayCtrl.showMobNoError = true;
               scanAndPayCtrl.mobileNoError = "Please provide mobile number";
               return true;
             }
            else if(scanAndPayCtrl.mobNumber.length > idfcConstants.MVISA_MAX_MOB_LENGTH){
              scanAndPayCtrl.showMobNoErrorInitial = false;
              scanAndPayCtrl.showMobNoError = true;
              scanAndPayCtrl.mobileNoError = "Mobile Number is too long";
              return true;
            }
            else if(scanAndPayCtrl.mobNumber.length < idfcConstants.MVISA_MIN_MOB_LENGTH && scanAndPayCtrl.mobNumber.length!=0){
              scanAndPayCtrl.showMobNoErrorInitial = false;
              scanAndPayCtrl.showMobNoError = true;
              scanAndPayCtrl.mobileNoError = "Mobile Number is too short";
              return true;
            }else if (scanAndPayCtrl.mobNumber.length ==0){
              scanAndPayCtrl.mobileNoError = "Please provide mobile number";
              scanAndPayCtrl.showMobNoErrorInitial = false;
              scanAndPayCtrl.showMobNoError = true;
              return true;
            }else{
              scanAndPayCtrl.showMobNoError = false;
              scanAndPayCtrl.showMobNoErrorInitial = false;
              return false;
            }
          }else{
            if(!angular.isNumber(parseFloat(scanAndPayCtrl.mVisaQRJSON.mobileNumber))){
              scanAndPayCtrl.showMobNoError = true;
              scanAndPayCtrl.mobileNoErrorInitial = "Mobile Number captured in QR is invalid (provided number is "+scanAndPayCtrl.mVisaQRJSON.mobileNumber+")";
              return true;
            }else if(scanAndPayCtrl.mobNumber.length > idfcConstants.MVISA_MAX_MOB_LENGTH){
              scanAndPayCtrl.showMobNoErrorInitial = false;
              scanAndPayCtrl.showMobNoError = true;
              scanAndPayCtrl.mobileNoError = "Mobile Number is too long";
              return true;
            }else if(scanAndPayCtrl.mobNumber.length < idfcConstants.MVISA_MIN_MOB_LENGTH){
              scanAndPayCtrl.showMobNoErrorInitial = false;
              scanAndPayCtrl.showMobNoError = true;
              scanAndPayCtrl.mobileNoError = "Mobile Number is too short";
              return true;
            }else if (scanAndPayCtrl.mobNumber.length ==0 || scanAndPayCtrl.mobNumber==undefined || scanAndPayCtrl.mobNumber=='nil'){
              mvisaConfirmForm.mobNumber.$error.minlength = false;
              scanAndPayCtrl.mobileNoError = "Please provide Mobile Number";
              scanAndPayCtrl.showMobNoErrorInitial = false;
              scanAndPayCtrl.showMobNoError = true;
              return true;
            }else{
              scanAndPayCtrl.showMobNoError = false;
              scanAndPayCtrl.showMobNoErrorInitial = false;
              return false;
            }
          }
        }

        scanAndPayCtrl.validateStoreId = function(form){
          console.log('Store ID provided by user or captured from QR : '+ scanAndPayCtrl.storeId);

           //store the value entered by user in json
            if(scanAndPayCtrl.storeId!=""){
                scanAndPayCtrl.mVisaQRJSON.storeId =scanAndPayCtrl.storeId;
            }


          if(!scanAndPayCtrl.storeIdReadOnly){
            //When user has manually entered the value
           // console.log(form.storeId.$viewValue);
            if( scanAndPayCtrl.storeId==undefined || scanAndPayCtrl.storeId=='nil' || scanAndPayCtrl.storeId==''){
                 scanAndPayCtrl.showStoreIdErrorInitial = false;
                 scanAndPayCtrl.showStoreIdError = true;
                 scanAndPayCtrl.storeIdError = "Please provide Store Id";
                 return true;
            }
            else if(scanAndPayCtrl.storeId.length < idfcConstants.MVISA_MAX_STORE_LENGTH && scanAndPayCtrl.storeId.length > idfcConstants.MVISA_MIN_STORE_LENGTH){
              scanAndPayCtrl.showStoreIdErrorInitial = false;
              scanAndPayCtrl.showStoreIdError = true;
              scanAndPayCtrl.storeIdError = "Please provide Store Id";
              return true;
            }else if(scanAndPayCtrl.storeId.length ==0){
              scanAndPayCtrl.showStoreIdErrorInitial = false;
              scanAndPayCtrl.showStoreIdError = true;
              scanAndPayCtrl.storeIdError = "Please provide Store Id";
              return true;
            }else{
              scanAndPayCtrl.showStoreIdError = false;
              scanAndPayCtrl.showStoreIdErrorInitial = false;
              return false;
            }
          }else{//When store id is captured from QR
            //var exp = /((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i;
            //var exp="/^[a-zA-Z0-9]*$/";

            var exp="^[a-zA-Z0-9]*$";

            if(!scanAndPayCtrl.storeId.match(exp)){
              scanAndPayCtrl.showStoreIdErrorInitial = true;
              scanAndPayCtrl.showStoreIdError = false;
              scanAndPayCtrl.storeIdErrorInitial  = "Store Id captured in QR is incorrect (provided Id is "+scanAndPayCtrl.storeId+")";
              return true;
            }else if(scanAndPayCtrl.storeId.length < idfcConstants.MVISA_MAX_STORE_LENGTH && scanAndPayCtrl.storeId.length > idfcConstants.MVISA_MIN_STORE_LENGTH){
              scanAndPayCtrl.showStoreIdError = true;
              scanAndPayCtrl.storeIdError = "Please provide Store Id";
              scanAndPayCtrl.showStoreIdErrorInitial = false;
              return true;
            }else if(scanAndPayCtrl.storeId.length ==0){
              scanAndPayCtrl.showStoreIdErrorInitial = false;
              scanAndPayCtrl.showStoreIdError = true;
              scanAndPayCtrl.storeIdError = "Please provide Store Id";
              return true;
            }else{
              scanAndPayCtrl.showStoreIdError = false;
              scanAndPayCtrl.showStoreIdErrorInitial = false;
              return false;
            }
          }
        }

        scanAndPayCtrl.validateLoyaltyNumber = function(){

        //store the value entered by user in json
        if(scanAndPayCtrl.loyaltyNo!=""){
            scanAndPayCtrl.mVisaQRJSON.loyaltyNumber =scanAndPayCtrl.loyaltyNo;
        }


          console.log('Loyalty Number provided by user or captured from QR : '+ scanAndPayCtrl.loyaltyNo);
          //var exp = /((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i;
          //var exp="/^[a-zA-Z0-9]*$/";

          var exp="^[a-zA-Z0-9]*$";

          if(!scanAndPayCtrl.loyaltyNumberReadOnly){
            //Manual entry by user
            if(scanAndPayCtrl.loyaltyNo==undefined || scanAndPayCtrl.loyaltyNo=='nil' || scanAndPayCtrl.loyaltyNo==''){
              scanAndPayCtrl.showLoyaltyErr = true;
              scanAndPayCtrl.showStoreIdErrorInitial = false;
              scanAndPayCtrl.loyaltyErr = "Please provide Loyalty Number";
              return true;
            }
            if(scanAndPayCtrl.loyaltyNo.length < idfcConstants.MVISA_MIN_LOYALTY_LENGTH || scanAndPayCtrl.loyaltyNo==undefined || scanAndPayCtrl.loyaltyNo=='nil'){
              scanAndPayCtrl.showLoyaltyErr = true;
              scanAndPayCtrl.showStoreIdErrorInitial = false;
              scanAndPayCtrl.loyaltyErr = "Please provide Loyalty Number";
              return true;
            }else if (scanAndPayCtrl.loyaltyNo.match(exp)){
              scanAndPayCtrl.showLoyaltyErr = true;
              scanAndPayCtrl.showStoreIdErrorInitial = false;
              scanAndPayCtrl.loyaltyErr = "Please remove special characters and spaces";
              return true;
            }else{
              scanAndPayCtrl.showStoreIdErrorInitial = false;
              scanAndPayCtrl.showLoyaltyErr = false;
              return false;
            }
          }else{
            var errMsg = "";
            if(scanAndPayCtrl.validateCustomData(scanAndPayCtrl.loyaltyNo) == 'frmtErr'){
              errMsg = "Loyalty Number captured in QR is incorrect (provided number is "+scanAndPayCtrl.loyaltyNo+")";
            }else if (scanAndPayCtrl.validateCustomData(scanAndPayCtrl.loyaltyNo) == 'mxLnErr'){
              errMsg = "Loyalty Number captured in QR is too long (provided number is "+canAndPayCtrl.loyaltyNo+")";
            }else if (scanAndPayCtrl.validateCustomData(scanAndPayCtrl.loyaltyNo) == 'mnLnErr'){
              errMsg = "Loyalty Number is not available in QR code";
            }else if (scanAndPayCtrl.validateCustomData(scanAndPayCtrl.loyaltyNo) == 'nilErr' | scanAndPayCtrl.validateCustomData(scanAndPayCtrl.loyaltyNo) == 'nullErr'){
              errMsg = "Loyalty Number is not available in QR code";
            }else{
              errMsg = "";
            }
            if(errMsg == null | errMsg ==""){
              scanAndPayCtrl.showLoyaltyErrorInitial = false;
              scanAndPayCtrl.showLoyaltyErr = false;
              return false;
            }else{
              scanAndPayCtrl.showLoyaltyErrorInitial = false;
              scanAndPayCtrl.showLoyaltyErr = true;
              scanAndPayCtrl.loyaltyErr = errMsg;
              return true;
            }
          }
        }

        scanAndPayCtrl.validateRefId = function(){
          console.log('Reference Number provided by user or captured from QR : '+ scanAndPayCtrl.refId);

          //store the value entered by user in json
          if(scanAndPayCtrl.refId!=""){
              scanAndPayCtrl.mVisaQRJSON.referenceId =scanAndPayCtrl.refId;
          }

          //var exp = /((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i;
          //var exp="/^[a-zA-Z0-9]*$/";

          var exp="^[a-zA-Z0-9]*$";

          if(!scanAndPayCtrl.refIdReadOnly){//Manual enter by used
            if(scanAndPayCtrl.refId==undefined || scanAndPayCtrl.refId=='nil' || scanAndPayCtrl.refId==''){
              scanAndPayCtrl.showRefErrorInitial = false;
              scanAndPayCtrl.showRefErr = true;
              scanAndPayCtrl.refErr = "Please provide Reference Id";
              return true;
            }
            else if(scanAndPayCtrl.refId.length < idfcConstants.MVISA_MIN_REF_LENGTH || scanAndPayCtrl.refId==undefined || scanAndPayCtrl.refId=='nil'){
              scanAndPayCtrl.showRefErrorInitial = false;
              scanAndPayCtrl.showRefErr = true;
              scanAndPayCtrl.refErr = "Please provide Reference Id";
              return true;
            }else if (scanAndPayCtrl.refId.match(exp)){
              scanAndPayCtrl.showRefErr = true;
              scanAndPayCtrl.showRefErrorInitial = false;
              scanAndPayCtrl.refErr = "Please remove special characters and spaces";
              return true;
            }else{
              scanAndPayCtrl.showRefErrorInitial = false;
              scanAndPayCtrl.showRefErr = false;
              return false;
            }
          }else {//Captured from QR code
            var errMsg = "";
            if(scanAndPayCtrl.validateCustomData(scanAndPayCtrl.refId) == 'frmtErr'){
              errMsg = "Reference Id captured in QR is incorrect (provided Id is "+scanAndPayCtrl.refId+")";
            }else if (scanAndPayCtrl.validateCustomData(scanAndPayCtrl.refId) == 'mxLnErr'){
              errMsg = "Reference Id captured in QR is too long (provided Id is "+scanAndPayCtrl.refId+")";
            }else if (scanAndPayCtrl.validateCustomData(scanAndPayCtrl.refId) == 'mnLnErr'){
              errMsg = "Reference Id is not available in QR code";
            }else if (scanAndPayCtrl.validateCustomData(scanAndPayCtrl.refId) == 'nilErr' | scanAndPayCtrl.validateCustomData(scanAndPayCtrl.refId) == 'nullErr'){
              errMsg = "Reference Id is not available in QR code";
            }else{
              errMsg = "";
            }
            if(errMsg == null | errMsg ==""){
              console.log('------ Reference Id is fine from QR -------');
              scanAndPayCtrl.showRefErrorInitial = false;
              scanAndPayCtrl.showRefErr = false;
              return false;
            }else{
              scanAndPayCtrl.showRefErrorInitial = false;
              scanAndPayCtrl.showRefErr = true;
              scanAndPayCtrl.refErr = errMsg;
              return true;
            }
          }
        }

        scanAndPayCtrl.validateConsumerId = function(){

         //store the value entered by user in json
            if(scanAndPayCtrl.consumerId!=""){
                scanAndPayCtrl.mVisaQRJSON.consumerId =scanAndPayCtrl.consumerId;
            }

          console.log('Consumer Id provided by user or captured from QR : '+ scanAndPayCtrl.consumerId);
          //var exp = /((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i;
          //var exp="/^[a-zA-Z0-9]*$/";

          var exp="^[a-zA-Z0-9]*$";

          if(!scanAndPayCtrl.consumerIdReadOnly){//manually entered by user
           if(scanAndPayCtrl.consumerId==undefined || scanAndPayCtrl.consumerId=='nil' || scanAndPayCtrl.consumerId==''){
             scanAndPayCtrl.showConsumerErr  = true;
             scanAndPayCtrl.showConsumerErrorInitial = false;
             scanAndPayCtrl.consumerErr = "Please provide Consumer Id";
             return true;
           }
           else if(scanAndPayCtrl.consumerId.length < idfcConstants.MVISA_MIN_CONSUMER_LENGTH){
              scanAndPayCtrl.showConsumerErr  = true;
              scanAndPayCtrl.showConsumerErrorInitial = false;
              scanAndPayCtrl.consumerErr = "Please provide Consumer Id";
              return true;
            }else if (scanAndPayCtrl.consumerId.match(exp)){
              scanAndPayCtrl.showConsumerErr  = true;
              scanAndPayCtrl.showConsumerErrorInitial = false;
              scanAndPayCtrl.consumerErr = "Please remove special characters and spaces";
              return true;
            }else{
              scanAndPayCtrl.showConsumerErrorInitial = false;
              scanAndPayCtrl.showConsumerErr  = false;
              return false;
            }
          }else{//Captured from QR Code
            var errMsg = "";
            if(scanAndPayCtrl.validateCustomData(scanAndPayCtrl.consumerId) == 'frmtErr'){
              errMsg = "Consumer Id captured in QR is incorrect (provided Id is "+scanAndPayCtrl.consumerId+")";
            }else if (scanAndPayCtrl.validateCustomData(scanAndPayCtrl.consumerId) == 'mxLnErr'){
              errMsg = "Consumer Id captured in QR is too long (provided Id is "+scanAndPayCtrl.consumerId+")";
            }else if (scanAndPayCtrl.validateCustomData(scanAndPayCtrl.consumerId) == 'mnLnErr'){
              errMsg = "Consumer Id is not available in QR code";
            }else if (scanAndPayCtrl.validateCustomData(scanAndPayCtrl.consumerId) == 'nilErr' | scanAndPayCtrl.validateCustomData(scanAndPayCtrl.consumerId) == 'nullErr'){
              errMsg = "Consumer Id is not available in QR code";
            }else{
              errMsg = "";
            }
            if(errMsg == null | errMsg ==""){
              console.log('------ Consumer Id is fine from QR -------');
              scanAndPayCtrl.showConsumerErrorInitial = false;
              scanAndPayCtrl.showConsumerErr  = false;
              return false;
            }else{
              scanAndPayCtrl.showConsumerErrorInitial = false;
              scanAndPayCtrl.showConsumerErr  = true;
              scanAndPayCtrl.consumerErr = errMsg;
              return true;
            }
          }
        }

        scanAndPayCtrl.validateTerminalId = function(){

        //store the value entered by user in json
        if(scanAndPayCtrl.terminalId!=""){
            scanAndPayCtrl.mVisaQRJSON.terminalId =scanAndPayCtrl.terminalId;
        }
          console.log('Terminal Id provided by user or captured from QR : '+ scanAndPayCtrl.terminalId);
          //var exp = /((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i;
          //var exp="/^[a-zA-Z0-9]*$/";

          var exp="^[a-zA-Z0-9]*$";

          if(!scanAndPayCtrl.terminalIdReadOnly){//Manual entry by user
            if(scanAndPayCtrl.terminalId==undefined || scanAndPayCtrl.terminalId=='nil' || scanAndPayCtrl.terminalId==''){
                scanAndPayCtrl.showTerminalErr  = true;
                scanAndPayCtrl.showTerminalErrInitial = false;
                scanAndPayCtrl.terminalErr = "Please provide Terminal Id";
                return true;
            }
            if(scanAndPayCtrl.terminalId.length < idfcConstants.MVISA_MIN_TERMINAL_LENGTH || scanAndPayCtrl.terminalId==undefined || scanAndPayCtrl.terminalId=='nil'){
              scanAndPayCtrl.showTerminalErr  = true;
              scanAndPayCtrl.showTerminalErrInitial = false;
              scanAndPayCtrl.terminalErr = "Please provide Terminal Id";
              return true;
            }else if (scanAndPayCtrl.terminalId.match(exp)){
              scanAndPayCtrl.showTerminalErr  = true;
              scanAndPayCtrl.showTerminalErrInitial = false;
              scanAndPayCtrl.terminalErr = "Please remove special characters and spaces";
              return true;
            }else{
              scanAndPayCtrl.showTerminalErr  = false;
              scanAndPayCtrl.showTerminalErrInitial = false;
              return false;
            }
          }else{//Captured from QR scan
            var errMsg = "";
            if(scanAndPayCtrl.validateCustomData(scanAndPayCtrl.terminalId) == 'frmtErr'){
              errMsg = "Termial Id captured in QR is incorrect (provided Id is "+scanAndPayCtrl.terminalId+")";
            }else if (scanAndPayCtrl.validateCustomData(scanAndPayCtrl.terminalId) == 'mxLnErr'){
              errMsg = "Terminal Id captured in QR is too long (provided Id is "+scanAndPayCtrl.terminalId+")";
            }else if (scanAndPayCtrl.validateCustomData(scanAndPayCtrl.terminalId) == 'mnLnErr'){
              errMsg = "Terminal Id is not available in QR code";
            }else if (scanAndPayCtrl.validateCustomData(scanAndPayCtrl.terminalId) == 'nilErr' | scanAndPayCtrl.validateCustomData(scanAndPayCtrl.terminalId) == 'nullErr'){
              errMsg = "Terminal Id is not available in QR code";
            }else{
              errMsg = "";
            }
            if(errMsg == null | errMsg ==""){
              console.log('------ Consumer Id is fine from QR -------');
              scanAndPayCtrl.showTerminalErrInitial = false;
              scanAndPayCtrl.showTerminalErr  = false;
              return false;
            }else{
              scanAndPayCtrl.showTerminalErrInitial = false;
              scanAndPayCtrl.showTerminalErr  = true;
              scanAndPayCtrl.terminalErr = errMsg;
              return true;
            }
          }
        }


        scanAndPayCtrl.validatePurpose = function(){

        //store the value entered by user in json
        if(scanAndPayCtrl.purpose!=""){
            scanAndPayCtrl.mVisaQRJSON.purpose =scanAndPayCtrl.purpose;
        }
          console.log('Purpose provided by user or captured from QR : '+ scanAndPayCtrl.purpose);
          //var exp = /((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i;
          //var exp="/^[a-zA-Z0-9]*$/";

          var exp="^[a-zA-Z0-9]*$";

          if(!scanAndPayCtrl.purposeReadOnly){//Manual entry by user
            if(scanAndPayCtrl.purpose==undefined || scanAndPayCtrl.purpose=='nil' || scanAndPayCtrl.purpose==''){
              scanAndPayCtrl.showPurposeErr  = true;
              scanAndPayCtrl.showPurposeErrInitial = false;
              scanAndPayCtrl.purposeErr = "Please provide Purpose";
              return true;
            }
            if(scanAndPayCtrl.purpose.length < idfcConstants.MVISA_MIN_TERMINAL_LENGTH || scanAndPayCtrl.purpose==undefined || scanAndPayCtrl.purpose=='nil'){
              scanAndPayCtrl.showPurposeErr  = true;
              scanAndPayCtrl.showPurposeErrInitial = false;
              scanAndPayCtrl.purposeErr = "Please provide Purpose";
              return true;
            }else if (scanAndPayCtrl.purpose.match(exp)){
              scanAndPayCtrl.showPurposeErr = true;
              scanAndPayCtrl.showPurposeErrInitial = false;
              scanAndPayCtrl.purposeErr = "Please remove special characters and spaces";
              return true;
            }else{
              scanAndPayCtrl.showPurposeErr = false;
              scanAndPayCtrl.showPurposeErrInitial = false;
              return false;
            }
          }else{//Captured from QR scan
            var errMsg = "";
            if(scanAndPayCtrl.validateCustomData(scanAndPayCtrl.purpose) == 'frmtErr'){
              errMsg = "Termial Id captured in QR is incorrect (provided Id is "+scanAndPayCtrl.purpose+")";
            }else if (scanAndPayCtrl.validateCustomData(scanAndPayCtrl.purpose) == 'mxLnErr'){
              errMsg = "Terminal Id captured in QR is too long (provided Id is "+scanAndPayCtrl.purpose+")";
            }else if (scanAndPayCtrl.validateCustomData(scanAndPayCtrl.purpose) == 'mnLnErr'){
              errMsg = "Terminal Id is not available in QR code";
            }else if (scanAndPayCtrl.validateCustomData(scanAndPayCtrl.purpose) == 'nilErr' | scanAndPayCtrl.validateCustomData(scanAndPayCtrl.purpose) == 'nullErr'){
              errMsg = "Terminal Id is not available in QR code";
            }else{
              errMsg = "";
            }
            if(errMsg == null | errMsg ==""){
              console.log('------ Consumer Id is fine from QR -------');
              scanAndPayCtrl.showPurposeErrInitial = false;
              scanAndPayCtrl.showPurposeErr  = false;
              return false;
            }else{
              scanAndPayCtrl.showPurposeErrInitial = false;
              scanAndPayCtrl.showPurposeErr  = true;
              scanAndPayCtrl.purposeErr = errMsg;
              return true;
            }
          }
        }

       scanAndPayCtrl.validateForm = function (isFormValid){
        scanAndPayCtrl.errorFlagAmt=false;
        scanAndPayCtrl.errorFlagTip=false;
        scanAndPayCtrl.errorFlagBill=false;
        scanAndPayCtrl.errorFlagTerminal=false;
        scanAndPayCtrl.errorFlagPurpose=false;
        scanAndPayCtrl.errorFlagConsumer=false;
        scanAndPayCtrl.errorFlagLoyalty=false;
        scanAndPayCtrl.errorFlagStore=false;
        scanAndPayCtrl.errorFlagMob=false;
        scanAndPayCtrl.errorFlagRef=false;
        scanAndPayCtrl.errorFlagRemarks=false;



         console.log("Inside validate form");

        //only for ios-bcz min max is checked using form vaidation
         if(!isFormValid){
             scanAndPayCtrl.errorFlagAmt=true;
         }

         scanAndPayCtrl.errorFlagAmt=scanAndPayCtrl.validateTxnAmount(true);
         scanAndPayCtrl.errorFlagRemarks=false;//scanAndPayCtrl.validateRemarks();
         if(scanAndPayCtrl.showTip){
           scanAndPayCtrl.errorFlagTip=scanAndPayCtrl.validateTipAmount(true);
         }
         if(scanAndPayCtrl.showBillNumber){
           scanAndPayCtrl.errorFlagBill=scanAndPayCtrl.validateBillNumber();
         }
         if(scanAndPayCtrl.showMobNumber){
           scanAndPayCtrl.errorFlagMob=scanAndPayCtrl.validateMobNumber();
         }
         if(scanAndPayCtrl.showStoreId){
           scanAndPayCtrl.errorFlagStore=scanAndPayCtrl.validateStoreId();
         }
         if(scanAndPayCtrl.showLoyaltyNo){
           scanAndPayCtrl.errorFlagLoyalty=scanAndPayCtrl.validateLoyaltyNumber();
         }
         if(scanAndPayCtrl.showRefId){
           scanAndPayCtrl.errorFlagRef=scanAndPayCtrl.validateRefId();
         }
         if(scanAndPayCtrl.showConsumerId){
           scanAndPayCtrl.errorFlagConsumer=scanAndPayCtrl.validateConsumerId();
         }
         if(scanAndPayCtrl.showTerminalId){
           scanAndPayCtrl.errorFlagTerminal=scanAndPayCtrl.validateTerminalId();
         }
         if(scanAndPayCtrl.showPurpose){
           scanAndPayCtrl.errorFlagPurpose=scanAndPayCtrl.validatePurpose();
         }
         if(!scanAndPayCtrl.errorFlagAmt && !scanAndPayCtrl.errorFlagRemarks  && !scanAndPayCtrl.errorFlagTip && !scanAndPayCtrl.errorFlagBill && !scanAndPayCtrl.errorFlagMob  && !scanAndPayCtrl.errorFlagConsumer  && !scanAndPayCtrl.errorFlagLoyalty && !scanAndPayCtrl.errorFlagStore  && !scanAndPayCtrl.errorFlagRef && !scanAndPayCtrl.errorFlagPurpose && !scanAndPayCtrl.errorFlagTerminal){
            scanAndPayCtrl.confirmToLogin();
         }
       }


        //This function will be used to validate data captured form QR for tag62 to ensure they meet the required criterias
        scanAndPayCtrl.validateCustomData = function(tagValue){
          //Validate format
              //var exp = /((^[0-9]|[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i;
             //var exp="/^[a-zA-Z0-9]*$/";

             var exp="^[a-zA-Z0-9]*$";

          console.log("tag value" + tagValue);
          if(!tagValue.match(exp)){
            return 'frmtErr';
          }else if(tagValue.length > 26){
            return 'mxLnErr';
          }else if (tagValue.length <1){
            return 'mnLnErr';
          }else if (tagValue == 'nil'){
            return 'nilErr';
          }else if (tagValue == null){
            return 'nullErr';
          }
        }

        $('#txnAmount').keyup(function () {
          console.log('here herer ');
          this.value = this.value.replace(/^[0-9]+(\.[0-9]{1,2})?$/g,'');
        });


        scanAndPayCtrl.makeQRStandardJson= function(){

            console.log('makeStandardJson called');

            console.log('scanAndPayCtrl.mVisaQRJSON:',scanAndPayCtrl.mVisaQRJSON);

            if(scanAndPayCtrl.txnAmount!='' && scanAndPayCtrl.txnAmount!=undefined && scanAndPayCtrl.txnAmount!='nil'){
                if(scanAndPayCtrl.tipAmount!='' && scanAndPayCtrl.tipAmount!=undefined){
                    scanAndPayCtrl.mVisaQRJSON.transactionAmount=parseFloat(scanAndPayCtrl.txnAmount)+parseFloat(scanAndPayCtrl.tipAmount);
                    scanAndPayCtrl.mVisaQRJSON.transactionAmount=scanAndPayCtrl.mVisaQRJSON.transactionAmount.toFixed(2);
                }else{
                    scanAndPayCtrl.mVisaQRJSON.transactionAmount=parseFloat(scanAndPayCtrl.txnAmount).toFixed(2);
                }
            }

            scanAndPayCtrl.standardMVisaJson={
                    "entryType":"Q",
                    "intrchgTp":scanAndPayCtrl.interchangeType,
                    "mrchntTp":scanAndPayCtrl.merchantType,
                    "posEntryMd":scanAndPayCtrl.posEntryMd,
                    "addDataMasterCard1" : "",
                    "addDataMasterCard2" : "",
                    "addDataNpci1" : "",
                    "addDataNpci2" : "",
                    "additionalConsumerDataRequest" : "",
                    "additionalDataField" : "",
                    "billId" : "",
                    "cityName" : "",
                    "consumerId" : "",
                    "convenienceFeeAmount" : "",
                    "convenienceFeePercentage" : "",
                    "countryCode" : "",
                    "crc" : "",
                    "currencyCode" : "",
                    "isAddDataMasterCard1Mandatory" : "",
                    "isAddDataMasterCard2Mandatory" : "",
                    "isAddDataNpci1Mandatory" : "",
                    "isAddDataNpci2Mandatory" : "",
                    "isAdditonalConsumerDataRequestMandatory" : "",
                    "isBillIdMandatory" : "",
                    "isConsumerIdMandatory" : "",
                    "isLoyaltyNumberMandatory" : "",
                    "isMobileNumberMandatory" : "",
                    "isPrimaryIdMandatory" : "",
                    "isPurposeMandatory" : "",
                    "isReferenceIdMandatory" : "",
                    "isSecondaryIdMandatory" : "",
                    "isStoreIdMandatory" : "",
                    "isTerminalIdMandatory" : "",
                    "loyaltyNumber" : "",
                    "mVisaMerchantId" : "",
                    "mVisaMerchantPan" : "",
                    "masterCardPan1" : "",
                    "masterCardPan2" :"",
                    "merchantCategoryCode" : "",
                    "merchantName" : "",
                    "mobileNumber" :"",
                    "npciid1" : "",
                    "npciid2" : "",
                    "payloadFormatIndicator" : "",
                    "pointOfInitiation" : "",
                    "postalCode" : "",
                    "primaryId" : "",
                    "primaryIdLength" : "",
                    "purpose" :"",
                    "referenceId" :"",
                    "secondaryId" :"",
                    "secondaryIdLength" :"",
                    "storeId" :"",
                    "tag03"  :"",
                    "tag08" :"",
                    "tag09" :"",
                    "tag10"  :"",
                    "tag11"  :"",
                    "tag12"  :"",
                    "tag13" :"",
                    "tag14"  :"",
                    "tag15"  :"",
                    "tagSixtyTwo10" :"",
                    "tagSixtyTwo15" :"",
                    "tagSixtyTwo16" :"",
                    "tagSixtyTwo17" :"",
                    "tagSixtyTwo18" :"",
                    "tagSixtyTwo19" :"",
                    "tagSixtyTwo20" :"",
                    "tagSixtyTwo21" :"",
                    "tagSixtyTwo22":"",
                    "terminalId" :"",
                    "tipAndFeeIndicator":"",
                    "transactionAmount" :"",
                    "remarks":scanAndPayCtrl.remarks,
                    "npciMerchantId":scanAndPayCtrl.mVisaQRJSON.npciMerchantId,
                    "masterCardMerchantId":scanAndPayCtrl.mVisaQRJSON.masterCardMerchantId
            };

            console.log('scanAndPayCtrl.standardMVisaJson:',scanAndPayCtrl.standardMVisaJson);

            for(var tagName in scanAndPayCtrl.mVisaQRJSON){
                var tag = tagName;
                var value = scanAndPayCtrl.mVisaQRJSON[tag];
                console.log('tag:',tag);
                console.log('value:',value);
                if(scanAndPayCtrl.standardMVisaJson.hasOwnProperty(tag)){
                    if(value==null || value=="nil"){
                        value="";
                    }
                    scanAndPayCtrl.standardMVisaJson[tag]=value;
                }
                else{
                    console.log("tag not found");
                }
             }

            console.log('scanAndPayCtrl.standardMVisaJson after putting values:',scanAndPayCtrl.standardMVisaJson);


            /*for VISA only- QR check version number,
            if 01-get first two tags from 01 to 09(bill number, store numbner etc)
            for 00 version-pass primaryId and secondary id as it is*/
            if(scanAndPayCtrl.standardMVisaJson.payloadFormatIndicator=="01"){

                if(scanAndPayCtrl.standardMVisaJson.primaryId=="" ){
                    if(scanAndPayCtrl.standardMVisaJson.billId!=""){
                        scanAndPayCtrl.standardMVisaJson.primaryId=scanAndPayCtrl.standardMVisaJson.billId;
                    }else if(scanAndPayCtrl.standardMVisaJson.mobileNumber!=""){
                        scanAndPayCtrl.standardMVisaJson.primaryId=scanAndPayCtrl.standardMVisaJson.mobileNumber;
                    }else if(scanAndPayCtrl.standardMVisaJson.storeId!=""){
                         scanAndPayCtrl.standardMVisaJson.primaryId=scanAndPayCtrl.standardMVisaJson.storeId;
                    }else if(scanAndPayCtrl.standardMVisaJson.loyaltyNumber!=""){
                         scanAndPayCtrl.standardMVisaJson.primaryId=scanAndPayCtrl.standardMVisaJson.loyaltyNumber;
                    }else if(scanAndPayCtrl.standardMVisaJson.referenceId!=""){
                         scanAndPayCtrl.standardMVisaJson.primaryId=scanAndPayCtrl.standardMVisaJson.referenceId;
                    }else if(scanAndPayCtrl.standardMVisaJson.consumerId!=""){
                         scanAndPayCtrl.standardMVisaJson.primaryId=scanAndPayCtrl.standardMVisaJson.consumerId;
                    }else if(scanAndPayCtrl.standardMVisaJson.terminalId!=""){
                          scanAndPayCtrl.standardMVisaJson.primaryId=scanAndPayCtrl.standardMVisaJson.terminalId;
                    }else if(scanAndPayCtrl.standardMVisaJson.purpose!=""){
                          scanAndPayCtrl.standardMVisaJson.primaryId=scanAndPayCtrl.standardMVisaJson.purpose;
                    }
                }

                if(scanAndPayCtrl.standardMVisaJson.primaryId!="" && scanAndPayCtrl.standardMVisaJson.secondaryId==""){
                    if(scanAndPayCtrl.standardMVisaJson.billId!="" && scanAndPayCtrl.standardMVisaJson.primaryId!=scanAndPayCtrl.standardMVisaJson.billId){
                        scanAndPayCtrl.standardMVisaJson.secondaryId=scanAndPayCtrl.standardMVisaJson.billId;
                    }else if(scanAndPayCtrl.standardMVisaJson.mobileNumber!=""  && scanAndPayCtrl.standardMVisaJson.primaryId!=scanAndPayCtrl.standardMVisaJson.mobileNumber){
                        scanAndPayCtrl.standardMVisaJson.secondaryId=scanAndPayCtrl.standardMVisaJson.mobileNumber;
                    }else if(scanAndPayCtrl.standardMVisaJson.storeId!=""  && scanAndPayCtrl.standardMVisaJson.primaryId!=scanAndPayCtrl.standardMVisaJson.storeId){
                         scanAndPayCtrl.standardMVisaJson.secondaryId=scanAndPayCtrl.standardMVisaJson.storeId;
                    }else if(scanAndPayCtrl.standardMVisaJson.loyaltyNumber!=""  && scanAndPayCtrl.standardMVisaJson.primaryId!=scanAndPayCtrl.standardMVisaJson.loyaltyNumber){
                         scanAndPayCtrl.standardMVisaJson.secondaryId=scanAndPayCtrl.standardMVisaJson.loyaltyNumber;
                    }else if(scanAndPayCtrl.standardMVisaJson.referenceId!=""  && scanAndPayCtrl.standardMVisaJson.primaryId!=scanAndPayCtrl.standardMVisaJson.referenceId){
                         scanAndPayCtrl.standardMVisaJson.secondaryId=scanAndPayCtrl.standardMVisaJson.referenceId;
                    }else if(scanAndPayCtrl.standardMVisaJson.consumerId!=""  && scanAndPayCtrl.standardMVisaJson.primaryId!=scanAndPayCtrl.standardMVisaJson.consumerId){
                         scanAndPayCtrl.standardMVisaJson.secondaryId=scanAndPayCtrl.standardMVisaJson.consumerId;
                    }else if(scanAndPayCtrl.standardMVisaJson.terminalId!=""  && scanAndPayCtrl.standardMVisaJson.primaryId!=scanAndPayCtrl.standardMVisaJson.terminalId){
                          scanAndPayCtrl.standardMVisaJson.secondaryId=scanAndPayCtrl.standardMVisaJson.terminalId;
                    }else if(scanAndPayCtrl.standardMVisaJson.purpose!=""  && scanAndPayCtrl.standardMVisaJson.primaryId!=scanAndPayCtrl.standardMVisaJson.purpose){
                          scanAndPayCtrl.standardMVisaJson.secondaryId=scanAndPayCtrl.standardMVisaJson.purpose;
                    }
                }
            }
            scanAndPayCtrl.saveMVisaJson(scanAndPayCtrl.standardMVisaJson);
        }

        scanAndPayCtrl.makeKeyStandardJson= function(){

                    console.log('makeKeyStandardJson called');

                    console.log('scanAndPayCtrl.payeeKeyObj:',scanAndPayCtrl.payeeKeyObj);

                    scanAndPayCtrl.standardMVisaJson={
                            "entryType":"M",
                            "intrchgTp":scanAndPayCtrl.interchangeType,
                            "mrchntTp":scanAndPayCtrl.merchantType,
                            "posEntryMd":scanAndPayCtrl.posEntryMd,
                            "addDataMasterCard1" : "",
                            "addDataMasterCard2" : "",
                            "addDataNpci1" : "",
                            "addDataNpci2" : "",
                            "additionalConsumerDataRequest" : "",
                            "additionalDataField" : "",
                            "billId" : "",
                            "cityName" : "",
                            "consumerId" : "",
                            "convenienceFeeAmount" : "",
                            "convenienceFeePercentage" : "",
                            "countryCode" : "",
                            "crc" : "",
                            "currencyCode" : "356",
                            "isAddDataMasterCard1Mandatory" : "",
                            "isAddDataMasterCard2Mandatory" : "",
                            "isAddDataNpci1Mandatory" : "",
                            "isAddDataNpci2Mandatory" : "",
                            "isAdditonalConsumerDataRequestMandatory" : "",
                            "isBillIdMandatory" : "",
                            "isConsumerIdMandatory" : "",
                            "isLoyaltyNumberMandatory" : "",
                            "isMobileNumberMandatory" : "",
                            "isPrimaryIdMandatory" : "",
                            "isPurposeMandatory" : "",
                            "isReferenceIdMandatory" : "",
                            "isSecondaryIdMandatory" : "",
                            "isStoreIdMandatory" : "",
                            "isTerminalIdMandatory" : "",
                            "loyaltyNumber" : "",
                            "mVisaMerchantId" : "",
                            "mVisaMerchantPan" : "",
                            "masterCardPan1" : "",
                            "masterCardPan2" :"",
                            "merchantCategoryCode" : "",
                            "merchantName" : "",
                            "mobileNumber" :"",
                            "npciid1" : "",
                            "npciid2" : "",
                            "payloadFormatIndicator" : "",
                            "pointOfInitiation" : "",
                            "postalCode" : "",
                            "primaryId" : "",
                            "primaryIdLength" : "",
                            "purpose" :"",
                            "referenceId" :"",
                            "secondaryId" :"",
                            "secondaryIdLength" :"",
                            "storeId" :"",
                            "tag03"  :"",
                            "tag08" :"",
                            "tag09" :"",
                            "tag10"  :"",
                            "tag11"  :"",
                            "tag12"  :"",
                            "tag13" :"",
                            "tag14"  :"",
                            "tag15"  :"",
                            "tagSixtyTwo10" :"",
                            "tagSixtyTwo15" :"",
                            "tagSixtyTwo16" :"",
                            "tagSixtyTwo17" :"",
                            "tagSixtyTwo18" :"",
                            "tagSixtyTwo19" :"",
                            "tagSixtyTwo20" :"",
                            "tagSixtyTwo21" :"",
                            "tagSixtyTwo22":"",
                            "terminalId" :"",
                            "tipAndFeeIndicator":"",
                            "transactionAmount" :"",
                            "remarks":"",
                            "npciMerchantId":"",
                            "masterCardMerchantId":""
                    };

                    console.log('scanAndPayCtrl.standardMVisaJson:',scanAndPayCtrl.standardMVisaJson);

                     if(scanAndPayCtrl.payeeKeyObj.tip=="" || scanAndPayCtrl.payeeKeyObj.tip==undefined || scanAndPayCtrl.payeeKeyObj.tip=='nil' || scanAndPayCtrl.payeeKeyObj.tip==null){
                        console.log('tip is blank set to 0');
                        scanAndPayCtrl.payeeKeyObj.tip=0;
                     }

                     scanAndPayCtrl.standardMVisaJson['mVisaMerchantId']=scanAndPayCtrl.payeeKeyObj.merchantId;
                     scanAndPayCtrl.standardMVisaJson['transactionAmount']=parseFloat(scanAndPayCtrl.payeeKeyObj.tip)+parseFloat(scanAndPayCtrl.payeeKeyObj.amount);

                     scanAndPayCtrl.standardMVisaJson['transactionAmount']=scanAndPayCtrl.standardMVisaJson['transactionAmount'].toFixed(2);

                     scanAndPayCtrl.standardMVisaJson['convenienceFeeAmount']=parseFloat(scanAndPayCtrl.payeeKeyObj.tip);
                     scanAndPayCtrl.standardMVisaJson['remarks']=scanAndPayCtrl.payeeKeyObj.remarks;

                     scanAndPayCtrl.standardMVisaJson['mVisaMerchantPan']=scanAndPayCtrl.generateMerchantPAN(scanAndPayCtrl.payeeKeyObj.merchantId);


                     //added to fix issue 7231- original merchant ID (less than 16 digit) shud be displayed to user
                     scanAndPayCtrl.standardMVisaJson['mVisaMerchantId']=scanAndPayCtrl.payeeKeyObj.merchantId;

                    console.log('scanAndPayCtrl.standardMVisaJson after putting values:',scanAndPayCtrl.standardMVisaJson);

                    scanAndPayCtrl.saveMVisaJson(scanAndPayCtrl.standardMVisaJson);
                }



        //function to call getConfigService to identify valid issuers
         scanAndPayCtrl.getSetupConfiguration=function(){

            //issue fix-key entry page was coming for fraction of second before service call response
            scanAndPayCtrl.showQrScan=true;
            console.log('getSetupConfiguration called');
            scanAndPayCtrl.errorSpin=true;
             scanAndPayCtrl.getSetupConfigEndPoint = lpWidget.getPreference('getSetupConfigUrl');
             console.log('getSetupConfigEndPoint:',scanAndPayCtrl.getSetupConfigEndPoint);
             var getSetupConfigURL = lpCoreUtils.resolvePortalPlaceholders(scanAndPayCtrl.getSetupConfigEndPoint, {
                 servicesPath: lpPortal.root
             });
             console.log('getSetupConfigURL:',getSetupConfigURL);
             var request = $http({
                 method: 'GET',
                 url: getSetupConfigURL,
                 //url: "http://10.5.4.13:7003/rs/getSetupConfig",
                 data: null,
                 headers: {
                     'Accept': 'application/json',
                     'Content-Type': 'application/x-www-form-urlencoded;'
                 }
             });
            request.success(function (data, status, headers, config) {
                    console.log('getSetupConfigURL success:',data);
                    scanAndPayCtrl.errorSpin=false;
                     scanAndPayCtrl.serviceError = {
                        happened: false,
                        msg: ""
                     };

                    //comment for local usage
                    scanAndPayCtrl.issuerDetailsList=data.getSetUpConfig.issuerDetailsList;
                    for(var i = 0; i < scanAndPayCtrl.issuerDetailsList.length; i++){
                        console.log('issuerName:',scanAndPayCtrl.issuerDetailsList[i].issuerName);
                        console.log('issuerIdentCode:',scanAndPayCtrl.issuerDetailsList[i].issuerIdentCode);
                    }

                    //open camera after service response success
                    scanAndPayCtrl.checkScanAndPayFlag();

                }
            )
            request.error(function (data, status, headers, config) {
                    console.log('getSetupConfigURL error:',data);
                    scanAndPayCtrl.errorSpin=false;

                    //for testing
                    /*idfcHanlder.checkTimeout(data);
                    scanAndPayCtrl.globalerror = idfcHanlder.checkGlobalError(data);
                    scanAndPayCtrl.serviceError = {
                        happened: true,
                        msg: "Sorry our machines are not working!"
                    };*/

                    if (data.cd) {
                        idfcHanlder.checkTimeout(data);
                        scanAndPayCtrl.globalerror = idfcHanlder.checkGlobalError(data);
                        scanAndPayCtrl.serviceError = {
                            happened: true,
                            msg: data.rsn
                        };
                    }
                }
            );
         }

         scanAndPayCtrl.mod10Check=function(merchantId){

            if(merchantId==undefined){
                return false;
            }

            console.log('mod10Check called for id:',merchantId);

             var sum = 0;
             var alternate = false;
             for (var i = merchantId.length - 1; i >= 0; i--){
                     var n =parseInt(merchantId.substring(i, i + 1));
                     if (alternate){
                             n *= 2;
                             if (n > 9){
                                     n = (n % 10) + 1;
                             }
                     }
                     sum += n;
                     alternate = !alternate;
             }
             console.log('mod check valid:',sum % 10);

             if(isNaN(sum%10)){
                scanAndPayCtrl.mod10CheckError=true;
                return 1;
             }

             if(sum%10!=0){
                scanAndPayCtrl.mod10CheckError=true;
             }else{
                scanAndPayCtrl.mod10CheckError=false;
             }
             return sum % 10;
             //return (sum % 10 == 0);
         }

        scanAndPayCtrl.generateMerchantPAN=function(merchantId){
            console.log('generateMerchantPAN called for id:',merchantId);


            if(merchantId==undefined){
                            return merchantId;
            }
            var merchantIdLength=merchantId.length;
            var checkDigit;
            var sequenceNumber;
            var bin;
            /*if(scanAndPayCtrl.issuer=="VISA"){
                //qrparser will give check digit
                checkDigit=merchantId.charAt(merchantIdLength-1)
                sequenceNumber=merchantId.substring(6,merchantIdLength-1);
                bin=merchantId.substring(0,6);
            }else{
                checkDigit=scanAndPayCtrl.mod10Check(merchantId);
                sequenceNumber=merchantId.substring(6,merchantIdLength);
                bin=merchantId.substring(0,6);
            }*/

            sequenceNumber=merchantId.substring(6,merchantIdLength);
            bin=merchantId.substring(0,6);

            var merchantPAN=bin;
            //6+9+1
            //add left added 0's before sequence number
            if(merchantIdLength!="16"){
                for(var i=0;i<(10-sequenceNumber.length);i++){
                    merchantPAN= merchantPAN+"0";
                }
            }
            console.log('Merchant id after appending 0s:',merchantPAN);

            //merchantPAN=merchantPAN + sequenceNumber;
            //checkDigit=scanAndPayCtrl.mod10Check(merchantPAN);

            //merchantPAN=merchantPAN + sequenceNumber + checkDigit;

            merchantPAN=merchantPAN + sequenceNumber;
            console.log('Merchant PAN:',merchantPAN);
            return merchantPAN;
        }

       initialize();
    };
    module.exports = ScanAndPayController;
});
