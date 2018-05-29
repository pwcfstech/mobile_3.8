define(function(require, exports, module) {
    'use strict';

    var $ = window.jQuery;

    
    // @ngInject
    exports.lpTransactionUpdateLayout = function(lpCoreBus, $timeout) {
        return {
            restrict: 'A',
            scope: {
                paymentOrder: '=lpTransactionUpdateLayout'
            },
            link: function(scope, el, attrs, ngModel) {
                var $launcher = $(el[0]).closest('.lp-launcher-area');
                var $close = $launcher.find('.close');
                var $title = $launcher.find('.widget-title span');
                var defaultTitle = $title.text();

                scope.$watch('paymentOrder.update', function(update) {
                    if (update) {
                        $title.text('Update Transfer');
                        if (scope.paymentOrder.isScheduledTransfer) {
                            scope.paymentOrder.updateScheduled = true;
                            scope.paymentOrder.updateOneTime = false;
                        } else {
                            scope.paymentOrder.updateOneTime = true;
                            scope.paymentOrder.updateScheduled = false;
                        }
                    } else {
					
                        $title.text('Transfer now');
						
						scope.paymentOrder.updateOneTime = true;
						scope.paymentOrder.updateScheduled = true;
						scope.paymentOrder.counterpartyIban="";
						scope.paymentOrder.counterpartyName="";
						scope.paymentOrder.instructedAmount=0;
						scope.paymentOrder.paymentDescription="";
						 $(".whole-amount-input").val('');
						 $(".decimal-amount-input").val('');
						 $('.description-newtransfer').val('');
						scope.paymentOrder.isScheduledTransfer = false;
						scope.hideBeneTabOneTime=false;
						scope.paymentOrder.scheduleDate= new Date();
						scope.activeTransferTab = {
							bank: true,
						newBeneficiary:false
							};
						scope.paymentOrder.newBeneficiary={
					bankName:"",
					ifsc:"",
					address:"",
					mobile:"",
					name:'',
                    nickname:'',
                    account:'',
                    confirmAccount:'',
                    accType :"",
                    limit:'',
                    validity:'',
					email:'',
					'otp':'',
                    isNew: false,
					beneficiaryType:''
					
				};
				scope.paymentOrder.scheduledTransfer= {
                    frequency: "",
                    every: 1,
                    intervals: [],
                    startDate: new Date(),
                    endDate: new Date(),
                    timesToRepeat: 1
                }
                  
			}
                });

                $close.click(function() {
                    scope.paymentOrder.update = false;
                });

                lpCoreBus.subscribe('launchpad-retail.closeActivePanel', function() {
                    scope.paymentOrder.update = false;
                });
            }
        };
    };

    exports.lpFutureTime = function() {
        return {

            require: '?ngModel',

            link: function(scope, elm, attrs, ngModel) {

                var now = new Date();
                now.setDate(now.getDate() - 1);
                now = now.getTime();

                ngModel.$parsers.unshift(function(value) {
                    var date;

                    if (!value) {
                        ngModel.$setValidity('lpFutureTime', true);
                        return null;
                    }

                    date = Date.parse(value);

                    if (isNaN(date) || date < 0) {
                        ngModel.$setValidity('lpFutureTime', false);
                        return value;
                    }

                    if (date <= now) {
                        ngModel.$setValidity('lpFutureTime', false);
                        return value;
                    }

                    ngModel.$setValidity('lpFutureTime', true);
                    return value;
                });
            }
        };
    };

    // @ngInject
    exports.lpSmartsuggest = function(lpCoreUtils, ContactsModel, SmartSuggestEngine, SmartSuggestFormatter) {

        return {
            restrict: 'A',
            scope: {
                'lpSmartsuggestSelect': '&',
                'lpSmartsuggestClear': '&',
                'contacts': '=lpContacts',
                'accounts': '=lpAccounts',
                'model': '=ngModel'
            },
            link: function(scope, element, attrs) {

                var smartSuggest = new SmartSuggestEngine({
                    showTitles: true
                });
                smartSuggest.addSuggester({
                    data: [],
                    suggest: SmartSuggestEngine.builtIn.getContactSuggestions
                });

                scope.$watch('accounts', function(accounts) {
                    smartSuggest.addSuggester({
                        data: accounts,
                        suggest: SmartSuggestEngine.builtIn.getAccountSuggestions,
                        type: SmartSuggestEngine.types.ACCOUNT,
                        options: {
                            showAll: true
                        }
                    });
                });

                scope.$watch('contacts', function(contacts) {
                    if (lpCoreUtils.isArray(contacts)) {
                        smartSuggest.addSuggester({
                            data: contacts,
                            suggest: SmartSuggestEngine.builtIn.getContactSuggestions,
                            type: SmartSuggestEngine.types.CONTACT,
                            options: {
                                showAll: true
                            }
                        });
                    }
                });


                var formatter = new SmartSuggestFormatter({
                    locale: 'en-US'
                });

                scope.$watch('model', function() {
                    scope.$eval(attrs.ngModel + ' = model');
                });

                scope.$watch(attrs.ngModel, function(val) {
                    scope.model = val;
                });

                $(element).autosuggest({
                    lookup: function(q) {
                        var suggs = smartSuggest.getSuggestions(q);
                        suggs = suggs.map(function(suggestion) {
                            var values = formatter.format(suggestion);

                            var displayValue;
                            if (suggestion.contact) {
                                displayValue = suggestion.contact.name;
                            } else if (values.length === 2) {
                                displayValue = values[0] + ' to ' + values[1];
                            } else {
                                displayValue = values[0];
                            }

                            return {
                                data: suggestion,
                                value: displayValue
                            };
                        });
                        return suggs;
                    },
                    onSelect: function(suggestion) {
                        var account,
                            name;

                        if (suggestion.data.type === SmartSuggestEngine.types.TITLE) {
                            return false;
                        }

                        switch (suggestion.data.type) {
                            case SmartSuggestEngine.types.CONTACT:
                                name = suggestion.data.contact.name;
                                account = suggestion.data.contact.account;
                                break;
                            case SmartSuggestEngine.types.ACCOUNT:
                                name = suggestion.data.account.name;
                                account = suggestion.data.account.iban;
                                break;
                        }
                        scope.model = name;
                        scope.lpSmartsuggestSelect({
                            account: account
                        });
                        return false;
                    },
                    onClear: function() {
                        scope.lpSmartsuggestClear();
                    },
                    formatResult: function(suggestion) {
                        return formatter.getSuggestionHtml(suggestion.data);
                    },
                    autoSelectFirst: false,
                    minChars: 0
                });
            }
        };
    };
	

    // @ngInject
    exports.ifscChar = function(lpCoreBus, $timeout) {
        return {
			require : 'ngModel',
            restrict: 'A',
            scope: true,
			controller : function($scope){
				
			},
            link: function(scope, el, attrs, ctrl) {
			    var thisCtrl = scope.mainCtrl; console.log(thisCtrl);
                var IFSCcodeLimit = 11;	
                var readOnlyLength = 4;				
                angular.element('#ifsc_help_info_link').addClass('disable-link');
				el[0].disabled = true;	
				
             var regReplace,
                preset = {
                    'only-numbers': '0-9',
                    'numbers': '0-9\\s',
                    'only-letters': 'A-Za-z',
                    'letters': 'A-Za-z\\s',
                    'email': '\\wÑñ@._\\-',
                    'alpha-numeric': 'a-zA-Z0-9',
                    'latin-alpha-numeric': '\\w\\sÑñáéíóúüÁÉÍÓÚÜ'
                },
                filter = preset['alpha-numeric'] || attrs.chars;				
				
				el.bind('keyup change keydown click', function (e) {
				  console.log('Key first bind :: ',e.which);
				  console.log('first bind :: ',el.val().length);
				  if(el.val().length < IFSCcodeLimit){
				   console.log('reset all details here ...');
				   $timeout(function(){
	                   thisCtrl.dataSelected = false;
				       thisCtrl.bankDetails = {}; 
                       thisCtrl.savedIfscValidateErrors = false; 					   
				   });

				  }					
                   //thisCtrl.dataSelected = false;
				   //thisCtrl.bankDetails = {};
                   regReplace = new RegExp('[^' + filter + ']', 'ig');

				   if(regReplace.test(el.val())){
                   ctrl.$setViewValue(el.val().replace(regReplace, ''));
                   ctrl.$render();	
				   }				   
				});

				scope.$watch('paymentOrder.newBeneficiary.ifsc', function(new_val, old_val){ 
					if(old_val != new_val){ 
						//console.log(new_val);
						$timeout(function () { console.log('data fron directive just timeout start  ::::::::: '+new_val);
							if(typeof new_val != 'undefined'){ 
								if(new_val != ''){ console.log('data fron directive ::::::::: '+new_val);
								console.log(thisCtrl.bankDetails);
								 el[0].disabled = false;
								 //el[0].focus();
								 angular.element('#ifsc_help_info_link').removeClass('disable-link');
								 angular.element('#ifsc_help_info_link').addClass('enable-link');
								 scope.$emit('resetDataForIfsc', true);
								 
								 if(new_val.length == readOnlyLength)
									 thisCtrl.bankDetails = {};	
								} else { 
								 el[0].disabled = true;
								 angular.element('#ifsc_help_info_link').removeClass('enable-link');
	
								 angular.element('#ifsc_help_info_link').addClass('disable-link');
								 scope.$emit('resetDataForIfsc', true);
								 thisCtrl.bankDetails = {};								 
								}

								if(new_val.length == IFSCcodeLimit)
								 scope.$emit('IFSCdetailsEvent', new_val);
							} else {
								scope.$emit('resetDataForIfsc', true);
							}
						});
					} else {
						if(scope.paymentOrder.newBeneficiary.ifsc){
						  el[0].disabled = false;
						  angular.element('#ifsc_help_info_link').removeClass('disable-link');
						}
					}
				});
				el.bind('keyup keydown keypress click', function(e){
				    console.log('Key second bind :: ',e.which);
				    console.log('this.selectionStart :: ',this.selectionStart);
				    console.log('readOnlyLength :: ',readOnlyLength);
					/*if ((e.which != 37 && (e.which != 39))
						&& ((this.selectionStart < readOnlyLength)
						|| ((this.selectionStart == readOnlyLength) && (e.which == 8 || e.which==229)))) {
						console.log('Inside condition');
						e.preventDefault();
						//return false;
					}*/
                    /*if (this.value.length == IFSCcodeLimit) {return false;}	*/

					console.log('this.selectionStart ::::::::::', this.selectionStart);
                    if (this.selectionStart < readOnlyLength) {
                    console.log('data ::::::::::', localStorage.getItem('firstFourChars'));
                    //interChTypeList[i].substr(0, 4) + interChTypeList[i].substr(1);
                      ctrl.$setViewValue(el.val().replace(el.val().substr(0, 4), localStorage.getItem('firstFourChars')));
                      ctrl.$render();
                    }

				});	
            }
        };
    };

    // @ngInject
    exports.ifscCharSearch = function(lpCoreBus, $timeout) {
        return {
			require : 'ngModel',
            restrict: 'A',
            scope: true,
			controller : function($scope){
				
			},
            link: function(scope, el, attrs, ctrl) { 
			    var readOnlyLength = 4;
				el.bind('keypress, click, keyup, keydown', function(e){
				     console.log(' char search Key second bind :: ',e.which);
                     console.log('char search this.selectionStart :: ',this.selectionStart);
					if ((event.which != 37 && (event.which != 39))
						&& ((this.selectionStart < readOnlyLength)
						|| ((this.selectionStart == readOnlyLength) && (event.which == 8)))) {
						console.log('char search inside if');
						return false;
					}	
                    /*if (this.value.length == IFSCcodeLimit) {return false;}	*/					
			
				});
            }
        };
    };   

    // @ngInject 
});