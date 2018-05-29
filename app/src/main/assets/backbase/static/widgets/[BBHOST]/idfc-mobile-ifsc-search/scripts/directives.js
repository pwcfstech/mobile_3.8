define(function(require, exports, module) {
    'use strict';

    //var $ = window.jQuery;

    /**
     * UPDATE: special ugly directive which should modify widget's layout
     *         in order to provide update functionality (and remove those
     *         changes on the widget's exit.
     */

    // @ngInject
    exports.ifscCharSearch = function(lpCoreBus, $timeout) {
        return {
			require : 'ngModel',
            restrict: 'A',
            scope: true,
			controller : function($scope){
				
			},
            link: function(scope, el, attrs, ctrl) { 
			    //var readOnlyLength = 4;
				//el.bind('keypress, click, keyup, keydown', function(e){
					/*if ((event.which != 37 && (event.which != 39))
						&& ((this.selectionStart < readOnlyLength)
						|| ((this.selectionStart == readOnlyLength) && (event.which == 8)))) {
						return false;
					}	*/
                    /*if (this.value.length == IFSCcodeLimit) {return false;}	*/					
			
				//});
				
				
             var regReplace,
                preset = {
                    'only-numbers': '0-9',
                    'numbers': '0-9\\s',
                    'only-letters': 'A-Za-z',
                    'letters': 'A-Za-z\\s',
                    'email': '\\wÑñ@._\\-',
                    'alpha-numeric': 'a-zA-Z0-9 ,',
                    'latin-alpha-numeric': '\\w\\sÑñáéíóúüÁÉÍÓÚÜ'
                },
                filter = preset['alpha-numeric'] || attrs.chars;				
				
				el.bind('keyup change keydown click', function () {
                   regReplace = new RegExp('[^' + filter + ']', 'ig');
				   if(regReplace.test(el.val())){
                   ctrl.$setViewValue(el.val().replace(regReplace, ''));
                   ctrl.$render();	
				   }				   
				});				
            }
        };
    };   

    // @ngInject
   
});
