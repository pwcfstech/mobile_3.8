/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Filename : main.js
 *  Description: IDFC MOBILE CHANGE MPIN
 *  ----------------------------------------------------------------
 */

define( function (require, exports, module) {

    'use strict';

    module.name = 'idfc-mb-change-mpin';

    var base = require('base');
    var core = require('core');
    var ui = require('ui');

    var deps = [
        core.name,
        ui.name
    ];

    /**
     * @ngInject
     */
    function run() {
        // Module is Bootstrapped
		console.log('run');
    }

    module.exports = base.createModule(module.name, deps)
        .constant('WIDGET_NAME', module.name )
        .controller( require('./controllers') )
        .directive("moveNextOnMaxlength", function() {
                                    var count = 0;
                                    return {
                                        restrict: "A",

                                        link: function($scope, element) {
                                            count++;
                                            //alert(count);
                                            if(count == 1){
                                            //alert(element.attr("id"));
                                            //element.attr('value', '2');
                                            //element.attr('autofocus', "autofocus");
                                            //element.triggerHandler('click');
                                            }
                                            element.on("input", function(e) {
                                                if(element.val().length == element.attr("maxlength")) {
                                                   var val = element.val();
                                                   var transformedInput = val.replace(/[^0-9]/g, '');
                                                   //alert('transformedInput :::'+transformedInput+' '+'text ::'+val);
                                                   if(transformedInput != val){
                                                       element.val('');
                                                       return element;
                                                   }
                                                    var $nextElement = element.next();
                                                    //var $nextElement = element.find('[type=tel]').next();
                                                    if($nextElement.length) {
                                                        //alert('if '+$nextElement.length);
                                                        $nextElement.focus();
                                                    }else{
                                                        //alert('else '+element[0].id);
                                                        if(element[0].id == 'old_4'){
                                                           angular.element(document.querySelector('#old_5')).focus();
                                                        }else if(element[0].id == 'old_8'){
                                                           angular.element(document.querySelector('#old_9')).focus();
                                                        }
                                                        //$nextElement.focus();
                                                    }
                                                }else{
                                                    if(element.val().length == 0){
                                                        if(element[0].id == 'old_9'){
                                                        angular.element(document.querySelector('#old_8')).focus();
                                                        }else if(element[0].id == 'old_5'){
                                                        angular.element(document.querySelector('#old_4')).focus();
                                                        }else{
                                                         var $prevElement = element.prev();
                                                         $prevElement[0].focus();
                                                        }
                                                        //alert('prev element if' +element.val().length);
                                                    }else{
                                                        //alert('prev element else' +element.val().length);
                                                    }
                                                }
                                            });
                                        }
                                    }
                })
          .directive('isFocused', function($timeout) {
                          return {
                           scope: { trigger: '@isFocused' },
                           link: function(scope, element) {
                             //alert('isFocused:' +element.attr("id"));
                             scope.$watch('trigger', function(value) {
                               //alert(value);
                               if(value === "true") {
                                 $timeout(function() {
                                   //alert(element[0].id);
                                   if(element[0].id == 'old_1')
                                   element[0].focus();
                           /*        element.on('blur', function() {
                                      var $nextElement = element.next();
                                      if(element.val().length != 0){
                                        //alert('blur if');
                                        $nextElement[0].focus();
                                      }else{
                                        //alert('blur else');
                                        //element[0].focus();
                                        var $prevElement = element.prev();
                                        if($prevElement.length == 0 || element.val().length == 0){
                                           if(element[0].id == 'old_1'){
                                            element[0].focus();
                                           }else{
                                           $prevElement[0].focus();
                                           }
                                        }else{
                                            element[0].focus();
                                        }
                                      }
                                   });*/
                                 });
                               }

                             });
                           }
                         };
         })
        .service( require('./models'))
        .run( run );
});
