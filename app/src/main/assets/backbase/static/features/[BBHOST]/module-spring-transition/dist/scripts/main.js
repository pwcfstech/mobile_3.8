(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["module-spring-transition"] = factory();
	else
		root["module-spring-transition"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;// # OLD lp-anim module
	// # TO BE refactored
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function(require, exports, module) {
	    'use strict';

	    var Transitn = __webpack_require__(1);

	    module.exports = (function($, lp) {
	       return {
	            _restore: function($widget, $area, restoredPosition) {

	                var duration = '.3s';
	                var $title = $('.lp-springboard-tile-title', $widget);
	                var $icon = $('.lp-springboard-tile-icon', $widget);

	                $area.addClass('lp-animating');
	                $widget.addClass('lp-springboard-widget-live');

	                var boxTransition = new Transitn({
	                    element: $area[0],
	                    duration: duration,
	                    to: {
	                        left: restoredPosition.left,
	                        top: restoredPosition.top,
	                        width: restoredPosition.width,
	                        height: restoredPosition.height
	                    },
	                    timingFunction: 'ease-in-out'
	                });
	                boxTransition.on('transitionend', function() {

	                    $widget.removeClass('lp-springboard-widget-maximized');
	                    $area.removeClass('lp-springboard-area-maximized lp-animating')
	                        .css({
	                            zIndex: 1
	                        });
	                    if (restoredPosition.small) {
	                        $area.addClass('lp-springboard-smallcell');
	                    }

	                });
	                boxTransition.start();

	                var iconTransition = new Transitn({
	                    element: $icon[0],
	                    duration: duration,
	                    isCleaning: true,
	                    from: {
	                        fontSize: '70px',
	                        lineHeight: '70px'
	                    },
	                    timingFunction: 'ease-in-out'
	                });
	                iconTransition.start();

	                var titleTransition = new Transitn({
	                    element: $title[0],
	                    duration: duration,
	                    isCleaning: true,
	                    from: {
	                        fontSize: '15px',
	                        lineHeight: '1.42857'
	                    },
	                    timingFunction: 'ease-in-out'
	                });
	                titleTransition.start();

	            },

	            _maximize: function($widget, $area) {
	                var duration = '.4s';
	                var $title = $('.lp-springboard-tile-title', $widget);
	                var $icon = $('.lp-springboard-tile-icon', $widget);

	                $area.addClass('lp-animating').css({
	                    zIndex: 2
	                });

	                var boxTransition = new Transitn({
	                    element: $area[0],
	                    duration: duration,
	                    // isCleaning: true,
	                    to: {
	                        left: 0,
	                        top: 0,
	                        width: '100%',
	                        height: '100%'
	                    },
	                    timingFunction: 'ease-in-out'
	                });
	                boxTransition.on('transitionend', function() {
	                    $widget.addClass('lp-springboard-widget-maximized');
	                    $area.addClass('lp-springboard-area-maximized')
	                        .removeClass('lp-springboard-smallcell lp-animating')
	                        .css({
	                            zIndex: 2
	                        });
	                });
	                boxTransition.start();

	                var iconTransition = new Transitn({
	                    element: $icon[0],
	                    duration: duration,
	                    isCleaning: true,
	                    to: {
	                        fontSize: '200px',
	                        lineHeight: '200px'
	                    },
	                    timingFunction: 'ease-in-out'
	                });
	                iconTransition.start();

	                var titleTransition = new Transitn({
	                    element: $title[0],
	                    duration: duration,
	                    isCleaning: true,
	                    to: {
	                        fontSize: '36px',
	                        lineHeight: '36px'
	                    },
	                    timingFunction: 'ease-in-out'
	                });
	                titleTransition.start();

	            },
	            /**
	             * param = {
	             *      element : element,
	             *      duration: '.1s',
	             *      direction: 'left',
	             *      callback: function(){}
	             * }
	             */
	            _transition: function(param) {

	                var transParam = {
	                    element: param.element,
	                    duration: param.duration || '.3s',
	                    timingFunction: param.timing || 'ease-in-out',
	                    isCleaning: param.isCleaning || true,
	                    from: param.from || null,
	                    to: param.to || null
	                };

	                var transition = new Transitn(transParam);

	                transition.on('transitionend', function(trans, propertyName, event) {
	                    if (param.callback) {
	                        param.callback();
	                    }
	                });

	                transition.start();
	            }
	        };
	    })(window.jQuery, window.lp);
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*eslint-disable */
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function(require, exports, module) {

	    'use strict';

	    var getStyleProperty = __webpack_require__(2);
	    var EventEmitter = __webpack_require__(3);

	    // -------------------------- helpers -------------------------- //

	    // extend objects
	    function extend(a, b) {
	        for (var prop in b) {
	            if (prop) {
	                a[prop] = b[prop];
	            }
	        }
	        return a;
	    }

	    function isEmptyObj(obj) {
	        for (var prop in obj) {
	            if (prop) {
	                return false;
	            }
	        }
	        prop = null;
	        return true;
	    }

	    // http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
	    function dashCase(str) {
	        return str.replace(/([A-Z])/g, function($1) {
	            return '-' + $1.toLowerCase();
	        });
	    }

	    function camelCase(str) {
	        return str.replace(/(\-[a-z])/g, function($1) {
	            return $1.toUpperCase().replace('-', '');
	        });
	    }

	    // -------------------------- CSS3 support -------------------------- //

	    var transitionProperty = getStyleProperty('transition');

	    var transitionEndEvent = {
	        WebkitTransition: 'webkitTransitionEnd',
	        MozTransition: 'transitionend',
	        OTransition: 'otransitionend',
	        transition: 'transitionend'
	    }[transitionProperty];

	    // -------------------------- styleProperty -------------------------- //

	    var styleProperty = (function() {
	        // hashes of properties
	        var vendorProperties = {};
	        var standardProperties = {};

	        var styleProperty = {
	            // getVendor('transform') -> WebkitTransform
	            getVendor: function(prop) {
	                var vendorProp = vendorProperties[prop];
	                if (!vendorProp) {
	                    vendorProp = getStyleProperty(prop);
	                    // add to hashes
	                    vendorProperties[prop] = vendorProp;
	                    standardProperties[vendorProp] = prop;
	                }
	                return vendorProp;
	            },
	            // getStandard('WebkitTransform') -> transform
	            getStandard: function(prop) {
	                return standardProperties[prop] || prop;
	            }
	        };

	        return styleProperty;
	    })();


	    // -------------------------- Transitn -------------------------- //

	    function Transitn(properties) {
	        this.set(properties);
	    }

	    Transitn.prototype = new EventEmitter();
	    Transitn.prototype.constructor = Transitn;

	    // from
	    // to
	    // element
	    // duration
	    // timingFunction
	    // isCleaning
	    Transitn.prototype.set = function(props) {
	        extend(this, props);
	    };

	    // ----- css ----- //

	    Transitn.prototype.css = function(style) {
	        var elemStyle = this.element.style;

	        for (var prop in style) {
	            if (prop) {
	                // use vendor property if available
	                var vendorProp = styleProperty.getVendor(prop);
	                elemStyle[vendorProp] = style[prop];
	            }
	        }
	    };

	    Transitn.prototype._removeStyles = function(style) {
	        // clean up transition styles
	        var cleanStyle = {};
	        for (var prop in style) {
	            if (prop) {
	                cleanStyle[prop] = '';
	            }
	        }
	        this.css(cleanStyle);
	    };

	    var cleanTransitionStyle = {
	        transitionProperty: '',
	        transitionDuration: '',
	        transitionTimingFunction: '',
	        transitionDelay: ''
	    };

	    Transitn.prototype.removeTransitionStyles = function() {
	        // remove transition
	        this.css(cleanTransitionStyle);
	    };

	    // ----- transition ----- //

	    // non transition, just trigger callback
	    Transitn.prototype._nonTransition = function() {
	        this.css(this.to);
	        if (this.isCleaning) {
	            this._removeStyles(this.to);
	        }
	        for (var prop in this.to) {
	            if (prop) {
	                this.emitEvent('transitionend', [this, prop, event]);
	            }
	        }
	    };

	    /**
	     * proper transition
	     * @param {Object} args - arguments
	     *   @param {Object} to - style to transition to
	     *   @param {Object} from - style to start transition from
	     *   @param {Boolean} isCleaning - removes transition styles after transition
	     *   @param {Function} onTransitionEnd - callback
	     */
	    Transitn.prototype._transition = function() {
	        // redirect to nonTransition if no transition duration
	        if (!parseFloat(this.duration)) {
	            this._nonTransition();
	            return;
	        }

	        this.transitioningProperties = {};
	        this.clean = {};

	        for (var prop in this.to) {
	            if (prop) {
	                // keep track of transitioning properties
	                this.transitioningProperties[prop] = true;
	                // keep track of properties to clean up when transition is done
	                if (this.isCleaning) {
	                    this.clean[prop] = true;
	                }
	            }
	        }

	        // set from styles
	        if (this.from) {
	            this.css(this.from);
	            // force redraw. http://blog.alexmaccaw.com/css-transitions
	            var h = this.element.offsetHeight;
	            // hack for JSHint to hush about unused var
	            h = null;
	        }
	        // enable transition
	        this.enable();
	        // set styles that are transitioning
	        this.css(this.to);
	        // set flag
	        this.isTransitioning = true;
	    };

	    Transitn.prototype.start = Transitn.prototype[transitionProperty ? '_transition' : '_nonTransition'];

	    Transitn.prototype.enable = function() {
	        // only enable if not already transitioning
	        // bug in IE10 were re-setting transition style will prevent
	        // transitionend event from triggering
	        if (this.isTransitioning) {
	            return;
	        }

	        // make transition: foo, bar, baz from style object
	        var transitionProps = [];
	        for (var prop in this.to) {
	            if (prop) {
	                // dash-ify camelCased properties like WebkitTransition
	                prop = styleProperty.getVendor(prop);
	                transitionProps.push(dashCase(prop));
	            }
	        }
	        // enable transition styles
	        var transitionStyle = {
	            transitionProperty: transitionProps.join(','),
	            // TODO allow easy way to set default transitionDuration
	            transitionDuration: this.duration || '0.4s'
	        };
	        if (this.timingFunction) {
	            transitionStyle.transtionTimingFunction = this.timingFunction;
	        }
	        if (this.delay) {
	            transitionStyle.transitionDelay = this.delay;
	        }
	        // listen for transition end event
	        this.element.addEventListener(transitionEndEvent, this, false);

	        this.css(transitionStyle);
	    };


	    // ----- events ----- //

	    // trigger specified handler for event type
	    Transitn.prototype.handleEvent = function(event) {
	        var method = 'on' + event.type;
	        if (this[method]) {
	            this[method](event);
	        }
	    };

	    Transitn.prototype.onwebkitTransitionEnd = function(event) {
	        this.ontransitionend(event);
	    };

	    Transitn.prototype.onotransitionend = function(event) {
	        this.ontransitionend(event);
	    };

	    Transitn.prototype.ontransitionend = function(event) {
	        // disregard bubbled events from children
	        if (event.target !== this.element) {
	            return;
	        }

	        // get property name of transitioned property, convert to prefix-free
	        var propertyName = styleProperty.getStandard(camelCase(event.propertyName));

	        // remove property that has completed transitioning
	        delete this.transitioningProperties[propertyName];
	        // check if any properties are still transitioning
	        if (isEmptyObj(this.transitioningProperties)) {
	            // all properties have completed transitioning
	            this.disable();
	        }
	        // clean style
	        if (propertyName in this.clean) {
	            // clean up style
	            this.element.style[event.propertyName] = '';
	            delete this.clean[propertyName];
	        }

	        this.emitEvent('transitionend', [this, propertyName, event]);
	    };

	    Transitn.prototype.disable = function() {
	        this.removeTransitionStyles();
	        this.element.removeEventListener(transitionEndEvent, this, false);
	        this.isTransitioning = false;
	    };


	    module.exports = Transitn;

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*eslint-disable */
	/*!
	 * getStyleProperty v1.0.3
	 * original by kangax
	 * http://perfectionkills.com/feature-testing-css-properties/
	 */

	/*jshint browser: true, strict: true, undef: true */
	/*global define: false, exports: false, module: false */

	( function( window ) {

	'use strict';

	var prefixes = 'Webkit Moz ms Ms O'.split(' ');
	var docElemStyle = document.documentElement.style;

	function getStyleProperty( propName ) {
	  if ( !propName ) {
	    return;
	  }

	  // test standard property first
	  if ( typeof docElemStyle[ propName ] === 'string' ) {
	    return propName;
	  }

	  // capitalize
	  propName = propName.charAt(0).toUpperCase() + propName.slice(1);

	  // test vendor specific properties
	  var prefixed;
	  for ( var i=0, len = prefixes.length; i < len; i++ ) {
	    prefixed = prefixes[i] + propName;
	    if ( typeof docElemStyle[ prefixed ] === 'string' ) {
	      return prefixed;
	    }
	  }
	}

	// transport
	if ( true ) {
	  // AMD
	  !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
	    return getStyleProperty;
	  }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else if ( typeof exports === 'object' ) {
	  // CommonJS for Component
	  module.exports = getStyleProperty;
	} else {
	  // browser global
	  window.getStyleProperty = getStyleProperty;
	}

	})( window );


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*eslint-disable */
	/*!
	 * EventEmitter v4.2.7 - git.io/ee
	 * Oliver Caldwell
	 * MIT license
	 * @preserve
	 */

	(function () {
	    'use strict';

	    /**
	     * Class for managing events.
	     * Can be extended to provide event functionality in other classes.
	     *
	     * @class EventEmitter Manages event registering and emitting.
	     */
	    function EventEmitter() {}

	    // Shortcuts to improve speed and size
	    var proto = EventEmitter.prototype;
	    var exports = this;
	    var originalGlobalValue = exports.EventEmitter;

	    /**
	     * Finds the index of the listener for the event in it's storage array.
	     *
	     * @param {Function[]} listeners Array of listeners to search through.
	     * @param {Function} listener Method to look for.
	     * @return {Number} Index of the specified listener, -1 if not found
	     * @api private
	     */
	    function indexOfListener(listeners, listener) {
	        var i = listeners.length;
	        while (i--) {
	            if (listeners[i].listener === listener) {
	                return i;
	            }
	        }

	        return -1;
	    }

	    /**
	     * Alias a method while keeping the context correct, to allow for overwriting of target method.
	     *
	     * @param {String} name The name of the target method.
	     * @return {Function} The aliased method
	     * @api private
	     */
	    function alias(name) {
	        return function aliasClosure() {
	            return this[name].apply(this, arguments);
	        };
	    }

	    /**
	     * Returns the listener array for the specified event.
	     * Will initialise the event object and listener arrays if required.
	     * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
	     * Each property in the object response is an array of listener functions.
	     *
	     * @param {String|RegExp} evt Name of the event to return the listeners from.
	     * @return {Function[]|Object} All listener functions for the event.
	     */
	    proto.getListeners = function getListeners(evt) {
	        var events = this._getEvents();
	        var response;
	        var key;

	        // Return a concatenated array of all matching events if
	        // the selector is a regular expression.
	        if (evt instanceof RegExp) {
	            response = {};
	            for (key in events) {
	                if (events.hasOwnProperty(key) && evt.test(key)) {
	                    response[key] = events[key];
	                }
	            }
	        }
	        else {
	            response = events[evt] || (events[evt] = []);
	        }

	        return response;
	    };

	    /**
	     * Takes a list of listener objects and flattens it into a list of listener functions.
	     *
	     * @param {Object[]} listeners Raw listener objects.
	     * @return {Function[]} Just the listener functions.
	     */
	    proto.flattenListeners = function flattenListeners(listeners) {
	        var flatListeners = [];
	        var i;

	        for (i = 0; i < listeners.length; i += 1) {
	            flatListeners.push(listeners[i].listener);
	        }

	        return flatListeners;
	    };

	    /**
	     * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
	     *
	     * @param {String|RegExp} evt Name of the event to return the listeners from.
	     * @return {Object} All listener functions for an event in an object.
	     */
	    proto.getListenersAsObject = function getListenersAsObject(evt) {
	        var listeners = this.getListeners(evt);
	        var response;

	        if (listeners instanceof Array) {
	            response = {};
	            response[evt] = listeners;
	        }

	        return response || listeners;
	    };

	    /**
	     * Adds a listener function to the specified event.
	     * The listener will not be added if it is a duplicate.
	     * If the listener returns true then it will be removed after it is called.
	     * If you pass a regular expression as the event name then the listener will be added to all events that match it.
	     *
	     * @param {String|RegExp} evt Name of the event to attach the listener to.
	     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.addListener = function addListener(evt, listener) {
	        var listeners = this.getListenersAsObject(evt);
	        var listenerIsWrapped = typeof listener === 'object';
	        var key;

	        for (key in listeners) {
	            if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
	                listeners[key].push(listenerIsWrapped ? listener : {
	                    listener: listener,
	                    once: false
	                });
	            }
	        }

	        return this;
	    };

	    /**
	     * Alias of addListener
	     */
	    proto.on = alias('addListener');

	    /**
	     * Semi-alias of addListener. It will add a listener that will be
	     * automatically removed after it's first execution.
	     *
	     * @param {String|RegExp} evt Name of the event to attach the listener to.
	     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.addOnceListener = function addOnceListener(evt, listener) {
	        return this.addListener(evt, {
	            listener: listener,
	            once: true
	        });
	    };

	    /**
	     * Alias of addOnceListener.
	     */
	    proto.once = alias('addOnceListener');

	    /**
	     * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
	     * You need to tell it what event names should be matched by a regex.
	     *
	     * @param {String} evt Name of the event to create.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.defineEvent = function defineEvent(evt) {
	        this.getListeners(evt);
	        return this;
	    };

	    /**
	     * Uses defineEvent to define multiple events.
	     *
	     * @param {String[]} evts An array of event names to define.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.defineEvents = function defineEvents(evts) {
	        for (var i = 0; i < evts.length; i += 1) {
	            this.defineEvent(evts[i]);
	        }
	        return this;
	    };

	    /**
	     * Removes a listener function from the specified event.
	     * When passed a regular expression as the event name, it will remove the listener from all events that match it.
	     *
	     * @param {String|RegExp} evt Name of the event to remove the listener from.
	     * @param {Function} listener Method to remove from the event.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.removeListener = function removeListener(evt, listener) {
	        var listeners = this.getListenersAsObject(evt);
	        var index;
	        var key;

	        for (key in listeners) {
	            if (listeners.hasOwnProperty(key)) {
	                index = indexOfListener(listeners[key], listener);

	                if (index !== -1) {
	                    listeners[key].splice(index, 1);
	                }
	            }
	        }

	        return this;
	    };

	    /**
	     * Alias of removeListener
	     */
	    proto.off = alias('removeListener');

	    /**
	     * Adds listeners in bulk using the manipulateListeners method.
	     * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
	     * You can also pass it a regular expression to add the array of listeners to all events that match it.
	     * Yeah, this function does quite a bit. That's probably a bad thing.
	     *
	     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
	     * @param {Function[]} [listeners] An optional array of listener functions to add.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.addListeners = function addListeners(evt, listeners) {
	        // Pass through to manipulateListeners
	        return this.manipulateListeners(false, evt, listeners);
	    };

	    /**
	     * Removes listeners in bulk using the manipulateListeners method.
	     * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	     * You can also pass it an event name and an array of listeners to be removed.
	     * You can also pass it a regular expression to remove the listeners from all events that match it.
	     *
	     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
	     * @param {Function[]} [listeners] An optional array of listener functions to remove.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.removeListeners = function removeListeners(evt, listeners) {
	        // Pass through to manipulateListeners
	        return this.manipulateListeners(true, evt, listeners);
	    };

	    /**
	     * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
	     * The first argument will determine if the listeners are removed (true) or added (false).
	     * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	     * You can also pass it an event name and an array of listeners to be added/removed.
	     * You can also pass it a regular expression to manipulate the listeners of all events that match it.
	     *
	     * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
	     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
	     * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
	        var i;
	        var value;
	        var single = remove ? this.removeListener : this.addListener;
	        var multiple = remove ? this.removeListeners : this.addListeners;

	        // If evt is an object then pass each of it's properties to this method
	        if (typeof evt === 'object' && !(evt instanceof RegExp)) {
	            for (i in evt) {
	                if (evt.hasOwnProperty(i) && (value = evt[i])) {
	                    // Pass the single listener straight through to the singular method
	                    if (typeof value === 'function') {
	                        single.call(this, i, value);
	                    }
	                    else {
	                        // Otherwise pass back to the multiple function
	                        multiple.call(this, i, value);
	                    }
	                }
	            }
	        }
	        else {
	            // So evt must be a string
	            // And listeners must be an array of listeners
	            // Loop over it and pass each one to the multiple method
	            i = listeners.length;
	            while (i--) {
	                single.call(this, evt, listeners[i]);
	            }
	        }

	        return this;
	    };

	    /**
	     * Removes all listeners from a specified event.
	     * If you do not specify an event then all listeners will be removed.
	     * That means every event will be emptied.
	     * You can also pass a regex to remove all events that match it.
	     *
	     * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.removeEvent = function removeEvent(evt) {
	        var type = typeof evt;
	        var events = this._getEvents();
	        var key;

	        // Remove different things depending on the state of evt
	        if (type === 'string') {
	            // Remove all listeners for the specified event
	            delete events[evt];
	        }
	        else if (evt instanceof RegExp) {
	            // Remove all events matching the regex.
	            for (key in events) {
	                if (events.hasOwnProperty(key) && evt.test(key)) {
	                    delete events[key];
	                }
	            }
	        }
	        else {
	            // Remove all listeners in all events
	            delete this._events;
	        }

	        return this;
	    };

	    /**
	     * Alias of removeEvent.
	     *
	     * Added to mirror the node API.
	     */
	    proto.removeAllListeners = alias('removeEvent');

	    /**
	     * Emits an event of your choice.
	     * When emitted, every listener attached to that event will be executed.
	     * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
	     * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
	     * So they will not arrive within the array on the other side, they will be separate.
	     * You can also pass a regular expression to emit to all events that match it.
	     *
	     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	     * @param {Array} [args] Optional array of arguments to be passed to each listener.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.emitEvent = function emitEvent(evt, args) {
	        var listeners = this.getListenersAsObject(evt);
	        var listener;
	        var i;
	        var key;
	        var response;

	        for (key in listeners) {
	            if (listeners.hasOwnProperty(key)) {
	                i = listeners[key].length;

	                while (i--) {
	                    // If the listener returns true then it shall be removed from the event
	                    // The function is executed either with a basic call or an apply if there is an args array
	                    listener = listeners[key][i];

	                    if (listener.once === true) {
	                        this.removeListener(evt, listener.listener);
	                    }

	                    response = listener.listener.apply(this, args || []);

	                    if (response === this._getOnceReturnValue()) {
	                        this.removeListener(evt, listener.listener);
	                    }
	                }
	            }
	        }

	        return this;
	    };

	    /**
	     * Alias of emitEvent
	     */
	    proto.trigger = alias('emitEvent');

	    /**
	     * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
	     * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
	     *
	     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	     * @param {...*} Optional additional arguments to be passed to each listener.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.emit = function emit(evt) {
	        var args = Array.prototype.slice.call(arguments, 1);
	        return this.emitEvent(evt, args);
	    };

	    /**
	     * Sets the current value to check against when executing listeners. If a
	     * listeners return value matches the one set here then it will be removed
	     * after execution. This value defaults to true.
	     *
	     * @param {*} value The new value to check for when executing listeners.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.setOnceReturnValue = function setOnceReturnValue(value) {
	        this._onceReturnValue = value;
	        return this;
	    };

	    /**
	     * Fetches the current value to check against when executing listeners. If
	     * the listeners return value matches this one then it should be removed
	     * automatically. It will return true by default.
	     *
	     * @return {*|Boolean} The current value to check for or the default, true.
	     * @api private
	     */
	    proto._getOnceReturnValue = function _getOnceReturnValue() {
	        if (this.hasOwnProperty('_onceReturnValue')) {
	            return this._onceReturnValue;
	        }
	        else {
	            return true;
	        }
	    };

	    /**
	     * Fetches the events object and creates one if required.
	     *
	     * @return {Object} The events storage object.
	     * @api private
	     */
	    proto._getEvents = function _getEvents() {
	        return this._events || (this._events = {});
	    };

	    /**
	     * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
	     *
	     * @return {Function} Non conflicting EventEmitter class.
	     */
	    EventEmitter.noConflict = function noConflict() {
	        exports.EventEmitter = originalGlobalValue;
	        return EventEmitter;
	    };

	    // Expose the class either via AMD, CommonJS or the global object
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	            return EventEmitter;
	        }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    }
	    else if (typeof module === 'object' && module.exports){
	        module.exports = EventEmitter;
	    }
	    else {
	        this.EventEmitter = EventEmitter;
	    }
	}.call(this));


/***/ }
/******/ ])
});
;