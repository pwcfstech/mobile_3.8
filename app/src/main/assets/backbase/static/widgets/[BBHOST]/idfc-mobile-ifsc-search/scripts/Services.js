/**
* Models
* @module models
*/
define(function (require, exports) {

    'use strict';   
    var $ = require('jquery'); console.log($);
    var angular = require('base').ng;

    //@ngInject
    function ifscCodeSearchService($http, $q) {
        var config = {};
        var items = [];
        var total_record = 0;	
		
        return {
            setup: function (localConfig) {
                config = angular.extend(config, localConfig);
                return this;
            },					
			loadData : function(data, callBckfn){ 
					/*return $http.get('http://localhost/service/service.php?offset='+offset+'&limit='+limit).success(function(data){
						data = JSON.parse(data);
						console.log(data.list);
						angular.forEach(data.list, function(v, k){ //alert(k);
							items.push(v);
						});
						total_record = data.count; //alert(total_record);
					}).error(function(){
						
					});	*/
				    console.log(data);
					//var data = JSON.parse(data);
					//console.log(data.list);
					angular.forEach(data.data.searchResult, function(v, k){ //alert(k);
						items.push(v);
					});
					
					if(total_record == 0)
					 total_record = data.data.count; //alert(total_record);	
				 
                     callBckfn();					
			},
			getList: function () { 
			    var postData = $.param(config.data || {});
				console.log('>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<', postData);
				return $http({
					method: 'POST',
					url: config.branchListUrl,
                    data : postData,  					
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/x-www-form-urlencoded;'
					}
					})
			},	
            getIFSCData : function(){
				var postData = $.param(config.data || {});
				return $http({
					method: 'POST',
					url: config.getIFSCBValidUrl,		
                    data: postData, 						
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/x-www-form-urlencoded;'
					}
					})				
			},			
			getTotalRecord : function(){
				return total_record;
			},	
			get: function(offset, limit) {
			  return items.slice(offset, offset+limit);
			},
			total: function() {
			  return items.length;
			},
			getBankData: function(index) { 
              return items[index];
			},			
			clrItems: function() {
			  total_record = 0;	
			  items = [];
			  items.length = 0;
			}			
			
	      };
    }
    exports.ifscCodeSearchService = ifscCodeSearchService;

});
