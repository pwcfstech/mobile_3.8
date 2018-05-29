define(function(require, exports, module) {
    'use strict';

    var $ = window.jQuery;

    /**
     * UPDATE: special ugly directive which should modify widget's layout
     *         in order to provide update functionality (and remove those
     *         changes on the widget's exit.
     */
    // @ngInject
    exports.ifscChar = function(lpCoreBus, $timeout) {
        return {
			require : 'ngModel',
            restrict: 'A',
            scope: true,
			controller : function($scope){
				
			},
            link: function(scope, el, attrs, model) { console.log('from directive:::::::');
			    var thisCtrl = scope.contactsCtrl;
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
				
				el.bind('keyup change keydown click', function () {
				  if(el.val().length < IFSCcodeLimit){
				   console.log('reset all details here ...');
				   $timeout(function(){
	                   thisCtrl.dataSelected = false;
				       thisCtrl.bankDetails = {}; 
                       thisCtrl.savedIfscValidateErrors = false; 					   
				   });

				  }
                   regReplace = new RegExp('[^' + filter + ']', 'ig');
				   if(regReplace.test(el.val())){
                   model.$setViewValue(el.val().replace(regReplace, ''));
                   model.$render();
				   }
				});

				scope.$watch('contactsModel.currentContact.ifscCode', function(new_val, old_val){ 
					if(old_val != new_val){ 
						//console.log(new_val);
						$timeout(function () { 
							if(typeof new_val != 'undefined'){ 
								if(new_val != ''){ console.log('data fron directive ::::::::: '+new_val);
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
						if(scope.contactsModel.currentContact.ifscCode){
						  el[0].disabled = false;
						  angular.element('#ifsc_help_info_link').removeClass('disable-link');
						}
					}
				});
				el.bind('keyup keydown keypress click', function(e){
					/*if ((e.which != 37 && (e.which != 39))
						&& ((this.selectionStart < readOnlyLength)
						|| ((this.selectionStart == readOnlyLength) && (e.which == 8 || e.which==229)))) {
						e.preventDefault();
						//return false;
					}*/

					console.log('this.selectionStart ::::::::::', this.selectionStart);
                    if (this.selectionStart < readOnlyLength) {
                    console.log('data ::::::::::', localStorage.getItem('firstFourChars'));
                    //interChTypeList[i].substr(0, 4) + interChTypeList[i].substr(1);
                      model.$setViewValue(el.val().replace(el.val().substr(0, 4), localStorage.getItem('firstFourChars')));
                      model.$render();
                    }
				});
d

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
            link: function(scope, el, attrs, model) { 
			    var readOnlyLength = 4;
				el.bind('keypress, click, keyup, keydown', function(e){
					if ((event.which != 37 && (event.which != 39))
						&& ((this.selectionStart < readOnlyLength)
						|| ((this.selectionStart == readOnlyLength) && (event.which == 8)))) {
						return false;
					}	
                    /*if (this.value.length == IFSCcodeLimit) {return false;}	*/					
			
				});
            }
        };
    };   

    // @ngInject
   
});
