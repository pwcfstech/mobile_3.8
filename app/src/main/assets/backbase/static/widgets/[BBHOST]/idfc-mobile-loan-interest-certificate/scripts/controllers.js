

/**
 * Controllers
 * @module controllers
 */
define(function(require, exports) {

	'use strict';
	var constIDFC = require('idfccommon').idfcConstants;

	var fileSaver = require('fileSaver');
	//Constant Declaration 
	var idfcConstants = require('idfccommon').idfcConstants;
	var idfcHanlder = require('idfcerror');
	var loanAccount = '';

	/**
	 * Main controller
	 * @ngInject
	 * @constructor
	 */
	function LoanCertificateController($scope, $rootElement, lpWidget, lpCoreUtils, lpCoreError, $http,
			lpUIResponsive, lpCoreI18n, lpCoreBus, lpPortal) {
		this.utils = lpCoreUtils;
		this.error = lpCoreError;
		this.widget = lpWidget;

		$scope.submitDivBtn = true;

		//Widget Refresh
		var deckPanelOpenHandler;
		deckPanelOpenHandler = function(activePanelName) {
			if (activePanelName == lpWidget.parentNode.model.name) {
				lpCoreBus.flush('DeckPanelOpen');
				lpCoreBus.unsubscribe('DeckPanelOpen', deckPanelOpenHandler);
				lpWidget.refreshHTML(function(bresView) {
					lpWidget.parentNode = bresView.parentNode;
				});
			}
		};
		lpCoreBus.subscribe('DeckPanelOpen', deckPanelOpenHandler);


		$scope.initialize = function() {
			$scope.openLoanDetails = [];
			$scope.loanAccountNumbers = [];
			$scope.loanAccountNumbersDropdwn = [];
			$scope.LoanDetails = [];
			$scope.inputCheck = 'true';
			$scope.errorSpin = true;
			//$scope.showSelect = true;
			$scope.NewloanDeatil = {
					acctNb: ''
			};

			if(localStorage.getItem("origin")=="home-summary"){
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_BACK"
                });
             }

			$scope.NewloanYear = {
            					loanYear: ''
            			};
			//$scope.loanYear='';

			//Calculating current/previous financial year 
			var currentDate = new Date();
			if (currentDate.getMonth() > 2) {
				$scope.currentYear = (currentDate.getFullYear()) + '-' + (currentDate.getFullYear() + 1);
				$scope.previousYear = (currentDate.getFullYear()-1) + '-' + (currentDate.getFullYear());

			} else {
				$scope.currentYear = (currentDate.getFullYear()-1) + '-' + (currentDate.getFullYear());
				$scope.previousYear = (currentDate.getFullYear() - 2) + '-' + (currentDate.getFullYear()-1);

			}
            $scope.year = [$scope.currentYear, $scope.previousYear];
			$scope.getLoanAccList();
			$scope.NewloanDeatil = {
					acctNb: ''
			};

            loanAccount = localStorage.getItem('lnAccountNo');
            console.log('Local Storage Certificate'+loanAccount);
            if(!angular.isUndefined(loanAccount) && loanAccount!=''){
                $scope.NewloanDeatil = {
                							acctNb: loanAccount + ''
                					};
                     localStorage.setItem('lnAccountNo' , '');


            }else{
            $scope.NewloanDeatil = {
            							acctNb: ''
            					};

            }

            //alert("NewloanDeatil.acctNb: "+$scope.NewloanDeatil.acctNb);
			//Widget Pub Sub
			/*lpCoreBus.subscribe('launchpad-retail.loanCertificate', function(data) {
				if (undefined == data) {
					$scope.NewloanDeatil = {
							acctNb: ''
					};
				} else {
					$scope.NewloanDeatil = {
							acctNb: data + ''
					};
				}
			});*/
			//added for mobile
			/*gadgets.pubsub.subscribe('loanCertificate', function(evt) {
			    console.log('Recieve Gadget'+evt)
                if (undefined == evt.data) {
                    $scope.NewloanDeatil = {
                            acctNb: ''
                    };
                } else {
                    $scope.NewloanDeatil = {
                            acctNb: evt.data + ''
                    };
                }
            });*/


		};


		//Loan Account List
		$scope.getLoanAccList = function() {
			
			var loanAccountListUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
				.getPreference('getLoanAccountList'), {
				servicesPath: lpPortal.root
			});
			
			$http({
			method: 'GET',
			url: loanAccountListUrl,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded;'
			}
			}).success(function(data) {
				$scope.loanAccountNumbers = data;
				lpCoreUtils.forEach(data, function(list) {
					 
					 $scope.loanAccountNumbersDropdwn.push(list.acctNb) ;
					 
					});
				//$scope.loanAccountNumbers = data;
				if($scope.loanAccountNumbersDropdwn.length == 1){
					//$scope.showSelect = false;
					$scope.NewloanDeatil.acctNb = $scope.loanAccountNumbersDropdwn[0];
				
				}
				
//				console.log('$scope.loanAccountNumbers.prdCd---->'+$scope.loanAccountNumbers.prdCd+'<-------$scope.loanAccountNumbers.prdCd');
				$scope.errorSpin = false;
			}).error(function(data) {
				$scope.errorSpin = false;
			
				if(data.cd == '511'){
					$scope.error = {
							happened : true,
							msg : constIDFC.ERROR_NO_LOANS
						};

				}else{
					$scope.error = {
							happened : true,
							msg : data.rsn
						};
				}
		});
		}
			
		//Drop down Change Event
		$scope.accountNumberChange = function() {
		//alert("changed acc number: "+$scope.NewloanDeatil.acctNb);
			$scope.currentFinYearDiv = false;
			$scope.previousFinYearDiv = false;
			$scope.button = false;
			$scope.NewloanYear.loanYear = '';
			$scope.error = {
					happened: false,
					msg: ''
			};
			$scope.successMessagePDFEmail = '';
			//showing submit button
			$scope.submitDivBtn = true;
		};
		
		$scope.yearChange = function() {
		//alert("changed year: "+$scope.NewloanYear.loanYear);
			$scope.currentFinYearDiv = false;
			$scope.previousFinYearDiv = false;
			$scope.button = false;
			$scope.error = {
					happened: false,
					msg: ''
			};
			$scope.successMessagePDFEmail = '';
			//showing submit button
			$scope.submitDivBtn = true;

		};

		//$scope.year = [$scope.currentYear, $scope.previousYear];

		//Submit Button Validation
		$scope.submitDiv = function() {
           // alert("$scope.NewloanDeatil.acctNb: "+$scope.NewloanDeatil.acctNb);
			$scope.previousFinYearDiv = false;
			$scope.button = false;
			$scope.currentFinYearDiv = false;
			$scope.note=true;
			$scope.error = {
					happened: false,
					msg: ''
			};
			for(var count=0; count<$scope.loanAccountNumbers.length; count++) {
				if($scope.loanAccountNumbers[count].acctNb===$scope.NewloanDeatil.acctNb) {
					$scope.prdCd = $scope.loanAccountNumbers[count].prdCd;
				}
			}

			//Checking loan account number if null
			if ($scope.NewloanDeatil.acctNb === '' || undefined === $scope.NewloanDeatil.acctNb || $scope.NewloanDeatil.acctNb === "null") {
				$scope.error = {
						happened: true,
						msg: idfcConstants.ERROR_ACC_MSG
				};
			}

			//Checking loan account year if null
			else if ($scope.NewloanYear.loanYear === '' || undefined === $scope.NewloanYear.loanYear) {

				$scope.error = {
						happened: true,
						msg: idfcConstants.ERROR_FIN_MSG
				};
			} 
			else if(($scope.prdCd === 'HOME_TOP' || $scope.prdCd === 'MONEY_TOP') && $scope.NewloanYear.loanYear.trim() === $scope.currentYear)
			{
				
				$scope.currentFinYearDiv = false;
				$scope.previousFinYearDiv = false;
				$scope.button = false;
				$scope.error = {
						happened : true,
						msg : 'Sorry, you have no interest certificate for the year selected. Please select a different year'
				};
			} else {

				//Details on the basis of account no and financial year 
				var getloanInterestCertificate = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getloanInterestCert'));

				var newloanYear = $scope.NewloanYear.loanYear.trim().substring(0, 4);
				var postData = {
						'acctNb': $scope.NewloanDeatil.acctNb,
						'year': newloanYear
				};
				postData = $.param(postData || {});
				$scope.errorSpin = true;
				$http({
					method: 'POST',
					url: getloanInterestCertificate,
					data: postData,
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/x-www-form-urlencoded;'
					}

				}).success(function(data, status, headers, config) {
					$scope.errorSpin = false;
					$scope.LoanDetails = data;

					if($scope.LoanDetails!==undefined || $scope.LoanDetails!==null || $.trim($scope.LoanDetails)!='') {
						if($scope.LoanDetails.prncplAmt===null || $.trim($scope.LoanDetails.prncplAmt)==='') {
							$scope.LoanDetails.prncplAmt = 0;
						}
						if($scope.LoanDetails.intrstAmt===null || $.trim($scope.LoanDetails.intrstAmt)==='') {
							$scope.LoanDetails.intrstAmt = 0;
						}
						if($scope.LoanDetails.provIntrstAmt===null || $.trim($scope.LoanDetails.provIntrstAmt)==='') {
							$scope.LoanDetails.provIntrstAmt = 0;
						}
						if($scope.LoanDetails.provPrncplAmt===null || $.trim($scope.LoanDetails.provPrncplAmt)==='') {
							$scope.LoanDetails.provPrncplAmt = 0;
						}
					}

					if ($scope.currentYear === $scope.NewloanYear.loanYear.trim()) {

						$scope.startDate = idfcConstants.START_DATE + $scope.NewloanYear.loanYear.trim().substring(0, 4),
						$scope.endDate = idfcConstants.END_DATE + $scope.NewloanYear.loanYear.trim().substring(5, 9),
						$scope.CurrentTrimYear = $scope.NewloanYear.loanYear.trim().substring(0, 4);

						$scope.previousFinYearDiv = false;
						$scope.currentFinYearDiv = true;
						$scope.button = true;
					}


					if ($scope.previousYear === $scope.NewloanYear.loanYear.trim()) {

						$scope.startDate = idfcConstants.START_DATE + $scope.NewloanYear.loanYear.trim().substring(0, 4),
						$scope.endDate = idfcConstants.END_DATE + $scope.NewloanYear.loanYear.trim().substring(5, 9),
						$scope.PreviousTrimYear = $scope.NewloanYear.loanYear.trim().substring(0, 4);

						$scope.currentFinYearDiv = false;
						$scope.previousFinYearDiv = true;
						$scope.button = true;
					}


					if ($scope.NewloanYear.loanYear.trim() !== $scope.previousYear && $scope.NewloanYear.loanYear.trim() !== $scope.currentYear || $scope.NewloanDeatil.acctNb === '' || undefined === $scope.NewloanDeatil.acctNb) {
						$scope.currentFinYearDiv = false;
						$scope.previousFinYearDiv = false;
						$scope.button = false;
					}

                    //hiding the submit button
                    $scope.submitDivBtn = false;
				}).error(function(data, status, headers, config) {
					$scope.errorSpin = false;
					
					$scope.error = {
							happened : true,
							msg : data.rsn
					};


				});
			}
            localStorage.setItem('lnAccountNo' , '');//Clearing LocalStorage
		};


		//PDF Generation  
		$scope.PDFGeneration = function() {

			for(var count=0; count<$scope.loanAccountNumbers.length; count++) {
				if($scope.loanAccountNumbers[count].acctNb===$scope.NewloanDeatil.acctNb) {
					$scope.prdCd = $scope.loanAccountNumbers[count].prdCd;
				}
			}
			//var postData = $scope.LoanDetails;
			//console.log("postData" + postData);
			if(($scope.prdCd === 'BASIC_H' || $scope.prdCd === 'YOUTHHOME' || $scope.prdCd === 'MON_SAVER') && $scope.NewloanYear.loanYear.trim() === $scope.currentYear)
			{
				$scope.LoanDetails.table = 'Prov_Stmt';
			}
			else if(($scope.prdCd === 'BASIC_H' || $scope.prdCd === 'YOUTHHOME' || $scope.prdCd === 'MON_SAVER') && $scope.NewloanYear.loanYear.trim() === $scope.previousYear)
			{
				$scope.LoanDetails.table = 'Actual_Stmt';
			}
			else if(($scope.prdCd === 'HOME_TOP' || $scope.prdCd === 'MONEY_TOP') && $scope.NewloanYear.loanYear.trim() === $scope.previousYear)
			{
				$scope.LoanDetails.table = 'Topup_Stmt';
			}
			else{
				$scope.LoanDetails.table = '';
			}

			var postData = {
					'brwrNm':$scope.LoanDetails.brwrNm,
					'date':$scope.LoanDetails.date,
					'refNb':$scope.LoanDetails.refNb,
					'disbAmt':$scope.LoanDetails.disbAmt,
					'roi':$scope.LoanDetails.roi,
					'prd':$scope.LoanDetails.prd,
					'cusNm':$scope.LoanDetails.cusNm,
					'finStYr':$scope.LoanDetails.finStYr,
					'finEndYr':$scope.LoanDetails.finEndYr,
					'lnAcctNb':$scope.LoanDetails.lnAcctNb,

					'ttlPdAmt':$scope.LoanDetails.ttlPdAmt,
					'provIntrstAmt':$scope.LoanDetails.provIntrstAmt,
					'provPrncplAmt':$scope.LoanDetails.provPrncplAmt,
					'usrId':$scope.LoanDetails.usrId,
					'orgCode':$scope.LoanDetails.orgCode,
					'adr1':$scope.LoanDetails.adr1,
					'adr2':$scope.LoanDetails.adr2,
					'city':$scope.LoanDetails.city,
					'state':$scope.LoanDetails.state,
					'pncd':$scope.LoanDetails.pncd,

					'phn':$scope.LoanDetails.phn,
					'strtYr':$scope.LoanDetails. strtYr,
					'endYr':$scope.LoanDetails.endYr,
					'futrPrncpl':$scope.LoanDetails.futrPrncpl,
					'nxtInstlmt':$scope.LoanDetails.nxtInstlmt,
					'nxtInstlmtDt':$scope.LoanDetails.nxtInstlmtDt,
					'outstgPrncpl':$scope.LoanDetails.outstgPrncpl,
					'lstEmiIntrstDt':$scope.LoanDetails.lstEmiIntrstDt,
					'lstEmiPrncplDt':$scope.LoanDetails.lstEmiPrncplDt,
					'fstEmiPrncplDt':$scope.LoanDetails.fstEmiPrncplDt,

					'fstEmiIntrstDt':$scope.LoanDetails.fstEmiIntrstDt,
					'prncplAmt':$scope.LoanDetails.prncplAmt,
					'intrstAmt':$scope.LoanDetails.intrstAmt,
					'astAdd':$scope.LoanDetails.astAdd,
					'coAplntNm':$scope.LoanDetails.coAplntNm,

					'currentYearSelected':$scope.NewloanYear.loanYear.trim(),
					'table' : $scope.LoanDetails.table,
					'emailType' : 'false'//TODO: give varible name
					//Needs to be removed
					//'emailId' : 'abc@abc.com',



			};

			if($scope.LoanDetails.table !== ''){



				var pdfUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('LoanInterestpdfSrc'));
				// pdfUrl = pdfUrl + '?&email=' + false;

				postData = $.param(postData || {});
				$http({
					method: "POST",
					url: pdfUrl,
					data: postData,
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/x-www-form-urlencoded;'
					},
					responseType: 'arraybuffer'

				}).success(function(response, status, headers, config) {
					try {
						var file = new Blob([response], {
							type: 'application/pdf'
						});
						var filename = 'Interest Certificate for ' + $scope.NewloanDeatil.acctNb;
						fileSaver.saveAs(file,filename);
					} catch (e) {
						alert(e.stack);
					}

					// saveAs(file, "LoanInterest_Pdf"); 

				}).error(function(response) {
					$scope.error = {
							happened: true,
							msg: idfcConstants.ERROR_PDF
					};
				});

			}
			else{

				$scope.error = {
						happened: true,
						msg: 'Sorry, you have no interest certificate for the year selected. Please select a different year.'
				};
			}

		};

		//Email Advice
		$scope.Emailadvice = function() {
            $scope.errorSpin=true;
			for(var count=0; count<$scope.loanAccountNumbers.length; count++) {
				if($scope.loanAccountNumbers[count].acctNb===$scope.NewloanDeatil.acctNb) {
					$scope.prdCd = $scope.loanAccountNumbers[count].prdCd;
				}
			}

			//var postData = $scope.LoanDetails;
			//console.log("postData" + postData);
			if(($scope.prdCd === 'BASIC_H' || $scope.prdCd === 'YOUTHHOME' || $scope.prdCd === 'MON_SAVER') && $scope.NewloanYear.loanYear.trim() === $scope.currentYear)
			{
				$scope.LoanDetails.table = 'Prov_Stmt';
			}
			else if(($scope.prdCd === 'BASIC_H' || $scope.prdCd === 'YOUTHHOME' || $scope.prdCd === 'MON_SAVER') && $scope.NewloanYear.loanYear.trim() === $scope.previousYear)
			{
				$scope.LoanDetails.table = 'Actual_Stmt';
			}
			else if(($scope.prdCd === 'HOME_TOP' || $scope.prdCd === 'MONEY_TOP') && $scope.NewloanYear.loanYear.trim() === $scope.previousYear)
			{
				$scope.LoanDetails.table = 'Topup_Stmt';
			}
			else{
				$scope.LoanDetails.table = '';
			}

			var postData = {
					'brwrNm':$scope.LoanDetails.brwrNm,
					'date':$scope.LoanDetails.date,
					'refNb':$scope.LoanDetails.refNb,
					'disbAmt':$scope.LoanDetails.disbAmt,
					'roi':$scope.LoanDetails.roi,
					'prd':$scope.LoanDetails.prd,
					'cusNm':$scope.LoanDetails.cusNm,
					'finStYr':$scope.LoanDetails.finStYr,
					'finEndYr':$scope.LoanDetails.finEndYr,
					'lnAcctNb':$scope.LoanDetails.lnAcctNb,

					'ttlPdAmt':$scope.LoanDetails.ttlPdAmt,
					'provIntrstAmt':$scope.LoanDetails.provIntrstAmt,
					'provPrncplAmt':$scope.LoanDetails.provPrncplAmt,
					'usrId':$scope.LoanDetails.usrId,
					'orgCode':$scope.LoanDetails.orgCode,
					'adr1':$scope.LoanDetails.adr1,
					'adr2':$scope.LoanDetails.adr2,
					'city':$scope.LoanDetails.city,
					'state':$scope.LoanDetails.state,
					'pncd':$scope.LoanDetails.pncd,

					'phn':$scope.LoanDetails.phn,
					'strtYr':$scope.LoanDetails. strtYr,
					'endYr':$scope.LoanDetails.endYr,
					'futrPrncpl':$scope.LoanDetails.futrPrncpl,
					'nxtInstlmt':$scope.LoanDetails.nxtInstlmt,
					'nxtInstlmtDt':$scope.LoanDetails.nxtInstlmtDt,
					'outstgPrncpl':$scope.LoanDetails.outstgPrncpl,
					'lstEmiIntrstDt':$scope.LoanDetails.lstEmiIntrstDt,
					'lstEmiPrncplDt':$scope.LoanDetails.lstEmiPrncplDt,
					'fstEmiPrncplDt':$scope.LoanDetails.fstEmiPrncplDt,

					'fstEmiIntrstDt':$scope.LoanDetails.fstEmiIntrstDt,
					'prncplAmt':$scope.LoanDetails.prncplAmt,
					'intrstAmt':$scope.LoanDetails.intrstAmt,
					'astAdd':$scope.LoanDetails.astAdd,
					'coAplntNm':$scope.LoanDetails.coAplntNm,

					'currentYearSelected':$scope.NewloanYear.loanYear.trim(),
					'table' : $scope.LoanDetails.table,
					'emailType' : 'true',//TODO: give varible name
					//Needs to be removed
					//'emailId' : 'abc@abc.com',

			};

			if($scope.LoanDetails.table !== ''){
				var pdfUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('LoanInterestpdfSrc'));
				// pdfUrl = pdfUrl + '?&email=' + false;

				postData = $.param(postData || {});
				$http({
					method: "POST",
					url: pdfUrl,
					data: postData,
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/x-www-form-urlencoded;'
					},
					//responseType: 'arraybuffer'

				}).success(function(response, status, headers, config) {
				    $scope.emailSuccess=true;
					$scope.successMessagePDFEmail = 'Email has been sent successfully';
					console.log("issue 5407: "+$scope.successMessagePDFEmail);
					console.log("issue 5407: "+$scope.emailSuccess);
					$scope.errorSpin=false;
					//alert($scope.successMessagePDFEmail);

				}).error(function(response) {
				    $scope.emailSuccess=false;
				    $scope.errorSpin=false;
					console.log("issue 5407: error");
					if(response.cd == 'email01')
					{
						$scope.error = {
							happened: true,
							msg: 'Oops! Looks like you haven’t registered your email ID with us, please add your email ID in the My Profile section or call us on 1800-419-4332 so we can update it for you. We can only send the Advice to your registered ‎email ID.'

						};
						console.log("issue 5407:"+$scope.error.msg);
					}
					//$scope.successMessagePDFEmail = 'No Records found';
					else{
						$scope.error = {
							happened: true,
							msg: 'Sorry, we are unable to send your interest certificate for the year ' +$scope.NewloanYear.loanYear+'. Please try again in some time'

						};
						console.log("issue 5407:"+$scope.error.msg);
					}
				});
			}
			else{

				$scope.error = {
						happened: true,
						msg: 'Sorry, you have no interest certificate for the year selected. Please select a different year.'

				};
				console.log("issue 5407:"+$scope.error.msg);
			}

		};

         gadgets.pubsub.subscribe("native.back", function() {
               console.log("native.back handled in pl soa");
                      gadgets.pubsub.publish("launchpad-retail.openLoanSummary");
                      gadgets.pubsub.publish("js.back", {
                              data: "ENABLE_HOME"
                      });
           });

           gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
               console.log("device back GoBackInitiate handled in pl soa");
               if(localStorage.getItem("navigationFlag")) {
                   localStorage.clear();
                   gadgets.pubsub.publish("launchpad-retail.openLoanSummary");
                   gadgets.pubsub.publish("js.back", {
                           data: "ENABLE_HOME"
                   });
               }else {
                   gadgets.pubsub.publish("device.GoBack");
               }
           });

		$scope.initialize();
		  $timeout(function(){
                gadgets.pubsub.publish('cxp.item.loaded', {
                    id: widget.id
                });
            }, 10);
	}

	/**
	 * Export Controllers
	 */

	exports.LoanCertificateController = LoanCertificateController;
});