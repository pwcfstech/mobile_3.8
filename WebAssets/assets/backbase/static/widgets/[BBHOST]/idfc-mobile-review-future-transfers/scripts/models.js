/**
* Models
* @module Models
*/
define(function (require, exports, module) {

  'use strict';

  // @ngInject
  exports.lpAlerts = function($timeout) {
    var ALERT_TIMEOUT = 5000;
    var alerts = [];

    this.list = function() {
      return alerts;
    };

    this.close = function() {
      alerts = [];
    };

    this.push = function(message, type, timeout) {
      this.close();
      var self = this;
      alerts.push({
        type: type || 'danger',
        msg: message
      });
      if (timeout) {
        $timeout(function() { self.close(); }, ALERT_TIMEOUT);
      }
    };
  };

});
