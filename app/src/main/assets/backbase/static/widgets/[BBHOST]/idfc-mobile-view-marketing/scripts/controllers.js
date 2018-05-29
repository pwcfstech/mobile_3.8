/**
 * Controllers
 * @module controllers
 */
define(function (require, exports,module) {
    'use strict';
    
  var $ = require('jquery');
  
  var ngTouch = require('angular-touch');
  var carousel  = require('angular-carousel');
  
   var marketingFlag;
   var appVersionStatus;
   var isBlackListed;
   var mpinFlag;
   var blackListMessage;

    function MktgController($scope, $http, lpCoreUtils, lpWidget ,lpPortal ,  lpCoreBus , $location , $window , $timeout , $q) {
		$scope.errorSpin = true;
		$timeout(function(){
            $scope.errorSpin = false;
		    MktgCtrl($scope, $http, lpCoreUtils, lpWidget , lpPortal , lpCoreBus , $location , $window , $timeout, $q);
		}, 500);

	
	};



    /**
     * 
     * Main controller
     * @ngInject
     * @constructor
     */
	function MktgCtrl($scope, $http, lpCoreUtils, lpWidget , lpPortal  ,lpCoreBus , $location , $window ,$timeout , $q) {

    //$scope.errorSpin = true;
	var defered = $q.defer();	
	var promises = []; 	
	/*
    	Following parametesr needed from global varaible
    	1. Blacklisting
    	2. Marketing Flag
    	3. Version flag
    	4. MPIN setup flag
    	*/


        
			
		//Plugin Integration
		//loads localStorage using plugin common function if it is not mobile	
		
		$scope.notificationToken='';
		$scope.redirectToSignIn = lpPortal.root + '/' + lpPortal.name;
		$scope.imageOne=  lpCoreUtils.getWidgetBaseUrl(lpWidget)+'/media/applynow.png';  //+'/media/placeHolder-icon.jpg';
		$scope.imageTwo=  lpCoreUtils.getWidgetBaseUrl(lpWidget)+'/media/mpin.png';//+'/media/multiple-cions.jpg';
		$scope.imageThree= lpCoreUtils.getWidgetBaseUrl(lpWidget)+'/media/fingerprint.png';//+'/media/touchid.jpg';
		$scope.imageFour=  lpCoreUtils.getWidgetBaseUrl(lpWidget)+'/media/mai .png';//+'/media/notifications.jpg';
		$scope.imageArray = [{imgSrc : $scope.imageOne , header : 'Apply Now' , paragraph : 'Apply for anything we have right here'} ,
		                     {imgSrc:$scope.imageTwo , header : 'MPIN' , paragraph : 'Faster access to your account through 4-digit MPIN. Whats more! You can use the same MPIN across all mobile devices'} ,
		                     {imgSrc : $scope.imageThree , header : 'Fingerprint' , paragraph : 'Use device touch ID - no forgetting!'},
		                     {imgSrc : $scope.imageFour , header : 'OTP reading' , paragraph : 'We\'ll read and enter the OTP for you'}];
		$scope.showDvcBlckListMsg = false;
		$scope.versionDescription = '';
		$scope.isMpinSetForDevice = null;
		$scope.showAppDetails = false;
		$scope.withinGrace = {'buttonList': [
					                      {'label':'View Details','id':'details'},
					                      {'label':'Upgrade Now','id':'upgrade'},
					                      {'label':'Later','id':'later'}					                      
					                    ],
					           'appDetails':'',
					           'message' : '',
					           'updateURL' : ''
							 };
		$scope.beyondGrace = {'buttonList': [
											{'label':'View Details','id':'details'},
											{'label':'Upgrade Now','id':'upgrade'}

        		                                ],
        		                       'appDetails':'',
        		                       'message' : '',
        		                       'updateURL' : ''

        		                     };
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        		$http.defaults.headers.post['Accept'] = 'application/json';
        		$http.defaults.headers.post['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        		$http.defaults.headers.post['Pragma'] = 'no-cache';
        		$http.defaults.headers.post['Expires'] = '0';
	   /*
    	Following parametesr needed from global varaible
    	1. Blacklisting
    	2. Marketing Flag
    	3. Version flag
    	4. MPIN setup flag
    	*/
        //$scope.getstarted = false;
       /* $scope.checkGlobalVariable = function(){

            var globalVariablePlugin = cxp.mobile.plugins&& cxp.mobile.plugins['GlobalVariables'];
                if(globalVariablePlugin){
            	    var isMarketingSeenSuccessCallback = function(data) {
            		    if(data) {
            			    console.log('Get value for initial attribute'+JSON.stringify(data));
            			    marketingFlag = data['marketingFlag'];
            				appVersionStatus = data['appVersionStatus'];
            				isBlackListed = data['isBlackListed'];
            				mpinFlag = data['mpinFlag'];
            				blackListMessage = data['blacklistMessage'];

            				console.log('isBlackListed'+isBlackListed);
            				if(isBlackListed=='true'){
            				    console.log('Device BlackListed');
            				    //showing popup thru native for device blacklist message
            		            //$scope.showDvcBlckListMsg = !$scope.showDvcBlckListMsg;

                                 gadgets.pubsub.publish("display.1btn.popup",{
                                        data:"DVCEBLCKLIST",
                                        message: blackListMessage
                                    });
            				}else{
            				    console.log('appVersionStatus'+appVersionStatus);
            				    //appVersionStatus = 'L';
                                if(appVersionStatus=='D'){
                                     $scope.getAppVersionData();
                                }
								    //$scope.startMarketting();
            				}

            		    } else {
            				alert('Failure: '+ JSON.stringify(data));
            			}
            		};
            		var isMarketingSeenErrorCallback = function(data) {
            			console.log('Fatal Error:Reponse');
            		};

            		globalVariablePlugin.getMarketingDecider(
            					isMarketingSeenSuccessCallback,
            					isMarketingSeenErrorCallback
            		);

            			}
            			else{
            				console.log('Fatal Error:Cannot find Plugin');
            			}

            	   }

         $scope.getAppVersionData = function(){
            var globalVariablePlugin = cxp.mobile.plugins&& cxp.mobile.plugins['GlobalVariables'];
                var appVersionId;
                var versionDescription;
                var activeVersionNo;
                var gracePeriod;
                var appUpgradeMessage;
                var appVersionStatus;
                var appDownloadLink;
                if(globalVariablePlugin){
                    var getAppVersionDataSuccessCallback = function(data) {
                        if(data) {
                            console.log('App Version '+JSON.stringify(data));
                            appVersionId = data['appVersionId'];
                            versionDescription = data['versionDescription'];
                            activeVersionNo = data['activeVersionNo'];
                            gracePeriod = data['gracePeriod'];
                            appVersionId = data['appVersionId'];
                            appUpgradeMessage = data['appUpgradeMessage'];
                            appVersionStatus = data['appVersionStatus'];
                            appDownloadLink = data['appDownloadLink'];
                                //Set App Version Viewed


                        if('D'==appVersionStatus && (gracePeriod=='' || '0'!==gracePeriod)){
                            //App Version
                            localStorage.setItem('viewedAppVersion' , 'true');
                           // $scope.showWithinGrace = true;
                           // $scope.showBeyondGrace = false;
                            var message = 'This version of your app requires updating in '+ gracePeriod
                            +' days. Upgrade to latest version? ';
                            $scope.withinGrace.message = message;
                            $scope.withinGrace.appDetails = versionDescription;
                            $scope.withinGrace.updateURL = appDownloadLink;
                            console.log('WGP');
							//showing thru native for app upgrage message
							//within the grace period. 3 btn
							//$scope.showAppUpgradeMsg = true;
                            gadgets.pubsub.publish("display.1btn.popup",{
                                    data:"APPUPWTHNGP",
                                    url: $scope.withinGrace.updateURL,
                                    message: $scope.withinGrace.message,
                                    appDetails: $scope.withinGrace.appDetails
                                });
                             console.log('pop called 3 btn APPUPWTHNGP');
                        }else if('D'==appVersionStatus && '0'==gracePeriod){
                            $scope.showWithinGrace = false;
                            $scope.showBeyondGrace = true;
                            var message = 'Your IDFC app version is too old and is no longer supported. Upgrade to version '+
                              activeVersionNo +' to access new features?';
                              $scope.beyondGrace.message = message;
                              $scope.beyondGrace.appDetails = versionDescription;
                              $scope.beyondGrace.updateURL = appDownloadLink;
                              console.log('BGP');
							  //showing thru native for app upgrage message
							  //within the grace period. 3 btn
							  //$scope.showAppUpgradeMsg = true;
                              gadgets.pubsub.publish("display.1btn.popup",{
                                    data:"APPUPBYNDGP",
                                    url: $scope.beyondGrace.updateURL,
                                    message: $scope.beyondGrace.message,
                                    appDetails: $scope.beyondGrace.appDetails
                                });  

                        }

                 } else {
                    alert('Failure: '+ JSON.stringify(data));
                 }


                };
                	var getAppVersionDataErrorCallback = function(data) {
                               					console.log('Fatal Error:Reponse');
                     };
          		    globalVariablePlugin.getAppVersionData(
                               					getAppVersionDataSuccessCallback,
                               					getAppVersionDataErrorCallback
                               				);

                   }
                  else{
                  console.log('Fatal Error:Cannot find Plugin');
                   }
          }
			*/

		
		
		$scope.showDetails = function(id, msg, url) {
			if('details'===id){
				$scope.showVersionDescription = true;
				$scope.versionDescription = msg;
			}else if('upgrade'===id){
				console.log("URL"+url);
				$location.path(url);
			}else if('later'===id){				
				//Continue with app launch

			}else if('cancel'===id){

			}
			    var globalVariablePlugin1 = cxp.mobile.plugins['GlobalVariables'];
                  if(globalVariablePlugin1)
                  {
                     globalVariablePlugin1.setAppVersionViewed(null,null,'true');
                  }
                  else{
                       console.log('Fatal Error: Global Variable plugin not registered');
                   }
		}
		
		
		
		$scope.partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget)+ '/templates/partial';
			$scope.templates = {
			        //removing initial /
					appUpgradeMsg: 'templates/partial' + '/appUgradeMsg.html',
					deviceBlackListed: 'templates/partial' + '/deviceBlacklist.html'
		};
		
		
		
        $scope.startMarketting = function(){



             $scope.openMarketting = true;
			  $scope.addSlides($scope.slides, 'slider', 4).then(function (){
				$scope.lastIdFromslides = JSON.stringify($scope.slideImages[3].id);
				//$scope.errorSpin = false;
			  });
			   var globalVariablePlugin = cxp.mobile.plugins['GlobalVariables'];
              globalVariablePlugin.setMarketingFlag('true');

			defered.resolve();
			return defered.promise;
			  
        }

       $scope.notificationSend = function(){
                         console.log('Inside notificationSend');
                             var globalVariablePlugin =cxp.mobile.plugins['GlobalVariables'];

                                      if(globalVariablePlugin){
                                            var getFCMNotificationTokenSuccessCallback = function(data) {
                                               if(data) {
                                                    $scope.notificationToken = data['notificationToken'];
                                                   console.log('Inside notificationSend'+$scope.notificationToken);
                                                    if(globalVariablePlugin && $scope.notificationToken!=null && $scope.notificationToken!=''){
                                                                    var getDeviceFootPrintHeaderSuccessCallback = function(data) {
                                                                        	if(data) {
                                                                                        var jsonObj = {
                                                                                            'deviceId' : data['deviceId'],
                                                                                            'channel' : data['channel'],
                                                                                            'ipAddress' : data['ipAddress'],
                                                                                            'timeZone' : data['timeZone'],
                                                                                            'nwProvider' : data['nwProviderLine1'],
                                                                                            'connectionMode' : data['connectionMode'],
                                                                                            'geoLatitude' : data['geoLatitude'],
                                                                                            'geoLongitude' : data['geoLongitude']
                                                                                        };
                                                                                        $scope.msgHeader = JSON.stringify(jsonObj);
                                                                                        var postData = {
                                                                                                 'msgHeader':$scope.msgHeader,
                                                                                                 'notificationFlag':'true',//$scope.notificationPermissionFlag,
                                                                                                 'notificationToken':$scope.notificationToken,//$scope.notificationTokenId,
                                                                                                 'smsReadingFlag':'false',//$scope.smsReadFlag,
                                                                                                  'bioAuthFlag':'false'
                                                                                         };
                                                                                        postData = $.param(postData || {});
                                                                                        console.log('Post Data',postData);
                                                                                       var updateUserPreferenceURL  = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('updateUserPreference'));
                                                                                      // var updateUserPreferenceURL = 'https://my.idfcbank.com/rs/updateUserPreference';
                                                                                        var serviceCall = $http({
                                                                                        	method : 'POST',
                                                                                        	url : updateUserPreferenceURL,
                                                                                        	data : postData,
                                                                                        	 headers: {
                                                                                             'Accept': 'application/json',
                                                                                             'Content-Type': 'application/x-www-form-urlencoded;'
                                                                                          }
                                                                                        });
                                                                                        serviceCall.success(function(headers, data) {
                                                                                        console.log('Success',JSON.stringify(headers));

                                                                                        } );
                                                                                        serviceCall.error(function(headers, data) {
                                                                                           console.log('Error',JSON.stringify(headers));

                                                                                         });

                                                                                    }else {
                                                                                            console.log('Failure: '+ JSON.stringify(data));
                                                                                    }
                                                                                };
                                                                                 var getDeviceFootPrintHeaderErrorCallback = function(data) {
                                                                                        console.log('Something really bad happened');
                                                                                 };

                                                                                 globalVariablePlugin.getDeviceFootPrintHeader(
                                                                                      getDeviceFootPrintHeaderSuccessCallback,
                                                                                      getDeviceFootPrintHeaderErrorCallback
                                                                                   );
                                                                            }
                                                                            else{
                                                                                    console.log('globalVariablePlugin is '+globalVariablePlugin);
                                                                                }


                                               }else {
                                                     console.log('Failure: '+ JSON.stringify(data));
                                               }
                                            };
                                            var getFCMNotificationTokenErrorCallback = function(data) {
                                                  console.log('Something really bad happened');
                                            };

                                             globalVariablePlugin.getFCMNotificationToken(
                                                              getFCMNotificationTokenSuccessCallback,
                                                              getFCMNotificationTokenErrorCallback
                                             );
                                      }
                                      else{
                                                            console.log('globalVariablePlugin is '+globalVariablePlugin);
                                      }


                             };

		$scope.showDvcBlckListMsg = false;

		$scope.skip = function() {
		    console.log('Skip Function called');
            var globalVariablePlugin = cxp.mobile.plugins['GlobalVariables'];
            globalVariablePlugin.setMarketingFlag('true');
            $scope.getMpinSetup();
		};

         $scope.getMpinSetup=function(){
              var globalVariablePlugin =  cxp.mobile.plugins['GlobalVariables'];
              if (globalVariablePlugin) {
                   var mpinSuccessCallback = function(data) {
						console.log("data:",data);
                        mpinFlag=data['mpinFlag'];
                        if(mpinFlag=='' || mpinFlag==null ||mpinFlag!="true" ){
                            gadgets.pubsub.publish('getBackToLoginScreen');
                        }else if(mpinFlag=="true"){
                            gadgets.pubsub.publish('launchpad-mpinlogin');
                        }
                   };
                   var mpinErrorCallback = function(data) {
                       console.log('Error happened while communicating between native and hybrid');
                   };

                   globalVariablePlugin.getMpinFlag(
                       mpinSuccessCallback,
                       mpinErrorCallback
                   );
              } else {
                   console.log('Cant find Plugin');
              }
         }





		$scope.hideVersionDescSection = function() {
			$scope.showVersionDescription = false;
		};
		
		
		$scope.closeApp = function(){
              var globalVariablePlugin1Reset = cxp.mobile.plugins['GlobalVariables'];
                   if(globalVariablePlugin1Reset){
                      globalVariablePlugin1Reset.resetDevice(null,null,'true');
                   }
                   else{
                        console.log('Fatal Error: Global Variable plugin not registered');
              }
		};
		
		
		
		$scope.randomSlide=function(slideArray){
			var m = slideArray.length, t, i;
	        // While there remain elements to shuffle
	        while (m) {
	            // Pick a remaining element…
	            i = Math.floor(Math.random() * m--);
	            // And swap it with the current element.
	            t = slideArray[m];
	            slideArray[m] = slideArray[i];
	            slideArray[i] = t;
	        }
	        
	        return slideArray;
		};

        $scope.createSlider=function(){
	
		}
		
		
		$scope.getSlide=function(target, style) {

			var i = target.length;
			var path = lpCoreUtils.getWidgetBaseUrl(lpWidget);
			console.log('getSlide'+i);
			var jsonImagePath = {
				id: (i + 1),
				title:  $scope.getImageDetails(style + ((i + 1) % 5),'title'),
				label: $scope.getImageDetails(style + ((i + 1) % 5),'label'),
			 	img: path + '/media/' + style + ((i + 1) % 5)+'.png',//+'.jpg' ,
			};
			
			
			console.log(' getSlide calll jsonImagePath *************** ' + JSON.stringify(jsonImagePath));
			
			return jsonImagePath;
        }
		
		$scope.model = {};
		$scope.jsonSlideData = [];
		
//		$scope.jsonSlideData = {
//				"slider": [{
//					"id": "slider1",
//					"title": "Safe2Spend",
//					"label": "Safe2Spend gives you complete control over your account by letting you set limits for all transactions"
//				}, {
//					"id": "slider4",
//					"title": "Notifications",
//					"label": "Rich notifications on various offers"
//				}
//				, {
//					"id": "slider2",
//					"title": "Multiple Devices",
//					"label": "You can also use the same MPIN across multiple devices"
//				}
//				, {
//					"id": "slider3",
//					"title": "Touch ID",
//					"label": "You can also use your device Touch ID to login"
//				}
//
//			]
//		};


$scope.jsonSlideData = {
				"slider": [{
					"id": "slider1",
					"title": "Bill Payments",
					"label": "Bill Payments made easy! Set your bills to auto pay and forget late payment charges !"
				}, {
					"id": "slider2",
					"title": "Fund Transfer",
					"label": "Transfer funds anytime, anywhere for free !"
				}
				, {
					"id": "slider3",
					"title": "Loans",
					"label": "Access all information on your current loan in one place !"
				}
				, {
					"id": "slider4",
					"title": "Recharge",
					"label": "Recharge your Mobile / DTH connection Instantly"
				}

			]
		};



		
		
		var jsonValue = '';		
		$scope.getImageDetails =function(slideNum, key1) {
		
			var data = $scope.jsonSlideData;	
			
			
			  for (var event in data) {
			  
					var dataCopy = data[event];
					for (data in dataCopy) {
						var mainData = dataCopy[data];
						for (var key in mainData) {
							if (key.match(/id/)) {
									if(mainData[key] === slideNum )
									{
											jsonValue = mainData[key1]
									}
							}
						}
					}
				};
				
				return jsonValue ;

		}
		
		
		$scope.$watch('carouselIndex', function(newIndex, oldIndex,scope){
	
			 var sliderName = 'slider' + (newIndex+1);
			
			console.log(' ****** newIndex ' + newIndex + " oldIndex "  + oldIndex   + " scope.carouselIndex " + scope.carouselIndex);
					
			$scope.currentSlideTitle =  scope.slides[scope.carouselIndex].title;
			$scope.currentSlideLabel = scope.slides[scope.carouselIndex].label;
			
			if( oldIndex > newIndex){
				console.log(' inside oldIndex > newIndex ');
				$scope.$broadcast('$switchToSlide',{data:{value:newIndex}});

			}
			
			
			if($scope.lastIdFromslides === JSON.stringify(scope.slides[scope.carouselIndex].id))
			{

				   $timeout(function(){
						 $scope.model.isLocked = true; 
						 $scope.animationStopped = true;
						 //$scope.getstarted = true;
						 $('#btnGet').show();
						 $('#skipSlide').hide();
				  },5);
			
			}else{

				$timeout(function(){
						$scope.model.isLocked = false; 
						if($scope.animationStopped){
							$scope.animationStopped  = false;
						}
						 $('#btnGet').hide();
						 $('#skipSlide').show();
				},5);
			}
		  });
		
		$scope.swipeRight = function(i){
			console.log('???? index == '+i);
			if($scope.model.isLocked == true){
				$scope.model.isLocked = false; 
				$scope.animationStopped = false;
				$scope.$broadcast('$switchToSlide',{data:{value:2}});
			}
		}
			
		
		$scope.addSlide=function(target, style) {
		
			var impageDtls = $scope.getSlide(target, style);
			target.push(impageDtls);
		};
		
		$scope.addSlides = function(target, style, qty) {
		
				for (var i=0; i < qty; i++) {			
				  $scope.addSlide(target, style);
			    }
				
				target = $scope.randomSlide(target);
				$scope.slideImages = target;			
				
			
			defered.resolve();
			//$scope.errorSpin = false;
			return defered.promise;
		}
		
		
		
		
		$scope.slides = [];
		
		$scope.slideImages = [];
		$scope.totalimg = $scope.slideImages.length;
		
		$scope.galleryNumber = 1;
		$scope.carouselIndex = 0;
		$scope.setOfImagesToShow = 3;

		
		$scope.getImage=function(target) {
		
			var i = target.length
				, p = (($scope.galleryNumber-1) * $scope.setOfImagesToShow)+i;				
			
			$scope.slideImages[p];
			defered.resolve();
							
			return defered.promise;
			
		}
		
		
		
		
	   $scope.addImages=function(target, qty) {
							
			for (var i=0; i < qty; i++) {
				$scope.addImage(target);
			}
			
			defered.resolve();
							
			return defered.promise;
		}
		
		$scope.addImage=function(target) {
			
			target.push($scope.getImage(target));
			defered.resolve();
			return defered.promise;
		}
		
		
		

		//$scope.checkGlobalVariable();
		$scope.startMarketting();
		$scope.notificationSend();
		
	  $timeout(function(){
                gadgets.pubsub.publish('cxp.item.loaded', {
                    id: widget.id
                });
            }, 10);
	
	}

    /**
     * Export Controllers
     */
    exports.MktgController = MktgController;
	
    
});
