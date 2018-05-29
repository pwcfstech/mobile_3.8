/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : require-widget.js
 *  Description:
 *  ----------------------------------------------------------------
 */
(function(root, factory) {
    'use strict';
    if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.requireWidget = factory();
    }
}(this, function() {
    'use strict';

    function trim(str) {
        if (String.prototype.trim) {
            return str.trim();
        }
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        return str.replace(rtrim, '');
    }

    function isFunction(func) {
        return (typeof func === 'function');
    }
    function isObject(obj) {
        return (typeof obj === 'object' && !(obj instanceof Array));
    }
    function isAngularObject(obj) {
        return isObject(obj) && (typeof obj['_invokeQueue'] !== 'undefined');
    }

    // converts module path relative to it's index.html to path relative to portal's static dir
    function normalizePath(rootPath, staticPath, path) {
        try {
            path = trim(path);
            // remove .js from the module path if path is not absolute
            var isAbsolute = new RegExp('^((https?|file)://|/)', 'i');
            if (!isAbsolute.test(path)) {
                path = path.replace(/.js$/, '');
            }
            path = rootPath
                // remove slashes from the end of path
                .replace(/[^\/]*$/, '')
                // remove static dir from absolute path
                .replace(new RegExp('^' + staticPath), '') + path;
        } catch (err) {
            console.log('Error while normalizing module path.');
            throw err;
        }
        return path;
    }

    function addClass(el, className) {
        if (el.classList) {
            el.classList.add(className);
        } else {
            el.className += ' ' + className;
        }
    }
    function removeClass(el, className) {
        if (el.classList) {
            el.classList.remove(className);
        } else {
            el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    function addLoadingClass(widgetInstance) {
        var widgetLoadingClass = 'lp-widget-loading';
        var el = widgetInstance.body;

        widgetInstance.loading = function(className) {
            widgetLoadingClass = (className || widgetLoadingClass);
            addClass(el, widgetLoadingClass);
        };
        widgetInstance.loaded = function(doneClass) {
            removeClass(el, widgetLoadingClass);
            if (typeof doneClass === 'string') {
                addClass(el, doneClass);
            }
        };
    }

    var xsrf = (function () {
        var requestHeaderName = 'X-BBXSRF';
        var cookieName = 'BBXSRF';

        return {
            getToken: getToken,
            getRequestHeaderName: getRequestHeaderName,
            getCookieName: getCookieName,
            getFieldName: getCookieName
        };

        function getToken () {
            var value = '; ' + document.cookie,
                parts = '',
                cookie = getCookieName();

            parts = value.split('; ' + cookie + '=');
            if (parts.length == 2) {
                var token = parts.pop().split(';').shift();
                return token;
            }
            return undefined;
        }

        function getCookieName () {
            return cookieName;
        }

        function getRequestHeaderName () {
            return requestHeaderName;
        }
    }());

    window.launchpad = window.launchpad || {};
    window.launchpad.xsrf = xsrf;

    enableXsrfTokenPrefilter();

    return function(widgetInstance, modulePath) {
        var requirejs = window.requirejs;
        // works only if requirejs is available
        if (isFunction(requirejs)) {
            var myDef = widgetInstance.myDefinition;
            modulePath = normalizePath(
                myDef ? myDef.sUrl : '', // root(from /) path to the widget's index.html
                requirejs.s.contexts._.config.baseUrl, // path to the portals static dir
                modulePath
            );

            addLoadingClass(widgetInstance);

            requirejs([modulePath], function(widgetModule) {

                // when widget module exports function
                if (isFunction(widgetModule)) {

                    widgetModule.call(null, widgetInstance);

                // when widget module exports angular module
                } else if (isAngularObject(widgetModule)) {

                    requirejs(['angular', 'core'], function(ng) {
                        // @ngInject - preconfigure module core services
                        widgetModule.config(function(lpCoreWidgetProvider, lpCoreI18nProvider, lpCoreTemplateProvider){
                            lpCoreWidgetProvider.useWidgetInstance(widgetInstance);
                            lpCoreI18nProvider.useWidgetInstance(widgetInstance);
                            lpCoreTemplateProvider.useWidgetInstance(widgetInstance);
                        });

                        enableXsrfTokenInterceptor(widgetModule);
                        ng.bootstrap(widgetInstance.body || widgetInstance, [widgetModule.name]);
                    });

                // when widget module exports object
                } else if (isObject(widgetModule)) {

                    // Call if you find an init function
                    if (isFunction(widgetModule.run)) {
                        if (typeof widgetInstance === 'string') {
                            if (typeof window.jQuery !== 'undefined') {
                                widgetInstance = window.jQuery(widgetInstance);
                            } else {
                                widgetInstance = window.document.querySelectorAll(widgetInstance);
                            }
                        }
                        widgetModule.run.call(null, widgetInstance);
                    }
                }
            });
        }
    };

    /**
     * Configure the AngularJS $http service to add XSRF token to outgoing requests
     *
     * @param {Module} app - An angular module
     * @param {Function()<string>} xsrfToken - A nullary function that returns the xsrf token
     * @param {Object} xsrfOptions - An object containing the requestHeader key
     * @return void
     */
    function enableXsrfTokenInterceptor(app) {
        app.config(['$httpProvider', function ($httpProvider) {
            $httpProvider.interceptors.push(function () {
                return {
                    request: addXsrfHeader
                };
            });
        }]);

        /**
         * Add XSRF header to outgoing $http requests
         *
         * @param {object} xhrOptions - options object passed to $http call
         * @return {object|promise<object>}
         */
        function addXsrfHeader(xhrOptions) {
            if (xhrOptions.xsrf !== false && xhrOptions.method !== 'GET') {
                xhrOptions.headers[xsrf.getRequestHeaderName()] = xsrf.getToken();
            }
            return xhrOptions;
        }
    }

    /**
     * Add a jQuery.ajax prefilter to automatically insert the XSRF token in outgoing requests
     *
     * @param {Function()<string>} xsrfToken - A nullary function that returns the xsrf token
     * @param {Object} xsrfOptions - Configuration containing requestHeader key
     * @return void
     */
    function enableXsrfTokenPrefilter() {
        if (!window.jQuery) { return; }

        window.jQuery.ajaxPrefilter(function(xhrOptions, original, xhr) {
            if (xhrOptions.xsrf === false || xhrOptions.type.toUpperCase() === 'GET') {
                return;
            }

            // set xsrf request header
            xhr.setRequestHeader(xsrf.getRequestHeaderName(), xhrOptions.xsrf || xsrf.getToken());
        });
    }
}));
