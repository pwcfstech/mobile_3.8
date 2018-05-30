define(function(require, exports, module) {
    'use strict';
    var idfcConstants = require('idfccommon').idfcConstants;
    var idfcHandler = require('idfcerror');
    var $ = require('jquery');
    var Blob = window.Blob || require('./lib/Blob');
    var FileSaver = require('./lib/FileSaver');
    var saveAs;

    if (Blob.initialize) {
        Blob.initialize(window);
    }

    saveAs = FileSaver.saveAs;

    exports.transReceiptModule = function($http, $rootScope, httpService, lpCoreUtils) {
        var transReceiptModule = function(config) {
            config = config || {};
            this.defaults = {
                locale: config.locale,
            };

            this.locale = config.locale;
            self.receiptType = "";
        };

        transReceiptModule.prototype.getTransData = function(receiptType, transType, transData) {
            var self = this;
            var postData = {
                "msgHeader": {},
                "msgBody": {
                    "transactionType": transType,
                    "receiptType": receiptType,
                    "data": {
                        "customerName": self.isEmptyVal(transData.customerName) ? "" : transData.customerName,
                        "successMessage": self.isEmptyVal(transData.successMessage) ? "" : transData.successMessage,
                        "failureMessage": self.isEmptyVal(transData.failureMessage) ? "" : transData.failureMessage,
                        "transactionId": self.isEmptyVal(transData.transactionId) ? "" : transData.transactionId,
                        "fromAccount": self.isEmptyVal(transData.fromAccount) ? "" : transData.fromAccount,
                        "beneficiaryNickName": self.isEmptyVal(transData.beneficiaryNickName) ? "" : transData.beneficiaryNickName,
                        "toAccountNumber": self.isEmptyVal(transData.toAccountNumber) ? "" : transData.toAccountNumber,
                        //"amount": self.isEmptyVal(transData.amount) ? "" : self.formatCurrency(transData.amount),
                        "paymentMode": self.isEmptyVal(transData.paymentMode) ? "" : transData.paymentMode,
                        "remarks": self.isEmptyVal(transData.remarks) ? "" : transData.remarks,
                        "timeAndDateOfFundTransfer": self.isEmptyVal(transData.timeAndDateOfFundTransfer) ? "" : self.formatDate(transData.timeAndDateOfFundTransfer, true),
                        "startSiDate": self.isEmptyVal(transData.startSiDate) ? "" : self.formatDate(transData.startSiDate, false),
                        //"frequency": self.isEmptyVal(transData.frequency) ? "" : transData.frequency,
                        "numberOfInstallments": self.isEmptyVal(transData.numberOfInstallments) ? "" : transData.numberOfInstallments,
                        "endSiDate": self.isEmptyVal(transData.endSiDate) ? "" : self.formatDate(transData.endSiDate, false),
                        "timeAndDateOfInitiatingSi": self.isEmptyVal(transData.timeAndDateOfInitiatingSi) ? "" : self.formatDate(transData.timeAndDateOfInitiatingSi, true),
                        "transactionReferenceNumber": self.isEmptyVal(transData.transactionReferenceNumber) ? "" : transData.transactionReferenceNumber,
                        "nameOfTheBiller": self.isEmptyVal(transData.nameOfTheBiller) ? "" : transData.nameOfTheBiller,
                        "nickname": self.isEmptyVal(transData.nickname) ? "" : transData.nickname,
                        "customField1": self.isEmptyVal(transData.customField1) ? "" : transData.customField1,
                        "customField2": self.isEmptyVal(transData.customField2) ? "" : transData.customField2,
                        "customField3": self.isEmptyVal(transData.customField3) ? "" : transData.customField3,
                        "amountDue": self.isEmptyVal(transData.amountDue) ? "" : self.formatCurrency(transData.amountDue),
                        "dueDate": self.isEmptyVal(transData.dueDate) ? "" : self.formatDate(transData.dueDate, true),
                        "amountPaid": self.isEmptyVal(transData.amountPaid) ? "" : self.formatCurrency(transData.amountPaid),
                        "transactionTimeAndDate": self.isEmptyVal(transData.transactionTimeAndDate) ? "" : self.formatDate(transData.transactionTimeAndDate, true),
                        "mobileNumber": self.isEmptyVal(transData.mobileNumber) ? "" : transData.mobileNumber,
                        "operatorName": self.isEmptyVal(transData.operatorName) ? "" : transData.operatorName,
                        "operatorCircle": self.isEmptyVal(transData.operatorCircle) ? "" : transData.operatorCircle,
                        //"rechargeAmount": self.isEmptyVal(transData.rechargeAmount) ? "" : self.formatCurrency(transData.rechargeAmount),
                        "dateOfRechargeTransaction": self.isEmptyVal(transData.dateOfRechargeTransaction) ? "" : self.formatDate(transData.dateOfRechargeTransaction, false),
                        "subscriberId": self.isEmptyVal(transData.subscriberId) ? "" : transData.subscriberId,
                        "serviceProvider": self.isEmptyVal(transData.serviceProvider) ? "" : transData.serviceProvider,
                        "rechargeAmount": self.isEmptyVal(transData.rechargeAmount) ? "" : self.formatCurrency(transData.rechargeAmount),
                        "serviceRequestNumber": self.isEmptyVal(transData.serviceRequestNumber) ? "" : transData.serviceRequestNumber,
                        "pendingWith": (self.isEmptyVal(transData.pendingWith) || transData.transactionStatus == "-" )? "" : transData.pendingWith,
                        "transactionStatus": (self.isEmptyVal(transData.transactionStatus) || transData.transactionStatus == "-") ? "" : transData.transactionStatus,
                        "debitAccountNumber": self.isEmptyVal(transData.debitAccountNumber) ? "" : transData.debitAccountNumber,
                        "thresholdAmount": self.isEmptyVal(transData.thresholdAmount) ? "" : self.formatCurrency(transData.thresholdAmount),
                        "depositTenure": self.isEmptyVal(transData.depositTenure) ? "" : transData.depositTenure,
                        "minimumSweepOutAmount": self.isEmptyVal(transData.minimumSweepOutAmount) ? "" : self.formatCurrency(transData.minimumSweepOutAmount),
                        "frequency": self.isEmptyVal(transData.frequency) ? "" : transData.frequency,
                        "note": self.isEmptyVal(transData.note) ? "" : transData.note,
						/*added by aptech on 25082017*/
						"depositType": self.isEmptyVal(transData.prodVariantLabel) ? "" : transData.prodVariantLabel,
						"amount": self.isEmptyVal(transData.amount) ? "" : self.formatCurrency((transData.amount).toString()),
						"maturityAmount": self.isEmptyVal(transData.maturityAmount) ? "": self.formatCurrency(transData.maturityAmount),
						"maturityDate":self.isEmptyVal(transData.maturityDateForFDAdvice) ? "": transData.maturityDateForFDAdvice,
						"maturityInstruction": self.isEmptyVal(transData.maturityInstruction) ? "": transData.maturityInstruction,
						"rateOfInterest": self.isEmptyVal(transData.rateOfInterest) ? "": transData.rateOfInterest,
						"depositHolder": self.isEmptyVal(transData.customerName) ? "": transData.customerName,
						"guardianName": self.isEmptyVal(transData.guardianName)|| transData.nomineeDetailsOnFDAdvice == 'N' ? "": transData.guardianName,
						"nomineeName": self.isEmptyVal(transData.nomineeName) || transData.nomineeDetailsOnFDAdvice == 'N' ? "": transData.nomineeName,
						"nomineeDOB": self.isEmptyVal(transData.nomineeDOB) || transData.nomineeDetailsOnFDAdvice == 'N' ? "": self.formatDate(transData.nomineeDOB, false),
						"modeOfOperation": self.isEmptyVal(transData.modeOfOperation) ? "": transData.modeOfOperation,
						"repaymentAccount": self.isEmptyVal(transData.repaymentAccount) ? "": transData.repaymentAccount,
						"relationship": self.isEmptyVal(transData.relationship) || transData.nomineeDetailsOnFDAdvice =='N' ? "": transData.relationship,
						"guardianDOB": self.isEmptyVal(transData.guardianDOB) || transData.nomineeDetailsOnFDAdvice == 'N' ? "": self.formatDate(transData.guardianDOB, false),
						"sweepInAcc": transData.modSwpFlg == 'Y' ? transData.accountNumber: "NA",
						"sweepInNote": transData.modSwpFlg == 'Y' ? "Funds will be pulled from this deposit in case of shortage of funds in Sweep_In account": "NA",
						"tenureDays": self.isEmptyVal(transData.tenureDays) ? "": (transData.tenureDays).toString(),
						"nomineeAddress":self.isEmptyVal(transData.nomineeAddress) || transData.nomineeDetailsOnFDAdvice == 'N' ? "":transData.nomineeAddress,
						"guardianAddress":self.isEmptyVal(transData.guardianAddress) || transData.nomineeDetailsOnFDAdvice == 'N' ? "": transData.guardianAddress
						/*end*/
					}
                }
            };
            return postData;
        }

        //Check for empty value
        transReceiptModule.prototype.isEmptyVal = function(val) {
            if (val === undefined) {
                return true;
            }
            if (val === null) {
                return true;
            }
            if (val instanceof Array) {
                return val.length === 0;
            }
            if (val.toString().trim().length === 0) {
                return true;
            }
            return false;
        }


        transReceiptModule.prototype.formatDate = function(dt, dateTime) {
            dt = new Date(dt);
            if (dateTime){
                return dt.toLocaleString("en-IN", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' });
            } else{
                return dt.toLocaleString("en-IN", {day: '2-digit', month: 'short', year: 'numeric' });
            }
        }

        transReceiptModule.prototype.formatCurrency = function(amt) {
            var afterDecimal = '';
            amt = amt.toString();
            afterDecimal = (amt.indexOf('.') > 0) ? amt.substring(amt.indexOf('.'), amt.length):".00";
            amt = (Math.floor(amt)).toString();
            var lastThree = amt.substring(amt.length - 3);
            var otherNumbers = amt.substring(0, amt.length - 3);
            if (otherNumbers != '')
                lastThree = ',' + lastThree;
                return 'INR '+ otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterDecimal;
        }

        transReceiptModule.prototype.transReceipt = function(receiptType, transType, transData) {
            var self = this;
            self.errorSpin = true;
            self.receiptType = receiptType;
            var postData = self.getTransData(receiptType, transType, transData);
            var actionUrl = 'https://my.idfcbank.com/rs/v1/pdfgen/generateTransactionReciept';
            var request = $http({
                method: 'POST',
                url: actionUrl,
                data: postData,
                headers: {
                    'Content-Type': 'application/json',
                    // 'Content-Type': 'application/x-www-form-urlencoded;'
                },
                responseType: 'arraybuffer'
            });
            // var servicEndPoint = '/rs/v1/trans-receipt';
            // var request = $http.get(servicEndPoint);
            this.loading = true;
            request.success(function(response, status, headers, config) {
                self.errorSpin = false;
                if (self.receiptType == 'download') {
                    try {
                        var file = new Blob([response], {
                            type: 'application/pdf'
                        });
                        saveAs(file, transType + "_TransactionReceipt");
                    } catch (e) {
                        alert(e.stack);
                    }
                } else if (self.receiptType == 'email') {
                    if (status == 200) {
                        self.error = true;
                        self.errorMsg = 'Mail sent successfully';
                        $rootScope.$broadcast('mailSent', "Mail sent successfully.");
                    }
                } else if (self.receiptType == 'print') {
                    try {
                        var file = new Blob([response], {
                            type: 'application/pdf'
                        });
                        var fileURL = window.URL.createObjectURL(file);
                        var wndw = window.open(fileURL);
                        wndw.print();
                        // }
                    } catch (e) {
                        // alert(e.stack);
                        console.log(e.stack);
                    }
                }
            })
            request.error(function(error) {
                self.errorSpin = false;
                $rootScope.$broadcast('mailSentError', "Your Email ID is not registered with us. To register,");
                if (error.cd) {
                    // Redirect to login page if session timed out
                    idfcHandler.checkTimeout(error);
                }
                self.error = {
                    message: error.statusText
                };
            });
            request['finally'](function() {
            $rootScope.$broadcast('mailSentFinally', "Your Email ID is not registered with us. To register,");
                self.loading = false;
            });

            return request;
        };


        /**
         * Refresh Model
         *
         * @param method
         */
        return transReceiptModule;
    };
});