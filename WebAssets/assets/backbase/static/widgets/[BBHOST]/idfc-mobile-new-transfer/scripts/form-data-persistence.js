define(function(require, exports, module) {

    'use strict';

    var base = require('base');

    // @ngInject
    exports.formDataPersistence = function() {

        function hasStorage() {
            var uid = new Date().getTime().toString();
            var storage;
            var result;
            try {
                (storage = window.localStorage).setItem(uid, uid);
                result = storage.getItem(uid) === uid;
                storage.removeItem(uid);
                return result && storage;
            } catch (err) {
                base.log.warn(err);
            }
        }


        /**
         * Creates a new FormDataPersistenceController instance
         * @constructor
         */
        var FormDataPersistenceController = function() {
        };

        /**
         * Save the form data in session storage with the form name as the key
         * @param formName a string value of the form/widget name
         * @param a JS object representing the values of the form
         */
        FormDataPersistenceController.prototype.saveFormData = function(formName, formObject) {
            if (hasStorage()) {
		var stringifiedFormObject = JSON.stringify(formObject);
		window.sessionStorage.setItem(formName, stringifiedFormObject);
            }
        };

        /**
         * Removes saved data from session storage by form name
         * @param formName the name of the widget form to remove
         */
        FormDataPersistenceController.prototype.removeFormData = function(formName) {
            if (hasStorage()) {
                window.sessionStorage.removeItem(formName);
            }
        };

        /**
         * Return the stored string of the form object
         * @param widget form name
         */
        FormDataPersistenceController.prototype.getFormData = function(formName) {

            try {
                var widgetForm = JSON.parse(window.sessionStorage.getItem(formName));
            } catch (err) {
                base.log.warn('Can\'t parse form\'s stored storage data.');
            }

            var formatObject = function(thisObject) {
                for (var key in thisObject) {
                    if (thisObject.hasOwnProperty(key)) {
                        if (key.toLowerCase().indexOf('date') > -1 && typeof thisObject[key] !== 'boolean') {
                            var testDate = new Date(thisObject[key]);
                            //TODO: investigate better approach
                            if (!isNaN(testDate.getTime())) {
                                //a valid date
                                thisObject[key] = testDate;
                            }
                        }

                        if (thisObject[key] instanceof Object) {
                            formatObject(thisObject[key]);
                        }
                    }
                }

                return thisObject;
            };

            formatObject(widgetForm);

            return widgetForm;
        };

        /**
         * Returns a flag if the form is currently saved
         * @formName the name of the widget form to check
         */
        FormDataPersistenceController.prototype.isFormSaved = function(formName) {
            var saved = window.sessionStorage.getItem(formName);
            return saved === null ? false : true;
        };

        return {
            getInstance: function() {
                return new FormDataPersistenceController();
            }
        };
    };
});
