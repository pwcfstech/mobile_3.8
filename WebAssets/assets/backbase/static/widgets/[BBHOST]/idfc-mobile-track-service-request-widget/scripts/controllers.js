define(function(require, exports) {
    'use strict';
    var $ = require('jquery');
    var idfcConstants = require('idfccommon').idfcConstants;
    var idfcHanlder = require('idfcerror');

    function TrackServiceRequestController(lpWidget, lpCoreUtils,
        lpCoreError, $scope, $http, httpService, lpCoreI18n,
        lpCoreBus, $timeout) {
        this.utils = lpCoreUtils;
        this.error = lpCoreError;
        this.widget = lpWidget;
        var backEnable=false;
        $scope.lastOpenTaskId = '';
        $scope.lastOpenTaskId = '';
        $scope.convertToDate = function(stringDate) {
            var dateT = '';
            var dateS = '';
            var dateR = '';
            if (stringDate !== null && stringDate !== '') {
                dateT = stringDate.split(':');
                dateS = dateT[0].split('-');
                dateR = dateS[2] + '/' + dateS[1] + '/' + dateS[
                    0];
            }
            return dateR;
        };
        $scope.errorSpin = false;
        $scope.srStatus = [{
            'id': '1',
            'name': 'Open'
        }, {
            'id': '2',
            'name': 'Closed'
        }];
        gadgets.pubsub.subscribe("native.back", function(evt) {
            angular.forEach(document.getElementsByClassName(
                "tooltip"), function(e) {
                e.style.display = 'none';
            })
            $scope.doTheBack();
        });

        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
             if(localStorage.getItem("navigationFlag") || !backEnable) {
                 angular.forEach(document.getElementsByClassName(
                     "tooltip"), function(e) {
                     e.style.display = 'none';
                 })
                 $scope.doTheBack();

             }else {
                 gadgets.pubsub.publish("device.GoBack");
             }
         });
        var initialize = function() {
            //Session Management Call
        	idfcHanlder.validateSession($http);
            backEnable=true;
            $scope.errorSpin = true;
            $scope.getAllServiceRequests();
            $scope.success = {
                happened : false
            }
        };
        $scope.getAllServiceRequests = function() {
            backEnable=true;
            var self = this;
            self.getServiceLists = httpService.getInstance({
                endpoint: lpWidget.getPreference(
                    'SRListDataSrc')
            });
            var xhr = self.getServiceLists.read();
            xhr.success(function(data) {
                //alert("success##..."+data.cs);
                $scope.SRList = [];
                if (data && data !== 'null') {
                    for (var i = 0; i < data.cs.length; i++) {
                        if (data.cs[i].sts !== 'Closed') {
                            data.cs[i].sts = 'Open';
                        }
                    }
                    $scope.SRList = data.cs;
                }
                $scope.errorSpin = false;
            });
            xhr.error(function(data, status) {
                $scope.errorSpin = false;
                if (status == 0) {
                    gadgets.pubsub.publish(
                        "no.internet");
                } else {
                    $scope.error = {
                        happened: true,
                        msg: data.rsn
                    };
                }
            });
            return xhr;
        };
        $scope.back = function(status) {
            $scope.success.happened = false;
        };
        $scope.changeStatus = function(status) {
            $scope.serviceRequest.statusNew = status.name;
            $scope.submitForm = null;
        };
        $scope.getDetails = function(taskId) {
            backEnable=false;
            $scope.errorSpin = true;
            $scope.error = null;
            $scope.getServiceRequestDetail(taskId.id);
        };
        var serviceRequestNew = {};
        $scope.limitData = {
            userId: '1',
            limit: ''
        };
        $scope.serviceRequest = {
            srNo: '',
            status: '',
            statusNew: '',
            statusHidden: ''
        };
        $scope.$watch('serviceRequest.srNo', function(value) {
            if (value) {
                $scope.srError = false;
            } else {
                $('#SrList').show();
            }
        });
        $scope.fetchServiceRequest = function() {
           backEnable=true;
            $scope.error = {
                              happened: false,
                              msg: ''
            };

            if ($scope.serviceRequest.srNo === '') {
                if ($scope.serviceRequest.status.name ===
                    'Open' || $scope.serviceRequest.status.name ===
                    'New' || $scope.serviceRequest.status.name ===
                    'Closed') {
                    $scope.serviceRequest.statusHidden = null;
                    if ($scope.serviceRequest.statusNew !==
                        null) {
                        $scope.serviceRequest.statusHidden =
                            $scope.serviceRequest.statusNew;
                        $('#SrList').show();
                        $scope.SRData = null;
                        $scope.success = null;
                    } else {
                        $scope.error = {
                            happened: true,
                            msg: 'Please select the SR Status'
                        };
                    }
                } else {
                    $scope.srError = true;
                }
            } else {
                $('#SrList').hide();
                $scope.getServiceRequestDetail($scope.serviceRequest
                    .srNo);
                $scope.serviceRequest.statusNew = '';
                $scope.serviceRequest.status = '';
            }
        };
        $scope.getServiceRequestDetail = function(srNo) {
            $scope.lastOpenTaskId = srNo;
            serviceRequestNew.serviceNo = srNo;
            var self = this;
            $scope.errorSpin = true;
            self.TrackServiceRequest = httpService.getInstance({
                endpoint: lpWidget.getPreference(
                    'SRNoDataSrc')
            });
            var xhr = self.TrackServiceRequest.create({
                data: serviceRequestNew
            });
            xhr.success(function(data) {
                backEnable=false;
                $scope.SRData = [];
                if (data && data !== 'null') {
                    $scope.SRData = data.csRp;
                    gadgets.pubsub.publish("js.back", {
                        data: "ENABLE_BACK",
                        trSerID: srNo
                    });
                }
                $scope.success = {
                    happened: true,
                    id: srNo
                };
                $scope.errorSpin = false;
            });
            xhr.error(function(data, status) {
                //alert("in error...");
                 backEnable=true;
                $scope.errorSpin = false;
                if (status == 0) {
                    gadgets.pubsub.publish(
                        "no.internet");
                } else {
                    idfcHanlder.checkTimeout(data);
                    $scope.error = {
                        happened: true,
                        msg: data.rsn
                    };
                }
            });
        };
        $scope.doTheBack = function() {
            backEnable=true;
            $scope.srError= false;
            $scope.serviceRequest.srNo = '';
            $scope.serviceRequest.status = '';
            $scope.serviceRequest.statusNew = '';
            $scope.serviceRequest.statusHidden = '';
            $('#SrList').show();
            $scope.submitForm = null;
            $scope.SRData = null;
            $scope.success.happened = false;
            $scope.error = null;
            gadgets.pubsub.publish("js.back", {
                 data: "ENABLE_HOME",
                 trSerID: "Track Service Requests"
             });
            $scope.$apply();
        };
        var deckPanelOpenHandler;
        deckPanelOpenHandler = function(activePanelName) {
            if (activePanelName == lpWidget.parentNode.model.name) {
                lpCoreBus.flush("DeckPanelOpen");
                lpCoreBus.unsubscribe("DeckPanelOpen",
                    deckPanelOpenHandler);
                lpWidget.refreshHTML(function(bresView) {
                    lpWidget.parentNode = bresView.parentNode;
                });
            }
        };
        lpCoreBus.subscribe("DeckPanelOpen", deckPanelOpenHandler);
        initialize();
          $timeout(function(){
                gadgets.pubsub.publish('cxp.item.loaded', {
                    id: widget.id
                });
            }, 10);
    }
    exports.TrackServiceRequestController =
        TrackServiceRequestController;
});