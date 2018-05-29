/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Filename : main.js
 *  Description: IDFC MOBILE SET UP MPIN
 *  ----------------------------------------------------------------
 */

define( function (require, exports, module) {

    'use strict';

    module.name = 'idfc-mb-login-mpin';

    var base = require('base');
    var core = require('core');
    var ui = require('ui');
    var cq = require('idfc-cq');
    //var focusIf = require('focus-if');
    //alert('focusIF ' +focusIf);
    var deps = [
        core.name,
        ui.name,
        cq.name,
        /*(change is uiSwitch reqd)Toggle needs to work as a toggle. Right now it's an image. On click it should change the position as well as user should be able to slide it */
        'uiSwitch',
        'ngTouch'
    ];

    /**
     * @ngInject
     */
    function run() {
        // Module is Bootstrapped
    }

    module.exports = base.createModule(module.name, deps)
        .constant('WIDGET_NAME', module.name )
        .controller( require('./controllers') )
           .directive("moveNextOnMaxlength", function($timeout) {
                    return {
                        restrict: "A",
                        link: function($scope, element) {
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
                                    if($nextElement.length && element[0].id != 'mpinValu4') {
                                        //alert('if :: '+$nextElement.length);
                                         $nextElement[0].focus();
                                    }else{
                                      //alert('else :: '+element[0].id);
                                      console.log('else blur');
                                      element[0].blur();
                                    }
                                }else{
                                //alert('else input' +element.val().length);
                                /*if(element.val().length == 0){
                                    //alert('prev element if' +element.val().length);
                                    var $prevElement = element.prev();
                                    $prevElement[0].focus();
                                }else{
                                     //alert('prev element else' +element.val().length);
                                 }*/
                                }
                            });
                          element.bind("keydown keypress", function(e){
                                //alert(e.which +' '+element);
                                if( e.which == 8 ){ // 8 == backspace
                                  if(element.val().length == 0){
                                     var $prevElement = element.prev();
                                     //alert('$prevElement '+$prevElement[0].id);
                                     $prevElement[0].focus();
                                  }
                                }
                           });

                          /*  element.bind('blur', function(e) {
                               alert($document[0].activeElement);
                               var $nextElement = element.next();
                                //alert('>>>>>>>>>>'+e.target);
                                console.log('blur '+element[0].id+''+element.val().length);
                                if(undefined!=element[0].id && 1!=element.val().length) {
                                    console.log('clicked in input');
                                    element[0].focus();
                                }else {
                                    console.log('clicked outside');
                                    element[0].focus();
                                }

                            });*/
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
                                         /* if(element[0].id == 'mpinValu1'){
                                            //alert(element[0].id);
                                            element[0].focus(true);
                                          }*/
                                          element.on('blur', function() {
                                             console.log('blur');
                                             var $nextElement = element.next();
                                             if(element.val().length != 0){
                                               if(!angular.isUndefined($nextElement[0])){
                                                  //alert('blur if ' +$nextElement[0]);
                                                  $nextElement[0].focus();
                                               }else{
                                                  //alert('blur else ' +$nextElement[0]);
                                                  //element.removeAttr('tabindex');
                                               }
                                             }else{
                                               //alert('blur else');
                                               var $prevElement = element.prev();
                                               if($prevElement.length == 0 || element.val().length == 0){
                                                  if(element[0].id == 'mpinValu1'){
                                                   element[0].focus();
                                                  }else{
                                                   $prevElement[0].focus();
                                                 }
                                               }else{
                                                   element[0].focus();
                                               }
                                             }

                                          });
                                        });
                                      }

                                    });
                                  }
                                };
        })
        /*.directive('numbersOnly', function () {
            return {
                require: 'ngModel',
                link: function (scope, element, attr, ngModelCtrl) {
                    function fromUser(text) {
                      alert('text'+text);
                      if (text) {
                            //var transformedInput = text.replace(/[^0-9]/g, '');
                            var transformedInput = text.replace(/[^0-9]/g, '');
                            if (transformedInput !== text) {
                                ngModelCtrl.$setViewValue(transformedInput);
                                ngModelCtrl.$render();
                            }
                            return transformedInput;
                        }
                        return undefined;
                    }
                    ngModelCtrl.$parsers.push(fromUser);
                }
            };
        })*/
      /*  .directive('loseFocus', function() {
          return {
            link: function(scope, element, attrs) {
                alert('attrs.loseFocus :: '+attrs.loseFocus);
              scope.$watch(attrs.loseFocus, function(value) {
                alert('value :: '+value);
                if(value === true) {
                  console.log('value='+value);
                  element[0].blur();
                }
              });
            }
          };
        })
        .directive("outsideClick", ['$document','$parse', function( $document, $parse ){
             return {
                 link: function( $scope, $element, $attributes ){
                     var scopeExpression = $attributes.outsideClick,
                         onDocumentClick = function(event){
                             var isChild = $element.find(event.target).length > 0;

                             if(!isChild) {
                                 $scope.$apply(scopeExpression);
                             }
                         };

                     $document.on("click", onDocumentClick);

                     $element.on('$destroy', function() {
                         $document.off("click", onDocumentClick);
                     });
                 }
             }
         }])*/
        .service( require('./models'))
        .run( run );
});
