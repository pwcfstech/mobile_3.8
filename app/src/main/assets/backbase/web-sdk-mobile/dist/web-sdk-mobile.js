(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
/* jshint node:true */
'use strict';

// Add all locale data to `HandlebarsIntl`. This module will be ignored when
// bundling for the browser with Browserify/Webpack.
require('./lib/locales');

exports = module.exports = require('./lib/handlebars-intl');

},{"./lib/handlebars-intl":4,"./lib/locales":1}],3:[function(require,module,exports){
// GENERATED FILE
"use strict";
exports["default"] = {"locale":"en","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return n10==1&&n100!=11?"one":n10==2&&n100!=12?"two":n10==3&&n100!=13?"few":"other";return n==1&&v0?"one":"other"},"fields":{"year":{"displayName":"Year","relative":{"0":"this year","1":"next year","-1":"last year"},"relativeTime":{"future":{"one":"in {0} year","other":"in {0} years"},"past":{"one":"{0} year ago","other":"{0} years ago"}}},"month":{"displayName":"Month","relative":{"0":"this month","1":"next month","-1":"last month"},"relativeTime":{"future":{"one":"in {0} month","other":"in {0} months"},"past":{"one":"{0} month ago","other":"{0} months ago"}}},"day":{"displayName":"Day","relative":{"0":"today","1":"tomorrow","-1":"yesterday"},"relativeTime":{"future":{"one":"in {0} day","other":"in {0} days"},"past":{"one":"{0} day ago","other":"{0} days ago"}}},"hour":{"displayName":"Hour","relativeTime":{"future":{"one":"in {0} hour","other":"in {0} hours"},"past":{"one":"{0} hour ago","other":"{0} hours ago"}}},"minute":{"displayName":"Minute","relativeTime":{"future":{"one":"in {0} minute","other":"in {0} minutes"},"past":{"one":"{0} minute ago","other":"{0} minutes ago"}}},"second":{"displayName":"Second","relative":{"0":"now"},"relativeTime":{"future":{"one":"in {0} second","other":"in {0} seconds"},"past":{"one":"{0} second ago","other":"{0} seconds ago"}}}}};


},{}],4:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jshint esnext: true */

"use strict";
exports.__addLocaleData = __addLocaleData;
var intl$messageformat$$ = require("intl-messageformat"), intl$relativeformat$$ = require("intl-relativeformat"), src$helpers$$ = require("./helpers.js"), src$en$$ = require("./en.js");
function __addLocaleData(data) {
    intl$messageformat$$["default"].__addLocaleData(data);
    intl$relativeformat$$["default"].__addLocaleData(data);
}

__addLocaleData(src$en$$["default"]);
exports.registerWith = src$helpers$$.registerWith;


},{"./en.js":3,"./helpers.js":5,"intl-messageformat":10,"intl-relativeformat":19}],5:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jshint esnext: true */

"use strict";
var intl$messageformat$$ = require("intl-messageformat"), intl$relativeformat$$ = require("intl-relativeformat"), intl$format$cache$$ = require("intl-format-cache"), src$utils$$ = require("./utils.js");

// -----------------------------------------------------------------------------

var getNumberFormat   = intl$format$cache$$["default"](Intl.NumberFormat);
var getDateTimeFormat = intl$format$cache$$["default"](Intl.DateTimeFormat);
var getMessageFormat  = intl$format$cache$$["default"](intl$messageformat$$["default"]);
var getRelativeFormat = intl$format$cache$$["default"](intl$relativeformat$$["default"]);

function registerWith(Handlebars) {
    var SafeString  = Handlebars.SafeString,
        createFrame = Handlebars.createFrame,
        escape      = Handlebars.Utils.escapeExpression;

    var helpers = {
        intl             : intl,
        intlGet          : intlGet,
        formatDate       : formatDate,
        formatTime       : formatTime,
        formatRelative   : formatRelative,
        formatNumber     : formatNumber,
        formatMessage    : formatMessage,
        formatHTMLMessage: formatHTMLMessage,

        // Deprecated helpers (renamed):
        intlDate       : deprecate('intlDate', formatDate),
        intlTime       : deprecate('intlTime', formatTime),
        intlNumber     : deprecate('intlNumber', formatNumber),
        intlMessage    : deprecate('intlMessage', formatMessage),
        intlHTMLMessage: deprecate('intlHTMLMessage', formatHTMLMessage)
    };

    for (var name in helpers) {
        if (helpers.hasOwnProperty(name)) {
            Handlebars.registerHelper(name, helpers[name]);
        }
    }

    function deprecate(name, suggestion) {
        return function () {
            if (typeof console !== 'undefined' &&
                typeof console.warn === 'function') {

                console.warn(
                    '{{' + name + '}} is deprecated, use: ' +
                    '{{' + suggestion.name + '}}'
                );
            }

            return suggestion.apply(this, arguments);
        };
    }

    // -- Helpers --------------------------------------------------------------

    function intl(options) {
        /* jshint validthis:true */

        if (!options.fn) {
            throw new Error('{{#intl}} must be invoked as a block helper');
        }

        // Create a new data frame linked the parent and create a new intl data
        // object and extend it with `options.data.intl` and `options.hash`.
        var data     = createFrame(options.data),
            intlData = src$utils$$.extend({}, data.intl, options.hash);

        data.intl = intlData;

        return options.fn(this, {data: data});
    }

    function intlGet(path, options) {
        var intlData  = options.data && options.data.intl,
            pathParts = path.split('.');

        var obj, len, i;

        // Use the path to walk the Intl data to find the object at the given
        // path, and throw a descriptive error if it's not found.
        try {
            for (i = 0, len = pathParts.length; i < len; i++) {
                obj = intlData = intlData[pathParts[i]];
            }
        } finally {
            if (obj === undefined) {
                throw new ReferenceError('Could not find Intl object: ' + path);
            }
        }

        return obj;
    }

    function formatDate(date, format, options) {
        date = new Date(date);
        assertIsDate(date, 'A date or timestamp must be provided to {{formatDate}}');

        if (!options) {
            options = format;
            format  = null;
        }

        var locales       = options.data.intl && options.data.intl.locales;
        var formatOptions = getFormatOptions('date', format, options);

        return getDateTimeFormat(locales, formatOptions).format(date);
    }

    function formatTime(date, format, options) {
        date = new Date(date);
        assertIsDate(date, 'A date or timestamp must be provided to {{formatTime}}');

        if (!options) {
            options = format;
            format  = null;
        }

        var locales       = options.data.intl && options.data.intl.locales;
        var formatOptions = getFormatOptions('time', format, options);

        return getDateTimeFormat(locales, formatOptions).format(date);
    }

    function formatRelative(date, format, options) {
        date = new Date(date);
        assertIsDate(date, 'A date or timestamp must be provided to {{formatRelative}}');

        if (!options) {
            options = format;
            format  = null;
        }

        var locales       = options.data.intl && options.data.intl.locales;
        var formatOptions = getFormatOptions('relative', format, options);
        var now           = options.hash.now;

        // Remove `now` from the options passed to the `IntlRelativeFormat`
        // constructor, because it's only used when calling `format()`.
        delete formatOptions.now;

        return getRelativeFormat(locales, formatOptions).format(date, {
            now: now
        });
    }

    function formatNumber(num, format, options) {
        assertIsNumber(num, 'A number must be provided to {{formatNumber}}');

        if (!options) {
            options = format;
            format  = null;
        }

        var locales       = options.data.intl && options.data.intl.locales;
        var formatOptions = getFormatOptions('number', format, options);

        return getNumberFormat(locales, formatOptions).format(num);
    }

    function formatMessage(message, options) {
        if (!options) {
            options = message;
            message = null;
        }

        var hash = options.hash;

        // TODO: remove support form `hash.intlName` once Handlebars bugs with
        // subexpressions are fixed.
        if (!(message || typeof message === 'string' || hash.intlName)) {
            throw new ReferenceError(
                '{{formatMessage}} must be provided a message or intlName'
            );
        }

        var intlData = options.data.intl || {},
            locales  = intlData.locales,
            formats  = intlData.formats;

        // Lookup message by path name. User must supply the full path to the
        // message on `options.data.intl`.
        if (!message && hash.intlName) {
            message = intlGet(hash.intlName, options);
        }

        // When `message` is a function, assume it's an IntlMessageFormat
        // instance's `format()` method passed by reference, and call it. This
        // is possible because its `this` will be pre-bound to the instance.
        if (typeof message === 'function') {
            return message(hash);
        }

        if (typeof message === 'string') {
            message = getMessageFormat(message, locales, formats);
        }

        return message.format(hash);
    }

    function formatHTMLMessage() {
        /* jshint validthis:true */
        var options = [].slice.call(arguments).pop(),
            hash    = options.hash;

        var key, value;

        // Replace string properties in `options.hash` with HTML-escaped
        // strings.
        for (key in hash) {
            if (hash.hasOwnProperty(key)) {
                value = hash[key];

                // Escape string value.
                if (typeof value === 'string') {
                    hash[key] = escape(value);
                }
            }
        }

        // Return a Handlebars `SafeString`. This first unwraps the result to
        // make sure it's not returning a double-wrapped `SafeString`.
        return new SafeString(String(formatMessage.apply(this, arguments)));
    }

    // -- Utilities ------------------------------------------------------------

    function assertIsDate(date, errMsg) {
        // Determine if the `date` is valid by checking if it is finite, which
        // is the same way that `Intl.DateTimeFormat#format()` checks.
        if (!isFinite(date)) {
            throw new TypeError(errMsg);
        }
    }

    function assertIsNumber(num, errMsg) {
        if (typeof num !== 'number') {
            throw new TypeError(errMsg);
        }
    }

    function getFormatOptions(type, format, options) {
        var hash = options.hash;
        var formatOptions;

        if (format) {
            if (typeof format === 'string') {
                formatOptions = intlGet('formats.' + type + '.' + format, options);
            }

            formatOptions = src$utils$$.extend({}, formatOptions, hash);
        } else {
            formatOptions = hash;
        }

        return formatOptions;
    }
}
exports.registerWith = registerWith;


},{"./utils.js":6,"intl-format-cache":7,"intl-messageformat":10,"intl-relativeformat":19}],6:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jshint esnext: true */

"use strict";

// -----------------------------------------------------------------------------

function extend(obj) {
    var sources = Array.prototype.slice.call(arguments, 1),
        i, len, source, key;

    for (i = 0, len = sources.length; i < len; i += 1) {
        source = sources[i];
        if (!source) { continue; }

        for (key in source) {
            if (source.hasOwnProperty(key)) {
                obj[key] = source[key];
            }
        }
    }

    return obj;
}
exports.extend = extend;


},{}],7:[function(require,module,exports){
'use strict';

exports = module.exports = require('./lib/memoizer')['default'];
exports['default'] = exports;

},{"./lib/memoizer":9}],8:[function(require,module,exports){
"use strict";
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

// Function.prototype.bind implementation from Mozilla Developer Network:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Polyfill

var bind = Function.prototype.bind || function (oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    if (this.prototype) {
      // native functions don't have a prototype
      fNOP.prototype = this.prototype;
    }
    fBound.prototype = new fNOP();

    return fBound;
};

// Purposely using the same implementation as the Intl.js `Intl` polyfill.
// Copyright 2013 Andy Earnshaw, MIT License

var hop = Object.prototype.hasOwnProperty;

var realDefineProp = (function () {
    try { return !!Object.defineProperty({}, 'a', {}); }
    catch (e) { return false; }
})();

var es3 = !realDefineProp && !Object.prototype.__defineGetter__;

var defineProperty = realDefineProp ? Object.defineProperty :
        function (obj, name, desc) {

    if ('get' in desc && obj.__defineGetter__) {
        obj.__defineGetter__(name, desc.get);
    } else if (!hop.call(obj, name) || 'value' in desc) {
        obj[name] = desc.value;
    }
};

var objCreate = Object.create || function (proto, props) {
    var obj, k;

    function F() {}
    F.prototype = proto;
    obj = new F();

    for (k in props) {
        if (hop.call(props, k)) {
            defineProperty(obj, k, props[k]);
        }
    }

    return obj;
};

exports.bind = bind, exports.defineProperty = defineProperty, exports.objCreate = objCreate;


},{}],9:[function(require,module,exports){
"use strict";
var src$es5$$ = require("./es5");
exports["default"] = createFormatCache;

// -----------------------------------------------------------------------------

function createFormatCache(FormatConstructor) {
    var cache = src$es5$$.objCreate(null);

    return function () {
        var args    = Array.prototype.slice.call(arguments);
        var cacheId = getCacheId(args);
        var format  = cacheId && cache[cacheId];

        if (!format) {
            format = new (src$es5$$.bind.apply(FormatConstructor, [null].concat(args)))();

            if (cacheId) {
                cache[cacheId] = format;
            }
        }

        return format;
    };
}

// -- Utilities ----------------------------------------------------------------

function getCacheId(inputs) {
    // When JSON is not available in the runtime, we will not create a cache id.
    if (typeof JSON === 'undefined') { return; }

    var cacheId = [];

    var i, len, input;

    for (i = 0, len = inputs.length; i < len; i += 1) {
        input = inputs[i];

        if (input && typeof input === 'object') {
            cacheId.push(orderedProps(input));
        } else {
            cacheId.push(input);
        }
    }

    return JSON.stringify(cacheId);
}

function orderedProps(obj) {
    var props = [],
        keys  = [];

    var key, i, len, prop;

    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }

    var orderedKeys = keys.sort();

    for (i = 0, len = orderedKeys.length; i < len; i += 1) {
        key  = orderedKeys[i];
        prop = {};

        prop[key] = obj[key];
        props[i]  = prop;
    }

    return props;
}


},{"./es5":8}],10:[function(require,module,exports){
/* jshint node:true */

'use strict';

var IntlMessageFormat = require('./lib/main')['default'];

// Add all locale data to `IntlMessageFormat`. This module will be ignored when
// bundling for the browser with Browserify/Webpack.
require('./lib/locales');

// Re-export `IntlMessageFormat` as the CommonJS default exports with all the
// locale data registered, and with English set as the default locale. Define
// the `default` prop for use with other compiled ES6 Modules.
exports = module.exports = IntlMessageFormat;
exports['default'] = exports;

},{"./lib/locales":1,"./lib/main":15}],11:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";
exports["default"] = Compiler;

function Compiler(locales, formats, pluralFn) {
    this.locales  = locales;
    this.formats  = formats;
    this.pluralFn = pluralFn;
}

Compiler.prototype.compile = function (ast) {
    this.pluralStack        = [];
    this.currentPlural      = null;
    this.pluralNumberFormat = null;

    return this.compileMessage(ast);
};

Compiler.prototype.compileMessage = function (ast) {
    if (!(ast && ast.type === 'messageFormatPattern')) {
        throw new Error('Message AST is not of type: "messageFormatPattern"');
    }

    var elements = ast.elements,
        pattern  = [];

    var i, len, element;

    for (i = 0, len = elements.length; i < len; i += 1) {
        element = elements[i];

        switch (element.type) {
            case 'messageTextElement':
                pattern.push(this.compileMessageText(element));
                break;

            case 'argumentElement':
                pattern.push(this.compileArgument(element));
                break;

            default:
                throw new Error('Message element does not have a valid type');
        }
    }

    return pattern;
};

Compiler.prototype.compileMessageText = function (element) {
    // When this `element` is part of plural sub-pattern and its value contains
    // an unescaped '#', use a `PluralOffsetString` helper to properly output
    // the number with the correct offset in the string.
    if (this.currentPlural && /(^|[^\\])#/g.test(element.value)) {
        // Create a cache a NumberFormat instance that can be reused for any
        // PluralOffsetString instance in this message.
        if (!this.pluralNumberFormat) {
            this.pluralNumberFormat = new Intl.NumberFormat(this.locales);
        }

        return new PluralOffsetString(
                this.currentPlural.id,
                this.currentPlural.format.offset,
                this.pluralNumberFormat,
                element.value);
    }

    // Unescape the escaped '#'s in the message text.
    return element.value.replace(/\\#/g, '#');
};

Compiler.prototype.compileArgument = function (element) {
    var format = element.format;

    if (!format) {
        return new StringFormat(element.id);
    }

    var formats  = this.formats,
        locales  = this.locales,
        pluralFn = this.pluralFn,
        options;

    switch (format.type) {
        case 'numberFormat':
            options = formats.number[format.style];
            return {
                id    : element.id,
                format: new Intl.NumberFormat(locales, options).format
            };

        case 'dateFormat':
            options = formats.date[format.style];
            return {
                id    : element.id,
                format: new Intl.DateTimeFormat(locales, options).format
            };

        case 'timeFormat':
            options = formats.time[format.style];
            return {
                id    : element.id,
                format: new Intl.DateTimeFormat(locales, options).format
            };

        case 'pluralFormat':
            options = this.compileOptions(element);
            return new PluralFormat(
                element.id, format.ordinal, format.offset, options, pluralFn
            );

        case 'selectFormat':
            options = this.compileOptions(element);
            return new SelectFormat(element.id, options);

        default:
            throw new Error('Message element does not have a valid format type');
    }
};

Compiler.prototype.compileOptions = function (element) {
    var format      = element.format,
        options     = format.options,
        optionsHash = {};

    // Save the current plural element, if any, then set it to a new value when
    // compiling the options sub-patterns. This conforms the spec's algorithm
    // for handling `"#"` syntax in message text.
    this.pluralStack.push(this.currentPlural);
    this.currentPlural = format.type === 'pluralFormat' ? element : null;

    var i, len, option;

    for (i = 0, len = options.length; i < len; i += 1) {
        option = options[i];

        // Compile the sub-pattern and save it under the options's selector.
        optionsHash[option.selector] = this.compileMessage(option.value);
    }

    // Pop the plural stack to put back the original current plural value.
    this.currentPlural = this.pluralStack.pop();

    return optionsHash;
};

// -- Compiler Helper Classes --------------------------------------------------

function StringFormat(id) {
    this.id = id;
}

StringFormat.prototype.format = function (value) {
    if (!value) {
        return '';
    }

    return typeof value === 'string' ? value : String(value);
};

function PluralFormat(id, useOrdinal, offset, options, pluralFn) {
    this.id         = id;
    this.useOrdinal = useOrdinal;
    this.offset     = offset;
    this.options    = options;
    this.pluralFn   = pluralFn;
}

PluralFormat.prototype.getOption = function (value) {
    var options = this.options;

    var option = options['=' + value] ||
            options[this.pluralFn(value - this.offset, this.useOrdinal)];

    return option || options.other;
};

function PluralOffsetString(id, offset, numberFormat, string) {
    this.id           = id;
    this.offset       = offset;
    this.numberFormat = numberFormat;
    this.string       = string;
}

PluralOffsetString.prototype.format = function (value) {
    var number = this.numberFormat.format(value - this.offset);

    return this.string
            .replace(/(^|[^\\])#/g, '$1' + number)
            .replace(/\\#/g, '#');
};

function SelectFormat(id, options) {
    this.id      = id;
    this.options = options;
}

SelectFormat.prototype.getOption = function (value) {
    var options = this.options;
    return options[value] || options.other;
};


},{}],12:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";
var src$utils$$ = require("./utils"), src$es5$$ = require("./es5"), src$compiler$$ = require("./compiler"), intl$messageformat$parser$$ = require("intl-messageformat-parser");
exports["default"] = MessageFormat;

// -- MessageFormat --------------------------------------------------------

function MessageFormat(message, locales, formats) {
    // Parse string messages into an AST.
    var ast = typeof message === 'string' ?
            MessageFormat.__parse(message) : message;

    if (!(ast && ast.type === 'messageFormatPattern')) {
        throw new TypeError('A message must be provided as a String or AST.');
    }

    // Creates a new object with the specified `formats` merged with the default
    // formats.
    formats = this._mergeFormats(MessageFormat.formats, formats);

    // Defined first because it's used to build the format pattern.
    src$es5$$.defineProperty(this, '_locale',  {value: this._resolveLocale(locales)});

    // Compile the `ast` to a pattern that is highly optimized for repeated
    // `format()` invocations. **Note:** This passes the `locales` set provided
    // to the constructor instead of just the resolved locale.
    var pluralFn = this._findPluralRuleFunction(this._locale);
    var pattern  = this._compilePattern(ast, locales, formats, pluralFn);

    // "Bind" `format()` method to `this` so it can be passed by reference like
    // the other `Intl` APIs.
    var messageFormat = this;
    this.format = function (values) {
        return messageFormat._format(pattern, values);
    };
}

// Default format options used as the prototype of the `formats` provided to the
// constructor. These are used when constructing the internal Intl.NumberFormat
// and Intl.DateTimeFormat instances.
src$es5$$.defineProperty(MessageFormat, 'formats', {
    enumerable: true,

    value: {
        number: {
            'currency': {
                style: 'currency'
            },

            'percent': {
                style: 'percent'
            }
        },

        date: {
            'short': {
                month: 'numeric',
                day  : 'numeric',
                year : '2-digit'
            },

            'medium': {
                month: 'short',
                day  : 'numeric',
                year : 'numeric'
            },

            'long': {
                month: 'long',
                day  : 'numeric',
                year : 'numeric'
            },

            'full': {
                weekday: 'long',
                month  : 'long',
                day    : 'numeric',
                year   : 'numeric'
            }
        },

        time: {
            'short': {
                hour  : 'numeric',
                minute: 'numeric'
            },

            'medium':  {
                hour  : 'numeric',
                minute: 'numeric',
                second: 'numeric'
            },

            'long': {
                hour        : 'numeric',
                minute      : 'numeric',
                second      : 'numeric',
                timeZoneName: 'short'
            },

            'full': {
                hour        : 'numeric',
                minute      : 'numeric',
                second      : 'numeric',
                timeZoneName: 'short'
            }
        }
    }
});

// Define internal private properties for dealing with locale data.
src$es5$$.defineProperty(MessageFormat, '__localeData__', {value: src$es5$$.objCreate(null)});
src$es5$$.defineProperty(MessageFormat, '__addLocaleData', {value: function (data) {
    if (!(data && data.locale)) {
        throw new Error(
            'Locale data provided to IntlMessageFormat is missing a ' +
            '`locale` property'
        );
    }

    MessageFormat.__localeData__[data.locale.toLowerCase()] = data;
}});

// Defines `__parse()` static method as an exposed private.
src$es5$$.defineProperty(MessageFormat, '__parse', {value: intl$messageformat$parser$$["default"].parse});

// Define public `defaultLocale` property which defaults to English, but can be
// set by the developer.
src$es5$$.defineProperty(MessageFormat, 'defaultLocale', {
    enumerable: true,
    writable  : true,
    value     : undefined
});

MessageFormat.prototype.resolvedOptions = function () {
    // TODO: Provide anything else?
    return {
        locale: this._locale
    };
};

MessageFormat.prototype._compilePattern = function (ast, locales, formats, pluralFn) {
    var compiler = new src$compiler$$["default"](locales, formats, pluralFn);
    return compiler.compile(ast);
};

MessageFormat.prototype._findPluralRuleFunction = function (locale) {
    var localeData = MessageFormat.__localeData__;
    var data       = localeData[locale.toLowerCase()];

    // The locale data is de-duplicated, so we have to traverse the locale's
    // hierarchy until we find a `pluralRuleFunction` to return.
    while (data) {
        if (data.pluralRuleFunction) {
            return data.pluralRuleFunction;
        }

        data = data.parentLocale && localeData[data.parentLocale.toLowerCase()];
    }

    throw new Error(
        'Locale data added to IntlMessageFormat is missing a ' +
        '`pluralRuleFunction` for :' + locale
    );
};

MessageFormat.prototype._format = function (pattern, values) {
    var result = '',
        i, len, part, id, value;

    for (i = 0, len = pattern.length; i < len; i += 1) {
        part = pattern[i];

        // Exist early for string parts.
        if (typeof part === 'string') {
            result += part;
            continue;
        }

        id = part.id;

        // Enforce that all required values are provided by the caller.
        if (!(values && src$utils$$.hop.call(values, id))) {
            throw new Error('A value must be provided for: ' + id);
        }

        value = values[id];

        // Recursively format plural and select parts' option — which can be a
        // nested pattern structure. The choosing of the option to use is
        // abstracted-by and delegated-to the part helper object.
        if (part.options) {
            result += this._format(part.getOption(value), values);
        } else {
            result += part.format(value);
        }
    }

    return result;
};

MessageFormat.prototype._mergeFormats = function (defaults, formats) {
    var mergedFormats = {},
        type, mergedType;

    for (type in defaults) {
        if (!src$utils$$.hop.call(defaults, type)) { continue; }

        mergedFormats[type] = mergedType = src$es5$$.objCreate(defaults[type]);

        if (formats && src$utils$$.hop.call(formats, type)) {
            src$utils$$.extend(mergedType, formats[type]);
        }
    }

    return mergedFormats;
};

MessageFormat.prototype._resolveLocale = function (locales) {
    if (typeof locales === 'string') {
        locales = [locales];
    }

    // Create a copy of the array so we can push on the default locale.
    locales = (locales || []).concat(MessageFormat.defaultLocale);

    var localeData = MessageFormat.__localeData__;
    var i, len, localeParts, data;

    // Using the set of locales + the default locale, we look for the first one
    // which that has been registered. When data does not exist for a locale, we
    // traverse its ancestors to find something that's been registered within
    // its hierarchy of locales. Since we lack the proper `parentLocale` data
    // here, we must take a naive approach to traversal.
    for (i = 0, len = locales.length; i < len; i += 1) {
        localeParts = locales[i].toLowerCase().split('-');

        while (localeParts.length) {
            data = localeData[localeParts.join('-')];
            if (data) {
                // Return the normalized locale string; e.g., we return "en-US",
                // instead of "en-us".
                return data.locale;
            }

            localeParts.pop();
        }
    }

    var defaultLocale = locales.pop();
    throw new Error(
        'No locale data has been added to IntlMessageFormat for: ' +
        locales.join(', ') + ', or the default locale: ' + defaultLocale
    );
};


},{"./compiler":11,"./es5":14,"./utils":16,"intl-messageformat-parser":17}],13:[function(require,module,exports){
// GENERATED FILE
"use strict";
exports["default"] = {"locale":"en","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return n10==1&&n100!=11?"one":n10==2&&n100!=12?"two":n10==3&&n100!=13?"few":"other";return n==1&&v0?"one":"other"}};


},{}],14:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";
var src$utils$$ = require("./utils");

// Purposely using the same implementation as the Intl.js `Intl` polyfill.
// Copyright 2013 Andy Earnshaw, MIT License

var realDefineProp = (function () {
    try { return !!Object.defineProperty({}, 'a', {}); }
    catch (e) { return false; }
})();

var es3 = !realDefineProp && !Object.prototype.__defineGetter__;

var defineProperty = realDefineProp ? Object.defineProperty :
        function (obj, name, desc) {

    if ('get' in desc && obj.__defineGetter__) {
        obj.__defineGetter__(name, desc.get);
    } else if (!src$utils$$.hop.call(obj, name) || 'value' in desc) {
        obj[name] = desc.value;
    }
};

var objCreate = Object.create || function (proto, props) {
    var obj, k;

    function F() {}
    F.prototype = proto;
    obj = new F();

    for (k in props) {
        if (src$utils$$.hop.call(props, k)) {
            defineProperty(obj, k, props[k]);
        }
    }

    return obj;
};
exports.defineProperty = defineProperty, exports.objCreate = objCreate;


},{"./utils":16}],15:[function(require,module,exports){
/* jslint esnext: true */

"use strict";
var src$core$$ = require("./core"), src$en$$ = require("./en");

src$core$$["default"].__addLocaleData(src$en$$["default"]);
src$core$$["default"].defaultLocale = 'en';

exports["default"] = src$core$$["default"];


},{"./core":12,"./en":13}],16:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";
exports.extend = extend;
var hop = Object.prototype.hasOwnProperty;

function extend(obj) {
    var sources = Array.prototype.slice.call(arguments, 1),
        i, len, source, key;

    for (i = 0, len = sources.length; i < len; i += 1) {
        source = sources[i];
        if (!source) { continue; }

        for (key in source) {
            if (hop.call(source, key)) {
                obj[key] = source[key];
            }
        }
    }

    return obj;
}
exports.hop = hop;


},{}],17:[function(require,module,exports){
'use strict';

exports = module.exports = require('./lib/parser')['default'];
exports['default'] = exports;

},{"./lib/parser":18}],18:[function(require,module,exports){
"use strict";

exports["default"] = (function() {
  /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleFunctions = { start: peg$parsestart },
        peg$startRuleFunction  = peg$parsestart,

        peg$c0 = [],
        peg$c1 = function(elements) {
                return {
                    type    : 'messageFormatPattern',
                    elements: elements
                };
            },
        peg$c2 = peg$FAILED,
        peg$c3 = function(text) {
                var string = '',
                    i, j, outerLen, inner, innerLen;

                for (i = 0, outerLen = text.length; i < outerLen; i += 1) {
                    inner = text[i];

                    for (j = 0, innerLen = inner.length; j < innerLen; j += 1) {
                        string += inner[j];
                    }
                }

                return string;
            },
        peg$c4 = function(messageText) {
                return {
                    type : 'messageTextElement',
                    value: messageText
                };
            },
        peg$c5 = /^[^ \t\n\r,.+={}#]/,
        peg$c6 = { type: "class", value: "[^ \\t\\n\\r,.+={}#]", description: "[^ \\t\\n\\r,.+={}#]" },
        peg$c7 = "{",
        peg$c8 = { type: "literal", value: "{", description: "\"{\"" },
        peg$c9 = null,
        peg$c10 = ",",
        peg$c11 = { type: "literal", value: ",", description: "\",\"" },
        peg$c12 = "}",
        peg$c13 = { type: "literal", value: "}", description: "\"}\"" },
        peg$c14 = function(id, format) {
                return {
                    type  : 'argumentElement',
                    id    : id,
                    format: format && format[2]
                };
            },
        peg$c15 = "number",
        peg$c16 = { type: "literal", value: "number", description: "\"number\"" },
        peg$c17 = "date",
        peg$c18 = { type: "literal", value: "date", description: "\"date\"" },
        peg$c19 = "time",
        peg$c20 = { type: "literal", value: "time", description: "\"time\"" },
        peg$c21 = function(type, style) {
                return {
                    type : type + 'Format',
                    style: style && style[2]
                };
            },
        peg$c22 = "plural",
        peg$c23 = { type: "literal", value: "plural", description: "\"plural\"" },
        peg$c24 = function(pluralStyle) {
                return {
                    type   : pluralStyle.type,
                    ordinal: false,
                    offset : pluralStyle.offset || 0,
                    options: pluralStyle.options
                };
            },
        peg$c25 = "selectordinal",
        peg$c26 = { type: "literal", value: "selectordinal", description: "\"selectordinal\"" },
        peg$c27 = function(pluralStyle) {
                return {
                    type   : pluralStyle.type,
                    ordinal: true,
                    offset : pluralStyle.offset || 0,
                    options: pluralStyle.options
                }
            },
        peg$c28 = "select",
        peg$c29 = { type: "literal", value: "select", description: "\"select\"" },
        peg$c30 = function(options) {
                return {
                    type   : 'selectFormat',
                    options: options
                };
            },
        peg$c31 = "=",
        peg$c32 = { type: "literal", value: "=", description: "\"=\"" },
        peg$c33 = function(selector, pattern) {
                return {
                    type    : 'optionalFormatPattern',
                    selector: selector,
                    value   : pattern
                };
            },
        peg$c34 = "offset:",
        peg$c35 = { type: "literal", value: "offset:", description: "\"offset:\"" },
        peg$c36 = function(number) {
                return number;
            },
        peg$c37 = function(offset, options) {
                return {
                    type   : 'pluralFormat',
                    offset : offset,
                    options: options
                };
            },
        peg$c38 = { type: "other", description: "whitespace" },
        peg$c39 = /^[ \t\n\r]/,
        peg$c40 = { type: "class", value: "[ \\t\\n\\r]", description: "[ \\t\\n\\r]" },
        peg$c41 = { type: "other", description: "optionalWhitespace" },
        peg$c42 = /^[0-9]/,
        peg$c43 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c44 = /^[0-9a-f]/i,
        peg$c45 = { type: "class", value: "[0-9a-f]i", description: "[0-9a-f]i" },
        peg$c46 = "0",
        peg$c47 = { type: "literal", value: "0", description: "\"0\"" },
        peg$c48 = /^[1-9]/,
        peg$c49 = { type: "class", value: "[1-9]", description: "[1-9]" },
        peg$c50 = function(digits) {
            return parseInt(digits, 10);
        },
        peg$c51 = /^[^{}\\\0-\x1F \t\n\r]/,
        peg$c52 = { type: "class", value: "[^{}\\\\\\0-\\x1F \\t\\n\\r]", description: "[^{}\\\\\\0-\\x1F \\t\\n\\r]" },
        peg$c53 = "\\#",
        peg$c54 = { type: "literal", value: "\\#", description: "\"\\\\#\"" },
        peg$c55 = function() { return '\\#'; },
        peg$c56 = "\\{",
        peg$c57 = { type: "literal", value: "\\{", description: "\"\\\\{\"" },
        peg$c58 = function() { return '\u007B'; },
        peg$c59 = "\\}",
        peg$c60 = { type: "literal", value: "\\}", description: "\"\\\\}\"" },
        peg$c61 = function() { return '\u007D'; },
        peg$c62 = "\\u",
        peg$c63 = { type: "literal", value: "\\u", description: "\"\\\\u\"" },
        peg$c64 = function(digits) {
                return String.fromCharCode(parseInt(digits, 16));
            },
        peg$c65 = function(chars) { return chars.join(''); },

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        peg$reportedPos
      );
    }

    function error(message) {
      throw peg$buildException(message, null, peg$reportedPos);
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, pos) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var posDetails = peg$computePosDetails(pos),
          found      = pos < input.length ? input.charAt(pos) : null;

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
    }

    function peg$parsestart() {
      var s0;

      s0 = peg$parsemessageFormatPattern();

      return s0;
    }

    function peg$parsemessageFormatPattern() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsemessageFormatElement();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsemessageFormatElement();
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c1(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsemessageFormatElement() {
      var s0;

      s0 = peg$parsemessageTextElement();
      if (s0 === peg$FAILED) {
        s0 = peg$parseargumentElement();
      }

      return s0;
    }

    function peg$parsemessageText() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$currPos;
      s3 = peg$parse_();
      if (s3 !== peg$FAILED) {
        s4 = peg$parsechars();
        if (s4 !== peg$FAILED) {
          s5 = peg$parse_();
          if (s5 !== peg$FAILED) {
            s3 = [s3, s4, s5];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$c2;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c2;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$c2;
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$currPos;
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsechars();
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s3 = [s3, s4, s5];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$c2;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$c2;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c2;
          }
        }
      } else {
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c3(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsews();
        if (s1 !== peg$FAILED) {
          s1 = input.substring(s0, peg$currPos);
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parsemessageTextElement() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parsemessageText();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c4(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseargument() {
      var s0, s1, s2;

      s0 = peg$parsenumber();
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = [];
        if (peg$c5.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c6); }
        }
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            if (peg$c5.test(input.charAt(peg$currPos))) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c6); }
            }
          }
        } else {
          s1 = peg$c2;
        }
        if (s1 !== peg$FAILED) {
          s1 = input.substring(s0, peg$currPos);
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parseargumentElement() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s1 = peg$c7;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c8); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseargument();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 44) {
                s6 = peg$c10;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c11); }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseelementFormat();
                  if (s8 !== peg$FAILED) {
                    s6 = [s6, s7, s8];
                    s5 = s6;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$c2;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$c2;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$c2;
              }
              if (s5 === peg$FAILED) {
                s5 = peg$c9;
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parse_();
                if (s6 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 125) {
                    s7 = peg$c12;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c13); }
                  }
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c14(s3, s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseelementFormat() {
      var s0;

      s0 = peg$parsesimpleFormat();
      if (s0 === peg$FAILED) {
        s0 = peg$parsepluralFormat();
        if (s0 === peg$FAILED) {
          s0 = peg$parseselectOrdinalFormat();
          if (s0 === peg$FAILED) {
            s0 = peg$parseselectFormat();
          }
        }
      }

      return s0;
    }

    function peg$parsesimpleFormat() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c15) {
        s1 = peg$c15;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c16); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 4) === peg$c17) {
          s1 = peg$c17;
          peg$currPos += 4;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c18); }
        }
        if (s1 === peg$FAILED) {
          if (input.substr(peg$currPos, 4) === peg$c19) {
            s1 = peg$c19;
            peg$currPos += 4;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c20); }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 44) {
            s4 = peg$c10;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c11); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parse_();
            if (s5 !== peg$FAILED) {
              s6 = peg$parsechars();
              if (s6 !== peg$FAILED) {
                s4 = [s4, s5, s6];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c2;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c2;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c2;
          }
          if (s3 === peg$FAILED) {
            s3 = peg$c9;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c21(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parsepluralFormat() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c22) {
        s1 = peg$c22;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c23); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s3 = peg$c10;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c11); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsepluralStyle();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c24(s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseselectOrdinalFormat() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 13) === peg$c25) {
        s1 = peg$c25;
        peg$currPos += 13;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c26); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s3 = peg$c10;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c11); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsepluralStyle();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c27(s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseselectFormat() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c28) {
        s1 = peg$c28;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c29); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s3 = peg$c10;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c11); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = [];
              s6 = peg$parseoptionalFormatPattern();
              if (s6 !== peg$FAILED) {
                while (s6 !== peg$FAILED) {
                  s5.push(s6);
                  s6 = peg$parseoptionalFormatPattern();
                }
              } else {
                s5 = peg$c2;
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c30(s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseselector() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 61) {
        s2 = peg$c31;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c32); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsenumber();
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$c2;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$parsechars();
      }

      return s0;
    }

    function peg$parseoptionalFormatPattern() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseselector();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 123) {
              s4 = peg$c7;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c8); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parsemessageFormatPattern();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse_();
                  if (s7 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 125) {
                      s8 = peg$c12;
                      peg$currPos++;
                    } else {
                      s8 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c13); }
                    }
                    if (s8 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c33(s2, s6);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseoffset() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 7) === peg$c34) {
        s1 = peg$c34;
        peg$currPos += 7;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c35); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsenumber();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c36(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parsepluralStyle() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parseoffset();
      if (s1 === peg$FAILED) {
        s1 = peg$c9;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseoptionalFormatPattern();
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseoptionalFormatPattern();
            }
          } else {
            s3 = peg$c2;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c37(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parsews() {
      var s0, s1;

      peg$silentFails++;
      s0 = [];
      if (peg$c39.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c40); }
      }
      if (s1 !== peg$FAILED) {
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          if (peg$c39.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c40); }
          }
        }
      } else {
        s0 = peg$c2;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c38); }
      }

      return s0;
    }

    function peg$parse_() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsews();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsews();
      }
      if (s1 !== peg$FAILED) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c41); }
      }

      return s0;
    }

    function peg$parsedigit() {
      var s0;

      if (peg$c42.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c43); }
      }

      return s0;
    }

    function peg$parsehexDigit() {
      var s0;

      if (peg$c44.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c45); }
      }

      return s0;
    }

    function peg$parsenumber() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 48) {
        s1 = peg$c46;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c47); }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$currPos;
        s2 = peg$currPos;
        if (peg$c48.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c49); }
        }
        if (s3 !== peg$FAILED) {
          s4 = [];
          s5 = peg$parsedigit();
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            s5 = peg$parsedigit();
          }
          if (s4 !== peg$FAILED) {
            s3 = [s3, s4];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$c2;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c2;
        }
        if (s2 !== peg$FAILED) {
          s2 = input.substring(s1, peg$currPos);
        }
        s1 = s2;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c50(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsechar() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      if (peg$c51.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c52); }
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c53) {
          s1 = peg$c53;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c54); }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c55();
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 2) === peg$c56) {
            s1 = peg$c56;
            peg$currPos += 2;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c57); }
          }
          if (s1 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c58();
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c59) {
              s1 = peg$c59;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c60); }
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c61();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c62) {
                s1 = peg$c62;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c63); }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                s3 = peg$currPos;
                s4 = peg$parsehexDigit();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsehexDigit();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parsehexDigit();
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parsehexDigit();
                      if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                      } else {
                        peg$currPos = s3;
                        s3 = peg$c2;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c2;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c2;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c2;
                }
                if (s3 !== peg$FAILED) {
                  s3 = input.substring(s2, peg$currPos);
                }
                s2 = s3;
                if (s2 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c64(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parsechars() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsechar();
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parsechar();
        }
      } else {
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c65(s1);
      }
      s0 = s1;

      return s0;
    }

    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse:       parse
  };
})();


},{}],19:[function(require,module,exports){
/* jshint node:true */

'use strict';

var IntlRelativeFormat = require('./lib/main')['default'];

// Add all locale data to `IntlRelativeFormat`. This module will be ignored when
// bundling for the browser with Browserify/Webpack.
require('./lib/locales');

// Re-export `IntlRelativeFormat` as the CommonJS default exports with all the
// locale data registered, and with English set as the default locale. Define
// the `default` prop for use with other compiled ES6 Modules.
exports = module.exports = IntlRelativeFormat;
exports['default'] = exports;

},{"./lib/locales":1,"./lib/main":24}],20:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";
var intl$messageformat$$ = require("intl-messageformat"), src$diff$$ = require("./diff"), src$es5$$ = require("./es5");
exports["default"] = RelativeFormat;

// -----------------------------------------------------------------------------

var FIELDS = ['second', 'minute', 'hour', 'day', 'month', 'year'];
var STYLES = ['best fit', 'numeric'];

// -- RelativeFormat -----------------------------------------------------------

function RelativeFormat(locales, options) {
    options = options || {};

    // Make a copy of `locales` if it's an array, so that it doesn't change
    // since it's used lazily.
    if (src$es5$$.isArray(locales)) {
        locales = locales.concat();
    }

    src$es5$$.defineProperty(this, '_locale', {value: this._resolveLocale(locales)});
    src$es5$$.defineProperty(this, '_options', {value: {
        style: this._resolveStyle(options.style),
        units: this._isValidUnits(options.units) && options.units
    }});

    src$es5$$.defineProperty(this, '_locales', {value: locales});
    src$es5$$.defineProperty(this, '_fields', {value: this._findFields(this._locale)});
    src$es5$$.defineProperty(this, '_messages', {value: src$es5$$.objCreate(null)});

    // "Bind" `format()` method to `this` so it can be passed by reference like
    // the other `Intl` APIs.
    var relativeFormat = this;
    this.format = function format(date, options) {
        return relativeFormat._format(date, options);
    };
}

// Define internal private properties for dealing with locale data.
src$es5$$.defineProperty(RelativeFormat, '__localeData__', {value: src$es5$$.objCreate(null)});
src$es5$$.defineProperty(RelativeFormat, '__addLocaleData', {value: function (data) {
    if (!(data && data.locale)) {
        throw new Error(
            'Locale data provided to IntlRelativeFormat is missing a ' +
            '`locale` property value'
        );
    }

    RelativeFormat.__localeData__[data.locale.toLowerCase()] = data;

    // Add data to IntlMessageFormat.
    intl$messageformat$$["default"].__addLocaleData(data);
}});

// Define public `defaultLocale` property which can be set by the developer, or
// it will be set when the first RelativeFormat instance is created by
// leveraging the resolved locale from `Intl`.
src$es5$$.defineProperty(RelativeFormat, 'defaultLocale', {
    enumerable: true,
    writable  : true,
    value     : undefined
});

// Define public `thresholds` property which can be set by the developer, and
// defaults to relative time thresholds from moment.js.
src$es5$$.defineProperty(RelativeFormat, 'thresholds', {
    enumerable: true,

    value: {
        second: 45,  // seconds to minute
        minute: 45,  // minutes to hour
        hour  : 22,  // hours to day
        day   : 26,  // days to month
        month : 11   // months to year
    }
});

RelativeFormat.prototype.resolvedOptions = function () {
    return {
        locale: this._locale,
        style : this._options.style,
        units : this._options.units
    };
};

RelativeFormat.prototype._compileMessage = function (units) {
    // `this._locales` is the original set of locales the user specified to the
    // constructor, while `this._locale` is the resolved root locale.
    var locales        = this._locales;
    var resolvedLocale = this._locale;

    var field        = this._fields[units];
    var relativeTime = field.relativeTime;
    var future       = '';
    var past         = '';
    var i;

    for (i in relativeTime.future) {
        if (relativeTime.future.hasOwnProperty(i)) {
            future += ' ' + i + ' {' +
                relativeTime.future[i].replace('{0}', '#') + '}';
        }
    }

    for (i in relativeTime.past) {
        if (relativeTime.past.hasOwnProperty(i)) {
            past += ' ' + i + ' {' +
                relativeTime.past[i].replace('{0}', '#') + '}';
        }
    }

    var message = '{when, select, future {{0, plural, ' + future + '}}' +
                                 'past {{0, plural, ' + past + '}}}';

    // Create the synthetic IntlMessageFormat instance using the original
    // locales value specified by the user when constructing the the parent
    // IntlRelativeFormat instance.
    return new intl$messageformat$$["default"](message, locales);
};

RelativeFormat.prototype._getMessage = function (units) {
    var messages = this._messages;

    // Create a new synthetic message based on the locale data from CLDR.
    if (!messages[units]) {
        messages[units] = this._compileMessage(units);
    }

    return messages[units];
};

RelativeFormat.prototype._getRelativeUnits = function (diff, units) {
    var field = this._fields[units];

    if (field.relative) {
        return field.relative[diff];
    }
};

RelativeFormat.prototype._findFields = function (locale) {
    var localeData = RelativeFormat.__localeData__;
    var data       = localeData[locale.toLowerCase()];

    // The locale data is de-duplicated, so we have to traverse the locale's
    // hierarchy until we find `fields` to return.
    while (data) {
        if (data.fields) {
            return data.fields;
        }

        data = data.parentLocale && localeData[data.parentLocale.toLowerCase()];
    }

    throw new Error(
        'Locale data added to IntlRelativeFormat is missing `fields` for :' +
        locale
    );
};

RelativeFormat.prototype._format = function (date, options) {
    var now = options && options.now !== undefined ? options.now : src$es5$$.dateNow();

    if (date === undefined) {
        date = now;
    }

    // Determine if the `date` and optional `now` values are valid, and throw a
    // similar error to what `Intl.DateTimeFormat#format()` would throw.
    if (!isFinite(now)) {
        throw new RangeError(
            'The `now` option provided to IntlRelativeFormat#format() is not ' +
            'in valid range.'
        );
    }

    if (!isFinite(date)) {
        throw new RangeError(
            'The date value provided to IntlRelativeFormat#format() is not ' +
            'in valid range.'
        );
    }

    var diffReport  = src$diff$$["default"](now, date);
    var units       = this._options.units || this._selectUnits(diffReport);
    var diffInUnits = diffReport[units];

    if (this._options.style !== 'numeric') {
        var relativeUnits = this._getRelativeUnits(diffInUnits, units);
        if (relativeUnits) {
            return relativeUnits;
        }
    }

    return this._getMessage(units).format({
        '0' : Math.abs(diffInUnits),
        when: diffInUnits < 0 ? 'past' : 'future'
    });
};

RelativeFormat.prototype._isValidUnits = function (units) {
    if (!units || src$es5$$.arrIndexOf.call(FIELDS, units) >= 0) {
        return true;
    }

    if (typeof units === 'string') {
        var suggestion = /s$/.test(units) && units.substr(0, units.length - 1);
        if (suggestion && src$es5$$.arrIndexOf.call(FIELDS, suggestion) >= 0) {
            throw new Error(
                '"' + units + '" is not a valid IntlRelativeFormat `units` ' +
                'value, did you mean: ' + suggestion
            );
        }
    }

    throw new Error(
        '"' + units + '" is not a valid IntlRelativeFormat `units` value, it ' +
        'must be one of: "' + FIELDS.join('", "') + '"'
    );
};

RelativeFormat.prototype._resolveLocale = function (locales) {
    if (typeof locales === 'string') {
        locales = [locales];
    }

    // Create a copy of the array so we can push on the default locale.
    locales = (locales || []).concat(RelativeFormat.defaultLocale);

    var localeData = RelativeFormat.__localeData__;
    var i, len, localeParts, data;

    // Using the set of locales + the default locale, we look for the first one
    // which that has been registered. When data does not exist for a locale, we
    // traverse its ancestors to find something that's been registered within
    // its hierarchy of locales. Since we lack the proper `parentLocale` data
    // here, we must take a naive approach to traversal.
    for (i = 0, len = locales.length; i < len; i += 1) {
        localeParts = locales[i].toLowerCase().split('-');

        while (localeParts.length) {
            data = localeData[localeParts.join('-')];
            if (data) {
                // Return the normalized locale string; e.g., we return "en-US",
                // instead of "en-us".
                return data.locale;
            }

            localeParts.pop();
        }
    }

    var defaultLocale = locales.pop();
    throw new Error(
        'No locale data has been added to IntlRelativeFormat for: ' +
        locales.join(', ') + ', or the default locale: ' + defaultLocale
    );
};

RelativeFormat.prototype._resolveStyle = function (style) {
    // Default to "best fit" style.
    if (!style) {
        return STYLES[0];
    }

    if (src$es5$$.arrIndexOf.call(STYLES, style) >= 0) {
        return style;
    }

    throw new Error(
        '"' + style + '" is not a valid IntlRelativeFormat `style` value, it ' +
        'must be one of: "' + STYLES.join('", "') + '"'
    );
};

RelativeFormat.prototype._selectUnits = function (diffReport) {
    var i, l, units;

    for (i = 0, l = FIELDS.length; i < l; i += 1) {
        units = FIELDS[i];

        if (Math.abs(diffReport[units]) < RelativeFormat.thresholds[units]) {
            break;
        }
    }

    return units;
};


},{"./diff":21,"./es5":23,"intl-messageformat":10}],21:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";

var round = Math.round;

function daysToYears(days) {
    // 400 years have 146097 days (taking into account leap year rules)
    return days * 400 / 146097;
}

exports["default"] = function (from, to) {
    // Convert to ms timestamps.
    from = +from;
    to   = +to;

    var millisecond = round(to - from),
        second      = round(millisecond / 1000),
        minute      = round(second / 60),
        hour        = round(minute / 60),
        day         = round(hour / 24),
        week        = round(day / 7);

    var rawYears = daysToYears(day),
        month    = round(rawYears * 12),
        year     = round(rawYears);

    return {
        millisecond: millisecond,
        second     : second,
        minute     : minute,
        hour       : hour,
        day        : day,
        week       : week,
        month      : month,
        year       : year
    };
};


},{}],22:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"dup":3}],23:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";

// Purposely using the same implementation as the Intl.js `Intl` polyfill.
// Copyright 2013 Andy Earnshaw, MIT License

var hop = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

var realDefineProp = (function () {
    try { return !!Object.defineProperty({}, 'a', {}); }
    catch (e) { return false; }
})();

var es3 = !realDefineProp && !Object.prototype.__defineGetter__;

var defineProperty = realDefineProp ? Object.defineProperty :
        function (obj, name, desc) {

    if ('get' in desc && obj.__defineGetter__) {
        obj.__defineGetter__(name, desc.get);
    } else if (!hop.call(obj, name) || 'value' in desc) {
        obj[name] = desc.value;
    }
};

var objCreate = Object.create || function (proto, props) {
    var obj, k;

    function F() {}
    F.prototype = proto;
    obj = new F();

    for (k in props) {
        if (hop.call(props, k)) {
            defineProperty(obj, k, props[k]);
        }
    }

    return obj;
};

var arrIndexOf = Array.prototype.indexOf || function (search, fromIndex) {
    /*jshint validthis:true */
    var arr = this;
    if (!arr.length) {
        return -1;
    }

    for (var i = fromIndex || 0, max = arr.length; i < max; i++) {
        if (arr[i] === search) {
            return i;
        }
    }

    return -1;
};

var isArray = Array.isArray || function (obj) {
    return toString.call(obj) === '[object Array]';
};

var dateNow = Date.now || function () {
    return new Date().getTime();
};
exports.defineProperty = defineProperty, exports.objCreate = objCreate, exports.arrIndexOf = arrIndexOf, exports.isArray = isArray, exports.dateNow = dateNow;


},{}],24:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"./core":20,"./en":22,"dup":15}],25:[function(require,module,exports){
/* Copyright Google Inc.
 * Licensed under the Apache Licence Version 2.0
 * Autogenerated at Fri Aug 13 11:26:55 PDT 2010
 * @provides html4
 */
var html4 = {};
html4 .atype = {
    'NONE': 0,
    'URI': 1,
    'URI_FRAGMENT': 11,
    'SCRIPT': 2,
    'STYLE': 3,
    'ID': 4,
    'IDREF': 5,
    'IDREFS': 6,
    'GLOBAL_NAME': 7,
    'LOCAL_NAME': 8,
    'CLASSES': 9,
    'FRAME_TARGET': 10
};
html4 .ATTRIBS = {
    '*::class': 9,
    '*::dir': 0,
    '*::id': 4,
    '*::lang': 0,
    '*::onclick': 2,
    '*::ondblclick': 2,
    '*::onkeydown': 2,
    '*::onkeypress': 2,
    '*::onkeyup': 2,
    '*::onload': 2,
    '*::onmousedown': 2,
    '*::onmousemove': 2,
    '*::onmouseout': 2,
    '*::onmouseover': 2,
    '*::onmouseup': 2,
    '*::style': 3,
    '*::title': 0,
    'a::accesskey': 0,
    'a::coords': 0,
    'a::href': 1,
    'a::hreflang': 0,
    'a::name': 7,
    'a::onblur': 2,
    'a::onfocus': 2,
    'a::rel': 0,
    'a::rev': 0,
    'a::shape': 0,
    'a::tabindex': 0,
    'a::target': 10,
    'a::type': 0,
    'area::accesskey': 0,
    'area::alt': 0,
    'area::coords': 0,
    'area::href': 1,
    'area::nohref': 0,
    'area::onblur': 2,
    'area::onfocus': 2,
    'area::shape': 0,
    'area::tabindex': 0,
    'area::target': 10,
    'bdo::dir': 0,
    'blockquote::cite': 1,
    'br::clear': 0,
    'button::accesskey': 0,
    'button::disabled': 0,
    'button::name': 8,
    'button::onblur': 2,
    'button::onfocus': 2,
    'button::tabindex': 0,
    'button::type': 0,
    'button::value': 0,
    'caption::align': 0,
    'col::align': 0,
    'col::char': 0,
    'col::charoff': 0,
    'col::span': 0,
    'col::valign': 0,
    'col::width': 0,
    'colgroup::align': 0,
    'colgroup::char': 0,
    'colgroup::charoff': 0,
    'colgroup::span': 0,
    'colgroup::valign': 0,
    'colgroup::width': 0,
    'del::cite': 1,
    'del::datetime': 0,
    'dir::compact': 0,
    'div::align': 0,
    'dl::compact': 0,
    'font::color': 0,
    'font::face': 0,
    'font::size': 0,
    'form::accept': 0,
    'form::action': 1,
    'form::autocomplete': 0,
    'form::enctype': 0,
    'form::method': 0,
    'form::name': 7,
    'form::onreset': 2,
    'form::onsubmit': 2,
    'form::target': 10,
    'h1::align': 0,
    'h2::align': 0,
    'h3::align': 0,
    'h4::align': 0,
    'h5::align': 0,
    'h6::align': 0,
    'hr::align': 0,
    'hr::noshade': 0,
    'hr::size': 0,
    'hr::width': 0,
    'iframe::align': 0,
    'iframe::frameborder': 0,
    'iframe::height': 0,
    'iframe::marginheight': 0,
    'iframe::marginwidth': 0,
    'iframe::width': 0,
    'img::align': 0,
    'img::alt': 0,
    'img::border': 0,
    'img::height': 0,
    'img::hspace': 0,
    'img::ismap': 0,
    'img::name': 7,
    'img::src': 1,
    'img::usemap': 11,
    'img::vspace': 0,
    'img::width': 0,
    'input::accept': 0,
    'input::accesskey': 0,
    'input::align': 0,
    'input::alt': 0,
    'input::autocomplete': 0,
    'input::checked': 0,
    'input::disabled': 0,
    'input::ismap': 0,
    'input::maxlength': 0,
    'input::name': 8,
    'input::onblur': 2,
    'input::onchange': 2,
    'input::onfocus': 2,
    'input::onselect': 2,
    'input::readonly': 0,
    'input::size': 0,
    'input::src': 1,
    'input::tabindex': 0,
    'input::type': 0,
    'input::usemap': 11,
    'input::value': 0,
    'ins::cite': 1,
    'ins::datetime': 0,
    'label::accesskey': 0,
    'label::for': 5,
    'label::onblur': 2,
    'label::onfocus': 2,
    'legend::accesskey': 0,
    'legend::align': 0,
    'li::type': 0,
    'li::value': 0,
    'map::name': 7,
    'menu::compact': 0,
    'ol::compact': 0,
    'ol::start': 0,
    'ol::type': 0,
    'optgroup::disabled': 0,
    'optgroup::label': 0,
    'option::disabled': 0,
    'option::label': 0,
    'option::selected': 0,
    'option::value': 0,
    'p::align': 0,
    'pre::width': 0,
    'q::cite': 1,
    'select::disabled': 0,
    'select::multiple': 0,
    'select::name': 8,
    'select::onblur': 2,
    'select::onchange': 2,
    'select::onfocus': 2,
    'select::size': 0,
    'select::tabindex': 0,
    'table::align': 0,
    'table::bgcolor': 0,
    'table::border': 0,
    'table::cellpadding': 0,
    'table::cellspacing': 0,
    'table::frame': 0,
    'table::rules': 0,
    'table::summary': 0,
    'table::width': 0,
    'tbody::align': 0,
    'tbody::char': 0,
    'tbody::charoff': 0,
    'tbody::valign': 0,
    'td::abbr': 0,
    'td::align': 0,
    'td::axis': 0,
    'td::bgcolor': 0,
    'td::char': 0,
    'td::charoff': 0,
    'td::colspan': 0,
    'td::headers': 6,
    'td::height': 0,
    'td::nowrap': 0,
    'td::rowspan': 0,
    'td::scope': 0,
    'td::valign': 0,
    'td::width': 0,
    'textarea::accesskey': 0,
    'textarea::cols': 0,
    'textarea::disabled': 0,
    'textarea::name': 8,
    'textarea::onblur': 2,
    'textarea::onchange': 2,
    'textarea::onfocus': 2,
    'textarea::onselect': 2,
    'textarea::readonly': 0,
    'textarea::rows': 0,
    'textarea::tabindex': 0,
    'tfoot::align': 0,
    'tfoot::char': 0,
    'tfoot::charoff': 0,
    'tfoot::valign': 0,
    'th::abbr': 0,
    'th::align': 0,
    'th::axis': 0,
    'th::bgcolor': 0,
    'th::char': 0,
    'th::charoff': 0,
    'th::colspan': 0,
    'th::headers': 6,
    'th::height': 0,
    'th::nowrap': 0,
    'th::rowspan': 0,
    'th::scope': 0,
    'th::valign': 0,
    'th::width': 0,
    'thead::align': 0,
    'thead::char': 0,
    'thead::charoff': 0,
    'thead::valign': 0,
    'tr::align': 0,
    'tr::bgcolor': 0,
    'tr::char': 0,
    'tr::charoff': 0,
    'tr::valign': 0,
    'ul::compact': 0,
    'ul::type': 0
};
html4 .eflags = {
    'OPTIONAL_ENDTAG': 1,
    'EMPTY': 2,
    'CDATA': 4,
    'RCDATA': 8,
    'UNSAFE': 16,
    'FOLDABLE': 32,
    'SCRIPT': 64,
    'STYLE': 128
};
html4 .ELEMENTS = {
    'a': 0,
    'abbr': 0,
    'acronym': 0,
    'address': 0,
    'applet': 16,
    'area': 2,
    'b': 0,
    'base': 18,
    'basefont': 18,
    'bdo': 0,
    'big': 0,
    'blockquote': 0,
    'body': 49,
    'br': 2,
    'button': 0,
    'caption': 0,
    'center': 0,
    'cite': 0,
    'code': 0,
    'col': 2,
    'colgroup': 1,
    'dd': 1,
    'del': 0,
    'dfn': 0,
    'dir': 0,
    'div': 0,
    'dl': 0,
    'dt': 1,
    'em': 0,
    'fieldset': 0,
    'font': 0,
    'form': 0,
    'frame': 18,
    'frameset': 16,
    'h1': 0,
    'h2': 0,
    'h3': 0,
    'h4': 0,
    'h5': 0,
    'h6': 0,
    'head': 49,
    'hr': 2,
    'html': 49,
    'i': 0,
    'iframe': 4,
    'img': 2,
    'input': 2,
    'ins': 0,
    'isindex': 18,
    'kbd': 0,
    'label': 0,
    'legend': 0,
    'li': 1,
    'link': 18,
    'map': 0,
    'menu': 0,
    'meta': 18,
    'noframes': 20,
    'noscript': 20,
    'object': 16,
    'ol': 0,
    'optgroup': 0,
    'option': 1,
    'p': 1,
    'param': 18,
    'pre': 0,
    'q': 0,
    's': 0,
    'samp': 0,
    'script': 84,
    'select': 0,
    'small': 0,
    'span': 0,
    'strike': 0,
    'strong': 0,
    'style': 148,
    'sub': 0,
    'sup': 0,
    'table': 0,
    'tbody': 1,
    'td': 1,
    'textarea': 8,
    'tfoot': 1,
    'th': 1,
    'thead': 1,
    'title': 24,
    'tr': 1,
    'tt': 0,
    'u': 0,
    'ul': 0,
    'var': 0
};

html4 .URIEFFECTS = {

};
html4 .LOADERTYPES = {}

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = html4;
    }
    exports.URI = html4;
} else {

    // Exports for closure compiler.
    if (typeof window !== 'undefined') {
        window['html4'] = html4;
    }
}

},{}],26:[function(require,module,exports){
// Copyright (C) 2010 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview
 * Implements RFC 3986 for parsing/formatting URIs.
 *
 * @author mikesamuel@gmail.com
 * \@provides URI
 * \@overrides window
 */

var URI = (function () {

    /**
     * creates a uri from the string form.  The parser is relaxed, so special
     * characters that aren't escaped but don't cause ambiguities will not cause
     * parse failures.
     *
     * @return {URI|null}
     */
    function parse(uriStr) {
        var m = ('' + uriStr).match(URI_RE_);
        if (!m) { return null; }
        return new URI(
            nullIfAbsent(m[1]),
            nullIfAbsent(m[2]),
            nullIfAbsent(m[3]),
            nullIfAbsent(m[4]),
            nullIfAbsent(m[5]),
            nullIfAbsent(m[6]),
            nullIfAbsent(m[7]));
    }


    /**
     * creates a uri from the given parts.
     *
     * @param scheme {string} an unencoded scheme such as "http" or null
     * @param credentials {string} unencoded user credentials or null
     * @param domain {string} an unencoded domain name or null
     * @param port {number} a port number in [1, 32768].
     *    -1 indicates no port, as does null.
     * @param path {string} an unencoded path
     * @param query {Array.<string>|string|null} a list of unencoded cgi
     *   parameters where even values are keys and odds the corresponding values
     *   or an unencoded query.
     * @param fragment {string} an unencoded fragment without the "#" or null.
     * @return {URI}
     */
    function create(scheme, credentials, domain, port, path, query, fragment) {
        var uri = new URI(
            encodeIfExists2(scheme, URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_),
            encodeIfExists2(
                credentials, URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_),
            encodeIfExists(domain),
            port > 0 ? port.toString() : null,
            encodeIfExists2(path, URI_DISALLOWED_IN_PATH_),
            null,
            encodeIfExists(fragment));
        if (query) {
            if ('string' === typeof query) {
                uri.setRawQuery(query.replace(/[^?&=0-9A-Za-z_\-~.%]/g, encodeOne));
            } else {
                uri.setAllParameters(query);
            }
        }
        return uri;
    }
    function encodeIfExists(unescapedPart) {
        if ('string' == typeof unescapedPart) {
            return encodeURIComponent(unescapedPart);
        }
        return null;
    };
    /**
     * if unescapedPart is non null, then escapes any characters in it that aren't
     * valid characters in a url and also escapes any special characters that
     * appear in extra.
     *
     * @param unescapedPart {string}
     * @param extra {RegExp} a character set of characters in [\01-\177].
     * @return {string|null} null iff unescapedPart == null.
     */
    function encodeIfExists2(unescapedPart, extra) {
        if ('string' == typeof unescapedPart) {
            return encodeURI(unescapedPart).replace(extra, encodeOne);
        }
        return null;
    };
    /** converts a character in [\01-\177] to its url encoded equivalent. */
    function encodeOne(ch) {
        var n = ch.charCodeAt(0);
        return '%' + '0123456789ABCDEF'.charAt((n >> 4) & 0xf) +
            '0123456789ABCDEF'.charAt(n & 0xf);
    }

    /**
     * {@updoc
     *  $ normPath('foo/./bar')
     *  # 'foo/bar'
     *  $ normPath('./foo')
     *  # 'foo'
     *  $ normPath('foo/.')
     *  # 'foo'
     *  $ normPath('foo//bar')
     *  # 'foo/bar'
     * }
     */
    function normPath(path) {
        return path.replace(/(^|\/)\.(?:\/|$)/g, '$1').replace(/\/{2,}/g, '/');
    }

    var PARENT_DIRECTORY_HANDLER = new RegExp(
        ''
            // A path break
            + '(/|^)'
            // followed by a non .. path element
            // (cannot be . because normPath is used prior to this RegExp)
            + '(?:[^./][^/]*|\\.{2,}(?:[^./][^/]*)|\\.{3,}[^/]*)'
            // followed by .. followed by a path break.
            + '/\\.\\.(?:/|$)');

    var PARENT_DIRECTORY_HANDLER_RE = new RegExp(PARENT_DIRECTORY_HANDLER);

    var EXTRA_PARENT_PATHS_RE = /^(?:\.\.\/)*(?:\.\.$)?/;

    /**
     * Normalizes its input path and collapses all . and .. sequences except for
     * .. sequences that would take it above the root of the current parent
     * directory.
     * {@updoc
     *  $ collapse_dots('foo/../bar')
     *  # 'bar'
     *  $ collapse_dots('foo/./bar')
     *  # 'foo/bar'
     *  $ collapse_dots('foo/../bar/./../../baz')
     *  # 'baz'
     *  $ collapse_dots('../foo')
     *  # '../foo'
     *  $ collapse_dots('../foo').replace(EXTRA_PARENT_PATHS_RE, '')
     *  # 'foo'
     * }
     */
    function collapse_dots(path) {
        if (path === null) { return null; }
        var p = normPath(path);
        // Only /../ left to flatten
        var r = PARENT_DIRECTORY_HANDLER_RE;
        // We replace with $1 which matches a / before the .. because this
        // guarantees that:
        // (1) we have at most 1 / between the adjacent place,
        // (2) always have a slash if there is a preceding path section, and
        // (3) we never turn a relative path into an absolute path.
        for (var q; (q = p.replace(r, '$1')) != p; p = q) {};
        return p;
    }

    /**
     * resolves a relative url string to a base uri.
     * @return {URI}
     */
    function resolve(baseUri, relativeUri) {
        // there are several kinds of relative urls:
        // 1. //foo - replaces everything from the domain on.  foo is a domain name
        // 2. foo - replaces the last part of the path, the whole query and fragment
        // 3. /foo - replaces the the path, the query and fragment
        // 4. ?foo - replace the query and fragment
        // 5. #foo - replace the fragment only

        var absoluteUri = baseUri.clone();
        // we satisfy these conditions by looking for the first part of relativeUri
        // that is not blank and applying defaults to the rest

        var overridden = relativeUri.hasScheme();

        if (overridden) {
            absoluteUri.setRawScheme(relativeUri.getRawScheme());
        } else {
            overridden = relativeUri.hasCredentials();
        }

        if (overridden) {
            absoluteUri.setRawCredentials(relativeUri.getRawCredentials());
        } else {
            overridden = relativeUri.hasDomain();
        }

        if (overridden) {
            absoluteUri.setRawDomain(relativeUri.getRawDomain());
        } else {
            overridden = relativeUri.hasPort();
        }

        var rawPath = relativeUri.getRawPath();
        var simplifiedPath = collapse_dots(rawPath);
        if (overridden) {
            absoluteUri.setPort(relativeUri.getPort());
            simplifiedPath = simplifiedPath
                && simplifiedPath.replace(EXTRA_PARENT_PATHS_RE, '');
        } else {
            overridden = !!rawPath;
            if (overridden) {
                // resolve path properly
                if (simplifiedPath.charCodeAt(0) !== 0x2f /* / */) {  // path is relative
                    var absRawPath = collapse_dots(absoluteUri.getRawPath() || '')
                        .replace(EXTRA_PARENT_PATHS_RE, '');
                    var slash = absRawPath.lastIndexOf('/') + 1;
                    simplifiedPath = collapse_dots(
                        (slash ? absRawPath.substring(0, slash) : '')
                            + collapse_dots(rawPath))
                        .replace(EXTRA_PARENT_PATHS_RE, '');
                }
            } else {
                simplifiedPath = simplifiedPath
                    && simplifiedPath.replace(EXTRA_PARENT_PATHS_RE, '');
                if (simplifiedPath !== rawPath) {
                    absoluteUri.setRawPath(simplifiedPath);
                }
            }
        }

        if (overridden) {
            absoluteUri.setRawPath(simplifiedPath);
        } else {
            overridden = relativeUri.hasQuery();
        }

        if (overridden) {
            absoluteUri.setRawQuery(relativeUri.getRawQuery());
        } else {
            overridden = relativeUri.hasFragment();
        }

        if (overridden) {
            absoluteUri.setRawFragment(relativeUri.getRawFragment());
        }

        return absoluteUri;
    }

    /**
     * a mutable URI.
     *
     * This class contains setters and getters for the parts of the URI.
     * The <tt>getXYZ</tt>/<tt>setXYZ</tt> methods return the decoded part -- so
     * <code>uri.parse('/foo%20bar').getPath()</code> will return the decoded path,
     * <tt>/foo bar</tt>.
     *
     * <p>The raw versions of fields are available too.
     * <code>uri.parse('/foo%20bar').getRawPath()</code> will return the raw path,
     * <tt>/foo%20bar</tt>.  Use the raw setters with care, since
     * <code>URI::toString</code> is not guaranteed to return a valid url if a
     * raw setter was used.
     *
     * <p>All setters return <tt>this</tt> and so may be chained, a la
     * <code>uri.parse('/foo').setFragment('part').toString()</code>.
     *
     * <p>You should not use this constructor directly -- please prefer the factory
     * functions {@link uri.parse}, {@link uri.create}, {@link uri.resolve}
     * instead.</p>
     *
     * <p>The parameters are all raw (assumed to be properly escaped) parts, and
     * any (but not all) may be null.  Undefined is not allowed.</p>
     *
     * @constructor
     */
    function URI(
        rawScheme,
        rawCredentials, rawDomain, port,
        rawPath, rawQuery, rawFragment) {
        this.scheme_ = rawScheme;
        this.credentials_ = rawCredentials;
        this.domain_ = rawDomain;
        this.port_ = port;
        this.path_ = rawPath;
        this.query_ = rawQuery;
        this.fragment_ = rawFragment;
        /**
         * @type {Array|null}
         */
        this.paramCache_ = null;
    }

    /** returns the string form of the url. */
    URI.prototype.toString = function () {
        var out = [];
        if (null !== this.scheme_) { out.push(this.scheme_, ':'); }
        if (null !== this.domain_) {
            out.push('//');
            if (null !== this.credentials_) { out.push(this.credentials_, '@'); }
            out.push(this.domain_);
            if (null !== this.port_) { out.push(':', this.port_.toString()); }
        }
        if (null !== this.path_) { out.push(this.path_); }
        if (null !== this.query_) { out.push('?', this.query_); }
        if (null !== this.fragment_) { out.push('#', this.fragment_); }
        return out.join('');
    };

    URI.prototype.clone = function () {
        return new URI(this.scheme_, this.credentials_, this.domain_, this.port_,
            this.path_, this.query_, this.fragment_);
    };

    URI.prototype.getScheme = function () {
        // HTML5 spec does not require the scheme to be lowercased but
        // all common browsers except Safari lowercase the scheme.
        return this.scheme_ && decodeURIComponent(this.scheme_).toLowerCase();
    };
    URI.prototype.getRawScheme = function () {
        return this.scheme_;
    };
    URI.prototype.setScheme = function (newScheme) {
        this.scheme_ = encodeIfExists2(
            newScheme, URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_);
        return this;
    };
    URI.prototype.setRawScheme = function (newScheme) {
        this.scheme_ = newScheme ? newScheme : null;
        return this;
    };
    URI.prototype.hasScheme = function () {
        return null !== this.scheme_;
    };


    URI.prototype.getCredentials = function () {
        return this.credentials_ && decodeURIComponent(this.credentials_);
    };
    URI.prototype.getRawCredentials = function () {
        return this.credentials_;
    };
    URI.prototype.setCredentials = function (newCredentials) {
        this.credentials_ = encodeIfExists2(
            newCredentials, URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_);

        return this;
    };
    URI.prototype.setRawCredentials = function (newCredentials) {
        this.credentials_ = newCredentials ? newCredentials : null;
        return this;
    };
    URI.prototype.hasCredentials = function () {
        return null !== this.credentials_;
    };


    URI.prototype.getDomain = function () {
        return this.domain_ && decodeURIComponent(this.domain_);
    };
    URI.prototype.getRawDomain = function () {
        return this.domain_;
    };
    URI.prototype.setDomain = function (newDomain) {
        return this.setRawDomain(newDomain && encodeURIComponent(newDomain));
    };
    URI.prototype.setRawDomain = function (newDomain) {
        this.domain_ = newDomain ? newDomain : null;
        // Maintain the invariant that paths must start with a slash when the URI
        // is not path-relative.
        return this.setRawPath(this.path_);
    };
    URI.prototype.hasDomain = function () {
        return null !== this.domain_;
    };


    URI.prototype.getPort = function () {
        return this.port_ && decodeURIComponent(this.port_);
    };
    URI.prototype.setPort = function (newPort) {
        if (newPort) {
            newPort = Number(newPort);
            if (newPort !== (newPort & 0xffff)) {
                throw new Error('Bad port number ' + newPort);
            }
            this.port_ = '' + newPort;
        } else {
            this.port_ = null;
        }
        return this;
    };
    URI.prototype.hasPort = function () {
        return null !== this.port_;
    };


    URI.prototype.getPath = function () {
        return this.path_ && decodeURIComponent(this.path_);
    };
    URI.prototype.getRawPath = function () {
        return this.path_;
    };
    URI.prototype.setPath = function (newPath) {
        return this.setRawPath(encodeIfExists2(newPath, URI_DISALLOWED_IN_PATH_));
    };
    URI.prototype.setRawPath = function (newPath) {
        if (newPath) {
            newPath = String(newPath);
            this.path_ =
                // Paths must start with '/' unless this is a path-relative URL.
                (!this.domain_ || /^\//.test(newPath)) ? newPath : '/' + newPath;
        } else {
            this.path_ = null;
        }
        return this;
    };
    URI.prototype.hasPath = function () {
        return null !== this.path_;
    };


    URI.prototype.getQuery = function () {
        // From http://www.w3.org/Addressing/URL/4_URI_Recommentations.html
        // Within the query string, the plus sign is reserved as shorthand notation
        // for a space.
        return this.query_ && decodeURIComponent(this.query_).replace(/\+/g, ' ');
    };
    URI.prototype.getRawQuery = function () {
        return this.query_;
    };
    URI.prototype.setQuery = function (newQuery) {
        this.paramCache_ = null;
        this.query_ = encodeIfExists(newQuery);
        return this;
    };
    URI.prototype.setRawQuery = function (newQuery) {
        this.paramCache_ = null;
        this.query_ = newQuery ? newQuery : null;
        return this;
    };
    URI.prototype.hasQuery = function () {
        return null !== this.query_;
    };

    /**
     * sets the query given a list of strings of the form
     * [ key0, value0, key1, value1, ... ].
     *
     * <p><code>uri.setAllParameters(['a', 'b', 'c', 'd']).getQuery()</code>
     * will yield <code>'a=b&c=d'</code>.
     */
    URI.prototype.setAllParameters = function (params) {
        if (typeof params === 'object') {
            if (!(params instanceof Array)
                && (params instanceof Object
                || Object.prototype.toString.call(params) !== '[object Array]')) {
                var newParams = [];
                var i = -1;
                for (var k in params) {
                    var v = params[k];
                    if ('string' === typeof v) {
                        newParams[++i] = k;
                        newParams[++i] = v;
                    }
                }
                params = newParams;
            }
        }
        this.paramCache_ = null;
        var queryBuf = [];
        var separator = '';
        for (var j = 0; j < params.length;) {
            var k = params[j++];
            var v = params[j++];
            queryBuf.push(separator, encodeURIComponent(k.toString()));
            separator = '&';
            if (v) {
                queryBuf.push('=', encodeURIComponent(v.toString()));
            }
        }
        this.query_ = queryBuf.join('');
        return this;
    };
    URI.prototype.checkParameterCache_ = function () {
        if (!this.paramCache_) {
            var q = this.query_;
            if (!q) {
                this.paramCache_ = [];
            } else {
                var cgiParams = q.split(/[&\?]/);
                var out = [];
                var k = -1;
                for (var i = 0; i < cgiParams.length; ++i) {
                    var m = cgiParams[i].match(/^([^=]*)(?:=(.*))?$/);
                    // From http://www.w3.org/Addressing/URL/4_URI_Recommentations.html
                    // Within the query string, the plus sign is reserved as shorthand
                    // notation for a space.
                    out[++k] = decodeURIComponent(m[1]).replace(/\+/g, ' ');
                    out[++k] = decodeURIComponent(m[2] || '').replace(/\+/g, ' ');
                }
                this.paramCache_ = out;
            }
        }
    };
    /**
     * sets the values of the named cgi parameters.
     *
     * <p>So, <code>uri.parse('foo?a=b&c=d&e=f').setParameterValues('c', ['new'])
     * </code> yields <tt>foo?a=b&c=new&e=f</tt>.</p>
     *
     * @param key {string}
     * @param values {Array.<string>} the new values.  If values is a single string
     *   then it will be treated as the sole value.
     */
    URI.prototype.setParameterValues = function (key, values) {
        // be nice and avoid subtle bugs where [] operator on string performs charAt
        // on some browsers and crashes on IE
        if (typeof values === 'string') {
            values = [ values ];
        }

        this.checkParameterCache_();
        var newValueIndex = 0;
        var pc = this.paramCache_;
        var params = [];
        for (var i = 0, k = 0; i < pc.length; i += 2) {
            if (key === pc[i]) {
                if (newValueIndex < values.length) {
                    params.push(key, values[newValueIndex++]);
                }
            } else {
                params.push(pc[i], pc[i + 1]);
            }
        }
        while (newValueIndex < values.length) {
            params.push(key, values[newValueIndex++]);
        }
        this.setAllParameters(params);
        return this;
    };
    URI.prototype.removeParameter = function (key) {
        return this.setParameterValues(key, []);
    };
    /**
     * returns the parameters specified in the query part of the uri as a list of
     * keys and values like [ key0, value0, key1, value1, ... ].
     *
     * @return {Array.<string>}
     */
    URI.prototype.getAllParameters = function () {
        this.checkParameterCache_();
        return this.paramCache_.slice(0, this.paramCache_.length);
    };
    /**
     * returns the value<b>s</b> for a given cgi parameter as a list of decoded
     * query parameter values.
     * @return {Array.<string>}
     */
    URI.prototype.getParameterValues = function (paramNameUnescaped) {
        this.checkParameterCache_();
        var values = [];
        for (var i = 0; i < this.paramCache_.length; i += 2) {
            if (paramNameUnescaped === this.paramCache_[i]) {
                values.push(this.paramCache_[i + 1]);
            }
        }
        return values;
    };
    /**
     * returns a map of cgi parameter names to (non-empty) lists of values.
     * @return {Object.<string,Array.<string>>}
     */
    URI.prototype.getParameterMap = function (paramNameUnescaped) {
        this.checkParameterCache_();
        var paramMap = {};
        for (var i = 0; i < this.paramCache_.length; i += 2) {
            var key = this.paramCache_[i++],
                value = this.paramCache_[i++];
            if (!(key in paramMap)) {
                paramMap[key] = [value];
            } else {
                paramMap[key].push(value);
            }
        }
        return paramMap;
    };
    /**
     * returns the first value for a given cgi parameter or null if the given
     * parameter name does not appear in the query string.
     * If the given parameter name does appear, but has no '<tt>=</tt>' following
     * it, then the empty string will be returned.
     * @return {string|null}
     */
    URI.prototype.getParameterValue = function (paramNameUnescaped) {
        this.checkParameterCache_();
        for (var i = 0; i < this.paramCache_.length; i += 2) {
            if (paramNameUnescaped === this.paramCache_[i]) {
                return this.paramCache_[i + 1];
            }
        }
        return null;
    };

    URI.prototype.getFragment = function () {
        return this.fragment_ && decodeURIComponent(this.fragment_);
    };
    URI.prototype.getRawFragment = function () {
        return this.fragment_;
    };
    URI.prototype.setFragment = function (newFragment) {
        this.fragment_ = newFragment ? encodeURIComponent(newFragment) : null;
        return this;
    };
    URI.prototype.setRawFragment = function (newFragment) {
        this.fragment_ = newFragment ? newFragment : null;
        return this;
    };
    URI.prototype.hasFragment = function () {
        return null !== this.fragment_;
    };

    function nullIfAbsent(matchPart) {
        return ('string' == typeof matchPart) && (matchPart.length > 0)
            ? matchPart
            : null;
    }




    /**
     * a regular expression for breaking a URI into its component parts.
     *
     * <p>http://www.gbiv.com/protocols/uri/rfc/rfc3986.html#RFC2234 says
     * As the "first-match-wins" algorithm is identical to the "greedy"
     * disambiguation method used by POSIX regular expressions, it is natural and
     * commonplace to use a regular expression for parsing the potential five
     * components of a URI reference.
     *
     * <p>The following line is the regular expression for breaking-down a
     * well-formed URI reference into its components.
     *
     * <pre>
     * ^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?
     *  12            3  4          5       6  7        8 9
     * </pre>
     *
     * <p>The numbers in the second line above are only to assist readability; they
     * indicate the reference points for each subexpression (i.e., each paired
     * parenthesis). We refer to the value matched for subexpression <n> as $<n>.
     * For example, matching the above expression to
     * <pre>
     *     http://www.ics.uci.edu/pub/ietf/uri/#Related
     * </pre>
     * results in the following subexpression matches:
     * <pre>
     *    $1 = http:
     *    $2 = http
     *    $3 = //www.ics.uci.edu
     *    $4 = www.ics.uci.edu
     *    $5 = /pub/ietf/uri/
     *    $6 = <undefined>
     *    $7 = <undefined>
     *    $8 = #Related
     *    $9 = Related
     * </pre>
     * where <undefined> indicates that the component is not present, as is the
     * case for the query component in the above example. Therefore, we can
     * determine the value of the five components as
     * <pre>
     *    scheme    = $2
     *    authority = $4
     *    path      = $5
     *    query     = $7
     *    fragment  = $9
     * </pre>
     *
     * <p>msamuel: I have modified the regular expression slightly to expose the
     * credentials, domain, and port separately from the authority.
     * The modified version yields
     * <pre>
     *    $1 = http              scheme
     *    $2 = <undefined>       credentials -\
     *    $3 = www.ics.uci.edu   domain       | authority
     *    $4 = <undefined>       port        -/
     *    $5 = /pub/ietf/uri/    path
     *    $6 = <undefined>       query without ?
     *    $7 = Related           fragment without #
     * </pre>
     */
    var URI_RE_ = new RegExp(
        "^" +
            "(?:" +
            "([^:/?#]+)" +         // scheme
            ":)?" +
            "(?://" +
            "(?:([^/?#]*)@)?" +    // credentials
            "([^/?#:@]*)" +        // domain
            "(?::([0-9]+))?" +     // port
            ")?" +
            "([^?#]+)?" +            // path
            "(?:\\?([^#]*))?" +      // query
            "(?:#(.*))?" +           // fragment
            "$"
    );

    var URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_ = /[#\/\?@]/g;
    var URI_DISALLOWED_IN_PATH_ = /[\#\?]/g;

    URI.parse = parse;
    URI.create = create;
    URI.resolve = resolve;
    URI.collapse_dots = collapse_dots;  // Visible for testing.

// lightweight string-based api for loadModuleMaker
    URI.utils = {
        mimeTypeOf: function (uri) {
            var uriObj = parse(uri);
            if (/\.html$/.test(uriObj.getPath())) {
                return 'text/html';
            } else {
                return 'application/javascript';
            }
        },
        resolve: function (base, uri) {
            if (base) {
                return resolve(parse(base), parse(uri)).toString();
            } else {
                return '' + uri;
            }
        }
    };


    return URI;
})();

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = URI;
    }
    exports.URI = URI;
} else {

    // Exports for closure compiler.
    if (typeof window !== 'undefined') {
        window['URI'] = URI;
    }
}

},{}],27:[function(require,module,exports){
var html4 = require("./lib/html4.js");
var URI = require("./lib/uri.js");

// Copyright (C) 2006 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview
 * An HTML sanitizer that can satisfy a variety of security policies.
 *
 * <p>
 * The HTML sanitizer is built around a SAX parser and HTML element and
 * attributes schemas.
 *
 * If the cssparser is loaded, inline styles are sanitized using the
 * css property and value schemas.  Else they are remove during
 * sanitization.
 *
 * If it exists, uses parseCssDeclarations, sanitizeCssProperty,  cssSchema
 *
 * @author mikesamuel@gmail.com
 * @author jasvir@gmail.com
 * \@requires html4, URI
 * \@overrides window
 * \@provides html, html_sanitize
 */

// The Turkish i seems to be a non-issue, but abort in case it is.
if ('I'.toLowerCase() !== 'i') { throw 'I/i problem'; }

/**
 * \@namespace
 */
var html = (function(html4) {

    // For closure compiler
    var parseCssDeclarations, sanitizeCssProperty, cssSchema;
    if ('undefined' !== typeof window) {
        parseCssDeclarations = window['parseCssDeclarations'];
        sanitizeCssProperty = window['sanitizeCssProperty'];
        cssSchema = window['cssSchema'];
    }

    // The keys of this object must be 'quoted' or JSCompiler will mangle them!
    // This is a partial list -- lookupEntity() uses the host browser's parser
    // (when available) to implement full entity lookup.
    // Note that entities are in general case-sensitive; the uppercase ones are
    // explicitly defined by HTML5 (presumably as compatibility).
    var ENTITIES = {
        'lt': '<',
        'LT': '<',
        'gt': '>',
        'GT': '>',
        'amp': '&',
        'AMP': '&',
        'quot': '"',
        'apos': '\'',
        'nbsp': '\u00a0'
    };

    // Patterns for types of entity/character reference names.
    var decimalEscapeRe = /^#(\d+)$/;
    var hexEscapeRe = /^#x([0-9A-Fa-f]+)$/;
    // contains every entity per http://www.w3.org/TR/2011/WD-html5-20110113/named-character-references.html
    var safeEntityNameRe = /^[A-Za-z][A-za-z0-9]+$/;
    // Used as a hook to invoke the browser's entity parsing. <textarea> is used
    // because its content is parsed for entities but not tags.
    // TODO(kpreid): This retrieval is a kludge and leads to silent loss of
    // functionality if the document isn't available.
    var entityLookupElement =
        ('undefined' !== typeof window && window['document'])
            ? window['document'].createElement('textarea') : null;
    /**
     * Decodes an HTML entity.
     *
     * {\@updoc
     * $ lookupEntity('lt')
     * # '<'
     * $ lookupEntity('GT')
     * # '>'
     * $ lookupEntity('amp')
     * # '&'
     * $ lookupEntity('nbsp')
     * # '\xA0'
     * $ lookupEntity('apos')
     * # "'"
     * $ lookupEntity('quot')
     * # '"'
     * $ lookupEntity('#xa')
     * # '\n'
     * $ lookupEntity('#10')
     * # '\n'
     * $ lookupEntity('#x0a')
     * # '\n'
     * $ lookupEntity('#010')
     * # '\n'
     * $ lookupEntity('#x00A')
     * # '\n'
     * $ lookupEntity('Pi')      // Known failure
     * # '\u03A0'
     * $ lookupEntity('pi')      // Known failure
     * # '\u03C0'
     * }
     *
     * @param {string} name the content between the '&' and the ';'.
     * @return {string} a single unicode code-point as a string.
     */
    function lookupEntity(name) {
        // TODO: entity lookup as specified by HTML5 actually depends on the
        // presence of the ";".
        if (ENTITIES.hasOwnProperty(name)) { return ENTITIES[name]; }
        var m = name.match(decimalEscapeRe);
        if (m) {
            return String.fromCharCode(parseInt(m[1], 10));
        } else if (!!(m = name.match(hexEscapeRe))) {
            return String.fromCharCode(parseInt(m[1], 16));
        } else if (entityLookupElement && safeEntityNameRe.test(name)) {
            entityLookupElement.innerHTML = '&' + name + ';';
            var text = entityLookupElement.textContent;
            ENTITIES[name] = text;
            return text;
        } else {
            return '&' + name + ';';
        }
    }

    function decodeOneEntity(_, name) {
        return lookupEntity(name);
    }

    var nulRe = /\0/g;
    function stripNULs(s) {
        return s.replace(nulRe, '');
    }

    var ENTITY_RE_1 = /&(#[0-9]+|#[xX][0-9A-Fa-f]+|\w+);/g;
    var ENTITY_RE_2 = /^(#[0-9]+|#[xX][0-9A-Fa-f]+|\w+);/;
    /**
     * The plain text of a chunk of HTML CDATA which possibly containing.
     *
     * {\@updoc
     * $ unescapeEntities('')
     * # ''
     * $ unescapeEntities('hello World!')
     * # 'hello World!'
     * $ unescapeEntities('1 &lt; 2 &amp;&AMP; 4 &gt; 3&#10;')
     * # '1 < 2 && 4 > 3\n'
     * $ unescapeEntities('&lt;&lt <- unfinished entity&gt;')
     * # '<&lt <- unfinished entity>'
     * $ unescapeEntities('/foo?bar=baz&copy=true')  // & often unescaped in URLS
     * # '/foo?bar=baz&copy=true'
     * $ unescapeEntities('pi=&pi;&#x3c0;, Pi=&Pi;\u03A0') // FIXME: known failure
     * # 'pi=\u03C0\u03c0, Pi=\u03A0\u03A0'
     * }
     *
     * @param {string} s a chunk of HTML CDATA.  It must not start or end inside
     *     an HTML entity.
     */
    function unescapeEntities(s) {
	if(s) {
	    return s.replace(ENTITY_RE_1, decodeOneEntity);
	}
	else {
	    return s;
	}
    }

    var ampRe = /&/g;
    var looseAmpRe = /&([^a-z#]|#(?:[^0-9x]|x(?:[^0-9a-f]|$)|$)|$)/gi;
    var ltRe = /[<]/g;
    var gtRe = />/g;
    var quotRe = /\"/g;

    /**
     * Escapes HTML special characters in attribute values.
     *
     * {\@updoc
     * $ escapeAttrib('')
     * # ''
     * $ escapeAttrib('"<<&==&>>"')  // Do not just escape the first occurrence.
     * # '&#34;&lt;&lt;&amp;&#61;&#61;&amp;&gt;&gt;&#34;'
     * $ escapeAttrib('Hello <World>!')
     * # 'Hello &lt;World&gt;!'
     * }
     */
    function escapeAttrib(s) {
	if(s) {
	    return ('' + s).replace(ampRe, '&amp;').replace(ltRe, '&lt;')
            .replace(gtRe, '&gt;').replace(quotRe, '&#34;');
	}
	else {
	    return s;
	}
        
    }

    /**
     * Escape entities in RCDATA that can be escaped without changing the meaning.
     * {\@updoc
     * $ normalizeRCData('1 < 2 &&amp; 3 > 4 &amp;& 5 &lt; 7&8')
     * # '1 &lt; 2 &amp;&amp; 3 &gt; 4 &amp;&amp; 5 &lt; 7&amp;8'
     * }
     */
    function normalizeRCData(rcdata) {
	if(rcdata) {
	    return rcdata
                .replace(looseAmpRe, '&amp;$1')
                .replace(ltRe, '&lt;')
                .replace(gtRe, '&gt;');
	}
	else {
	    return rcdata;
	}
    }

    // TODO(felix8a): validate sanitizer regexs against the HTML5 grammar at
    // http://www.whatwg.org/specs/web-apps/current-work/multipage/syntax.html
    // http://www.whatwg.org/specs/web-apps/current-work/multipage/parsing.html
    // http://www.whatwg.org/specs/web-apps/current-work/multipage/tokenization.html
    // http://www.whatwg.org/specs/web-apps/current-work/multipage/tree-construction.html

    // We initially split input so that potentially meaningful characters
    // like '<' and '>' are separate tokens, using a fast dumb process that
    // ignores quoting.  Then we walk that token stream, and when we see a
    // '<' that's the start of a tag, we use ATTR_RE to extract tag
    // attributes from the next token.  That token will never have a '>'
    // character.  However, it might have an unbalanced quote character, and
    // when we see that, we combine additional tokens to balance the quote.

    var ATTR_RE = new RegExp(
        '^\\s*' +
            '([-.:\\w]+)' +             // 1 = Attribute name
            '(?:' + (
            '\\s*(=)\\s*' +           // 2 = Is there a value?
                '(' + (                   // 3 = Attribute value
                // TODO(felix8a): maybe use backref to match quotes
                '(\")[^\"]*(\"|$)' +    // 4, 5 = Double-quoted string
                    '|' +
                    '(\')[^\']*(\'|$)' +    // 6, 7 = Single-quoted string
                    '|' +
                    // Positive lookahead to prevent interpretation of
                    // <foo a= b=c> as <foo a='b=c'>
                    // TODO(felix8a): might be able to drop this case
                    '(?=[a-z][-\\w]*\\s*=)' +
                    '|' +
                    // Unquoted value that isn't an attribute name
                    // (since we didn't match the positive lookahead above)
                    '[^\"\'\\s]*' ) +
                ')' ) +
            ')?',
        'i');

    // false on IE<=8, true on most other browsers
    var splitWillCapture = ('a,b'.split(/(,)/).length === 3);

    // bitmask for tags with special parsing, like <script> and <textarea>
    var EFLAGS_TEXT = html4.eflags['CDATA'] | html4.eflags['RCDATA'];

    /**
     * Given a SAX-like event handler, produce a function that feeds those
     * events and a parameter to the event handler.
     *
     * The event handler has the form:{@code
     * {
   *   // Name is an upper-case HTML tag name.  Attribs is an array of
   *   // alternating upper-case attribute names, and attribute values.  The
   *   // attribs array is reused by the parser.  Param is the value passed to
   *   // the saxParser.
   *   startTag: function (name, attribs, param) { ... },
   *   endTag:   function (name, param) { ... },
   *   pcdata:   function (text, param) { ... },
   *   rcdata:   function (text, param) { ... },
   *   cdata:    function (text, param) { ... },
   *   startDoc: function (param) { ... },
   *   endDoc:   function (param) { ... }
   * }}
     *
     * @param {Object} handler a record containing event handlers.
     * @return {function(string, Object)} A function that takes a chunk of HTML
     *     and a parameter.  The parameter is passed on to the handler methods.
     */
    function makeSaxParser(handler) {
        // Accept quoted or unquoted keys (Closure compat)
        var hcopy = {
            cdata: handler.cdata || handler['cdata'],
            comment: handler.comment || handler['comment'],
            endDoc: handler.endDoc || handler['endDoc'],
            endTag: handler.endTag || handler['endTag'],
            pcdata: handler.pcdata || handler['pcdata'],
            rcdata: handler.rcdata || handler['rcdata'],
            startDoc: handler.startDoc || handler['startDoc'],
            startTag: handler.startTag || handler['startTag']
        };
        return function(htmlText, param) {
            return parse(htmlText, hcopy, param);
        };
    }

    // Parsing strategy is to split input into parts that might be lexically
    // meaningful (every ">" becomes a separate part), and then recombine
    // parts if we discover they're in a different context.

    // TODO(felix8a): Significant performance regressions from -legacy,
    // tested on
    //    Chrome 18.0
    //    Firefox 11.0
    //    IE 6, 7, 8, 9
    //    Opera 11.61
    //    Safari 5.1.3
    // Many of these are unusual patterns that are linearly slower and still
    // pretty fast (eg 1ms to 5ms), so not necessarily worth fixing.

    // TODO(felix8a): "<script> && && && ... <\/script>" is slower on all
    // browsers.  The hotspot is htmlSplit.

    // TODO(felix8a): "<p title='>>>>...'><\/p>" is slower on all browsers.
    // This is partly htmlSplit, but the hotspot is parseTagAndAttrs.

    // TODO(felix8a): "<a><\/a><a><\/a>..." is slower on IE9.
    // "<a>1<\/a><a>1<\/a>..." is faster, "<a><\/a>2<a><\/a>2..." is faster.

    // TODO(felix8a): "<p<p<p..." is slower on IE[6-8]

    var continuationMarker = {};
    function parse(htmlText, handler, param) {
        var m, p, tagName;
        var parts = htmlSplit(htmlText);
        var state = {
            noMoreGT: false,
            noMoreEndComments: false
        };
        parseCPS(handler, parts, 0, state, param);
    }

    function continuationMaker(h, parts, initial, state, param) {
        return function () {
            parseCPS(h, parts, initial, state, param);
        };
    }

    function parseCPS(h, parts, initial, state, param) {
        try {
            if (h.startDoc && initial == 0) { h.startDoc(param); }
            var m, p, tagName;
            for (var pos = initial, end = parts.length; pos < end;) {
                var current = parts[pos++];
                var next = parts[pos];
                switch (current) {
                    case '&':
                        if (ENTITY_RE_2.test(next)) {
                            if (h.pcdata) {
                                h.pcdata('&' + next, param, continuationMarker,
                                    continuationMaker(h, parts, pos, state, param));
                            }
                            pos++;
                        } else {
                            if (h.pcdata) { h.pcdata("&amp;", param, continuationMarker,
                                continuationMaker(h, parts, pos, state, param));
                            }
                        }
                        break;
                    case '<\/':
                        if ((m = /^([-\w:]+)[^\'\"]*/.exec(next))) {
                            if (m[0].length === next.length && parts[pos + 1] === '>') {
                                // fast case, no attribute parsing needed
                                pos += 2;
                                tagName = m[1].toLowerCase();
                                if (h.endTag) {
                                    h.endTag(tagName, param, continuationMarker,
                                        continuationMaker(h, parts, pos, state, param));
                                }
                            } else {
                                // slow case, need to parse attributes
                                // TODO(felix8a): do we really care about misparsing this?
                                pos = parseEndTag(
                                    parts, pos, h, param, continuationMarker, state);
                            }
                        } else {
                            if (h.pcdata) {
                                h.pcdata('&lt;/', param, continuationMarker,
                                    continuationMaker(h, parts, pos, state, param));
                            }
                        }
                        break;
                    case '<':
                        if (m = /^([-\w:]+)\s*\/?/.exec(next)) {
                            if (m[0].length === next.length && parts[pos + 1] === '>') {
                                // fast case, no attribute parsing needed
                                pos += 2;
                                tagName = m[1].toLowerCase();
                                if (h.startTag) {
                                    h.startTag(tagName, [], param, continuationMarker,
                                        continuationMaker(h, parts, pos, state, param));
                                }
                                // tags like <script> and <textarea> have special parsing
                                var eflags = html4.ELEMENTS[tagName];
                                if (eflags & EFLAGS_TEXT) {
                                    var tag = { name: tagName, next: pos, eflags: eflags };
                                    pos = parseText(
                                        parts, tag, h, param, continuationMarker, state);
                                }
                            } else {
                                // slow case, need to parse attributes
                                pos = parseStartTag(
                                    parts, pos, h, param, continuationMarker, state);
                            }
                        } else {
                            if (h.pcdata) {
                                h.pcdata('&lt;', param, continuationMarker,
                                    continuationMaker(h, parts, pos, state, param));
                            }
                        }
                        break;
                    case '<\!--':
                        // The pathological case is n copies of '<\!--' without '-->', and
                        // repeated failure to find '-->' is quadratic.  We avoid that by
                        // remembering when search for '-->' fails.
                        if (!state.noMoreEndComments) {
                            // A comment <\!--x--> is split into three tokens:
                            //   '<\!--', 'x--', '>'
                            // We want to find the next '>' token that has a preceding '--'.
                            // pos is at the 'x--'.
                            for (p = pos + 1; p < end; p++) {
                                if (parts[p] === '>' && /--$/.test(parts[p - 1])) { break; }
                            }
                            if (p < end) {
                                if (h.comment) {
                                    var comment = parts.slice(pos, p).join('');
                                    h.comment(
                                        comment.substr(0, comment.length - 2), param,
                                        continuationMarker,
                                        continuationMaker(h, parts, p + 1, state, param));
                                }
                                pos = p + 1;
                            } else {
                                state.noMoreEndComments = true;
                            }
                        }
                        if (state.noMoreEndComments) {
                            if (h.pcdata) {
                                h.pcdata('&lt;!--', param, continuationMarker,
                                    continuationMaker(h, parts, pos, state, param));
                            }
                        }
                        break;
                    case '<\!':
                        if (!/^\w/.test(next)) {
                            if (h.pcdata) {
                                h.pcdata('&lt;!', param, continuationMarker,
                                    continuationMaker(h, parts, pos, state, param));
                            }
                        } else {
                            // similar to noMoreEndComment logic
                            if (!state.noMoreGT) {
                                for (p = pos + 1; p < end; p++) {
                                    if (parts[p] === '>') { break; }
                                }
                                if (p < end) {
                                    pos = p + 1;
                                } else {
                                    state.noMoreGT = true;
                                }
                            }
                            if (state.noMoreGT) {
                                if (h.pcdata) {
                                    h.pcdata('&lt;!', param, continuationMarker,
                                        continuationMaker(h, parts, pos, state, param));
                                }
                            }
                        }
                        break;
                    case '<?':
                        // similar to noMoreEndComment logic
                        if (!state.noMoreGT) {
                            for (p = pos + 1; p < end; p++) {
                                if (parts[p] === '>') { break; }
                            }
                            if (p < end) {
                                pos = p + 1;
                            } else {
                                state.noMoreGT = true;
                            }
                        }
                        if (state.noMoreGT) {
                            if (h.pcdata) {
                                h.pcdata('&lt;?', param, continuationMarker,
                                    continuationMaker(h, parts, pos, state, param));
                            }
                        }
                        break;
                    case '>':
                        if (h.pcdata) {
                            h.pcdata("&gt;", param, continuationMarker,
                                continuationMaker(h, parts, pos, state, param));
                        }
                        break;
                    case '':
                        break;
                    default:
                        if (h.pcdata) {
                            h.pcdata(current, param, continuationMarker,
                                continuationMaker(h, parts, pos, state, param));
                        }
                        break;
                }
            }
            if (h.endDoc) { h.endDoc(param); }
        } catch (e) {
            if (e !== continuationMarker) { throw e; }
        }
    }

    // Split str into parts for the html parser.
    function htmlSplit(str) {
        // can't hoist this out of the function because of the re.exec loop.
        var re = /(<\/|<\!--|<[!?]|[&<>])/g;
        str += '';
        if (splitWillCapture) {
            return str.split(re);
        } else {
            var parts = [];
            var lastPos = 0;
            var m;
            while ((m = re.exec(str)) !== null) {
                parts.push(str.substring(lastPos, m.index));
                parts.push(m[0]);
                lastPos = m.index + m[0].length;
            }
            parts.push(str.substring(lastPos));
            return parts;
        }
    }

    function parseEndTag(parts, pos, h, param, continuationMarker, state) {
        var tag = parseTagAndAttrs(parts, pos);
        // drop unclosed tags
        if (!tag) { return parts.length; }
        if (h.endTag) {
            h.endTag(tag.name, param, continuationMarker,
                continuationMaker(h, parts, pos, state, param));
        }
        return tag.next;
    }

    function parseStartTag(parts, pos, h, param, continuationMarker, state) {
        var tag = parseTagAndAttrs(parts, pos);
        // drop unclosed tags
        if (!tag) { return parts.length; }
        if (h.startTag) {
            h.startTag(tag.name, tag.attrs, param, continuationMarker,
                continuationMaker(h, parts, tag.next, state, param));
        }
        // tags like <script> and <textarea> have special parsing
        if (tag.eflags & EFLAGS_TEXT) {
            return parseText(parts, tag, h, param, continuationMarker, state);
        } else {
            return tag.next;
        }
    }

    var endTagRe = {};

    // Tags like <script> and <textarea> are flagged as CDATA or RCDATA,
    // which means everything is text until we see the correct closing tag.
    function parseText(parts, tag, h, param, continuationMarker, state) {
        var end = parts.length;
        if (!endTagRe.hasOwnProperty(tag.name)) {
            endTagRe[tag.name] = new RegExp('^' + tag.name + '(?:[\\s\\/]|$)', 'i');
        }
        var re = endTagRe[tag.name];
        var first = tag.next;
        var p = tag.next + 1;
        for (; p < end; p++) {
            if (parts[p - 1] === '<\/' && re.test(parts[p])) { break; }
        }
        if (p < end) { p -= 1; }
        var buf = parts.slice(first, p).join('');
        if (tag.eflags & html4.eflags['CDATA']) {
            if (h.cdata) {
                h.cdata(buf, param, continuationMarker,
                    continuationMaker(h, parts, p, state, param));
            }
        } else if (tag.eflags & html4.eflags['RCDATA']) {
            if (h.rcdata) {
                h.rcdata(normalizeRCData(buf), param, continuationMarker,
                    continuationMaker(h, parts, p, state, param));
            }
        } else {
            throw new Error('bug');
        }
        return p;
    }

    // at this point, parts[pos-1] is either "<" or "<\/".
    function parseTagAndAttrs(parts, pos) {
        var m = /^([-\w:]+)/.exec(parts[pos]);
        var tag = {};
        tag.name = m[1].toLowerCase();
        tag.eflags = html4.ELEMENTS[tag.name];
        var buf = parts[pos].substr(m[0].length);
        // Find the next '>'.  We optimistically assume this '>' is not in a
        // quoted context, and further down we fix things up if it turns out to
        // be quoted.
        var p = pos + 1;
        var end = parts.length;
        for (; p < end; p++) {
            if (parts[p] === '>') { break; }
            buf += parts[p];
        }
        if (end <= p) { return void 0; }
        var attrs = [];
        while (buf !== '') {
            m = ATTR_RE.exec(buf);
            if (!m) {
                // No attribute found: skip garbage
                buf = buf.replace(/^[\s\S][^a-z\s]*/, '');

            } else if ((m[4] && !m[5]) || (m[6] && !m[7])) {
                // Unterminated quote: slurp to the next unquoted '>'
                var quote = m[4] || m[6];
                var sawQuote = false;
                var abuf = [buf, parts[p++]];
                for (; p < end; p++) {
                    if (sawQuote) {
                        if (parts[p] === '>') { break; }
                    } else if (0 <= parts[p].indexOf(quote)) {
                        sawQuote = true;
                    }
                    abuf.push(parts[p]);
                }
                // Slurp failed: lose the garbage
                if (end <= p) { break; }
                // Otherwise retry attribute parsing
                buf = abuf.join('');
                continue;

            } else {
                // We have an attribute
                var aName = m[1].toLowerCase();
                var aValue = m[2] ? decodeValue(m[3]) : '';
                attrs.push(aName, aValue);
                buf = buf.substr(m[0].length);
            }
        }
        tag.attrs = attrs;
        tag.next = p + 1;
        return tag;
    }

    function decodeValue(v) {
        var q = v.charCodeAt(0);
        if (q === 0x22 || q === 0x27) { // " or '
            v = v.substr(1, v.length - 2);
        }
        return unescapeEntities(stripNULs(v));
    }

    /**
     * Returns a function that strips unsafe tags and attributes from html.
     * @param {function(string, Array.<string>): ?Array.<string>} tagPolicy
     *     A function that takes (tagName, attribs[]), where tagName is a key in
     *     html4.ELEMENTS and attribs is an array of alternating attribute names
     *     and values.  It should return a record (as follows), or null to delete
     *     the element.  It's okay for tagPolicy to modify the attribs array,
     *     but the same array is reused, so it should not be held between calls.
     *     Record keys:
     *        attribs: (required) Sanitized attributes array.
     *        tagName: Replacement tag name.
     * @return {function(string, Array)} A function that sanitizes a string of
     *     HTML and appends result strings to the second argument, an array.
     */
    function makeHtmlSanitizer(tagPolicy) {
        var stack;
        var ignoring;
        var emit = function (text, out) {
            if (!ignoring) { out.push(text); }
        };
        return makeSaxParser({
            'startDoc': function(_) {
                stack = [];
                ignoring = false;
            },
            'startTag': function(tagNameOrig, attribs, out) {
                if (ignoring) { return; }
                if (!html4.ELEMENTS.hasOwnProperty(tagNameOrig)) { return; }
                var eflagsOrig = html4.ELEMENTS[tagNameOrig];
                if (eflagsOrig & html4.eflags['FOLDABLE']) {
                    return;
                }

                var decision = tagPolicy(tagNameOrig, attribs);
                if (!decision) {
                    ignoring = !(eflagsOrig & html4.eflags['EMPTY']);
                    return;
                } else if (typeof decision !== 'object') {
                    throw new Error('tagPolicy did not return object (old API?)');
                }
                if ('attribs' in decision) {
                    attribs = decision['attribs'];
                } else {
                    throw new Error('tagPolicy gave no attribs');
                }
                var eflagsRep;
                var tagNameRep;
                if ('tagName' in decision) {
                    tagNameRep = decision['tagName'];
                    eflagsRep = html4.ELEMENTS[tagNameRep];
                } else {
                    tagNameRep = tagNameOrig;
                    eflagsRep = eflagsOrig;
                }
                // TODO(mikesamuel): relying on tagPolicy not to insert unsafe
                // attribute names.

                // If this is an optional-end-tag element and either this element or its
                // previous like sibling was rewritten, then insert a close tag to
                // preserve structure.
                if (eflagsOrig & html4.eflags['OPTIONAL_ENDTAG']) {
                    var onStack = stack[stack.length - 1];
                    if (onStack && onStack.orig === tagNameOrig &&
                        (onStack.rep !== tagNameRep || tagNameOrig !== tagNameRep)) {
                        out.push('<\/', onStack.rep, '>');
                    }
                }

                if (!(eflagsOrig & html4.eflags['EMPTY'])) {
                    stack.push({orig: tagNameOrig, rep: tagNameRep});
                }

                out.push('<', tagNameRep);
                for (var i = 0, n = attribs.length; i < n; i += 2) {
                    var attribName = attribs[i],
                        value = attribs[i + 1];
                    if (value !== null && value !== void 0) {
                        out.push(' ', attribName, '="', escapeAttrib(value), '"');
                    }
                }
                out.push('>');

                if ((eflagsOrig & html4.eflags['EMPTY'])
                    && !(eflagsRep & html4.eflags['EMPTY'])) {
                    // replacement is non-empty, synthesize end tag
                    out.push('<\/', tagNameRep, '>');
                }
            },
            'endTag': function(tagName, out) {
                if (ignoring) {
                    ignoring = false;
                    return;
                }
                if (!html4.ELEMENTS.hasOwnProperty(tagName)) { return; }
                var eflags = html4.ELEMENTS[tagName];
                if (!(eflags & (html4.eflags['EMPTY'] | html4.eflags['FOLDABLE']))) {
                    var index;
                    if (eflags & html4.eflags['OPTIONAL_ENDTAG']) {
                        for (index = stack.length; --index >= 0;) {
                            var stackElOrigTag = stack[index].orig;
                            if (stackElOrigTag === tagName) { break; }
                            if (!(html4.ELEMENTS[stackElOrigTag] &
                                html4.eflags['OPTIONAL_ENDTAG'])) {
                                // Don't pop non optional end tags looking for a match.
                                return;
                            }
                        }
                    } else {
                        for (index = stack.length; --index >= 0;) {
                            if (stack[index].orig === tagName) { break; }
                        }
                    }
                    if (index < 0) { return; }  // Not opened.
                    for (var i = stack.length; --i > index;) {
                        var stackElRepTag = stack[i].rep;
                        if (!(html4.ELEMENTS[stackElRepTag] &
                            html4.eflags['OPTIONAL_ENDTAG'])) {
                            out.push('<\/', stackElRepTag, '>');
                        }
                    }
                    if (index < stack.length) {
                        tagName = stack[index].rep;
                    }
                    stack.length = index;
                    out.push('<\/', tagName, '>');
                }
            },
            'pcdata': emit,
            'rcdata': emit,
            'cdata': emit,
            'endDoc': function(out) {
                for (; stack.length; stack.length--) {
                    out.push('<\/', stack[stack.length - 1].rep, '>');
                }
            }
        });
    }

    var ALLOWED_URI_SCHEMES = /^(?:https?|mailto)$/i;

    function safeUri(uri, effect, ltype, hints, naiveUriRewriter) {
        if (!naiveUriRewriter) { return null; }
        try {
            var parsed = URI.parse('' + uri);
            if (parsed) {
                if (!parsed.hasScheme() ||
                    ALLOWED_URI_SCHEMES.test(parsed.getScheme())) {
                    var safe = naiveUriRewriter(parsed, effect, ltype, hints);
                    return safe ? safe.toString() : null;
                }
            }
        } catch (e) {
            return null;
        }
        return null;
    }

    function log(logger, tagName, attribName, oldValue, newValue) {
        if (!attribName) {
            logger(tagName + " removed", {
                change: "removed",
                tagName: tagName
            });
        }
        if (oldValue !== newValue) {
            var changed = "changed";
            if (oldValue && !newValue) {
                changed = "removed";
            } else if (!oldValue && newValue)  {
                changed = "added";
            }
            logger(tagName + "." + attribName + " " + changed, {
                change: changed,
                tagName: tagName,
                attribName: attribName,
                oldValue: oldValue,
                newValue: newValue
            });
        }
    }

    function lookupAttribute(map, tagName, attribName) {
        var attribKey;
        attribKey = tagName + '::' + attribName;
        if (map.hasOwnProperty(attribKey)) {
            return map[attribKey];
        }
        attribKey = '*::' + attribName;
        if (map.hasOwnProperty(attribKey)) {
            return map[attribKey];
        }
        return void 0;
    }
    function getAttributeType(tagName, attribName) {
        return lookupAttribute(html4.ATTRIBS, tagName, attribName);
    }
    function getLoaderType(tagName, attribName) {
        return lookupAttribute(html4.LOADERTYPES, tagName, attribName);
    }
    function getUriEffect(tagName, attribName) {
        return lookupAttribute(html4.URIEFFECTS, tagName, attribName);
    }

    /**
     * Sanitizes attributes on an HTML tag.
     * @param {string} tagName An HTML tag name in lowercase.
     * @param {Array.<?string>} attribs An array of alternating names and values.
     * @param {?function(?string): ?string} opt_naiveUriRewriter A transform to
     *     apply to URI attributes; it can return a new string value, or null to
     *     delete the attribute.  If unspecified, URI attributes are deleted.
     * @param {function(?string): ?string} opt_nmTokenPolicy A transform to apply
     *     to attributes containing HTML names, element IDs, and space-separated
     *     lists of classes; it can return a new string value, or null to delete
     *     the attribute.  If unspecified, these attributes are kept unchanged.
     * @return {Array.<?string>} The sanitized attributes as a list of alternating
     *     names and values, where a null value means to omit the attribute.
     */
    function sanitizeAttribs(tagName, attribs,
        opt_naiveUriRewriter, opt_nmTokenPolicy, opt_logger) {
        // TODO(felix8a): it's obnoxious that domado duplicates much of this
        // TODO(felix8a): maybe consistently enforce constraints like target=
        for (var i = 0; i < attribs.length; i += 2) {
            var attribName = attribs[i];
            var value = attribs[i + 1];
            var oldValue = value;
            var atype = null, attribKey;
            if ((attribKey = tagName + '::' + attribName,
                html4.ATTRIBS.hasOwnProperty(attribKey)) ||
                (attribKey = '*::' + attribName,
                    html4.ATTRIBS.hasOwnProperty(attribKey))) {
                atype = html4.ATTRIBS[attribKey];
            }
            if (atype !== null) {
                switch (atype) {
                    case html4.atype['NONE']: break;
                    case html4.atype['SCRIPT']:
                        value = null;
                        if (opt_logger) {
                            log(opt_logger, tagName, attribName, oldValue, value);
                        }
                        break;
                    case html4.atype['STYLE']:
                        if ('undefined' === typeof parseCssDeclarations) {
                            value = null;
                            if (opt_logger) {
                                log(opt_logger, tagName, attribName, oldValue, value);
                            }
                            break;
                        }
                        var sanitizedDeclarations = [];
                        parseCssDeclarations(
                            value,
                            {
                                'declaration': function (property, tokens) {
                                    var normProp = property.toLowerCase();
                                    sanitizeCssProperty(
                                        normProp, tokens,
                                        opt_naiveUriRewriter
                                            ? function (url) {
                                            return safeUri(
                                                url, html4.ueffects.SAME_DOCUMENT,
                                                html4.ltypes.SANDBOXED,
                                                {
                                                    "TYPE": "CSS",
                                                    "CSS_PROP": normProp
                                                }, opt_naiveUriRewriter);
                                        }
                                            : null);
                                    if (tokens.length) {
                                        sanitizedDeclarations.push(
                                            normProp + ': ' + tokens.join(' '));
                                    }
                                }
                            });
                        value = sanitizedDeclarations.length > 0 ?
                            sanitizedDeclarations.join(' ; ') : null;
                        if (opt_logger) {
                            log(opt_logger, tagName, attribName, oldValue, value);
                        }
                        break;
                    case html4.atype['ID']:
                    case html4.atype['IDREF']:
                    case html4.atype['IDREFS']:
                    case html4.atype['GLOBAL_NAME']:
                    case html4.atype['LOCAL_NAME']:
                    case html4.atype['CLASSES']:
                        value = opt_nmTokenPolicy ? opt_nmTokenPolicy(value) : value;
                        if (opt_logger) {
                            log(opt_logger, tagName, attribName, oldValue, value);
                        }
                        break;
                    case html4.atype['URI']:
                        value = safeUri(value,
                            getUriEffect(tagName, attribName),
                            getLoaderType(tagName, attribName),
                            {
                                "TYPE": "MARKUP",
                                "XML_ATTR": attribName,
                                "XML_TAG": tagName
                            }, opt_naiveUriRewriter);
                        if (opt_logger) {
                            log(opt_logger, tagName, attribName, oldValue, value);
                        }
                        break;
                    case html4.atype['URI_FRAGMENT']:
                        if (value && '#' === value.charAt(0)) {
                            value = value.substring(1);  // remove the leading '#'
                            value = opt_nmTokenPolicy ? opt_nmTokenPolicy(value) : value;
                            if (value !== null && value !== void 0) {
                                value = '#' + value;  // restore the leading '#'
                            }
                        } else {
                            value = null;
                        }
                        if (opt_logger) {
                            log(opt_logger, tagName, attribName, oldValue, value);
                        }
                        break;
                    default:
                        value = null;
                        if (opt_logger) {
                            log(opt_logger, tagName, attribName, oldValue, value);
                        }
                        break;
                }
            } else {
                value = null;
                if (opt_logger) {
                    log(opt_logger, tagName, attribName, oldValue, value);
                }
            }
            attribs[i + 1] = value;
        }
        return attribs;
    }

    /**
     * Creates a tag policy that omits all tags marked UNSAFE in html4-defs.js
     * and applies the default attribute sanitizer with the supplied policy for
     * URI attributes and NMTOKEN attributes.
     * @param {?function(?string): ?string} opt_naiveUriRewriter A transform to
     *     apply to URI attributes.  If not given, URI attributes are deleted.
     * @param {function(?string): ?string} opt_nmTokenPolicy A transform to apply
     *     to attributes containing HTML names, element IDs, and space-separated
     *     lists of classes.  If not given, such attributes are left unchanged.
     * @return {function(string, Array.<?string>)} A tagPolicy suitable for
     *     passing to html.sanitize.
     */
    function makeTagPolicy(
        opt_naiveUriRewriter, opt_nmTokenPolicy, opt_logger) {
        return function(tagName, attribs) {
            if (!(html4.ELEMENTS[tagName] & html4.eflags['UNSAFE'])) {
                return {
                    'attribs': sanitizeAttribs(tagName, attribs,
                        opt_naiveUriRewriter, opt_nmTokenPolicy, opt_logger)
                };
            } else {
                if (opt_logger) {
                    log(opt_logger, tagName, undefined, undefined, undefined);
                }
            }
        };
    }

    /**
     * Sanitizes HTML tags and attributes according to a given policy.
     * @param {string} inputHtml The HTML to sanitize.
     * @param {function(string, Array.<?string>)} tagPolicy A function that
     *     decides which tags to accept and sanitizes their attributes (see
     *     makeHtmlSanitizer above for details).
     * @return {string} The sanitized HTML.
     */
    function sanitizeWithPolicy(inputHtml, tagPolicy) {
        var outputArray = [];
        makeHtmlSanitizer(tagPolicy)(inputHtml, outputArray);
        return outputArray.join('');
    }

    /**
     * Strips unsafe tags and attributes from HTML.
     * @param {string} inputHtml The HTML to sanitize.
     * @param {?function(?string): ?string} opt_naiveUriRewriter A transform to
     *     apply to URI attributes.  If not given, URI attributes are deleted.
     * @param {function(?string): ?string} opt_nmTokenPolicy A transform to apply
     *     to attributes containing HTML names, element IDs, and space-separated
     *     lists of classes.  If not given, such attributes are left unchanged.
     */
    function sanitize(inputHtml,
        opt_naiveUriRewriter, opt_nmTokenPolicy, opt_logger) {
        var tagPolicy = makeTagPolicy(
            opt_naiveUriRewriter, opt_nmTokenPolicy, opt_logger);
        return sanitizeWithPolicy(inputHtml, tagPolicy);
    }

    // Export both quoted and unquoted names for Closure linkage.
    var html = {};
    html.escapeAttrib = html['escapeAttrib'] = escapeAttrib;
    html.makeHtmlSanitizer = html['makeHtmlSanitizer'] = makeHtmlSanitizer;
    html.makeSaxParser = html['makeSaxParser'] = makeSaxParser;
    html.makeTagPolicy = html['makeTagPolicy'] = makeTagPolicy;
    html.normalizeRCData = html['normalizeRCData'] = normalizeRCData;
    html.sanitize = html['sanitize'] = sanitize;
    html.sanitizeAttribs = html['sanitizeAttribs'] = sanitizeAttribs;
    html.sanitizeWithPolicy = html['sanitizeWithPolicy'] = sanitizeWithPolicy;
    html.unescapeEntities = html['unescapeEntities'] = unescapeEntities;
    return html;
})(html4);

var html_sanitize = html['sanitize'];

// Exports for Closure compiler.  Note this file is also cajoled
// for domado and run in an environment without 'window'
if (typeof window !== 'undefined') {
    window['html'] = html;
    window['html_sanitize'] = html_sanitize;
}

var Sanitizer = {};

// Ensure backwards compatibility
Sanitizer.escapeAttrib = html.escapeAttrib;
Sanitizer.makeHtmlSanitizer = html.makeHtmlSanitizer;
Sanitizer.makeSaxParser = html.makeSaxParser;
Sanitizer.makeTagPolicy = html.makeTagPolicy;
Sanitizer.normalizeRCData = html.normalizeRCData
Sanitizer.sanitizeAttribs = html.sanitizeAttribs
Sanitizer.sanitizeWithPolicy = html.sanitizeWithPolicy
Sanitizer.unescapeEntities = html.unescapeEntities
Sanitizer.escape = html.escapeAttrib;

// https://github.com/theSmaw/Caja-HTML-Sanitizer/issues/8
Sanitizer.sanitize = function(inputHtml, opt_naiveUriRewriter, opt_nmTokenPolicy, opt_logger) {
    if (typeof(inputHtml) === "string") {
        inputHtml = inputHtml.replace(/<([a-zA-Z]+)([^>]*)\/>/g, '<$1$2></$1>');
    }
    
    if (inputHtml) {
        return html.sanitize(inputHtml, opt_naiveUriRewriter, opt_nmTokenPolicy, opt_logger);
    }
    else {
        return inputHtml;
    }
    
}

// the browser, add 'Sanitizer' as a global object via a string identifier,
// for Closure Compiler "advanced" mode.
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Sanitizer;
    }
    exports.Sanitizer = Sanitizer;
} else {
    this.Sanitizer = Sanitizer;
}

},{"./lib/html4.js":25,"./lib/uri.js":26}],28:[function(require,module,exports){
/**
 * Config Aggregator
 * @module core/config-aggregator
 * @exports {ConfigAggregator} The constructor
 */

'use strict';

var util = require('../util/util');
var loggerFactory = require('../util/logger-factory');
var bunyan = require('browser-bunyan');
var defaultWidgetModel = require('./default-widget-model');

/**
 * A <code>ConfigAggregator</code> is used to combine zero or more models into one.
 * @constructor
 */
var ConfigAggregator = function() {
    this.log = loggerFactory.getLogger();
};

/**
 * Combines an array of zero or models into one. A default widget model is always used as a base.
 * @param {Object[]} models An array of widget models
 * @returns {Object} A single widget model
 */
ConfigAggregator.prototype.combine = function(models) {

    var log = this.log;

    var combinedModel = util.cloneDeep(defaultWidgetModel);
    models.forEach(function(model) {
        //merge all other properties
        util.merge(combinedModel, util.omit(model, ['preferences', 'viewmodes']));

        //latest model viewmodes and preferences take precedence
        if(model.viewmodes) {
            combinedModel.viewmodes = model.viewmodes;
        }
        if(model.preferences) {
            combinedModel.preferences = model.preferences;
        }
    });

    log.debug('Aggregated model created.');
    if(log.level() <= bunyan.TRACE) {
        log.trace('Aggregated model is this:\n %s', JSON.stringify(combinedModel, null, '\t'));
    }

    return combinedModel;
};

module.exports = ConfigAggregator;

},{"../util/logger-factory":77,"../util/util":78,"./default-widget-model":31,"browser-bunyan":80}],29:[function(require,module,exports){
/* jshint unused: vars */

/**
 * Config Parser
 * @module core/config-parser
 * @exports {ConfigParser} The constructor
 */
'use strict';

/**
 * A <code>ConfigParser</code> is used to parse a string of data into a widget model
 * @interface
 * @constructor
 * @param {Object} opts Configuration options to initialize with
 * @param {Object} [opts.log] A logger object to use. Defaults to a default logger object
 */
var ConfigParser = function(opts) {};

/**
 * Parses widget config text into a widget model
 * @method
 * @abstract
 * @param {string} configText The text to parse
 * @return {Object} A widget model
 */
ConfigParser.prototype.parse = function(configText) {
    throw new Error('ConfigParser#parse must be overridden.');
};

module.exports = ConfigParser;
},{}],30:[function(require,module,exports){
/* jshint unused: vars */

/**
 * Config Reaser
 * @module core/config-reader
 * @exports {ConfigReader} The constructor
 */

'use strict';

/**
 * A <code>ConfigReader</code> is used to read widget configuration from a source
 * @interface
 * @constructor
 * @param {Object} opts Configuration options to initialize with
 * @param {Object} [opts.useCache] Instructs the reader to cache the widget configuration string
 */
var ConfigReader = function(opts) {
};

/**
 * Reads the config text
 * @param location
 * @returns {Promise} Resolves to a widget model
 */
ConfigReader.prototype.read = function(location) {

    throw new Error('ConfigReader#read must be overridden.');
};

module.exports = ConfigReader;
},{}],31:[function(require,module,exports){
/**
 * Default Widget Model
 * @module core/default-widget-model
 * @exports {Object} The default widget model
 */

'use strict';

//this is the default widget model used as a base for various things
var widgetModel = {
    'id' : null,
    'version' : null,
    'height' : null,
    'width' : null,
    'viewmodes' : [ ],
    'name' : null,
    'shortName' : null,
    'description' : null,
    'author' : null,
    'authorHref' : null,
    'authorEmail' : null,
    'preferences' : {},
    'license' : null,
    'licenseHref' : null,
    'icons' : [ ],
    'content' : {
        'src' : 'index.html',
        'type' : 'text/html',
        'encoding' : 'UTF-8'
    },
    'features' : []
};

module.exports = widgetModel;
},{}],32:[function(require,module,exports){
/**
 * Pre-processing Renderer
 * Abstract helper class for adding pre-processing functionality to widget renderer strategies
 * This module expects the strategy author to overwrite two template methods:
 * <code>fetchStartFile</code> and <code>process</code>
 * @module core/pre-processing-widget-renderer
 */

'use strict';

var WidgetRenderer  = require('./widget-renderer');
var VError          = require('../util/verror');
var loggerFactory   = require('../util/logger-factory');
var util            = require('../util/util');
var PromiseExt      = require('promise-extensions')(Promise);
var fetch           = require('../util/deduping-fetch');

/**
 * Constructs a new <code>PreprocessingRenderer</code>
 * @interface
 * @constructor
 * @abstract
 */
var PreprocessingWidgetRenderer = function(datasourceResolverFactory, opts) {
    this._opts = opts || {};
    this.preprocessorMap = {};
    this.log = loggerFactory.getLogger();

    this._datasourceResolverFactory = datasourceResolverFactory;
};

PreprocessingWidgetRenderer.prototype = Object.create(WidgetRenderer.prototype);

/**
 * Renders a widget. This calls the template methods <code>fetchStartFile</code> and <code>process</code>
 * in sequence.
 * @final
 * @param {Object} widgetModel The model of the widget to be rendered
 * @param {Object} widgetInstance The widget instance of the widget to be rendered
 * @returns {Promise}
 */
PreprocessingWidgetRenderer.prototype.render = function(widgetModel, widgetInstance) {

    var self = this;
    var processPromise;

    if(!this.isRendered()) {
        var renderReadyPromises = [];

        //get the start file (template method)
        renderReadyPromises.push(this.fetchStartFile(widgetModel));

        //look for a message bundle reference
        var messageBundleUrl = widgetModel.preferences.messages && widgetModel.preferences.messages.value;
        renderReadyPromises.push(messageBundleUrl ? this._fetchMessages(messageBundleUrl) : null);

        //fetch datasources
        var datasources = Object.keys(widgetModel.datasources || {}).map(function (datasourceName) {
            return widgetModel.datasources[datasourceName];
        });
        if (datasources.length > 0) {
            var datasourceResolutionContext = self._buildDatasourceContext(widgetModel, widgetInstance);
            var datasourcePromises = datasources.map(function (datasource) {
                return self._fetchDatasource(datasource, datasourceResolutionContext);
            });
            renderReadyPromises = renderReadyPromises.concat(datasourcePromises);
        }

        //rendering process
        processPromise = PromiseExt.all(renderReadyPromises).spread(function (startFileContent, messageBundle) {

            //remaining args will be the datasource(s)
            var datasources = Array.prototype.slice.call(arguments, 2);

            //combine datasources into one object
            var datasourceContext = datasources.reduce(function (obj, datasource) {
                obj[datasource.name] = datasource.data;
                return obj;
            }, {});

            var renderingContext = util.assign({}, widgetModel, {
                datasources: datasourceContext
            });

            return self.preprocess(widgetModel, startFileContent, renderingContext, messageBundle);
        }).then(function (processedStartFileContent) {
            return self.process(widgetModel, widgetInstance, processedStartFileContent);
        }).catch(function (err) {
            throw new VError(err, 'The widget [' + widgetModel.name + '] could not be rendered:\n\t' + err.message);
        });
    } else {
        processPromise = PromiseExt.resolve(self.process(widgetModel, widgetInstance, null));
    }
    
    return processPromise.then(function() {
        return self.postprocess(widgetModel, widgetInstance);
    });
};

/**
 * Fetches message bundles
 * @param url
 * @return {Object}
 * @private
 */
PreprocessingWidgetRenderer.prototype._fetchMessages = function (url) {
    var self = this;
    var fetchFunction = util.isUrlForFile(url) ? require('../util/fetch-file') : fetch;
    return fetchFunction(url).then(function (response) {
        var messages = response.json();
        self.log.trace('Fetched messages:\n%s', messages);
        return messages;
    });
};

/**
 * Fetches given datasource from server. Uses datasource resolver factory to get a resolver
 * capable of handling the datasource.
 * @private
 * @param {Object} datasource A datasource to get data from
 * @param {Object} widgetModel A widget/container model
 * @param {Object} widgetInstance A widget/container instance object
 * @returns {Promise}
 */
PreprocessingWidgetRenderer.prototype._fetchDatasource = function (datasource, context) {
    var self = this;
    var name = datasource.name;
    var resolver = self._datasourceResolverFactory.getResolver(datasource);

    return resolver.loadData(context).then(function (result) {
        self.log.trace('Fetched datasource [%s]:\n%s', name, result);
        return {
            name: name,
            data: result
        };
    }).catch(function (err) {
        self.log.error('Datasource [%s] fetch failed.', name, err);
        return {
            name: name,
            error: err
        };
    });
};

/**
 * Merges an item model and general config options object (which holds apiRoot, contextRoot, etc)
 * to build a new object that is used as a context for expression resolution in data sources.
 * @param {Object} itemModel
 * @param {Object} widgetInstance
 * @returns {Object}
 * @private
 */
PreprocessingWidgetRenderer.prototype._buildDatasourceContext = function (itemModel, widgetInstance) {
    var itemOpts = {
        itemRoot: widgetInstance.baseURI
    };

    return util.merge({}, this._opts, itemOpts, itemModel);
};

    /**
 * Template method to fetch a start file. Return either the contents of a start file or a promise which
 * resolves to the contents of a start file
 * @param {string} path The path of the widget
 * @param {Object} widgetModel The model of the widget to be rendered
 * @param {Object} widgetInstance The widget instance of the widget to be rendered
 */
PreprocessingWidgetRenderer.prototype.fetchStartFile = function(path, widgetModel, widgetInstance) {

    throw new Error('PreprocessingRenderer#fetchStartFile must be overridden.');
};

/**
 * Applies the registered preprocessors to a start file.
 * The preprocessor must have been registered with a mime type that matches the mime type of the start file
 * @private
 * @param {Object} widgetModel The widget model
 * @param {String} startFileContent The raw start file content to process
 * @param {String} data The data/context
 * @param {Object} messageBundle
 * @returns {Promise}
 */
PreprocessingWidgetRenderer.prototype.preprocess = function(widgetModel, startFileContent, data, messageBundle) {

    var mimeType = widgetModel.content.type;
    if(startFileContent && this.preprocessorMap.hasOwnProperty(mimeType)) {
        var processor = this.preprocessorMap[mimeType];
        this.log.debug('Applying preprocessor for [%s] for [%s (%s)] ', processor.name, widgetModel.content.src,
                       mimeType);
        return processor.process(widgetModel, startFileContent, data, messageBundle);
    } else {
        return startFileContent;
    }
};

/**
 * Does main rendering processing after a start file has been fetched and preprocessed
 * @param {Object} widgetModel The model of the widget to be rendered
 * @param {Object} widgetInstance The widget instance of the widget to be rendered
 * @param {String} startFileHtml The contents of the widget's start file
 * @param {String} startFileDir The actual path of the start file (after considering folder localization etc)
 */
PreprocessingWidgetRenderer.prototype.process = function(widgetModel, widgetInstance, startFileHtml, startFileDir) {

    throw new Error('PreprocessingRenderer#process must be overridden.');
};

PreprocessingWidgetRenderer.prototype.postprocess = function(widgetModel, widgetInstance) {
	throw new Error('PreprocessingRenderer#postprocess must be overridden.');
};

/**
 * Invokes Javascript associated with the widget
 * @param widgetModel
 * @param widgetInstance
 */
PreprocessingWidgetRenderer.prototype.invokeScripts = function(widgetModel, widgetInstance) {

    throw new Error('PreprocessingRenderer#invokeScripts must be overridden.');
};

/**
 * Adds a preprocessor to the renderer
 * @param {String} mimeType This preprocessor will be applied to start files which have this mimetype
 * @param {Object} preprocessor Apply this preprocessor for start files with a matching mime typeg
 */
PreprocessingWidgetRenderer.prototype.addPreprocessor = function(mimeType, preprocessor) {
    if(this.preprocessorMap.hasOwnProperty(mimeType)) {
        var oldProcessor = this.preprocessorMap[mimeType].name;
        this.log.warn('Overriding a previously added preprocessor [%s] for the mime type [%s]', oldProcessor, mimeType);
    }

    preprocessor.name = preprocessor.name || 'Anonymous preprocessor';
    this.log.debug('Adding the preprocessor [%s] for start files with the mime type [%s]', preprocessor.name, mimeType);
    this.preprocessorMap[mimeType] = preprocessor;
};

module.exports = PreprocessingWidgetRenderer;

},{"../util/deduping-fetch":72,"../util/fetch-file":74,"../util/logger-factory":77,"../util/util":78,"../util/verror":79,"./widget-renderer":36,"promise-extensions":139}],33:[function(require,module,exports){
/**
 * Tne Widget Engine
 * @module core/widget-engine
 * @wxports {WidgetEngine}
 */

'use strict';

var ExtPromise = require('promise-extensions')(Promise);
var util = require('../util/util');
var loggerFactory = require('../util/logger-factory');
var WidgetRenderer = require('./widget-renderer');
var ConfigReader = require('./config-reader');
var ConfigParser = require('./config-parser');
var WidgetStorage = require('./widget-storage');
var WidgetInstanceFactory = require('./widget-instance-factory');
var WidgetFeatureAugmenter = require('./widget-feature-augmenter');
var ConfigAggregator = require('./config-aggregator');
var VError = require('../util/verror');

var CONFIG_FILE_NAME = 'model.xml';

var pluginPhases = {
    POST_READ: 'postRead',
    PRE_RENDER: 'preRender',
    POST_RENDER: 'postRender'
};

var mimeTypes = {
    html : 'text/html',
    hbs : 'text/x-handlebars-template',
    handlebars: 'text/x-handlebars-template',
    'soy.js': 'application/x-soy',
    'hbs.js': 'application/x-handlebars-template'
};

/**
 * The widget engine.
 * Uses supplied strategies and config to resolve and run a widget
 * @param {Object} config The configuration options to initiailze the widget engine with
 * @param {String} config.widgetPath A base path of the widget (without a file name)
 * @param {String} [config.configFile] The name of the config file to parse the widget meta data from. Usuatlly defaults
 *                                   to 'config.xml'
 * @param {Object} config.reader The reader strategy to use
 * @param {object} config.storage The storage strategy to use
 * @param {Object} config.renderer The rendering strategy to use
 * @param {Object} [config.initialModel] Feed a widgetr model directly into the engine
 * @param {Object} [config.log] A Bunyan logger to log messages with
 * @param {String} [config.initialId] A unique id to associate this widget with. This is declared externally so it can
 *                                    be shared with the externally defined logger
 * @constructor
 */
var WidgetEngine = function(config) {
    this.config = config;

    this.plugins = [];
    this.features = [];

    //stateless tools
    this.widgetInstanceFactory = new WidgetInstanceFactory();
    this.widgetFeatureAugmenter = new WidgetFeatureAugmenter();

    this.log = loggerFactory.getLogger();

    var failureMessages = validateConfig(this.config);
    if(failureMessages.warnings.length) {
        this.log.debug(failureMessages.warnings.join('\n'));
    }
    if(failureMessages.errors.length) {
        var message = 'Problems with widget config:\n\t' + failureMessages.errors.join('\t\n');
        throw new VError(message);
    }
};

/**
 * Starts the widget rendering process
 * @method
 * @returns {Promise} promise that resolves when complete
 */
WidgetEngine.prototype.start = function() {

    var startTime = new Date().getTime();

    var log = this.log;
    var config = this.config;
    var plugins = this.plugins;
    var features = this.features;
    var initialModel = config.initialModel || {};
    var widgetPath = config.widgetPath;
    var configFile = config.configFile || CONFIG_FILE_NAME;
    console.log("widgetPath:"+widgetPath);
    //convert empty strings urls to . to force the path as the current directory and not a falsy value
    if(widgetPath === '') {
        widgetPath = '.';
    }

    var widgetInstanceFactory = this.widgetInstanceFactory;
    var widgetFeatureAugmenter = this.widgetFeatureAugmenter;

    log.info('Starting widget @ %s...', widgetPath);
    log.info('Entering READ phase.');

    //READ PHASE
    //read the widget config
    var result = Promise.resolve({});

    if(config.reader) {
        result = result.then(function() {
            var resolvedConfigFile =
                (util.endsWith(widgetPath, '/') ? widgetPath : widgetPath + '/') + configFile;
            return config.reader.read(resolvedConfigFile);
        });
    }
    if(config.parser) {
        result = result.then(function(configText) {
            return config.parser.parse(configText);
        });
    }

    return ExtPromise.all([initialModel, result]).then(function aggregateModels(configModels) {
        log.debug('Aggregating models...');
        var configAggregator = new ConfigAggregator({
            log: log
        });
        return configAggregator.combine(configModels);
    }).then(function postRead(widgetModel) {
        log.info('Invoking plugins for POST READ phase...');
        //POST READ PHASE. Plugins must return a widgetModel
        return invokePluginsForPhase(plugins, log, pluginPhases.POST_READ, [ widgetModel ]);
    }).spread(function createInstance(widgetModel) {
        
        //in older widget models the meta data might not allow a mime type to be specified, this guesses the mime type
        //based on the file extension of the start file.
        //this could potentially be implemented as a post-read plugin, but that seems overkill for this case.
        //if the mime type is not the default value (text/html) do not try to guess it
        if(!widgetModel.content.type  || widgetModel.content.type === mimeTypes.html) {
            widgetModel.content.type = guessContentType(widgetModel);
            log.debug('The start file type was inferred as [%s]', widgetModel.content.type);
        }
        
        widgetModel.content.src = WidgetRenderer.getResolvedStartFilePath(widgetPath, widgetModel);

        log.info('Widget config read for: %s (%s).', widgetModel.id, widgetModel.name);
        log.info('Entering INSTANCE CREATION phase...');

        //INSTANCE CREATION PHASE
        var renderer = config.renderer;
        var storage = config.storage;

        //ensure an id is present for standalone environments where it may not have been populated with a UUID
        widgetModel.id = widgetModel.id || util.randomId();

        //init storage
        storage.init(widgetModel.name, widgetModel.preferences, widgetModel.type);
        log.debug('Widget storage initialized.');

        //create a widget instance (needs renderer for width and height functions)
        var widgetInstance = widgetInstanceFactory.makeWidget(widgetModel, storage, renderer, widgetPath);
        log.debug('Widget instance created.');

        //add features to the widget instance. Features are initiated with a widgetmodel for advanced ops
        widgetFeatureAugmenter.addFeaturesToWidget(widgetInstance, features, widgetModel);
        log.debug('%s feature(s) added to widget.', features.length);

        return [widgetInstance, renderer, widgetModel];
    }).spread(function preRender(widgetInstance, renderer, widgetModel) {
        //PRE RENDER PHASE
        log.info('Invoking plugins for PRE RENDER phase...');
        var widgetPluginPromises =
            invokePluginsForPhase(plugins, log, pluginPhases.PRE_RENDER, [ widgetInstance, renderer, widgetModel ]);
        return widgetPluginPromises;
    }).spread(function render(widgetInstance, renderer, widgetModel) {
        log.info('Entering RENDERING phase...');
        //RENDERING PHASE
        var renderingPromise = renderer.render(widgetModel, widgetInstance);
        return [ widgetInstance, renderer, widgetModel, renderingPromise ];
    }).spread(function postRender(widgetInstance, renderer, widgetModel) {
        log.info('Invoking plugins for POST RENDER phase...');
        //POST RENDER PHASE. Plugins are not expected to return a value
        var widgetPluginPromises =
            invokePluginsForPhase(plugins, log, pluginPhases.POST_RENDER, [ widgetInstance, renderer, widgetModel ]);
        return widgetPluginPromises;
    }).spread(function renderingComplete(widgetInstance, renderer, widgetModel) {
        var details = {};
        var endTime = new Date().getTime();
        details.time = endTime - startTime;
        details.id = widgetModel.id;
        details.message = 'Widget rendering for [' + widgetModel.name + '] completed in ' + details.time + 'ms.';
        details.areaNodes = typeof renderer.getAreaNodes === 'function' ? renderer.getAreaNodes() : null;
        log.info(details.message);
        return details;
    }).catch(function (e) {
        log.error(e);
        throw new VError(e, 'An error occurred whilst starting the widget.');
    });
};

/**
 * Adds a new feature
 * @param {Object} feature
 * @returns {WidgetEngine} Returns this. Convenient for chaining
 */
WidgetEngine.prototype.addFeature = function (feature) {

    this.log.info('Adding feature for widget, %s', (feature.name || '[Anonymous feature]'));
    if(typeof feature === 'object') {
        this.features.push(feature);
    }
    return this;
};

/**
 * Adds a plugin
 * @param {Object} plugin
 * @returns {WidgetEngine} Returns this. Convenient for chaining
 */
WidgetEngine.prototype.addPlugin = function (plugin) {

    this.log.info('Adding plugin for widget, %s', (plugin.name || '[Anonymous plugin]'));
    if(typeof plugin === 'object') {
        this.plugins.push(plugin);
    }
    return this;
};

/**
 * @see core/widget-renderer#destroy
 */
WidgetEngine.prototype.destroy = function () {
    // Call each plugin's destroy method
    this.plugins.forEach(function (plugin) {
        if (typeof plugin.destroy === 'function') {
            plugin.destroy();
        }
    });

    this.config.renderer.destroy();
};

var validateConfig = function(config) {

    var messages = {
        warnings: [],
        errors: []
    };

    //widgetpath
    if(typeof config.widgetPath !== 'string') {
        messages.errors.push('You must supply a valid widget path');
    } else if(config.widgetPath.indexOf(CONFIG_FILE_NAME) >= 0) {
        messages.errors.push('Please supply the base path of your widget, not its configuration file path');
    }

    if(!config.initialModel && !config.reader) {
        messages.warnings.push('No initial model or widget reader was provided. Can\'t get any config');
    }

    if(config.reader && !config.parser) {
        messages.warnings.push('A widget reader was provided, but not a widget config parser');
    }

    if(config.reader && !(config.reader instanceof ConfigReader)) {
        messages.warnings.push('The configured widget reader might not be a valid ConfigReader instance');
    }

    if(config.parser && !(config.parser instanceof ConfigParser)) {
        messages.warnings.push('The configured widget parser might not be a valid ConfigParser instance');
    }

    //storage
    if(!config.storage) {
        messages.errors.push('No widget storage is configured');
    } else if(!(config.storage instanceof WidgetStorage)) {
        messages.warnings.push('The configured widget storage might not be a valid WidgetStorage instance');
    }

    //renderer
    if(!config.renderer) {
        messages.errors.push('No widget renderer is configured');
    } else if(!(config.renderer instanceof WidgetRenderer)) {
        messages.warnings.push('The configured widget renderer might not be a valid WidgetRenderer instance');
    }

    return messages;
};

var invokePluginsForPhase = function(plugins, log, phase, pluginArgs) {

    var result = ExtPromise.all(pluginArgs);

    //loop through the plugins and sequentially invoke the plugin function for the current phase
    plugins.filter(function(plugin) {
        return typeof plugin[phase] === 'function';
    }).forEach(function(plugin) {
        var pluginName = plugin.name || 'Anonymous plugin';
        var lastArgs;

        result = result.then(function(args) { // args is always an array
            lastArgs = args;
            var promise = plugin[phase].apply(plugin, args);

            return [promise, args];
        }).spread(function(pluginReturnValue, args) {

            // if plugin returned nothing, fallback to arguments it was provided with
            // otherwise we assume it returned what it got as the first argument
            return pluginReturnValue === undefined ? args : [pluginReturnValue].concat(args.slice(1));
        }).catch(function(e) {
            // recover from failure, so that one failed plugin doesn't ruin widget rendering
            var message = 'Failed to invoke plugin [' + pluginName + '] for [' + phase + ']';
            log.error(e, message);

            // keep running plugins with what last successfully invoked plugin returned
            return lastArgs;
        });
    });

    return result;
};

var guessContentType = function(widgetModel) {
    var results = widgetModel.content.src.match(/\.([A-z0-9]+)$/);
    return results && results[1] && mimeTypes[results[1]] || widgetModel.content.type;
};

module.exports = WidgetEngine;

},{"../util/logger-factory":77,"../util/util":78,"../util/verror":79,"./config-aggregator":28,"./config-parser":29,"./config-reader":30,"./widget-feature-augmenter":34,"./widget-instance-factory":35,"./widget-renderer":36,"./widget-storage":37,"promise-extensions":139}],34:[function(require,module,exports){
/**
 * Widget Feature Augmenter
 * This module is an extension of the functionality in the <code>widget-instance-factory</code> for adding features
 * to widget instances.
 * @module core/widget-feature-augmenter
 * @exports {WidgetFeatureAugmenter} The constructor
 */

'use strict';

/**
 * Augments a widget object by initializing and adding a set of feature instances to its feature api
 * @constructor
 */
var WidgetFeatureAugmenter = function() {
};

/**
 * Adds a a list of features to the widget
 * @param {Object} widgetInstance The widget instance to add the features to
 * @param {Array} featureInstances a list of features to augment
 * @param {Object} widgetModel
 * @returns {Object} the widget instance modified
 */
WidgetFeatureAugmenter.prototype.addFeaturesToWidget = function(widgetInstance, featureInstances, widgetModel) {

    featureInstances = featureInstances || [];

    //helpers
    function findFeatureInstance(featureName, featureInstances) {
        return featureInstances.filter(function(featureInstance) {
           return featureInstance.name === featureName;
        })[0] || null;
    }
    function findFeatureConfig(featureName, widgetModel) {
        return widgetModel.features.filter(function(featureConfig) {
            return featureConfig.name === featureName;
        })[0] || null;
    }

    //WORKAROUND:
    //the idea with features is that the widget configuration must include a "feature request" for the feature 
    //to be available on the widget interface. this makes it clear by looking at a widget's configuration what
    //features it uses.
    //However our model does not yet support the "feature request" mechanism which makes features very prohibitive
    //to use. This code is a workaround that ensure all available features are added to the widget config and, 
    //therefore, added to the widget interface
    widgetModel.features = widgetModel.features || [];
    featureInstances.forEach(function (featureInstance) {
        //if the feature is not requested by the widget configuration, add it
        if(featureInstance.name && !findFeatureConfig(featureInstance.name, widgetModel)) {
            widgetModel.features.push({
                name: featureInstance.name,
                params: [],
                required: false
            });
        }
    });

    var featureMap = {};
    for(var i = 0; i < widgetModel.features.length; i++) {
        var featureConfig = widgetModel.features[i];
        var instance = findFeatureInstance(featureConfig.name, featureInstances);
        if (instance) {
            //initialize the feature instance with the widget specific params
            if (typeof instance._init === 'function') {
                instance._init(featureConfig.params, widgetInstance, widgetModel); //memory ok here?
            }
            Object.defineProperty(featureMap, instance.name, {
                enumerable: true,
                value: instance
            });
        } else if (featureConfig.required) {
            //throw an error the instance for a required feature is not available
            var message = 'Unable to render widget. A required feature is not available (' + featureConfig.name + ')';
            throw new Error(message);
        }
    }
    Object.defineProperty(widgetInstance, 'features', {
        enumerable: false,
        value: featureMap
    });

    return widgetInstance;
};

module.exports = WidgetFeatureAugmenter;
},{}],35:[function(require,module,exports){
/**
 * Widget Instance Factory
 * @module core/widget-instance-factory
 */

'use strict';

var util = require('../util/util');

var STRING_PROPS = [
    'author',
    'version',
    'id',
    'authorEmail',
    'authorHref',
    'locale'
];

var LOCALIZABLE_STRING_PROPS = [
    'description',
    'name',
    'shortName'
];

/**
 * Creates widget instances
 * @constructor
 */
var  WidgetInstanceFactory = function() {
};

/**
 * Makes a widget instance
 * @param {Object} widgetModel The model to get the widget data from
 * @param {WidgetStorage} storage The storage strategy implementation to use for preferences
 * @param {WidgetRenderer} renderer A references to the renderer. Necessary for operations such as getting width/height
 * @param {string} The base path of the widget. This is the directory where the configuration doc can be found
 * @returns {Object} The widget instance
 */
WidgetInstanceFactory.prototype.makeWidget = function(widgetModel, storage, renderer, widgetPath) {

    var widget = {};
    var locale = widgetModel.locale || null;

    //baseURI
    Object.defineProperty(widget, 'baseURI',  {
        enumerable: true,
        value: widgetPath
    });

    //define core string properties
    STRING_PROPS.forEach(function (propName) {
        Object.defineProperty(widget, propName, {
            enumerable: true,
            value: typeof widgetModel[propName] !== 'undefined' ? widgetModel[propName] : ''
        });
    });

    //define localizable string properties
    LOCALIZABLE_STRING_PROPS.forEach(function (propName) {

        var value = null;

        //try to find on the localized widget model
        if(locale && widgetModel._lang) {
            //find localized widget model
            var possibleLocales = util.getDescendantLocales(locale);
            var localizedWidgetModels = possibleLocales.map(function(possibleLocale) {
                return widgetModel._lang[possibleLocale];
            });
            var getValueFromLocalizedWidgetModels = function(localizedWidgetModels) {
                var value;
                if(localizedWidgetModels.length) {
                    var model = localizedWidgetModels.pop();
                    if(model) {
                        value = model[propName];
                    }
                    if(typeof value !== 'string') {
                        return getValueFromLocalizedWidgetModels(localizedWidgetModels);
                    }
                }
                return value;
            };
            value = getValueFromLocalizedWidgetModels(localizedWidgetModels);
        }
        //try to find default value if the localized model did not contain a valid value
        if(typeof value !== 'string' && typeof widgetModel[propName] === 'string') {
            value = widgetModel[propName];
        }
        //if there is no default value, try to match to the default locale
        else if(typeof value !== 'string' && widgetModel.defaultlocale) {
            var defaultLocalizedWidgetModel = widgetModel._lang[widgetModel.defaultlocale];
            if(defaultLocalizedWidgetModel) {
                value = defaultLocalizedWidgetModel[propName];
            }
        }

        Object.defineProperty(widget, propName, {
            enumerable: true,
            value: typeof value === 'string' ? value : ''
        });
    });

    //width and height
    Object.defineProperty(widget, 'width', {
        enumerable: true,
        get: function() {
            return renderer.getWidth();
        }
    });
    Object.defineProperty(widget, 'height', {
        enumerable: true,
        get: function() {
            return renderer.getHeight();
        }
    });

    //preferences
    Object.defineProperty(widget, 'preferences', {
        enumerable: false,
        value: storage
    });

    return widget;
};

module.exports = WidgetInstanceFactory;

},{"../util/util":78}],36:[function(require,module,exports){
/* jshint unused: vars */

/**
 * Tne Widget Engine
 * @module core/widget-renderer
 * @exports {WidgetRenderer} The constructor
 */

'use strict';

var util = require('../util/util');

/**
 * Renders a widget
 * @interface
 * @constructor
 * @param {Object} opts
 * @param {String} [opts.useFolderLocalization] Explicitly instructs the renderer to attempt to use folder
 *                                            localization. i.e. To look for the start file in
 *                                            /widgetPath/[locale]/index.html
 */
var WidgetRenderer = function(opts) {
};

/**
 * Starts the rendering process
 * @param {Object} widgetModel
 * @param {Object} widgetInstance
 */
WidgetRenderer.prototype.render = function(widgetModel, widgetInstance) {

    throw new Error('WidgetRenderer#render must be overridden.');
};

/**
 * Returns the width of the widget
 */
WidgetRenderer.prototype.getWidth = function() {

    throw new Error('WidgetRenderer#getWidth must be overridden.');
};

/**
 * Returns the height of the widget
 */
WidgetRenderer.prototype.getHeight = function() {

    throw new Error('WidgetRenderer#getHeight must be overridden.');
};

/**
 * Returns the (typically) DOM node where the widget is rendered
 */
WidgetRenderer.prototype.getWidgetNode = function() {

    throw new Error('WidgetRenderer#getWidgetNode must be overridden.');
};

/**
 * Return the (typically) parent node of the where the widget was rendered
 */
WidgetRenderer.prototype.getParentNode = function() {
    throw new Error('WidgetRenderer#getContainerNode must be overridden.');
};

/**
 * Sets the parent node
 */
WidgetRenderer.prototype.setParentNode = function() {
    throw new Error('WidgetRenderer#setContainerNode must be overridden.');
};

/**
 * Returns a map of area nodes, which map area keys to dom nodes. Used by widgets that have children (containers)
 */
WidgetRenderer.prototype.getAreaNodes = function() {

    if(this.isContainer) {
        throw new Error('WidgetRenderer#getAreaNodes must be overridden.');
    }
};

/**
 * Cleans up dom elements created during the rendering process
 * (link tags, script tags, widget dom element)
 */
WidgetRenderer.prototype.destroy = function () {
    throw new Error('WidgetRenderer#destroy must be overriden.');
};

/**
 * Determines if the widget has already been rendered
 */
WidgetRenderer.prototype.isRendered = function() {
    throw new Error('WidgetRenderer#isRendered must be overridden.');
};



/**
 * Gets the widget mime type
 * @returns {string}
 */
WidgetRenderer.prototype.getType = function() {

	//default type for renderers
	return 'text/html';
};

/**
 * Returns a stack of start files. Renderers should first attempt to render the top start file in the stack
 * and pop on each failure until a successful start file is found
 * @param widgetPath
 * @param widgetModel
 * @returns {Array}
 */
WidgetRenderer.getResolvedStartFilePath = function(widgetPath, widgetModel) {

    var startFileName = widgetModel.content && widgetModel.content.src ? widgetModel.content.src : 'index.html';
	return makeFullPath(widgetPath, startFileName);
};

function makeFullPath(widgetPath, startFile) {

    var noResolve =
        //start file is absolute (http://...../index.html)
        util.isUrlAbsolute(startFile) ||
        //widget path is site relative (/path/to/widget) and so is start file (/assets/index.html)
        (util.isUrlSiteRelative(widgetPath) && util.isUrlSiteRelative(startFile)) ||
        //start file begins with the widget path    
        (widgetPath && util.startsWith(startFile, widgetPath));
    
    if(noResolve) {
        return startFile;
    } else {
        var joinWithSlash = !util.endsWith(widgetPath, '/') && !util.startsWith(startFile, '/');
        return joinWithSlash ? widgetPath + '/' + startFile : widgetPath + startFile;
    }
}

module.exports = WidgetRenderer;

},{"../util/util":78}],37:[function(require,module,exports){
/* jshint unused: vars */

/**
 * Widget Storage. This is an implementation of <a href="http://www.w3.org/TR/webstorage/">W3C Web Storage</a>
 * @module core/widget-storage
 * @exports {WidgetStorage} The widget storage constructor
 */

'use strict';

/**
 * Widget decorator for web storage
 * @param storage A web storage implementation. e.g. sessionStorage
 * @constructor
 * @interface
 */
function WidgetStorage(storage) {}

/**
 * Initializes the storage
 * @method
 * @param {string} widgetInstanceId The widget id. Typically used as a key prefix in the underlying impl
 * @param {Array} preferences An array of preferences objects to initialize the storage with
 */
WidgetStorage.prototype.init = function(widgetInstanceId, preferences) {
    throw new Error('WidgetStorage#init must be overridden.');
};

/**
 * Gets an item
 * @param {string} key of the item to get
 */
WidgetStorage.prototype.getItem = function(key) {
    throw new Error('WidgetStorage#getItem must be overridden.');
};

/**
 * Sets or updates an item
 * @param {string} key
 * @param {string} value
 * @param {boolean} readonly
 */
WidgetStorage.prototype.setItem = function(key, value, readonly) {
    throw new Error('WidgetStorage#setItem must be overridden.');
};

/**
 * Removes the item from storage
 * @param {string} key
 */
WidgetStorage.prototype.removeItem = function(key) {
    throw new Error('WidgetStorage#removeItem must be overridden.');
};

/**
 * Clears the storage
 * @param {string} key
 */
WidgetStorage.prototype.clear = function(key) {
    throw new Error('WidgetStorage#removeItem must be overridden.');
};

/**
 * Returns a list of the keys used by this storage
 * @returns {Array} a list of keys
 */
WidgetStorage.prototype.key = function(n) {
    throw new Error('WidgetStorage#key must be overridden.');
};

/**
 * Export the constructor
 * @type {WidgetStorage}
 */
module.exports = WidgetStorage;
},{}],38:[function(require,module,exports){
/**
 * Datasource resolver factory. It accepts resolver creating functions and use them to get
 * a resolver that can handle a datasource. @see {@link datasource/datasource-resolver} for more information on datasource
 * resolver.
 * @module datasource/datasource-resolver-factory
 * @exports {DatasourceResolverFactory}
 */

'use strict';

module.exports = DatasourceResolverFactory;

/**
 * Creates an instance of a factory
 * @param {Object} opts Options object. Holds configuration options that is passed to a resolver creating functions.
 * @constructor
 */
function DatasourceResolverFactory() {
    this._resolvers = [];
}

/**
 * Adds a datasource resolver creating function to a factory.
 * @param {Function} resolverFunc A function that accepts a datasource as the first argument and configuration options
 * object as the second argument. The function should return an instance of a datasource resolver if the resolver can
 * handle that datasource or return undefined otherwise.
 */
DatasourceResolverFactory.prototype.addResolver = function addResolver(resolverFunc) {
    if (typeof resolverFunc !== 'function') {
        throw new TypeError('resolverFunc argument must be a function');
    }

    this._resolvers.push(resolverFunc);
};

/**
 * Finds suitable datasource resolver for the given datasource. Throws an exception if a resolver not found.
 * If more than 1 resolver found, the last one returned.
 * @param {Object} datasource A datasource object
 * @param {string} datasource.name A datasource name
 * @param {string} datasource.uri A datasource URI
 * @param {Array<Object>} datasource.params A collection of objects that represent query parameters. An object has
 * name and value properties.
 * @returns {DatasourceResolver} An instance of a datasource resolver that can handle the datasource.
 */
DatasourceResolverFactory.prototype.getResolver = function getResolver(datasource) {
    var suitableResolvers = this._resolvers.map(function (resolverFunc) {
        return resolverFunc(datasource);
    }).filter(function (resolver) {
        return !!resolver;
    });

    var len = suitableResolvers.length;
    if (len === 0) {
        throw new Error('No datasource resolver found which can handle [' + datasource.uri + '] URI');
    }

    // return the last resolver in case more than one resolver found
    return suitableResolvers[len - 1];
};

},{}],39:[function(require,module,exports){
(function (global){
/**
 * A set of helpers a datasource resolver needs to build a request URL
 */
'use strict';

var EXPRESSION_TOKENIZER = /\$\{([^}\s]+)}/g;
var SLASHES_REGEXP = /^\/+|\/+$/g;

/**
 * Resolves expressions in a string. "${path_to_property}" is an expression where path_to_value is a
 * path to a property in the context object a value of which should replace the expression.
 * Path may reference a property of a nested object, for example ${propA.propB.propC}.
 * @param {Object} context An object an templateString is resolved against
 * @param {string} templateString A template string which may contain "${path}" expressions to be
 * replaced with actual values taken from the context object
 * @returns {string} The template string with resolved expressions
 */
function resolveExpression (context, templateString) {
    if (!templateString) {
        return '';
    }

    return templateString.replace(EXPRESSION_TOKENIZER, function (token, content) {
        var replaceValue = resolveValue(context, content);
        return replaceValue === undefined || replaceValue === null ? '' : replaceValue;
    });
}

/**
 * Takes a value of a property found by path
 * @param {Object} obj An object to traverse
 * @param {string} path A path to a property
 * @returns {*|undefined} A value of a property if it's found, undefined otherwise
 */
function resolveValue (obj, path) {
    var fields = typeof path === 'string' ? path.split('.') : path;
    var index = 0;
    var value = obj;
    var length = fields.length;

    while (value != null && index < length) { // jshint ignore:line
        value = value[fields[index++]];
    }

    return (index && index === length) ? value : undefined;
}

/**
 * Decodes string before encoding in order to avoid double encoding issue
 * @param {string} str A source string
 * @returns {string} URI encoded string
 */
function encodeURIComponent (str) {
    var decodedStr = str;

    try {
        decodedStr = global.decodeURIComponent(str);
    } catch(err) {}

    return global.encodeURIComponent(decodedStr);
}

/**
 * Trims slashes from string
 * @param {string} source A source string
 * @returns {string}
 */
function trimSlashes (source) {
    return source.trim().replace(SLASHES_REGEXP, '');
}

/**
 * Resolves expressions in datasource parameter name and value
 * @param {Object} context An object expressions are resolved against
 * @param {object} param A datasource parameter
 * @returns {Object} A parameter with name and/or value resolved
 */
function resolveParameter (context, parameter) {
    var param = parameter || {};
    var value = param.value;

    return {
        name: resolveExpression(context, param.name),
        value: typeof value === 'string' ? resolveExpression(context, value) : value
    };
}

/**
 * Builds query string from datasource parameters encoding their name and value
 * @param {Array} params An array of datasource parameters
 * @returns {string} A query string (name1=value1&name2=value2)
 */
function buildQueryString(params) {
    return (params || []).map(function (param) {
        return encodeURIComponent(param.name) + '=' + encodeURIComponent(param.value);
    }).join('&');
}

/**
 * Resolves parameter expressions and builds query string
 * @param {Object} context An object expressions are resolved against
 * @param {Array} params An array of datasource parameters
 * @returns {string} A query string
 */
function resolveQueryString(context, params) {
    var resolvedParams = (params || []).map(function (param) {
        return resolveParameter(context, param);
    }).filter(function (param) {
        return !!param.name;
    });

    return buildQueryString(resolvedParams);
}

module.exports = {
    resolveExpression   : resolveExpression,
    resolveParameter    : resolveParameter,
    buildQueryString    : buildQueryString,
    resolveQueryString  : resolveQueryString,
    encodeURIComponent  : encodeURIComponent,
    trimSlashes         : trimSlashes
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],40:[function(require,module,exports){
/**
 * Handles a datasource by relying on an underlying datasource-specific implementation
 * @module datasource/datasource-resolver
 * @exports {DatasourceResolver}
 */

'use strict';
var loggerFactory = require('../util/logger-factory');
var fetch         = require('../util/deduping-fetch');

/**
 * Verifies a datasource URI schema
 * @param {string} schema A schema a datasource must have
 * @param {Object} datasource A datasource object
 * @param {string} datasource.uri datasource URI
 * @returns {boolean}
 */
function defaultTestFunc(schema, datasource) {
    var uri = datasource && datasource.uri;
    return uri && uri.slice(0, schema.length).toLowerCase() === schema;
}

module.exports = DatasourceResolver;

/**
 * Creates an instance of DatasourceResolver
 * @param {Object} strategy A datasource-specific implementation of a resolver. It must have "resolveUrl" and
 * "processResponse" methods.
 * @constructor
 */
function DatasourceResolver(strategy) {
    this._resolverImpl = strategy;

    var parentLog = loggerFactory.getLogger();
    this._log = parentLog.child({childName: 'datasource-resolver'});
}

/**
 * Loads data from a datasource. Delegates URL resolution and response processing to an underlying implementation.
 * @param {Object} context An object the implementation uses as a context for expression resolution
 * @returns {Promise.<*>} A promise is resolved with what processResponse method of the implementation returns
 */
DatasourceResolver.prototype.loadData = function (context) {
    var resolver = this._resolverImpl;
    var url = resolver.resolveUrl(context);

    return fetch(url).then(function (response) {
        return !response.status || response.status >= 200 && response.status < 300 ?
            Promise.resolve(response) : Promise.reject(new Error(response.statusText));
    }).then(function (response) {
        return resolver.processResponse(response, context);
    });
};

/**
 * Creates a function that can be used by DatasourceResolverFactory to get a relevant datasource resolver
 * @param {string|Function} datasourceSchema Either a datasource URI schema or a function that verifies a resolver
 * can be used to handle a provided datasource
 * @param {Function} Resolver A constructor of datasource-specific resolver implementation.
 * @returns {Function} The function accepts a datasource parameter and returns either an instance of DatasourceResolver
 * initialized with the provided resolver implementation or undefined if the implementation cannot handle that
 * datasource.
 * @static
 */
DatasourceResolver.createFactoryFunction = function factoryFunc(datasourceSchema, Resolver) {
    var log = this._log;
    var testFunc = typeof datasourceSchema === 'function' ?
        datasourceSchema :
        defaultTestFunc.bind(null, datasourceSchema);

    return function (datasource) {
        if (testFunc(datasource)) {
            var resolverImpl = new Resolver(datasource, log);
            return new DatasourceResolver(resolverImpl);
        }
    };
};

},{"../util/deduping-fetch":72,"../util/logger-factory":77}],41:[function(require,module,exports){
(function (global){
/**
 * Ths standard CXP Widget Engine Configuration for Portals
 * @module core/widget-engine
 * @exports {Html5SeamlessWidgetEngine}
 */

// HTML5 Seamless widget wrapper
// -----------------------------

'use strict';

//core engine
var WidgetEngine = require('./core/widget-engine');

//strategies
var AutoConfigParser = require('./strategies/parser/auto-config-parser');
var FetchWidgetReader = require('./strategies/reader/fetch-widget-reader');
var Html5SeamlessRenderer = require('./strategies/renderer/html5-seamless-renderer');
var Html5LocalStorage = require('./strategies/storage/html5-local-storage');
var HandlebarsPreprocessor = require('./strategies/renderer/preprocessors/handlebars-preprocessor');
var SoyPreprocessor = require('./strategies/renderer/preprocessors/soy-preprocessor');

var DatasourceResolverFactory = require('./datasource/datasource-resolver-factory');
var ResourceDatasourceResolver = require('./strategies/datasource/resource-datasource-resolver');
var HttpDatasourceResolver = require('./strategies/datasource/http-datasource-resolver');

//built in plugins
var CxpAdditionsPlugin = require ('./plugins/cxp-additions-plugin');
var ReplaceConfigVarsPlugin = require ('./plugins/replace-config-vars-plugin');
var BackbaseFormatPlugin = require ('./plugins/backbase-format-plugin');

var loggerFactory = require('./util/logger-factory');
var util = require('./util/util');

// even though a new instance of widget engine is created for every item in a page, it's safe to use
// single processor/factory instances as configuration variables don't change.
var handlebarsPreprocessor = null;
var getHandlebarsInstance = function(configVars) {
    return handlebarsPreprocessor || (handlebarsPreprocessor = new HandlebarsPreprocessor(configVars));
};

var soyPreprocessor = null;
var getSoyInstance = function(configVars) {
    return soyPreprocessor || (soyPreprocessor = new SoyPreprocessor(configVars));
};

/**
 * Standard CXP Widget Engine
 * @param {Object} opts Config for construction
 * @param {Object} [opts.log] A custom parent Bunyan logger
 * @param {String} [opts.logLevel] A log level (trace,debug,info,warn,error). Defaults to 'info'
 * @constructor
 */
var Html5WidgetEngine = function(opts) {

    opts = opts || {};
    
    //This will create a static instance of a logger that subsequent calls to loggerFactory.getLogger() will retrieve
    loggerFactory.createLogger({
        parentLog: opts.log,
        loggerName: 'widget',
        logLevel: opts.logLevel,
        appendId: true
    });
};

/**
 * Initialize the container engine
 * @param {Object} opts Config for initialization
 * @param {String} opts.widgetPath A base path of the widget (without a file name)
 * @param {Object} opts.widgetEl The DOM element to render this widget in.
 * @param {String} [opts.configFile] The name of the config file to parse the widget meta data from. Defaults
 *                                   to 'model.xml'. Set this to 'model.xml' for Backbase format widgets
 * @param {Object} [opts.configVars] A map of key/values used to replace placeholders in widget configuration.
 *                                   E.g. $(contextRoot)
 * @constructor
 */
Html5WidgetEngine.prototype.init = function(opts) {

    opts = opts || {};

    var widgetPath = opts.widgetPath;
    var widgetEl = opts.widgetEl;
    var configVars = (this.configVars = opts.configVars || {});

    var reader = opts.reader || (opts.initialModel ? null : new FetchWidgetReader());
    var parser = opts.parser || new AutoConfigParser();
    var storage = opts.storage || new Html5LocalStorage();

    var renderer = opts.renderer;
    if (!renderer) {
        var factory = new DatasourceResolverFactory();
        factory.addResolver(ResourceDatasourceResolver.getInstance);
        factory.addResolver(HttpDatasourceResolver.getInstance);

        this._datasourceResolverFactory = factory;
        renderer = new Html5SeamlessRenderer(widgetEl, factory, {
            configVars: configVars
        });
    }

    //validate configuration options
    var confMsg;
    if(typeof widgetPath !== 'string') {
        confMsg = 'You must provide a widget path';
    } else if(!widgetEl) {
        confMsg = 'You must provide a widget parent node';
    }
    if(confMsg) {
        throw new Error(confMsg);
    }

    //pre processors for handlebars and soy
    var handlebarsPreprocessor = getHandlebarsInstance(configVars);
    renderer.addPreprocessor('text/x-handlebars-template', handlebarsPreprocessor);
    renderer.addPreprocessor('application/x-handlebars-template', handlebarsPreprocessor);

    var soyPreprocessor = getSoyInstance(configVars);
    renderer.addPreprocessor('application/x-soy', soyPreprocessor);

    //create the internal widget engine
    this.widgetEngine = new WidgetEngine({
        configFile: opts.configFile,
        widgetPath: widgetPath,
        parser: parser,
        reader: reader,
        renderer: renderer,
        storage: storage,
        initialModel: opts.initialModel
    });

    //proprietary backbase stuff that's not deprecated
    this.widgetEngine.addPlugin(new CxpAdditionsPlugin());

    //replaces placeholders $(...) in model value
    this.widgetEngine.addPlugin(new ReplaceConfigVarsPlugin({
        contextRoot: configVars.contextRoot,
        remoteContextRoot: configVars.remoteContextRoot || configVars.contextRoot, //still needed by mobile
        apiRoot: configVars.apiRoot,
        itemRoot: configVars.itemRoot || ''
    }, { 
        full: !!configVars.fullConfigReplacement 
    }));

    //angular usage is so ubiquitous we support it out of the box if the widget has an 'angular' preference set to true
    this.widgetEngine.addPlugin({
        name: 'Angular JS',
        postRender: function(widgetInstance, widgetRenderer) {
            var angular = global.angular;
            if(angular) {
                var widgetNode = widgetRenderer.getWidgetNode();
                var angularModule = 
                    widgetNode.getAttribute('widget-ng-app') || widgetNode.getAttribute('data-widget-ng-app');
                if(angularModule) {
                    var strictDi = widgetNode.getAttribute('ng-strict-di') || 
                                   widgetNode.getAttribute('data-ng-strict-di');
                    angular.element(document).ready(function() {
                        angular.module(angularModule).value('widget', widgetInstance);
                        angular.bootstrap(widgetInstance.body, [angularModule], {
                            strictDi: util.parseBoolean(strictDi)
                        });
                    });
                }
            }

            return widgetInstance;
        }
    });

};

/**
 * Add CXP5 compatibility
 * @param configVars
 */
Html5WidgetEngine.prototype.enableCompatibility = function() {
    
    var configVars = this.configVars || {};
    
    var bbPluginOpts = {
        apiRoot: configVars.apiRoot || '',
        contextRoot: configVars.contextRoot || '',
        remoteContextRoot: configVars.remoteContextRoot || ''
    };

    var csrfToken = configVars.csrfToken;
    if(csrfToken) {
        bbPluginOpts.csrfToken = csrfToken;
    }
    this.widgetEngine.addPlugin(new BackbaseFormatPlugin(bbPluginOpts));
};

/**
 * Start rendering
 * @return {Promise}
 */
Html5WidgetEngine.prototype.start = function() {

    return this.widgetEngine.start();
};

/**
 * Add a plugin
 * @param plugin
 * @return {Html5WidgetEngine}
 */
Html5WidgetEngine.prototype.addPlugin = function(plugin) {

    this.widgetEngine.addPlugin(plugin);
    return this;
};

/**
 * Add a feature
 * @param feature
 * @return {Html5WidgetEngine}
 */
Html5WidgetEngine.prototype.addFeature = function(feature) {

    this.widgetEngine.addFeature(feature);
    return this;
};

/**
 * Get the internal logger instance
 * @return {*}
 */
Html5WidgetEngine.prototype.getLogger = function() {

    return this.log;
};

/**
 * Destroys the widget rendered by this engine
 * @return {*}
 */
Html5WidgetEngine.prototype.destroy = function () {
    return this.widgetEngine.destroy();
};

/**
 * Registers a datasource creating function.
 * @param {Function} resolverFunc A function that accepts a datasource as the first argument and configuration options
 * object as the second one. The function should return an instance of a datasource resolver if the resolver can
 * handle that datasource or should return undefined otherwise.
 * @returns {Html5WidgetEngine}
 */
Html5WidgetEngine.prototype.addDatasourceResolver = function (resolverFunc) {
    if (this._datasourceResolverFactory) {
        this._datasourceResolverFactory.addResolver(resolverFunc);
        return this;
    } else {
        throw new Error('This method cannot be called when custom renderer is provided');
    }
};

//expose the widget engine constructor
module.exports = Html5WidgetEngine;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./core/widget-engine":33,"./datasource/datasource-resolver-factory":38,"./plugins/backbase-format-plugin":42,"./plugins/cxp-additions-plugin":49,"./plugins/replace-config-vars-plugin":50,"./strategies/datasource/http-datasource-resolver":51,"./strategies/datasource/resource-datasource-resolver":52,"./strategies/parser/auto-config-parser":53,"./strategies/reader/fetch-widget-reader":63,"./strategies/renderer/html5-seamless-renderer":64,"./strategies/renderer/preprocessors/handlebars-preprocessor":65,"./strategies/renderer/preprocessors/soy-preprocessor":66,"./strategies/storage/html5-local-storage":69,"./util/logger-factory":77,"./util/util":78}],42:[function(require,module,exports){
'use strict';

var loggerFactory   = require('../util/logger-factory');
var util            = require('../util/util');
var ExtPromise      = require('promise-extensions')();
var widgetHandlers  = require('./backbase-format/widget-handlers');
var legacyWidgetApi = require('./backbase-format/legacy-widget-api');
var IncludeObject   = require('./backbase-format/include-object');

var convertToArray  = Array.prototype.slice.call.bind(Array.prototype.slice);

module.exports = BackbaseFormatPlugin;

function BackbaseFormatPlugin(opts) {

    opts = opts || {};
    this.opts = opts;

    this.name = 'Backbase Format';
    this.portalConf = opts.portalConf || {};
    this.window = typeof window === 'undefined' ? opts.window : window;
    this.log = loggerFactory.getLogger();
    this.opts.log = this.log;
}

/**
 * Fix paths in the model
 * @param widgetModel
 */
BackbaseFormatPlugin.prototype.postRead = function(widgetModel) {
    //use hints in the model to guess if its a soy template
    if(widgetModel.preferences.viewNamespace && widgetModel.content.config && !widgetModel.content.src) {
        widgetModel.content.type = 'application/x-soy';
        widgetModel.content.src = widgetModel.content.config;
    }

    return widgetModel;
};

/**
 * Makes the widgetInstance backwards compatible with the Backbase Format
 * @param widgetInstance
 * @param renderer
 * @param widgetModel
 * @return Returns the enhanced widget instance
 */
BackbaseFormatPlugin.prototype.preRender = function(widgetInstance, renderer, widgetModel) {

    this.log.info('Backbase format plugin is running in PRE RENDER phase...');

    if(!widgetInstance.preferences.getItem('src')) {
        widgetInstance.preferences.defineItem({
            name: 'src',
            value: widgetModel.content.src,
            readonly: false
        });
    }
    if(!widgetInstance.preferences.getItem('thumbnailUrl')) {
        widgetInstance.preferences.defineItem({
            name: 'thumbnailUrl',
            value: widgetModel.icons[0],
            readonly: false
        });
    }

    //special case for legacy portal 5 preferences
    if(!widgetInstance.preferences.getItem('title')) {
        widgetInstance.preferences.defineItem({
            name: 'title',
            value: widgetModel.title,
            readonly: false
        });
    }

    var bbWidgetInstance = legacyWidgetApi.buildWidget(widgetInstance, widgetModel, this.log, this.portalConf.tags);

    //need to update the preferences' event target if it has already been set to the widget instance that was cloned
    var index = bbWidgetInstance.preferences.eventTarget ?
        bbWidgetInstance.preferences.eventTarget.indexOf(widgetInstance) : -1;
    if(index > -1) {
        bbWidgetInstance.preferences.eventTarget[index] = bbWidgetInstance;
    }

    this.log.info('Backbase format plugin PRE RENDER done.');

    return bbWidgetInstance;
};

/**
 * Parses special markup such as g:onload
 * @param widgetInstance
 * @param renderer
 * @param widgetModel
 */
BackbaseFormatPlugin.prototype.postRender = function(widgetInstance, renderer, widgetModel) {
    var self = this;
    var log = this.log;
    var window = this.window;
    var chain;

    log.info('Backbase format plugin is running in POST RENDER phase...');

    legacyWidgetApi.applyPresentationApi(widgetInstance, renderer, widgetModel, log);

    //g:includes
    var includeElements = convertToArray(widgetInstance.body.getElementsByTagName('g:include'));
    // in case of SSR, includeElements may contain g:includes from child items, so we need to filter
    // them out (issue BACKLOG-14601)
    var includes = includeElements.filter(function (gInclude) {
        return util.ensureElementBelongsToItem(widgetInstance.name, gInclude);
    }).map(function (gInclude) {
        return new IncludeObject(gInclude, widgetInstance, widgetModel, self.opts);
    });

    if (includes.length) {
        // define include related API on a widget instance
        widgetInstance.includes = includes;
        widgetInstance.refreshIncludes = function refreshIncludes() {
            var resultPromises = this.includes.map(function (include) {
                return include.refresh();
            });

            return ExtPromise.settleAll(resultPromises).then(function (inspections) {
                var errorCount = inspections.filter(function(includePromiseInspection) {
                    return includePromiseInspection.isRejected();
                }).length;
                if(errorCount > 0) {
                    log.warn('%s includes failed to resolve.', errorCount);
                }
            });
        };

        // replace g:include element with corresponding content holder node an include object has
        includes.forEach(function (include, i) {
            var gElement = includeElements[i];
            gElement.parentNode.replaceChild(include.htmlNode, gElement);
        });

        chain = widgetInstance.refreshIncludes();
    } else {
        chain = ExtPromise.resolve();
    }

    return chain.then(function () {
        //do handlers
        var chromeNode = findChromeNode(widgetInstance.body) || widgetInstance.body;
        widgetHandlers.handleLoad(window, widgetInstance, log);
        widgetHandlers.handlePrefModified(window, widgetInstance, log);
        widgetHandlers.handleMaximize(window, widgetInstance, chromeNode, log);
        widgetHandlers.handleRestore(window, widgetInstance, chromeNode, log);

        log.info('Backbase format plugin POST RENDER done.');

        return widgetInstance;
    });
};

function findChromeNode (element) {
    var parent = element;

    while (parent) {
        if (typeof parent.hasAttribute === 'function' && parent.hasAttribute('data-chrome')) {
            return parent;
        }
        parent = parent.parentNode;
    }
    
    return null;
}

},{"../util/logger-factory":77,"../util/util":78,"./backbase-format/include-object":44,"./backbase-format/legacy-widget-api":46,"./backbase-format/widget-handlers":48,"promise-extensions":139}],43:[function(require,module,exports){
'use strict';

var util    = require('../../util/util');

var convertToArray = Array.prototype.slice.call.bind(Array.prototype.slice);

module.exports = {
    getStartFileFolder      : getStartFileFolder,
    makeReferenceAbsolute   : makeRefAbsolute,
    resolveExpression       : resolveExpression,
    isEmpty                 : isEmpty,
    convertToArray          : convertToArray
};

function getStartFileFolder (startFile, contextRoot) {

    //strip file from widget src to get path
    var widgetPath = startFile.replace(/\/[^\/]+$/, '');
    //also replace context root placeholder
    widgetPath = widgetPath.replace(/\$\(contextRoot\)/, contextRoot);

    var startFilePath = util.isUrlAbsolute(startFile) ? startFile : widgetPath + '/' + startFile;

    return startFilePath.substring(0, startFilePath.lastIndexOf('/') + 1);
}

function makeRefAbsolute(html, remoteContextRoot) {
    if(typeof DOMParser !== 'undefined') {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var imgs = convertToArray(doc.getElementsByTagName('img'));

        imgs.forEach(function(img) {
            var src = img.getAttribute('src');
            if(src && util.isUrlSiteRelative(src)) {
                src = new URL(src, remoteContextRoot).href;
                img.setAttribute('src', src);
            }
        });

        return doc.body.innerHTML;        
    } else {
        return html;
    }
}

function resolveExpression(expression, context) {
    var parts = expression.split('.');

    function doNextPart(parts, val) {
        val = val[parts.shift()];
        if(parts.length > 0 && val && typeof val === 'object') {
            return doNextPart(parts, val);
        } else {
            return val;
        }
    }

    return doNextPart(parts, context);
}

function isEmpty(value) {
    return value === undefined || value === null || value === '';
}

},{"../../util/util":78}],44:[function(require,module,exports){
(function (global){
/* globals Promise: false */
'use strict';

var util                = require('../../util/util');
var bunyan              = require('browser-bunyan');
var helpers             = require('./include-helpers');
var ParameterBuilder    = require('./include-param-builder');
var fetch               = require('../../util/deduping-fetch');

var FormData    = global.FormData; // jshint ignore:line

module.exports = IncludeObject;

/**
 * Represents g:include element as an object with defined API
 * @param gIncludeNode
 * @param widget
 * @param widgetModel
 * @param opts
 * @constructor
 */
function IncludeObject(gIncludeNode, widget, widgetModel, opts) {
    opts = opts || {};

    var contextRoot = opts.contextRoot || '';
    var remoteContextRoot = opts.remoteContextRoot || '';
    var localSource = gIncludeNode.getAttribute('local') === 'true';
    var config = {
        replaceRegex: /\$\{([a-zA-Z0-9-_.]+)\}/g,
        log: opts.log,
        startFileFolder: helpers.getStartFileFolder(widgetModel.content.src, contextRoot),
        contextRoot: (localSource || !remoteContextRoot) ? contextRoot : remoteContextRoot,
        csrfToken: opts.csrfToken
    };

    Object.defineProperty(this, '_config', {
        value: config
    });

    this.widget = widget;
    this.uri = {
        template: gIncludeNode.getAttribute('src')
    };
    this.proxy = gIncludeNode.getAttribute('proxy') === 'true';
    this.method = gIncludeNode.getAttribute('method') || 'GET';

    var htmlNode = global.document.createElement('div');
    htmlNode.className = 'bp-g-include';

    this.htmlNode = htmlNode;

    var parameterBuilder = new ParameterBuilder(widgetModel, opts);
    this.params = parameterBuilder.buildParameters(this, gIncludeNode);
}

/**
 * Sets URI a include object should send requests to.
 * @param {String} uri
 */
IncludeObject.prototype.setURI = function setUri (uri) {
    if (uri && typeof uri === 'string') {
        this.uri.template = uri;
    }
};

/**
 * Returns resolved URI
 * @returns {*}
 */
IncludeObject.prototype.getContentURI = function getContentURI () {
    var src = this.uri.template;
    if (!src) {
        return '';
    }

    var config = this._config;
    var self = this;

    src = src.replace(config.replaceRegex, function (match, p1) {
        return self.widget.getPreference(p1);
    });

    src = src.replace('$(contextRoot)', config.contextRoot);
    if (util.isUrlDocumentRelative(src)) {
        src = config.startFileFolder + src;
        config.log.debug('g:include src after resolution is [%s]', src);
    }

    return src;
};

/**
 * Generates a request to a remote service and renders returned contents.
 * @returns {Promise} promise is resolved with html node that corresponds to this object
 */
IncludeObject.prototype.refresh = function refresh () {
    var config = this._config;
    var log = config.log;

    var requestParams = this._getRequestParams();
    var requestUrl = this._resolveRequestUrl(requestParams);
    var requestOptions = this._getRequestOptions(requestParams);

    // send request then append received HTML to htmlNode
    if(log.level() <= bunyan.DEBUG) {
        var fetchOptsJson = JSON.stringify(requestOptions, null, '\t');
        log.debug('Making g:include http request to [%s] with fetch opts: [%s]', requestUrl, fetchOptsJson);
    }

    return fetch(requestUrl, requestOptions).then(function(res) {
        log.debug('g:include request to [%s] completed with status: %s', requestUrl, res.status);
        return res.status >= 200 && res.status < 300 ?
            Promise.resolve(res.text()) : Promise.reject(res.statusText);
    }).catch(function(statusText) {
        return 'Unable to resolve g:include ( ' + statusText + ' )';
    }).then(function(html) {
        log.trace('Received html response:\n%s', html);
        if(util.isRunningOnFilesystem() && util.isUrlAbsolute(config.contextRoot)) {
            html = helpers.makeReferenceAbsolute(html, config.contextRoot);
        }
        
        this.htmlNode.innerHTML = html;
        this.htmlNode.setAttribute('data-src', requestUrl);

        return this.htmlNode;
    }.bind(this));
};

IncludeObject.prototype._getRequestParams = function getRequestParams () {
    var requestParams = [];

    if (this.proxy) {
        requestParams = this.params.filter(function (param) {
            return param.destination === 'proxy';
        });

        var contentUri = this.getContentURI();
        if (contentUri) {
            var targetQueryParamsString = this.params.filter(function (param) {
                return param.destination === 'target';
            }).map(function (param) {
                return param.toQueryString();
            }).filter(function (qStr) {
                return !!qStr;
            }).join('&');

            // create special 'url' parameter
            var urlParam = {
                name: 'url',
                getQueryParams: function() {
                    return [{
                        name: this.name,
                        value: contentUri + (contentUri.indexOf('?') !== -1 ? '&' : '?') + targetQueryParamsString
                    }];
                },
                toQueryString: function() {
                    var param = this.getQueryParams()[0];
                    return param.name + '=' + encodeURIComponent(param.value);
                }
            };

            requestParams.push(urlParam);
        }
    } else {
        requestParams = this.params.filter(function (param) {
            return param.destination === 'target';
        });
    }

    return requestParams;
};

IncludeObject.prototype._resolveRequestUrl = function resolveRequestUrl(requestParams) {
    var url = this.proxy ? this._config.contextRoot + '/proxy' : this.getContentURI();

    if (this.method && this.method.toUpperCase() !== 'POST') {
        var queryStr = requestParams.map(function (param) {
            return param.toQueryString();
        }).join('&');
        url += (url.indexOf('?') >= 0 ? '&' : '?') + queryStr;
    }

    return url;
};

IncludeObject.prototype._getRequestOptions = function(requestParams) {
    var config = this._config;
    var options = {};

    if (this.method && this.method.toUpperCase() === 'POST') {
        options.method = this.method;
        options.headers = {};
        options.body = this._constructFormData(requestParams);

        // CSRF token
        var csrfToken = config.csrfToken;
        if (csrfToken) {
            options.headers[csrfToken.name] = csrfToken.value;
        }
    }

    return options;
};

IncludeObject.prototype._constructFormData = function constructFormData(params) {
    var formData = new FormData();

    params.reduce(function (acc, param) {
        return acc.concat(param.getQueryParams());
    }, []).forEach(function (queryParam) {
        formData.append(queryParam.name, queryParam.value);
    });

    return formData;
};

// obsolete methods
['getContentIterator', 'hasContent', 'setContent'].forEach(function (method) {
    IncludeObject.prototype[method] = function() {
        this._config.log.warn('%s method is no longer supported in CXP6', method);
    };
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../util/deduping-fetch":72,"../../util/util":78,"./include-helpers":43,"./include-param-builder":45,"browser-bunyan":80}],45:[function(require,module,exports){
'use strict';

var helpers = require('./include-helpers');

module.exports = IncludeParameterBuilder;

/**
 * Builds g:include parameter objects.
 * @param {Object} widgetModel widget model
 * @param {Object} opts options
 * @constructor
 */
function IncludeParameterBuilder(widgetModel, opts) {
    this._widgetModel = widgetModel;
    this._log = opts.log;
    this._remoteContextRoot = opts.remoteContextRoot || '';
    this._contextRoot = opts.contextRoot || '';
    this._apiRoot = opts.apiRoot || '';

    // factory method map
    this._paramFactoryMap = {
        'g:http-param': this._buildHttpParam,
        'g:http-proxy-param': this._buildHttpProxyParam,
        'g:http-preference-param': this._buildPreferenceParam,
        'g:http-preference-param-map': this._buildPreferenceParamMap
    };
}

/**
 * Parses parameters found in g:include element and creates corresponding objects
 * @param {Object} includeObject include object created parameters belong to
 * @param {DOMElement} gIncludeNode g:include element
 * @returns {Array}
 */
IncludeParameterBuilder.prototype.buildParameters = function buildParameters(includeObject, gIncludeNode) {
    var self = this;
    // retain order of parameters
    var params = this._flattenElementTree(gIncludeNode).filter(function (node) {
        var nodeName = node.nodeName.toLowerCase();
        return (nodeName in self._paramFactoryMap);
    }).map(function (paramTag) {
        var nodeName = paramTag.nodeName.toLowerCase();
        var parseFunc = self._paramFactoryMap[nodeName];

        return parseFunc.call(self, paramTag, includeObject);
    }).filter(function (param) {
        return !!param;
    });

    // obsolete methods definition
    params.forEach(function (param) {
        ['getName', 'getValues'].forEach(function (method) {
            param[method] = function() {
                this._log.warn('%s method is no longer supported in CXP6', method);
            };
        });
    });

    return params;
};

/**
 * Converts tree of elements into a flat list of elements. Elements in a list are in document order.
 * @param rootElement
 * @returns {Array}
 * @private
 */
IncludeParameterBuilder.prototype._flattenElementTree = function flattenElementTree(rootElement) {
    var flatList = [];
    var currentNode = rootElement.firstChild;

    while (currentNode) {
        if (currentNode.nodeType === 1) { // element
            flatList.push(currentNode);
        }

        currentNode = currentNode.hasChildNodes() ? currentNode.firstChild : currentNode.nextSibling;
    }

    return flatList;
};

/**
 * Builds parameter object from g:http-param element
 * @param paramTag
 * @param includeObj
 * @param isProxy
 * @returns {Object}
 * @private
 */
IncludeParameterBuilder.prototype._buildHttpParam = function buildHttpParam(paramTag, includeObj, isProxy) {
    var contextRoot = this._remoteContextRoot || this._contextRoot;

    var param = new HttpParameter(paramTag, includeObj, this._log, isProxy, contextRoot, this._apiRoot);
    return param.value.template ? param : null;
};

/**
 * Builds parameter object flom g:http-proxy-param element
 * @param paramTag
 * @param includeObj
 * @returns {Object}
 * @private
 */
IncludeParameterBuilder.prototype._buildHttpProxyParam = function buildHttpProxyParam(paramTag, includeObj) {
    return this._buildHttpParam(paramTag, includeObj, true);
};

/**
 * Builds parameter object from g:http-preference-param element
 * @param paramTag
 * @param includeObj
 * @returns {Object}
 * @private
 */
IncludeParameterBuilder.prototype._buildPreferenceParam = function buildPreferenceParam(paramTag, includeObj) {
    var param = new PreferenceParameter(paramTag, includeObj, this._log);
    return param.name.template ? param : null;
};

/**
 * Builds parameter object from g:http-preference-param-map element
 * @param paramTag
 * @param includeObj
 * @returns {Object}
 * @private
 */
IncludeParameterBuilder.prototype._buildPreferenceParamMap = function buildPrefParamMap(paramTag, includeObj) {
    var param = new PreferenceMapParameter(paramTag, includeObj, this._log, this._widgetModel);
    return param._typeName ? param : null;
};


/**
 * Base parameter object
 * @param paramTag
 * @param includeObject
 * @param log
 * @param destination
 * @constructor
 */
function IncludeParameter(paramTag, includeObject, log, destination) {
    this.name = {
        template: paramTag.getAttribute('name')
    };
    this.value = {
        template: paramTag.getAttribute('value')
    };
    this.destination = destination || 'target';
    this.method = (paramTag.getAttribute('method') || includeObject.method || 'GET').toUpperCase();

    // read-only "internal" properties
    Object.defineProperty(this, '_include', {value: includeObject});
    Object.defineProperty(this, '_log', {value: log});
}


IncludeParameter.prototype.getQueryParams = function toQueryString() {
    return [];
};

IncludeParameter.prototype.toQueryString = function toQueryString() {
    return this.getQueryParams().map(function (param) {
        return param.name + '=' + encodeURIComponent(param.value);
    }).join('&');
};


/**
 * Represents g:http-preference-param-map parameter
 * @param paramTag
 * @param includeObject
 * @param log
 * @param widgetModel
 * @constructor
 */
function PreferenceMapParameter(paramTag, includeObject, log, widgetModel) {
    IncludeParameter.call(this, paramTag, includeObject, log);

    var dataType = paramTag.getAttribute('dataType') || paramTag.getAttribute('datatype');
    // type is used to build query param name
    Object.defineProperty(this, '_typeName',  {
        value: dataType
    });

    // remember name of preferences with the same type
    var prefs = widgetModel.preferences || {};
    var prefsOfType = Object.keys(prefs).filter(function (prefName) {
        return prefs[prefName].type === dataType;
    });

    Object.defineProperty(this, '_prefs',  {
       value: prefsOfType
    });
}

PreferenceMapParameter.prototype = Object.create(IncludeParameter.prototype);

PreferenceMapParameter.prototype.getQueryParams = function() {
    var namespace = this._typeName;
    var self = this;

    return this._prefs.map(function (prefName) {
        return {
            name: namespace + '.' + prefName,
            value: self._include.widget.getPreference(prefName)
        };
    });
};

/**
 * Represents g:http-preference-param parameter
 * @param paramTag
 * @param includeObject
 * @param log
 * @constructor
 */
function PreferenceParameter(paramTag, includeObject, log) {
    IncludeParameter.call(this, paramTag, includeObject, log);
}

PreferenceParameter.prototype = Object.create(IncludeParameter.prototype);

PreferenceParameter.prototype.getQueryParams = function() {
    var name = this.name ? this.name.template : null;
    if (helpers.isEmpty(name)) {
        return [];
    }

    var value = this._include.widget.getPreference(name);
    if (helpers.isEmpty(value)) {
        this._log.warn('Failed to resolve g:include parameter value. Parameter - [%s]', name);
    }

    return [{
        name: name,
        value: value
    }];
};

/**
 * Represents g:http-param & g:http-proxy-param parameters
 * @param paramTag
 * @param includeObject
 * @param log
 * @param isProxy
 * @param contextRoot
 * @constructor
 */
function HttpParameter(paramTag, includeObject, log, isProxy, contextRoot, apiRoot) {
    var destination = isProxy ? 'proxy' : 'target';
    IncludeParameter.call(this, paramTag, includeObject, log, destination);

    // read-only "internal" properties
    Object.defineProperty(this, '_replaceRegex', {value: /\$\{([a-zA-Z0-9-_]+)\}/});
    Object.defineProperty(this, '_contextRoot', {value: contextRoot});
    Object.defineProperty(this, '_apiRoot', {value: apiRoot});
}

HttpParameter.prototype = Object.create(IncludeParameter.prototype);

HttpParameter.prototype.getQueryParams = function() {
    var name = this.name ? this.name.template : null;
    var value = this.value ? this.value.template : null;
    var origValue = value;
    var widget = this._include.widget;
    var contextRoot = this._contextRoot;
    var apiRoot = this._apiRoot;

    if (helpers.isEmpty(name) || helpers.isEmpty(value)) {
        return [];
    }

    // resolve value
    value = value.replace(this._replaceRegex, function (match, p1) {
        //special case for contextRoot & apiRoot
        if (p1 === 'contextRoot') {
            return contextRoot;
        } else if (p1 === 'apiRoot') {
            return apiRoot;
        } else {
            return widget.getPreference(p1);
        }
    });

    if (value.indexOf('__WIDGET__') === 0) {
        var expression = value.split('.').filter(function(it, i) {
            return i !== 0;
        }).join('.');

        value = helpers.resolveExpression(expression, widget);

        if (helpers.isEmpty(value)) {
            this._log.warn('Failed to resolve g:include parameter value. Parameter - [%s], unresolved value - [%s], ' +
                'resolved value - [%s]',
                name, origValue, value);
        }
    }

    return [{
        name: name,
        value: value
    }];
};

},{"./include-helpers":43}],46:[function(require,module,exports){
(function (process,global){
'use strict';

var util                    = require('../../util/util');
var EventTarget             = require('../../util/event-target');
var warnDeprecatedAccess    = require('./warn-deprecated-access');
var StorageEvent            = require('../../strategies/storage/storage-event');

function buildWidget(widget, widgetModel, log, tags) {
    var WIDGET_TYPE = 'backbaseWidget';

    // need to clone the widget because we can't change readonly properties
    var bbWidgetInstance = util.cloneDeep(widget);

    bbWidgetInstance.width          = widget.width;
    bbWidgetInstance.height         = widget.height;
    bbWidgetInstance.preferences    = widget.preferences;
    bbWidgetInstance.features       = widget.features;
    bbWidgetInstance.id             = widgetModel.id || Math.random().toString(36).substr(2, 5);
    bbWidgetInstance.name           = widgetModel.name;
    bbWidgetInstance.nodeType       = 1;
    bbWidgetInstance.nodeValue      = WIDGET_TYPE;
    bbWidgetInstance.margins        = { top: 0, right: 0, bottom: 0, left: 0 };
    
    //the event targets are not cloned because they are not enumerable
    Object.getOwnPropertyNames(widget).forEach(function(key) {
        if(util.startsWith(key, '@@')) {
            bbWidgetInstance[key] = widget[key];
        }
    });
    
    // definition
    bbWidgetInstance.myDefinition = {
        sUrl: widgetModel.content.src
    };

    // node & tag names
    bbWidgetInstance.nodeName = WIDGET_TYPE;
    bbWidgetInstance.tagName = WIDGET_TYPE;

    // tags
    bbWidgetInstance.tags = Array.isArray(tags) ? tags : [];

    // MODEL
    bbWidgetInstance.model = createModel(bbWidgetInstance, widgetModel);

    // DEPRECATED FIELDS
    warnDeprecatedAccess(bbWidgetInstance, log);

    // FUNCTIONS
    setMethods(bbWidgetInstance);

    // EVENTS
    if(bbWidgetInstance.addEventListener && bbWidgetInstance.dispatchEvent) {
        bbWidgetInstance.addEventListener('storage', function (e) {
            log.debug('Chaining StorageEvent to Backbase \'PrefModified\' event...');

            var PREF_MODIFIED_EVENT = 'PrefModified';
            var chainedEvent = new StorageEvent(PREF_MODIFIED_EVENT);
            chainedEvent.initStorageEvent(PREF_MODIFIED_EVENT, false, false, e.key, e.oldValue, e.newValue, e.url,
                bbWidgetInstance.preferences);
            chainedEvent.attrName = e.key;
            chainedEvent.prevValue = e.oldValue;
            bbWidgetInstance.model.dispatchEvent(chainedEvent);
        });
    }

    return bbWidgetInstance;
}

function applyDomRelatedApi(widget, renderer, widgetModel, log) {
    var widgetNode = widget.body || renderer.getWidgetNode();
    var onloadAttr = widgetNode.getAttribute('g:onload');

    //only do this stuff if the widget is using a g:onload
    if(onloadAttr) {
        //wraps the widget in a 'widget body' element
        var body = global.document.createElement('div');
        var widgetParent  = widgetNode.parentNode;
        var widgetSibling = widgetNode.nextSibling;

        body.appendChild(widgetNode);
        body.className = 'bp-widget-body';

        if (widgetSibling) {
            widgetParent.insertBefore(body, widgetSibling);
        } else {
            widgetParent.appendChild(body);
        }

        //assigns the body to the inner body node required by backbase widgets.
        widget.body = body;
    }

    widget.htmlNode = findChromeNode(widgetNode);
    widget.refreshHtml = function () {
        var cxpFeature = this.features && this.features.cxp;
        if (cxpFeature) {
            cxpFeature.render.rerenderItem(widgetModel.id, widgetModel.name, widgetModel);
        } else {
            log.warn('A widget is required to have "CXP" feature in order to be able to refresh its view.');
        }
    };
}

function createModel(widget, widgetModel) {
    var model = {

        // general stuff
        jxid: 'VIEW-' + widgetModel.name,
        localName: 'Widget',
        name: widgetModel.name,
        tag: 'widget',
        tagName: 'Widget',

        //portal conf
        contextItemName:  widget.features && widget.features.cxp && widget.features.cxp.config ?
            widget.features.cxp.config.get('portalName') : null,
        extendedItemName: widgetModel.extendedItemName || null,
        parentItemName: widgetModel.parentItemName || null,
        securityProfile: widgetModel.securityProfile || null,
        uuid: widgetModel.id || null,

        //preferences
        preferences: makePreferences(widget.preferences),

        //tags
        tags: Array.isArray(widgetModel.tags) ? widgetModel.tags : [],

        // methods
        addEventListener: EventTarget.addEventListener,
        removeEventListener: EventTarget.removeEventListener,
        dispatchEvent: EventTarget.dispatchEvent
    };

    model.save = function(callback) {
        var self = this;
        process.nextTick(function() {
            if(typeof callback === 'function') {
                var ctx = {
                    contextItemName:  self.contextItemName,
                    name: self.name,
                    preferences: self.preferences,
                    tag: self.tag
                };
                var mockXhr = {
                    status: 204,
                    statusText: 'No Content',
                    readyState: 4
                };
                callback.call(global, ctx, mockXhr);
            }

        });
    };

    model.getPreference = function(key) {
        return widget.preferences.getItem(key);
    };
    model.setPreference = function(key, value) {
        widget.preferences.setItem(key, value);
    };

    return model;
}

function setMethods(widget) {
    widget.getPreference = function (key) {
        return this.preferences.getItem(key);
    };

    widget.getPreferenceFromParents = widget.getPreference;
    widget.getAreaPreference = function () {
        return this.preferences.getItem('area') || 0;
    };

    widget.getOrderPreference = function () {
        return this.preferences.getItem('order');
    };

    widget.setPreference = function (key, value) {
        this.preferences.setItem(key, value);
    };

    widget.getDefinition = function () {
        return widget.myDefinition;
    };

    widget.setAreaPreference = function (area) {
        this.preferences.setItem('area', area);
    };

    widget.setOrderPreference = function (order) {
        this.preferences.setItem('order', order);
    };
}

function makePreferences(storage) {
    return storage._items;
}

function findChromeNode (element) {
    var parent = element;

    while (parent) {
        if (typeof parent.hasAttribute === 'function' && parent.hasAttribute('data-chrome')) {
            return parent;
        }
        parent = parent.parentNode;
    }

    return null;
}

module.exports = {
    buildWidget: buildWidget,
    applyPresentationApi: applyDomRelatedApi
};

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../strategies/storage/storage-event":70,"../../util/event-target":73,"../../util/util":78,"./warn-deprecated-access":47,"_process":172}],47:[function(require,module,exports){
'use strict';

module.exports = warnDeprecatedPropertyAccess;

// Widget instance variables supported by PC5 but obselete in 6.0
// Access to these fields will print warning on the console
var unsupportedProperties = [
    'attributes', 'childNodes', 'cls_custom', 'cnBase', 'firstChild', 'flex', 'htmlArea',
    'htmlDoc', 'htmlFoot', 'htmlHead', 'lastChild', 'layout', 'local_listeners', 'localName',
    'namespaceURI', 'nextSibling', 'node', 'ownerDocument', 'parentNode', 'perspective',
    'prefix', 'previousSiblings'
];

// Widget instance methods supported by PC5 but obselete in 6.0
// Access to these methods will print warning on the console
var unsupportedMethods = [
    'appendChild', 'cloneNode', 'createDisplay', 'createPerspective', 'destroy',
    'disableDesignMode', 'dragIsTarget', 'enableDesignMode', 'getAreaOrderedChildren',
    'getAttribute', 'getAttributeNS', 'getClassID', 'getCurrentPerspective', 'getDisplay',
    'getDisplayEventTarget', 'getDisplayModel', 'getElementsByTagName', 'getElementsByTagNameNS',
    'getHTMLArea', 'hasAttribute', 'hasAttributeNS', 'hasAttributes', 'hasChildNodes',
    'hideDesignTools', 'hideDragTargets', 'insertBefore', 'insertDisplayChild', 'loadChildren',
    'lookupNamespaceURI', 'refreshIncludes', 'removeAttribute', 'removeAttributeNS', 'removeChild',
    'renderDisplay', 'replaceChild', 'setAttribute', 'setAttributeNS', 'setCurrentPerspective',
    'showDesignTools', 'showDragTargets', 'template'
];

function warnUnsupported (log, field, isMethod) {
    return function () {
        var message = 'COMPATIBILITY: %s is a widget %s that is no longer supported in CXP6';
        log.warn(message, field, isMethod ? 'method' : 'property');
    };
}

function warnDeprecatedPropertyAccess (widgetInstance, log) {
    var unsupportedPropertyDefinitions = unsupportedProperties.reduce(function (defs, field) {
        defs[field] = {
            enumerable: true,
            get: warnUnsupported(log, field),
            set: warnUnsupported(log, field)
        };

        return defs;
    }, {});

    Object.defineProperties(widgetInstance, unsupportedPropertyDefinitions);

    unsupportedMethods.reduce(function (instance, method) {
        instance[method] = warnUnsupported(log, method, true);
        return instance;
    }, widgetInstance);

    return widgetInstance;
}

},{}],48:[function(require,module,exports){
'use strict';

// see https://my.backbase.com/docs/product-documentation/documentation/portal/5.6.1/references_widgetnamespace.html#/list

var util = require('../../util/util');

module.exports = {
    handleLoad: handleLoad,
    handleMaximize: handleMaximize,
    handleRestore : handleRestore,
    handlePrefModified: handlePrefModified
};

/**
 * g:onload
 * @param window
 * @param widgetInstance
 * @param log
 */
function handleLoad(window, widgetInstance, log) {
    var event = 'onload';
    var gOnloadAttr = getEventAttribute(event, widgetInstance.body, widgetInstance.name);
    if(gOnloadAttr) {
        executeScript(window, widgetInstance.id, gOnloadAttr, event, log);
    }
}

/**
 * g:onPrefModified
 * @param window
 * @param widgetInstance
 * @param log
 */
function handlePrefModified(window, widgetInstance, log) {
    var event = 'onPrefModified';
    var gPrefModifiedAttr = getEventAttribute(event, widgetInstance.body, widgetInstance.name);
    if(gPrefModifiedAttr) {
        widgetInstance.model.addEventListener('PrefModified', function() {
            executeScript(window, widgetInstance.id, gPrefModifiedAttr, event, log);
        });
    }
}

/**
 * g:onmaximize
 * @param window
 * @param widgetInstance
 * @param chromeNode
 * @param log
 */
function handleMaximize(window, widgetInstance, chromeNode, log) {
    var event = 'onmaximize';
    var gMaximizeAttr = getEventAttribute(event, widgetInstance.body, widgetInstance.name);
    if(gMaximizeAttr) {
        chromeNode.addEventListener('click', function(ev) {
            if(ev.target.getAttribute('data-cxp-viewmode') === 'maximized') {
                executeScript(window, widgetInstance.id, gMaximizeAttr, event, log);
            }
        });
    }
}

/**
 * g:onrestore
 * @param window
 * @param widgetInstance
 * @param chromeNode
 * @param log
 */
function handleRestore(window, widgetInstance, chromeNode, log) {
    var event = 'onrestore';
    var gRestoreAttr = getEventAttribute(event, widgetInstance.body, widgetInstance.name);
    if(gRestoreAttr) {
        chromeNode.addEventListener('click', function(ev) {
            if(ev.target.getAttribute('data-cxp-viewmode') === 'windowed') {
                executeScript(window, widgetInstance.id, gRestoreAttr, event, log);
            }
        });
    }
}

/**
 * Utility to get the value of g namespaced attribute (g:onload). Getting attributes with namespaces can be fickle
 * @param attrName
 * @param widgetBodyNode
 * @return {*}
 */
function getEventAttribute(attrName, widgetBodyNode, itemName) {

    var el = widgetBodyNode.querySelector('div[g\\:' + attrName + ']'); //need to escape in query selector

    if(el && util.ensureElementBelongsToItem(itemName, el)) {
        return el.getAttribute('g:' + attrName);
    }

    return null;
}

/**
 * Evaluates a script that you'd expect to find in a g namespace handler
 * @param window
 * @param widgetId
 * @param scriptText
 * @param eventName
 * @param log
 */
function executeScript(window, widgetId, scriptText, eventName, log) {
    try {
        log.debug('Executing g:%s script...', eventName);
        var widgetAccessor = window.cxp._widgets ? 'window.cxp._widgets[\'' + widgetId + '\']' : 'window.widget';
        var script = scriptText.replace(/(__WIDGET__|__GADGET__)/, widgetAccessor);
        window.eval('(function() {' + script + '})()');  // jshint ignore:line
    } catch (err) {
        //this gives a bit more context for common errors
        var msgDetails = /is not defined$/.test(err.message) ?
            'This maybe because in CXP6 functions in start files must be explicitly declared on the global scope' : '';
        log.warn('g:%s failed! %s', eventName, msgDetails);
        log.error(err);
    }
}

},{"../../util/util":78}],49:[function(require,module,exports){
'use strict';

var EventTarget = require('../util/event-target');

/**
 * This plugins adds a few features that deviate from the spec to support running Widgets in CXP environments
 * @param opts
 * @constructor
 */
var CxpAdditionsPlugin = function() {
    this.name = 'CXP Additions Plugin';
};

/**
* Converts widget preferences array into a preferences object
* @param widgetModel
*/
CxpAdditionsPlugin.prototype.postRead = function(widgetModel) {
    var preferences = widgetModel.preferences;

    //check if it is an array then convert array to object
    if(Array.isArray(preferences)) {
        widgetModel.preferences = preferences.reduce(function (acc, pref) {
            acc[pref.name] = pref;
            return acc;
        }, {});
    }

    return widgetModel;
};

/**
 * Mixes in an EventTarget impl to the widget interface
 * @param widgetInstance
 */
CxpAdditionsPlugin.prototype.preRender = function(widgetInstance) {

    //add event listener
    widgetInstance.addEventListener = EventTarget.addEventListener;
    widgetInstance.removeEventListener = EventTarget.removeEventListener;
    widgetInstance.dispatchEvent = EventTarget.dispatchEvent;

    //if the event target for storage events wasn't already set, default it to the widget instance
    var eventTarget = widgetInstance.preferences.eventTarget = widgetInstance.preferences.eventTarget || [];

    // TODO: we need to remove widgetInstance from collection of event targets when it's destroyed. Currently
    // we have no means to be notified of that event.
    if(eventTarget.indexOf(widgetInstance) === -1) {
        eventTarget.push(widgetInstance);
    }

    return widgetInstance;
};

module.exports = CxpAdditionsPlugin;
},{"../util/event-target":73}],50:[function(require,module,exports){
'use strict';

var loggerFactory = require('../util/logger-factory');
var bunyan = require('browser-bunyan');

/**
 * @class ReplaceConfigVarsPlugins
 * @param varMap
 * @param opts
 * @constructor
 */
var ReplaceConfigVarsPlugins = function (varMap, opts) {
    opts = opts || {};

    this.name = 'Replace Config Vars';
    this.varMap = varMap;
    this.full = !!opts.full;
    this.interpolateStartRegex = opts.interpolateStartRegex || '\\$\\(';
    this.interpolateEndRegex = opts.interpolateEndRegex || '\\)';
    this.log = loggerFactory.getLogger();
};

/**
 * Fix paths in the model
 * @param widgetModel
 */
ReplaceConfigVarsPlugins.prototype.postRead = function (widgetModel) {

    var self = this;
    var log = this.log;

    log.info('Replace config vars plugin is running is POST READ phase...');

    /*
    * This is special case for content widgets where $(contextRoot) should not be replaced
    * in a preference with name "templateUrl" or in a datasource query parameter with name "template".
    * It's a fragile solution but at the moment there is no way to mark a preference in a model for exclusion.
    * */
    var excludeObjects = this._getExcludeObjects(widgetModel);
    if (excludeObjects.length) {
        excludeObjects.forEach(function(obj) {
            obj.value = obj.value.replace('contextRoot', '__contextRoot__');
        });
    }

    if (self.full) {
        log.debug('Doing full config vars replacement...');
        self._traverse(widgetModel);
    } else {
        log.debug('Doing minimal config vars replacement...');

        if (widgetModel.content && widgetModel.content.src) {
            widgetModel.content.src = self._replaceVars('src', widgetModel.content.src);
        }

        if (widgetModel.content && widgetModel.content.config) {
            widgetModel.content.config = self._replaceVars('config', widgetModel.content.config);
        }

        if (widgetModel.icons) {
            widgetModel.icons.forEach(function (icon, index, icons) {
                icons[index] = self._replaceVars('icons[' + index + ']', icon);
            });
        }

        //special preferences
        var messages = widgetModel.preferences.messages;
        if(messages) {
            messages.value = self._replaceVars('messages', messages.value);
        }

        if (widgetModel.datasources) {
            self._traverse(widgetModel.datasources);
        }

        if(widgetModel.altContent) {
            var alternateContentNames = Object.keys(widgetModel.altContent);
            alternateContentNames.forEach(function (contentName) {
                var content = widgetModel.altContent[contentName];
                content.src = self._replaceVars('src.' + contentName, content.src);
            });
        }
    }

    if (excludeObjects.length) {
        excludeObjects.forEach(function(obj) {
            obj.value = obj.value.replace('__contextRoot__', 'contextRoot');
        });
    }

    log.info('Replace config vars plugin in POST READ is DONE.');

    return widgetModel;
};

/**
 * Traverse object
 * @param {Object.<string, *>} obj
 * @private
 */
ReplaceConfigVarsPlugins.prototype._traverse = function (obj) {

    Object.keys(obj).forEach(function (key) {
        obj[key] = this._replaceVars(key, obj[key]);

        if (!!obj[key] && typeof obj[key] === 'object') {
            this._traverse(obj[key]);
        }
    }, this);
};

/**
 * Finds "templateUrl" preference and "template" datasource parameters in a widget model
 * @param {Object} widgetModel A widget model
 * @private
 */
ReplaceConfigVarsPlugins.prototype._getExcludeObjects = function (widgetModel) {
    var datasources = widgetModel.datasources || {};

    var templateParams = Object.keys(datasources).map(function (dsName) {
        return datasources[dsName];
    }).reduce(function(params, datasource) {
        return params.concat(datasource.params);
    }, []).filter(function(param) {
        return param.name === 'template' && typeof param.value === 'string';
    });

    var prefs = widgetModel.preferences || {};
    var templatePrefs = Object.keys(prefs).map(function (prefName) {
        return prefs[prefName];
    }).filter(function(pref) {
        return pref.name === 'templateUrl' && typeof pref.value === 'string';
    });

    return templateParams.concat(templatePrefs);
};

/**
 * Replace vars
 * @param key
 * @param value
 * @returns {*}
 * @private
 */
ReplaceConfigVarsPlugins.prototype._replaceVars = function (key, value) {
    if (typeof value !== 'string') {
        return value;
    }

    var self = this;
    var log = self.log;
    var varMap = self.varMap;

    var urlVars = Object.keys(varMap);

    urlVars.forEach(function (urlVar) {
        var varRegexp = new RegExp(self.interpolateStartRegex + urlVar + self.interpolateEndRegex, 'g');

        if (log.level() <= bunyan.DEBUG && varRegexp.test(value)) {
            log.debug('Replacing occurences of [%s] with [%s] where [%s=%s]',
                varRegexp, varMap[urlVar], key, value);
        }

        value = value.replace(varRegexp, varMap[urlVar]);
    });

    return value;
};

module.exports = ReplaceConfigVarsPlugins;

},{"../util/logger-factory":77,"browser-bunyan":80}],51:[function(require,module,exports){
/**
 * Implements "HTTP" datasource resolver
 * @see {@link https://backbase.atlassian.net/wiki/display/PrM/Datasources+URI+spec#DatasourcesURIspec-HTTPURI}
 * @module strategies/datasource/http-datasource-resolver
 * @exports {HttpDatasourceResolver}
 */

'use strict';

var DatasourceResolver  = require('../../datasource/datasource-resolver');
var resolverHelpers     = require('../../datasource/datasource-resolver-helpers');
var util                = require('../../util/util');
var sanitizer           = require('sanitizer');

var httpSchemaRegexp = /^https?:/i;

function isHttpDatasource(datasource) {
    var uri = datasource && datasource.uri;

    return uri && httpSchemaRegexp.test(uri);
}

module.exports = HttpDatasourceResolver;

/**
 * HTTP datasource resolver
 * @param {Object} datasource
 * @constructor
 */
function HttpDatasourceResolver(datasource) {
    this._datasource = datasource;
}

/**
 * Builds an endpoint URL of http datasource
 * @param {Object} context An object expressions in datasource URI are resolved against
 * @returns {string} A URL of an endpoint where data can be requested from
 */
HttpDatasourceResolver.prototype.resolveUrl = function (context) {
    var queryString = resolverHelpers.resolveQueryString(context, this._datasource.params);
    var endpoint = resolverHelpers.resolveExpression(context, this._datasource.uri);

    if (queryString) {
        endpoint += '?' + queryString;
    }

    return endpoint;
};

/**
 * Sanitizes response if it's HTML data
 * @param {Response} response Fetch API response object
 * @returns {Promise.<string|Object>} promise resolved with HTML string or plain object
 */
HttpDatasourceResolver.prototype.processResponse = function processResponse(response) {
    return util.getContentBodyAndTypeFromResponse(response).then(function (result) {
        return result.type === 'html' ? sanitizer.sanitize(result.body) : result.body;
    });
};

/**
 * Checks whether a datasource is of http type and creates a resolver instance
 * if check passes. Use this method as a resolver creating function registered with
 * datasource resolver factory.
 * @param {Object} datasource A datasource to check
 * @returns {DatasourceResolver|undefined}
 */
HttpDatasourceResolver.getInstance =
    DatasourceResolver.createFactoryFunction(isHttpDatasource, HttpDatasourceResolver);


},{"../../datasource/datasource-resolver":40,"../../datasource/datasource-resolver-helpers":39,"../../util/util":78,"sanitizer":27}],52:[function(require,module,exports){
/**
 * Implements "resource" datasource resolver.
 * @see {@link https://backbase.atlassian.net/wiki/display/PrM/Datasources+URI+spec#DatasourcesURIspec-ResourceURI}
 * @module strategies/datasource/resource-datasource-resolver
 * @exports {ResourceDatasourceResolver}
 */

'use strict';

var DatasourceResolver  = require('../../datasource/datasource-resolver');
var resolverHelpers     = require('../../datasource/datasource-resolver-helpers');
var util                = require('../../util/util');
var sanitizer           = require('sanitizer');

module.exports = ResourceDatasourceResolver;

/**
 * Resource datasource resolver
 * @param {Object} datasource
 * @constructor
 */
function ResourceDatasourceResolver(datasource) {
    this._datasource = datasource;
    this._sanitizeParamName = 'sanitize';
}

/**
 * Builds an endpoint URL of resource datasource
 * @param {Object} context An object expressions in datasource URI are resolved against
 * @returns {string} A URL of an endpoint where data can be requested from
 */
ResourceDatasourceResolver.prototype.resolveUrl = function (context) {
    var url = this._datasource.uri;
    var sanitizeParam = this._sanitizeParamName;
    var apiRoot = context.apiRoot || '';
    var baseUrl = context.itemRoot || '';
    var urlComponents = url.split(':');

    if (urlComponents.length !== 2) {
        throw new Error('Invalid resource datasource uri: ', url);
    }

    var params = (this._datasource.params || []).filter(function (param) {
        return param.name !== sanitizeParam;
    });
    var queryString = resolverHelpers.resolveQueryString(context, params);
    var resourcePath = resolverHelpers.resolveExpression(context, urlComponents[1]);
    var endpoint;

    // it would be better to support ${itemRoot} rather than relative/absolute paths
    if (util.isUrlDocumentRelative(resourcePath)) {
        endpoint = baseUrl + '/' + resourcePath;
    } else {
        endpoint = apiRoot + '/portal' + resourcePath;
    }

    if (queryString) {
        endpoint += '?' + queryString;
    }

    return endpoint;
};

/**
 * Sanitizes response if it's HTML data
 * @param {Response} response Fetch API response object
 * @returns {Promise.<string|Object>} promise resolved with HTML string or plain object
 */
ResourceDatasourceResolver.prototype.processResponse = function processResponse(response) {
    var params = this._datasource.params || [];
    var sanitizeParam = this._sanitizeParamName;

    return util.getContentBodyAndTypeFromResponse(response).then(function (result) {
        var skipSanitization;

        if (result.type === 'html') {
            skipSanitization = params.some(function (param) {
                return param.name === sanitizeParam && param.value === 'false';
            });
        } else {
            skipSanitization = true;
        }

        return skipSanitization ? result.body : sanitizer.sanitize(result.body);
    });
};

/**
 * Checks whether a datasource is of resource type and creates a resolver instance
 * if check passes. Use this method as a resolver creating function registered with
 * datasource resolver factory.
 * @param {Object} datasource A datasource to check
 * @returns {DatasourceResolver|undefined}
 */
ResourceDatasourceResolver.getInstance =
    DatasourceResolver.createFactoryFunction('resource', ResourceDatasourceResolver);

},{"../../datasource/datasource-resolver":40,"../../datasource/datasource-resolver-helpers":39,"../../util/util":78,"sanitizer":27}],53:[function(require,module,exports){
'use strict';

var ConfigParser = require('../../core/config-parser');
var VError = require('../../util/verror');
var loggerFactory = require('../../util/logger-factory');

var defaultParserMap = {
	'json' : {
		parser: require('./commonjs-package-config-parser'),
		testFn: function(str) {
			return typeof str === 'string' && str.trim().indexOf('{') === 0;
		}
	},
    'backbaseXml' : {
        parser: require('./backbase-dom-config-parser'),
        testFn: function(str) {
            return typeof str === 'string' && str.trim().indexOf('<catalog') >= 0;
        }
    },
    'jsObject' : {
        parser: require('./js-object-parser'),
        testFn: function(obj) {
            return typeof obj === 'object';
        }
    }
};

/**
 * Auto config parser
 * @constructor
 */
var AutoConfigParser = function() {
    this.log = loggerFactory.getLogger();
    this.parserMap = defaultParserMap;
};
AutoConfigParser.prototype = Object.create(ConfigParser.prototype);

/**
 *
 * @param configText
 * @returns {*}
 */
AutoConfigParser.prototype.parse = function(configText) {

    var Parser =  null;

    //guess the parser
    for(var parserType in this.parserMap) {
        if(this.parserMap.hasOwnProperty(parserType)) {
            var parserConf = this.parserMap[parserType];
            if(parserConf.testFn(configText)) {
                this.log.debug('Parsing widget config as: %s', parserType);
                Parser = parserConf.parser;
                break;
            }
        }
    }

	if(Parser === null) {
		throw new VError('Could not determine the config parser to use');
	}

    //and parse
    var configParser = new Parser();
    return configParser.parse(configText);
};

/**
 * Hook to extend the Auto Config Parser with custom parsing strategies
 * @param type
 * @param parser
 * @param testFn
 */
AutoConfigParser.prototype.addParserStrategy = function(type, parser, testFn) {

    this.parserMap[type] = {
        parser: parser,
        testFn: testFn
    };
};

module.exports = AutoConfigParser;

},{"../../core/config-parser":29,"../../util/logger-factory":77,"../../util/verror":79,"./backbase-dom-config-parser":54,"./commonjs-package-config-parser":55,"./js-object-parser":56}],54:[function(require,module,exports){
'use strict';

var ConfigParser    = require('../../core/config-parser');
var parseWidget     = require('./xml/widget');
var helpers         = require('./xml/helpers');

/**
 * Sax parser for w3c widget config files
 * @constructor
 */
var BackbaseSaxConfigParser = function() {
};

BackbaseSaxConfigParser.prototype = Object.create(ConfigParser.prototype);

/**
 *
 * @param xml
 * @returns {Promise} Promise of widget object
 */
BackbaseSaxConfigParser.prototype.parse = function(xml) {
    try {
        var domParser = new DOMParser();
        var doc = domParser.parseFromString(xml, 'application/xml');

        var firstNode = doc.documentElement;
        var node = firstNode.tagName === 'catalog' ? helpers.getChildElements(firstNode)[0] : firstNode;

        return Promise.resolve(parseWidget(node));
    } catch(e) {
        return Promise.reject(e);
    }
};

module.exports = BackbaseSaxConfigParser;

},{"../../core/config-parser":29,"./xml/helpers":59,"./xml/widget":62}],55:[function(require,module,exports){
'use strict';

var ConfigParser = require('../../core/config-parser');
var util = require('../../util/util');

/**
 * Sax parser for w3c widget config files
 * @constructor
 */
var CommonJsPackageConfigParser = function() {

};
CommonJsPackageConfigParser.prototype = Object.create(ConfigParser.prototype);

/**
 * See https://backbase.atlassian.net/wiki/display/CXP/Widget+package.json+spec for documentation for the rules
 * used in this method
 * @param xml
 * @returns {*}
 */
CommonJsPackageConfigParser.prototype.parse = function(json) {

    try {
        var packaged = JSON.parse(json);
        var widgetModel = util.cloneDeep(require('../../core/default-widget-model'));

        //common js fields
        widgetModel.id = packaged.name || widgetModel.id;
        widgetModel.version = packaged.version || widgetModel.version;
        widgetModel.description = packaged.description || widgetModel.description;
        widgetModel._lang = packaged.locales || widgetModel._lang;

        //first contributor to author
        if(Array.isArray(packaged.contributors) && packaged.contributors.length > 0) {
            widgetModel.author = packaged.contributors[0].name || widgetModel.author;
            widgetModel.authorEmail = packaged.contributors[0].email || widgetModel.authorEmail;
            widgetModel.authorHref = packaged.contributors[0].web || widgetModel.authorHref;
        }

        //licenses to license
        if(Array.isArray(packaged.licenses) && packaged.licenses.length > 0) {
            widgetModel.license = packaged.licenses[0].type || widgetModel.license;
            widgetModel.licenseHref = packaged.contributors[0].url || widgetModel.licenseHref;
        } else if(typeof widgetModel.license === 'string') {
            widgetModel.license = packaged.license;
        }

        //widget implementation fields
        widgetModel.defaultlocale = packaged.defaultlocale || widgetModel.defaultlocale;
        widgetModel.width = packaged.width || widgetModel.width;
        widgetModel.height = packaged.height || widgetModel.height;
        widgetModel.viewmodes = packaged.viewmodes || widgetModel.viewmodes;
        widgetModel.name = packaged.fullName || widgetModel.name;
        widgetModel.shortName = packaged.shortName || widgetModel.shortName;
        widgetModel.preferences = packaged.preferences || widgetModel.preferences;
        widgetModel.features = packaged.features || widgetModel.features;
        widgetModel.icons = packaged.icons || widgetModel.icons;
        widgetModel.content = packaged.content || widgetModel.content;

        return Promise.resolve(widgetModel);
    } catch(e) {
        return Promise.reject(e);
    }
};

module.exports = CommonJsPackageConfigParser;
},{"../../core/config-parser":29,"../../core/default-widget-model":31,"../../util/util":78}],56:[function(require,module,exports){
'use strict';

var ConfigParser = require('../../core/config-parser');

/**
 * This parser passes the object straight through.
 * It exists so the AutoConfigParser will pass pre-parsed models straight through with modification
 * @constructor
 */
var JsObjectParser = function() {
};
JsObjectParser.prototype = Object.create(ConfigParser.prototype);

/**
 *
 * @param xml
 * @returns {*}
 */
JsObjectParser.prototype.parse = function(object) {
   //pass straight through. Could perform validation, patches etc here if we need
   return object;
};

module.exports = JsObjectParser;
},{"../../core/config-parser":29}],57:[function(require,module,exports){
'use strict';

var helpers = require('./helpers');

module.exports = {
    parseIcons: parseIcons,
    parseChildren: parseChildren
};

/**
 * Extracts icon specific data from given item node and its properties
 * @param {Object} properties Key/Value representation of properties
 * @return {Array}
 */
function parseIcons (properties) {
    var icons = [];
    helpers.pushIfExists(icons, properties.thumbnailUrl);
    helpers.pushIfExists(icons, properties.icon);
    return icons;
}

/**
 * Parses child items
 * @param {Element} element Item element
 * @param {function} childItemParser Child item parsing function
 * @return {Array<object>} Array of item objects
 */
function parseChildren (element, childItemParser) {
    var childrenEl = helpers.getChildElementByName(element, 'children');
    var childrenElements = childrenEl && helpers.getChildElements(childrenEl);

    return childrenElements && childrenElements.map(childItemParser).sort(childComparator);
}

/**
 * Compare function to be used in array.sort like
 * functionality to sort widgets by their area and order
 * @param {Object} first Widget object
 * @param {Object} next Widget object
 * @return {number}
 */
function childComparator (first, next) {
    var firstArea = cast(first, 'area'),
        nextArea = cast(next, 'area'),
        firstOrder = cast(first, 'order'),
        nextOrder = cast(next, 'order');

    var compare = 0;
    if (firstArea < nextArea) {
        compare = -1;
    } else if (firstArea > nextArea) {
        compare = 1;
    } else if (firstOrder < nextOrder) {
        compare = -1;
    } else if (firstOrder > nextOrder) {
        compare = 1;
    }

    return compare;
}

/**
 * @private
 * @param {Object} item an item model
 * @param {string} prefName preference name
 * @returns {null|string|number} number if possible to parse a preference as a number, bare value otherwise.
 */
function cast(item, prefName) {
    if(typeof item.preferences[prefName] === 'undefined') {
        return null;
    }

    var value = item.preferences[prefName].value;
    var numberValue = parseFloat(value);

    return isNaN(numberValue) ? value : numberValue;
}

},{"./helpers":59}],58:[function(require,module,exports){
module.exports.PROPERTY_BLACKLIST = [
    'description',
    'shortName',
    'thumbnailUrl',
    'icon',
    'viewmodes',
    'author',
    'authorEmail',
    'authorHref',
    'license',
    'licenseHref',
    'widgetChrome',
    'config',
    'src',
    'isManageableArea',
    'version',
    'width',
    'height'
];

module.exports.SPECIAL_TYPES = [
    'contentRef',
    'linkRef',
    'datasource'
];

module.exports.NO_LOCALE_NAME = 'no_locale';

},{}],59:[function(require,module,exports){
'use strict';

module.exports = {
    assignIfExists: assignIfExists,
    content:        content,
    isExists:       isExists,
    parseBool:      parseBool,
    parseString:    parseString,
    parseFloat:     parseFloat_,
    parseInt:       parseInt_,
    parseViewhint:  parseViewhint,
    pushIfExists:   pushIfExists,
    toArray:        toArray,
    getChildElementByName: getChildElementByName,
    getChildElements: getChildElements
};

/**
 * Parses given attribute as string
 * @param {Object} attr
 * @return {string|undefined}
 */
function parseString (attr) {
    if (attr && attr.value.length) {
        return attr.value;
    }
}

/**
 * Parses given viewhint string as array of viewhints
 * @param {string} viewhint Viewhint text
 * @return {Array<string>}
 */
function parseViewhint (viewhint) {
    var viewhintTrimmed = parseString(viewhint);

    if (!viewhintTrimmed) { return []; }

    return viewhintTrimmed.split(/[,\s]/).filter(function (hint) {
        return hint.trim().length > 0;
    });
}

/**
 * Checks given value against undefined and null
 * @param {*} val
 * @return {boolean}
 */
function isExists (val) {
    return typeof val !== 'undefined' && val !== null;
}

/**
 * Assigns given value to given object's name property only
 * if given value is not null or undefined. If converter_function is
 * defined given value is mapped over that function
 * @param {Object} obj  Object
 * @param {string} name Object's property name
 * @param {*} value Value to be assigned
 * @param {Function} [converter] Optional value transforming function
 */
function assignIfExists (obj, name, value, converter) {
    if (isExists(value)) {
        obj[name] = converter ? converter(value) : value;
    }
}
/**
 * Pushes given value to given array only if the given
 * value is not null or undefined.
 * @param {Array} arr Array
 * @param {*} value Value to be pushed
 */
function pushIfExists (arr, value) {
    if (isExists(value)) {
        arr.push(value);
    }
}

/**
 * Parses string into boolean. Return true only if given
 * string equals to "true" otherwise it returns "false"
 * @param {string} bool
 * @return {boolean}
 */
function parseBool (bool) {
    if (isExists(bool)) {
        if (typeof bool === 'string') {
            return bool === 'true';
        }

        return bool && bool.value === 'true';
    }
}

/**
 * Transforms given array like object (eg dom children)
 * to real array.
 * @param {T} obj
 * @return {Array.<T>}
 */
function toArray (obj) {
    return [].slice.call(obj);
}

/**
 * Parses given string into float. If the given string represents a number
 * than it returns a floating point number or NaN.
 * @param {string} num
 * @return {number|undefined}
 */
function parseFloat_ (num) {
    if (typeof num === 'string') {
        return parseFloat(num);
    }
}

/**
 * Parses given string into integer. If the given string represents a number
 * than it returns number or NaN.
 * @param {string} num
 * @param {int} radinx
 * @return {number|undefined}
 */
function parseInt_ (num) {
    if (typeof num === 'string') {
        var value = parseInt(num, 10);
        return !isNaN(value) ? value : undefined;
    }
}

/**
 * Finds first element in the given node's children by given element.
 * Unlike getElementsByTagName this function only looks first level of
 * children.
 * @param {Node} node
 * @param {string} elementName
 * @return {Node|undefined}
 */
function getChildElementByName (node, elementName) {
    var children = getChildElements(node);

    for (var i = 0; i < children.length; i++) {
        if (children[i].tagName === elementName) {
            return children[i];
        }
    }
}

/**
 * Returns node's textContent which found by given elementName.
 * If element name is not found in given node's children given
 * default value will be returned.
 * This function only looks first level of children.
 * @param {Element} element
 * @param {string} elementName
 * @param {*} [defaultValue]
 * @return {string}
 */
function content (element, elementName, defaultValue) {
    var childEl = getChildElementByName(element, elementName);

    if (typeof defaultValue === 'undefined') {
        defaultValue = null;
    }

    return (childEl && childEl.textContent) || defaultValue;
}

/**
 * Returns child elements of a node
 * @param {Node} node
 * @returns {Array} child elements
 */
function getChildElements(node) {
    if (typeof node.children !== 'undefined') {
        return toArray(node.children);
    }

    return toArray(node.childNodes).filter(function(childNode) {
        return childNode.nodeType === 1;
    });
}


},{}],60:[function(require,module,exports){
(function (global){
'use strict';

var Constants   = require('./constants');
var i18n        = require('../../../util/i18n');
var helpers     = require('./helpers');

var BLACKLIST       = Constants.PROPERTY_BLACKLIST;
var SPECIAL_TYPES   = Constants.SPECIAL_TYPES;
var NO_LOCALE_NAME  = Constants.NO_LOCALE_NAME;

module.exports = parseItem;

/**
 * Extracts base item data from given element. This item
 * data is common between each item type. Other item types
 * use this item parser to get their base data.
 * @param {Element} itemEl Item element
 * @return {Object} Base item data
 */
function parseItem (itemEl) {
    var propertiesParent = helpers.getChildElementByName(itemEl, 'properties');
    var propertyElements = helpers.getChildElements(propertiesParent);

    var currentLocale = helpers.content(itemEl, 'locale') || getDefaultLocale();

    var properties = {};

    //create preferences map object excluding preferences from BLACKLIST
    var propertiesMap = propertyElements.reduce(function (acc, element) {
        var property = parseProperty(element, currentLocale);

        properties[property.name] = property.value;
        if(BLACKLIST.indexOf(property.name) === -1) {
            acc[property.name] = property;
        }
        return acc;
    }, {});

    var item = {
        id:               helpers.content(itemEl, 'uuid'),
        name:             helpers.content(itemEl, 'name', ''),
        shortName:        properties.shortName,
        preferences:      propertiesMap,
        preferencesDict:  properties,
        type:             itemEl.tagName,
        locale:           currentLocale,
        dir:              helpers.content(itemEl, 'dir', 'ltr'),
    };

    helpers.assignIfExists(item, 'tags', parseTags(itemEl));
    helpers.assignIfExists(item, 'extendedItemName', helpers.content(itemEl, 'extendedItemName'));
    helpers.assignIfExists(item, 'parentItemName', helpers.content(itemEl, 'parentItemName'));
    helpers.assignIfExists(item, 'contextItemName', helpers.content(itemEl, 'contextItemName'));
    helpers.assignIfExists(item, 'lockState', helpers.content(itemEl, 'lockState'));
    helpers.assignIfExists(item, 'securityProfile', helpers.content(itemEl, 'securityProfile'));
    helpers.assignIfExists(item, 'manageable', helpers.parseBool(helpers.content(itemEl, 'manageable')));

    return item;
}

/**
 * Parses property object from a given property node
 * @param {Element} propertyElement <property ...> node
 * @param {Boolean} currentLocale
 * @return {Object} Property data
 */
function parseProperty (propertyElement, currentLocale) {
    var attrs       = propertyElement.attributes;
    var name        = helpers.parseString(attrs.name);
    var label       = helpers.parseString(attrs.label);
    var itemName    = helpers.parseString(attrs.itemName);
    var manageable  = attrs.manageable;
    var readonly    = helpers.parseBool(attrs.readonly);
    var localizable = helpers.parseBool(attrs.localizable);
    var viewhints   = attrs.viewHint && helpers.parseViewhint(attrs.viewHint);
    var type        = attrs.type;

    var valueElements = helpers.toArray(propertyElement.getElementsByTagName('value'));

    var values = valueElements.map(function (valueElement) {
        return parseValue(valueElement);
    });

    var currentLocaleValue = values.filter(function(valueObj) {
        return valueObj.locale === currentLocale;
    })[0];

    // if there is no value in current locale, get fallback value (the one with no locale specified)
    if (!currentLocaleValue) {
        currentLocaleValue = values.filter(function(valueObj) {
            return !valueObj.locale;
        })[0] || {};
    }

    var property = {
        name: name,
        readonly: readonly || false,
        value: currentLocaleValue.value
    };

    if (label)      { property.label = label; }
    if (manageable) { property.manageable = helpers.parseBool(manageable); }
    if (viewhints)  { property.viewhints = viewhints; }
    if (itemName)   { property.itemName = itemName; }

    if (type && SPECIAL_TYPES.indexOf(type.value) > -1) {
        property.type = type.value;
    } else if (SPECIAL_TYPES.indexOf(currentLocaleValue.type) > -1) {
        property.type = currentLocaleValue.type;
    }

    if (localizable) {
        property.localizable = localizable;

        // define _lang object that holds localized values
        property._lang = values.reduce(function (obj, localizedValueObj) {
            var key = localizedValueObj.locale || NO_LOCALE_NAME;
            obj[key] = { value: localizedValueObj.value };
            return obj;
        }, {});

        // define value property as setter/getter to update current locale value in _lang object
        Object.defineProperty(property, 'value', {
            enumerable: true,
            set: function (value) {
                var langObj = this._lang || (this._lang = {});
                var localizedValue = langObj[currentLocale] || (langObj[currentLocale] = {});
                localizedValue.value = value;
                currentLocaleValue = localizedValue;
            },
            get: function () {
                return currentLocaleValue.value;
            }
        });
    }

    return property;
}

/**
 * Parses array of tags from given item node
 * @param {Node} node Item's node
 * @return {Array<object>} Array of tags
 */
function parseTags (node) {
    var parent = helpers.getChildElementByName(node, 'tags');
    var tagElements = (parent && helpers.getChildElements(parent));

    return tagElements && tagElements.map(parseTag);
}

/**
 * Parses tag data from given tag node
 * @param {Node} tagElement <tag ...> node
 * @return {Object}
 */
function parseTag (tagElement) {
    return {
        type: tagElement.attributes.type.value,
        name: helpers.parseString({value: tagElement.textContent})
    };
}

/**
 * Parse localized values for given property
 * @param {Element} valueElement
 * @return {{value: string, locale: string|undefined }}
 */
function parseValue (valueElement) {
    return {
        value: valueElement.textContent,
        type: valueElement.getAttribute('type'),
        locale: valueElement.getAttribute('locale')
    };
}

/**
 * Tries to get locale from localStorage stored under "bb:locale" key. Defaults to system default locale if it's
 * not found in the storage.
 * @returns {string}
 * @private
 */
function getDefaultLocale() {
    var locale;
    var localStorage = getLocalStorage();

    if (localStorage) {
        locale = localStorage.getItem('bb:locale');
    }

    return locale || i18n.defaultLocale;
}

/**
 * Checks if localStorage is available and returns it.
 * @returns {Storage} localStorage object if it's available, null otherwise.
 */
function getLocalStorage() {
    /* globals global */

    var probe = 'bb:__test';
    try {
        var localStorage = global.localStorage;
        localStorage.setItem(probe, probe);
        localStorage.removeItem(probe);
        return localStorage;
    } catch(e) {
        return null;
    }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../../util/i18n":76,"./constants":58,"./helpers":59}],61:[function(require,module,exports){
'use strict';

var helpers = require('./helpers');
var parseWidget = require('./widget');

/**
 * XML parser
 * @module model/parsers/xml-parser
 * @exports {parseWidget} Widget parser
 * @exports {parseWidgets} Widget collection parser
 * @exports {parseContainer} Container parser
 * @exports {parseContainers} Container collection parser
 */
module.exports = {
    parse:           parse,
    parseWidget:     parseXml(parseWidget),
    parseWidgets:    parseChildrenXml(parseWidget),
    parseContainer:  parseXml(parseWidget),
    parseContainers: parseChildrenXml(parseWidget)
};

/**
 * Parse given string to model object associated with given item type.
 *
 * @param {String} xml
 * @param {String} type Type can be 'link', 'page', 'widget', 'container' type names can be pluralized.
 * @returns {Object}
 */
function parse(xml, type) {
    /* jshint validthis:true */
    var methodName = 'parse' + type[0].toUpperCase() + type.substr(1);
    if (typeof this[methodName] !== 'function') {
        throw new Error('XML parser does not support items of type [%s]', type);
    }
    return this[methodName](xml);
}

/**
 * Takes a parser and an xml content and calls parser
 * function with first child of DOMParser's document.
 *
 * @param {function} parsingFunc a function that converts DOM to JS object representation of an item
 * @return {function} parsed item model
 */
function parseXml (parsingFunc) {
    return function (xml) {
        var doc = parseXmlString(xml);

        return parsingFunc(doc.documentElement);
    };
}

/**
 * Takes a parser and an xml content and maps parser
 * function over all children nodes of document's
 * first children.
 *
 * @param {function} parsingFunc a function that converts DOM to JS object representation of an item
 * @return {function} parsed item model
 */
function parseChildrenXml (parsingFunc) {
    return function (xml) {
        var doc = parseXmlString(xml);

        return helpers.getChildElements(doc.documentElement).map(function (item) {
            return parsingFunc(item);
        });
    };
}

function parseXmlString(xml) {
    var parser = new DOMParser();
    return parser.parseFromString(xml, 'application/xml');
}
},{"./helpers":59,"./widget":62}],62:[function(require,module,exports){
'use strict';

var merge           = require('../../../util/util').merge;
var parseItem       = require('./item');
var common          = require('./common');
var helpers         = require('./helpers');
var loggerFactory   = require('../../../util/logger-factory');
var url             = require('url');

var log;

module.exports = parseWidget;

/**
 * Parses widget specific data for given element
 * @param {Element} widgetEl widget node
 * @return {Object} widget object
 */
function parseWidget (widgetEl) {
    var item = parseItem(widgetEl);
    var preferences = item.preferencesDict;

    var widget = {
        content:     parseContent(preferences),
        description: preferences.description,
        icons:       common.parseIcons(preferences),
        title:       preferences.title
    };

    helpers.assignIfExists(widget, 'width',            helpers.parseInt(preferences.width, 10));
    helpers.assignIfExists(widget, 'height',           helpers.parseInt(preferences.height, 10));
    helpers.assignIfExists(widget, 'isManageableArea', helpers.parseBool(preferences.isManageableArea));
    helpers.assignIfExists(widget, 'viewmodes',        parseViewmodes(preferences));
    helpers.assignIfExists(widget, 'author',           preferences.author);
    helpers.assignIfExists(widget, 'authorEmail',      preferences.authorEmail);
    helpers.assignIfExists(widget, 'authorHref',       preferences.authorHref);
    helpers.assignIfExists(widget, 'version',          preferences.version);
    helpers.assignIfExists(widget, 'license',          preferences.license);
    helpers.assignIfExists(widget, 'licenseHref',      preferences.licenseHref);

    // alternative contents
    widget.altContent = parseAlternativeContents(item);

    // data sources
    var datasourceMap = parseDatasources(item);
    if (Object.keys(datasourceMap).length > 0) {
        widget.datasources = datasourceMap;
    }

    var children = common.parseChildren(widgetEl, parseWidget);
    if ((children || []).length > 0) {
        widget.children = children;
    }

    delete item.preferencesDict;

    return merge(item, widget);
}

/**
 * Converts certain preferences into a hash of data source objects
 * @param {Object} item model
 * @returns {Object} hash object of data sources
 */
function parseDatasources(item) {
    var preferences = item.preferences;
    var preferenceNames = Object.keys(preferences);

    return preferenceNames.map(function (prefName) {
        return preferences[prefName];
    }).filter(function (pref) {
        return pref.type === 'datasource';
    }).reduce(function (obj, datasourcePref) {
        // parse value of the preference as URL
        var datasourceConfig = parseDatasourceUri(datasourcePref.value);
        if (datasourceConfig.uri) {
            datasourceConfig.name = datasourcePref.name;
            obj[datasourcePref.name] = datasourceConfig;
        }

        return obj;
    }, {});
}

/**
 * Parses datasource URI into object
 * @param {string} uri
 * @returns {Object}
 */
function parseDatasourceUri(uri) {
    var data = {};

    if (uri) {
        var logger = getLogger();
        var uriObject;
        try {
            uriObject = url.parse(uri, true);
            data.params = Object.keys(uriObject.query).map(function (paramName) {
                return {
                    name: paramName,
                    value: uriObject.query[paramName]
                };
            });
            data.uri = data.params.length > 0 ? uri.slice(0, uri.indexOf('?')) : uri;
        } catch(er) {
            logger.error(er);
        }
    }

    return data;
}

/**
 * Parses start file specific part of widget node
 * @param {Object} properties Properties as Key/Value
 * @return {Object} Content object
 */
function parseContent(properties) {
    var content = { src: '', type: 'text/html', encoding: 'UTF-8' };
    helpers.assignIfExists(content, 'src', properties.src);
    helpers.assignIfExists(content, 'config', properties.config);
    return content;
}

/**
 * Parses alternative contents like src.settings, src.permissions, etc.
 * @param {Object.<string, *>} item
 * @returns {Object.<string, *>}
 */
function parseAlternativeContents(item) {
    var preferences = item.preferences;
    var propertyNames = Object.keys(preferences);
    var sourcePropertyNames = propertyNames.filter(function (name) {
        return /^src\..*/.test(name);
    });

    var contents = sourcePropertyNames.reduce(function (contents, propertyName) {
        var content = preferences[propertyName].value;
        var contentName = propertyName.replace(/^src\./, '');

        contents[contentName] = {
            src: content,
            encoding: 'UTF-8'
        };

        return contents;
    }, {});

    sourcePropertyNames.forEach(function (preferenceName) {
        delete item.preferences[preferenceName];
    });

    return contents;
}

/**
 * Parses viewmodes
 * @param {Object} properties Dictionary (Key/Value) of properties
 * @return {Array<string>} Array of viewmodes
 */
function parseViewmodes(properties) {
    var viewmodes_str = properties.viewmodes;

    if (viewmodes_str) {
        return viewmodes_str.split(/\s+/).filter(function (viewmode) {
            return viewmode.trim().length > 0;
        });
    } else {
        return [];
    }
}

function getLogger() {
    if (!log) {
        var parentLog = loggerFactory.getLogger();
        log = parentLog.child({childName: 'xml-widget-parser'});
    }

    return log;
}

},{"../../../util/logger-factory":77,"../../../util/util":78,"./common":57,"./helpers":59,"./item":60,"url":177}],63:[function(require,module,exports){
'use strict';

var fetch           = require('../../util/deduping-fetch');
var ConfigReader    = require('../../core/config-reader');
var VError          = require('../../util/verror');
var loggerFactory   = require('../../util/logger-factory');

var XhrWidgetReader = function(opts) {
    opts = opts || {};
    this.log = loggerFactory.getLogger();
	this.useCache = typeof opts.useCache === 'boolean' ? opts.useCache : true;
    this.responseCache = {};
};
XhrWidgetReader.prototype = Object.create(ConfigReader.prototype);
XhrWidgetReader.prototype.read = function(url) {

    var self = this;
    var log = this.log;

    log.debug('Making http request for widget config to [%s]...', url);

    if(this.responseCache[url]) {
        this.log.debug('Using cached response for [%s]', url);
        return this.responseCache[url];
    }

    return fetch(url).then(function(res) {
            log.debug('Response received for [%s]. Status: %s.', url, res.status);
            return res.status >= 200 && res.status < 300 ?
                Promise.resolve(res) : Promise.reject(new Error(res.statusText));
        }).then(function(res) {
            return res.text();
        }).then(function(text) {
            log.trace('Received config:\n%s', text);
            if(self.useCache) {
                self.responseCache[url] = text;
            }
            return text;
        }).catch(function(err) {
            throw new VError(err, 'Failed to XHR get from ' + url);
        });
};

module.exports = XhrWidgetReader;
},{"../../core/config-reader":30,"../../util/deduping-fetch":72,"../../util/logger-factory":77,"../../util/verror":79}],64:[function(require,module,exports){
(function (global){
/* global document: false, DOMParser: false*/

'use strict';

var PreprocessingWidgetRenderer = require('../../core/preprocessing-widget-renderer');
var VError = require('../../util/verror');
var StartFileProcessor = require('./seamless/start-file-processor');
var fetch = require('../../util/deduping-fetch');

//shared DOMParser instance
var parser = null;
function getDomParser() {
    if(parser) {
        return parser;
    } else {
        return new DOMParser();
    }
}

var Html5SeamlessRenderer = function(widgetContainerEl, datasourceResolverFactory, opts) {
    opts = opts || {};
    var configVars = opts.configVars || {};

    //check some built in dependencies
    if(typeof window.DOMParser === 'undefined') {
        throw new Error('DOMParser is not shimmed or a native object. This renderer will not work');
    }

    PreprocessingWidgetRenderer.call(this, datasourceResolverFactory, configVars);

    this.widgetContainerEl = widgetContainerEl;
    this.parsingFormat = opts.parsingFormat || null;
    this.configVars = configVars;
    this.useFolderLocalization = opts.useFolderLocalization || false;

    // created dom elements during the rendering. We can use this references to destroy widget and clean up dom
    this.widgetEl = null;

    //container properties
    this.areaMap = null;
};

Html5SeamlessRenderer.prototype = Object.create(PreprocessingWidgetRenderer.prototype);

Html5SeamlessRenderer.prototype.fetchStartFile = function(widgetModel) {

    var log = this.log;

    log.debug('Starting HTML5 seamless rendering...');

    log.debug('Requesting start file [%s] ...', widgetModel.content.src);
    return fetch(widgetModel.content.src).then(function(res) {
        log.debug('Start file request resolved/ Status: %s', res.status);

        if (res.status === 0 || res.status === 200) {
            return res.text();
        } else {
            var error = new Error(res.statusText);
            error.code = res.status;
            throw error;
        }
    }).then(function(html) {
        log.trace('Received HTML\n: %s', html);
        return html;
    }).catch(function(e) {
        var error = new VError(e, 'Failed to fetch: ' + widgetModel.content.src);

        // get error code that is a HTTP response code and convert it into a widget engine code
        if (e.code === 404) {
            error.code = 'STARTFILE_NOT_FOUND';
        }

        throw error;
    });
};

Html5SeamlessRenderer.prototype.process = function(widgetModel, widgetInstance, startFileContent) {

    var widgetEl;
    var startFileProcessor = (this.startFileProcessor = new StartFileProcessor({
        document: document,
        configVars: this.configVars,
        log: this.log,
        startFileSrc: widgetModel.content.src
    }));

    if(startFileContent) {
        //client side render
        //
        //delegate start file parsing and rendering complexities to a dedicated module
        //this process complies with the Backbase Rendering Specs
        //https://backbase.atlassian.net/wiki/display/PrM/Rendering+specs

        var startFileDocument = getDomParser().parseFromString(startFileContent, 'text/html');

        //1. Aggregate external stylesheets from widget head to page head
        //2. Aggregate inline styles from widget head to page head (important not to aggregate from body)
        startFileDocument = startFileProcessor.aggregateStylesheets(widgetModel, startFileDocument);

        //6. Resolve document relative URIs for media elements*: img, video, audio, iframe
        startFileDocument = startFileProcessor.normalizeMediaUrls(widgetModel, startFileDocument);

        //3. Create Invokable script list
        var invokableScripts = startFileProcessor.collateInvokableScripts(widgetModel, startFileDocument);

        //4. Create widget node
        //5. Set root node innerHTML to be widget body innerHTML
        widgetEl = startFileProcessor.createWidgetRootNode(widgetModel, startFileDocument);

        //7. If widget.width is a number, set the width of the root node (element.style.width + p
        //8. If widget.height is a number set the height of the root node (element.style.height +px)
        widgetEl = startFileProcessor.setDimensions(widgetModel, widgetEl);

        //10. Prepare external and inline scripts for invocation
        startFileProcessor.prepareScripts(widgetModel, widgetEl , invokableScripts);

        //9. Inject root node into parent container
        this.widgetContainerEl.appendChild(widgetEl);
    } else {
        //assume already rendered
        for (var i = 0; i < this.widgetContainerEl.children.length; i++) {
            if(this.widgetContainerEl.children[i].hasAttribute('data-widget')) {
                widgetEl = this.widgetContainerEl.children[i];
                break;
            }
        }
    }

    //expose the widget element
    Object.defineProperty(widgetInstance, 'body',  {
        enumerable: true,
        writable: !!this.configVars.compat, //required so the Backbase Format Plugin can modify the body
        value: widgetEl
    });

    //global access to the widget interface. Necessary for some plugins. Not nice
    global.cxp._widgets = global.cxp._widgets || {};
    global.cxp._widgets[widgetModel.id] = widgetInstance;

    this.widgetEl = widgetEl;
};

Html5SeamlessRenderer.prototype.postprocess = function(widgetModel, widgetInstance) {
    return this.startFileProcessor.invokeScripts(widgetModel, widgetInstance, this.widgetEl);
};

Html5SeamlessRenderer.prototype.getWidgetNode = function() {
    return this.widgetEl || null;
};

Html5SeamlessRenderer.prototype.getParentNode = function() {
    return this.widgetContainerEl || null;
};

Html5SeamlessRenderer.prototype.setParentNode = function(widgetContainerEl) {
    this.widgetContainerEl = widgetContainerEl;
};

Html5SeamlessRenderer.prototype.getWidth = function() {
    return this.getWidgetNode() ? this.getWidgetNode().offsetWidth : 'auto';
};

Html5SeamlessRenderer.prototype.getHeight = function() {
    return this.getWidgetNode() ? this.getWidgetNode().offsetHeight : 'auto';
};

Html5SeamlessRenderer.prototype.isRendered = function() {
    return !!this.widgetContainerEl.innerHTML.trim();
};

Html5SeamlessRenderer.prototype.destroy = function () {
    // Try to find chrome around
    var widgetName = this.widgetEl.getAttribute('data-widget');
    var parent = this.widgetEl.parentElement;
    var chrome = null;

    while (parent) {
        var chromeName = parent.getAttribute('data-chrome');
        if (chromeName === widgetName) {
            chrome = parent;
            break;
        }

        parent = parent.parentElement;
    }

    // Remove created script tags for inline scripts
    this.startFileProcessor.removeInlineScripts(this.widgetId, this.widgetEl);

    // Remove widget DOM
    if (chrome) {
        chrome.parentElement.removeChild(chrome);
    } else {
        this.widgetEl.parentElement.removeChild(this.widgetEl);
        this.widgetEl = null;
    }

    //Remove widgetInstance object from global.cxp._widgets collection
    delete global.cxp._widgets[this.widgetId];
};

Html5SeamlessRenderer.prototype.getAreaNodes = function() {

    var self = this;
    if(!this.areaMap) {
        self.areaMap = {};
        var areas = Array.prototype.slice.call(this.widgetEl.querySelectorAll('div[data-area]'));
        // in case of SSR, areas collection may contain elements from child items, so we need to filter
        // them out (issue BACKLOG-14623)
        areas.filter(function (areaEl) {
            return self._isDataAreaElementFromItem(self.widgetEl, areaEl);
        }).forEach(function(area) {
            var areaKey = area.getAttribute('data-area');
            self.areaMap[areaKey] = area;
        });
    }
    return this.areaMap;
};

/**
 * Determines whether an element with data-area attribute belongs to a given item or to one of its descendants
 * @param {Element} itemEl
 * @param {Element} dataAreaEl
 * @returns {boolean}
 * @private
 */
Html5SeamlessRenderer.prototype._isDataAreaElementFromItem = function(itemEl, dataAreaEl) {
    var itemName = itemEl.getAttribute('data-widget');
    var parent = dataAreaEl;
    var parentItemName;

    while (parent) {
        parentItemName = typeof parent.getAttribute === 'function' ?
            parent.getAttribute('data-widget') :
            null;

        if (parentItemName) {
            // return false if data-area element belongs to another item
            return parentItemName === itemName;
        }

        parent = parent.parentNode;
    }

    return false;
};

module.exports = Html5SeamlessRenderer;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../core/preprocessing-widget-renderer":32,"../../util/deduping-fetch":72,"../../util/verror":79,"./seamless/start-file-processor":68}],65:[function(require,module,exports){
'use strict';

var Handlebars = require('handlebars/dist/handlebars.min');
var HandlebarsHelpers = require('handlebars-helpers');
var VError = require('../../../util/verror');
var loggerFactory = require('../../../util/logger-factory');
var i18n = require('../../../util/i18n');
var HandlebarsIntl = require('../../../util/handlebars-intl-decorator');

/**
 * Constructs a Handlebars Preprocessor.
 * This will also automatically add the following CXP helpers to Handlebars:
 * * range
 * * math
 * Compiled templates are cached
 * @constructor
 */
var HandlebarsPreprocessor = function(config) {
    this.name = 'Handlebars Preprocessor';
    this.log = loggerFactory.getLogger();
    this.dataObj = {
        cxpConfig: config || {}
    };

    this.templateCache = {};
    this.hbs = Handlebars.create();

    //add default helpers for cxp support
    var helpers = HandlebarsPreprocessor.cxpHelpers;
    for(var helperName in helpers) {
        if(helpers.hasOwnProperty(helperName)) {
            this.hbs.registerHelper(helperName, helpers[helperName]);
        }
    }

    //don't enable Format Js features if Intl API is not available (it requires a polyfill on Safari)
    if(i18n.intlSupported) {
        HandlebarsIntl.registerWith(this.hbs);
    } else {
        this.log.warn('The ECMAScript Internationalization API is not supported on this platform. ' +
                      'Some i18n related features will fail.');
    }
};

/**
 * Processes a start file that is expected to be a handlebars template.
 * If the widget start file has a `.js` extension, it assumed the template was precompiled with the 'simple' option.
 * E.g. <code>handlebars index.handlebars -s -f index.js</code>
 * @param widgetModel
 * @param startFileContent
 * @param context
 * @param messageBundle
 * @returns {string} a preprocessed start file
 */
HandlebarsPreprocessor.prototype.process = function(widgetModel, startFileContent, context, messageBundle) {

    var log = this.log;
    var errMessage;

    var templateKey = widgetModel.content.src;
    var template = this.templateCache[templateKey];

    if(!template) {
        //if the start file ends with js, assume it is a precompiled template
        if(widgetModel.content.type && widgetModel.content.type === 'application/x-handlebars-template') {
            //precompiled templates must be evaulated, so this is why we use eval
            var precompiledTemplate = null;
            try {
                eval('precompiledTemplate = ' + startFileContent); // jshint ignore:line
                template = this.hbs.template(precompiledTemplate);
            } catch(err) {
                errMessage =
                    'There was a problem evaluating a pre-compiled handlebars template. ' +
                    'Ensure it was compiled using the simple option. E.g.' +
                    '`handlebars index.handlebars -s -f index.js`';
                this.log.error(err, errMessage);
                throw new VError(err, errMessage);
            }

        } else {
            log.debug('Compiling handlebars template instance for %s', templateKey);
            try {
                template = this.hbs.compile(startFileContent);
            } catch(err) {
                errMessage = 'There was a problem compiling a handlebars template';
                this.log.error(err, errMessage);
                throw new VError(err, errMessage);
            }
        }
        this.templateCache[templateKey] = template;
    }
    
    if(messageBundle) {
        var messages = messageBundle.messages || {};
        var formats = messageBundle.formats || {};
        var options = messageBundle.options || {};
        var availableLocales = Object.keys(messages);
        var bestFitLocale = i18n.chooseBestLocale(availableLocales, widgetModel.locale);

        //TODO: consider merging messages by locale fit priority
        //see https://github.com/l20n/l20n.js/blob/v1.0.x/lib/l20n/intl.js
        //this code does not use `intl.messages` but instead puts messages directly on the intl object,
        //see https://backbase.atlassian.net/browse/BACKLOG-12050
        this.dataObj.intl = messages[bestFitLocale] || messages[i18n.defaultLocale] || {};

        if(this.dataObj.intl.locales) {
            this.log.warn('"locales" is a reserved key. It will be overridden');
        }
        this.dataObj.intl.locales = 
            widgetModel.locale === i18n.defaultLocale ? widgetModel.locale : [ widgetModel.locale, i18n.defaultLocale ];
        
        if(this.dataObj.intl.formats) {
            this.log.warn('"formats" is a reserved key. It will be overridden');
        }
        this.dataObj.intl.formats = formats;

        if(this.dataObj.intl.options) {
            this.log.warn('"options" is a reserved key. It will be overridden');
        }
        this.dataObj.intl.options = options;
    }

    var result;
    try {
        result = template(context, { data: this.dataObj });
        log.trace('Using compiled Handlebars start file for %s:\n%s', templateKey, result);
    } catch(err) {
        log.error(err, 'A handlebars template [%s] could not be processed:\n\t%s', templateKey, err.message);
        throw err;
    }
    
    return result;
};

/**
 * Registers a handlebars helper with the internal handlebars instance
 * @param {string} name
 * @param {Function} helper
 */
HandlebarsPreprocessor.prototype.registerHelper = function(name, helper) {

    this.hbs.registerHelper(name, helper);
};

/**
 * Registers a handlebars partial with the internal handlebars instance
 * @param {string} name
 * @param {Function} partial
 */
HandlebarsPreprocessor.prototype.registerPartial = function(name, partial) {

    this.hbs.registerPartial(name, partial);
};

HandlebarsPreprocessor.cxpHelpers = HandlebarsHelpers;

module.exports = HandlebarsPreprocessor;

},{"../../../util/handlebars-intl-decorator":75,"../../../util/i18n":76,"../../../util/logger-factory":77,"../../../util/verror":79,"handlebars-helpers":81,"handlebars/dist/handlebars.min":82}],66:[function(require,module,exports){
/* jshint strict: true */
/* globals soy: false, DOMParser: false */

'use strict';

var VError    = require('../../../util/verror');
var loggerFactory  = require('../../../util/logger-factory');
var resourceLoader = require('../seamless/resource-loader')();
var util           = require('../../../util/util');

var convertToArray = Array.prototype.slice.call.bind(Array.prototype.slice);

/**
 * Constructs a Soy Template Preprocessor.
 * Compiled templates are cached
 * @constructor
 */
var SoyPreprocessor = function(configVars) {
    this.name = 'Soy Preprocessor';
    this.log = loggerFactory.getLogger();
    this.configVars = configVars;
};

/**
 * Processes a start file that is expected to be a compiled soy template.
 * @param widgetModel
 * @param startFileContent
 * @param context
 * @returns {string} a preprocessed start file
 */
SoyPreprocessor.prototype.process = function(widgetModel, startFileContent, context) {
    var self = this;
    var log = this.log;

    if(typeof soy === 'undefined') {
        throw new VError('Soy utils are not present. Cannot use Soy start file');
    }

    //the start file is the soy container's `config.xml` file. Parse out the resources...
    var parser = new DOMParser();
    var configDoc = parser.parseFromString(startFileContent, 'application/xml');
    var resources = configDoc.getElementsByTagName('resources')[0];
    resources = resources || configDoc.getElementsByTagName('bb:resources')[0];

    if (!resources) {
        throw new VError('"resources" element not found in config.xml');
    }

    var templateName = widgetModel.preferences.TemplateName.value;

    //filter out the template script, we want to load this separately from regular resources
    var templateScriptRegex = new RegExp('/templates/' + templateName + '/template\\.js$');
    var templateScriptNode = convertToArray(resources.children).filter(function(script) {
        return templateScriptRegex.test(script.getAttribute('src'));
    })[0];
    if(templateScriptNode) {
        resources.removeChild(templateScriptNode);
    }
    var templateSrc = util.replacePathVars(templateScriptNode.getAttribute('src'), this.configVars, this.log);

    //load the compiled soy template, it will be added as a global var
    return resourceLoader.loadScripts(templateSrc).then(function() {
        //Create a wrapper dom object to append links and scripts to
        var startFileEl = document.createElement('div');
        var templateNamespace = 'window.' + guessTemplateNamespace(templateName, widgetModel);
        var fragment = null;
        var template = null;

        try {
            eval('template = ' + templateNamespace);  // jshint ignore:line
            fragment = soy.renderAsFragment(template[templateName], {
                item: createTemplateItemData(context),
                ij:   self.configVars
            }, null, self.configVars);
        } catch(err) {
            var errMessage = 'There was a problem evaluating a pre-compiled Soy template.';
            log.error(err, errMessage);
            throw new VError(err, errMessage);
        }

        //add the remaining resources
        startFileEl.innerHTML = resources.innerHTML;

        //append the rendered template
        startFileEl.appendChild(fragment);

        //convert areas to cxp6 style with [data-area] attributes
        var areaNodes = fragment.classList && fragment.classList.contains('bp-area') ?
            [ fragment ] : convertToArray(fragment.getElementsByClassName('bp-area'));
        areaNodes.forEach(function(areaNode, i) {
            areaNode.setAttribute('data-area', i);
        });

        var result = startFileEl.outerHTML;
        log.trace('Using compiled Soy start file for %s:\n%s', templateNamespace, result);

        return result;
    });
};

// The global namespace of the soy template is usually 'templates_ContainerName'. However, it doesn't have to be
// It is impossible to know the namespace without fetching and parsing the uncompiled soy file, which brings its own
// problems.
//
// This function attempts to guess the namespace before it is evaluated. If no guess is succesful, a container d
// developer may explicitly define a 'soyNamespace' preference on the item model to tell the widget engine exactly
// what it should be.
function guessTemplateNamespace(templateName, widgetModel) {

    var attempt;

    function isDefined (namespace) {
        return typeof window[namespace] !== 'undefined';
    }

    //try "templates_ContainerName"
    attempt = 'templates_' + templateName;
    if(isDefined(attempt)) {
        return attempt;
    }

    //custom value
    var soyNamespacePref = widgetModel.preferences.soyNamespace;
    if(soyNamespacePref && isDefined(soyNamespacePref.value)) {
        return soyNamespacePref.value;
    }

    //maybe the view namespace preference works?
    var viewNamespacePref = widgetModel.preferences.viewNamespace;
    if(viewNamespacePref) {
        var viewNamespace = viewNamespacePref.value;
        var sanitizedViewNamespace = viewNamespace.replace('http://', '').replace(/[\.\/]/g, '_');

        //try "viewNamespace_ContainerName"
        attempt = sanitizedViewNamespace + '_' + templateName;
        if(isDefined(attempt)) {
            return attempt;
        }

        //try "viewNamespace"
        attempt = sanitizedViewNamespace;
        if(isDefined(attempt)) {
            return attempt;
        }
    }

    throw new Error('Could not guess soy template namespace for ' + templateName);
}

//convert the widgetModel into the format required by the soy template
function createTemplateItemData(widgetModel) {

    var templateData = {};

    templateData.name = widgetModel.name;
    templateData.children = widgetModel.children || [];

    //preferences
    templateData.preferences = widgetModel.preferences || {};
    templateData.children = templateData.children.map(createTemplateItemData);

    return templateData;
}

module.exports = SoyPreprocessor;

},{"../../../util/logger-factory":77,"../../../util/util":78,"../../../util/verror":79,"../seamless/resource-loader":67}],67:[function(require,module,exports){
'use strict';

var PromiseExt = require('promise-extensions')(Promise);

var _loaderInstance;

function ResourceLoader() {
    this._initilized = false;
    this._allLoadingPromises = {};
}

module.exports = function() {
    if (!_loaderInstance){
        _loaderInstance = new ResourceLoader();
    }
    return _loaderInstance;
};

/**
 * Lazily initializes an instance of resource loader.
 * As this object relies on existence of <code>document</code> free variable which may not exist at the moment
 * an instance of resource loader is created.
 * @private
 */
ResourceLoader.prototype._init = function() {
    if (this._initilized) {
        return;
    }

    this.head = document.getElementsByTagName('head')[0] || document.documentElement;
    this.asyncSupported = typeof document.createElement('script').async !== 'undefined';

    this._prepopulateLoadedCache();

    this._initilized = true;
};

ResourceLoader.prototype._prepopulateLoadedCache = function() {

    var self = this;

    var preloadedLinks = Array.prototype.slice.call(document.getElementsByTagName('link'));
    preloadedLinks.forEach(function(link) {
        var src = link.getAttribute('href');
        var isLoadable = link.rel === 'stylesheet' && src;

        if(isLoadable) {
            self._addToCache(src, src);
        }
    });

    var preloadedScripts = Array.prototype.slice.call(document.getElementsByTagName('script'));
    preloadedScripts.forEach(function(script) {
        var src = script.getAttribute('src');
        var isLoadable = !script.innerHTML && src;
        //a note about async scripts:
        //if a script that is already on the page is marked async. Its not possible to guarantee here that the script
        //has completed loading and executing, so it's not added in the loaded script cache. Therefore a script marked
        //async in the page template is likely to be reloaded, if used again in a widget.
        if(isLoadable && !script.async && !self._getFromCache(src)) {
            self._addToCache(src, Promise.resolve(src));
        }
    });
};

/**
 * Normalizes resourceUrl parameter by decoding it, so that encoded and not encoded urls that represent
 * the same resource are considered identical. Also strips off deprecated [BBHOST].
 * @todo : Please remove when support for BBHOST is dropped BACKLOG-16057
 * @param {string} resourceUrl A resource URL (script or style)
 * @returns {string} A normalized URL
 * @private
 */
ResourceLoader.prototype._normalizeKey = function normalizeKey(resourceUrl) {
    var key = decodeURI(resourceUrl);
    return key.replace(/(?:features|widgets|containers|pages|templates)\/\[BBHOST\]/gi, 'items');
};

/**
 * Adds requested resourceUrl to the cache
 * @param {string} resourceUrl A resource URL (script or style)
 * @param {*} value A value to store in the cache
 * @private
 */
ResourceLoader.prototype._addToCache = function addToCache(resourceUrl, value) {
    if (!resourceUrl) {
        return;
    }

    var key = this._normalizeKey(resourceUrl);
    this._allLoadingPromises[key] = value;
};

/**
 * Gets the value from the cache by the resourceUrl
 * @param {string} resourceUrl A resource URL (script or style)
 * @returns {*} A value stored in the cache if found, "undefined" otherwise
 * @private
 */
ResourceLoader.prototype._getFromCache = function addToCache(resourceUrl) {
    if (!resourceUrl) {
        return undefined;
    }

    var key = this._normalizeKey(resourceUrl);
    return this._allLoadingPromises[key];
};

ResourceLoader.prototype.loadScripts = function(scripts) {

    if(!(scripts instanceof Array)) {
        scripts = [ scripts ];
    }

    this._init();
    return this.asyncSupported ? this._loadScriptsAsync(scripts) : this._loadScriptsSync(scripts);
};

//modern approach
ResourceLoader.prototype._loadScriptsAsync = function(scripts) {

    var self = this;

    //this loads all the unloaded scripts asynchronously, but should execute them in order
    // (by turning async off after assigning the source)
    var scriptLoadPromises = scripts.map(function(src) {

        var scriptPromise = self._getFromCache(src);

        if (!scriptPromise) {
            var scriptEl = document.createElement('script');
            scriptEl.src = src;
            scriptEl.async = false;

            scriptPromise = self._createScriptPromise(scriptEl);
            self._addToCache(src, scriptPromise);

            self.head.insertBefore(scriptEl, self.head.firstChild);
        }

        return scriptPromise;
    });

    return PromiseExt.settleAll(scriptLoadPromises);
};

//legacy approach
ResourceLoader.prototype._loadScriptsSync = function(scripts) {

    var self = this;

    // define script element/promise pairs. Script load success/failure will settle
    // the corresponding promise.
    var scriptTuples = scripts.map(function (src) {
        var scriptPromise = self._getFromCache(src);
        var scriptEl;

        if(!scriptPromise) {
            scriptEl = document.createElement('script');
            scriptEl.src = src;

            scriptPromise = self._createScriptPromise(scriptEl);
            self._addToCache(src, scriptPromise);
        }

        return {element: scriptEl, promise: scriptPromise};
    });
    var scriptPromises = scriptTuples.map(function (tuple) {
        return tuple.promise;
    });

    // attaching script element to DOM triggers its load
    function loadScript (scriptTuple) {
        if (scriptTuple.element) {
            self.head.insertBefore(scriptTuple.element, self.head.firstChild);
        }
        return scriptTuple.promise;
    }

    var startOfChainPromise = Promise.resolve(loadScript(scriptTuples[0] || {}));

    // build chain of script loading promises
    // next script starts loading only after the prev one has loaded/failed
    var chain = scriptTuples.slice(1).reduce(function (promise, scriptTuple) {
        var loadNextScript = loadScript.bind(null, scriptTuple);
        return promise.then(loadNextScript, loadNextScript);
    }, startOfChainPromise);

    // terminate chain in case the last script failed to load
    chain.catch(function () {});

    return PromiseExt.settleAll(scriptPromises);
};

ResourceLoader.prototype._createScriptPromise = function(scriptEl) {
    var src = scriptEl.src;
    return new Promise(function(resolve, reject) {

        scriptEl.onload = function() {
            resolve(src);
        };

        scriptEl.onerror = function() {
            reject(src);
        };
    });
};

ResourceLoader.prototype.loadCss = function(hrefs) {

    if(!(hrefs instanceof Array)) {
        hrefs = [ hrefs ];
    }

    this._init();

    var self = this;
    var head = self.head;
    var currentBatch = [];

    hrefs.forEach(function(src) {

        var stylePromise = self._getFromCache(src);

        if(stylePromise) {
            currentBatch.push(stylePromise);
        } else {
            var newLinkEl = document.createElement('link');
            newLinkEl.setAttribute('rel', 'stylesheet');
            newLinkEl.setAttribute('type', 'text/css');
            newLinkEl.setAttribute('href', src);

            var promise = Promise.resolve(src);

            self._addToCache(src, promise);
            currentBatch.push(promise);

            //logic to insert after last stylesheet element in head
            var sheetLinksEls = Array.prototype.slice.call(head.getElementsByTagName('link')).filter(function(el) {
                return el.rel === 'stylesheet';
            });
            if(sheetLinksEls.length) {
                var lastLinkEl = sheetLinksEls.pop();
                lastLinkEl.parentNode.insertBefore(newLinkEl, lastLinkEl.nextSibling);
            } else {
                head.insertBefore(newLinkEl, head.firstChild);
            }
        }
    });

    return Promise.all(currentBatch);
};

},{"promise-extensions":139}],68:[function(require,module,exports){
(function (global){
'use strict';

var util = require('../../../util/util');
var url = require('url');
var resourceLoader = require('./resource-loader')();
var VError = require('../../../util/verror');

var pathname;
if(global.location) {
    pathname = global.location.pathname;
}

/**
 *
 * @param documentContext
 * @param parentNode
 * @param opts
 * @constructor
 */
function StartFileProcessor(opts) {
    opts = opts || {};
    this.log = opts.log || null;
    this.documentContext = opts.document;
    this.configVars = opts.configVars || {};
    this.startFileSrc = opts.startFileSrc || '';

    //this is needed to differentiate inline scripts for the same widget but different start files.
    //such as in the cx manager inspector widget. It is only set to a value if client side rendering is
    //used. The _getScriptKey() function combines the widget id with the this suffix to generate key
    //unique to a start file
    this._scriptKeySuffix = '';
}

/**
 * a. Aggregate external stylesheets from widget head to page head
 * b. Aggregate inline styles from widget head to page head (important not to aggregate from body)
 *    i.e. any style element that is a direct child of the head
 * @returns The provided start file documented with the aggregated/loaded elements removed
 * @private
 */
StartFileProcessor.prototype.aggregateStylesheets = function(widgetModel, startFileDocument) {
    var self = this;

    var externalStylesBatch = [];
    function addToBatch(linkElem) {
        var href = linkElem.getAttribute('href');
        var linkUrl = self._normalizeResourceUrl(href, widgetModel);
        externalStylesBatch.push(linkUrl);
    }
    function loadBatch() {
        //syncronous call, no catch needed
        resourceLoader.loadCss(externalStylesBatch);
        externalStylesBatch = [];
    }

    //this loads all links and styles in their original order from the start files head
    var styleAndLinkElements = startFileDocument.querySelectorAll(' head > style, head > link[rel=stylesheet]');
    Array.prototype.slice.call(styleAndLinkElements).forEach(function(elem) {
        if (elem.tagName.toLowerCase() === 'style') {
            loadBatch();
            self.documentContext.head.appendChild(elem);
        } else if(elem.getAttribute('href')) {
            addToBatch(elem);
        }
    });
    loadBatch();

    return startFileDocument;
};

/**
 * Create Invocable script list
 * a. For each script ((i.e any script tags where the type attribute is undefined or equal to text/javascript and that
 *    are direct children of the widget head or widget body)
 * b. Add to list
 * c. Resolve document relative src attribute values
 * d. Replace configuration placeholders ( $(itemRoot), $(contextRoot) etc)
 * e. Remove from widget dom
 * @private
 */
StartFileProcessor.prototype.collateInvokableScripts = function(widgetModel, startFileDocument) {
    var self = this;
    var scriptElements = startFileDocument.getElementsByTagName('script');

    var scripts =  Array.prototype.slice.call(scriptElements).reduce(function(processedScripts, scriptElement) {
        if(!scriptElement.type || scriptElement.type === 'text/javascript') {
            var scriptContent = scriptElement.innerHTML;
            var src = scriptElement.getAttribute('src');
            if(scriptContent) {
                processedScripts.push({
                    content: scriptContent
                });
            } else if(src) {
                processedScripts.push({
                    src: self._normalizeResourceUrl(src, widgetModel)
                });
            }
            scriptElement.parentNode.removeChild(scriptElement);
        }
        return processedScripts;
    }, []);

    //also add the onload attribute
    var startFileBody = startFileDocument.getElementsByTagName('body')[0];
    var onloadAttribute = startFileBody.getAttribute('onload');
    if(onloadAttribute) {
        scripts.push({
            content: onloadAttribute
        });
    }

    return scripts;
};

/**
 * a. Resolve document relative URIs for media elements*: img, video, audio, iframe
 * b. Replace configuration placeholders ( $(itemRoot), $(contextRoot) etc)
 * @param startFileDocument
 * @return {*}
 * @private
 */
StartFileProcessor.prototype.normalizeMediaUrls = function(widgetModel, startFileDocument) {
    var self = this;
    var imageElements = startFileDocument.getElementsByTagName('img');
    Array.prototype.slice.call(imageElements).forEach(function(imageElement) {
        var originalSrc = imageElement.getAttribute('src');
        if(originalSrc) {
            var src = self._normalizeResourceUrl(originalSrc, widgetModel);
            if(imageElement.getAttribute('src') !== src) {
                imageElement.src = src;
            }
        }
    });
    return startFileDocument;
};

/**
 * Create root node
 * a. Create a div element
 * b. Set attribute id to be the widget UUID
 * c. Set attribute data-widget to be the widget name
 * d. Copy attributes from widget body to root node (excluding id)
 */
StartFileProcessor.prototype.createWidgetRootNode = function(widgetModel, startFileDocument) {
    //create the widget element
    var widgetNode =  this.documentContext.createElement('div');

    //id and data-widget
    widgetNode.id = widgetModel.id;
    widgetNode.setAttribute('data-widget', widgetModel.name);

    //add body attributes to root widget el
    var startFileBodyElement = startFileDocument.getElementsByTagName('body')[0];
    for (var i = 0; i < startFileBodyElement.attributes.length; i++) {
        var bodyAttr = startFileBodyElement.attributes[i];
        if (bodyAttr.specified && bodyAttr.name !== 'onload' && bodyAttr.name !== 'id') {
            widgetNode.setAttribute(bodyAttr.name, bodyAttr.value);
        }
    }

    widgetNode.innerHTML = startFileBodyElement.innerHTML;
    
    return widgetNode;
};

/**
 * a. If widget.width is a number, set the width of the root node (element.style.width + px)
 * b. If widget.height is a number set the height of the root node (element.style.height +px)
 * @param widgetModel
 * @param widgetEl
 * @return {*}
 * @private
 */
StartFileProcessor.prototype.setDimensions = function(widgetModel, widgetEl) {
    var self = this;

    function setDimension(widthOrHeight) {
        if(widgetModel[widthOrHeight] && !isNaN(parseInt(widgetModel[widthOrHeight]))) {
            widgetEl.style[widthOrHeight] = parseInt(widgetModel[widthOrHeight]) + 'px';
            self.log.debug('Widget %s set to %s.', widthOrHeight, widgetEl.style[widthOrHeight]);
        }
    }
    setDimension('width');
    setDimension('height');

    return widgetEl;
};

/**
 * Prepare external and inline scripts for invocation
 * a. For each script in script list
 *    i. Append to root node and
         - For external scripts, set src attribute to data-src
         - For inline scripts, wrap in widget function wrapper  (see code snippet below)
 * @param widgetModel
 * @param widgetEl
 * @param invokableScripts
 * @private
 */
StartFileProcessor.prototype.prepareScripts = function(widgetModel, widgetEl, invokableScripts) {
    var self = this;

    this._scriptKeySuffix = '_' + this.startFileSrc;
    var scriptKey = this._getScriptKey(widgetModel.id);

    global.cxp = global.cxp || {};
    global.cxp.scripts = global.cxp.scripts || {};
    global.cxp.scripts[scriptKey] = [];

    invokableScripts.forEach(function(script) {
        var scriptEl = self.documentContext.createElement('script');
        if(script.content) {
            
            var scriptStart = 'cxp.scripts[\'' + scriptKey + '\'].push(function(widget, __GADGET__,  __WIDGET__) { ';
            var scriptEnd = ' });';
            scriptEl.innerHTML = scriptStart + script.content + scriptEnd;
            scriptEl.setAttribute('data-cxp-script', scriptKey);
            self.documentContext.body.appendChild(scriptEl);
        } else {
            scriptEl.setAttribute('data-src', script.src);
            widgetEl.appendChild(scriptEl);
        }
    });
    return widgetEl;
};

/**
 * Remove inline scripts for given widgetId (for destroying)
 * @param widgetModel
 * @param widgetEl
 * @param invokableScripts
 * @private
 */
StartFileProcessor.prototype.removeInlineScripts = function(widgetId) {

    var scriptKey = this._getScriptKey(widgetId);
    
    //remove scripts array from global scripts object for given widgetId
    global.cxp.scripts = global.cxp.scripts || {};
    delete global.cxp.scripts.scriptKey;

    //remove inline script elements
    var scriptElements = this.documentContext.querySelectorAll('script[data-cxp-script=\'' + scriptKey + '\']');
    Array.prototype.slice.call(scriptElements).forEach(function (scriptEl) {
        scriptEl.parentElement.removeChild(scriptEl);
    });
};

StartFileProcessor.prototype.invokeScripts = function(widgetModel, widgetInstance, widgetEl) {
    var self = this;
    var log = this.log;
    var itemName = widgetModel.name;

    var externalScriptElements = widgetEl.querySelectorAll('script[data-src]');
    var scriptSources = Array.prototype.slice.call(externalScriptElements).filter(function (scriptElement) {
        // in case of SSR don't pick up scripts from child items
        return util.ensureElementBelongsToItem(itemName, scriptElement);
    }).map(function(scriptElement) {
        var src = scriptElement.getAttribute('data-src');
        src = self._normalizeResourceUrl(src, widgetModel);
        return src;
    });

    return resourceLoader.loadScripts(scriptSources).then(function(inspections) {
        log.debug('JS resources have loaded.');
        var failedScripts = [];

        //review external script results
        if(inspections) {
            var errorCount = inspections.filter(function(scriptLoadInspection) {
                var rejected = scriptLoadInspection.isRejected();
                return rejected && failedScripts.push(scriptLoadInspection.reason);
            }).length;
            if(errorCount > 0) {
                log.warn('%s scripts failed to load:\n%s', errorCount, failedScripts.join(', '));
            }
        }

        //invoke inline scripts
        var scriptKey = self._getScriptKey(widgetModel.id);
        if(global.cxp && global.cxp.scripts && Array.isArray(global.cxp.scripts[scriptKey])) {
            try {
                global.cxp.scripts[scriptKey].forEach(function (scriptFn) {
                    if(typeof scriptFn === 'function') {
                        scriptFn.call(null, widgetInstance, widgetInstance, widgetInstance);
                    }
                });
            } catch(err) {
                //TODO: better error
                log.warn('Failed to invoke inline scripts for widget "%s".\n%s', widgetModel.name, err);
            }
        }
    }).catch(function(err) {
        throw new VError(err, 'Failed to render HTML5 seamless widget');
    });    
};

/**
 * Replace path placeholders ( $(contextRoot) etc)
 * @param resourceUrl
 * @param widgetModel
 * @return {String|*}
 * @private
 */
StartFileProcessor.prototype._normalizeResourceUrl = function(resourceUrl, widgetModel) {
    resourceUrl = util.replacePathVars(resourceUrl, this.configVars, this.log);
    
    //need to make paths site relative.
    if(util.isUrlDocumentRelative(resourceUrl)) {
        var startFilePath = widgetModel.content.src;
        var startFileDir = startFilePath.substring(0, startFilePath.lastIndexOf('/') + 1);
        if(util.isUrlDocumentRelative(startFilePath)) {
            var docRoot = pathname.substring(0, pathname.lastIndexOf('/') + 1);
            startFileDir = url.resolve(docRoot, startFileDir);
        }
        resourceUrl = url.resolve(startFileDir, resourceUrl);
    }

    return resourceUrl;
};

StartFileProcessor.prototype._getScriptKey = function(widgetId) {
    return widgetId + this._scriptKeySuffix;
};

module.exports = StartFileProcessor;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../../util/util":78,"../../../util/verror":79,"./resource-loader":67,"url":177}],69:[function(require,module,exports){
/* global window: false*/
'use strict';

var WidgetStorage = require('./web-storage-decorator');

function Html5LocalStorage() {
    WidgetStorage.call(this, window.localStorage);
}
Html5LocalStorage.prototype = Object.create(WidgetStorage.prototype);

module.exports = Html5LocalStorage;
},{"./web-storage-decorator":71}],70:[function(require,module,exports){
'use strict';
var util = require('../../util/util');

/**
 * This class implements [StorageEvent](https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent)
 *
 * It would be preferable to use the native StorageEvent class, but doing seemed too difficult; the final argument when
 * calling <code>initStorageEvent</code> must be a valid StorageArea implementation, but I was not able to figure out
 * how to make Firefox think custom storage areas implement the native Storage interface.
 *
 * This event may not work if using it on native EventTarget implementations such as the <code>window</code> object
 *
 * @exports the StorageEvent constructor
 * @type {StorageEvent|exports}
 */

/**
 * Constructor
 * @param type
 * @constructor
 */
function StorageEvent(type) {
    this.type = type;
}

/**
 * Initializes the event in a manner analogous to the similarly-named method in the DOM Events interfaces.
 * @param {String} type The name of the event.
 * @param {Boolean} canBubble A boolean indicating whether the event bubbles up through the DOM or not.
 * @param {Boolean} cancellable A boolean indicating whether the event is cancelable.
 * @param {String} key The key whose value is changing as a result of this event.
 * @param {String} oldValue The key's old value.
 * @param {String} newValue The key's new value.
 * @param {String} url
 * @param {Object} storageArea The DOM Storage object representing the storage area on which this event occurred.
 */
StorageEvent.prototype.initStorageEvent = function(type, canBubble, cancellable, key, oldValue, newValue, url,
                                                   storageArea) {
    this.type = type;
    this.canBubble = canBubble;
    this.cancellable = cancellable;
    this.key = key;
    this.oldValue = oldValue;
    this.newValue = newValue;
    this.url = url;
    this.storageArea = storageArea;
};

StorageEvent.prototype.toString = function() {
    return util.format('[object StorageEvent] (key=%s, oldValue=%s, newValue=%s, url=%s)',
        this.key, this.oldValue, this.newValue, this.url);
};

module.exports = StorageEvent;
},{"../../util/util":78}],71:[function(require,module,exports){
(function (process){
'use strict';

/**
 * Use this module to help build new Widget Storage implementations or adapt existing WebStorage implementations
 *
 * The WidgetStorage class provides an <code>init</code> method which initializes the web storage with a set of
 * preferences from a widget's configuration, ensuring readonly preferences are respected
 *
 * When storing widget preferences it will prefix them with the widget's instance id so multiple widgets can
 * share the same storage environment.
 *
 * @example
 *
 * var MyStorageImpl = function() {
 *  var storage = new WebStorageImpl();
 *  WebStorageDecorator.call(this, storage);
 * };
 * MyStorageImpl.prototype = Object.create(WebStorageDecorator.prototype);
 *
 * @exports the WebStorageDecorator constructor
 * @type {WidgetStorage|exports}
 */

//originally adapted from https://gist.github.com/tlrobinson/1334406
var loggerFactory = require('../../util/logger-factory');
var bunyan = require('browser-bunyan');
var WidgetStorage = require('../../core/widget-storage');
var VError = require('../../util/verror');
var StorageEvent = require('./storage-event');
var util = require('../../util/util');

/**
 * WebStorageDecorator constructor for web storage
 * @param {Object} storage A web storage implementation. e.g. sessionStorage
 * @param {Object} [eventTarget] When WebStorage events are generated, they will be dispatched to this object
 * @constructor
 * @implements {WidgetStorage}
 */
function WebStorageDecorator(storage) {

    this.eventTarget = [];
    this.log = loggerFactory.getLogger();

    this._items = [];
    this._storage = storage;
    this._prefix = '';
    this._eventsEnabled = false; //enable after initialization

    //storage needs a length property
    var self = this;
    Object.defineProperty(this, 'length',  {
        enumerable: false,
        configurable: false,
        get: function () {
            return Object.keys(self._items).length;
        }
    });
}

WebStorageDecorator.prototype = Object.create(WidgetStorage.prototype);

/**
 * Initializes the storage
 * @param {string} widgetInstanceId
 * @param {Array} preferences
 */
WebStorageDecorator.prototype.init = function(widgetInstanceId, preferences) {

    var self = this;
    var log = this.log;
    this._prefix = widgetInstanceId || '';

    log.debug('Initializing preference storage for widget [%s]', widgetInstanceId);
    log.debug('Using internal storage [%s]', this._storage.toString());
    if(log.level() <= bunyan.TRACE) {
        log.trace('Initializing storage with the following preferences:\n %s', JSON.stringify(preferences));
    }

    if(preferences) {
        this._items = Object.keys(preferences).map(function(prefName) {
            return self.defineItem(preferences[prefName]);
        });
    }

    //events are disabled until the storage is initialized
    this._eventsEnabled = true;
};

/**
 * Gets an item value from storage
 * @param {string} key
 * @returns {string}
 */
WebStorageDecorator.prototype.getItem = function(key) {

    //look for personalized value in storage
    var value = this._storage.getItem(this._prefix + key);
    if(typeof value === 'undefined' || value === null) {
        //revert to memory
        var item = this._getItemDefinition(key) || null;
        value = item ? item.value : null;
    }
    if(typeof value === 'undefined') {
        //must explicitly return null if the item does not exist
        value = null;
    }
    this.log.trace('Getting preference [%s=%s]', key, value);

    return value;
};

/**
 * Defines an item, so it is accessible as a property of the storage
 * @param {Object} pref
 */
WebStorageDecorator.prototype.defineItem = function(pref) {

    var self = this;
    var key = pref.name;

    this._items.push(pref);

    var propertyDescriptor = {
        enumerable: true,
        configurable: true,
        get: function () {
            return self.getItem(key);
        },
        set: function(val) {
            return self.setItem(self._prefix + key, val);
        }
    };
    Object.defineProperty(this, key, propertyDescriptor);

    return pref;
};

/**
 * Sets an item. Setting an item to null will remove it
 * @param {string} key
 * @param {string} value
 * @param {string} [type]
 * @returns {*}
 */
WebStorageDecorator.prototype.setItem = function(key, value, type) {
    this._ensureItemWritable(key);

    this.log.debug('Setting preference to storage [%s=%s]', key, value);

    //behavior is that setting an item to null will remove it
    if(value === null) {
        return this.removeItem(key);
    } else {
        this._notify(key, this.getItem(key), value);
        return this._storage.setItem(this._prefix + key, value, type);
    }
};

/**
 * Clears personalization of an item
 * @param {string} key
 * @returns {string}
 */
WebStorageDecorator.prototype.removeItem = function(key) {

    this._notify(key, this.getItem(key), null);

    this.log.debug('Removing preference from storage [%s]', key);

    return this._storage.removeItem(this._prefix + key);
};

/**
 * Clears the storage area
 */
WebStorageDecorator.prototype.clear = function() {

    var self = this;

    this._notify(null, null, null);

    this.log.debug('Clearing preferences');

    //must disable events so removeItem does not fire events
    this._eventsEnabled = false;
    Object.keys(this._storage).filter(function(key) {
        return key.indexOf(self._prefix) === 0;
    }).forEach(function(key) {
        self.removeItem(key.substr(self.prefix.length));
    });
    this._eventsEnabled = true;
};

/**
 * Returns the nth key from the list of preferences
 * @returns {string|null} The key of the preference at the requested index
 */
WebStorageDecorator.prototype.key = function(n) {

    return this._items[n] ? this._items[n].name : null;
};

/**
 * Gets an array of they keys stored
 * @deprecated (none standard)
 * @returns {Array}
 */
WebStorageDecorator.prototype.keys = function() {

    var self = this;

    var keys = Object.keys(this._storage).filter(function(key) {
        return key.indexOf(self._prefix) === 0;
    });

    if(keys.length === 0) {
        return [];
    }

    return keys.map(function(key) {
        return key.slice(self._prefix.length);
    });
};

WebStorageDecorator.prototype._getItemDefinition = function(key) {

    var pref = this._items.filter(function(item) {
        return key === item.name;
    })[0];

    return pref || null;
};

/**
 * Helper method for internally propagating storage events
 * @private
 * @param {string} key The key whose value is changing as a result of this event.
 * @param {string} oldVal The key's old value.
 * @param {string} newVal The key's new value.
 */
WebStorageDecorator.prototype._notify = function(key, oldVal, newVal) {
    if(!this._eventsEnabled) {
        return;
    }

    var self = this;
    var eventTargets = Array.isArray(this.eventTarget) ? this.eventTarget : [this.eventTarget];

    eventTargets.filter(function(target) {
        return target !== undefined && target !== null;
    }).forEach(function(eventTarget) {
        if(typeof eventTarget.dispatchEvent !== 'function') {
            var message =
                'Cannot dispatch StorageEvent for preferences. ' +
                'An event target was provided, but it does not implement the EventTarget interface. [%s, %s, %s]';
            self.log.warn(message, key, oldVal, newVal);
            return;
        }

        //please see notes in the StorageEvent jsdoc about using custom vs native event implementations
        var storageEvent = new StorageEvent('storage');
        storageEvent.initStorageEvent('storage', false, false, key, oldVal, newVal, self._prefix, self);

        process.nextTick(function() {
            if(self.log.level() <= bunyan.DEBUG) {
                self.log.debug('Sending StorageEvent [%s] ', storageEvent);
            }
            eventTarget.dispatchEvent(storageEvent);
        });
    });
};

/**
 * Checks whether an item value can be updated. Throws an error if it's readonly.
 * @param {sring} key The item name
 * @throws {VError}
 * @private
 */
WebStorageDecorator.prototype._ensureItemWritable = function(key) {
    //scenarios where setting the preference should fail
    var itemDefinition = this._getItemDefinition(key);
    if(itemDefinition && itemDefinition.readonly) {
        var errorMessage = util.format('Attempted to modify readonly preference [%s]', key);
        this.log.warn(errorMessage);
        throw new VError(errorMessage);
    }
};

module.exports = WebStorageDecorator;

}).call(this,require('_process'))
},{"../../core/widget-storage":37,"../../util/logger-factory":77,"../../util/util":78,"../../util/verror":79,"./storage-event":70,"_process":172,"browser-bunyan":80}],72:[function(require,module,exports){
(function (global){
/**
 * Dedupes requests by storing responses in the cache.
 * Decorates Fetch API. Supposed to be used instead of fetch function where response caching is appropriate.
 * @module util/deduping-fetch
 */

'use strict';

var loggerFactory   = require('./logger-factory');
var util            = require('./util');
var fetchFile       = require('./fetch-file');

var EXPIRE_TIMESPAN = 1000;

var fetchPromiseCache = {};
var log;

/**
 * Adds an item to the cache.
 * @private
 * @param {string} key The cache key that is used to reference an item.
 * @param {Promise} item An item to insert into the cache.
 * @param {Number} [ttl] The interval in milliseconds between the time a cached object was added/last
 * accessed and the time at which that object expires. If not specified, an item will stay in the cache indefinitely.
 */
function addToCache(key, item, ttl) {
    var cacheItem = createCacheItem(item);
    fetchPromiseCache[key] = cacheItem;

    if (ttl > 0) {
        cacheItem.timeoutId = removeOnExpire(key, ttl);
    }
}

/**
 * Retrieves an item from the cache.
 * @private
 * @param {string} key The cache key that is used to reference an item.
 * @returns {Promise} An item if it's found, undefined otherwise.
 */
function getFromCache(key) {
    var cacheItem = fetchPromiseCache[key];
    var value;

    if (cacheItem) {
        cacheItem.setLastAccessedTime();
        value = cacheItem.value;
    }

    return value;
}

/**
 * Sets a handler that removes an item with sliding expiration policy
 * @private
 * @param {string} key The cache key that is used to reference an item.
 * @param {Number} ttl time-to-live an interval over which an item stays in the cache.
 * @param {Number} [expire] used by recursive calls
 */
function removeOnExpire(key, ttl, expire) {
    var timeout;

    if (typeof expire === 'undefined') {
        timeout = ttl;
        log.debug('setting sliding expire handler to purge item [%s] in %sms', key, timeout);
    } else {
        timeout = expire;
        log.debug('%sms elapsed since last access to item [%s]. Extending expiration time by %sms',
            ttl - expire, key, timeout);
    }

    return setTimeout(function () {
        var cacheItem = fetchPromiseCache[key];
        if (!cacheItem) {
            return;
        }

        var elapsedTime = (new Date()).getTime() - cacheItem.lastAccessed;
        if (elapsedTime >= ttl) {
            log.debug('purging expired item [%s]', key);
            delete fetchPromiseCache[key];
        } else {
            cacheItem.timeoutId = removeOnExpire(key, ttl, ttl - elapsedTime);
        }
    }, timeout);
}

/**
 * Sets "include" value of "credentials" request setting if widgets are loaded from local file system
 * (mobile use scenario) and those widgets make cross-origin requests to a remote server. Sets "same-origin"
 * value otherwise.
 * @private
 * @param {Object} [options] fetch request options object
 * @returns {Object}
 */
function setCredentials(options) {
    var credentials = util.isRunningOnFilesystem() ? 'include' : 'same-origin';
    var initOptions = options || {};

    if (!initOptions.credentials) {
        initOptions.credentials = credentials;
    }

    return initOptions;
}

/**
 * Removes all items from the cache
 * @private
 */
function clearCache() {
    // clear remove-on-expire handlers then remove cached item
    Object.keys(fetchPromiseCache).forEach(function (cacheKey) {
        var timeoutId = fetchPromiseCache[cacheKey].timeoutId;

        if (typeof timeoutId !== 'undefined') {
            clearTimeout(timeoutId);
        }

        delete fetchPromiseCache[cacheKey];
    });
}

/**
 * Creates a cache item - an object that wraps a value to store in the cache.
 * @private
 * @param {*} value
 * @returns {Object}
 */
function createCacheItem(value) {
    var timestamp = (new Date()).getTime();
    var cacheItem = Object.create(cacheItemProto);

    cacheItem.value = value;
    cacheItem.created = timestamp;
    cacheItem.lastAccessed = timestamp;

    return cacheItem;
}

var cacheItemProto = {
    setLastAccessedTime: function() {
        this.lastAccessed = (new Date()).getTime();
    }
};

/**
 * Create a request to a resource and caches a successful response. Delegates to the global fetch function.
 * @param {string|Request} url @see {@link https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch|input parameter}
 * @param {Object} [options] @see {@link https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch|init parameter}
 * @returns {Promise} A Promise that resolves to a Response object.
 */
module.exports = function dedupingFetch(url, options) {
    var resourceUrl = typeof url === 'string' ? url : url.url;
    var key = resourceUrl;
    var method = url.method || (options && options.method) || 'GET';
    var putInCache = typeof method === 'string' && method.toUpperCase() === 'GET';

    // init logger lazily until BACKLOG-12206 is done.
    if (!log) {
        log = loggerFactory.getLogger();
    }

    // clear cache if request other than GET (CXP Model API requires this behaviour)
    if (!putInCache) {
        clearCache();
    }

    var responsePromise = getFromCache(key);

    // make a request if promise is not in cache OR we don't want it from cache
    // (it's possible to have a promise in cache for GET request, but next request to the same URL might have
    // different method)
    if (!responsePromise || !putInCache) {
        // if successfully resolved, re-insert it in the cache with expiration policy
        // remove from the cache otherwise
        log.debug('data from [%s] not found in cache. Requesting it from remote resource...', key);

        // set credentials
        options = setCredentials(options);

        var fetchFunc = util.isUrlForFile(resourceUrl) ? fetchFile : global.fetch;
        responsePromise = fetchFunc(url, options).then(function (response) {
            var status = response.status;
            log.debug('response from [%s] received. Status: [%s]', key, status);
            
            if (status < 200 || status > 299) {
                var error = new Error(response.statusText);
                error._response = response;
                throw error;
            }

            return response;
        }).then(function (response) {
            var promise = getFromCache(key);

            if (promise) {
                log.debug('holding data from [%s] in cache for %sms', key, EXPIRE_TIMESPAN);
                addToCache(key, promise, EXPIRE_TIMESPAN);
            }

            return response;
        }).catch(function (err) {
            log.debug('removing data for [%s] from cache as the following error occurred: [%s]', key, err.message);
            delete fetchPromiseCache[key];

            if (err._response) {
                return err._response;
            }

            throw err;
        });

        // cache fetch request until it's settled
        if (putInCache) {
            addToCache(key, responsePromise);
        }
    } else {
        log.debug('returning data for [%s] from cache', key);
    }

    // return cloned response
    return responsePromise.then(function (response) {
        return response.clone();
    });
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./fetch-file":74,"./logger-factory":77,"./util":78}],73:[function(require,module,exports){
'use strict';

module.exports = function () {
    var PREFIX = '@@',
        EventTarget = {};

    function configure(obj, prop, value) {
        Object.defineProperty(obj, prop, {
            enumerable: false,
            configurable: true,
            value: value
        });
    }

    function on(self, type, listener) {
        var array;
        if (EventTarget.hasOwnProperty.call(self, type)) {
            array = self[type];
        } else {
            configure(self, type, array = []);
        }
        if (array.indexOf(listener) < 0) {
            array.push(listener);
        }
    }

    function dispatch(self, type, ev) {
        var array, current, i;
        if (EventTarget.hasOwnProperty.call(self, type)) {
            ev.target = self;
            array = self[type].slice(0);
            for (i = 0; i < array.length; i++) {
                current = array[i];
                if (typeof current === 'function') {
                    current.call(self, ev);
                } else if (typeof current.handleEvent === 'function') {
                    current.handleEvent(ev);
                }
            }
        }
    }

    function off(self, type, listener) {
        var array, i;
        if (EventTarget.hasOwnProperty.call(self, type)) {
            array = self[type];
            i = array.indexOf(listener);
            if (i > -1) {
                array.splice(i, 1);
                if (!array.length) {
                    delete self[type];
                }
            }
        }
    }

    configure(EventTarget, 'addEventListener', function addEventListener(type, listener) {
        on(this, PREFIX + type, listener);
    });

    configure(EventTarget, 'dispatchEvent', function dispatchEvent(ev) {
        dispatch(this, PREFIX + ev.type, ev);
    });

    configure(EventTarget, 'removeEventListener', function removeEventListener(type, listener) {
        off(this, PREFIX + type, listener);
    });

    return EventTarget;
}();
},{}],74:[function(require,module,exports){
(function (global){
/**
 * Allows for use of fetch API to request resources from local file system
 * @module util.fetch-file
 */
'use strict';

module.exports = function fetchFile(url) {
    return new Promise(function(resolve, reject) {
        var resourceUrl = typeof url === 'string' ? url : url.url;
        var xhr = new global.XMLHttpRequest();
        xhr.onload = function() {
            resolve(new global.Response(xhr.responseText, {
                status: xhr.status === 0 ? 200 : xhr.status
            }));
        };
        xhr.onerror = function() {
            reject(new Error('Local request failed for ' + url));
        };
        xhr.open('GET', resourceUrl);
        xhr.send(null);
    });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],75:[function(require,module,exports){
/**
 * The sole purpose of the decorator is to overcome the limitations of formatNumber helper
 * (https://github.com/yahoo/handlebars-intl) that accepts
 * only number as a value despite the fact that Intl.NumberFormat function which the helper uses internally
 * accepts a value of any type.
 * Issue report https://github.com/yahoo/handlebars-intl/issues/84
 */

'use strict';

var Handlebars = require('handlebars/dist/handlebars.min');
var HandlebarsIntl = require('handlebars-intl');

module.exports = {
    registerWith: registerWith
};

function registerWith(hbs) {
    var mockInstance = Handlebars.create();
    var helpers = {};

    // substitute registerHelper function to collect helpers
    mockInstance.registerHelper = function registerHelper(name, helper) {
        if (typeof name === 'string') {
            helpers[name] = helper;
        } else {
            // name is actually a hash of helpers
            Object.keys(name).forEach(function (helperName) {
                helpers[helperName] = name[helperName];
            });
        }
    };

    // collect helpers
    HandlebarsIntl.registerWith(mockInstance);

    // decorate formatNumber helper
    if (helpers.formatNumber) {
        var formatNumberOriginal = helpers.formatNumber;
        helpers.formatNumber = function formatNumber(num) {
            // convert 1st argument to number and call original function
            var args = [].slice.call(arguments);
            args[0] = Number(num); // this is exactly what Intl.NumberFormat does internally

            return formatNumberOriginal.apply(this, args);
        };
    }

    // register helpers
    hbs.registerHelper(helpers);
}

},{"handlebars-intl":2,"handlebars/dist/handlebars.min":82}],76:[function(require,module,exports){
(function (global){
'use strict';

var RTL_LOCALES = ['ar', 'iw', 'he', 'dv', 'ha', 'fa', 'ps', 'ur', 'yi', 'ji'];

module.exports = {
    defaultLocale: 'en',
    
    intlSupported: typeof global.Intl !== 'undefined',

    /**
     * Returns direction for the given locale (rtl or ltr)
     * @param {String} locale
     * @returns {string}
     */
    getDirection: function (locale) {
        return locale.length >= 2 && RTL_LOCALES.indexOf(locale.substr(0, 2)) >= 0 ? 'rtl' : 'ltr';
    },

    /**
     * Returns best matching locale in available locales considering
     * desired one.
     * @param {String[]} availableLocales
     * @param {String} desiredLocale
     * @returns {String|undefined}
     */
    chooseBestLocale: function (availableLocales, desiredLocale) {
        // 1. Let candidate be locale
        var candidate = desiredLocale;

        // 2. Repeat
        while (candidate) {
            // a. If availableLocales contains an element equal to candidate, then return
            // candidate.
            if (Array.prototype.indexOf.call(availableLocales, candidate) > -1) {
                return candidate;
            }

            // b. Let pos be the character index of the last occurrence of "-"
            // (U+002D) within candidate. If that character does not occur, return
            // undefined.
            var pos = candidate.lastIndexOf('-');

            if (pos < 0) {
                return;
            }

            // c. If pos ≥ 2 and the character "-" occurs at index pos-2 of candidate,
            //    then decrease pos by 2.
            if (pos >= 2 && candidate.charAt(pos - 2) === '-') {
                pos -= 2;
            }

            // d. Let candidate be the substring of candidate from position 0, inclusive,
            //    to position pos, exclusive.
            candidate = candidate.substring(0, pos);
        }
    }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],77:[function(require,module,exports){
/**
 * Tne Logger Factory
 * @module util/logger-factory
 * @exports {loggerFactory} The static logger factory
 */


'use strict';

var bunyan = require('browser-bunyan');
var util = require('../util/util');

var loggerMap = {};
var lastLogger = null;

var loggerFactory = {
    defaultLoggerName: 'logger',
    defaultLogLevel: 'info'
};

/**
 * Creates a logger.
 * @static
 * @method
 * @param {Object} opts
 * @param {Object} [opts.parentLog] Specifies a parent logger for a logger to be created as a child logger
 * @param {string} [opts.loggerName] A logger name. If not specified a logger will be given "<i>logger</i>" name.
 * @param {string} [opts.logLevel] The default log level. Defaults to 'info'.
 * @param {boolean} [opts.appendId] If true, a unique string will be appended to a logger name. Defaults to <i>false</i>
 * @returns {Object} A new logger object
 */
loggerFactory.createLogger = function(opts) {

    opts = opts || {};

    var parentLog = opts.parentLog || null;
    var loggerName = opts.loggerName || this.defaultLoggerName;
    var logLevel = opts.logLevel || this.defaultLogLevel;
    var appendId = opts.appendId || false;

    if(appendId) {
        loggerName += '/' + util.randomId();
    }

    var logger;
    if(parentLog) {
        logger = parentLog.child({ childName: loggerName});
    } else {
        logger = bunyan.createLogger({
            name: loggerName,
            streams: [
                {
                    level: logLevel,
                    stream: new bunyan.ConsoleFormattedStream(),
                    type: 'raw'
                }
            ],
            src: bunyan.resolveLevel(logLevel) <= bunyan.DEBUG
        });
    }

    loggerMap[loggerName] = logger;
    lastLogger = logger;

    return logger;
};

/**
 * Gets a logger, first tries to get a logger with the matching name. If no logger name is given or no matching
 * logger is found, get the last created logger. Falls back to creating a new logger.
 * @static
 * @method
 * @param {String} [loggerName]
 * @returns {*}
 */
loggerFactory.getLogger = function(loggerName) {

    if(loggerName && loggerMap[loggerName]) {
        return loggerMap[loggerName];
    } else if(lastLogger) {
        return lastLogger;
    } else {
        return loggerFactory.createLogger();
    }
};

module.exports = loggerFactory;
},{"../util/util":78,"browser-bunyan":80}],78:[function(require,module,exports){
(function (global){
/**
 * Common utilities
 * @module util/util
 */

'use strict';

var bunyan = require('browser-bunyan');

//super stripped down lodash. Only what we need
var _ = {
    cloneDeep: require('lodash/lang/cloneDeep'),
    merge: require('lodash/object/merge'),
    omit: require('lodash/object/omit'),
    assign: require('lodash/object/assign')
};

//widget engine utils.
//If available, delegate a util method in this modele to a lodash one. Only require the specific lodash module required
var util = {};

/**
 * <p>Returns true if:
 * <ol>
 *  <li>the value is a boolean and true<br>
 *  <li>the value is a number and not 0<br>
 *  <li>the value is a string and equal to 'true' (after trimming and ignoring case)
 * </ol>
 * @memberOf util
 * @param {*} val The value to parse
 * @return {boolean} A boolean value depending on the parsing result
 */
/* jshint ignore:start */
util.parseBoolean = function (val) {

    //double equals (==) here is deliberate
    return ((typeof val === 'boolean' || val instanceof Boolean) && val == true) ||
        ((typeof val === 'string' || val instanceof String) && /^\s*true\s*$/i.test(val)) ||
        ((typeof val === 'number' || val instanceof Number) && val != 0);
};
/* jshint ignore:end */

/**
 * Determines if an http(s) url is absolute.
 * @param {string} url
 * @returns {boolean} true if the url is absolute
 */
util.isUrlAbsolute = function (url) {
    var absoluteRegex = /^https?:\/\/|file?:\/\//i;
    return absoluteRegex.test(url);
};

/**
 * Determines if a url is site relative (/path/to/page)
 * @param {string} url
 * @returns {boolean} true if the url is site relative
 */
util.isUrlSiteRelative = function (url) {
    return url.indexOf('/') === 0;
};

/**
 * Determines if a url is document relative (path/to/page or ../path/to/page)
 * @param {string} url
 * @returns {boolean}
 */
util.isUrlDocumentRelative = function (url) {
    return !(util.isUrlAbsolute(url) || util.isUrlSiteRelative(url));
};

/**
 * Determines if the widget engine is running on the filesystem
 * @return {boolean}
 */
util.isRunningOnFilesystem = function() {
    return typeof global.location !== 'undefined' && global.location.protocol === 'file:';
};


/**
 * Determines if a url is for a resource on the filesystem
 * @param url
 * @return {boolean}
 */
util.isUrlForFile = function(url) {
    var urlIsAbsoluteForFile = /^file:/.test(url);
    var urlIsRelativeForFile = util.isRunningOnFilesystem() && util.isUrlDocumentRelative(url);
    return urlIsAbsoluteForFile || urlIsRelativeForFile;
};

/**
 * Merges objects
 * @see {@link https://lodash.com/docs#merge}
 */
util.merge = _.merge;

/**
 * Assigns object fields
 * @see {@link https://lodash.com/docs#assign}
 */
util.assign = _.assign;

/**
 * Omit properties from an object
 * @see {@link https://lodash.com/docs#omit}
 */
util.omit = _.omit;

/**
 * Checks if string starts with the given target string.
 * @param {string} string The string to search.
 * @param {string} target The string to search for.
 * @param {number} [position=0] The position to search from.
 * @returns {boolean}
 */
util.startsWith = function(string, target, position){
    position = position || 0;
    return string.substr(position, target.length) === target;
};

/**
 * Checks if string ends with the given target string.
 * @param {string} string The string to search.
 * @param {string} target The string to search for.
 * @param {number} [position=string.length] The position to search up to.
 * @returns {boolean}
 */
util.endsWith = function(string, target, position) {
    if(String.prototype.endsWith){
        return string.endsWith(target, position);
     } else {
        var subjectString = string.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= target.length;
        var lastIndex = subjectString.indexOf(target, position);
        return lastIndex !== -1 && lastIndex === position;
     }
 };

/**
 * Creates a deep clone of value.
 * @see {@link https://lodash.com/docs#cloneDeep}
 */
util.cloneDeep = function () {
    try {
        return _.cloneDeep.apply(_, Array.prototype.slice.call(arguments));
    } catch (e) {
        console.warn(e);
        throw e;
    }
};

/**
 * Checks if value is classified as an Array object.
 * @see {@link https://lodash.com/docs#isArray}
 */
util.isArray = _.isArray;

/**
 * Returns a formatted string using the first argument as a printf-like format.
 * @see {@link https://nodejs.org/api/util.html#util_util_format_format}
 */
util.format = function (f) {

    //This code is adapted from node's util.format, with support for objects removed
    //See https://github.com/joyent/node/blob/master/lib/util.js
    //
    //This code exists because at the time of writing, it is the only function from node util that we need and
    //I'm trying to keep the browserified package size down. PM

    if (f === null) {
        return 'null';
    }

    if (typeof f !== 'string') {
        return f.toString();
    }

    //ignored by jshint, because i wanted to modify this from the original code as little as possible
    /* jshint ignore:start */

    var formatRegExp = /%[sdj%]/g;

    var i = 1;
    var args = arguments;
    var len = args.length;
    var str = String(f).replace(formatRegExp, function (x) {
        if (x === '%%') return '%';
        if (i >= len) return x;
        switch (x) {
            case '%s':
                return String(args[i++]);
            case '%d':
                return Number(args[i++]);
            case '%j':
                try {
                    return JSON.stringify(args[i++]);
                } catch (_) {
                    return '[Circular]';
                }
            default:
                return x;
        }
    });
    for (var x = args[i]; i < len; x = args[++i]) {
        str += ' ' + x;
    }
    return str;

    /* jshint ignore:end */
};

/**
 * Given a locale, returns its descendant parts. E.g
 *
 * @param {string} locale
 * @returns {Array}
 */
util.getDescendantLocales = function (locale) {

    //normalize to lowercase
    locale = locale.toLowerCase();

    var descendantLocales = [];
    var parts = locale.split('-');
    var part;
    while (part = parts.shift()) { // jshint ignore:line
        var previousDescendant = descendantLocales[descendantLocales.length - 1];
        descendantLocales.push((previousDescendant ? previousDescendant + '-' : '') + part);
    }

    return descendantLocales;
};

/**
 * Generates a random id
 * @returns {string} The generated id
 */
util.randomId = function () {
    return Math.random().toString(36).substring(7);
};

/**
 * Replaces placeholders in a string using the configVar map.
 * @param   {String} path The path to replace using the config vars
 * @param   {Object} varMap Dictionary object which contains portal data
 * @param   {Object} log Logger instance
 * @returns {String} The updatedp path
 */
util.replacePathVars = function (path, varMap, log) {
    for (var urlVar in varMap) {
        if (varMap.hasOwnProperty(urlVar)) {
            var varRegexp = new RegExp('\\$\\(' + urlVar + '\\)', 'g');

            if (log && log.level() <= bunyan.DEBUG && varRegexp.test(path)) {
                log.debug('Updating resource url. Replacing %s for %s in [%s]', varRegexp, varMap[urlVar], path);
            }

            path = path.replace(varRegexp, varMap[urlVar]);
        }
    }

    return path;
};

/**
 * Given a Response object, returns the JSON or HTML body. Throws an error if the content type was unknown, or
 * undefined and the content type could not be guessed
 * @param response
 * @return {*|Promise|Promise.<TResult>}
 */
util.getContentBodyAndTypeFromResponse = function (response) {

    return response.text().then(function(text) {
        text = text.trim();
        var contentType = response.headers.get('content-type');
        var type = null, err = null;
        
        if(contentType && contentType.indexOf('/json') !== -1) {
            //json
            type = 'json';
        } else if(contentType && contentType.indexOf('text/html') !== -1) {
            //html
            type = 'html';
        } else if(typeof contentType === 'string' && contentType.length > 0) {
            //unknown
            err = new Error('Content type not supported for rendering: ' + contentType);
        } else if (text && util.startsWith(text, '{')) {
            //guess json
            type = 'json';
        } else if (text && util.startsWith(text, '<')) {
            //guess html
            type = 'html';
        } else {
            //couldn't guess
            err = new Error('Undefined content type for response.');
        }
        
        if(err) { 
            throw err;
        }
        
        return {
            type: type,
            body: type === 'json' ? JSON.parse(text) : text
        };
    });
};

/**
 * Determines whether an element passed as the second argument belongs to an item (widget, container).
 * It takes the closest ancestor element that represents an item body (an element with data-widget attribute)
 * and compares a value of the attribute with the value passed as the first argument.
 * @param {string} itemName The name of an item
 * @param {Element} descendantEl An element within item's body
 * @returns {boolean} true if an element belongs to the item and false if it belongs to item's child/descendant item
 */
util.ensureElementBelongsToItem = function (itemName, descendantEl) {
    if (!itemName || !descendantEl) {
        return false;
    }

    var parentEl = descendantEl;
    var itemNameFromParentEl;

    while (parentEl) {
       itemNameFromParentEl = parentEl.getAttribute ? parentEl.getAttribute('data-widget') : null;

        if (itemNameFromParentEl) {
            // return false if element belongs to another item
            return itemNameFromParentEl === itemName;
        }

        parentEl = parentEl.parentNode;
    }

    return false;
};

module.exports = util;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"browser-bunyan":80,"lodash/lang/cloneDeep":124,"lodash/object/assign":133,"lodash/object/merge":136,"lodash/object/omit":137}],79:[function(require,module,exports){
// This code is a modification of the VError (https://github.com/davepacheco/node-verror)
// It contains the following simplifications to be optimized for the browser
// * no printf style arguments, instead multiple arguments after the wrapped error are joined into one string

/* jshint ignore:start */
/*
 * VError([cause], fmt[, arg...]): Like JavaScript's built-in Error class, but
 * supports a "cause" argument (another error) and a printf-style message.  The
 * cause argument can be null or omitted entirely.
 *
 * Examples:
 *
 * CODE                                    MESSAGE
 * new VError('something bad happened')    "something bad happened"
 * new VError('missing file: "%s"', file)  "missing file: "/etc/passwd"
 *   with file = '/etc/passwd'
 * new VError(err, 'open failed')          "open failed: file not found"
 *   with err.message = 'file not found'
 */
function VError(options)
{
    var args, obj, causedBy, ctor, tailmsg;

    /*
     * This is a regrettable pattern, but JavaScript's built-in Error class
     * is defined to work this way, so we allow the constructor to be called
     * without "new".
     */
    if (!(this instanceof VError)) {
        args = Array.prototype.slice.call(arguments, 0);
        obj = Object.create(VError.prototype);
        VError.apply(obj, arguments);
        return (obj);
    }

    if (options instanceof Error || typeof (options) === 'object') {
        args = Array.prototype.slice.call(arguments, 1);
    } else {
        args = Array.prototype.slice.call(arguments, 0);
        options = undefined;
    }

    /*
     * extsprintf (which we invoke here with our caller's arguments in order
     * to construct this Error's message) is strict in its interpretation of
     * values to be processed by the "%s" specifier.  The value passed to
     * extsprintf must actually be a string or something convertible to a
     * String using .toString().  Passing other values (notably "null" and
     * "undefined") is considered a programmer error.  The assumption is
     * that if you actually want to print the string "null" or "undefined",
     * then that's easy to do that when you're calling extsprintf; on the
     * other hand, if you did NOT want that (i.e., there's actually a bug
     * where the program assumes some variable is non-null and tries to
     * print it, which might happen when constructing a packet or file in
     * some specific format), then it's better to stop immediately than
     * produce bogus output.
     *
     * However, sometimes the bug is only in the code calling VError, and a
     * programmer might prefer to have the error message contain "null" or
     * "undefined" rather than have the bug in the error path crash the
     * program (making the first bug harder to identify).  For that reason,
     * by default VError converts "null" or "undefined" arguments to their
     * string representations and passes those to extsprintf.  Programmers
     * desiring the strict behavior can use the SError class or pass the
     * "strict" option to the VError constructor.
     */
    if (!options || !options.strict) {
        args = args.map(function (a) {
            return (a === null ? 'null' :
                    a === undefined ? 'undefined' : a);
        });
    }

    tailmsg = args.length > 0 ?
        args.join('; ') : '';
    this.jse_shortmsg = tailmsg;
    this.jse_summary = tailmsg;

    if (options) {
        causedBy = options.cause;

        if (!causedBy || !(options.cause instanceof Error))
            causedBy = options;

        if (causedBy && (causedBy instanceof Error)) {
            this.jse_cause = causedBy;
            this.jse_summary += ': ' + causedBy.message;
        }
    }

    this.message = this.jse_summary;
    Error.call(this, this.jse_summary);

    if (Error.captureStackTrace) {
        ctor = options ? options.constructorOpt : undefined;
        ctor = ctor || arguments.callee;
        Error.captureStackTrace(this, ctor);
    }

    return (this);
}

VError.prototype = Error.prototype;
VError.prototype.name = 'Widget Error';

VError.prototype.toString = function ve_toString()
{
    var str = (this.hasOwnProperty('name') && this.name ||
        this.constructor.name || this.constructor.prototype.name);
    if (this.message)
        str += ': ' + this.message;

    return (str);
};

VError.prototype.cause = function ve_cause()
{
    return (this.jse_cause);
};

/**
 * Checks whether an error or one of its possible causes has a code provided.
 * @method
 * @param {Array|String} code(s) to look for.
 * @returns {Boolean} True if one of codes provided has been found, false otherwise.
 */
VError.prototype.hasCode = function ve_hasCode(code) {
    if (!code) return false;

    var codes = Object.prototype.toString.call(code) !== '[object Array]'
        ? [code] : code;

    if (codes.length === 0) return false;

    var error = this;
    var found = false;

    while(error) {
        if (error.code && codes.indexOf(error.code) > -1) {
             found = true;
            break;
        }

        error = error.cause();
    }

    return found;
};

module.exports = VError;

/* jshint ignore:end */


},{}],80:[function(require,module,exports){
/**
 * !This is a stripped down version of Bunyan targeted specifically for the browser
 *
 * -------------------------------------------------------------------------------
 *
 * Copyright (c) 2014 Trent Mick. All rights reserved.
 * Copyright (c) 2014 Joyent Inc. All rights reserved.
 *
 * The bunyan logging library for node.js.
 *
 * -*- mode: js -*-
 * vim: expandtab:ts=4:sw=4
 */
    
'use strict';

var VERSION = '0.2.3';

// Bunyan log format version. This becomes the 'v' field on all log records.
// `0` is until I release a version '1.0.0' of node-bunyan. Thereafter,
// starting with `1`, this will be incremented if there is any backward
// incompatible change to the log record format. Details will be in
// 'CHANGES.md' (the change log).
var LOG_VERSION = 0;

//---- Internal support stuff

var CALL_STACK_ERROR = 'call-stack-error';

/**
 * A shallow copy of an object. Bunyan logging attempts to never cause
 * exceptions, so this function attempts to handle non-objects gracefully.
 */
function objCopy(obj) {
    if (typeof obj === 'undefined' || obj === null) {  // null or undefined
        return obj;
    } else if (Array.isArray(obj)) {
        return obj.slice();
    } else if (typeof (obj) === 'object') {
        var copy = {};
        Object.keys(obj).forEach(function (k) {
            copy[k] = obj[k];
        });
        return copy;
    } else {
        return obj;
    }
}

var format = function(f) {

    if(f === null) {
        return 'null';
    }

    if(typeof f !== 'string') {
        return f.toString();
    }
    var formatRegExp = /%[sdj%]/g;

    var i = 1;
    var args = arguments;
    var len = args.length;
    var str = String(f).replace(formatRegExp, function(x) {
        if (x === '%%') {
            return '%';
        }
        if (i >= len) {
            return x;
        }
        switch (x) {
            case '%s': return String(args[i++]);
            case '%d': return Number(args[i++]);
            case '%j':
                try {
                    return JSON.stringify(args[i++]);
                } catch (_) {
                    return '[Circular]';
                }
                break;
            default:
                return x;
        }
    });
    for (var x = args[i]; i < len; x = args[++i]) {
        str += ' ' + x;
    }
    return str;
};

function extractSrcFromStacktrace(stack, level) {

    var stackLines = stack.split('\n');

    //chrome starts with error
    if(stackLines[0] && stackLines[0].indexOf(CALL_STACK_ERROR) >= 0) {
        stackLines.shift();
    }

    //the line of the stacktrace
    var targetLine = stackLines[level];
    var lineInfo = null;
    if(targetLine) {
        var execResult = /^\s*(at|.*@)\s*(.+)?$/.exec(targetLine);
        if(Array.isArray(execResult) && execResult[2]) {
            lineInfo = execResult[2];
        } else {
            lineInfo = targetLine;    
        }
    }
    return lineInfo;
}

function _indent(s, indent) {
    if (!indent) {
        indent = '    ';
    }
    var lines = s.split(/\r?\n/g);
    return indent + lines.join('\n' + indent);
}


/**
 * Warn about an bunyan processing error.
 *
 * @param msg {String} Message with which to warn.
 * @param dedupKey {String} Optional. A short string key for this warning to
 *      have its warning only printed once.
 */
function _warn(msg, dedupKey) {
    if (dedupKey) {
        if (_warned[dedupKey]) {
            return;
        }
        _warned[dedupKey] = true;
    }
    console.error(msg + '\n');
}
function _haveWarned(dedupKey) {
    return _warned[dedupKey];
}
var _warned = {};


function ConsoleRawStream() {
}
ConsoleRawStream.prototype.write = function (rec) {
    if (rec.level < INFO) {
        console.log(rec);
    } else if (rec.level < WARN) {
        console.info(rec);
    } else if (rec.level < ERROR) {
        console.warn(rec);
    } else {
        console.error(rec);
    }

    if(rec.err && rec.err.stack) {
        console.error(rec.err.stack);
    }
};

function ConsoleFormattedStream() {}
ConsoleFormattedStream.prototype.write = function (rec) {

    var levelCss,
        defaultCss = 'color: DimGray',
        msgCss = 'color: SteelBlue',
        srcCss = 'color: DimGray; font-style: italic; font-size: 0.9em';

    if (rec.level < DEBUG) {
        levelCss = 'color: DeepPink';
    } else if (rec.level < INFO) {
        levelCss = 'color: GoldenRod';
    } else if (rec.level < WARN) {
        levelCss = 'color: DarkTurquoise';
    } else if (rec.level < ERROR) {
        levelCss = 'color: Purple';
    } else if (rec.level < FATAL) {
        levelCss = 'color: Crimson';
    } else {
        levelCss = 'color: Black';
    }

    var loggerName = rec.childName ? rec.name + '/' + rec.childName : rec.name;

    //get level name and pad start with spacs
    var levelName = nameFromLevel[rec.level].toUpperCase();
    levelName = Array(6 - levelName.length).join(' ') + levelName;

    function padZeros(number, len) {
        return Array((len + 1) - (number + '').length).join('0') + number;
    }

    console.log('[%s:%s:%s:%s] %c%s%c: %s: %c%s %c%s',
        padZeros(rec.time.getHours(), 2), padZeros(rec.time.getMinutes(), 2),
        padZeros(rec.time.getSeconds(), 2), padZeros(rec.time.getMilliseconds(), 4),
        levelCss, levelName,
        defaultCss, loggerName,
        msgCss, rec.msg,
        srcCss, rec.src || '');
    if(rec.err && rec.err.stack) {
        console.log('%c%s,', levelCss, rec.err.stack);
    }
};

//---- Levels

var TRACE = 10;
var DEBUG = 20;
var INFO = 30;
var WARN = 40;
var ERROR = 50;
var FATAL = 60;

var levelFromName = {
    'trace': TRACE,
    'debug': DEBUG,
    'info': INFO,
    'warn': WARN,
    'error': ERROR,
    'fatal': FATAL
};
var nameFromLevel = {};
Object.keys(levelFromName).forEach(function (name) {
    nameFromLevel[levelFromName[name]] = name;
});

/**
 * Resolve a level number, name (upper or lowercase) to a level number value.
 *
 * @api public
 */
function resolveLevel(nameOrNum) {
    var level = (typeof (nameOrNum) === 'string' ? levelFromName[nameOrNum.toLowerCase()] : nameOrNum);
    return level;
}

//---- Logger class

/**
 * Create a Logger instance.
 *
 * @param options {Object} See documentation for full details. At minimum
 *    this must include a 'name' string key. Configuration keys:
 *      - `streams`: specify the logger output streams. This is an array of
 *        objects with these fields:
 *          - `type`: The stream type. See README.md for full details.
 *            Often this is implied by the other fields. Examples are
 *            'file', 'stream' and "raw".
 *          - `level`: Defaults to 'info'.
 *          - `path` or `stream`: The specify the file path or writeable
 *            stream to which log records are written. E.g.
 *            `stream: process.stdout`.
 *          - `closeOnExit` (boolean): Optional. Default is true for a
 *            'file' stream when `path` is given, false otherwise.
 *        See README.md for full details.
 *      - `level`: set the level for a single output stream (cannot be used
 *        with `streams`)
 *      - `stream`: the output stream for a logger with just one, e.g.
 *        `process.stdout` (cannot be used with `streams`)
 *      - `serializers`: object mapping log record field names to
 *        serializing functions. See README.md for details.
 *      - `src`: Boolean (default false). Set true to enable 'src' automatic
 *        field with log call source info.
 *    All other keys are log record fields.
 *
 * An alternative *internal* call signature is used for creating a child:
 *    new Logger(<parent logger>, <child options>[, <child opts are simple>]);
 *
 * @param _childSimple (Boolean) An assertion that the given `_childOptions`
 *    (a) only add fields (no config) and (b) no serialization handling is
 *    required for them. IOW, this is a fast path for frequent child
 *    creation.
 */
function Logger(options, _childOptions, _childSimple) {
    if (!(this instanceof Logger)) {
        return new Logger(options, _childOptions);
    }

    // Input arg validation.
    var parent;
    if (_childOptions !== undefined) {
        parent = options;
        options = _childOptions;
        if (!(parent instanceof Logger)) {
            throw new TypeError(
                'invalid Logger creation: do not pass a second arg');
        }
    }
    if (!options) {
        throw new TypeError('options (object) is required');
    }
    if (!parent) {
        if (!options.name) {
            throw new TypeError('options.name (string) is required');
        }
    } else {
        if (options.name) {
            throw new TypeError(
                'invalid options.name: child cannot set logger name');
        }
    }
    if (options.stream && options.streams) {
        throw new TypeError('cannot mix "streams" and "stream" options');
    }
    if (options.streams && !Array.isArray(options.streams)) {
        throw new TypeError('invalid options.streams: must be an array');
    }
    if (options.serializers && (typeof (options.serializers) !== 'object' || Array.isArray(options.serializers))) {
        throw new TypeError('invalid options.serializers: must be an object');
    }

    var fields, name, i;

    // Fast path for simple child creation.
    if (parent && _childSimple) {
        // `_isSimpleChild` is a signal to stream close handling that this child
        // owns none of its streams.
        this._isSimpleChild = true;

        this._level = parent._level;
        this.streams = parent.streams;
        this.serializers = parent.serializers;
        this.src = parent.src;
        fields = this.fields = {};
        var parentFieldNames = Object.keys(parent.fields);
        for (i = 0; i < parentFieldNames.length; i++) {
            name = parentFieldNames[i];
            fields[name] = parent.fields[name];
        }
        var names = Object.keys(options);
        for (i = 0; i < names.length; i++) {
            name = names[i];
            fields[name] = options[name];
        }
        return;
    }

    // Null values.
    var self = this;
    if (parent) {
        this._level = parent._level;
        this.streams = [];
        for (i = 0; i < parent.streams.length; i++) {
            var s = objCopy(parent.streams[i]);
            s.closeOnExit = false; // Don't own parent stream.
            this.streams.push(s);
        }
        this.serializers = objCopy(parent.serializers);
        this.src = parent.src;
        this.fields = objCopy(parent.fields);
        if (options.level) {
            this.level(options.level);
        }
    } else {
        this._level = Number.POSITIVE_INFINITY;
        this.streams = [];
        this.serializers = null;
        this.src = false;
        this.fields = {};
    }

    // Handle *config* options (i.e. options that are not just plain data
    // for log records).
    if (options.stream) {
        self.addStream({
            type: 'stream',
            stream: options.stream,
            closeOnExit: false,
            level: options.level
        });
    } else if (options.streams) {
        options.streams.forEach(function (s) {
            self.addStream(s, options.level);
        });
    } else if (parent && options.level) {
        this.level(options.level);
    } else if (!parent) {

        /*
         * In the browser we'll be emitting to console.log by default.
         * Any console.log worth its salt these days can nicely render
         * and introspect objects (e.g. the Firefox and Chrome console)
         * so let's emit the raw log record. Are there browsers for which
         * that breaks things?
         */
        self.addStream({
            type: 'raw',
            stream: new ConsoleRawStream(),
            closeOnExit: false,
            level: options.level
        });

    }
    if (options.serializers) {
        self.addSerializers(options.serializers);
    }
    if (options.src) {
        this.src = true;
    }

    // Fields.
    // These are the default fields for log records (minus the attributes
    // removed in this constructor). To allow storing raw log records
    // (unrendered), `this.fields` must never be mutated. Create a copy for
    // any changes.
    fields = objCopy(options);
    delete fields.stream;
    delete fields.level;
    delete fields.streams;
    delete fields.serializers;
    delete fields.src;
    if (this.serializers) {
        this._applySerializers(fields);
    }
    Object.keys(fields).forEach(function (k) {
        self.fields[k] = fields[k];
    });
}

/**
 * Add a stream
 *
 * @param stream {Object}. Object with these fields:
 *    - `type`: The stream type. See README.md for full details.
 *      Often this is implied by the other fields. Examples are
 *      'file', 'stream' and "raw".
 *    - `path` or `stream`: The specify the file path or writeable
 *      stream to which log records are written. E.g.
 *      `stream: process.stdout`.
 *    - `level`: Optional. Falls back to `defaultLevel`.
 *    - `closeOnExit` (boolean): Optional. Default is true for a
 *      'file' stream when `path` is given, false otherwise.
 *    See README.md for full details.
 * @param defaultLevel {Number|String} Optional. A level to use if
 *      `stream.level` is not set. If neither is given, this defaults to INFO.
 */
Logger.prototype.addStream = function addStream(s, defaultLevel) {
    var self = this;
    if (defaultLevel === null || defaultLevel === undefined) {
        defaultLevel = INFO;
    }

    s = objCopy(s);

    // Implicit 'type' from other args.
    if (!s.type && s.stream) {
        s.type = 'raw';
    }
    s.raw = (s.type === 'raw');  // PERF: Allow for faster check in `_emit`.

    if (s.level) {
        s.level = resolveLevel(s.level);
    } else {
        s.level = resolveLevel(defaultLevel);
    }
    if (s.level < self._level) {
        self._level = s.level;
    }

    switch (s.type) {
        case 'stream':
            if (!s.closeOnExit) {
                s.closeOnExit = false;
            }
            break;
        case 'raw':
            if (!s.closeOnExit) {
                s.closeOnExit = false;
            }
            break;
        default:
            throw new TypeError('unknown stream type "' + s.type + '"');
    }

    self.streams.push(s);
    delete self.haveNonRawStreams;  // reset
};


/**
 * Add serializers
 *
 * @param serializers {Object} Optional. Object mapping log record field names
 *    to serializing functions. See README.md for details.
 */
Logger.prototype.addSerializers = function addSerializers(serializers) {
    var self = this;

    if (!self.serializers) {
        self.serializers = {};
    }
    Object.keys(serializers).forEach(function (field) {
        var serializer = serializers[field];
        if (typeof (serializer) !== 'function') {
            throw new TypeError(format(
                'invalid serializer for "%s" field: must be a function',
                field));
        } else {
            self.serializers[field] = serializer;
        }
    });
};


/**
 * Create a child logger, typically to add a few log record fields.
 *
 * This can be useful when passing a logger to a sub-component, e.g. a
 * 'wuzzle' component of your service:
 *
 *    var wuzzleLog = log.child({component: 'wuzzle'})
 *    var wuzzle = new Wuzzle({..., log: wuzzleLog})
 *
 * Then log records from the wuzzle code will have the same structure as
 * the app log, *plus the component='wuzzle' field*.
 *
 * @param options {Object} Optional. Set of options to apply to the child.
 *    All of the same options for a new Logger apply here. Notes:
 *      - The parent's streams are inherited and cannot be removed in this
 *        call. Any given `streams` are *added* to the set inherited from
 *        the parent.
 *      - The parent's serializers are inherited, though can effectively be
 *        overwritten by using duplicate keys.
 *      - Can use `level` to set the level of the streams inherited from
 *        the parent. The level for the parent is NOT affected.
 * @param simple {Boolean} Optional. Set to true to assert that `options`
 *    (a) only add fields (no config) and (b) no serialization handling is
 *    required for them. IOW, this is a fast path for frequent child
 *    creation. See 'tools/timechild.js' for numbers.
 */
Logger.prototype.child = function (options, simple) {
    return new (this.constructor)(this, options || {}, simple);
};

/**
 * Get/set the level of all streams on this logger.
 *
 * Get Usage:
 *    // Returns the current log level (lowest level of all its streams).
 *    log.level() -> INFO
 *
 * Set Usage:
 *    log.level(INFO)       // set all streams to level INFO
 *    log.level('info')     // can use 'info' et al aliases
 */
Logger.prototype.level = function level(value) {
    if (value === undefined) {
        return this._level;
    }
    var newLevel = resolveLevel(value);
    var len = this.streams.length;
    for (var i = 0; i < len; i++) {
        this.streams[i].level = newLevel;
    }
    this._level = newLevel;
};


/**
 * Get/set the level of a particular stream on this logger.
 *
 * Get Usage:
 *    // Returns an array of the levels of each stream.
 *    log.levels() -> [TRACE, INFO]
 *
 *    // Returns a level of the identified stream.
 *    log.levels(0) -> TRACE      // level of stream at index 0
 *    log.levels('foo')           // level of stream with name 'foo'
 *
 * Set Usage:
 *    log.levels(0, INFO)         // set level of stream 0 to INFO
 *    log.levels(0, 'info')       // can use 'info' et al aliases
 *    log.levels('foo', WARN)     // set stream named 'foo' to WARN
 *
 * Stream names: When streams are defined, they can optionally be given
 * a name. For example,
 *       log = new Logger({
 *         streams: [
 *           {
 *             name: 'foo',
 *             path: '/var/log/my-service/foo.log'
 *             level: 'trace'
 *           },
 *         ...
 *
 * @param name {String|Number} The stream index or name.
 * @param value {Number|String} The level value (INFO) or alias ('info').
 *    If not given, this is a 'get' operation.
 * @throws {Error} If there is no stream with the given name.
 */
Logger.prototype.levels = function levels(name, value) {
    if (name === undefined) {
        return this.streams.map(
            function (s) {
                return s.level;
            });
    }
    var stream;
    if (typeof (name) === 'number') {
        stream = this.streams[name];
        if (stream === undefined) {
            throw new Error('invalid stream index: ' + name);
        }
    } else {
        var len = this.streams.length;
        for (var i = 0; i < len; i++) {
            var s = this.streams[i];
            if (s.name === name) {
                stream = s;
                break;
            }
        }
        if (!stream) {
            throw new Error(format('no stream with name "%s"', name));
        }
    }
    if (value === undefined) {
        return stream.level;
    } else {
        var newLevel = resolveLevel(value);
        stream.level = newLevel;
        if (newLevel < this._level) {
            this._level = newLevel;
        }
    }
};


/**
 * Apply registered serializers to the appropriate keys in the given fields.
 *
 * Pre-condition: This is only called if there is at least one serializer.
 *
 * @param fields (Object) The log record fields.
 * @param excludeFields (Object) Optional mapping of keys to `true` for
 *    keys to NOT apply a serializer.
 */
Logger.prototype._applySerializers = function (fields, excludeFields) {
    var self = this;

    // Check each serializer against these (presuming number of serializers
    // is typically less than number of fields).
    Object.keys(this.serializers).forEach(function (name) {
        if (fields[name] === undefined ||
            (excludeFields && excludeFields[name])) {
            return;
        }
        try {
            fields[name] = self.serializers[name](fields[name]);
        } catch (err) {
            _warn(format('bunyan: ERROR: Exception thrown from the "%s" ' +
                    'Bunyan serializer. This should never happen. This is a bug' +
                    'in that serializer function.\n%s',
                name, err.stack || err));
            fields[name] = format('(Error in Bunyan log "%s" serializer broke field. See stderr for details.)', name);
        }
    });
};


/**
 * Emit a log record.
 *
 * @param rec {log record}
 * @param noemit {Boolean} Optional. Set to true to skip emission
 *      and just return the JSON string.
 */
Logger.prototype._emit = function (rec, noemit) {
    var i;

    // Lazily determine if this Logger has non-'raw' streams. If there are
    // any, then we need to stringify the log record.
    if (this.haveNonRawStreams === undefined) {
        this.haveNonRawStreams = false;
        for (i = 0; i < this.streams.length; i++) {
            if (!this.streams[i].raw) {
                this.haveNonRawStreams = true;
                break;
            }
        }
    }

    // Stringify the object. Attempt to warn/recover on error.
    var str;
    if (noemit || this.haveNonRawStreams) {
        try {
            str = JSON.stringify(rec, safeCycles()) + '\n';
        } catch (e) {
            var dedupKey = e.stack.split(/\n/g, 2).join('\n');
            _warn('bunyan: ERROR: Exception in ' +
                    '`JSON.stringify(rec)`. You can install the ' +
                    '"safe-json-stringify" module to have Bunyan fallback ' +
                    'to safer stringification. Record:\n' +
                    _indent(format('%s\n%s', rec, e.stack)),
                dedupKey);
            str = format('(Exception in JSON.stringify(rec): %j. See stderr for details.)\n', e.message);

        }
    }

    if (noemit) {
        return str;
    }


    var level = rec.level;
    for (i = 0; i < this.streams.length; i++) {
        var s = this.streams[i];
        if (s.level <= level) {
            s.stream.write(s.raw ? rec : str);
        }
    }

    return str;
};


/**
 * Build a log emitter function for level minLevel. I.e. this is the
 * creator of `log.info`, `log.error`, etc.
 */
function mkLogEmitter(minLevel) {
    return function () {
        var log = this;

        function mkRecord(args) {
            var excludeFields;
            if (args[0] instanceof Error) {
                // `log.<level>(err, ...)`
                fields = {
                    // Use this Logger's err serializer, if defined.
                    err: (log.serializers && log.serializers.err ? log.serializers.err(args[0]) : Logger.stdSerializers.err(args[0]))
                };
                excludeFields = {err: true};
                if (args.length === 1) {
                    msgArgs = [fields.err.message];
                } else {
                    msgArgs = Array.prototype.slice.call(args, 1);
                }
            } else if (typeof (args[0]) !== 'object' && args[0] !== null ||
                Array.isArray(args[0])) {
                // `log.<level>(msg, ...)`
                fields = null;
                msgArgs = Array.prototype.slice.call(args);
            } else {  // `log.<level>(fields, msg, ...)`
                fields = args[0];
                msgArgs = Array.prototype.slice.call(args, 1);
            }

            // Build up the record object.
            var rec = objCopy(log.fields);
            rec.level = minLevel;
            var recFields = (fields ? objCopy(fields) : null);
            if (recFields) {
                if (log.serializers) {
                    log._applySerializers(recFields, excludeFields);
                }
                Object.keys(recFields).forEach(function (k) {
                    rec[k] = recFields[k];
                });
            }
            rec.levelName = nameFromLevel[minLevel];
            rec.msg = format.apply(log, msgArgs);
            if (!rec.time) {
                rec.time = (new Date());
            }
            // Get call source info
            if (log.src && !rec.src) {
                try {
                    //need to throw the error so there is a stack in IE		 	
                    throw new Error(CALL_STACK_ERROR);
                } catch(err) {
                    var src = extractSrcFromStacktrace(err.stack, 2);
                    if(!src && !_haveWarned('src')) {
                        _warn('Unable to determine src line info', 'src');    
                    }
                    rec.src = src || '';
                }
            }
            rec.v = LOG_VERSION;
            return rec;
        }

        var fields = null;
        var msgArgs = arguments;
        var rec = null;
        if (arguments.length === 0) {   // `log.<level>()`
            return (this._level <= minLevel);
        } else if (this._level > minLevel) {
            /* pass through */
        } else {
            rec = mkRecord(msgArgs);
            this._emit(rec);
        }
    };
}


/**
 * The functions below log a record at a specific level.
 *
 * Usages:
 *    log.<level>()  -> boolean is-trace-enabled
 *    log.<level>(<Error> err, [<string> msg, ...])
 *    log.<level>(<string> msg, ...)
 *    log.<level>(<object> fields, <string> msg, ...)
 *
 * where <level> is the lowercase version of the log level. E.g.:
 *
 *    log.info()
 *
 * @params fields {Object} Optional set of additional fields to log.
 * @params msg {String} Log message. This can be followed by additional
 *    arguments that are handled like
 *    [util.format](http://nodejs.org/docs/latest/api/all.html#util.format).
 */
Logger.prototype.trace = mkLogEmitter(TRACE);
Logger.prototype.debug = mkLogEmitter(DEBUG);
Logger.prototype.info = mkLogEmitter(INFO);
Logger.prototype.warn = mkLogEmitter(WARN);
Logger.prototype.error = mkLogEmitter(ERROR);
Logger.prototype.fatal = mkLogEmitter(FATAL);


//---- Standard serializers
// A serializer is a function that serializes a JavaScript object to a
// JSON representation for logging. There is a standard set of presumed
// interesting objects in node.js-land.

Logger.stdSerializers = {};

/*
 * This function dumps long stack traces for exceptions having a cause()
 * method. The error classes from
 * [verror](https://github.com/davepacheco/node-verror) and
 * [restify v2.0](https://github.com/mcavage/node-restify) are examples.
 *
 * Based on `dumpException` in
 * https://github.com/davepacheco/node-extsprintf/blob/master/lib/extsprintf.js
 */
function getFullErrorStack(ex) {
    var ret = ex.stack || ex.toString();
    if (ex.cause && typeof (ex.cause) === 'function') {
        var cex = ex.cause();
        if (cex) {
            ret += '\nCaused by: ' + getFullErrorStack(cex);
        }
    }
    return (ret);
}

// Serialize an Error object
// (Core error properties are enumerable in node 0.4, not in 0.6).
Logger.stdSerializers.err = function(err) {
    if (!err || !err.stack) {
        return err;
    }

    var obj = {
        message: err.message,
        name: err.name,
        stack: getFullErrorStack(err),
        code: err.code,
        signal: err.signal
    };
    return obj;
};


// A JSON stringifier that handles cycles safely.
// Usage: JSON.stringify(obj, safeCycles())
function safeCycles() {
    var seen = [];
    return function (key, val) {
        if (!val || typeof (val) !== 'object') {
            return val;
        }
        if (seen.indexOf(val) !== -1) {
            return '[Circular]';
        }
        seen.push(val);
        return val;
    };
}

//---- Exports

module.exports = Logger;

module.exports.TRACE = TRACE;
module.exports.DEBUG = DEBUG;
module.exports.INFO = INFO;
module.exports.WARN = WARN;
module.exports.ERROR = ERROR;
module.exports.FATAL = FATAL;
module.exports.resolveLevel = resolveLevel;
module.exports.levelFromName = levelFromName;
module.exports.nameFromLevel = nameFromLevel;

module.exports.VERSION = VERSION;
module.exports.LOG_VERSION = LOG_VERSION;

module.exports.createLogger = function createLogger(options) {
    return new Logger(options);
};

// Useful for custom `type == 'raw'` streams that may do JSON stringification
// of log records themselves. Usage:
//    var str = JSON.stringify(rec, bunyan.safeCycles());
module.exports.safeCycles = safeCycles;

//streams
module.exports.ConsoleFormattedStream = ConsoleFormattedStream;
module.exports.ConsoleRawStream = ConsoleRawStream;

},{}],81:[function(require,module,exports){
'use strict';

var Handlebars = require('handlebars/dist/handlebars.min');

//TODO: once handlebars-helpers is refactored into the widget engine, make this enum common
var securityProfiles = {
    /**Read, Write, Create, Delete, Admin update rights = 16*/
    ADMIN: 16,
    /**Read, Write, Create, Delete = 8*/
    CREATOR: 8,
    /**Read, Write, Create = 4*/
    COLLABORATOR: 4,
    /**Read, Write = 2*/
    CONTRIBUTOR: 2,
    /**Read = 1*/
    CONSUMER: 1,
    /**No rights*/
    NONE: 0
};

/**
 * Loop through a range of two integers inclusive
 * {{#range 1 10}}
 *   <li>Number: {{@index}}</li>
 * {{/range}}
 * @param {number} from An integer to loop from
 * @param {number} to An integer to loop to
 */
function range (from, to, options) {
    /* jshint validthis: true */
    var accum = '';
    from = parseInt(from, 10);
    to = parseInt(to, 10);

    if(isNaN(from) || isNaN(to)) {
        return '';
    }

    var data;
    var sign = from > to ? -1 : 1;
    var rangeLength = Math.abs(to - from) + 1;

    if (options.data) {
        data = Handlebars.createFrame(options.data);
    }

    for (var i = 0; i < rangeLength; i++) {
        if (data) {
            data.index = from + (i * sign);
            data.from = from;
            data.to = to;
        }

        accum += options.fn(this, { data: data });
    }
    return accum;
}

/**
 * @deprecated Use preferences.name instead
 */
function withPreference(name, options) {
    /* jshint validthis: true */
    if (this.preferences) {
        return options.fn(this.preferences[name]);
    }
}

 /**
 * @deprecated Use preferences.name.value instead
 */
function getPreferenceValue (name) {
    /* jshint validthis: true */
    if(this.preferences) {
        var pref = this.preferences[name];
        return pref ? pref.value : null;
    }
    return null;
}

/**
 * Divides one value by another. Returns the largest integer less or equal to the result
 *  `{{divide 25 5 }}` == 5
 * @param {{number}} v1
 * @param {{number}} v2
 * @returns {number}
 */
function divide (v1, v2) {
    return Math.floor(parseFloat(v1) / parseFloat(v2));
}

/**
 * Checks whether both parameters are identical (strictly equal)
 * @param {{any}} v1
 * @param {{any}} v2
 * @returns {Boolean}
 */
function equal (v1, v2) {
    /* jshint eqeqeq: false */
    return v1 == v2; //type coersion ok here
}

/**
 * Checks if the given one or more view hints exists in the property
 * @deprecated Use getViewHint instead
 * @param {Array} viewHints Array of view hints
 * @param {String} name Name parameter can be more than one
 */
function hasViewHint () {
    /* jshint validthis: true */
    var args = Array.prototype.slice.call(arguments);
    var options = args[args.length - 1];
    var names = args.slice(0, args.length - 1);

    for (var i = 0; i < names.length; i++) {
        if (this.viewhints && this.viewhints.indexOf(names[i]) >= 0) {
            return options.fn(this);
        }
    }

    return options.inverse(this);
}

/**
* Gets viewhint value of given type
* @param {String} viewhint type
*/
function getViewHint (viewHintType) {
    /* jshint validthis: true */
    //TODO: this code is temporarily duplicated in cxp-web-apis as a static function of the model helpers.
    //This code and the code in the cxp-web-apis should be consolidated to the widget engine as part of BACKLOG-12205

    var viewHintsMap = {
        designmode: ['designModeOnly'],
        role: ['admin', 'manager', 'user', 'none'],
        input: ['text-input', 'checkbox', 'select-one'],
        order: [],
        options: []
    };

    var viewhints = this.viewhints;
    if(!viewhints || !viewhints.length || !viewHintsMap[viewHintType]) {
        return undefined;
    }

    //TODO: consider use of memoization as the helper tends to be called multiple times
    // with the same argument
    //look for matching value
    var viewHintTypeLength = viewHintType.length;
    var matchedViewHint = viewhints.filter(function(viewHint) {
        return viewHintsMap[viewHintType].indexOf(viewHint) !== -1 ||
            viewHint.slice(0, viewHintTypeLength) === viewHintType;
    })[0];

    // get unprefixed value
    if (matchedViewHint && matchedViewHint.slice(0, viewHintTypeLength) === viewHintType) {
        var separator = matchedViewHint.slice(viewHintTypeLength, viewHintTypeLength + 1);

        // support both '-' (for backwards compatibility) and '=' separator chars for order only
        if (viewHintType === 'order' && (separator === '-' || separator === '=')) {
            var order = matchedViewHint.slice(viewHintTypeLength + 1);
            var parsedOrder = parseFloat(order);

            if (!isNaN(parsedOrder)) {
                order = parsedOrder;
            }
            matchedViewHint = order;
        } else if (separator === '=') {
            matchedViewHint = matchedViewHint.slice(viewHintTypeLength + 1);
        } else {
            // unsupported prefix
            matchedViewHint = undefined;
        }
    }

    //convert to boolean if it's designmode view hint
    if(viewHintType === 'designmode') {
        matchedViewHint = !!matchedViewHint;
    }

    return matchedViewHint;
}

/**
* Finds an option set in a message bundle and loops through values in the set.
* A message bundle should have "options" property which is a map of option sets.
* @param {String} [optionName] option set name. If not specified, the helper assumes that the current context is
* a preference and tries to get option name fron its "options" view hint.
*/
function eachOption (optionName, hbOptions) {
    /* jshint validthis: true */
    var result = '';

    if(optionName && typeof optionName === 'object') {
        hbOptions = optionName;
        optionName = null;
    }

    // if option name is not provided then we assume that we are in context of a preference
    if (!optionName) {
        optionName = getViewHint.call(this, 'options');
        if (!optionName) {
            return result;
        }
    }

    var intl = (hbOptions.data && hbOptions.data.intl) || {};
    var selectOptions = intl.options || {};
    var context = selectOptions[optionName];

    if (!Array.isArray(context)) {
        return result;
    }

    var last = context.length - 1;
    return context.reduce(function(acc, item, index) {
        var data = Handlebars.createFrame(hbOptions.data || {});
        data.key = item;
        data.index = index;
        data.first = index === 0;
        data.last = index === last;

        return acc += hbOptions.fn({key : item}, { data: data });
    }, '');
}

/**
 * Tests whether any of arguments passed have truthy value
 * @returns {Boolean} true if one of arguments is truthy, false otherwise.
 */
function or () {
    return Array.prototype.slice.call(arguments, 0, arguments.length - 1).some(function (val) {
        return !!val;
    });
}

/**
 * Tests whether every argument passed has truthy value
 * @returns {Boolean} true if all arguments are truthy, false otherwise.
 */
function and () {
    return Array.prototype.slice.call(arguments, 0, arguments.length - 1).every(function (val) {
        return !!val;
    });
}

/**
 * Coerces argument to boolean type and inverts it
 * @param {*} value
 * @returns {boolean}
 */
function not (value) {
    return !value;
}

/**
 * Returns a configuration option value
 * @param {String} name configuration option
 * @returns {*}
 */
function getConfig (name, options) {
    var data = options.data;
    return data.cxpConfig ? data.cxpConfig[name] : undefined;
}

/**
 * Determines if an item has a given view mode
 * @param {string} viewmode A view mode to check for
 * @returns {boolean}
 */
function hasViewmode (viewmode) {
    /* jshint validthis: true */
    var viewmodes = this.viewmodes || [];
    var givenViewmode = viewmode ? viewmode.toLowerCase() : '';

    return viewmodes.indexOf(givenViewmode) > -1;
}

/**
 * Gets current (the first in the list) view mode of an item
 * @returns {String} Current view mode (if any) or "none" otherwise
 */
function currentViewmode () {
    /* jshint validthis: true */
    return this.viewmodes && this.viewmodes.length ? this.viewmodes[0] : 'none';
}

/**
 * Runs then block if any of the preferences has viewhints
 */
function allowEdit (options) {
    /* jshint validthis: true */
    var preferences = this.preferences;

    var allowEdit =
        //has preferences
        Object.keys(preferences).length > 0 &&

        //has permissions:
        (this.securityProfile && securityProfiles[this.securityProfile] >= securityProfiles.CONTRIBUTOR) &&

        //view hints enable editing
        //TODO: this will need updating to use preferences as map AND check if for input viewhints
        Object.keys(preferences).some(function(prefName) {
            return preferences[prefName].viewhints && preferences[prefName].viewhints.length > 0;
        });

    if(allowEdit) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
}

/**
 * Splits a string by given separator
 * @param {string} string A string to be splitted
 * @param {string} [separator=/\s*,+\s*|\s+/g] A separator for splitting
 * @returns {Array} Array of splitted values
 */
function split (string, separator) {
    if(typeof string !== 'string') {
        return [];
    }
    var regex = new RegExp(separator);

    //defaults to comma or spaces separation
    if(typeof separator !== 'string') {
        regex = /\s*,+\s*|\s+/g;
    }
    return string.trim().split(regex);
}

module.exports = {
    range               : range,
    withPreference      : withPreference,
    getPreferenceValue  : getPreferenceValue,
    divide              : divide,
    equal               : equal,
    hasViewHint         : hasViewHint,
    getViewHint         : getViewHint,
    eachOption          : eachOption,
    or                  : or,
    and                 : and,
    not                 : not,
    getConfig           : getConfig,
    hasViewmode         : hasViewmode,
    currentViewmode     : currentViewmode,
    allowEdit           : allowEdit,
    split               : split
};

},{"handlebars/dist/handlebars.min":82}],82:[function(require,module,exports){
/*!

 handlebars v4.0.5

Copyright (C) 2011-2015 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

@license
*/
!function(a,b){"object"==typeof exports&&"object"==typeof module?module.exports=b():"function"==typeof define&&define.amd?define([],b):"object"==typeof exports?exports.Handlebars=b():a.Handlebars=b()}(this,function(){return function(a){function b(d){if(c[d])return c[d].exports;var e=c[d]={exports:{},id:d,loaded:!1};return a[d].call(e.exports,e,e.exports,b),e.loaded=!0,e.exports}var c={};return b.m=a,b.c=c,b.p="",b(0)}([function(a,b,c){"use strict";function d(){var a=r();return a.compile=function(b,c){return k.compile(b,c,a)},a.precompile=function(b,c){return k.precompile(b,c,a)},a.AST=i["default"],a.Compiler=k.Compiler,a.JavaScriptCompiler=m["default"],a.Parser=j.parser,a.parse=j.parse,a}var e=c(1)["default"];b.__esModule=!0;var f=c(2),g=e(f),h=c(21),i=e(h),j=c(22),k=c(27),l=c(28),m=e(l),n=c(25),o=e(n),p=c(20),q=e(p),r=g["default"].create,s=d();s.create=d,q["default"](s),s.Visitor=o["default"],s["default"]=s,b["default"]=s,a.exports=b["default"]},function(a,b){"use strict";b["default"]=function(a){return a&&a.__esModule?a:{"default":a}},b.__esModule=!0},function(a,b,c){"use strict";function d(){var a=new h.HandlebarsEnvironment;return n.extend(a,h),a.SafeString=j["default"],a.Exception=l["default"],a.Utils=n,a.escapeExpression=n.escapeExpression,a.VM=p,a.template=function(b){return p.template(b,a)},a}var e=c(3)["default"],f=c(1)["default"];b.__esModule=!0;var g=c(4),h=e(g),i=c(18),j=f(i),k=c(6),l=f(k),m=c(5),n=e(m),o=c(19),p=e(o),q=c(20),r=f(q),s=d();s.create=d,r["default"](s),s["default"]=s,b["default"]=s,a.exports=b["default"]},function(a,b){"use strict";b["default"]=function(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b},b.__esModule=!0},function(a,b,c){"use strict";function d(a,b,c){this.helpers=a||{},this.partials=b||{},this.decorators=c||{},i.registerDefaultHelpers(this),j.registerDefaultDecorators(this)}var e=c(1)["default"];b.__esModule=!0,b.HandlebarsEnvironment=d;var f=c(5),g=c(6),h=e(g),i=c(7),j=c(15),k=c(17),l=e(k),m="4.0.5";b.VERSION=m;var n=7;b.COMPILER_REVISION=n;var o={1:"<= 1.0.rc.2",2:"== 1.0.0-rc.3",3:"== 1.0.0-rc.4",4:"== 1.x.x",5:"== 2.0.0-alpha.x",6:">= 2.0.0-beta.1",7:">= 4.0.0"};b.REVISION_CHANGES=o;var p="[object Object]";d.prototype={constructor:d,logger:l["default"],log:l["default"].log,registerHelper:function(a,b){if(f.toString.call(a)===p){if(b)throw new h["default"]("Arg not supported with multiple helpers");f.extend(this.helpers,a)}else this.helpers[a]=b},unregisterHelper:function(a){delete this.helpers[a]},registerPartial:function(a,b){if(f.toString.call(a)===p)f.extend(this.partials,a);else{if("undefined"==typeof b)throw new h["default"]('Attempting to register a partial called "'+a+'" as undefined');this.partials[a]=b}},unregisterPartial:function(a){delete this.partials[a]},registerDecorator:function(a,b){if(f.toString.call(a)===p){if(b)throw new h["default"]("Arg not supported with multiple decorators");f.extend(this.decorators,a)}else this.decorators[a]=b},unregisterDecorator:function(a){delete this.decorators[a]}};var q=l["default"].log;b.log=q,b.createFrame=f.createFrame,b.logger=l["default"]},function(a,b){"use strict";function c(a){return k[a]}function d(a){for(var b=1;b<arguments.length;b++)for(var c in arguments[b])Object.prototype.hasOwnProperty.call(arguments[b],c)&&(a[c]=arguments[b][c]);return a}function e(a,b){for(var c=0,d=a.length;d>c;c++)if(a[c]===b)return c;return-1}function f(a){if("string"!=typeof a){if(a&&a.toHTML)return a.toHTML();if(null==a)return"";if(!a)return a+"";a=""+a}return m.test(a)?a.replace(l,c):a}function g(a){return a||0===a?p(a)&&0===a.length?!0:!1:!0}function h(a){var b=d({},a);return b._parent=a,b}function i(a,b){return a.path=b,a}function j(a,b){return(a?a+".":"")+b}b.__esModule=!0,b.extend=d,b.indexOf=e,b.escapeExpression=f,b.isEmpty=g,b.createFrame=h,b.blockParams=i,b.appendContextPath=j;var k={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;","=":"&#x3D;"},l=/[&<>"'`=]/g,m=/[&<>"'`=]/,n=Object.prototype.toString;b.toString=n;var o=function(a){return"function"==typeof a};o(/x/)&&(b.isFunction=o=function(a){return"function"==typeof a&&"[object Function]"===n.call(a)}),b.isFunction=o;var p=Array.isArray||function(a){return a&&"object"==typeof a?"[object Array]"===n.call(a):!1};b.isArray=p},function(a,b){"use strict";function c(a,b){var e=b&&b.loc,f=void 0,g=void 0;e&&(f=e.start.line,g=e.start.column,a+=" - "+f+":"+g);for(var h=Error.prototype.constructor.call(this,a),i=0;i<d.length;i++)this[d[i]]=h[d[i]];Error.captureStackTrace&&Error.captureStackTrace(this,c),e&&(this.lineNumber=f,this.column=g)}b.__esModule=!0;var d=["description","fileName","lineNumber","message","name","number","stack"];c.prototype=new Error,b["default"]=c,a.exports=b["default"]},function(a,b,c){"use strict";function d(a){g["default"](a),i["default"](a),k["default"](a),m["default"](a),o["default"](a),q["default"](a),s["default"](a)}var e=c(1)["default"];b.__esModule=!0,b.registerDefaultHelpers=d;var f=c(8),g=e(f),h=c(9),i=e(h),j=c(10),k=e(j),l=c(11),m=e(l),n=c(12),o=e(n),p=c(13),q=e(p),r=c(14),s=e(r)},function(a,b,c){"use strict";b.__esModule=!0;var d=c(5);b["default"]=function(a){a.registerHelper("blockHelperMissing",function(b,c){var e=c.inverse,f=c.fn;if(b===!0)return f(this);if(b===!1||null==b)return e(this);if(d.isArray(b))return b.length>0?(c.ids&&(c.ids=[c.name]),a.helpers.each(b,c)):e(this);if(c.data&&c.ids){var g=d.createFrame(c.data);g.contextPath=d.appendContextPath(c.data.contextPath,c.name),c={data:g}}return f(b,c)})},a.exports=b["default"]},function(a,b,c){"use strict";var d=c(1)["default"];b.__esModule=!0;var e=c(5),f=c(6),g=d(f);b["default"]=function(a){a.registerHelper("each",function(a,b){function c(b,c,f){j&&(j.key=b,j.index=c,j.first=0===c,j.last=!!f,k&&(j.contextPath=k+b)),i+=d(a[b],{data:j,blockParams:e.blockParams([a[b],b],[k+b,null])})}if(!b)throw new g["default"]("Must pass iterator to #each");var d=b.fn,f=b.inverse,h=0,i="",j=void 0,k=void 0;if(b.data&&b.ids&&(k=e.appendContextPath(b.data.contextPath,b.ids[0])+"."),e.isFunction(a)&&(a=a.call(this)),b.data&&(j=e.createFrame(b.data)),a&&"object"==typeof a)if(e.isArray(a))for(var l=a.length;l>h;h++)h in a&&c(h,h,h===a.length-1);else{var m=void 0;for(var n in a)a.hasOwnProperty(n)&&(void 0!==m&&c(m,h-1),m=n,h++);void 0!==m&&c(m,h-1,!0)}return 0===h&&(i=f(this)),i})},a.exports=b["default"]},function(a,b,c){"use strict";var d=c(1)["default"];b.__esModule=!0;var e=c(6),f=d(e);b["default"]=function(a){a.registerHelper("helperMissing",function(){if(1!==arguments.length)throw new f["default"]('Missing helper: "'+arguments[arguments.length-1].name+'"')})},a.exports=b["default"]},function(a,b,c){"use strict";b.__esModule=!0;var d=c(5);b["default"]=function(a){a.registerHelper("if",function(a,b){return d.isFunction(a)&&(a=a.call(this)),!b.hash.includeZero&&!a||d.isEmpty(a)?b.inverse(this):b.fn(this)}),a.registerHelper("unless",function(b,c){return a.helpers["if"].call(this,b,{fn:c.inverse,inverse:c.fn,hash:c.hash})})},a.exports=b["default"]},function(a,b){"use strict";b.__esModule=!0,b["default"]=function(a){a.registerHelper("log",function(){for(var b=[void 0],c=arguments[arguments.length-1],d=0;d<arguments.length-1;d++)b.push(arguments[d]);var e=1;null!=c.hash.level?e=c.hash.level:c.data&&null!=c.data.level&&(e=c.data.level),b[0]=e,a.log.apply(a,b)})},a.exports=b["default"]},function(a,b){"use strict";b.__esModule=!0,b["default"]=function(a){a.registerHelper("lookup",function(a,b){return a&&a[b]})},a.exports=b["default"]},function(a,b,c){"use strict";b.__esModule=!0;var d=c(5);b["default"]=function(a){a.registerHelper("with",function(a,b){d.isFunction(a)&&(a=a.call(this));var c=b.fn;if(d.isEmpty(a))return b.inverse(this);var e=b.data;return b.data&&b.ids&&(e=d.createFrame(b.data),e.contextPath=d.appendContextPath(b.data.contextPath,b.ids[0])),c(a,{data:e,blockParams:d.blockParams([a],[e&&e.contextPath])})})},a.exports=b["default"]},function(a,b,c){"use strict";function d(a){g["default"](a)}var e=c(1)["default"];b.__esModule=!0,b.registerDefaultDecorators=d;var f=c(16),g=e(f)},function(a,b,c){"use strict";b.__esModule=!0;var d=c(5);b["default"]=function(a){a.registerDecorator("inline",function(a,b,c,e){var f=a;return b.partials||(b.partials={},f=function(e,f){var g=c.partials;c.partials=d.extend({},g,b.partials);var h=a(e,f);return c.partials=g,h}),b.partials[e.args[0]]=e.fn,f})},a.exports=b["default"]},function(a,b,c){"use strict";b.__esModule=!0;var d=c(5),e={methodMap:["debug","info","warn","error"],level:"info",lookupLevel:function(a){if("string"==typeof a){var b=d.indexOf(e.methodMap,a.toLowerCase());a=b>=0?b:parseInt(a,10)}return a},log:function(a){if(a=e.lookupLevel(a),"undefined"!=typeof console&&e.lookupLevel(e.level)<=a){var b=e.methodMap[a];console[b]||(b="log");for(var c=arguments.length,d=Array(c>1?c-1:0),f=1;c>f;f++)d[f-1]=arguments[f];console[b].apply(console,d)}}};b["default"]=e,a.exports=b["default"]},function(a,b){"use strict";function c(a){this.string=a}b.__esModule=!0,c.prototype.toString=c.prototype.toHTML=function(){return""+this.string},b["default"]=c,a.exports=b["default"]},function(a,b,c){"use strict";function d(a){var b=a&&a[0]||1,c=r.COMPILER_REVISION;if(b!==c){if(c>b){var d=r.REVISION_CHANGES[c],e=r.REVISION_CHANGES[b];throw new q["default"]("Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version ("+d+") or downgrade your runtime to an older version ("+e+").")}throw new q["default"]("Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version ("+a[1]+").")}}function e(a,b){function c(c,d,e){e.hash&&(d=o.extend({},d,e.hash),e.ids&&(e.ids[0]=!0)),c=b.VM.resolvePartial.call(this,c,d,e);var f=b.VM.invokePartial.call(this,c,d,e);if(null==f&&b.compile&&(e.partials[e.name]=b.compile(c,a.compilerOptions,b),f=e.partials[e.name](d,e)),null!=f){if(e.indent){for(var g=f.split("\n"),h=0,i=g.length;i>h&&(g[h]||h+1!==i);h++)g[h]=e.indent+g[h];f=g.join("\n")}return f}throw new q["default"]("The partial "+e.name+" could not be compiled when running in runtime-only mode")}function d(b){function c(b){return""+a.main(e,b,e.helpers,e.partials,g,i,h)}var f=arguments.length<=1||void 0===arguments[1]?{}:arguments[1],g=f.data;d._setup(f),!f.partial&&a.useData&&(g=j(b,g));var h=void 0,i=a.useBlockParams?[]:void 0;return a.useDepths&&(h=f.depths?b!==f.depths[0]?[b].concat(f.depths):f.depths:[b]),(c=k(a.main,c,e,f.depths||[],g,i))(b,f)}if(!b)throw new q["default"]("No environment passed to template");if(!a||!a.main)throw new q["default"]("Unknown template object: "+typeof a);a.main.decorator=a.main_d,b.VM.checkRevision(a.compiler);var e={strict:function(a,b){if(!(b in a))throw new q["default"]('"'+b+'" not defined in '+a);return a[b]},lookup:function(a,b){for(var c=a.length,d=0;c>d;d++)if(a[d]&&null!=a[d][b])return a[d][b]},lambda:function(a,b){return"function"==typeof a?a.call(b):a},escapeExpression:o.escapeExpression,invokePartial:c,fn:function(b){var c=a[b];return c.decorator=a[b+"_d"],c},programs:[],program:function(a,b,c,d,e){var g=this.programs[a],h=this.fn(a);return b||e||d||c?g=f(this,a,h,b,c,d,e):g||(g=this.programs[a]=f(this,a,h)),g},data:function(a,b){for(;a&&b--;)a=a._parent;return a},merge:function(a,b){var c=a||b;return a&&b&&a!==b&&(c=o.extend({},b,a)),c},noop:b.VM.noop,compilerInfo:a.compiler};return d.isTop=!0,d._setup=function(c){c.partial?(e.helpers=c.helpers,e.partials=c.partials,e.decorators=c.decorators):(e.helpers=e.merge(c.helpers,b.helpers),a.usePartial&&(e.partials=e.merge(c.partials,b.partials)),(a.usePartial||a.useDecorators)&&(e.decorators=e.merge(c.decorators,b.decorators)))},d._child=function(b,c,d,g){if(a.useBlockParams&&!d)throw new q["default"]("must pass block params");if(a.useDepths&&!g)throw new q["default"]("must pass parent depths");return f(e,b,a[b],c,0,d,g)},d}function f(a,b,c,d,e,f,g){function h(b){var e=arguments.length<=1||void 0===arguments[1]?{}:arguments[1],h=g;return g&&b!==g[0]&&(h=[b].concat(g)),c(a,b,a.helpers,a.partials,e.data||d,f&&[e.blockParams].concat(f),h)}return h=k(c,h,a,g,d,f),h.program=b,h.depth=g?g.length:0,h.blockParams=e||0,h}function g(a,b,c){return a?a.call||c.name||(c.name=a,a=c.partials[a]):a="@partial-block"===c.name?c.data["partial-block"]:c.partials[c.name],a}function h(a,b,c){c.partial=!0,c.ids&&(c.data.contextPath=c.ids[0]||c.data.contextPath);var d=void 0;if(c.fn&&c.fn!==i&&(c.data=r.createFrame(c.data),d=c.data["partial-block"]=c.fn,d.partials&&(c.partials=o.extend({},c.partials,d.partials))),void 0===a&&d&&(a=d),void 0===a)throw new q["default"]("The partial "+c.name+" could not be found");return a instanceof Function?a(b,c):void 0}function i(){return""}function j(a,b){return b&&"root"in b||(b=b?r.createFrame(b):{},b.root=a),b}function k(a,b,c,d,e,f){if(a.decorator){var g={};b=a.decorator(b,g,c,d&&d[0],e,f,d),o.extend(b,g)}return b}var l=c(3)["default"],m=c(1)["default"];b.__esModule=!0,b.checkRevision=d,b.template=e,b.wrapProgram=f,b.resolvePartial=g,b.invokePartial=h,b.noop=i;var n=c(5),o=l(n),p=c(6),q=m(p),r=c(4)},function(a,b){(function(c){"use strict";b.__esModule=!0,b["default"]=function(a){var b="undefined"!=typeof c?c:window,d=b.Handlebars;a.noConflict=function(){return b.Handlebars===a&&(b.Handlebars=d),a}},a.exports=b["default"]}).call(b,function(){return this}())},function(a,b){"use strict";b.__esModule=!0;var c={helpers:{helperExpression:function(a){return"SubExpression"===a.type||("MustacheStatement"===a.type||"BlockStatement"===a.type)&&!!(a.params&&a.params.length||a.hash)},scopedId:function(a){return/^\.|this\b/.test(a.original)},simpleId:function(a){return 1===a.parts.length&&!c.helpers.scopedId(a)&&!a.depth}}};b["default"]=c,a.exports=b["default"]},function(a,b,c){"use strict";function d(a,b){if("Program"===a.type)return a;h["default"].yy=n,n.locInfo=function(a){return new n.SourceLocation(b&&b.srcName,a)};var c=new j["default"](b);return c.accept(h["default"].parse(a))}var e=c(1)["default"],f=c(3)["default"];b.__esModule=!0,b.parse=d;var g=c(23),h=e(g),i=c(24),j=e(i),k=c(26),l=f(k),m=c(5);b.parser=h["default"];var n={};m.extend(n,l)},function(a,b){"use strict";var c=function(){function a(){this.yy={}}var b={trace:function(){},yy:{},symbols_:{error:2,root:3,program:4,EOF:5,program_repetition0:6,statement:7,mustache:8,block:9,rawBlock:10,partial:11,partialBlock:12,content:13,COMMENT:14,CONTENT:15,openRawBlock:16,rawBlock_repetition_plus0:17,END_RAW_BLOCK:18,OPEN_RAW_BLOCK:19,helperName:20,openRawBlock_repetition0:21,openRawBlock_option0:22,CLOSE_RAW_BLOCK:23,openBlock:24,block_option0:25,closeBlock:26,openInverse:27,block_option1:28,OPEN_BLOCK:29,openBlock_repetition0:30,openBlock_option0:31,openBlock_option1:32,CLOSE:33,OPEN_INVERSE:34,openInverse_repetition0:35,openInverse_option0:36,openInverse_option1:37,openInverseChain:38,OPEN_INVERSE_CHAIN:39,openInverseChain_repetition0:40,openInverseChain_option0:41,openInverseChain_option1:42,inverseAndProgram:43,INVERSE:44,inverseChain:45,inverseChain_option0:46,OPEN_ENDBLOCK:47,OPEN:48,mustache_repetition0:49,mustache_option0:50,OPEN_UNESCAPED:51,mustache_repetition1:52,mustache_option1:53,CLOSE_UNESCAPED:54,OPEN_PARTIAL:55,partialName:56,partial_repetition0:57,partial_option0:58,openPartialBlock:59,OPEN_PARTIAL_BLOCK:60,openPartialBlock_repetition0:61,openPartialBlock_option0:62,param:63,sexpr:64,OPEN_SEXPR:65,sexpr_repetition0:66,sexpr_option0:67,CLOSE_SEXPR:68,hash:69,hash_repetition_plus0:70,hashSegment:71,ID:72,EQUALS:73,blockParams:74,OPEN_BLOCK_PARAMS:75,blockParams_repetition_plus0:76,CLOSE_BLOCK_PARAMS:77,path:78,dataName:79,STRING:80,NUMBER:81,BOOLEAN:82,UNDEFINED:83,NULL:84,DATA:85,pathSegments:86,SEP:87,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",14:"COMMENT",15:"CONTENT",18:"END_RAW_BLOCK",19:"OPEN_RAW_BLOCK",23:"CLOSE_RAW_BLOCK",29:"OPEN_BLOCK",33:"CLOSE",34:"OPEN_INVERSE",39:"OPEN_INVERSE_CHAIN",44:"INVERSE",47:"OPEN_ENDBLOCK",48:"OPEN",51:"OPEN_UNESCAPED",54:"CLOSE_UNESCAPED",55:"OPEN_PARTIAL",60:"OPEN_PARTIAL_BLOCK",65:"OPEN_SEXPR",68:"CLOSE_SEXPR",72:"ID",73:"EQUALS",75:"OPEN_BLOCK_PARAMS",77:"CLOSE_BLOCK_PARAMS",80:"STRING",81:"NUMBER",82:"BOOLEAN",83:"UNDEFINED",84:"NULL",85:"DATA",87:"SEP"},productions_:[0,[3,2],[4,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[13,1],[10,3],[16,5],[9,4],[9,4],[24,6],[27,6],[38,6],[43,2],[45,3],[45,1],[26,3],[8,5],[8,5],[11,5],[12,3],[59,5],[63,1],[63,1],[64,5],[69,1],[71,3],[74,3],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[56,1],[56,1],[79,2],[78,1],[86,3],[86,1],[6,0],[6,2],[17,1],[17,2],[21,0],[21,2],[22,0],[22,1],[25,0],[25,1],[28,0],[28,1],[30,0],[30,2],[31,0],[31,1],[32,0],[32,1],[35,0],[35,2],[36,0],[36,1],[37,0],[37,1],[40,0],[40,2],[41,0],[41,1],[42,0],[42,1],[46,0],[46,1],[49,0],[49,2],[50,0],[50,1],[52,0],[52,2],[53,0],[53,1],[57,0],[57,2],[58,0],[58,1],[61,0],[61,2],[62,0],[62,1],[66,0],[66,2],[67,0],[67,1],[70,1],[70,2],[76,1],[76,2]],performAction:function(a,b,c,d,e,f,g){var h=f.length-1;switch(e){case 1:return f[h-1];case 2:this.$=d.prepareProgram(f[h]);break;case 3:this.$=f[h];break;case 4:this.$=f[h];break;case 5:this.$=f[h];break;case 6:this.$=f[h];break;case 7:this.$=f[h];break;case 8:this.$=f[h];break;case 9:this.$={type:"CommentStatement",value:d.stripComment(f[h]),strip:d.stripFlags(f[h],f[h]),loc:d.locInfo(this._$)};break;case 10:this.$={type:"ContentStatement",original:f[h],value:f[h],loc:d.locInfo(this._$)};break;case 11:this.$=d.prepareRawBlock(f[h-2],f[h-1],f[h],this._$);break;case 12:this.$={path:f[h-3],params:f[h-2],hash:f[h-1]};break;case 13:this.$=d.prepareBlock(f[h-3],f[h-2],f[h-1],f[h],!1,this._$);break;case 14:this.$=d.prepareBlock(f[h-3],f[h-2],f[h-1],f[h],!0,this._$);break;case 15:this.$={open:f[h-5],path:f[h-4],params:f[h-3],hash:f[h-2],blockParams:f[h-1],strip:d.stripFlags(f[h-5],f[h])};break;case 16:this.$={path:f[h-4],params:f[h-3],hash:f[h-2],blockParams:f[h-1],strip:d.stripFlags(f[h-5],f[h])};break;case 17:this.$={path:f[h-4],params:f[h-3],hash:f[h-2],blockParams:f[h-1],strip:d.stripFlags(f[h-5],f[h])};break;case 18:this.$={strip:d.stripFlags(f[h-1],f[h-1]),program:f[h]};break;case 19:var i=d.prepareBlock(f[h-2],f[h-1],f[h],f[h],!1,this._$),j=d.prepareProgram([i],f[h-1].loc);j.chained=!0,this.$={strip:f[h-2].strip,program:j,chain:!0};break;case 20:this.$=f[h];break;case 21:this.$={path:f[h-1],strip:d.stripFlags(f[h-2],f[h])};break;case 22:this.$=d.prepareMustache(f[h-3],f[h-2],f[h-1],f[h-4],d.stripFlags(f[h-4],f[h]),this._$);break;case 23:this.$=d.prepareMustache(f[h-3],f[h-2],f[h-1],f[h-4],d.stripFlags(f[h-4],f[h]),this._$);break;case 24:this.$={type:"PartialStatement",name:f[h-3],params:f[h-2],hash:f[h-1],indent:"",strip:d.stripFlags(f[h-4],f[h]),loc:d.locInfo(this._$)};break;case 25:this.$=d.preparePartialBlock(f[h-2],f[h-1],f[h],this._$);break;case 26:this.$={path:f[h-3],params:f[h-2],hash:f[h-1],strip:d.stripFlags(f[h-4],f[h])};break;case 27:this.$=f[h];break;case 28:this.$=f[h];break;case 29:this.$={type:"SubExpression",path:f[h-3],params:f[h-2],hash:f[h-1],loc:d.locInfo(this._$)};break;case 30:this.$={type:"Hash",pairs:f[h],loc:d.locInfo(this._$)};break;case 31:this.$={type:"HashPair",key:d.id(f[h-2]),value:f[h],loc:d.locInfo(this._$)};break;case 32:this.$=d.id(f[h-1]);break;case 33:this.$=f[h];break;case 34:this.$=f[h];break;case 35:this.$={type:"StringLiteral",value:f[h],original:f[h],loc:d.locInfo(this._$)};break;case 36:this.$={type:"NumberLiteral",value:Number(f[h]),original:Number(f[h]),loc:d.locInfo(this._$)};break;case 37:this.$={type:"BooleanLiteral",value:"true"===f[h],original:"true"===f[h],loc:d.locInfo(this._$)};break;case 38:this.$={type:"UndefinedLiteral",original:void 0,value:void 0,loc:d.locInfo(this._$)};break;case 39:this.$={type:"NullLiteral",original:null,value:null,loc:d.locInfo(this._$)};break;case 40:this.$=f[h];break;case 41:this.$=f[h];break;case 42:this.$=d.preparePath(!0,f[h],this._$);break;case 43:this.$=d.preparePath(!1,f[h],this._$);break;case 44:f[h-2].push({part:d.id(f[h]),original:f[h],separator:f[h-1]}),this.$=f[h-2];break;case 45:this.$=[{part:d.id(f[h]),original:f[h]}];break;case 46:this.$=[];break;case 47:f[h-1].push(f[h]);break;case 48:this.$=[f[h]];break;case 49:f[h-1].push(f[h]);break;case 50:this.$=[];break;case 51:f[h-1].push(f[h]);break;case 58:this.$=[];break;case 59:f[h-1].push(f[h]);break;case 64:this.$=[];break;case 65:f[h-1].push(f[h]);break;case 70:this.$=[];break;case 71:f[h-1].push(f[h]);break;case 78:this.$=[];break;case 79:f[h-1].push(f[h]);break;case 82:this.$=[];break;case 83:f[h-1].push(f[h]);break;case 86:this.$=[];break;case 87:f[h-1].push(f[h]);break;case 90:this.$=[];break;case 91:f[h-1].push(f[h]);break;case 94:this.$=[];break;case 95:f[h-1].push(f[h]);break;case 98:this.$=[f[h]];break;case 99:f[h-1].push(f[h]);break;case 100:this.$=[f[h]];break;case 101:f[h-1].push(f[h])}},table:[{3:1,4:2,5:[2,46],6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{1:[3]},{5:[1,4]},{5:[2,2],7:5,8:6,9:7,10:8,11:9,12:10,13:11,14:[1,12],15:[1,20],16:17,19:[1,23],24:15,27:16,29:[1,21],34:[1,22],39:[2,2],44:[2,2],47:[2,2],48:[1,13],51:[1,14],55:[1,18],59:19,60:[1,24]},{1:[2,1]},{5:[2,47],14:[2,47],15:[2,47],19:[2,47],29:[2,47],34:[2,47],39:[2,47],44:[2,47],47:[2,47],48:[2,47],51:[2,47],55:[2,47],60:[2,47]},{5:[2,3],14:[2,3],15:[2,3],19:[2,3],29:[2,3],34:[2,3],39:[2,3],44:[2,3],47:[2,3],48:[2,3],51:[2,3],55:[2,3],60:[2,3]},{5:[2,4],14:[2,4],15:[2,4],19:[2,4],29:[2,4],34:[2,4],39:[2,4],44:[2,4],47:[2,4],48:[2,4],51:[2,4],55:[2,4],60:[2,4]},{5:[2,5],14:[2,5],15:[2,5],19:[2,5],29:[2,5],34:[2,5],39:[2,5],44:[2,5],47:[2,5],48:[2,5],51:[2,5],55:[2,5],60:[2,5]},{5:[2,6],14:[2,6],15:[2,6],19:[2,6],29:[2,6],34:[2,6],39:[2,6],44:[2,6],47:[2,6],48:[2,6],51:[2,6],55:[2,6],60:[2,6]},{5:[2,7],14:[2,7],15:[2,7],19:[2,7],29:[2,7],34:[2,7],39:[2,7],44:[2,7],47:[2,7],48:[2,7],51:[2,7],55:[2,7],60:[2,7]},{5:[2,8],14:[2,8],15:[2,8],19:[2,8],29:[2,8],34:[2,8],39:[2,8],44:[2,8],47:[2,8],48:[2,8],51:[2,8],55:[2,8],60:[2,8]},{5:[2,9],14:[2,9],15:[2,9],19:[2,9],29:[2,9],34:[2,9],39:[2,9],44:[2,9],47:[2,9],48:[2,9],51:[2,9],55:[2,9],60:[2,9]},{20:25,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:36,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{4:37,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],39:[2,46],44:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{4:38,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],44:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{13:40,15:[1,20],17:39},{20:42,56:41,64:43,65:[1,44],72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{4:45,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{5:[2,10],14:[2,10],15:[2,10],18:[2,10],19:[2,10],29:[2,10],34:[2,10],39:[2,10],44:[2,10],47:[2,10],48:[2,10],51:[2,10],55:[2,10],60:[2,10]},{20:46,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:47,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:48,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:42,56:49,64:43,65:[1,44],72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{33:[2,78],49:50,65:[2,78],72:[2,78],80:[2,78],81:[2,78],82:[2,78],83:[2,78],84:[2,78],85:[2,78]},{23:[2,33],33:[2,33],54:[2,33],65:[2,33],68:[2,33],72:[2,33],75:[2,33],80:[2,33],81:[2,33],82:[2,33],83:[2,33],84:[2,33],85:[2,33]},{23:[2,34],33:[2,34],54:[2,34],65:[2,34],68:[2,34],72:[2,34],75:[2,34],80:[2,34],81:[2,34],82:[2,34],83:[2,34],84:[2,34],85:[2,34]},{23:[2,35],33:[2,35],54:[2,35],65:[2,35],68:[2,35],72:[2,35],75:[2,35],80:[2,35],81:[2,35],82:[2,35],83:[2,35],84:[2,35],85:[2,35]},{23:[2,36],33:[2,36],54:[2,36],65:[2,36],68:[2,36],72:[2,36],75:[2,36],80:[2,36],81:[2,36],82:[2,36],83:[2,36],84:[2,36],85:[2,36]},{23:[2,37],33:[2,37],54:[2,37],65:[2,37],68:[2,37],72:[2,37],75:[2,37],80:[2,37],81:[2,37],82:[2,37],83:[2,37],84:[2,37],85:[2,37]},{23:[2,38],33:[2,38],54:[2,38],65:[2,38],68:[2,38],72:[2,38],75:[2,38],80:[2,38],81:[2,38],82:[2,38],83:[2,38],84:[2,38],85:[2,38]},{23:[2,39],33:[2,39],54:[2,39],65:[2,39],68:[2,39],72:[2,39],75:[2,39],80:[2,39],81:[2,39],82:[2,39],83:[2,39],84:[2,39],85:[2,39]},{23:[2,43],33:[2,43],54:[2,43],65:[2,43],68:[2,43],72:[2,43],75:[2,43],80:[2,43],81:[2,43],82:[2,43],83:[2,43],84:[2,43],85:[2,43],87:[1,51]},{72:[1,35],86:52},{23:[2,45],33:[2,45],54:[2,45],65:[2,45],68:[2,45],72:[2,45],75:[2,45],80:[2,45],81:[2,45],82:[2,45],83:[2,45],84:[2,45],85:[2,45],87:[2,45]},{52:53,54:[2,82],65:[2,82],72:[2,82],80:[2,82],81:[2,82],82:[2,82],83:[2,82],84:[2,82],85:[2,82]},{25:54,38:56,39:[1,58],43:57,44:[1,59],45:55,47:[2,54]},{28:60,43:61,44:[1,59],47:[2,56]},{13:63,15:[1,20],18:[1,62]},{15:[2,48],18:[2,48]},{33:[2,86],57:64,65:[2,86],72:[2,86],80:[2,86],81:[2,86],82:[2,86],83:[2,86],84:[2,86],85:[2,86]},{33:[2,40],65:[2,40],72:[2,40],80:[2,40],81:[2,40],82:[2,40],83:[2,40],84:[2,40],85:[2,40]},{33:[2,41],65:[2,41],72:[2,41],80:[2,41],81:[2,41],82:[2,41],83:[2,41],84:[2,41],85:[2,41]},{20:65,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{26:66,47:[1,67]},{30:68,33:[2,58],65:[2,58],72:[2,58],75:[2,58],80:[2,58],81:[2,58],82:[2,58],83:[2,58],84:[2,58],85:[2,58]},{33:[2,64],35:69,65:[2,64],72:[2,64],75:[2,64],80:[2,64],81:[2,64],82:[2,64],83:[2,64],84:[2,64],85:[2,64]},{21:70,23:[2,50],65:[2,50],72:[2,50],80:[2,50],81:[2,50],82:[2,50],83:[2,50],84:[2,50],85:[2,50]},{33:[2,90],61:71,65:[2,90],72:[2,90],80:[2,90],81:[2,90],82:[2,90],83:[2,90],84:[2,90],85:[2,90]},{20:75,33:[2,80],50:72,63:73,64:76,65:[1,44],69:74,70:77,71:78,72:[1,79],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{72:[1,80]},{23:[2,42],33:[2,42],54:[2,42],65:[2,42],68:[2,42],72:[2,42],75:[2,42],80:[2,42],81:[2,42],82:[2,42],83:[2,42],84:[2,42],85:[2,42],87:[1,51]},{20:75,53:81,54:[2,84],63:82,64:76,65:[1,44],69:83,70:77,71:78,72:[1,79],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{26:84,47:[1,67]},{47:[2,55]},{4:85,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],39:[2,46],44:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{47:[2,20]},{20:86,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{4:87,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{26:88,47:[1,67]},{47:[2,57]},{5:[2,11],14:[2,11],15:[2,11],19:[2,11],29:[2,11],34:[2,11],39:[2,11],44:[2,11],47:[2,11],48:[2,11],51:[2,11],55:[2,11],60:[2,11]},{15:[2,49],18:[2,49]},{20:75,33:[2,88],58:89,63:90,64:76,65:[1,44],69:91,70:77,71:78,72:[1,79],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{65:[2,94],66:92,68:[2,94],72:[2,94],80:[2,94],81:[2,94],82:[2,94],83:[2,94],84:[2,94],85:[2,94]},{5:[2,25],14:[2,25],15:[2,25],19:[2,25],29:[2,25],34:[2,25],39:[2,25],44:[2,25],47:[2,25],48:[2,25],51:[2,25],55:[2,25],60:[2,25]},{20:93,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:75,31:94,33:[2,60],63:95,64:76,65:[1,44],69:96,70:77,71:78,72:[1,79],75:[2,60],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:75,33:[2,66],36:97,63:98,64:76,65:[1,44],69:99,70:77,71:78,72:[1,79],75:[2,66],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:75,22:100,23:[2,52],63:101,64:76,65:[1,44],69:102,70:77,71:78,72:[1,79],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:75,33:[2,92],62:103,63:104,64:76,65:[1,44],69:105,70:77,71:78,72:[1,79],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{33:[1,106]},{33:[2,79],65:[2,79],72:[2,79],80:[2,79],81:[2,79],82:[2,79],83:[2,79],84:[2,79],85:[2,79]},{33:[2,81]},{23:[2,27],33:[2,27],54:[2,27],65:[2,27],68:[2,27],72:[2,27],75:[2,27],80:[2,27],81:[2,27],82:[2,27],83:[2,27],84:[2,27],85:[2,27]},{23:[2,28],33:[2,28],54:[2,28],65:[2,28],68:[2,28],72:[2,28],75:[2,28],80:[2,28],81:[2,28],82:[2,28],83:[2,28],84:[2,28],85:[2,28]},{23:[2,30],33:[2,30],54:[2,30],68:[2,30],71:107,72:[1,108],75:[2,30]},{23:[2,98],33:[2,98],54:[2,98],68:[2,98],72:[2,98],75:[2,98]},{23:[2,45],33:[2,45],54:[2,45],65:[2,45],68:[2,45],72:[2,45],73:[1,109],75:[2,45],80:[2,45],81:[2,45],82:[2,45],83:[2,45],84:[2,45],85:[2,45],87:[2,45]},{23:[2,44],33:[2,44],54:[2,44],65:[2,44],68:[2,44],72:[2,44],75:[2,44],80:[2,44],81:[2,44],82:[2,44],83:[2,44],84:[2,44],85:[2,44],87:[2,44]},{54:[1,110]},{54:[2,83],65:[2,83],72:[2,83],80:[2,83],81:[2,83],82:[2,83],83:[2,83],84:[2,83],85:[2,83]},{54:[2,85]},{5:[2,13],14:[2,13],15:[2,13],19:[2,13],29:[2,13],34:[2,13],39:[2,13],44:[2,13],47:[2,13],48:[2,13],51:[2,13],55:[2,13],60:[2,13]},{38:56,39:[1,58],43:57,44:[1,59],45:112,46:111,47:[2,76]},{33:[2,70],40:113,65:[2,70],72:[2,70],75:[2,70],80:[2,70],81:[2,70],82:[2,70],83:[2,70],84:[2,70],85:[2,70]},{47:[2,18]},{5:[2,14],14:[2,14],15:[2,14],19:[2,14],29:[2,14],34:[2,14],39:[2,14],44:[2,14],47:[2,14],48:[2,14],51:[2,14],55:[2,14],60:[2,14]},{33:[1,114]},{33:[2,87],65:[2,87],72:[2,87],80:[2,87],81:[2,87],82:[2,87],83:[2,87],84:[2,87],85:[2,87]},{33:[2,89]},{20:75,63:116,64:76,65:[1,44],67:115,68:[2,96],69:117,70:77,71:78,72:[1,79],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{33:[1,118]},{32:119,33:[2,62],74:120,75:[1,121]},{33:[2,59],65:[2,59],72:[2,59],75:[2,59],80:[2,59],81:[2,59],82:[2,59],83:[2,59],84:[2,59],85:[2,59]},{33:[2,61],75:[2,61]},{33:[2,68],37:122,74:123,75:[1,121]},{33:[2,65],65:[2,65],72:[2,65],75:[2,65],80:[2,65],81:[2,65],82:[2,65],83:[2,65],84:[2,65],85:[2,65]},{33:[2,67],75:[2,67]},{23:[1,124]},{23:[2,51],65:[2,51],72:[2,51],80:[2,51],81:[2,51],82:[2,51],83:[2,51],84:[2,51],85:[2,51]},{23:[2,53]},{33:[1,125]},{33:[2,91],65:[2,91],72:[2,91],80:[2,91],81:[2,91],82:[2,91],83:[2,91],84:[2,91],85:[2,91]},{33:[2,93]},{5:[2,22],14:[2,22],15:[2,22],19:[2,22],29:[2,22],34:[2,22],39:[2,22],44:[2,22],47:[2,22],48:[2,22],51:[2,22],55:[2,22],60:[2,22]},{23:[2,99],33:[2,99],54:[2,99],68:[2,99],72:[2,99],75:[2,99]},{73:[1,109]},{20:75,63:126,64:76,65:[1,44],72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{5:[2,23],14:[2,23],15:[2,23],19:[2,23],29:[2,23],34:[2,23],39:[2,23],44:[2,23],47:[2,23],48:[2,23],51:[2,23],55:[2,23],60:[2,23]},{47:[2,19]},{47:[2,77]},{20:75,33:[2,72],41:127,63:128,64:76,65:[1,44],69:129,70:77,71:78,72:[1,79],75:[2,72],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{5:[2,24],14:[2,24],15:[2,24],19:[2,24],29:[2,24],34:[2,24],39:[2,24],44:[2,24],47:[2,24],48:[2,24],51:[2,24],55:[2,24],60:[2,24]},{68:[1,130]},{65:[2,95],68:[2,95],72:[2,95],80:[2,95],81:[2,95],82:[2,95],83:[2,95],84:[2,95],85:[2,95]},{68:[2,97]},{5:[2,21],14:[2,21],15:[2,21],19:[2,21],29:[2,21],34:[2,21],39:[2,21],44:[2,21],47:[2,21],48:[2,21],51:[2,21],55:[2,21],60:[2,21]},{33:[1,131]},{33:[2,63]},{72:[1,133],76:132},{33:[1,134]},{33:[2,69]},{15:[2,12]},{14:[2,26],15:[2,26],19:[2,26],29:[2,26],34:[2,26],47:[2,26],48:[2,26],51:[2,26],55:[2,26],60:[2,26]},{23:[2,31],33:[2,31],54:[2,31],68:[2,31],72:[2,31],75:[2,31]},{33:[2,74],42:135,74:136,75:[1,121]},{33:[2,71],65:[2,71],72:[2,71],75:[2,71],80:[2,71],81:[2,71],82:[2,71],83:[2,71],84:[2,71],85:[2,71]},{33:[2,73],75:[2,73]},{23:[2,29],33:[2,29],54:[2,29],65:[2,29],68:[2,29],72:[2,29],75:[2,29],80:[2,29],81:[2,29],82:[2,29],83:[2,29],84:[2,29],85:[2,29]},{14:[2,15],15:[2,15],19:[2,15],29:[2,15],34:[2,15],39:[2,15],44:[2,15],47:[2,15],48:[2,15],51:[2,15],55:[2,15],60:[2,15]},{72:[1,138],77:[1,137]},{72:[2,100],77:[2,100]},{14:[2,16],15:[2,16],19:[2,16],29:[2,16],34:[2,16],44:[2,16],47:[2,16],
48:[2,16],51:[2,16],55:[2,16],60:[2,16]},{33:[1,139]},{33:[2,75]},{33:[2,32]},{72:[2,101],77:[2,101]},{14:[2,17],15:[2,17],19:[2,17],29:[2,17],34:[2,17],39:[2,17],44:[2,17],47:[2,17],48:[2,17],51:[2,17],55:[2,17],60:[2,17]}],defaultActions:{4:[2,1],55:[2,55],57:[2,20],61:[2,57],74:[2,81],83:[2,85],87:[2,18],91:[2,89],102:[2,53],105:[2,93],111:[2,19],112:[2,77],117:[2,97],120:[2,63],123:[2,69],124:[2,12],136:[2,75],137:[2,32]},parseError:function(a,b){throw new Error(a)},parse:function(a){function b(){var a;return a=c.lexer.lex()||1,"number"!=typeof a&&(a=c.symbols_[a]||a),a}var c=this,d=[0],e=[null],f=[],g=this.table,h="",i=0,j=0,k=0;this.lexer.setInput(a),this.lexer.yy=this.yy,this.yy.lexer=this.lexer,this.yy.parser=this,"undefined"==typeof this.lexer.yylloc&&(this.lexer.yylloc={});var l=this.lexer.yylloc;f.push(l);var m=this.lexer.options&&this.lexer.options.ranges;"function"==typeof this.yy.parseError&&(this.parseError=this.yy.parseError);for(var n,o,p,q,r,s,t,u,v,w={};;){if(p=d[d.length-1],this.defaultActions[p]?q=this.defaultActions[p]:((null===n||"undefined"==typeof n)&&(n=b()),q=g[p]&&g[p][n]),"undefined"==typeof q||!q.length||!q[0]){var x="";if(!k){v=[];for(s in g[p])this.terminals_[s]&&s>2&&v.push("'"+this.terminals_[s]+"'");x=this.lexer.showPosition?"Parse error on line "+(i+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+v.join(", ")+", got '"+(this.terminals_[n]||n)+"'":"Parse error on line "+(i+1)+": Unexpected "+(1==n?"end of input":"'"+(this.terminals_[n]||n)+"'"),this.parseError(x,{text:this.lexer.match,token:this.terminals_[n]||n,line:this.lexer.yylineno,loc:l,expected:v})}}if(q[0]instanceof Array&&q.length>1)throw new Error("Parse Error: multiple actions possible at state: "+p+", token: "+n);switch(q[0]){case 1:d.push(n),e.push(this.lexer.yytext),f.push(this.lexer.yylloc),d.push(q[1]),n=null,o?(n=o,o=null):(j=this.lexer.yyleng,h=this.lexer.yytext,i=this.lexer.yylineno,l=this.lexer.yylloc,k>0&&k--);break;case 2:if(t=this.productions_[q[1]][1],w.$=e[e.length-t],w._$={first_line:f[f.length-(t||1)].first_line,last_line:f[f.length-1].last_line,first_column:f[f.length-(t||1)].first_column,last_column:f[f.length-1].last_column},m&&(w._$.range=[f[f.length-(t||1)].range[0],f[f.length-1].range[1]]),r=this.performAction.call(w,h,j,i,this.yy,q[1],e,f),"undefined"!=typeof r)return r;t&&(d=d.slice(0,-1*t*2),e=e.slice(0,-1*t),f=f.slice(0,-1*t)),d.push(this.productions_[q[1]][0]),e.push(w.$),f.push(w._$),u=g[d[d.length-2]][d[d.length-1]],d.push(u);break;case 3:return!0}}return!0}},c=function(){var a={EOF:1,parseError:function(a,b){if(!this.yy.parser)throw new Error(a);this.yy.parser.parseError(a,b)},setInput:function(a){return this._input=a,this._more=this._less=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var a=this._input[0];this.yytext+=a,this.yyleng++,this.offset++,this.match+=a,this.matched+=a;var b=a.match(/(?:\r\n?|\n).*/g);return b?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),a},unput:function(a){var b=a.length,c=a.split(/(?:\r\n?|\n)/g);this._input=a+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-b-1),this.offset-=b;var d=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),c.length-1&&(this.yylineno-=c.length-1);var e=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:c?(c.length===d.length?this.yylloc.first_column:0)+d[d.length-c.length].length-c[0].length:this.yylloc.first_column-b},this.options.ranges&&(this.yylloc.range=[e[0],e[0]+this.yyleng-b]),this},more:function(){return this._more=!0,this},less:function(a){this.unput(this.match.slice(a))},pastInput:function(){var a=this.matched.substr(0,this.matched.length-this.match.length);return(a.length>20?"...":"")+a.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var a=this.match;return a.length<20&&(a+=this._input.substr(0,20-a.length)),(a.substr(0,20)+(a.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var a=this.pastInput(),b=new Array(a.length+1).join("-");return a+this.upcomingInput()+"\n"+b+"^"},next:function(){if(this.done)return this.EOF;this._input||(this.done=!0);var a,b,c,d,e;this._more||(this.yytext="",this.match="");for(var f=this._currentRules(),g=0;g<f.length&&(c=this._input.match(this.rules[f[g]]),!c||b&&!(c[0].length>b[0].length)||(b=c,d=g,this.options.flex));g++);return b?(e=b[0].match(/(?:\r\n?|\n).*/g),e&&(this.yylineno+=e.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:e?e[e.length-1].length-e[e.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+b[0].length},this.yytext+=b[0],this.match+=b[0],this.matches=b,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._input=this._input.slice(b[0].length),this.matched+=b[0],a=this.performAction.call(this,this.yy,this,f[d],this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),a?a:void 0):""===this._input?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var a=this.next();return"undefined"!=typeof a?a:this.lex()},begin:function(a){this.conditionStack.push(a)},popState:function(){return this.conditionStack.pop()},_currentRules:function(){return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules},topState:function(){return this.conditionStack[this.conditionStack.length-2]},pushState:function(a){this.begin(a)}};return a.options={},a.performAction=function(a,b,c,d){function e(a,c){return b.yytext=b.yytext.substr(a,b.yyleng-c)}switch(c){case 0:if("\\\\"===b.yytext.slice(-2)?(e(0,1),this.begin("mu")):"\\"===b.yytext.slice(-1)?(e(0,1),this.begin("emu")):this.begin("mu"),b.yytext)return 15;break;case 1:return 15;case 2:return this.popState(),15;case 3:return this.begin("raw"),15;case 4:return this.popState(),"raw"===this.conditionStack[this.conditionStack.length-1]?15:(b.yytext=b.yytext.substr(5,b.yyleng-9),"END_RAW_BLOCK");case 5:return 15;case 6:return this.popState(),14;case 7:return 65;case 8:return 68;case 9:return 19;case 10:return this.popState(),this.begin("raw"),23;case 11:return 55;case 12:return 60;case 13:return 29;case 14:return 47;case 15:return this.popState(),44;case 16:return this.popState(),44;case 17:return 34;case 18:return 39;case 19:return 51;case 20:return 48;case 21:this.unput(b.yytext),this.popState(),this.begin("com");break;case 22:return this.popState(),14;case 23:return 48;case 24:return 73;case 25:return 72;case 26:return 72;case 27:return 87;case 28:break;case 29:return this.popState(),54;case 30:return this.popState(),33;case 31:return b.yytext=e(1,2).replace(/\\"/g,'"'),80;case 32:return b.yytext=e(1,2).replace(/\\'/g,"'"),80;case 33:return 85;case 34:return 82;case 35:return 82;case 36:return 83;case 37:return 84;case 38:return 81;case 39:return 75;case 40:return 77;case 41:return 72;case 42:return b.yytext=b.yytext.replace(/\\([\\\]])/g,"$1"),72;case 43:return"INVALID";case 44:return 5}},a.rules=[/^(?:[^\x00]*?(?=(\{\{)))/,/^(?:[^\x00]+)/,/^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/,/^(?:\{\{\{\{(?=[^\/]))/,/^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/,/^(?:[^\x00]*?(?=(\{\{\{\{)))/,/^(?:[\s\S]*?--(~)?\}\})/,/^(?:\()/,/^(?:\))/,/^(?:\{\{\{\{)/,/^(?:\}\}\}\})/,/^(?:\{\{(~)?>)/,/^(?:\{\{(~)?#>)/,/^(?:\{\{(~)?#\*?)/,/^(?:\{\{(~)?\/)/,/^(?:\{\{(~)?\^\s*(~)?\}\})/,/^(?:\{\{(~)?\s*else\s*(~)?\}\})/,/^(?:\{\{(~)?\^)/,/^(?:\{\{(~)?\s*else\b)/,/^(?:\{\{(~)?\{)/,/^(?:\{\{(~)?&)/,/^(?:\{\{(~)?!--)/,/^(?:\{\{(~)?![\s\S]*?\}\})/,/^(?:\{\{(~)?\*?)/,/^(?:=)/,/^(?:\.\.)/,/^(?:\.(?=([=~}\s\/.)|])))/,/^(?:[\/.])/,/^(?:\s+)/,/^(?:\}(~)?\}\})/,/^(?:(~)?\}\})/,/^(?:"(\\["]|[^"])*")/,/^(?:'(\\[']|[^'])*')/,/^(?:@)/,/^(?:true(?=([~}\s)])))/,/^(?:false(?=([~}\s)])))/,/^(?:undefined(?=([~}\s)])))/,/^(?:null(?=([~}\s)])))/,/^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)])))/,/^(?:as\s+\|)/,/^(?:\|)/,/^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)|]))))/,/^(?:\[(\\\]|[^\]])*\])/,/^(?:.)/,/^(?:$)/],a.conditions={mu:{rules:[7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44],inclusive:!1},emu:{rules:[2],inclusive:!1},com:{rules:[6],inclusive:!1},raw:{rules:[3,4,5],inclusive:!1},INITIAL:{rules:[0,1,44],inclusive:!0}},a}();return b.lexer=c,a.prototype=b,b.Parser=a,new a}();b.__esModule=!0,b["default"]=c},function(a,b,c){"use strict";function d(){var a=arguments.length<=0||void 0===arguments[0]?{}:arguments[0];this.options=a}function e(a,b,c){void 0===b&&(b=a.length);var d=a[b-1],e=a[b-2];return d?"ContentStatement"===d.type?(e||!c?/\r?\n\s*?$/:/(^|\r?\n)\s*?$/).test(d.original):void 0:c}function f(a,b,c){void 0===b&&(b=-1);var d=a[b+1],e=a[b+2];return d?"ContentStatement"===d.type?(e||!c?/^\s*?\r?\n/:/^\s*?(\r?\n|$)/).test(d.original):void 0:c}function g(a,b,c){var d=a[null==b?0:b+1];if(d&&"ContentStatement"===d.type&&(c||!d.rightStripped)){var e=d.value;d.value=d.value.replace(c?/^\s+/:/^[ \t]*\r?\n?/,""),d.rightStripped=d.value!==e}}function h(a,b,c){var d=a[null==b?a.length-1:b-1];if(d&&"ContentStatement"===d.type&&(c||!d.leftStripped)){var e=d.value;return d.value=d.value.replace(c?/\s+$/:/[ \t]+$/,""),d.leftStripped=d.value!==e,d.leftStripped}}var i=c(1)["default"];b.__esModule=!0;var j=c(25),k=i(j);d.prototype=new k["default"],d.prototype.Program=function(a){var b=!this.options.ignoreStandalone,c=!this.isRootSeen;this.isRootSeen=!0;for(var d=a.body,i=0,j=d.length;j>i;i++){var k=d[i],l=this.accept(k);if(l){var m=e(d,i,c),n=f(d,i,c),o=l.openStandalone&&m,p=l.closeStandalone&&n,q=l.inlineStandalone&&m&&n;l.close&&g(d,i,!0),l.open&&h(d,i,!0),b&&q&&(g(d,i),h(d,i)&&"PartialStatement"===k.type&&(k.indent=/([ \t]+$)/.exec(d[i-1].original)[1])),b&&o&&(g((k.program||k.inverse).body),h(d,i)),b&&p&&(g(d,i),h((k.inverse||k.program).body))}}return a},d.prototype.BlockStatement=d.prototype.DecoratorBlock=d.prototype.PartialBlockStatement=function(a){this.accept(a.program),this.accept(a.inverse);var b=a.program||a.inverse,c=a.program&&a.inverse,d=c,i=c;if(c&&c.chained)for(d=c.body[0].program;i.chained;)i=i.body[i.body.length-1].program;var j={open:a.openStrip.open,close:a.closeStrip.close,openStandalone:f(b.body),closeStandalone:e((d||b).body)};if(a.openStrip.close&&g(b.body,null,!0),c){var k=a.inverseStrip;k.open&&h(b.body,null,!0),k.close&&g(d.body,null,!0),a.closeStrip.open&&h(i.body,null,!0),!this.options.ignoreStandalone&&e(b.body)&&f(d.body)&&(h(b.body),g(d.body))}else a.closeStrip.open&&h(b.body,null,!0);return j},d.prototype.Decorator=d.prototype.MustacheStatement=function(a){return a.strip},d.prototype.PartialStatement=d.prototype.CommentStatement=function(a){var b=a.strip||{};return{inlineStandalone:!0,open:b.open,close:b.close}},b["default"]=d,a.exports=b["default"]},function(a,b,c){"use strict";function d(){this.parents=[]}function e(a){this.acceptRequired(a,"path"),this.acceptArray(a.params),this.acceptKey(a,"hash")}function f(a){e.call(this,a),this.acceptKey(a,"program"),this.acceptKey(a,"inverse")}function g(a){this.acceptRequired(a,"name"),this.acceptArray(a.params),this.acceptKey(a,"hash")}var h=c(1)["default"];b.__esModule=!0;var i=c(6),j=h(i);d.prototype={constructor:d,mutating:!1,acceptKey:function(a,b){var c=this.accept(a[b]);if(this.mutating){if(c&&!d.prototype[c.type])throw new j["default"]('Unexpected node type "'+c.type+'" found when accepting '+b+" on "+a.type);a[b]=c}},acceptRequired:function(a,b){if(this.acceptKey(a,b),!a[b])throw new j["default"](a.type+" requires "+b)},acceptArray:function(a){for(var b=0,c=a.length;c>b;b++)this.acceptKey(a,b),a[b]||(a.splice(b,1),b--,c--)},accept:function(a){if(a){if(!this[a.type])throw new j["default"]("Unknown type: "+a.type,a);this.current&&this.parents.unshift(this.current),this.current=a;var b=this[a.type](a);return this.current=this.parents.shift(),!this.mutating||b?b:b!==!1?a:void 0}},Program:function(a){this.acceptArray(a.body)},MustacheStatement:e,Decorator:e,BlockStatement:f,DecoratorBlock:f,PartialStatement:g,PartialBlockStatement:function(a){g.call(this,a),this.acceptKey(a,"program")},ContentStatement:function(){},CommentStatement:function(){},SubExpression:e,PathExpression:function(){},StringLiteral:function(){},NumberLiteral:function(){},BooleanLiteral:function(){},UndefinedLiteral:function(){},NullLiteral:function(){},Hash:function(a){this.acceptArray(a.pairs)},HashPair:function(a){this.acceptRequired(a,"value")}},b["default"]=d,a.exports=b["default"]},function(a,b,c){"use strict";function d(a,b){if(b=b.path?b.path.original:b,a.path.original!==b){var c={loc:a.path.loc};throw new q["default"](a.path.original+" doesn't match "+b,c)}}function e(a,b){this.source=a,this.start={line:b.first_line,column:b.first_column},this.end={line:b.last_line,column:b.last_column}}function f(a){return/^\[.*\]$/.test(a)?a.substr(1,a.length-2):a}function g(a,b){return{open:"~"===a.charAt(2),close:"~"===b.charAt(b.length-3)}}function h(a){return a.replace(/^\{\{~?\!-?-?/,"").replace(/-?-?~?\}\}$/,"")}function i(a,b,c){c=this.locInfo(c);for(var d=a?"@":"",e=[],f=0,g="",h=0,i=b.length;i>h;h++){var j=b[h].part,k=b[h].original!==j;if(d+=(b[h].separator||"")+j,k||".."!==j&&"."!==j&&"this"!==j)e.push(j);else{if(e.length>0)throw new q["default"]("Invalid path: "+d,{loc:c});".."===j&&(f++,g+="../")}}return{type:"PathExpression",data:a,depth:f,parts:e,original:d,loc:c}}function j(a,b,c,d,e,f){var g=d.charAt(3)||d.charAt(2),h="{"!==g&&"&"!==g,i=/\*/.test(d);return{type:i?"Decorator":"MustacheStatement",path:a,params:b,hash:c,escaped:h,strip:e,loc:this.locInfo(f)}}function k(a,b,c,e){d(a,c),e=this.locInfo(e);var f={type:"Program",body:b,strip:{},loc:e};return{type:"BlockStatement",path:a.path,params:a.params,hash:a.hash,program:f,openStrip:{},inverseStrip:{},closeStrip:{},loc:e}}function l(a,b,c,e,f,g){e&&e.path&&d(a,e);var h=/\*/.test(a.open);b.blockParams=a.blockParams;var i=void 0,j=void 0;if(c){if(h)throw new q["default"]("Unexpected inverse block on decorator",c);c.chain&&(c.program.body[0].closeStrip=e.strip),j=c.strip,i=c.program}return f&&(f=i,i=b,b=f),{type:h?"DecoratorBlock":"BlockStatement",path:a.path,params:a.params,hash:a.hash,program:b,inverse:i,openStrip:a.strip,inverseStrip:j,closeStrip:e&&e.strip,loc:this.locInfo(g)}}function m(a,b){if(!b&&a.length){var c=a[0].loc,d=a[a.length-1].loc;c&&d&&(b={source:c.source,start:{line:c.start.line,column:c.start.column},end:{line:d.end.line,column:d.end.column}})}return{type:"Program",body:a,strip:{},loc:b}}function n(a,b,c,e){return d(a,c),{type:"PartialBlockStatement",name:a.path,params:a.params,hash:a.hash,program:b,openStrip:a.strip,closeStrip:c&&c.strip,loc:this.locInfo(e)}}var o=c(1)["default"];b.__esModule=!0,b.SourceLocation=e,b.id=f,b.stripFlags=g,b.stripComment=h,b.preparePath=i,b.prepareMustache=j,b.prepareRawBlock=k,b.prepareBlock=l,b.prepareProgram=m,b.preparePartialBlock=n;var p=c(6),q=o(p)},function(a,b,c){"use strict";function d(){}function e(a,b,c){if(null==a||"string"!=typeof a&&"Program"!==a.type)throw new k["default"]("You must pass a string or Handlebars AST to Handlebars.precompile. You passed "+a);b=b||{},"data"in b||(b.data=!0),b.compat&&(b.useDepths=!0);var d=c.parse(a,b),e=(new c.Compiler).compile(d,b);return(new c.JavaScriptCompiler).compile(e,b)}function f(a,b,c){function d(){var d=c.parse(a,b),e=(new c.Compiler).compile(d,b),f=(new c.JavaScriptCompiler).compile(e,b,void 0,!0);return c.template(f)}function e(a,b){return f||(f=d()),f.call(this,a,b)}if(void 0===b&&(b={}),null==a||"string"!=typeof a&&"Program"!==a.type)throw new k["default"]("You must pass a string or Handlebars AST to Handlebars.compile. You passed "+a);"data"in b||(b.data=!0),b.compat&&(b.useDepths=!0);var f=void 0;return e._setup=function(a){return f||(f=d()),f._setup(a)},e._child=function(a,b,c,e){return f||(f=d()),f._child(a,b,c,e)},e}function g(a,b){if(a===b)return!0;if(l.isArray(a)&&l.isArray(b)&&a.length===b.length){for(var c=0;c<a.length;c++)if(!g(a[c],b[c]))return!1;return!0}}function h(a){if(!a.path.parts){var b=a.path;a.path={type:"PathExpression",data:!1,depth:0,parts:[b.original+""],original:b.original+"",loc:b.loc}}}var i=c(1)["default"];b.__esModule=!0,b.Compiler=d,b.precompile=e,b.compile=f;var j=c(6),k=i(j),l=c(5),m=c(21),n=i(m),o=[].slice;d.prototype={compiler:d,equals:function(a){var b=this.opcodes.length;if(a.opcodes.length!==b)return!1;for(var c=0;b>c;c++){var d=this.opcodes[c],e=a.opcodes[c];if(d.opcode!==e.opcode||!g(d.args,e.args))return!1}b=this.children.length;for(var c=0;b>c;c++)if(!this.children[c].equals(a.children[c]))return!1;return!0},guid:0,compile:function(a,b){this.sourceNode=[],this.opcodes=[],this.children=[],this.options=b,this.stringParams=b.stringParams,this.trackIds=b.trackIds,b.blockParams=b.blockParams||[];var c=b.knownHelpers;if(b.knownHelpers={helperMissing:!0,blockHelperMissing:!0,each:!0,"if":!0,unless:!0,"with":!0,log:!0,lookup:!0},c)for(var d in c)d in c&&(b.knownHelpers[d]=c[d]);return this.accept(a)},compileProgram:function(a){var b=new this.compiler,c=b.compile(a,this.options),d=this.guid++;return this.usePartial=this.usePartial||c.usePartial,this.children[d]=c,this.useDepths=this.useDepths||c.useDepths,d},accept:function(a){if(!this[a.type])throw new k["default"]("Unknown type: "+a.type,a);this.sourceNode.unshift(a);var b=this[a.type](a);return this.sourceNode.shift(),b},Program:function(a){this.options.blockParams.unshift(a.blockParams);for(var b=a.body,c=b.length,d=0;c>d;d++)this.accept(b[d]);return this.options.blockParams.shift(),this.isSimple=1===c,this.blockParams=a.blockParams?a.blockParams.length:0,this},BlockStatement:function(a){h(a);var b=a.program,c=a.inverse;b=b&&this.compileProgram(b),c=c&&this.compileProgram(c);var d=this.classifySexpr(a);"helper"===d?this.helperSexpr(a,b,c):"simple"===d?(this.simpleSexpr(a),this.opcode("pushProgram",b),this.opcode("pushProgram",c),this.opcode("emptyHash"),this.opcode("blockValue",a.path.original)):(this.ambiguousSexpr(a,b,c),this.opcode("pushProgram",b),this.opcode("pushProgram",c),this.opcode("emptyHash"),this.opcode("ambiguousBlockValue")),this.opcode("append")},DecoratorBlock:function(a){var b=a.program&&this.compileProgram(a.program),c=this.setupFullMustacheParams(a,b,void 0),d=a.path;this.useDecorators=!0,this.opcode("registerDecorator",c.length,d.original)},PartialStatement:function(a){this.usePartial=!0;var b=a.program;b&&(b=this.compileProgram(a.program));var c=a.params;if(c.length>1)throw new k["default"]("Unsupported number of partial arguments: "+c.length,a);c.length||(this.options.explicitPartialContext?this.opcode("pushLiteral","undefined"):c.push({type:"PathExpression",parts:[],depth:0}));var d=a.name.original,e="SubExpression"===a.name.type;e&&this.accept(a.name),this.setupFullMustacheParams(a,b,void 0,!0);var f=a.indent||"";this.options.preventIndent&&f&&(this.opcode("appendContent",f),f=""),this.opcode("invokePartial",e,d,f),this.opcode("append")},PartialBlockStatement:function(a){this.PartialStatement(a)},MustacheStatement:function(a){this.SubExpression(a),a.escaped&&!this.options.noEscape?this.opcode("appendEscaped"):this.opcode("append")},Decorator:function(a){this.DecoratorBlock(a)},ContentStatement:function(a){a.value&&this.opcode("appendContent",a.value)},CommentStatement:function(){},SubExpression:function(a){h(a);var b=this.classifySexpr(a);"simple"===b?this.simpleSexpr(a):"helper"===b?this.helperSexpr(a):this.ambiguousSexpr(a)},ambiguousSexpr:function(a,b,c){var d=a.path,e=d.parts[0],f=null!=b||null!=c;this.opcode("getContext",d.depth),this.opcode("pushProgram",b),this.opcode("pushProgram",c),d.strict=!0,this.accept(d),this.opcode("invokeAmbiguous",e,f)},simpleSexpr:function(a){var b=a.path;b.strict=!0,this.accept(b),this.opcode("resolvePossibleLambda")},helperSexpr:function(a,b,c){var d=this.setupFullMustacheParams(a,b,c),e=a.path,f=e.parts[0];if(this.options.knownHelpers[f])this.opcode("invokeKnownHelper",d.length,f);else{if(this.options.knownHelpersOnly)throw new k["default"]("You specified knownHelpersOnly, but used the unknown helper "+f,a);e.strict=!0,e.falsy=!0,this.accept(e),this.opcode("invokeHelper",d.length,e.original,n["default"].helpers.simpleId(e))}},PathExpression:function(a){this.addDepth(a.depth),this.opcode("getContext",a.depth);var b=a.parts[0],c=n["default"].helpers.scopedId(a),d=!a.depth&&!c&&this.blockParamIndex(b);d?this.opcode("lookupBlockParam",d,a.parts):b?a.data?(this.options.data=!0,this.opcode("lookupData",a.depth,a.parts,a.strict)):this.opcode("lookupOnContext",a.parts,a.falsy,a.strict,c):this.opcode("pushContext")},StringLiteral:function(a){this.opcode("pushString",a.value)},NumberLiteral:function(a){this.opcode("pushLiteral",a.value)},BooleanLiteral:function(a){this.opcode("pushLiteral",a.value)},UndefinedLiteral:function(){this.opcode("pushLiteral","undefined")},NullLiteral:function(){this.opcode("pushLiteral","null")},Hash:function(a){var b=a.pairs,c=0,d=b.length;for(this.opcode("pushHash");d>c;c++)this.pushParam(b[c].value);for(;c--;)this.opcode("assignToHash",b[c].key);this.opcode("popHash")},opcode:function(a){this.opcodes.push({opcode:a,args:o.call(arguments,1),loc:this.sourceNode[0].loc})},addDepth:function(a){a&&(this.useDepths=!0)},classifySexpr:function(a){var b=n["default"].helpers.simpleId(a.path),c=b&&!!this.blockParamIndex(a.path.parts[0]),d=!c&&n["default"].helpers.helperExpression(a),e=!c&&(d||b);if(e&&!d){var f=a.path.parts[0],g=this.options;g.knownHelpers[f]?d=!0:g.knownHelpersOnly&&(e=!1)}return d?"helper":e?"ambiguous":"simple"},pushParams:function(a){for(var b=0,c=a.length;c>b;b++)this.pushParam(a[b])},pushParam:function(a){var b=null!=a.value?a.value:a.original||"";if(this.stringParams)b.replace&&(b=b.replace(/^(\.?\.\/)*/g,"").replace(/\//g,".")),a.depth&&this.addDepth(a.depth),this.opcode("getContext",a.depth||0),this.opcode("pushStringParam",b,a.type),"SubExpression"===a.type&&this.accept(a);else{if(this.trackIds){var c=void 0;if(!a.parts||n["default"].helpers.scopedId(a)||a.depth||(c=this.blockParamIndex(a.parts[0])),c){var d=a.parts.slice(1).join(".");this.opcode("pushId","BlockParam",c,d)}else b=a.original||b,b.replace&&(b=b.replace(/^this(?:\.|$)/,"").replace(/^\.\//,"").replace(/^\.$/,"")),this.opcode("pushId",a.type,b)}this.accept(a)}},setupFullMustacheParams:function(a,b,c,d){var e=a.params;return this.pushParams(e),this.opcode("pushProgram",b),this.opcode("pushProgram",c),a.hash?this.accept(a.hash):this.opcode("emptyHash",d),e},blockParamIndex:function(a){for(var b=0,c=this.options.blockParams.length;c>b;b++){var d=this.options.blockParams[b],e=d&&l.indexOf(d,a);if(d&&e>=0)return[b,e]}}}},function(a,b,c){"use strict";function d(a){this.value=a}function e(){}function f(a,b,c,d){var e=b.popStack(),f=0,g=c.length;for(a&&g--;g>f;f++)e=b.nameLookup(e,c[f],d);return a?[b.aliasable("container.strict"),"(",e,", ",b.quotedString(c[f]),")"]:e}var g=c(1)["default"];b.__esModule=!0;var h=c(4),i=c(6),j=g(i),k=c(5),l=c(29),m=g(l);e.prototype={nameLookup:function(a,b){return e.isValidJavaScriptVariableName(b)?[a,".",b]:[a,"[",JSON.stringify(b),"]"]},depthedLookup:function(a){return[this.aliasable("container.lookup"),'(depths, "',a,'")']},compilerInfo:function(){var a=h.COMPILER_REVISION,b=h.REVISION_CHANGES[a];return[a,b]},appendToBuffer:function(a,b,c){return k.isArray(a)||(a=[a]),a=this.source.wrap(a,b),this.environment.isSimple?["return ",a,";"]:c?["buffer += ",a,";"]:(a.appendToBuffer=!0,a)},initializeBuffer:function(){return this.quotedString("")},compile:function(a,b,c,d){this.environment=a,this.options=b,this.stringParams=this.options.stringParams,this.trackIds=this.options.trackIds,this.precompile=!d,this.name=this.environment.name,this.isChild=!!c,this.context=c||{decorators:[],programs:[],environments:[]},this.preamble(),this.stackSlot=0,this.stackVars=[],this.aliases={},this.registers={list:[]},this.hashes=[],this.compileStack=[],this.inlineStack=[],this.blockParams=[],this.compileChildren(a,b),this.useDepths=this.useDepths||a.useDepths||a.useDecorators||this.options.compat,this.useBlockParams=this.useBlockParams||a.useBlockParams;var e=a.opcodes,f=void 0,g=void 0,h=void 0,i=void 0;for(h=0,i=e.length;i>h;h++)f=e[h],this.source.currentLocation=f.loc,g=g||f.loc,this[f.opcode].apply(this,f.args);if(this.source.currentLocation=g,this.pushSource(""),this.stackSlot||this.inlineStack.length||this.compileStack.length)throw new j["default"]("Compile completed with content left on stack");this.decorators.isEmpty()?this.decorators=void 0:(this.useDecorators=!0,this.decorators.prepend("var decorators = container.decorators;\n"),this.decorators.push("return fn;"),d?this.decorators=Function.apply(this,["fn","props","container","depth0","data","blockParams","depths",this.decorators.merge()]):(this.decorators.prepend("function(fn, props, container, depth0, data, blockParams, depths) {\n"),this.decorators.push("}\n"),this.decorators=this.decorators.merge()));var k=this.createFunctionContext(d);if(this.isChild)return k;var l={compiler:this.compilerInfo(),main:k};this.decorators&&(l.main_d=this.decorators,l.useDecorators=!0);var m=this.context,n=m.programs,o=m.decorators;for(h=0,i=n.length;i>h;h++)n[h]&&(l[h]=n[h],o[h]&&(l[h+"_d"]=o[h],l.useDecorators=!0));return this.environment.usePartial&&(l.usePartial=!0),this.options.data&&(l.useData=!0),this.useDepths&&(l.useDepths=!0),this.useBlockParams&&(l.useBlockParams=!0),this.options.compat&&(l.compat=!0),d?l.compilerOptions=this.options:(l.compiler=JSON.stringify(l.compiler),this.source.currentLocation={start:{line:1,column:0}},l=this.objectLiteral(l),b.srcName?(l=l.toStringWithSourceMap({file:b.destName}),l.map=l.map&&l.map.toString()):l=l.toString()),l},preamble:function(){this.lastContext=0,this.source=new m["default"](this.options.srcName),this.decorators=new m["default"](this.options.srcName)},createFunctionContext:function(a){var b="",c=this.stackVars.concat(this.registers.list);c.length>0&&(b+=", "+c.join(", "));var d=0;for(var e in this.aliases){var f=this.aliases[e];this.aliases.hasOwnProperty(e)&&f.children&&f.referenceCount>1&&(b+=", alias"+ ++d+"="+e,f.children[0]="alias"+d)}var g=["container","depth0","helpers","partials","data"];(this.useBlockParams||this.useDepths)&&g.push("blockParams"),this.useDepths&&g.push("depths");var h=this.mergeSource(b);return a?(g.push(h),Function.apply(this,g)):this.source.wrap(["function(",g.join(","),") {\n  ",h,"}"])},mergeSource:function(a){var b=this.environment.isSimple,c=!this.forceBuffer,d=void 0,e=void 0,f=void 0,g=void 0;return this.source.each(function(a){a.appendToBuffer?(f?a.prepend("  + "):f=a,g=a):(f&&(e?f.prepend("buffer += "):d=!0,g.add(";"),f=g=void 0),e=!0,b||(c=!1))}),c?f?(f.prepend("return "),g.add(";")):e||this.source.push('return "";'):(a+=", buffer = "+(d?"":this.initializeBuffer()),f?(f.prepend("return buffer + "),g.add(";")):this.source.push("return buffer;")),a&&this.source.prepend("var "+a.substring(2)+(d?"":";\n")),this.source.merge()},blockValue:function(a){var b=this.aliasable("helpers.blockHelperMissing"),c=[this.contextName(0)];this.setupHelperArgs(a,0,c);var d=this.popStack();c.splice(1,0,d),this.push(this.source.functionCall(b,"call",c))},ambiguousBlockValue:function(){var a=this.aliasable("helpers.blockHelperMissing"),b=[this.contextName(0)];this.setupHelperArgs("",0,b,!0),this.flushInline();var c=this.topStack();b.splice(1,0,c),this.pushSource(["if (!",this.lastHelper,") { ",c," = ",this.source.functionCall(a,"call",b),"}"])},appendContent:function(a){this.pendingContent?a=this.pendingContent+a:this.pendingLocation=this.source.currentLocation,this.pendingContent=a},append:function(){if(this.isInline())this.replaceStack(function(a){return[" != null ? ",a,' : ""']}),this.pushSource(this.appendToBuffer(this.popStack()));else{var a=this.popStack();this.pushSource(["if (",a," != null) { ",this.appendToBuffer(a,void 0,!0)," }"]),this.environment.isSimple&&this.pushSource(["else { ",this.appendToBuffer("''",void 0,!0)," }"])}},appendEscaped:function(){this.pushSource(this.appendToBuffer([this.aliasable("container.escapeExpression"),"(",this.popStack(),")"]))},getContext:function(a){this.lastContext=a},pushContext:function(){this.pushStackLiteral(this.contextName(this.lastContext))},lookupOnContext:function(a,b,c,d){var e=0;d||!this.options.compat||this.lastContext?this.pushContext():this.push(this.depthedLookup(a[e++])),this.resolvePath("context",a,e,b,c)},lookupBlockParam:function(a,b){this.useBlockParams=!0,this.push(["blockParams[",a[0],"][",a[1],"]"]),this.resolvePath("context",b,1)},lookupData:function(a,b,c){a?this.pushStackLiteral("container.data(data, "+a+")"):this.pushStackLiteral("data"),this.resolvePath("data",b,0,!0,c)},resolvePath:function(a,b,c,d,e){var g=this;if(this.options.strict||this.options.assumeObjects)return void this.push(f(this.options.strict&&e,this,b,a));for(var h=b.length;h>c;c++)this.replaceStack(function(e){var f=g.nameLookup(e,b[c],a);return d?[" && ",f]:[" != null ? ",f," : ",e]})},resolvePossibleLambda:function(){this.push([this.aliasable("container.lambda"),"(",this.popStack(),", ",this.contextName(0),")"])},pushStringParam:function(a,b){this.pushContext(),this.pushString(b),"SubExpression"!==b&&("string"==typeof a?this.pushString(a):this.pushStackLiteral(a))},emptyHash:function(a){this.trackIds&&this.push("{}"),this.stringParams&&(this.push("{}"),this.push("{}")),this.pushStackLiteral(a?"undefined":"{}")},pushHash:function(){this.hash&&this.hashes.push(this.hash),this.hash={values:[],types:[],contexts:[],ids:[]}},popHash:function(){var a=this.hash;this.hash=this.hashes.pop(),this.trackIds&&this.push(this.objectLiteral(a.ids)),this.stringParams&&(this.push(this.objectLiteral(a.contexts)),this.push(this.objectLiteral(a.types))),this.push(this.objectLiteral(a.values))},pushString:function(a){this.pushStackLiteral(this.quotedString(a))},pushLiteral:function(a){this.pushStackLiteral(a)},pushProgram:function(a){null!=a?this.pushStackLiteral(this.programExpression(a)):this.pushStackLiteral(null)},registerDecorator:function(a,b){var c=this.nameLookup("decorators",b,"decorator"),d=this.setupHelperArgs(b,a);this.decorators.push(["fn = ",this.decorators.functionCall(c,"",["fn","props","container",d])," || fn;"])},invokeHelper:function(a,b,c){var d=this.popStack(),e=this.setupHelper(a,b),f=c?[e.name," || "]:"",g=["("].concat(f,d);this.options.strict||g.push(" || ",this.aliasable("helpers.helperMissing")),g.push(")"),this.push(this.source.functionCall(g,"call",e.callParams))},invokeKnownHelper:function(a,b){var c=this.setupHelper(a,b);this.push(this.source.functionCall(c.name,"call",c.callParams))},invokeAmbiguous:function(a,b){this.useRegister("helper");var c=this.popStack();this.emptyHash();var d=this.setupHelper(0,a,b),e=this.lastHelper=this.nameLookup("helpers",a,"helper"),f=["(","(helper = ",e," || ",c,")"];this.options.strict||(f[0]="(helper = ",f.push(" != null ? helper : ",this.aliasable("helpers.helperMissing"))),this.push(["(",f,d.paramsInit?["),(",d.paramsInit]:[],"),","(typeof helper === ",this.aliasable('"function"')," ? ",this.source.functionCall("helper","call",d.callParams)," : helper))"])},invokePartial:function(a,b,c){var d=[],e=this.setupParams(b,1,d);a&&(b=this.popStack(),delete e.name),c&&(e.indent=JSON.stringify(c)),e.helpers="helpers",e.partials="partials",e.decorators="container.decorators",a?d.unshift(b):d.unshift(this.nameLookup("partials",b,"partial")),this.options.compat&&(e.depths="depths"),e=this.objectLiteral(e),
d.push(e),this.push(this.source.functionCall("container.invokePartial","",d))},assignToHash:function(a){var b=this.popStack(),c=void 0,d=void 0,e=void 0;this.trackIds&&(e=this.popStack()),this.stringParams&&(d=this.popStack(),c=this.popStack());var f=this.hash;c&&(f.contexts[a]=c),d&&(f.types[a]=d),e&&(f.ids[a]=e),f.values[a]=b},pushId:function(a,b,c){"BlockParam"===a?this.pushStackLiteral("blockParams["+b[0]+"].path["+b[1]+"]"+(c?" + "+JSON.stringify("."+c):"")):"PathExpression"===a?this.pushString(b):"SubExpression"===a?this.pushStackLiteral("true"):this.pushStackLiteral("null")},compiler:e,compileChildren:function(a,b){for(var c=a.children,d=void 0,e=void 0,f=0,g=c.length;g>f;f++){d=c[f],e=new this.compiler;var h=this.matchExistingProgram(d);null==h?(this.context.programs.push(""),h=this.context.programs.length,d.index=h,d.name="program"+h,this.context.programs[h]=e.compile(d,b,this.context,!this.precompile),this.context.decorators[h]=e.decorators,this.context.environments[h]=d,this.useDepths=this.useDepths||e.useDepths,this.useBlockParams=this.useBlockParams||e.useBlockParams):(d.index=h,d.name="program"+h,this.useDepths=this.useDepths||d.useDepths,this.useBlockParams=this.useBlockParams||d.useBlockParams)}},matchExistingProgram:function(a){for(var b=0,c=this.context.environments.length;c>b;b++){var d=this.context.environments[b];if(d&&d.equals(a))return b}},programExpression:function(a){var b=this.environment.children[a],c=[b.index,"data",b.blockParams];return(this.useBlockParams||this.useDepths)&&c.push("blockParams"),this.useDepths&&c.push("depths"),"container.program("+c.join(", ")+")"},useRegister:function(a){this.registers[a]||(this.registers[a]=!0,this.registers.list.push(a))},push:function(a){return a instanceof d||(a=this.source.wrap(a)),this.inlineStack.push(a),a},pushStackLiteral:function(a){this.push(new d(a))},pushSource:function(a){this.pendingContent&&(this.source.push(this.appendToBuffer(this.source.quotedString(this.pendingContent),this.pendingLocation)),this.pendingContent=void 0),a&&this.source.push(a)},replaceStack:function(a){var b=["("],c=void 0,e=void 0,f=void 0;if(!this.isInline())throw new j["default"]("replaceStack on non-inline");var g=this.popStack(!0);if(g instanceof d)c=[g.value],b=["(",c],f=!0;else{e=!0;var h=this.incrStack();b=["((",this.push(h)," = ",g,")"],c=this.topStack()}var i=a.call(this,c);f||this.popStack(),e&&this.stackSlot--,this.push(b.concat(i,")"))},incrStack:function(){return this.stackSlot++,this.stackSlot>this.stackVars.length&&this.stackVars.push("stack"+this.stackSlot),this.topStackName()},topStackName:function(){return"stack"+this.stackSlot},flushInline:function(){var a=this.inlineStack;this.inlineStack=[];for(var b=0,c=a.length;c>b;b++){var e=a[b];if(e instanceof d)this.compileStack.push(e);else{var f=this.incrStack();this.pushSource([f," = ",e,";"]),this.compileStack.push(f)}}},isInline:function(){return this.inlineStack.length},popStack:function(a){var b=this.isInline(),c=(b?this.inlineStack:this.compileStack).pop();if(!a&&c instanceof d)return c.value;if(!b){if(!this.stackSlot)throw new j["default"]("Invalid stack pop");this.stackSlot--}return c},topStack:function(){var a=this.isInline()?this.inlineStack:this.compileStack,b=a[a.length-1];return b instanceof d?b.value:b},contextName:function(a){return this.useDepths&&a?"depths["+a+"]":"depth"+a},quotedString:function(a){return this.source.quotedString(a)},objectLiteral:function(a){return this.source.objectLiteral(a)},aliasable:function(a){var b=this.aliases[a];return b?(b.referenceCount++,b):(b=this.aliases[a]=this.source.wrap(a),b.aliasable=!0,b.referenceCount=1,b)},setupHelper:function(a,b,c){var d=[],e=this.setupHelperArgs(b,a,d,c),f=this.nameLookup("helpers",b,"helper"),g=this.aliasable(this.contextName(0)+" != null ? "+this.contextName(0)+" : {}");return{params:d,paramsInit:e,name:f,callParams:[g].concat(d)}},setupParams:function(a,b,c){var d={},e=[],f=[],g=[],h=!c,i=void 0;h&&(c=[]),d.name=this.quotedString(a),d.hash=this.popStack(),this.trackIds&&(d.hashIds=this.popStack()),this.stringParams&&(d.hashTypes=this.popStack(),d.hashContexts=this.popStack());var j=this.popStack(),k=this.popStack();(k||j)&&(d.fn=k||"container.noop",d.inverse=j||"container.noop");for(var l=b;l--;)i=this.popStack(),c[l]=i,this.trackIds&&(g[l]=this.popStack()),this.stringParams&&(f[l]=this.popStack(),e[l]=this.popStack());return h&&(d.args=this.source.generateArray(c)),this.trackIds&&(d.ids=this.source.generateArray(g)),this.stringParams&&(d.types=this.source.generateArray(f),d.contexts=this.source.generateArray(e)),this.options.data&&(d.data="data"),this.useBlockParams&&(d.blockParams="blockParams"),d},setupHelperArgs:function(a,b,c,d){var e=this.setupParams(a,b,c);return e=this.objectLiteral(e),d?(this.useRegister("options"),c.push("options"),["options=",e]):c?(c.push(e),""):e}},function(){for(var a="break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public let yield await null true false".split(" "),b=e.RESERVED_WORDS={},c=0,d=a.length;d>c;c++)b[a[c]]=!0}(),e.isValidJavaScriptVariableName=function(a){return!e.RESERVED_WORDS[a]&&/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(a)},b["default"]=e,a.exports=b["default"]},function(a,b,c){"use strict";function d(a,b,c){if(f.isArray(a)){for(var d=[],e=0,g=a.length;g>e;e++)d.push(b.wrap(a[e],c));return d}return"boolean"==typeof a||"number"==typeof a?a+"":a}function e(a){this.srcFile=a,this.source=[]}b.__esModule=!0;var f=c(5),g=void 0;try{}catch(h){}g||(g=function(a,b,c,d){this.src="",d&&this.add(d)},g.prototype={add:function(a){f.isArray(a)&&(a=a.join("")),this.src+=a},prepend:function(a){f.isArray(a)&&(a=a.join("")),this.src=a+this.src},toStringWithSourceMap:function(){return{code:this.toString()}},toString:function(){return this.src}}),e.prototype={isEmpty:function(){return!this.source.length},prepend:function(a,b){this.source.unshift(this.wrap(a,b))},push:function(a,b){this.source.push(this.wrap(a,b))},merge:function(){var a=this.empty();return this.each(function(b){a.add(["  ",b,"\n"])}),a},each:function(a){for(var b=0,c=this.source.length;c>b;b++)a(this.source[b])},empty:function(){var a=this.currentLocation||{start:{}};return new g(a.start.line,a.start.column,this.srcFile)},wrap:function(a){var b=arguments.length<=1||void 0===arguments[1]?this.currentLocation||{start:{}}:arguments[1];return a instanceof g?a:(a=d(a,this,b),new g(b.start.line,b.start.column,this.srcFile,a))},functionCall:function(a,b,c){return c=this.generateList(c),this.wrap([a,b?"."+b+"(":"(",c,")"])},quotedString:function(a){return'"'+(a+"").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029")+'"'},objectLiteral:function(a){var b=[];for(var c in a)if(a.hasOwnProperty(c)){var e=d(a[c],this);"undefined"!==e&&b.push([this.quotedString(c),":",e])}var f=this.generateList(b);return f.prepend("{"),f.add("}"),f},generateList:function(a){for(var b=this.empty(),c=0,e=a.length;e>c;c++)c&&b.add(","),b.add(d(a[c],this));return b},generateArray:function(a){var b=this.generateList(a);return b.prepend("["),b.add("]"),b}},b["default"]=e,a.exports=b["default"]}])});
},{}],83:[function(require,module,exports){
/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Native method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Creates a function that invokes `func` with the `this` binding of the
 * created function and arguments from `start` and beyond provided as an array.
 *
 * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters).
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 * @example
 *
 * var say = _.restParam(function(what, names) {
 *   return what + ' ' + _.initial(names).join(', ') +
 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
 * });
 *
 * say('hello', 'fred', 'barney', 'pebbles');
 * // => 'hello fred, barney, & pebbles'
 */
function restParam(func, start) {
  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        rest = Array(length);

    while (++index < length) {
      rest[index] = args[start + index];
    }
    switch (start) {
      case 0: return func.call(this, rest);
      case 1: return func.call(this, args[0], rest);
      case 2: return func.call(this, args[0], args[1], rest);
    }
    var otherArgs = Array(start + 1);
    index = -1;
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = rest;
    return func.apply(this, otherArgs);
  };
}

module.exports = restParam;

},{}],84:[function(require,module,exports){
(function (global){
var cachePush = require('./cachePush'),
    getNative = require('./getNative');

/** Native method references. */
var Set = getNative(global, 'Set');

/* Native method references for those with the same name as other `lodash` methods. */
var nativeCreate = getNative(Object, 'create');

/**
 *
 * Creates a cache object to store unique values.
 *
 * @private
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var length = values ? values.length : 0;

  this.data = { 'hash': nativeCreate(null), 'set': new Set };
  while (length--) {
    this.push(values[length]);
  }
}

// Add functions to the `Set` cache.
SetCache.prototype.push = cachePush;

module.exports = SetCache;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./cachePush":105,"./getNative":110}],85:[function(require,module,exports){
/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function arrayCopy(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

module.exports = arrayCopy;

},{}],86:[function(require,module,exports){
/**
 * A specialized version of `_.forEach` for arrays without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

module.exports = arrayEach;

},{}],87:[function(require,module,exports){
/**
 * A specialized version of `_.map` for arrays without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

module.exports = arrayMap;

},{}],88:[function(require,module,exports){
/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

module.exports = arrayPush;

},{}],89:[function(require,module,exports){
var keys = require('../object/keys');

/**
 * A specialized version of `_.assign` for customizing assigned values without
 * support for argument juggling, multiple sources, and `this` binding `customizer`
 * functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {Function} customizer The function to customize assigned values.
 * @returns {Object} Returns `object`.
 */
function assignWith(object, source, customizer) {
  var index = -1,
      props = keys(source),
      length = props.length;

  while (++index < length) {
    var key = props[index],
        value = object[key],
        result = customizer(value, source[key], key, object, source);

    if ((result === result ? (result !== value) : (value === value)) ||
        (value === undefined && !(key in object))) {
      object[key] = result;
    }
  }
  return object;
}

module.exports = assignWith;

},{"../object/keys":134}],90:[function(require,module,exports){
var baseCopy = require('./baseCopy'),
    keys = require('../object/keys');

/**
 * The base implementation of `_.assign` without support for argument juggling,
 * multiple sources, and `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return source == null
    ? object
    : baseCopy(source, keys(source), object);
}

module.exports = baseAssign;

},{"../object/keys":134,"./baseCopy":92}],91:[function(require,module,exports){
var arrayCopy = require('./arrayCopy'),
    arrayEach = require('./arrayEach'),
    baseAssign = require('./baseAssign'),
    baseForOwn = require('./baseForOwn'),
    initCloneArray = require('./initCloneArray'),
    initCloneByTag = require('./initCloneByTag'),
    initCloneObject = require('./initCloneObject'),
    isArray = require('../lang/isArray'),
    isObject = require('../lang/isObject');

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[boolTag] =
cloneableTags[dateTag] = cloneableTags[float32Tag] =
cloneableTags[float64Tag] = cloneableTags[int8Tag] =
cloneableTags[int16Tag] = cloneableTags[int32Tag] =
cloneableTags[numberTag] = cloneableTags[objectTag] =
cloneableTags[regexpTag] = cloneableTags[stringTag] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[mapTag] = cloneableTags[setTag] =
cloneableTags[weakMapTag] = false;

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * The base implementation of `_.clone` without support for argument juggling
 * and `this` binding `customizer` functions.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @param {Function} [customizer] The function to customize cloning values.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The object `value` belongs to.
 * @param {Array} [stackA=[]] Tracks traversed source objects.
 * @param {Array} [stackB=[]] Associates clones with source counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, isDeep, customizer, key, object, stackA, stackB) {
  var result;
  if (customizer) {
    result = object ? customizer(value, key, object) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return arrayCopy(value, result);
    }
  } else {
    var tag = objToString.call(value),
        isFunc = tag == funcTag;

    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      result = initCloneObject(isFunc ? {} : value);
      if (!isDeep) {
        return baseAssign(result, value);
      }
    } else {
      return cloneableTags[tag]
        ? initCloneByTag(value, tag, isDeep)
        : (object ? value : {});
    }
  }
  // Check for circular references and return its corresponding clone.
  stackA || (stackA = []);
  stackB || (stackB = []);

  var length = stackA.length;
  while (length--) {
    if (stackA[length] == value) {
      return stackB[length];
    }
  }
  // Add the source value to the stack of traversed objects and associate it with its clone.
  stackA.push(value);
  stackB.push(result);

  // Recursively populate clone (susceptible to call stack limits).
  (isArr ? arrayEach : baseForOwn)(value, function(subValue, key) {
    result[key] = baseClone(subValue, isDeep, customizer, key, value, stackA, stackB);
  });
  return result;
}

module.exports = baseClone;

},{"../lang/isArray":126,"../lang/isObject":129,"./arrayCopy":85,"./arrayEach":86,"./baseAssign":90,"./baseForOwn":97,"./initCloneArray":112,"./initCloneByTag":113,"./initCloneObject":114}],92:[function(require,module,exports){
/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property names to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @returns {Object} Returns `object`.
 */
function baseCopy(source, props, object) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];
    object[key] = source[key];
  }
  return object;
}

module.exports = baseCopy;

},{}],93:[function(require,module,exports){
var baseIndexOf = require('./baseIndexOf'),
    cacheIndexOf = require('./cacheIndexOf'),
    createCache = require('./createCache');

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * The base implementation of `_.difference` which accepts a single array
 * of values to exclude.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Array} values The values to exclude.
 * @returns {Array} Returns the new array of filtered values.
 */
function baseDifference(array, values) {
  var length = array ? array.length : 0,
      result = [];

  if (!length) {
    return result;
  }
  var index = -1,
      indexOf = baseIndexOf,
      isCommon = true,
      cache = (isCommon && values.length >= LARGE_ARRAY_SIZE) ? createCache(values) : null,
      valuesLength = values.length;

  if (cache) {
    indexOf = cacheIndexOf;
    isCommon = false;
    values = cache;
  }
  outer:
  while (++index < length) {
    var value = array[index];

    if (isCommon && value === value) {
      var valuesIndex = valuesLength;
      while (valuesIndex--) {
        if (values[valuesIndex] === value) {
          continue outer;
        }
      }
      result.push(value);
    }
    else if (indexOf(values, value, 0) < 0) {
      result.push(value);
    }
  }
  return result;
}

module.exports = baseDifference;

},{"./baseIndexOf":98,"./cacheIndexOf":104,"./createCache":108}],94:[function(require,module,exports){
var arrayPush = require('./arrayPush'),
    isArguments = require('../lang/isArguments'),
    isArray = require('../lang/isArray'),
    isArrayLike = require('./isArrayLike'),
    isObjectLike = require('./isObjectLike');

/**
 * The base implementation of `_.flatten` with added support for restricting
 * flattening and specifying the start index.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {boolean} [isDeep] Specify a deep flatten.
 * @param {boolean} [isStrict] Restrict flattening to arrays-like objects.
 * @param {Array} [result=[]] The initial result value.
 * @returns {Array} Returns the new flattened array.
 */
function baseFlatten(array, isDeep, isStrict, result) {
  result || (result = []);

  var index = -1,
      length = array.length;

  while (++index < length) {
    var value = array[index];
    if (isObjectLike(value) && isArrayLike(value) &&
        (isStrict || isArray(value) || isArguments(value))) {
      if (isDeep) {
        // Recursively flatten arrays (susceptible to call stack limits).
        baseFlatten(value, isDeep, isStrict, result);
      } else {
        arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}

module.exports = baseFlatten;

},{"../lang/isArguments":125,"../lang/isArray":126,"./arrayPush":88,"./isArrayLike":115,"./isObjectLike":119}],95:[function(require,module,exports){
var createBaseFor = require('./createBaseFor');

/**
 * The base implementation of `baseForIn` and `baseForOwn` which iterates
 * over `object` properties returned by `keysFunc` invoking `iteratee` for
 * each property. Iteratee functions may exit iteration early by explicitly
 * returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

module.exports = baseFor;

},{"./createBaseFor":107}],96:[function(require,module,exports){
var baseFor = require('./baseFor'),
    keysIn = require('../object/keysIn');

/**
 * The base implementation of `_.forIn` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForIn(object, iteratee) {
  return baseFor(object, iteratee, keysIn);
}

module.exports = baseForIn;

},{"../object/keysIn":135,"./baseFor":95}],97:[function(require,module,exports){
var baseFor = require('./baseFor'),
    keys = require('../object/keys');

/**
 * The base implementation of `_.forOwn` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return baseFor(object, iteratee, keys);
}

module.exports = baseForOwn;

},{"../object/keys":134,"./baseFor":95}],98:[function(require,module,exports){
var indexOfNaN = require('./indexOfNaN');

/**
 * The base implementation of `_.indexOf` without support for binary searches.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  if (value !== value) {
    return indexOfNaN(array, fromIndex);
  }
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

module.exports = baseIndexOf;

},{"./indexOfNaN":111}],99:[function(require,module,exports){
var arrayEach = require('./arrayEach'),
    baseMergeDeep = require('./baseMergeDeep'),
    isArray = require('../lang/isArray'),
    isArrayLike = require('./isArrayLike'),
    isObject = require('../lang/isObject'),
    isObjectLike = require('./isObjectLike'),
    isTypedArray = require('../lang/isTypedArray'),
    keys = require('../object/keys');

/**
 * The base implementation of `_.merge` without support for argument juggling,
 * multiple sources, and `this` binding `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Array} [stackA=[]] Tracks traversed source objects.
 * @param {Array} [stackB=[]] Associates values with source counterparts.
 * @returns {Object} Returns `object`.
 */
function baseMerge(object, source, customizer, stackA, stackB) {
  if (!isObject(object)) {
    return object;
  }
  var isSrcArr = isArrayLike(source) && (isArray(source) || isTypedArray(source)),
      props = isSrcArr ? undefined : keys(source);

  arrayEach(props || source, function(srcValue, key) {
    if (props) {
      key = srcValue;
      srcValue = source[key];
    }
    if (isObjectLike(srcValue)) {
      stackA || (stackA = []);
      stackB || (stackB = []);
      baseMergeDeep(object, source, key, baseMerge, customizer, stackA, stackB);
    }
    else {
      var value = object[key],
          result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
          isCommon = result === undefined;

      if (isCommon) {
        result = srcValue;
      }
      if ((result !== undefined || (isSrcArr && !(key in object))) &&
          (isCommon || (result === result ? (result !== value) : (value === value)))) {
        object[key] = result;
      }
    }
  });
  return object;
}

module.exports = baseMerge;

},{"../lang/isArray":126,"../lang/isObject":129,"../lang/isTypedArray":131,"../object/keys":134,"./arrayEach":86,"./baseMergeDeep":100,"./isArrayLike":115,"./isObjectLike":119}],100:[function(require,module,exports){
var arrayCopy = require('./arrayCopy'),
    isArguments = require('../lang/isArguments'),
    isArray = require('../lang/isArray'),
    isArrayLike = require('./isArrayLike'),
    isPlainObject = require('../lang/isPlainObject'),
    isTypedArray = require('../lang/isTypedArray'),
    toPlainObject = require('../lang/toPlainObject');

/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Array} [stackA=[]] Tracks traversed source objects.
 * @param {Array} [stackB=[]] Associates values with source counterparts.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseMergeDeep(object, source, key, mergeFunc, customizer, stackA, stackB) {
  var length = stackA.length,
      srcValue = source[key];

  while (length--) {
    if (stackA[length] == srcValue) {
      object[key] = stackB[length];
      return;
    }
  }
  var value = object[key],
      result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
      isCommon = result === undefined;

  if (isCommon) {
    result = srcValue;
    if (isArrayLike(srcValue) && (isArray(srcValue) || isTypedArray(srcValue))) {
      result = isArray(value)
        ? value
        : (isArrayLike(value) ? arrayCopy(value) : []);
    }
    else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      result = isArguments(value)
        ? toPlainObject(value)
        : (isPlainObject(value) ? value : {});
    }
    else {
      isCommon = false;
    }
  }
  // Add the source value to the stack of traversed objects and associate
  // it with its merged value.
  stackA.push(srcValue);
  stackB.push(result);

  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    object[key] = mergeFunc(result, srcValue, customizer, stackA, stackB);
  } else if (result === result ? (result !== value) : (value === value)) {
    object[key] = result;
  }
}

module.exports = baseMergeDeep;

},{"../lang/isArguments":125,"../lang/isArray":126,"../lang/isPlainObject":130,"../lang/isTypedArray":131,"../lang/toPlainObject":132,"./arrayCopy":85,"./isArrayLike":115}],101:[function(require,module,exports){
/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

module.exports = baseProperty;

},{}],102:[function(require,module,exports){
var identity = require('../utility/identity');

/**
 * A specialized version of `baseCallback` which only supports `this` binding
 * and specifying the number of arguments to provide to `func`.
 *
 * @private
 * @param {Function} func The function to bind.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {number} [argCount] The number of arguments to provide to `func`.
 * @returns {Function} Returns the callback.
 */
function bindCallback(func, thisArg, argCount) {
  if (typeof func != 'function') {
    return identity;
  }
  if (thisArg === undefined) {
    return func;
  }
  switch (argCount) {
    case 1: return function(value) {
      return func.call(thisArg, value);
    };
    case 3: return function(value, index, collection) {
      return func.call(thisArg, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(thisArg, accumulator, value, index, collection);
    };
    case 5: return function(value, other, key, object, source) {
      return func.call(thisArg, value, other, key, object, source);
    };
  }
  return function() {
    return func.apply(thisArg, arguments);
  };
}

module.exports = bindCallback;

},{"../utility/identity":138}],103:[function(require,module,exports){
(function (global){
/** Native method references. */
var ArrayBuffer = global.ArrayBuffer,
    Uint8Array = global.Uint8Array;

/**
 * Creates a clone of the given array buffer.
 *
 * @private
 * @param {ArrayBuffer} buffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function bufferClone(buffer) {
  var result = new ArrayBuffer(buffer.byteLength),
      view = new Uint8Array(result);

  view.set(new Uint8Array(buffer));
  return result;
}

module.exports = bufferClone;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],104:[function(require,module,exports){
var isObject = require('../lang/isObject');

/**
 * Checks if `value` is in `cache` mimicking the return signature of
 * `_.indexOf` by returning `0` if the value is found, else `-1`.
 *
 * @private
 * @param {Object} cache The cache to search.
 * @param {*} value The value to search for.
 * @returns {number} Returns `0` if `value` is found, else `-1`.
 */
function cacheIndexOf(cache, value) {
  var data = cache.data,
      result = (typeof value == 'string' || isObject(value)) ? data.set.has(value) : data.hash[value];

  return result ? 0 : -1;
}

module.exports = cacheIndexOf;

},{"../lang/isObject":129}],105:[function(require,module,exports){
var isObject = require('../lang/isObject');

/**
 * Adds `value` to the cache.
 *
 * @private
 * @name push
 * @memberOf SetCache
 * @param {*} value The value to cache.
 */
function cachePush(value) {
  var data = this.data;
  if (typeof value == 'string' || isObject(value)) {
    data.set.add(value);
  } else {
    data.hash[value] = true;
  }
}

module.exports = cachePush;

},{"../lang/isObject":129}],106:[function(require,module,exports){
var bindCallback = require('./bindCallback'),
    isIterateeCall = require('./isIterateeCall'),
    restParam = require('../function/restParam');

/**
 * Creates a `_.assign`, `_.defaults`, or `_.merge` function.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return restParam(function(object, sources) {
    var index = -1,
        length = object == null ? 0 : sources.length,
        customizer = length > 2 ? sources[length - 2] : undefined,
        guard = length > 2 ? sources[2] : undefined,
        thisArg = length > 1 ? sources[length - 1] : undefined;

    if (typeof customizer == 'function') {
      customizer = bindCallback(customizer, thisArg, 5);
      length -= 2;
    } else {
      customizer = typeof thisArg == 'function' ? thisArg : undefined;
      length -= (customizer ? 1 : 0);
    }
    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, customizer);
      }
    }
    return object;
  });
}

module.exports = createAssigner;

},{"../function/restParam":83,"./bindCallback":102,"./isIterateeCall":117}],107:[function(require,module,exports){
var toObject = require('./toObject');

/**
 * Creates a base function for `_.forIn` or `_.forInRight`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var iterable = toObject(object),
        props = keysFunc(object),
        length = props.length,
        index = fromRight ? length : -1;

    while ((fromRight ? index-- : ++index < length)) {
      var key = props[index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

module.exports = createBaseFor;

},{"./toObject":123}],108:[function(require,module,exports){
(function (global){
var SetCache = require('./SetCache'),
    getNative = require('./getNative');

/** Native method references. */
var Set = getNative(global, 'Set');

/* Native method references for those with the same name as other `lodash` methods. */
var nativeCreate = getNative(Object, 'create');

/**
 * Creates a `Set` cache object to optimize linear searches of large arrays.
 *
 * @private
 * @param {Array} [values] The values to cache.
 * @returns {null|Object} Returns the new cache object if `Set` is supported, else `null`.
 */
function createCache(values) {
  return (nativeCreate && Set) ? new SetCache(values) : null;
}

module.exports = createCache;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./SetCache":84,"./getNative":110}],109:[function(require,module,exports){
var baseProperty = require('./baseProperty');

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
 * that affects Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

module.exports = getLength;

},{"./baseProperty":101}],110:[function(require,module,exports){
var isNative = require('../lang/isNative');

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

module.exports = getNative;

},{"../lang/isNative":128}],111:[function(require,module,exports){
/**
 * Gets the index at which the first occurrence of `NaN` is found in `array`.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched `NaN`, else `-1`.
 */
function indexOfNaN(array, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 0 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    var other = array[index];
    if (other !== other) {
      return index;
    }
  }
  return -1;
}

module.exports = indexOfNaN;

},{}],112:[function(require,module,exports){
/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = new array.constructor(length);

  // Add array properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

module.exports = initCloneArray;

},{}],113:[function(require,module,exports){
var bufferClone = require('./bufferClone');

/** `Object#toString` result references. */
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    stringTag = '[object String]';

var arrayBufferTag = '[object ArrayBuffer]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag:
      return bufferClone(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case float32Tag: case float64Tag:
    case int8Tag: case int16Tag: case int32Tag:
    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
      var buffer = object.buffer;
      return new Ctor(isDeep ? bufferClone(buffer) : buffer, object.byteOffset, object.length);

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      var result = new Ctor(object.source, reFlags.exec(object));
      result.lastIndex = object.lastIndex;
  }
  return result;
}

module.exports = initCloneByTag;

},{"./bufferClone":103}],114:[function(require,module,exports){
/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  var Ctor = object.constructor;
  if (!(typeof Ctor == 'function' && Ctor instanceof Ctor)) {
    Ctor = Object;
  }
  return new Ctor;
}

module.exports = initCloneObject;

},{}],115:[function(require,module,exports){
var getLength = require('./getLength'),
    isLength = require('./isLength');

/**
 * Checks if `value` is array-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value));
}

module.exports = isArrayLike;

},{"./getLength":109,"./isLength":118}],116:[function(require,module,exports){
/** Used to detect unsigned integer values. */
var reIsUint = /^\d+$/;

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

module.exports = isIndex;

},{}],117:[function(require,module,exports){
var isArrayLike = require('./isArrayLike'),
    isIndex = require('./isIndex'),
    isObject = require('../lang/isObject');

/**
 * Checks if the provided arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
      ? (isArrayLike(object) && isIndex(index, object.length))
      : (type == 'string' && index in object)) {
    var other = object[index];
    return value === value ? (value === other) : (other !== other);
  }
  return false;
}

module.exports = isIterateeCall;

},{"../lang/isObject":129,"./isArrayLike":115,"./isIndex":116}],118:[function(require,module,exports){
/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;

},{}],119:[function(require,module,exports){
/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],120:[function(require,module,exports){
var toObject = require('./toObject');

/**
 * A specialized version of `_.pick` which picks `object` properties specified
 * by `props`.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} props The property names to pick.
 * @returns {Object} Returns the new object.
 */
function pickByArray(object, props) {
  object = toObject(object);

  var index = -1,
      length = props.length,
      result = {};

  while (++index < length) {
    var key = props[index];
    if (key in object) {
      result[key] = object[key];
    }
  }
  return result;
}

module.exports = pickByArray;

},{"./toObject":123}],121:[function(require,module,exports){
var baseForIn = require('./baseForIn');

/**
 * A specialized version of `_.pick` which picks `object` properties `predicate`
 * returns truthy for.
 *
 * @private
 * @param {Object} object The source object.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Object} Returns the new object.
 */
function pickByCallback(object, predicate) {
  var result = {};
  baseForIn(object, function(value, key, object) {
    if (predicate(value, key, object)) {
      result[key] = value;
    }
  });
  return result;
}

module.exports = pickByCallback;

},{"./baseForIn":96}],122:[function(require,module,exports){
var isArguments = require('../lang/isArguments'),
    isArray = require('../lang/isArray'),
    isIndex = require('./isIndex'),
    isLength = require('./isLength'),
    keysIn = require('../object/keysIn');

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A fallback implementation of `Object.keys` which creates an array of the
 * own enumerable property names of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function shimKeys(object) {
  var props = keysIn(object),
      propsLength = props.length,
      length = propsLength && object.length;

  var allowIndexes = !!length && isLength(length) &&
    (isArray(object) || isArguments(object));

  var index = -1,
      result = [];

  while (++index < propsLength) {
    var key = props[index];
    if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
      result.push(key);
    }
  }
  return result;
}

module.exports = shimKeys;

},{"../lang/isArguments":125,"../lang/isArray":126,"../object/keysIn":135,"./isIndex":116,"./isLength":118}],123:[function(require,module,exports){
var isObject = require('../lang/isObject');

/**
 * Converts `value` to an object if it's not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Object} Returns the object.
 */
function toObject(value) {
  return isObject(value) ? value : Object(value);
}

module.exports = toObject;

},{"../lang/isObject":129}],124:[function(require,module,exports){
var baseClone = require('../internal/baseClone'),
    bindCallback = require('../internal/bindCallback');

/**
 * Creates a deep clone of `value`. If `customizer` is provided it is invoked
 * to produce the cloned values. If `customizer` returns `undefined` cloning
 * is handled by the method instead. The `customizer` is bound to `thisArg`
 * and invoked with two argument; (value [, index|key, object]).
 *
 * **Note:** This method is loosely based on the
 * [structured clone algorithm](http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm).
 * The enumerable properties of `arguments` objects and objects created by
 * constructors other than `Object` are cloned to plain `Object` objects. An
 * empty object is returned for uncloneable values such as functions, DOM nodes,
 * Maps, Sets, and WeakMaps.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to deep clone.
 * @param {Function} [customizer] The function to customize cloning values.
 * @param {*} [thisArg] The `this` binding of `customizer`.
 * @returns {*} Returns the deep cloned value.
 * @example
 *
 * var users = [
 *   { 'user': 'barney' },
 *   { 'user': 'fred' }
 * ];
 *
 * var deep = _.cloneDeep(users);
 * deep[0] === users[0];
 * // => false
 *
 * // using a customizer callback
 * var el = _.cloneDeep(document.body, function(value) {
 *   if (_.isElement(value)) {
 *     return value.cloneNode(true);
 *   }
 * });
 *
 * el === document.body
 * // => false
 * el.nodeName
 * // => BODY
 * el.childNodes.length;
 * // => 20
 */
function cloneDeep(value, customizer, thisArg) {
  return typeof customizer == 'function'
    ? baseClone(value, true, bindCallback(customizer, thisArg, 1))
    : baseClone(value, true);
}

module.exports = cloneDeep;

},{"../internal/baseClone":91,"../internal/bindCallback":102}],125:[function(require,module,exports){
var isArrayLike = require('../internal/isArrayLike'),
    isObjectLike = require('../internal/isObjectLike');

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Native method references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is classified as an `arguments` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  return isObjectLike(value) && isArrayLike(value) &&
    hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
}

module.exports = isArguments;

},{"../internal/isArrayLike":115,"../internal/isObjectLike":119}],126:[function(require,module,exports){
var getNative = require('../internal/getNative'),
    isLength = require('../internal/isLength'),
    isObjectLike = require('../internal/isObjectLike');

/** `Object#toString` result references. */
var arrayTag = '[object Array]';

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/* Native method references for those with the same name as other `lodash` methods. */
var nativeIsArray = getNative(Array, 'isArray');

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(function() { return arguments; }());
 * // => false
 */
var isArray = nativeIsArray || function(value) {
  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
};

module.exports = isArray;

},{"../internal/getNative":110,"../internal/isLength":118,"../internal/isObjectLike":119}],127:[function(require,module,exports){
var isObject = require('./isObject');

/** `Object#toString` result references. */
var funcTag = '[object Function]';

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in older versions of Chrome and Safari which return 'function' for regexes
  // and Safari 8 equivalents which return 'object' for typed array constructors.
  return isObject(value) && objToString.call(value) == funcTag;
}

module.exports = isFunction;

},{"./isObject":129}],128:[function(require,module,exports){
var isFunction = require('./isFunction'),
    isObjectLike = require('../internal/isObjectLike');

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (isFunction(value)) {
    return reIsNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && reIsHostCtor.test(value);
}

module.exports = isNative;

},{"../internal/isObjectLike":119,"./isFunction":127}],129:[function(require,module,exports){
/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = isObject;

},{}],130:[function(require,module,exports){
var baseForIn = require('../internal/baseForIn'),
    isArguments = require('./isArguments'),
    isObjectLike = require('../internal/isObjectLike');

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * **Note:** This method assumes objects created by the `Object` constructor
 * have no inherited enumerable properties.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  var Ctor;

  // Exit early for non `Object` objects.
  if (!(isObjectLike(value) && objToString.call(value) == objectTag && !isArguments(value)) ||
      (!hasOwnProperty.call(value, 'constructor') && (Ctor = value.constructor, typeof Ctor == 'function' && !(Ctor instanceof Ctor)))) {
    return false;
  }
  // IE < 9 iterates inherited properties before own properties. If the first
  // iterated property is an object's own property then there are no inherited
  // enumerable properties.
  var result;
  // In most environments an object's own properties are iterated before
  // its inherited properties. If the last iterated property is an object's
  // own property then there are no inherited enumerable properties.
  baseForIn(value, function(subValue, key) {
    result = key;
  });
  return result === undefined || hasOwnProperty.call(value, result);
}

module.exports = isPlainObject;

},{"../internal/baseForIn":96,"../internal/isObjectLike":119,"./isArguments":125}],131:[function(require,module,exports){
var isLength = require('../internal/isLength'),
    isObjectLike = require('../internal/isObjectLike');

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dateTag] = typedArrayTags[errorTag] =
typedArrayTags[funcTag] = typedArrayTags[mapTag] =
typedArrayTags[numberTag] = typedArrayTags[objectTag] =
typedArrayTags[regexpTag] = typedArrayTags[setTag] =
typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
function isTypedArray(value) {
  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
}

module.exports = isTypedArray;

},{"../internal/isLength":118,"../internal/isObjectLike":119}],132:[function(require,module,exports){
var baseCopy = require('../internal/baseCopy'),
    keysIn = require('../object/keysIn');

/**
 * Converts `value` to a plain object flattening inherited enumerable
 * properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */
function toPlainObject(value) {
  return baseCopy(value, keysIn(value));
}

module.exports = toPlainObject;

},{"../internal/baseCopy":92,"../object/keysIn":135}],133:[function(require,module,exports){
var assignWith = require('../internal/assignWith'),
    baseAssign = require('../internal/baseAssign'),
    createAssigner = require('../internal/createAssigner');

/**
 * Assigns own enumerable properties of source object(s) to the destination
 * object. Subsequent sources overwrite property assignments of previous sources.
 * If `customizer` is provided it is invoked to produce the assigned values.
 * The `customizer` is bound to `thisArg` and invoked with five arguments:
 * (objectValue, sourceValue, key, object, source).
 *
 * **Note:** This method mutates `object` and is based on
 * [`Object.assign`](http://ecma-international.org/ecma-262/6.0/#sec-object.assign).
 *
 * @static
 * @memberOf _
 * @alias extend
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {*} [thisArg] The `this` binding of `customizer`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * _.assign({ 'user': 'barney' }, { 'age': 40 }, { 'user': 'fred' });
 * // => { 'user': 'fred', 'age': 40 }
 *
 * // using a customizer callback
 * var defaults = _.partialRight(_.assign, function(value, other) {
 *   return _.isUndefined(value) ? other : value;
 * });
 *
 * defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
 * // => { 'user': 'barney', 'age': 36 }
 */
var assign = createAssigner(function(object, source, customizer) {
  return customizer
    ? assignWith(object, source, customizer)
    : baseAssign(object, source);
});

module.exports = assign;

},{"../internal/assignWith":89,"../internal/baseAssign":90,"../internal/createAssigner":106}],134:[function(require,module,exports){
var getNative = require('../internal/getNative'),
    isArrayLike = require('../internal/isArrayLike'),
    isObject = require('../lang/isObject'),
    shimKeys = require('../internal/shimKeys');

/* Native method references for those with the same name as other `lodash` methods. */
var nativeKeys = getNative(Object, 'keys');

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
var keys = !nativeKeys ? shimKeys : function(object) {
  var Ctor = object == null ? undefined : object.constructor;
  if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
      (typeof object != 'function' && isArrayLike(object))) {
    return shimKeys(object);
  }
  return isObject(object) ? nativeKeys(object) : [];
};

module.exports = keys;

},{"../internal/getNative":110,"../internal/isArrayLike":115,"../internal/shimKeys":122,"../lang/isObject":129}],135:[function(require,module,exports){
var isArguments = require('../lang/isArguments'),
    isArray = require('../lang/isArray'),
    isIndex = require('../internal/isIndex'),
    isLength = require('../internal/isLength'),
    isObject = require('../lang/isObject');

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  if (object == null) {
    return [];
  }
  if (!isObject(object)) {
    object = Object(object);
  }
  var length = object.length;
  length = (length && isLength(length) &&
    (isArray(object) || isArguments(object)) && length) || 0;

  var Ctor = object.constructor,
      index = -1,
      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
      result = Array(length),
      skipIndexes = length > 0;

  while (++index < length) {
    result[index] = (index + '');
  }
  for (var key in object) {
    if (!(skipIndexes && isIndex(key, length)) &&
        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = keysIn;

},{"../internal/isIndex":116,"../internal/isLength":118,"../lang/isArguments":125,"../lang/isArray":126,"../lang/isObject":129}],136:[function(require,module,exports){
var baseMerge = require('../internal/baseMerge'),
    createAssigner = require('../internal/createAssigner');

/**
 * Recursively merges own enumerable properties of the source object(s), that
 * don't resolve to `undefined` into the destination object. Subsequent sources
 * overwrite property assignments of previous sources. If `customizer` is
 * provided it is invoked to produce the merged values of the destination and
 * source properties. If `customizer` returns `undefined` merging is handled
 * by the method instead. The `customizer` is bound to `thisArg` and invoked
 * with five arguments: (objectValue, sourceValue, key, object, source).
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {*} [thisArg] The `this` binding of `customizer`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var users = {
 *   'data': [{ 'user': 'barney' }, { 'user': 'fred' }]
 * };
 *
 * var ages = {
 *   'data': [{ 'age': 36 }, { 'age': 40 }]
 * };
 *
 * _.merge(users, ages);
 * // => { 'data': [{ 'user': 'barney', 'age': 36 }, { 'user': 'fred', 'age': 40 }] }
 *
 * // using a customizer callback
 * var object = {
 *   'fruits': ['apple'],
 *   'vegetables': ['beet']
 * };
 *
 * var other = {
 *   'fruits': ['banana'],
 *   'vegetables': ['carrot']
 * };
 *
 * _.merge(object, other, function(a, b) {
 *   if (_.isArray(a)) {
 *     return a.concat(b);
 *   }
 * });
 * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot'] }
 */
var merge = createAssigner(baseMerge);

module.exports = merge;

},{"../internal/baseMerge":99,"../internal/createAssigner":106}],137:[function(require,module,exports){
var arrayMap = require('../internal/arrayMap'),
    baseDifference = require('../internal/baseDifference'),
    baseFlatten = require('../internal/baseFlatten'),
    bindCallback = require('../internal/bindCallback'),
    keysIn = require('./keysIn'),
    pickByArray = require('../internal/pickByArray'),
    pickByCallback = require('../internal/pickByCallback'),
    restParam = require('../function/restParam');

/**
 * The opposite of `_.pick`; this method creates an object composed of the
 * own and inherited enumerable properties of `object` that are not omitted.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The source object.
 * @param {Function|...(string|string[])} [predicate] The function invoked per
 *  iteration or property names to omit, specified as individual property
 *  names or arrays of property names.
 * @param {*} [thisArg] The `this` binding of `predicate`.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'user': 'fred', 'age': 40 };
 *
 * _.omit(object, 'age');
 * // => { 'user': 'fred' }
 *
 * _.omit(object, _.isNumber);
 * // => { 'user': 'fred' }
 */
var omit = restParam(function(object, props) {
  if (object == null) {
    return {};
  }
  if (typeof props[0] != 'function') {
    var props = arrayMap(baseFlatten(props), String);
    return pickByArray(object, baseDifference(keysIn(object), props));
  }
  var predicate = bindCallback(props[0], props[1], 3);
  return pickByCallback(object, function(value, key, object) {
    return !predicate(value, key, object);
  });
});

module.exports = omit;

},{"../function/restParam":83,"../internal/arrayMap":87,"../internal/baseDifference":93,"../internal/baseFlatten":94,"../internal/bindCallback":102,"../internal/pickByArray":120,"../internal/pickByCallback":121,"./keysIn":135}],138:[function(require,module,exports){
/**
 * This method returns the first argument provided to it.
 *
 * @static
 * @memberOf _
 * @category Utility
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'user': 'fred' };
 *
 * _.identity(object) === object;
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;

},{}],139:[function(require,module,exports){
(function (global){
/**
 *
 * Essential extension methods for Promises/A+ implementations
 */

var setImmediate = (function setImmediateImpl() {
    'use strict';

    if (setImmediate) {
        return setImmediate;
    } else if ({}.toString.call(global.process) === '[object process]') {
        return global.process.nextTick.bind(global.process);
    } else {
        return function(handler) {
            setTimeout(handler, 0);
        };
    }
}());

var convertToArray = (function() {
    'use strict';
    var toArray = Array.prototype.slice;
    return function $convertToArray(obj) {
        return obj ? toArray.call(obj) : [];
    };
})();

function createInspectionObject(resolved, valueOrReason) {
    'use strict';

    var insp = {
        isRejected: function() {
            return !resolved;
        },
        isFulfilled: function() {
            return resolved;
        }
    };
    // alias
    insp.isResolved = insp.isFulfilled;

    if (resolved) {
        Object.defineProperty(insp, 'value', {
            enumerable: true,
            value: valueOrReason
        });
    } else {
        Object.defineProperty(insp, 'reason', {
            enumerable: true,
            value: valueOrReason
        });
    }

    return insp;
}

function applyExtensions(Promise) {
    'use strict';

    // spread method
    Promise.prototype.spread = function (fn) {
        return this.then(function (args) {
            return Promise.all(args);
        }).then(function (array) {
            return fn.apply(null, array);
        });
    };

    // delay method
    Promise.prototype.delay = function (timeout) {
        return this.then(function(args) {
            return new Promise(function (resolve) {
                setTimeout(function() {
                    resolve(args);
                }, timeout);
            });
        });
    };

    // static delay method
    Promise.delay = function (resolveValue, timeout) {
        if (timeout === undefined) {
            timeout = resolveValue;
            resolveValue = undefined;
        }
        return this.resolve(resolveValue).delay(timeout);
    };

    // finally method
    Promise.prototype['finally'] = function (fn) {
        var noop = function() {};
        var fnAsPromise = new Promise(function(resolve) {
            var val;
            try {
                val = fn();
            } finally {
                resolve(val);
            }
        }).then(noop, noop);

        return this.then(function (value) {
            return fnAsPromise.then(function () {
                return value;
            });
        }, function(reason) {
            return fnAsPromise.then(function() {
                throw reason;
            });
        });
    };

    // reflect method
    Promise.prototype.reflect = function () {
        return this.then(function(value) {
            return createInspectionObject(true, value);
        }, function(reason) {

            return createInspectionObject(false, reason);
        });
    };

    // static settleAll method
    Promise.settleAll = function(array) {
        var values = Array.isArray(array) ? array : [array];
        return this.all(values.map(function(value) {
            return Promise.resolve(value).reflect();
        }));
    };

    // done method
    Promise.prototype.done = function() {
        this.catch(function (error) {
            setImmediate(function() {
                throw error;
            });
        });
    };

    return Promise;
}

function delegateToInstance(decorator, methods) {
    'use strict';

    methods.forEach(function(method) {
        decorator.prototype[method] = function () {
            var ins = this.__instance;
            var promise = ins[method].apply(ins, convertToArray(arguments));
            return decorator.resolve(promise);
        };
    });
}

function delegateToStatic(decorator, delegate, methods) {
    'use strict';

    methods.forEach(function(method) {
        decorator[method] = function () {
            var promise = delegate[method].apply(delegate, convertToArray(arguments));
            return decorator.resolve(promise);
        };
    });
}

function decorate(promiseFunc) {
    'use strict';

    var PromiseExtensions = function PromiseExtensions(executor) {
        var promise = new promiseFunc(executor);
        // protect base instance from tampering with
        Object.defineProperty(this, '__instance', {
            value: promise
        });
    };

    // resolve method doesn't delegate to original Promise. Other methods heavily rely on it.
    PromiseExtensions.resolve = function resolve(msg) {
        var Constructor = this;
        if (msg && msg.__instance && typeof msg.__instance === 'object') {
            return msg;
        }

        return new Constructor(function(resolve) {
            resolve(msg);
        });
    };

    // delegate known static methods to provided impl
    delegateToStatic(PromiseExtensions, promiseFunc, ['all', 'reject', 'race']);
    // delegate known instance methods to base instance
    delegateToInstance(PromiseExtensions, ['then', 'catch']);
    // define extension methods
    return applyExtensions(PromiseExtensions);
}

module.exports = function(promiseImpl) {
    'use strict';

    var Promise = promiseImpl || global.Promise;
    if (!Promise) {
        throw new Error('No Promise implementation found.');
    }
    if (typeof Promise !== 'function') {
        throw new TypeError('Not supported. The argument provided is not a constructor.');
    }

    return decorate(Promise);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],140:[function(require,module,exports){
/**
 * A central CXP configuration object to be used across multiple web APIs
 * @exports a new CxpConfiguration instance
 * @module configuration/index
 */

'use strict';

var cxpUtil = require('./cxp-util');
var bunyan = require('browser-bunyan');

/**
 * Constructs a new CXP Configuration object
 * @param {Object} [opts] A set of configuration options
 * @param {Object} [opts.log] Provide a completely new logger. This should be a 'browser-bunyan' logger.
 *                            Internally, a new child logger will be created, using the supplied logger as a parent
 * @param {Array} [opts.logStreams] Provide custom log streams to use with the internally generated logger.
 *                                  This will be ignored if your provide your own logger
 * @param {string} [opts.logLevel] Set the logging level. This will be ignored if you provide your own logger.
 * @constructor
 */
var CxpConfiguration = function(opts) {

    opts = opts || {};

    var loggerName = 'cxp-web';
    this.log = opts.log ? opts.log.child({ childName: loggerName}) : bunyan.createLogger({
        name: loggerName || 'logger',
        streams: Array.isArray(opts.logStreams) ? opts.logStreams : [
            {
                level: opts.logLevel || 'info',
                stream: new bunyan.ConsoleFormattedStream(),
                type: 'raw'
            }
        ]
    });

    this.settings = {};
};

/**
 * @deprecated
 */
CxpConfiguration.prototype.util = cxpUtil;

/**
 * Clones configuration object
 * @returns {CxpConfiguration} new CxpConfiguration object
 */
CxpConfiguration.prototype.clone = function() {
    var newConfig = new CxpConfiguration();
    var settings = this.settings;

    newConfig.settings = Object.keys(settings).reduce(function(obj, propName) {
        obj[propName] = settings[propName];
        return obj;
    }, {});

    return newConfig;
};

/**
 * Sets a value
 * @param {string} name
 * @param {*} value
 */
CxpConfiguration.prototype.set = function(name, value) {
    this.settings[name] = value;
};

/**
 * Gets a value
 * @param {string} name
 * @returns {*}
 */
CxpConfiguration.prototype.get = function(name) {
    return this.settings[name];
};

/**
 * Enables a boolean value
 * @param {string} name
 */
CxpConfiguration.prototype.enable = function(name) {
    this.settings[name] = true;
};

/**
 * Disables a boolean value
 * @param {string} name
 */
CxpConfiguration.prototype.disable = function(name) {
    this.settings[name] = false;
};

/**
 * Checks if a boolean value is true
 * @param {string} name
 * @returns {boolean}
 */
CxpConfiguration.prototype.enabled = function(name) {
    return !!this.settings[name];
};

/**
 * Checks if a boolean value is false
 * @param {string} name
 * @returns {boolean}
 */
CxpConfiguration.prototype.disabled = function(name) {
    return !this.settings[name];
};

/**
 * Gets a logger stored internally
 * @returns {CxpConfiguration.log}
 */
CxpConfiguration.prototype.getLogger = function() {
    return this.log;
};

/**
 * Gets the settings as a plain object. Dynamic items such as functions will be omitted
 * @returns {Object}
 */
CxpConfiguration.prototype.toSerializableObject = function() {

    var stringifyBlacklist = ['logStreams', 'storageFactory'];

    return JSON.parse(JSON.stringify(this.settings, function(key, value) {
        return stringifyBlacklist.indexOf(key) > -1 ? undefined: value;
    }));
};

function createConfiguration (cxpOptions) {
    return new CxpConfiguration(cxpOptions);
}

module.exports = {
    Configuration: CxpConfiguration,
    createInstance: createConfiguration
};

},{"./cxp-util":141,"browser-bunyan":80}],141:[function(require,module,exports){
/**
 * @deprecated Avoid using these module.
 */

'use strict';

module.exports = {

    /**
     * @deprecated Use item.preference.name instead
     */
    getPreference: function(item, name) {
        return item.preferences[name] || null;
    },

    /**
     * @deprecated Use item.preference.name.value instead
     */
    getPreferenceValue: function(item, name) {
        var pref = this.getPreference(item, name);
        return pref ? pref.value : null;
    }
};


},{}],142:[function(require,module,exports){
/**
 * Implements "breadcrumb" datasource resolver
 * @see {@link https://backbase.atlassian.net/wiki/display/PrM/Navigation+Datasources#NavigationDatasources-BreadcrumbURI
 *
 * @module datasource/contentrendered-datasource-resolver
 * @exports {BreadcrumbDatasourceResolver}
 */
'use strict';

var DatasourceResolver  = require('backbase-widget-engine/src/datasource/datasource-resolver');
var resolverHelpers     = require('backbase-widget-engine/src/datasource/datasource-resolver-helpers');

module.exports = BreadcrumbDatasourceResolver;

/**
 * Breadcrumb datasource resolver
 * @param {Object} datasource
 * @constructor
 */
function BreadcrumbDatasourceResolver(datasource) {
    this._datasource = datasource;
}

/**
 * Builds an endpoint URL of breadcrumb datasource
 * @param {Object} context An object expressions in datasource URI are resolved against
 * @returns {string} A URL of an endpoint where data can be requested from
 */
BreadcrumbDatasourceResolver.prototype.resolveUrl = function (context) {
    var url = this._datasource.uri;
    var urlComponents = url.split(':');

    if (urlComponents.length !== 2) {
        throw new Error('Invalid breadcrumb datasource uri: ', url);
    }

    var params = [].concat(this._datasource.params || []);
    var linkId = resolverHelpers.trimSlashes(urlComponents[1]);
    if (linkId) {
        params.push({
            name: 'uuid',
            value: linkId
        });
    }

    var apiRoot = context.apiRoot || '';
    var endpointUrl = apiRoot + '/portal/navigation/breadcrumb';

    var queryString = resolverHelpers.resolveQueryString(context, params);
    if (queryString) {
        endpointUrl += '?' + queryString;
    }

    return endpointUrl;
};

/**
 * Parses JSON returned from datasource and returns it
 * @param {Response} response Fetch API response object
 * @returns {Promise.<Object>} promise resolved with an object literal containing JSON data
 */
BreadcrumbDatasourceResolver.prototype.processResponse = function processResponse(response) {
    return response.json();
};

/**
 * Checks whether a datasource is of breadcrumb type and creates a resolver instance
 * if check passes. Use this method as a resolver creating function registered with
 * datasource resolver factory.
 * @param {Object} datasource A datasource to check
 * @returns {DatasourceResolver|undefined}
 */
BreadcrumbDatasourceResolver.getInstance =
    DatasourceResolver.createFactoryFunction('breadcrumb', BreadcrumbDatasourceResolver);

},{"backbase-widget-engine/src/datasource/datasource-resolver":40,"backbase-widget-engine/src/datasource/datasource-resolver-helpers":39}],143:[function(require,module,exports){
/**
 * Implements "contentrendered" datasource resolver
 * @see {@link https://backbase.atlassian.net/wiki/display/PrM/Datasources+URI+spec#DatasourcesURIspec-ContentrenderedURI(legacy-deprecated)}
 * Maps contentrendered:/[uuid]?template=[templatePath] datasource URI to
 * /cxp/portal/contenttemplates/rendered?templateUrl=[templatePath]&contextItemName=[contextItemName]&uuid=[uuid]
 * REST endpoint URI.
 *
 * @module datasource/contentrendered-datasource-resolver
 * @exports {ContentrenderedDatasourceResolver}
 */

'use strict';

var DatasourceResolver  = require('backbase-widget-engine/src/datasource/datasource-resolver');
var resolverHelpers     = require('backbase-widget-engine/src/datasource/datasource-resolver-helpers');
var util                = require('backbase-widget-engine/src/util/util');

/**
 * Optional datasource parameter that can be used to instruct the resolver to skip on setting asset URLs in content
 * to point to remote server (mobile use case only)
 * @type {string}
 */
var ASSET_PARAM = 'assets';

module.exports = ContentrenderedDatasourceResolver;

/**
 * Contentrendered datasource resolver
 *
 * @param {Object} datasource
 * @constructor
 */
function ContentrenderedDatasourceResolver(datasource) {
    this._datasource = datasource;
}

/**
 * Builds an endpoint URL of contentrendered datasource
 *
 * @param {Object} context An object expressions in datasource URI are resolved against
 * @returns {string} A URL of an endpoint where data can be requested from
 */
ContentrenderedDatasourceResolver.prototype.resolveUrl = function (context) {
    var url = this._datasource.uri;
    var urlComponents = url.split(':');

    if (urlComponents.length !== 2) {
        throw new Error('Invalid contentrendered datasource uri: ', url);
    }

    var params = (this._datasource.params || []).map(function (param) {
        var resolvedParam = resolverHelpers.resolveParameter(context, param);
        if (resolvedParam.name === 'template') {
            resolvedParam.name = 'templateUrl';
        }

        return resolvedParam;
    }).filter(function (param) {
        return param.name && param.name !== ASSET_PARAM;
    });

    var contentId = resolverHelpers.resolveExpression(context, resolverHelpers.trimSlashes(urlComponents[1]));
    if (contentId) {
        params.push({
            name: 'uuid',
            value: contentId
        });
    }

    var contextItemName = context.contextItemName;
    if(contextItemName) {
        params.push({
            name: 'contextItemName',
            value: contextItemName
        });
    }

    var apiRoot = context.apiRoot || '';
    var endpointUrl = apiRoot + '/portal/contenttemplates/rendered';

    var encodedParams = resolverHelpers.buildQueryString(params);
    if (encodedParams) {
        endpointUrl += '?' + encodedParams;
    }

    return endpointUrl;
};

/**
 * If necessary handles HTML response by converting asset (images, anchors, etc) relative URLs to absolute ones
 * in mobile environment.
 *
 * @param {Response} response Fetch API response object
 * @param {Object} context An object that holds configuration options
 * @returns {Promise.<Object>} promise resolved with HTML string
 */
ContentrenderedDatasourceResolver.prototype.processResponse = function processResponse(response, context) {
    var self = this;

    return response.text().then(function (html) {
        if(util.isRunningOnFilesystem()) {
            var contextRoot = context.contextRoot || '';
            var remoteContextRoot = context.remoteContextRoot || '';
            var assetsParam = self._datasource.params.filter(function (param) {
                    return param.name === ASSET_PARAM;
                })[0] || {};
            var localAssets = assetsParam.value === 'local';
            var baseUrl = (localAssets || !remoteContextRoot) ? contextRoot : remoteContextRoot;

            return util.isUrlAbsolute(baseUrl) ? self._makeReferenceAbsolute(html, baseUrl) : html;
        } else {
            return html;
        }
    });
};

/**
 * Makes relative URLs absolute for elements that can refer to remote content (with "src" or "href" attributes)
 *
 * @param {string} html HTML string to process
 * @param {string} baseUrl Base URL to be used in relative URL resolution
 * @returns {string} HTML with absolute URLs
 * @private
 */
ContentrenderedDatasourceResolver.prototype._makeReferenceAbsolute = function (html, baseUrl) {
    if(typeof DOMParser !== 'undefined') {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');

        this._getElementObjectsByAttr(doc.body, 'href')
            .concat(this._getElementObjectsByAttr(doc.body, 'src'))
            .filter(function (item) {
                return item.value && util.isUrlSiteRelative(item.value);
            }).forEach(function (item) {
                var absHref = new URL(item.value, baseUrl).href;
                item.element.setAttribute(item.attr, absHref);
            });

        return doc.body.innerHTML;
    } else {
        return html;
    }
};

/**
 * Finds all elements that have the specified attribute under the provided node
 *
 * @param {Node} node A node under which a search is conducted
 * @param {string} attr An attribute name
 * @returns {Object} An object that holds the element and a value of the attribute
 * @private
 */
ContentrenderedDatasourceResolver.prototype._getElementObjectsByAttr = function (node, attr) {
    return Array.prototype.map.call(node.querySelectorAll('[' + attr + ']'), function (el) {
        return {
            attr: attr,
            value: el.getAttribute(attr),
            element: el
        };
    });
};

/**
 * Checks whether a datasource is of contentrendered type and creates a resolver instance
 * if check passes. Use this method as a resolver creating function registered with
 * datasource resolver factory.
 *
 * @param {Object} datasource A datasource to check
 * @returns {DatasourceResolver|undefined}
 */
ContentrenderedDatasourceResolver.getInstance =
    DatasourceResolver.createFactoryFunction('contentrendered', ContentrenderedDatasourceResolver);

},{"backbase-widget-engine/src/datasource/datasource-resolver":40,"backbase-widget-engine/src/datasource/datasource-resolver-helpers":39,"backbase-widget-engine/src/util/util":78}],144:[function(require,module,exports){
/**
 * Implements "link" datasource resolver
 * @see {@link https://backbase.atlassian.net/wiki/display/PrM/Datasources+URI+spec#DatasourcesURIspec-LinkURI}
 * @module datasource/link-datasource-resolver
 * @exports {LinkDatasourceResolver}
 */

'use strict';

var DatasourceResolver  = require('backbase-widget-engine/src/datasource/datasource-resolver');
var modelParser         = require('../model/parsers/xml/model-parser');
var resolverHelpers     = require('backbase-widget-engine/src/datasource/datasource-resolver-helpers');

module.exports = LinkDatasourceResolver;

/**
 * Link datasource resolver
 * @param {Object} datasource
 * @constructor
 */
function LinkDatasourceResolver(datasource) {
    this._datasource = datasource;
}

/**
 * Builds an endpoint URL of link datasource
 * @param {Object} context An object expressions in datasource URI are resolved against
 * @returns {string} A URL of an endpoint where data can be requested from
 */
LinkDatasourceResolver.prototype.resolveUrl = function (context) {
    var url = this._datasource.uri;
    var urlComponents = url.split(':');

    if (urlComponents.length !== 2) {
        throw new Error('Invalid link datasource uri: ', url);
    }

    // create new array of parameters
    var params = [].concat(this._datasource.params || []);
    var linkId = resolverHelpers.trimSlashes(urlComponents[1]);
    if (linkId) {
        params.push({
            name: 'f',
            value: 'uuid(eq)' + linkId
        });
    }

    var depthParamExists = params.some(function (param) {
        return param.name === 'depth';
    });

    // depth parameter is required for links endpoint,
    // so add it if it's not specified in original url
    if (!depthParamExists) {
        params.push({
            name: 'depth',
            value: 1
        });
    }

    var apiRoot = context.apiRoot || '';
    var portalName = context.portalName;
    var endpointUrl = apiRoot + '/portal/portals/' + portalName + '/links.xml';

    var queryString = resolverHelpers.resolveQueryString(context, params);
    if (queryString) {
        endpointUrl += '?' + queryString;
    }

    return endpointUrl;
};

/**
 * Parses XML returned from datasource and returns the first link (if any)
 * @param {Response} response Fetch API response object
 * @returns {Promise.<Object>} promise resolved with link object
 */
LinkDatasourceResolver.prototype.processResponse = function processResponse(response) {
    return response.text().then(function (xml) {
        var links = modelParser.parseLinks(xml);
        return links && links.length ? links[0] : null;
    });
};

/**
 * Checks whether a datasource is of link type and creates a resolver instance
 * if check passes. Use this method as a resolver creating function registered with
 * datasource resolver factory.
 * @param {Object} datasource A datasource to check
 * @returns {DatasourceResolver|undefined}
 */
LinkDatasourceResolver.getInstance =
    DatasourceResolver.createFactoryFunction('link', LinkDatasourceResolver);

},{"../model/parsers/xml/model-parser":161,"backbase-widget-engine/src/datasource/datasource-resolver":40,"backbase-widget-engine/src/datasource/datasource-resolver-helpers":39}],145:[function(require,module,exports){
/**
 * Implements "navigation" datasource resolver
 * @see {@link https://backbase.atlassian.net/wiki/display/PrM/Navigation+Datasources}
 * @module datasource/navigation-datasource-resolver
 * @exports {NavigationDatasourceResolver}
 */

'use strict';

var DatasourceResolver  = require('backbase-widget-engine/src/datasource/datasource-resolver');
var resolverHelpers     = require('backbase-widget-engine/src/datasource/datasource-resolver-helpers');

module.exports = NavigationDatasourceResolver;

/**
 * Navigation datasource resolver
 * @param {Object} datasource
 * @constructor
 */
function NavigationDatasourceResolver(datasource) {
    this._datasource = datasource;
}

/**
 * Builds an endpoint URL of navigation datasource
 * @param {Object} context An object expressions in datasource URI are resolved against
 * @returns {string} A URL of an endpoint where data can be requested from
 */
NavigationDatasourceResolver.prototype.resolveUrl = function (context) {
    var url = this._datasource.uri;
    var urlComponents = url.split(':');

    if (urlComponents.length !== 2) {
        throw new Error('Invalid navigation datasource uri: ', url);
    }

    var params = [].concat(this._datasource.params || []);
    var linkId = resolverHelpers.trimSlashes(urlComponents[1]);
    if (linkId) {
        params.push({
            name: 'uuid',
            value: linkId
        });
    }

    var apiRoot = context.apiRoot || '';
    var endpointUrl = apiRoot + '/portal/navigation/tree';

    var queryString = resolverHelpers.resolveQueryString(context, params);
    if (queryString) {
        endpointUrl += '?' + queryString;
    }

    return endpointUrl;
};

/**
 * Parses JSON returned from datasource and returns it
 * @param {Response} response Fetch API response object
 * @returns {Promise.<Object>} promise resolved with an object literal containing JSON data
 */
NavigationDatasourceResolver.prototype.processResponse = function processResponse(response) {
    return response.json();
};

/**
 * Checks whether a datasource is of navigation type and creates a resolver instance
 * if check passes. Use this method as a resolver creating function registered with
 * datasource resolver factory.
 * @param {Object} datasource A datasource to check
 * @returns {DatasourceResolver|undefined}
 */
NavigationDatasourceResolver.getInstance =
    DatasourceResolver.createFactoryFunction('navigation', NavigationDatasourceResolver);

},{"backbase-widget-engine/src/datasource/datasource-resolver":40,"backbase-widget-engine/src/datasource/datasource-resolver-helpers":39}],146:[function(require,module,exports){
/**
 * Implements "portal" datasource resolver
 * @see {@link https://backbase.atlassian.net/wiki/display/PrM/Datasources+URI+spec#DatasourcesURIspec-PortalURI}
 * @module datasource/portal-datasource-resolver
 * @exports {PortalDatasourceResolver}
 */

'use strict';

var DatasourceResolver  = require('backbase-widget-engine/src/datasource/datasource-resolver');
var modelParser         = require('../model/parsers/xml/model-parser');
var resolverHelpers     = require('backbase-widget-engine/src/datasource/datasource-resolver-helpers');

module.exports = PortalDatasourceResolver;

/**
 * Portal datasource resolver
 * @param {Object} datasource
 * @constructor
 */
function PortalDatasourceResolver(datasource) {
    this._datasource = datasource;
}

/**
 * Builds an endpoint URL of portal datasource
 * @param {Object} context An object expressions in datasource URI are resolved against
 * @returns {string} A URL of an endpoint where data can be requested from
 */
PortalDatasourceResolver.prototype.resolveUrl = function (context) {
    var url = this._datasource.uri;
    var urlComponents = url.split(':');

    if (urlComponents.length !== 2) {
        throw new Error('Invalid link datasource uri: ', url);
    }

    var params = [].concat(this._datasource.params || []);
    // add pc=false parameter to have no children in output, otherwise XML will be huge
    params.push({
        name: 'pc',
        value: false
    });

    var apiRoot = context.apiRoot || '';
    var portalName = resolverHelpers.resolveExpression(context, resolverHelpers.trimSlashes(urlComponents[1]));
    var queryString = resolverHelpers.resolveQueryString(context, params);

    return apiRoot + '/portal/portals/' + portalName + '.xml' + '?' + queryString;
};

/**
 * Parses XML returned from datasource
 * @param {Response} response Fetch API response object
 * @returns {Promise.<Object>} promise resolved with portal object
 */
PortalDatasourceResolver.prototype.processResponse = function processResponse(response) {
    return response.text().then(function (xml) {
        return modelParser.parsePortal(xml);
    });
};

/**
 * Checks whether a datasource is of portal type and creates a resolver instance
 * if check passes. Use this method as a resolver creating function registered with
 * datasource resolver factory.
 * @param {Object} datasource A datasource to check
 * @returns {DatasourceResolver|undefined}
 * @static
 */
PortalDatasourceResolver.getInstance =
    DatasourceResolver.createFactoryFunction('portal', PortalDatasourceResolver);

},{"../model/parsers/xml/model-parser":161,"backbase-widget-engine/src/datasource/datasource-resolver":40,"backbase-widget-engine/src/datasource/datasource-resolver-helpers":39}],147:[function(require,module,exports){
'use strict';

var render = require('./render/render.js');
var configuration = require('./configuration/configuration.js');
var xmlCxpModel = require('./model/strategies/xml-cxp-model');

module.exports = {
    // Factory methods
    getRenderer: render.createInstance,
    createConfiguration: configuration.createInstance,
    getModel: xmlCxpModel.createInstance
};
},{"./configuration/configuration.js":140,"./model/strategies/xml-cxp-model":163,"./render/render.js":166}],148:[function(require,module,exports){
'use strict';

/**
 * ItemCollectionContext
 * @module model/core/item-collection-context
 * @exports {ItemCollectionContext}
 */
module.exports = ItemCollectionContext;

/**
 * ItemCollectionContext represents a collection of items.
 * It's responsibility to manipulate items in the given context
 * like creating new items, filtering them.
 * @param {Configuration} config Cxp configuration
 * @param {String} type Item type
 * @param filter
 * @constructor
 * @interface
 */
function ItemCollectionContext (config, type, filter) {
    this.config = config;
    this.type = type;
    this._filter = filter || null;
    this._requiredParams = this._getRequiredParams();

    this.logger = this.config.getLogger().child({
        childName: 'item-collection-context'
    });
}

/**
 * Returns required params for certain types
 * @private
 * @returns {Object} Required params as key/value
 */
ItemCollectionContext.prototype._getRequiredParams = function () {
    switch (this.type) {
        case 'link':
            return {depth: 10, ps: 50};
        case 'page':
            return {depth: 10};

        default:
            return null;
    }
};

/**
 * Gets array of all item objects of the given type in the current context
 * @returns {Promise} Promise of array of items
 */
/* istanbul ignore next */
ItemCollectionContext.prototype.get = function () {
    throw new Error('Method not implemented');
};

/**
 * Creates a new item using the given item model
 * @param {Object} itemModel Item model
 * @returns {Promise} Promise of newly created item model
 */
/* istanbul ignore next */
ItemCollectionContext.prototype.create = function (itemModel) {
    throw new Error('Method not implemented');
};

/**
* Applies a filter to the itemContext which will applied to future get() calls
* @param {String} name
* @param {String} value
* @param {string} operator One of 'lt', 'gt', 'eq', 'not', 'like'
* @return {ItemCollectionContext}
 */
/* istanbul ignore next */
ItemCollectionContext.prototype.filter = function (name, value, operator) {
    throw new Error('Method not implemented');
};

},{}],149:[function(require,module,exports){
'use strict';

/**
 * ItemContext
 * @module model/core/item-context
 * @exports {ItemContext}
 */
module.exports = ItemContext;

/**
 * ItemContext for the item identified by the given name
 * @param {Configuration} config CXP Configuration
 * @param {String} itemName Item name
 * @param {String} itemType Type of the item
 * @param {Boolean} findById
 * @constructor
 * @interface
 */
function ItemContext(config, itemName, itemType, findById) {
    this.config = config;
    this.itemName = itemName;
    this.itemType = itemType;
    this.findById = findById || false;
    this._requiredParams = this._getRequiredParams();

    this.logger = this.config.getLogger().child({
        childName: 'item-context'
    });
}

/**
 * Returns query params to be used to get models of certain item types
 * @private
 * @returns {Object} Required params as key/value
 */
ItemContext.prototype._getRequiredParams = function () {
    var params = {};
    var isInDesignmode = this.config.enabled('designmode');
    var itemType = this.itemType;

    if (itemType === 'link' || itemType === 'page') {
        params.depth = 10;
    }

    if (isInDesignmode && (itemType === 'widget' || itemType === 'container' || itemType === 'page')) {
        params.designmode = true;
    }

    return params;
};

/**
 * Retrieves item model object
 * @param {Object} [options] Additional options
 * @param {boolean} [options.allLocalizedValues] Indicates that model should have all localized preference values
 * @returns {Promise<Object>}
 */
/* istanbul ignore next */
ItemContext.prototype.get = function (options) {
    throw new Error('Method not implemented');
};

/**
 * Updates the item using the given item model
 * @param {Object} model New item model
 * @returns {Promise}
 */
/* istanbul ignore next */
ItemContext.prototype.update = function (model) {
    throw new Error('Method not implemented');
};

/**
 * Reverts item's customizations.
 * @returns {Promise}
 */
/* istanbul ignore next */
ItemContext.prototype.revert = function () {
    throw new Error('Method not implemented');
};

/**
 * Removes the item
 * @returns {Promise}
 */
/* istanbul ignore next */
ItemContext.prototype.remove = function () {
    throw new Error('Method not implemented');
};


},{}],150:[function(require,module,exports){
'use strict';

/**
 * ModelHelpers module provides helper functions
 * for manipulating/exploring item model
 * @module model/core/ModelHelpers
 */
module.exports = {
    modifyPreference: modifyPreference,
    generateItemName: generateItemName,
    getViewHint: getViewHint
};

/**
 * Changes preference's value with given one.
 * Throws error if preference not found.
 *
 * @param {Object} model Item model
 * @param {String} name Preference name
 * @param {String} [valueType] Type of the preference value
 * @param {Any} value New value for preference
 */
function modifyPreference(model, name, value, valueType) {
    var preference = model.preferences[name];

    if (!preference) {
        preference = {name: name};
        model.preferences[name] = preference;
    }

    preference.value = value;

    if (valueType) {
        preference.type = valueType;
    }
}

/**
 * Performance optimized UUID generation code
 *
 * @returns {String} uuid
 */
var lut = []; for (var i=0; i<256; i++) { lut[i] = (i<16?'0':'')+(i).toString(16); } // jshint ignore:line
function generateUUID () {
    /* jshint ignore:start */
    var d0 = Math.random()*0xffffffff|0;
    var d1 = Math.random()*0xffffffff|0;
    var d2 = Math.random()*0xffffffff|0;
    var d3 = Math.random()*0xffffffff|0;
    return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
        lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
        lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
        lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
    /* jshint ignore:end */
}

/**
 * Generates new item name based on extendedItemName
 * and random generated UUID
 *
 * @param {String} extendedItemName Extended item's name
 * @returns {String} New item name
 */
function generateItemName(extendedItemName) {
    return extendedItemName + generateUUID();
}

function getViewHint(viewHintType, viewhints) {

    //TODO: this code is temporarily duplicated in handlebars-helpers as a static function of the model helpers.
    //This code and the code in the handlebars-helpers should be consolidated to the widget engine as part of BACKLOG-12205
    
    var viewHintsMap = {
        designmode: ['designModeOnly'],
        role: ['admin', 'manager', 'user', 'none'],
        input: ['text-input', 'checkbox', 'select-one'],
        order: []
    };
    
    if(!viewhints || !viewhints.length || !viewHintsMap[viewHintType]) {
        return null;
    }

    //look for matching value
    var matchedViewHint = viewhints.filter(function(viewHint) {
        return viewHintsMap[viewHintType].indexOf(viewHint) !== -1 || viewHint.slice(0, viewHintType.length) === viewHintType;
    })[0];

    //parse order number
    if (matchedViewHint && viewHintType === 'order') {
        var order = matchedViewHint.split('-');
        order = order.length === 2 ? order[1] : null;
        var parsedOrder = parseFloat(order);
        if (!isNaN(parsedOrder)) {
            order = parsedOrder;
        }
        matchedViewHint = order;
    }

    //set default values
    matchedViewHint = matchedViewHint || (viewHintType === 'input' ? 'text-input' : null);

    //convert to boolean if it's designmode view hint
    if(viewHintType === 'designmode') {
        matchedViewHint = !!matchedViewHint;
    }

    return matchedViewHint;
}

},{}],151:[function(require,module,exports){
'use strict';

var modelHelpers = require('../core/model-helpers');

/**
 * Model Api
 * @module model/core/model
 * @exports {Model} The constructor
 */
module.exports = Model;

/**
 * Model gets portal data
 * @param {CxpConfiguration} configuration
 * @constructor
 * @interface
 */
function Model (configuration) {
    this.config = configuration;
    this.helpers = modelHelpers;
}

/**
 * Gets items of the given type for the current context
 *
 * @param {String} itemType Type of item
 * @returns {ItemCollectionContext}
 */
/* istanbul ignore next */
Model.prototype.items = function (itemType, opts) {
    throw new Error('Method not implemented');
};

/**
 * ItemContext for the item identified by the given name
 *
 * @param {String} itemName Name of item
 * @param {String} itemType Type of item
 * @returns {ItemContext}
 */
/* istanbul ignore next */
Model.prototype.item = function (itemName, itemType, opts) {
    throw new Error('Method not implemented');
};

/**
 * ItemContext for the item identified by the given id
 *
 * @param {String} itemId Id of item
 * @param {String} itemType Type of item
 * @returns {ItemContext}
 */
/* istanbul ignore next */
Model.prototype.itemById = function (itemId, itemType, opts) {
    throw new Error('Method not implemented');
};

},{"../core/model-helpers":150}],152:[function(require,module,exports){
'use strict';

var fetch = require('backbase-widget-engine/src/util/deduping-fetch');
var util = require('../../util');

/**
 * Manages outgoing AJAX calls
 * @module model/rest-api-consumer
 * @exports {RestApiConsumer} Exports the constructor
 * @exports {createInstance} Exports the factory method
 */
module.exports = {
    RestApiConsumer: RestApiConsumer,
    createInstance: createInstance
};

/**
 * RestApiConsumer responsible for making rest calls, caching?, authentication?
 * @param {Configuration} configuration
 * @constructor
 */
function RestApiConsumer (configuration) {
    this.configuration = configuration;

    var baseUrl = configuration.get('remoteContextRoot');
    if (typeof baseUrl !== 'string') {
        throw new Error('RestApiConsumer needs remoteContextRoot variable to be set');
    }

    // Make sure baseUrl ends with "/"
    if (/\/$/.test(baseUrl) === false) {
        baseUrl += '/';
    }

    this.baseUrl = baseUrl;

    this.logger = configuration.getLogger().child({
        childName: 'rest-api-consumer'
    });
}

/**
 * Encodes given object as query parameters
 * @param {Object} params
 * @returns {String} Encoded parameters
 * @private
 */
RestApiConsumer.prototype._encodeQueryParameters = function (params) {
    var query = [];

    Object.keys(params).forEach(function (key) {
        if (Array.isArray(params[key])) {
            params[key].forEach(function (value) {
                query.push(key + '[]=' + encodeURIComponent(value));
            });
        } else {
            query.push(key + '=' + encodeURIComponent(params[key]));
        }
    });

    return query.join('&');
};

/**
 * Builds full url for given endpoint and parameters
 * @param {String} endpoint
 * @param {Object} [params]
 * @returns {string}
 * @private
 */
RestApiConsumer.prototype._buildUrl = function (endpoint, params) {
    var query = this._encodeQueryParameters(params || {});
    var url = this.baseUrl + endpoint;

    if (query.length > 0) {
        url += (endpoint.indexOf('?') >= 0 ? '&' : '?') + query;
    }

    return url;
};

/**
 * Makes ajax request and manage request's lifecycle.
 * @param {String} endpoint Endpoint url
 * @param {Object} [params] Query parameters
 * @param {Object} options Fetch options
 * @returns {Promise}
 * @private
 */
RestApiConsumer.prototype._makeRequest = function (endpoint, options, params) {
    var self = this;
    var requestUrl = this._buildUrl(endpoint, params);

    this.logger.debug('Making REST request to [%s]', requestUrl);

    var promise =  fetch(requestUrl, options).then(function (response) {
        if (response.status < 200 || response.status >= 300) {
            var error = new Error(response.statusText);
            error.response = response;
            throw error;
        }

        self.logger.debug('Request successful server responds %s', response.status);
        return response;
    });

    promise.catch(function (err) {
        self.logger.error('Request failed with: %s', err);
    });

    return promise;
};

/**
 * Makes a GET request to given endpoint
 * @param {String} endpoint
 * @param {Object} [params] Query params
 * @returns {Promise}
 */
RestApiConsumer.prototype.get = function (endpoint, params) {
    return this._makeRequest(endpoint, {
        method: 'GET',
        headers: {
            // this is to prevent IE/Edge from caching of REST endpoint responses
            'Pragma' : 'no-cache',
            'Cache-Control' : 'no-cache'
        }
    }, params);
};

/**
 * Makes a POST request to given endpoint
 * @param {String} endpoint
 * @param {Object} data Request body
 * @returns {Promise}
 */
RestApiConsumer.prototype.post = function (endpoint, data) {
    var headers = {};

    if (util.isObject(data)) {
        data = JSON.stringify(data);
    }

    var mimeType = determineContentType(data);
    if (mimeType) {
        headers['Content-Type'] = mimeType;
    }

    //sending a token here is redundant unless the content type is x-www-url-form-encoded or multipart/form-data,
    //but it gives people piece of mind.
    var csrfToken = getCsrfToken(this.configuration);
    if(csrfToken) {
        headers[csrfToken.name] = csrfToken.value;
    }

    return this._makeRequest(endpoint, {
        method: 'POST',
        body: data,
        headers: headers
    });
};

/**
 * Makes a PUT request to given endpoint
 * @param {String} endpoint
 * @param {Object} data Request body
 * @returns {Promise}
 */
RestApiConsumer.prototype.put = function (endpoint, data) {
    var headers = {};

    if (util.isObject(data)) {
        data = JSON.stringify(data);
    }

    var mimeType = determineContentType(data);
    if (mimeType) {
        headers['Content-Type'] = mimeType;
    }

    //sending a token here is redundant, but it gives people piece of mind
    var csrfToken = getCsrfToken(this.configuration);
    if(csrfToken) {
        headers[csrfToken.name] = csrfToken.value;
    }

    return this._makeRequest(endpoint, {
        method: 'PUT',
        body: data || '',
        headers: headers
    });
};

/**
 * Makes a DELETE request to given endpoint
 * @param {String} endpoint
 * @param {Object} params Query params
 * @returns {Promise}
 */
RestApiConsumer.prototype.delete = function (endpoint, params) {

    var headers = {};

    //sending a token here is redundant, but it gives people piece of mind
    var csrfToken = getCsrfToken(this.configuration);
    if(csrfToken) {
        headers[csrfToken.name] = csrfToken.value;
    }

    return this._makeRequest(endpoint, {
        method: 'DELETE',
        headers: headers
    }, params);
};

/**
 * Returns an instance of RestApiConsumer
 * @param opts
 * @param opts.baseUrl Base url for api endpoints
 * @param opts.concurrentLimit Maximum number of concurrent ajax calls
 * @returns {RestApiConsumer}
 */
function createInstance (opts) {
    return new RestApiConsumer(opts);
}

/**
 * Finds the best Content-Type header value for the given data
 * @param {Object|String} data
 * @returns {String} Mime type
 */
function determineContentType (data) {
    if (util.isObject(data)) {
        return 'application/json';
    } else if (data && data.indexOf('<?xml') >= 0) {
        return 'text/xml';
    } else {
        return 'application/xml';
    }
}

function getCsrfToken(config) {
    return config.get('csrfToken') || null;
}

},{"../../util":169,"backbase-widget-engine/src/util/deduping-fetch":72}],153:[function(require,module,exports){
'use strict';

var generateProperty = require('./property-generator');

var ITEM_PROPERTY_NAMES = ['type', 'name', 'contextItemName', 'extendedItemName', 'parentItemName'];

var BASIC_PROPERTIES = [
    'shortName',
    'description',
];

/**
 * Generates xml for given link model
 * @param {XmlBuilder} xml XML
 * @param {Object} model
 * @param {Array=} additionalProperties Any additional properties to generate
 * @returns {XmlBuilder} Link xml
 */
module.exports = function(xml, model, additionalProperties) {

    additionalProperties = additionalProperties || [];

    ITEM_PROPERTY_NAMES.forEach(function(propertyName) {
        if (model.hasOwnProperty(propertyName)) {
            xml.beginElement(propertyName);
            xml.text(model[propertyName]);
            xml.endElement(propertyName);
        }
    });

    if (model.id) {
        xml.beginElement('uuid');
        xml.text(model.id);
        xml.endElement('uuid');
    }

    if (typeof model.manageable === 'boolean') {
        xml.beginElement('manageable');
        xml.text(model.manageable ? 'true' : 'false');
        xml.endElement('manageable');
    }

    xml.beginElement('properties');
    BASIC_PROPERTIES.forEach(function(property) {
        if (model[property]) {
            generateProperty(xml, { name: property, readonly: false, value: model[property] });
        }
    });
    if (Array.isArray(additionalProperties) && additionalProperties.length > 0) {
        additionalProperties.forEach(function(property) {
            generateProperty(xml, property);
        });
    }
    if (Array.isArray(model.icons) && model.icons.length > 0) {
        model.icons.forEach(function(icon, i) {
            var propertyName = i === 0 ? 'thumbnailUrl' : 'icon';
            generateProperty(xml, { name: propertyName, readonly: false, value: icon });
        });
    }
    var preferences = model.preferences || {};
    Object.keys(preferences).forEach(function(prefName) {
        generateProperty(xml, preferences[prefName], model.locale);
    });
    xml.endElement('properties');

    if (model.tags && model.tags.length > 0) {
        xml.beginElement('tags');
        model.tags.forEach(function(tag) {
            var attrs = { type: tag.type };
            if (tag.manageable) {
                attrs.manageable = true;
            }
            if (tag.blacklist) {
                attrs.blacklist = true;
            }
            xml.beginElement('tag', attrs);
            xml.text(tag.name);
            xml.endElement('tag');
        });
        xml.endElement('tags');
    }

    return xml;
};
},{"./property-generator":156}],154:[function(require,module,exports){
'use strict';

var XmlBuilder = require('./xml-builder');
var baseXmlGenerator = require('./base-xml-generator');

/**
 * Generates xml for given link model
 * @param {Object} model Link model
 * @returns {String} Link xml
 */
module.exports = function (model) {
    var xml = new XmlBuilder();

    xml.beginElement('link');
    baseXmlGenerator(xml, model);
    xml.endElement('link');

    return xml.toString();
};

},{"./base-xml-generator":153,"./xml-builder":158}],155:[function(require,module,exports){
'use strict';

var XmlBuilder = require('./xml-builder');
var baseXmlGenerator = require('./base-xml-generator');

/**
 * Generates xml for given page model
 * @param {Object} model Page model
 * @returns {String} Page xml
 */
module.exports = function (model) {
    var xml = new XmlBuilder();

    xml.beginElement('page');
    baseXmlGenerator(xml, model);
    xml.endElement('page');

    return xml.toString();
};

},{"./base-xml-generator":153,"./xml-builder":158}],156:[function(require,module,exports){
'use strict';

var NO_LOCALE_NAME = require('backbase-widget-engine/src/strategies/parser/xml/constants').NO_LOCALE_NAME;

/**
 * Generates single property element for given property
 * @param {XmlBuilder} xml The XML builder
 * @param {Object} property The property object
 * @param {string=} currentLocale The current locale
 */
function generateProperty(xml, property, currentLocale) {
    var attrs = {
        name: property.name,
        readonly: property.readonly || false
    };
    var type = property.type || (property.name === 'order' ? 'double' : null);

    if (typeof property.manageable === 'boolean') {
        attrs.manageable = property.manageable;
    }

    if (typeof property.localizable === 'boolean') {
        attrs.localizable = property.localizable;
    }

    if (property.markedForDeletion === true) {
        attrs.markedForDeletion = true;
    }

    if (property.label) {
        attrs.label = property.label;
    }

    if (type) {
        attrs.type = type;
    }

    if (property.viewhints && property.viewhints.length > 0) {
        attrs.viewHint = property.viewhints.join(',');
    }

    xml.beginElement('property', attrs);
    generateValues(xml, property, currentLocale);
    xml.endElement('property');
}

/**
 * Build a basic value element
 * @param {XmlBuilder} xml The XML builder to append to
 * @param {*} value The value of the element
 * @param {Object=} attributes The attributes of the element
 */
function buildValueElement(xml, value, attributes) {
    xml.beginElement('value', attributes);
    xml.text(value);
    xml.endElement('value');
}

/**
 * Generate the values for each element
 * @param {XmlBuilder} xml The XML builder
 * @param {Object} property The property to build
 * @param {string=} currentLocale The current locale for i18n
 */
function generateValues(xml, property, currentLocale) {
    var locale = currentLocale || NO_LOCALE_NAME;

    if (property.localizable) {
        var langObj = property._lang;
        if (!langObj) {
            langObj = {};
            langObj[locale] = { value: property.value };
        }

        Object.keys(langObj).forEach(function (localeName) {
            var localizedValueObj = langObj[localeName];
            var attributes = {};

            if (localizedValueObj.markedForDeletion === true) {
                attributes.markedForDeletion = true;
            }
            if (localeName !== NO_LOCALE_NAME) {
                attributes.locale = localeName;
            }

            buildValueElement(xml, localizedValueObj.value, attributes);
        });
    } else {
        buildValueElement(xml, property.value);
    }
}

module.exports = generateProperty;
},{"backbase-widget-engine/src/strategies/parser/xml/constants":58}],157:[function(require,module,exports){
'use strict';

var XmlBuilder = require('./xml-builder');
var baseXmlGenerator = require('./base-xml-generator');

var WIDGET_PROPERTIES = [
    'author',
    'authorEmail',
    'authorHref',
    'license',
    'licenseHref',
];

/**
 * Generates xml for given widget model
 * @param {Object} model Widget model
 * @param {Boolean} [isContainer]
 * @returns {String} Widget xml
 */
module.exports = function(model, isContainer) {
    var elementName = isContainer ? 'container' : 'widget';

    var additionalProperties = [];

    WIDGET_PROPERTIES.forEach(function(property) {
        if (model[property]) {
            additionalProperties.push({ name: property, readonly: false, value: model[property] });
        }
    });

    if (model.content && model.content.src) {
        additionalProperties.push({ name: 'src', readonly: false, value: model.content.src });
    }

    if (model.altContent) {
        Object.keys(model.altContent).forEach(function(contentName) {
            additionalProperties.push({
                name: 'src.' + contentName,
                readonly: false,
                value: model.altContent[contentName].src
            });
        });
    }

    // viewmodes
    if (model.viewmodes && model.viewmodes.length > 0) {
        additionalProperties.push({ name: 'viewmodes', readonly: false, value: model.viewmodes.join(' ') });
    }

    var xml = new XmlBuilder();
    xml.beginElement(elementName);
    baseXmlGenerator(xml, model, additionalProperties);
    xml.endElement(elementName);

    return xml.toString();
};
},{"./base-xml-generator":153,"./xml-builder":158}],158:[function(require,module,exports){
'use strict';

/**
 * @module model/core/XmlGenerator
 * @export {XmlBuilder}
 */
module.exports = XmlBuilder;

var xmlEntityMap = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '&': '&amp;'
};
var xmlSpecialCharRegexp = /[<>"&]/g;

/**
 * Converts XML reserved characters to corresponding entities
 * @param {string} str
 * @returns {string}
 */
function escapeXML(str) {
    return str.replace(xmlSpecialCharRegexp, function (char) {
        return xmlEntityMap[char] || char;
    });
}

/**
 * Converts a value of any type to a string.
 * @param {*} value
 * @returns {string}
 */
function convertToString(value) {
    return value === null || value === undefined ? '' : String(value);
}

function XmlBuilder () {
    this.xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
}

XmlBuilder.prototype.beginElement = function (tagName, attributes) {
    var attributesString = '';
    if (attributes) {
        attributesString = Object.keys(attributes).reduce(function (str, attrName) {
            var valueStr = convertToString(attributes[attrName]);
            return str + ' ' + attrName + '="' + escapeXML(valueStr) + '"';
        }, '');
    }

    this.xml += '<' + tagName + attributesString + '>';
};

XmlBuilder.prototype.endElement = function (tagName) {
    this.xml += '</' + tagName + '>';
};

XmlBuilder.prototype.text = function (text) {
    this.xml += escapeXML(convertToString(text));
};

XmlBuilder.prototype.toString = function () {
    return this.xml;
};

},{}],159:[function(require,module,exports){
'use strict';

var widgetGenerator = require('./widget-xml-generator');
var generatePage = require('./page-xml-generator');
var generateLink = require('./link-xml-generator');

module.exports = {
    generate: generate,
    generateWidget: generateWidget,
    generateContainer: generateContainer,
    generatePage: generatePage,
    generateLink: generateLink
};

function generateContainer(model) {
    return widgetGenerator(model, true);
}

function generateWidget(model) {
    return widgetGenerator(model, false);
}

function generate(model, type) {
    var methodName = 'generate' + type[0].toUpperCase() + type.substr(1);
    if (!module.exports[methodName]) {
        throw new Error('Unsupported type passed ' + type);
    }
    return module.exports[methodName](model);
}


},{"./link-xml-generator":154,"./page-xml-generator":155,"./widget-xml-generator":157}],160:[function(require,module,exports){
'use strict';

var merge = require('../../../util').merge;
var parseItem = require('backbase-widget-engine/src/strategies/parser/xml/item');
var helpers = require('backbase-widget-engine/src/strategies/parser/xml/helpers');

module.exports = parseLink;

var linkParsers = {
    'LINK': parseHeader,
    'divider': parseDivider,
    'page': parsePage,
    'externalLink': parseExternalLink,
    'redirect': parseRedirect,
    'alias': parseAlias,
    'state': parseState
};

/**
 * Extracts link specific data from given node.
 * @param {Node} node Link node <link ...>
 */
function parseLink(node) {
    var item = parseItem(node);
    var properties = item.preferencesDict;

    // TODO: check for other types
    var type = properties.itemType;
    if (type === 'menuHeader') {
        type = 'LINK';
    }

    var link = {
        children: [],
        itemType: type,
        title: properties.title
    };

    if (typeof linkParsers[type] === 'function') {
        linkParsers[type](link, properties);
    }

    var children = parseChildren(node);
    if ((children || []).length > 0) {
        link.children = children;
    }

    delete link.preferencesDict;

    return merge(item, link);
}

/**
 * Parses Header specific link nodes (Main Navigation, Not in Navigation)
 * @param {Object} link
 * @private
 */
function parseHeader(link) {
    link.navPattern = null;
}

/**
 * Parses Page specific link nodes
 * @param {Object} link
 * @param {Object} properties
 * @private
 */
function parsePage(link, properties) {
    link.itemRef = properties.ItemRef;
    link.href = properties.generatedUrl;

    if (properties.Url) {
        link.url = properties.Url;
    }

    link.generatedUrl = properties.generatedUrl;
}

/**
 * Parses Divider specific link nodes
 * @param {Object} link
 * @param {Object} properties
 * @private
 */
function parseDivider(link, properties) {
    link.className = properties.className;
}

/**
 * Pasers ExternalLink specific link nodes
 * @param {Object} link
 * @param {Object} properties
 * @private
 */
function parseExternalLink(link, properties) {
    link.url = properties.Url;
}

/**
 * Parses Redirect specific link nodes
 * @param {Object} link
 * @param {Object} properties
 * @private
 */
function parseRedirect(link, properties) {
    link.redirectionMethod = properties.redirectionMethod;
    link.url = properties.Url;
    link.targetPage = properties.targetPage;
}

/**
 * Parses Alias specific link nodes
 * @param {Object} link
 * @param {Object} properties
 * @private
 */
function parseAlias(link, properties) {
    link.itemRef = properties.ItemRef;
    link.href = properties.generatedUrl;

    if (properties.Url) {
        link.url = properties.Url;
    }

    link.generatedUrl = properties.generatedUrl;
}

/**
 * Parses State specific link nodes
 * @param {Object} link
 * @param {Object} properties
 * @private
 */
function parseState(link, properties) {
    link.itemRef = properties.ItemRef;
    link.href = properties.generatedUrl;

    if (properties.Url) {
        link.url = properties.Url;
    }

    link.generatedUrl = properties.generatedUrl;

    try {
        link.state = JSON.parse(properties.State);
    } catch (err) {
        //state property cannot be parsed
        throw new Error('Failed to parse "state" property of link [' + link.itemRef + ']. Error: ' + err.message);
    }

    if (properties.sectionName) {
        link.sectionName = properties.sectionName;
    }
}

/**
 * Parses page's childrens.
 * @param {Node} node Page node
 * @return {Array<object>} Array of children pages
 */
function parseChildren(node) {
    var parent = helpers.getChildElementByName(node, 'children');
    var childrenElements = parent && helpers.getChildElements(parent);

    return childrenElements && childrenElements.map(parseLink);
}

},{"../../../util":169,"backbase-widget-engine/src/strategies/parser/xml/helpers":59,"backbase-widget-engine/src/strategies/parser/xml/item":60}],161:[function(require,module,exports){
'use strict';

var parseLink = require('./link');
var parsePage = require('./page');
var baseModelParser = require('backbase-widget-engine/src/strategies/parser/xml/model-parser');
var helpers = require('backbase-widget-engine/src/strategies/parser/xml/helpers');
var loggerFactory = require('backbase-widget-engine/src/util/logger-factory');
var parseItemInternal = require('backbase-widget-engine/src/strategies/parser/xml/item');

/**
 * XML parser of item models (widget, container, page, etc)
 * @module model/parsers/xml/model-parser
 */
var parser = Object.create(baseModelParser);

parser.parseLink = parseXml(parseLink);
parser.parseLinks = parseChildrenXml(parseLink);
parser.parsePage = parseXml(parsePage);
parser.parsePages = parseChildrenXml(parsePage);
parser.parsePortal = parseXml(parseItem);
parser.parsePortals = parseChildrenXml(parseItem);

module.exports = parser;

/**
 * Takes a parser and an xml content and calls parser
 * function with first child of DOMParser's document.
 *
 * @param {function} parsingFunc a function that converts DOM to JS object representation of an item
 * @return {function} parsed item model
 */
function parseXml(parsingFunc) {
    return function (xml) {
        var logger = loggerFactory.getLogger();
        var doc = parseXmlString(xml);

        return parsingFunc(doc.documentElement, logger);
    };
}

/**
 * Takes a parser and an xml content and maps parser
 * function over all children nodes of document's
 * first children.
 *
 * @param {function} parsingFunc a function that converts DOM to JS object representation of an item
 * @return {function} parsed item model
 */
function parseChildrenXml(parsingFunc) {
    return function (xml) {
        var logger = loggerFactory.getLogger();
        var doc = parseXmlString(xml);

        return helpers.getChildElements(doc.documentElement).map(function (item) {
            return parsingFunc(item, logger);
        });
    };
}

function parseXmlString(xml) {
    var parser = new DOMParser();
    return parser.parseFromString(xml, 'application/xml');
}

function parseItem(itemEl) {
    var item = parseItemInternal(itemEl);
    delete item.preferencesDict;

    return item;
}
},{"./link":160,"./page":162,"backbase-widget-engine/src/strategies/parser/xml/helpers":59,"backbase-widget-engine/src/strategies/parser/xml/item":60,"backbase-widget-engine/src/strategies/parser/xml/model-parser":61,"backbase-widget-engine/src/util/logger-factory":77}],162:[function(require,module,exports){
'use strict';

var parseItem   = require('backbase-widget-engine/src/strategies/parser/xml/item');
var parseWidget = require('backbase-widget-engine/src/strategies/parser/xml/widget');
var common      = require('backbase-widget-engine/src/strategies/parser/xml/common');
var helpers     = require('backbase-widget-engine/src/strategies/parser/xml/helpers');
var merge       = require('../../../util').merge;

module.exports = parsePage;

/**
 * Parses given page specific XML element into JS object
 * @param {Element} pageEl <page ...>
 * @returns {Object} page object
 */
function parsePage (pageEl) {
    var item = parseItem(pageEl);
    var properties = item.preferencesDict;

    var page = {
        content:     parseContent(properties),
        children:    [],
        description: properties.description,
        icons:       common.parseIcons(properties)
    };

    var children = common.parseChildren(pageEl, parseWidget);
    if ((children || []).length > 0) {
        page.children = children;
    }

    delete item.preferencesDict;

    return merge(item, page);
}

/**
 * Parses start file specific part of a page
 * @param {Object} properties Properties as Key/Value
 * @return {Object} Content object
 */
function parseContent(properties) {
    var content = { src: '', type: 'text/html', encoding: 'UTF-8' };
    helpers.assignIfExists(content, 'src', properties.src);

    return content;
}

},{"../../../util":169,"backbase-widget-engine/src/strategies/parser/xml/common":57,"backbase-widget-engine/src/strategies/parser/xml/helpers":59,"backbase-widget-engine/src/strategies/parser/xml/item":60,"backbase-widget-engine/src/strategies/parser/xml/widget":62}],163:[function(require,module,exports){
'use strict';

var Model = require('../core/model');
var XmlItemContext = require('./xml-item-context');
var XmlItemCollectionContext = require('./xml-item-collection-context');

/**
 * Model Api - XmlCxp implementation
 * @module model/strategies/xml-cxp-model
 * @exports {XmlCxpModel} The constructor
 */
module.exports = {
    XmlCxpModel: XmlCxpModel,
    createInstance: createInstance
};

/**
 * XmlCxp implementation for Model interface
 * @see model/core/model/Model
 * @param {Configuration} configuration
 * @constructor
 */
function XmlCxpModel(configuration) {
    Model.apply(this, [configuration]);
}

XmlCxpModel.prototype = Object.create(Model.prototype);

/**
 * @see model/core/model#items
 */
XmlCxpModel.prototype.items = function (itemType, opts) {
	var config = opts && opts.config || this.config;
	return new XmlItemCollectionContext(config, itemType, false);
};

/**
 * @see model/core/model#item
 */
XmlCxpModel.prototype.item = function (itemName, itemType, opts) {
	var config = opts && opts.config || this.config;
    return new XmlItemContext(config, itemName, itemType, false);
};

/**
 * @see model/core/model#itemById
 */
XmlCxpModel.prototype.itemById = function (itemId, itemType, opts) {
	var config = opts && opts.config || this.config;
    return new XmlItemContext(config, itemId, itemType, true);
};

/**
 * Creates a new XmlCxpModel instance
 * @param {Configuration} configuration
 * @returns {XmlCxpModel}
 */
function createInstance(configuration) {
    return new XmlCxpModel(configuration);
}

},{"../core/model":151,"./xml-item-collection-context":164,"./xml-item-context":165}],164:[function(require,module,exports){
'use strict';

var xmlModelParser          = require('../parsers/xml/model-parser');
var xmlGenerator            = require('../generators/xml-generator');
var ItemCollectionContext   = require('../core/item-collection-context');
var restApiConsumer         = require('../core/rest-api-consumer');

/**
 * XmlItemCollectionContext
 * @module model/strategies/xml-item-collection-context
 * @exports {XmlItemCollectionContext}
 */
module.exports = XmlItemCollectionContext;

/**
 * @see model/core/item-collection-context
 */
function XmlItemCollectionContext (config, type, filters) {
    ItemCollectionContext.call(this, config, type, filters);

    this.apiConsumer = restApiConsumer.createInstance(this.config);
}

XmlItemCollectionContext.prototype = Object.create(ItemCollectionContext.prototype);

/**
 * @see model/core/item-collection-context
 */
XmlItemCollectionContext.prototype.get = function () {
    var portalName = this.config.get('portalName');
    var endpoint = 'portals/' + portalName + '/' + this.type + 's';
    var filter = this._filter;
    var requiredParams = this._requiredParams;
    var filterQuery = [];
    var requiredParamsQuery = [];

    if (filter) {
        filterQuery = ['f=' + filter.name + '(' + filter.operator + ')' + encodeURIComponent(filter.value)];
    }

    // Some item types requires certain type of query params
    // @see model/core/item-collection-context#_getRequiredParams
    if (this._requiredParams) {
        requiredParamsQuery = Object.keys(requiredParams).map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(requiredParams[key]);
        });
    }

    var query = filterQuery.concat(requiredParamsQuery).join('&');
    endpoint += (query.length > 0 ? '?' + query : '');

    return this.apiConsumer.get(endpoint).then(function (response) {
        return response.text();
    }).then(function (xmlString) {
        this.logger.info('Parsing %s', endpoint);
        var items = xmlModelParser.parse(xmlString, this.type + 's');
        this.logger.info('%s parsed successfully');

        return items;
    }.bind(this));
};

/**
 * @see model/core/item-collection-context
 */
XmlItemCollectionContext.prototype.filter = function (name, value, operator) {
    var filter = { name: name, value: value, operator: operator || 'eq' };
    return new XmlItemCollectionContext(this.config, this.type, filter);
};

/**
 * @see model/core/item-collection-context#create
 */
XmlItemCollectionContext.prototype.create = function (model) {
    var requiredFields = ['parentItemName'];
    if (this.type !== 'link') {
        requiredFields.push('extendedItemName');
    }

    requiredFields.forEach(function (field) {
        if (typeof model[field] === 'undefined' ||
            typeof model[field] !== 'string' ||
            model[field].length === 0) {
            throw new Error('ItemCollectionContext.create needs the model has the field named: ' + field);
        }
    });

    var portalName = this.config.get('portalName');

    model.contextItemName = portalName;

    if (typeof model.preferences === 'undefined') {
        model.preferences = {};
    }

    var itemXml = xmlGenerator.generate(model, this.type);
    var endpoint = 'portals/' + portalName + '/' + this.type + 's';

    return this.apiConsumer.post(endpoint, itemXml).then(function (response) {
        return response.text();
    }).then(function (newItemXml) {
        this.logger.info('Parsing newly created item\'s xml');
        var item = xmlModelParser.parse(newItemXml, this.type);
        this.logger.info('Newly created item parsed successfully');

        return item;
    }.bind(this));
};

},{"../core/item-collection-context":148,"../core/rest-api-consumer":152,"../generators/xml-generator":159,"../parsers/xml/model-parser":161}],165:[function(require,module,exports){
'use strict';

var xmlModelParser  = require('../parsers/xml/model-parser');
var xmlGenerator    = require('../generators/xml-generator');
var restApiConsumer = require('../core/rest-api-consumer');
var ItemContext     = require('../core/item-context');

/**
 * XmlItemContext
 * @module model/strategies/xml-item-context
 * @exports {XmlItemContext}
 */
module.exports = XmlItemContext;

/**
 * @see model/core/item-context
 */
function XmlItemContext (config, itemName, itemType, findById) {
    ItemContext.call(this, config, itemName, itemType, findById);

    this.apiConsumer = restApiConsumer.createInstance(this.config);
}

XmlItemContext.prototype = Object.create(ItemContext.prototype);

/**
 * @see model/core/item-context/ItemContext#get
 */
XmlItemContext.prototype.get = function (options) {
    var opts = typeof options === 'object' ? options : {};

    if (this.findById) {
        return this._getItemById();
    } else {
        return this._getItemByName(opts);
    }
};

/**
 * @private
 */
XmlItemContext.prototype._buildParams = function () {
    return Object.keys(this._requiredParams).map(function (key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(this._requiredParams[key]);
    }.bind(this)).join('&');
};

/**
 * Gets item model by its name
 * @param {Object} opts
 * @private
 */
XmlItemContext.prototype._getItemByName = function (opts) {
    var portalName = this.config.get('portalName');
    var itemEndpointPart = this.itemType + 's/' + this.itemName;
    var endpointEnding = opts.allLocalizedValues === true ? '/details' : '.xml';
    var endpoint = 'portals/' + portalName + '/' + itemEndpointPart + endpointEnding;

    var params = this._buildParams();
    if (params.length > 0) {
        endpoint += '?' + params;
    }

    return this.apiConsumer.get(endpoint).then(function (response) {
        return response.text();
    }).then(function (xmlString) {
        this.logger.info('Parsing response from [%s]', itemEndpointPart);
        var item = xmlModelParser.parse(xmlString, this.itemType);
        this.logger.info('Response from [%s] parsed successfully', itemEndpointPart);

        return item;
    }.bind(this));
};

/**
 * @private
 */
XmlItemContext.prototype._getItemById = function () {
    var portalName = this.config.get('portalName');
    var uuid = encodeURIComponent(this.itemName);
    var itemTypePlural = this.itemType + 's';
    var itemTypeEndpointPart = itemTypePlural + '?f=uuid(eq)' + uuid;
    var endpoint = 'portals/' + portalName + '/' + itemTypeEndpointPart;

    var params = this._buildParams();
    if (params.length > 0) {
        endpoint += '&' + params;
    }

    return this.apiConsumer.get(endpoint).then(function (response) {
        return response.text();
    }).then(function (xmlString) {
        this.logger.info('Parsing response from [%s]', itemTypeEndpointPart);
        var items = xmlModelParser.parse(xmlString, itemTypePlural);
        this.logger.info('Response from [%s] parsed successfully', itemTypeEndpointPart);

        var item = items[0];
        if (!item) {
            throw new Error('Item of type [' + this.itemType + '] with id [' + this.itemName + '] not found');
        }

        return item;
    }.bind(this));
};

/**
 * @see model/core/item-context/ItemContext#update
 */
XmlItemContext.prototype.update = function (model) {
    var portalName = this.config.get('portalName');
    var endpoint = 'portals/' + portalName + '/' + this.itemType + 's/' + this.itemName;

    // this is a hacky way to fix BACKLOG-14503 issue. Unset parentItemName to let
    // portal server select the correct one. Also it's safer to unset id as it's going to be changed
    // when an instance of an item is created.
    // TODO: fix virtual extensions issue a proper way
    var modelToSave = model;

    if (model.name && model.name.indexOf('~') > 0) {
        modelToSave = Object.create(model);
        // shadow properties from prototype
        modelToSave.parentItemName = undefined;
        modelToSave.extendedItemName = undefined;
        modelToSave.id = undefined;
    }

    var modelXml = xmlGenerator.generate(modelToSave, this.itemType);

    return this.apiConsumer.put(endpoint, modelXml).then(function () {
        this.logger.info('%s named %s updated successfully', this.itemType, this.itemName);
    }.bind(this));
};

/**
 * @see model/core/item-context/ItemContext#revert
 */
XmlItemContext.prototype.revert = function () {
    var portalName = this.config.get('portalName');
    var endpoint = 'portals/' + portalName + '/' + this.itemType + 's/' + this.itemName + '.xml';

    return this.apiConsumer.delete(endpoint);
};

/**
 * @see model/core/item-context/ItemContext#remove
 */
XmlItemContext.prototype.remove = function () {
    var portalName = this.config.get('portalName');
    var endpoint = 'portals/' + portalName + '/' + (this.itemType) + 's/' + this.itemName;

    return this.apiConsumer.delete(endpoint);
};

},{"../core/item-context":149,"../core/rest-api-consumer":152,"../generators/xml-generator":159,"../parsers/xml/model-parser":161}],166:[function(require,module,exports){
'use strict';

var Html5ItemRenderer = require('./strategies/html5-item-renderer');

/**
 * This function constructs a new HTML5 item tree renderer.
 *
 * <p>It uses a a Widget Engine or a Container Engine to render each item in the model tree. Models with children
 * are automatically rendered using the Container Engine and leaf nodes are rendered using the Widget Engine.
 *
 * <p>It uses an <code>itemEngineLocator</code> to determine which Engines to use. You may supply your own locator
 * to provide custom implementations
 *
 * @module cxp-renderer/index
 * @exports {Function} Generates a new instance of a cxp renderer
 * @param {CxpConfig} cxpConfig A CXP configuration object
 * @returns {*|Html5ItemRenderer|exports}
 */
var createRenderer = function(cxpConfig) {

    if(!cxpConfig.get('contextRoot')) {
        cxpConfig.set('contextRoot', '');
    }

    if(!cxpConfig.get('remoteContextRoot')) {
        cxpConfig.set('remoteContextRoot', '');
    }

    return new Html5ItemRenderer(cxpConfig);
};
      
//export
module.exports = {
    createInstance: createRenderer
};

},{"./strategies/html5-item-renderer":168}],167:[function(require,module,exports){
(function (global){
/**
 * Renders a chrome.
 * @module strategies/chrome-renderer
 * @exports {ChromeRenderer} Exports the constructor
 */

'use strict';

var Handlebars          = require('handlebars/dist/handlebars.min');
var HandlebarsHelpers   = require('handlebars-helpers');
var fetch               = require('backbase-widget-engine/src/util/deduping-fetch');

//chromes is only rendered if a widget has one of these view modes
var CHROME_VIEWMODES = [
    'windowed',
    'maximized'
];

// attributes a chrome must have
var dataChromeAttr = 'data-chrome';
var dataWidgetHolderAttr = 'data-widget-holder';

// chrome template cache (shared among all renderer instances)
var chromeTemplatePromises = {};
var handlebarsInstance = Handlebars.create();

// add default helpers for chrome support
Object.keys(HandlebarsHelpers).forEach(function (helperName) {
    handlebarsInstance.registerHelper(helperName, HandlebarsHelpers[helperName]);
});

module.exports = ChromeRenderer;

/**
 * Creates chrome rendering instance.
 * A chrome template loaded by getting its URL from "chromeSrc" configuration option.
 * Widgets and containers with the view modes 'windowed' or 'maximized' will be wrapped with this template.
 * A widget chrome must have "data-chrome" attribute with the value of the widget name. It also must contain
 * an element with 'data-widget-holder' attribute. This is used to identify where
 * to inject the widget into the template.
 * A simple one div chrome is rendered by default.
 *
 * @param {Object} config CXP configuration option
 * @param {Object} [opts] options object
 * @param {Object} [opts.log] bunyan logger
 * @constructor
 */
function ChromeRenderer(config, opts) {
    opts = opts || {};
    var parentLog = opts.log || config.getLogger();

    this._config = config;
    this._log = parentLog.child({childName: 'chrome-renderer'});
}

/**
 * Implements conditional rendering by trying to find a chrome for a corresponding item and rendering a new one
 * if it's not found.
 * @param {HTMLElement} itemRootElement an element where a chrome should be looked for
 * @param {Object} itemModel item model
 * @param {Object} [opts] rendering options object
 * @param {boolean} [opts.useChrome] explicit false value prevents renderer to use template
 * @returns {Promise} a promise is resolved with an object having "chromeElement" and "widgetHolderElement" properties
 */
ChromeRenderer.prototype.getChrome = function(itemRootElement, itemModel, opts) {
    var chromeEl = this._findChromeElement(itemRootElement, itemModel.name);
    var holderEl = this._findWidgetHolderElement(chromeEl);

    return holderEl ?
         Promise.resolve({chromeElement: chromeEl, widgetHolderElement: holderEl}) :
        this._renderChrome(itemRootElement, itemModel, opts);
};

/**
 * Renders chrome
 * @param itemRootElement
 * @param itemModel
 * @param {Object} [opts]
 * @returns {Promise} A successfully resolved promise with either default chrome object or template-based one
 * @private
 */
ChromeRenderer.prototype._renderChrome = function(itemRootElement, itemModel, opts) {
    var chromeEl;
    var holderEl;
    var self = this;

    var useChrome = !opts || opts.useChrome !== false;
    var document = (itemRootElement && itemRootElement.ownerDocument) || global.document;
    var templatePromise = useChrome ? this._getTemplate() : Promise.resolve(null);

    return templatePromise.then(function (template) {
        // CHROME_VIEWMODES.indexOf(itemModel.viewmodes[0]) >= 0 check notes:
        // The first item in the collection of view modes is the current view mode. Subsequent items are supported
        // view modes in order of precedence.
        if(template && itemModel.viewmodes && CHROME_VIEWMODES.indexOf(itemModel.viewmodes[0]) >= 0) {

            // find out whether chrome layout has holder node and if it doesn't, log a warning
            var templateHtml = template(itemModel);
            var tempEl = document.createElement('div');

            tempEl.innerHTML = templateHtml;
            chromeEl = self._findChromeElement(tempEl, itemModel.name);
            holderEl = self._findWidgetHolderElement(chromeEl);

            if (chromeEl) {
                // remove chrome element from tree
                chromeEl.parentNode.removeChild(chromeEl);
            } else {
                self._log.warn('Chrome layout does not have an element with "data-chrome" attribute. ' +
                    'Falling back to blank chrome.');
            }

            if (!holderEl) {
                chromeEl = null;
                self._log.warn('Chrome layout does not have an element with "data-widget-holder" attribute. ' +
                    'Falling back to blank chrome.');
            }
        }

        // if no chrome rendered (for whatever reason), create simple default chrome
        if (!chromeEl) {
            chromeEl = document.createElement('div');
            chromeEl.setAttribute(dataChromeAttr, itemModel.name);
            chromeEl.setAttribute(dataWidgetHolderAttr, '');

            holderEl = chromeEl;
        }

        return {chromeElement: chromeEl, widgetHolderElement: holderEl};
    });
};

/**
 * Downloads and compiles a chrome template. Saves template in a cache that is shared among all renderer instances.
 * @returns {Promise} A successfully resolved promise with either a compiled template or null if there is a failure in
 * getting a template or compiling it.
 * @private
 */
ChromeRenderer.prototype._getTemplate = function() {
    var chromeUrl = this._config.get('chromeSrc');
    var log = this._log;

    if(!chromeUrl) {
        var message = 'No chrome template configured. Widgets with "windowed" or "maximized" view modes will ' +
            'be displayed without chrome.';
        log.warn(message);
        return Promise.resolve(null);
    }

    // replace contextRoot/apiRoot
    var contextRoot = this._config.get('contextRoot');
    var apiRoot = this._config.get('apiRoot');
    var url = chromeUrl.replace(/\$\(contextRoot\)/, contextRoot).replace(/\$\(apiRoot\)/, apiRoot);
    
    var compiledTemplatePromise = chromeTemplatePromises[url];

    if(!compiledTemplatePromise) {
        log.debug('Requesting chrome template from %s', url);
        compiledTemplatePromise = fetch(url).then(function(res) {
            log.debug('Chrome template request resolved. Status: %s', res.status);

            if (res.status === 0 || res.status === 200) {
                return res.text();
            } else {
                throw new Error(res.statusText);
            }
        }).then(function(templateBody) {
            log.trace('Chrome template body\n: %s', templateBody);
            log.debug('Compiling handlebars template instance from %s', url);

            // compile template
            try {
                return handlebarsInstance.compile(templateBody);
            } catch(err) {
                log.error('There was a problem compiling a handlebars template');
                throw err;
            }
        }).catch(function(e) {
            log.error(e);
            delete chromeTemplatePromises[url];

            return null;
        });

        chromeTemplatePromises[url] = compiledTemplatePromise;
    }

    return compiledTemplatePromise;
};

/**
 * Finds chrome element
 * @param {Node} rootNode
 * @param {string} itemName
 * @returns {HTMLElement}
 * @private
 */
ChromeRenderer.prototype._findChromeElement = function(rootNode, itemName) {
    if (!rootNode) {
        return null;
    }

    var selector = '*[' + dataChromeAttr + '="' + (itemName || '') + '"]';
    return rootNode.querySelector(selector);
};

/**
 * Finds widget holder element
 * @param {Node} rootNode
 * @returns {HTMLElement}
 * @private
 */
ChromeRenderer.prototype._findWidgetHolderElement = function(rootNode) {
    if (!rootNode) {
        return null;
    }

    var selector = '*[' + dataWidgetHolderAttr + ']';
    return rootNode.hasAttribute(dataWidgetHolderAttr) ? rootNode : rootNode.querySelector(selector);
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"backbase-widget-engine/src/util/deduping-fetch":72,"handlebars-helpers":81,"handlebars/dist/handlebars.min":82}],168:[function(require,module,exports){
/**
 * Renders a CXP model tree within one DOM
 * @module strategies/html5-item-renderer
 * @exports {Html5ItemRenderer} Exports the constructor
 */

'use strict';

var WidgetEngine      = require('backbase-widget-engine');
var ExtPromise        = require('promise-extensions')(Promise);
var bunyan            = require('browser-bunyan');
var util              = require('../../util');
var ChromeRenderer    = require('./chrome-renderer');

var LinkDatasourceResolver = require('../../datasource/link-datasource-resolver');
var PortalDatasourceResolver = require('../../datasource/portal-datasource-resolver');
var ContentDatasourceResolver = require('../../datasource/contentrendered-datasource-resolver');
var NavigationDatasourceResolver = require('../../datasource/navigation-datasource-resolver');
var BreadcrumbDatasourceResolver = require('../../datasource/breadcrumb-datasource-resolver');

/**
 * <p>Creates an Html5ItemRenderer instance
 *
 * @constructor
 * @param {Object} cxpConfig.chromeSrc A URL to a Handlebars template for wrapping items with chrome.
 *
 * @example
 * &lt;div class="panel panel-default"&gt;
 *   &lt;div class="pull-right"&gt;
 *   {{#allowEdit}}
 *     &lt;button type="button" class="btn btn-default btn-xs" title="Settings" data-cxp-settings="{{id}}"&gt;
 *       &lt;span class="glyphicon glyphicon-wrench"&gt;&lt;/span&gt;
 *     &lt;/button&gt;
 *   {{/allowEdit}}
 *   &lt;/div&gt;
 *   &lt;div class="panel-heading"&gt;{{name}}&lt;/div&gt;
 *   &lt;div class="panel-body" data-widget-holder&gt;&lt;/div&gt;
 * &lt;/div&gt;
 */
var Html5ItemRenderer = function(cxpConfig) {

    this.config = cxpConfig;

    this.log = cxpConfig.getLogger().child({
        childName: 'html5-item-renderer'
    });

    this.plugins = [];
    this.features = [];
    this._widgetEngines = [];

    this._chromeRenderer = new ChromeRenderer(cxpConfig, {log: this.log});

    this._datasourceResolvers = [
        LinkDatasourceResolver.getInstance,
        PortalDatasourceResolver.getInstance,
        ContentDatasourceResolver.getInstance,
        NavigationDatasourceResolver.getInstance,
        BreadcrumbDatasourceResolver.getInstance
    ];
};

module.exports = Html5ItemRenderer;

/**
 * Starts the rendering process
 * @param {(Object | Object[])} model - A model tree or a list of models to render
 * @param {Node} rootNode - A DOM node to start rendering within
 * @param {Object} [opts] Additional rendering options
 * @param {boolean} opts.useChrome Option which will disable use of a custom chrome template provide in the
 * configuration object. Defaults to true.
 * @param {string} opts.contentName If specified renderer tries to use alternative content file which matches the name
 * @returns {Promise} Resolves when all items are rendered
 */
Html5ItemRenderer.prototype.start = function(model, rootNode, opts) {
    if (!model || model.length === 0) {
        return ExtPromise.resolve();
    }

    opts = opts || {};

    var log = this.log;
    var self = this;

    log.info('Starting item tree rendering...');
    if(log.level() <= bunyan.TRACE) {
        log.trace('Item tree model is this:\n %s', JSON.stringify(model, null, '\t'));
    }

    var startTime = Date.now();
    var modelList = Array.isArray(model) ? model : [model];

    // override content if contentName option exists
    // don't override it if there is more than one model
    if (modelList.length === 1 && opts.contentName) {
        var modelCopy = util.cloneDeep(modelList[0]);
        modelCopy.content = modelCopy.altContent[opts.contentName];

        if (typeof modelCopy.content === 'undefined') {
            var error = new Error('Given content name "' + opts.contentName + '" not found for item named "' + model.name + '"');
            return ExtPromise.reject(error);
        }

        modelList = [modelCopy];
    }

    return this._render(modelList, rootNode, opts).then(function(treeRenderInspections) {
        log.info('Item tree rendering complete.');

        var time = Date.now() - startTime;
        var result = {
            time: time,
            failures: []
        };

        //convert promise inspections into nice result object
        var inspections = self._flattenArray(treeRenderInspections);
        result = inspections.reduce(function(result, inspection) {
            if(inspection.isRejected()) {
                var cause = (typeof inspection.reason.cause === 'function' && inspection.reason.cause()) ||
                    inspection.reason;

                result.failures.push(cause);
            }
            return result;
        }, result);

        var errCount = result.failures.length;
        if(errCount > 0) {
            log.warn('%s/%s items failed to load.', errCount, inspections.length);
        }

        //if every item failed to render, it's bad! Throw an error
        if(errCount === inspections.length) {
            var err = new Error('All items in a rendering tree failed to render');
            err.result = result;
            throw err;
        }

        return result;
    });
};

/**
 * Adds a widget feature to all items being rendered
 * @method
 * @param {Object} feature
 */
Html5ItemRenderer.prototype.addFeature = function(feature) {
    if(typeof feature === 'object') {
        this.features.push(feature);
    }
    return this;
};

/**
 * Adds a widget plugin to all items being rendered
 * @method
 * @param {Object} plugin
 */
Html5ItemRenderer.prototype.addPlugin = function(plugin) {

    if(typeof plugin === 'object') {
        this.plugins.push(plugin);
    }

    return this;
};

/**
 * Renders an item model
 * @private
 * @param itemModel
 * @param domNode
 * @returns {Promise}
 */
Html5ItemRenderer.prototype._renderItem = function (itemModel, domNode) {
    var self = this; // jshint ignore:line
    var config = this.config;

    var widgetPath = '';
    //strip file from widget src to get path
    if (itemModel.content && itemModel.content.src) {
        widgetPath = itemModel.content.src.replace(/\/[^\/]+$/, '');
    //TODO: This logic should be move to model parsing
    } else if (itemModel.content && itemModel.content.config) {
        widgetPath = itemModel.content.config.replace(/\/[^\/]+$/, '');
    }
    //also replace contextRoot & apiRoot placeholder
    widgetPath = widgetPath.replace(/\$\(contextRoot\)/, config.get('contextRoot'))
        .replace(/\$\(apiRoot\)/, config.get('apiRoot'));

    //create a widget engine
    var engine = new WidgetEngine({
        log: this.log
    });

    var storageFactory = config.get('storageFactory') ;
    engine.init({
        widgetPath: widgetPath,
        widgetEl: domNode,
        initialModel: itemModel,
        storage: storageFactory ? storageFactory.get(itemModel) : null,
        configVars: config.toSerializableObject()
    });

    this._datasourceResolvers.forEach(function (resolver) {
        engine.addDatasourceResolver(resolver);
    });

    //add user defined plugins
    this.plugins.forEach(function (plugin) {
        engine.addPlugin(plugin);
    });

    //add user defined features
    this.features.forEach(function (feature) {
        engine.addFeature(feature);
    });

    if(config.enabled('compat')) {
        engine.enableCompatibility();
    }

    var engineResult = engine.start(itemModel, domNode);

    //the delay here seems to fix an issue with Safari in iOS where calling DOMParser().parseFromString()
    //a few times in quick succession causes it to return undefined (a browser bug)
    //see: https://backbase.atlassian.net/browse/BACKLOG-9708
    return engineResult.delay(0).then(function (result) {
        self._widgetEngines.push(engine);
        return result;
    });
};

/**
 * Destroy all the widgets including dom and inline scripts
 * created during rendering widget
 */
Html5ItemRenderer.prototype.destroyAllItems = function () {
    this._widgetEngines.forEach(function (engine) {
        engine.destroy();
    });

    this._widgetEngines = [];
};

/**
 * Destroy the given widget and it's resources
 *
 * @param {String} itemId Item id
 */
Html5ItemRenderer.prototype.destroyItem = function (itemId) {
    var engine = this._widgetEngines.filter(function (engine) {
        return engine.widgetEngine.config.initialModel.id === itemId;
    })[0];

    if (!engine) {
        return;
    }

    engine.destroy();

    var engineIndex = this._widgetEngines.indexOf(engine);
    this._widgetEngines.splice(engineIndex, 1);

    return this;
};

/**
 * Re renders given item.
 *
 * @param {String} oldItemId item id needed for destroying item
 * @param {String} oldItemName item name needed for calculating items position in dom
 * @param {Object} itemModel item model to be rendered
 */
Html5ItemRenderer.prototype.rerenderItem = function (oldItemId, oldItemName, itemModel) {
    var placeholder = document.createElement('div');
    var itemChrome = document.querySelector('[data-chrome="' + oldItemName + '"]');
    itemChrome.parentNode.insertBefore(placeholder, itemChrome);

    this.destroyItem(oldItemId);
    return this.start(itemModel, placeholder).then(function () {
        var newChrome = placeholder.firstElementChild;

        placeholder.parentNode.insertBefore(newChrome, placeholder);
        placeholder.parentNode.removeChild(placeholder);
    });
};

/**
 * Renders items and their trees
 * @param {Array} modelList Array of item models
 * @param {HTMLElement} rootNode An element where all items should be rendered
 * @param {Object} opts rendering options
 * @returns {Promise} Promise resolved with inspection options when all items and their trees are rendered
 * @private
 */
Html5ItemRenderer.prototype._render = function(modelList, rootNode, opts) {
    var self = this;
    var chromePromises = modelList.map(function (itemModel) {
        return self._chromeRenderer.getChrome(rootNode, itemModel, opts);
    });

    return Promise.all(chromePromises).then(function (chromeArr) {
        return chromeArr.map(function (chrome, i) {
            return {
                itemModel: modelList[i],
                chrome: chrome,
                parentEl: rootNode
            };
        });
    }).then(function (itemChromeMapList) {
        var renderResults = [];

        itemChromeMapList.forEach(function (itemChromeMap, idx, array) {
            // insert chrome node into DOM (if it's not) in correct order
            self._attachChrome(itemChromeMap, idx, array);

            // render item
            renderResults.push(self._renderItem(itemChromeMap.itemModel, itemChromeMap.chrome.widgetHolderElement));
        });

        return ExtPromise.settleAll(renderResults);
    }).then(function (inspections) {
        // render children of successfully rendered items
        var childenRenderResults = [];

        inspections.filter(function (inspection) {
            return inspection.isFulfilled();
        }).map(function (fulfilled) {
            return fulfilled.value;
        }).forEach(function (itemRenderResult) {
            var areaNodes = itemRenderResult.areaNodes;

            if (areaNodes) {
                // find corresponding item model
                var itemModel = modelList.filter(function (model) {
                    return model.id === itemRenderResult.id;
                })[0];

                Object.keys(areaNodes).forEach(function (area) {
                    //find child model(s) with matching area
                    var childrenModels = itemModel.children || [];
                    var childrenForArea = childrenModels.filter(function (item) {

                        //need to check if preferences area an array for MBaaS compatibility
                        var currentAreaPref;
                        if(Array.isArray(item.preferences)) {
                            currentAreaPref = item.preferences.filter(function(pref) {
                                return pref.name === 'area';
                            })[0];
                        } else {
                            currentAreaPref = item.preferences.area;
                        }
                        return currentAreaPref && currentAreaPref.value === area;
                    });

                    self.log.info('Rendering %s child item(s) for area [%s] of item [%s]...',
                        childrenForArea.length, area, itemRenderResult.id);

                    //loop through children for this area and render
                    var areaEl = areaNodes[area];

                    childenRenderResults.push(self._render(childrenForArea, areaEl, opts));
                });
            }
        });

        return Promise.all(inspections.concat(childenRenderResults));
    });
};

/**
 * Inserts a chrome element in a proper place. Crucial for conditional rendering.
 * @param {Object} itemChromeMap Holds item model and its corresponding chrome
 * @param {Number} idx Index of an item in a collection of items
 * @param {Array} array Collection of item-chrome map objects
 * @private
 */
Html5ItemRenderer.prototype._attachChrome = function(itemChromeMap, idx, array) {
    var chromeEl = itemChromeMap.chrome.chromeElement;
    var hostEl = itemChromeMap.parentEl;
    var refNode;

    // insert chrome nodes in DOM
    if (!chromeEl.parentNode) {
        if (idx === 0) {
            refNode = hostEl.firstElementChild;

        } else {
            var prevChromeNode = array[idx - 1].chrome.chromeElement;
            refNode = prevChromeNode.nextElementSibling;
        }

        hostEl.insertBefore(chromeEl, refNode);
    }
};

/**
 * Flattens nested arrays
 * @param array
 * @returns {Array}
 * @private
 */
Html5ItemRenderer.prototype._flattenArray = function flatten(array) {
    return array.reduce(function (flattened, item) {
        return flattened.concat(Array.isArray(item) ? flatten(item) : item);
    }, []);
};

},{"../../datasource/breadcrumb-datasource-resolver":142,"../../datasource/contentrendered-datasource-resolver":143,"../../datasource/link-datasource-resolver":144,"../../datasource/navigation-datasource-resolver":145,"../../datasource/portal-datasource-resolver":146,"../../util":169,"./chrome-renderer":167,"backbase-widget-engine":41,"browser-bunyan":80,"promise-extensions":139}],169:[function(require,module,exports){
'use strict';

/**
 * Utils modules expose functional helpers etc.
 * @module Utils
 * @export isObject
 * @export merge
 * @export cloneDeep
 */
module.exports = {
    isObject: require('lodash/lang/isObject'),
    merge: require('lodash/object/merge'),
    cloneDeep: require('lodash/lang/cloneDeep')
};
},{"lodash/lang/cloneDeep":124,"lodash/lang/isObject":129,"lodash/object/merge":136}],170:[function(require,module,exports){
/**
 * Re-exports deduping fetch to make it available for a portal client
 * @module util/deduping-fetch
 */

'use strict';

module.exports = require('backbase-widget-engine/src/util/deduping-fetch');

},{"backbase-widget-engine/src/util/deduping-fetch":72}],171:[function(require,module,exports){
/**
* Detect Element Resize
*
* https://github.com/sdecima/javascript-detect-element-resize
* Sebastian Decima
*
* version: 0.5.3
**/

(function () {
	var attachEvent = document.attachEvent,
		stylesCreated = false;
	
	if (!attachEvent) {
		var requestFrame = (function(){
			var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
								function(fn){ return window.setTimeout(fn, 20); };
			return function(fn){ return raf(fn); };
		})();
		
		var cancelFrame = (function(){
			var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
								   window.clearTimeout;
		  return function(id){ return cancel(id); };
		})();

		function resetTriggers(element){
			var triggers = element.__resizeTriggers__,
				expand = triggers.firstElementChild,
				contract = triggers.lastElementChild,
				expandChild = expand.firstElementChild;
			contract.scrollLeft = contract.scrollWidth;
			contract.scrollTop = contract.scrollHeight;
			expandChild.style.width = expand.offsetWidth + 1 + 'px';
			expandChild.style.height = expand.offsetHeight + 1 + 'px';
			expand.scrollLeft = expand.scrollWidth;
			expand.scrollTop = expand.scrollHeight;
		};

		function checkTriggers(element){
			return element.offsetWidth != element.__resizeLast__.width ||
						 element.offsetHeight != element.__resizeLast__.height;
		}
		
		function scrollListener(e){
			var element = this;
			resetTriggers(this);
			if (this.__resizeRAF__) cancelFrame(this.__resizeRAF__);
			this.__resizeRAF__ = requestFrame(function(){
				if (checkTriggers(element)) {
					element.__resizeLast__.width = element.offsetWidth;
					element.__resizeLast__.height = element.offsetHeight;
					element.__resizeListeners__.forEach(function(fn){
						fn.call(element, e);
					});
				}
			});
		};
		
		/* Detect CSS Animations support to detect element display/re-attach */
		var animation = false,
			animationstring = 'animation',
			keyframeprefix = '',
			animationstartevent = 'animationstart',
			domPrefixes = 'Webkit Moz O ms'.split(' '),
			startEvents = 'webkitAnimationStart animationstart oAnimationStart MSAnimationStart'.split(' '),
			pfx  = '';
		{
			var elm = document.createElement('fakeelement');
			if( elm.style.animationName !== undefined ) { animation = true; }    
			
			if( animation === false ) {
				for( var i = 0; i < domPrefixes.length; i++ ) {
					if( elm.style[ domPrefixes[i] + 'AnimationName' ] !== undefined ) {
						pfx = domPrefixes[ i ];
						animationstring = pfx + 'Animation';
						keyframeprefix = '-' + pfx.toLowerCase() + '-';
						animationstartevent = startEvents[ i ];
						animation = true;
						break;
					}
				}
			}
		}
		
		var animationName = 'resizeanim';
		var animationKeyframes = '@' + keyframeprefix + 'keyframes ' + animationName + ' { from { opacity: 0; } to { opacity: 0; } } ';
		var animationStyle = keyframeprefix + 'animation: 1ms ' + animationName + '; ';
	}
	
	function createStyles() {
		if (!stylesCreated) {
			//opacity:0 works around a chrome bug https://code.google.com/p/chromium/issues/detail?id=286360
			var css = (animationKeyframes ? animationKeyframes : '') +
					'.resize-triggers { ' + (animationStyle ? animationStyle : '') + 'visibility: hidden; opacity: 0; } ' +
					'.resize-triggers, .resize-triggers > div, .contract-trigger:before { content: \" \"; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; } .resize-triggers > div { background: #eee; overflow: auto; } .contract-trigger:before { width: 200%; height: 200%; }',
				head = document.head || document.getElementsByTagName('head')[0],
				style = document.createElement('style');
			
			style.type = 'text/css';
			if (style.styleSheet) {
				style.styleSheet.cssText = css;
			} else {
				style.appendChild(document.createTextNode(css));
			}

			head.appendChild(style);
			stylesCreated = true;
		}
	}
	
	window.addResizeListener = function(element, fn){
		if (attachEvent) element.attachEvent('onresize', fn);
		else {
			if (!element.__resizeTriggers__) {
				if (getComputedStyle(element).position == 'static') element.style.position = 'relative';
				createStyles();
				element.__resizeLast__ = {};
				element.__resizeListeners__ = [];
				(element.__resizeTriggers__ = document.createElement('div')).className = 'resize-triggers';
				element.__resizeTriggers__.innerHTML = '<div class="expand-trigger"><div></div></div>' +
																						'<div class="contract-trigger"></div>';
				element.appendChild(element.__resizeTriggers__);
				resetTriggers(element);
				element.addEventListener('scroll', scrollListener, true);
				
				/* Listen for a css animation to detect element display/re-attach */
				animationstartevent && element.__resizeTriggers__.addEventListener(animationstartevent, function(e) {
					if(e.animationName == animationName)
						resetTriggers(element);
				});
			}
			element.__resizeListeners__.push(fn);
		}
	};
	
	window.removeResizeListener = function(element, fn){
		if (attachEvent) element.detachEvent('onresize', fn);
		else {
			element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
			if (!element.__resizeListeners__.length) {
					element.removeEventListener('scroll', scrollListener);
					element.__resizeTriggers__ = !element.removeChild(element.__resizeTriggers__);
			}
		}
	}
})();
},{}],172:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],173:[function(require,module,exports){
(function (global){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],174:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],175:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],176:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":174,"./encode":175}],177:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var punycode = require('punycode');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a puny coded representation of "domain".
      // It only converts the part of the domain name that
      // has non ASCII characters. I.e. it dosent matter if
      // you call it with a domain that already is in ASCII.
      var domainArray = this.hostname.split('.');
      var newOut = [];
      for (var i = 0; i < domainArray.length; ++i) {
        var s = domainArray[i];
        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
            'xn--' + punycode.encode(s) : s);
      }
      this.hostname = newOut.join('.');
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  Object.keys(this).forEach(function(k) {
    result[k] = this[k];
  }, this);

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    Object.keys(relative).forEach(function(k) {
      if (k !== 'protocol')
        result[k] = relative[k];
    });

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      Object.keys(relative).forEach(function(k) {
        result[k] = relative[k];
      });
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!isNull(result.pathname) || !isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host) && (last === '.' || last === '..') ||
      last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last == '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especialy happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!isNull(result.pathname) || !isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

function isString(arg) {
  return typeof arg === "string";
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isNull(arg) {
  return arg === null;
}
function isNullOrUndefined(arg) {
  return  arg == null;
}

},{"punycode":173,"querystring":176}],178:[function(require,module,exports){
/*global document, DOMParser*/
// inspired by https://gist.github.com/1129031

'use strict';

(function(DOMParser) {
    var proto = DOMParser.prototype,
        nativeParse = proto.parseFromString;

    proto.parseFromString = function(markup, type) {
        if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
            var doc = document.implementation.createHTMLDocument('');

            if (markup.toLowerCase().indexOf('<!doctype') > -1) {
                doc.documentElement.innerHTML = markup;
            } else {
                doc.body.innerHTML = markup;
            }
            return doc;
        } else {
            return nativeParse.apply(this, arguments);
        }
    };
}(DOMParser));

window.system_scroll = window.scroll;
window.scroll = function(x, y) {
    window.cxp.mobile.scrollTo('' + x, '' + y);
    window.system_scroll(x, y);
};

},{}],179:[function(require,module,exports){
'use strict';

/**
 * Provides operations for publishing and subscribing to message channels.
 * @class
 */
window.b$.module('gadgets.pubsub', function() {

    var Class = window.b$.Class;

    /**
     * Class for the event bus.
     * @class
     * @private
     */
    var Channel = Class.extend(function() {
        this.callbacks = [];
    },{

        //queue of message
        queue: [],

        /**
         * Subscribes the callback to the channel.
         * @private
         */
        subscribe: function(callback) {
            this.callbacks.push(callback);
        },

        /**
         * Unsubscribes the callback from the channel.
         * @private
         */
        unsubscribe: function(callback) {
            if(!callback) {
                this.callbacks = [];
            }
            else {
                this.callbacks = this.callbacks.filter(function(fChannelCallback) {
                    return fChannelCallback !== callback;
                });
            }
        },

        /**
         * Publishes message to the channel.
         * @private
         */
        publish: function(message, flush) {
            if(flush) {
                this.flush();
            }

            this.callbacks.forEach(function(callback) {
                callback(message);
            });
        },

        /**
         * Clears the queue
         */
        flush: function() {
            this.queue = [];
        }
    });

    /**
     * Class for the event bus.
     * @class
     * @private
     */
    var EventBus = Class.extend(function() {
        this.channels = {};
    },{

        /**
         * Subscribes the callback to the channel.
         * @private
         * @method
         */
        subscribe: function(channelName, callback) {
            if (!this.channels[channelName]) {
                this.channels[channelName] = new Channel();
            }

            this.channels[channelName].subscribe(callback);

            window.cxp.mobile.subscribe(channelName);
        },

        /**
         * Unsubscribes the callback from the channel.
         * @method
         * @private
         */
        unsubscribe: function(channelName, fCallback) {

            if (this.channels[channelName]) {
                this.channels[channelName].unsubscribe(fCallback);

                window.cxp.mobile.unsubscribe(channelName);
            }
        },

        /**
         * Publishes message to the channel.
         * @private
         * @method
         */
        publish: function(channelName, oMessage, flush, eventType) {
            if (this.channels[channelName]) {
                this.channels[channelName].publish(oMessage, flush);
            }
            oMessage = oMessage || {};
            eventType = eventType || '';
            if(eventType !== 'SYSTEM') {
                window.cxp.mobile.publish(channelName, JSON.stringify(oMessage), eventType);
            }
        },

        /**
         * Flushes the message on a channel
         * @param channelName
         */
        flush: function(channelName) {
            if (this.channels[channelName]) {
                this.channels[channelName].flush();
            }
        }
    });

    var mainBus = new EventBus();

    /**
     * Publishes a string-type message to a channel.
     *
     * @param {String} channelName The name of the channel
     * @param {String} message The message to publish
     */
    function publish(channelName, message, flush, eventType) {
        if(typeof flush !== 'boolean') {
            flush = true;
        }
        mainBus.publish(channelName, message, flush, eventType);
    }

    /**
     * Subscribes a widget to a message channel.
     *
     * @param {String} channelName The name of the channel
     * @param {Function} callback A function that will be called with the channel messages
     */
    function subscribe(channelName, callback) {
        mainBus.subscribe(channelName, callback);
    }

    /**
     * Unsubscribes the widget from a message channel.
     *
     * @param {String} channelName The name of the channel
     */
    function unsubscribe(channelName, callback) {
        mainBus.unsubscribe(channelName, callback);
    }

    function flush(channelName) {
        mainBus.flush(channelName);
    }

    // channel support
    function channel(channelPrefix) {
        function getEventKey(eventName) {
            return '[{'+channelPrefix+'}].'+eventName;
        }

        var pubsubImpl = this; // jshint ignore:line

        return {
            publish: function(eventName, message, flush, eventType) {
                pubsubImpl.publish(getEventKey(eventName), message, flush, eventType);
            },
            subscribe: function(eventName, callback) {
                pubsubImpl.subscribe(getEventKey(eventName), callback);
            },
            unsubscribe: function(eventName, callback) {
                pubsubImpl.unsubscribe(getEventKey(eventName), callback);
            },
            flush: function(eventName) {
                pubsubImpl.flush(getEventKey(eventName));
            }
        };
    }

    this.name = 'pubsub'; // feature name
    this.publish = publish;
    this.subscribe = subscribe;
    this.unsubscribe = unsubscribe;
    this.flush = flush;
    this.channel = channel;
});

},{}],180:[function(require,module,exports){
'use strict';

//set up some global namespaces
window.cxp = window.cxp || {};
window.mobile = window.mobile || {};
window.cxp.mobile = window.mobile; //mobile references backbase.mobile because native android can only call one object deep

//this is the public interface to start rendering
window.cxp.mobile.render = function(widgetRoot, localContextRoot, remoteContextRoot, apiRoot, portalModel, plugins,
                                    logLevel, portalName) {

    require('./common/dom-parser-polyfill');
    require('javascript-detect-element-resize');
    require('./common/pubsub');

    //simple factory to get the desired renderer for the current platform
    var Renderer;
    var isSafariOrUiWebview = /(iPhone|iPod|iPad).*AppleWebKit/i.test(navigator.userAgent);
    if(isSafariOrUiWebview) {
        console.info('Portal Client Mobile is rendering in iOS mode');
        var iosBridge = require('./platforms/ios/ios-bridge');
        iosBridge.enable();
        Renderer = require('./platforms/ios/ios-page-renderer');
    } else {
        console.info('Portal client mobile is rendering in Android mode');
        Renderer = require('./platforms/android/android-page-renderer');
    }

    window.cxp.mobile.plugins = plugins;
    // filling the gap
    portalModel.contextItemName = portalName;

    //kick off rendering
    var renderer = new Renderer();
    renderer.render(document.getElementById(widgetRoot), portalModel, window.gadgets.pubsub, {
        portalName: portalName,
        localContextRoot: localContextRoot,
        remoteContextRoot: remoteContextRoot,
        apiRoot: apiRoot,
        logLevel: logLevel
    });
};

//legacy interface
window.renderWidget = window.cxp.mobile.render;

},{"./common/dom-parser-polyfill":178,"./common/pubsub":179,"./platforms/android/android-page-renderer":184,"./platforms/ios/ios-bridge":185,"./platforms/ios/ios-page-renderer":186,"javascript-detect-element-resize":171}],181:[function(require,module,exports){
'use strict';

/**
 * Logs records to a buffer until they are flushed to another log stream
 * @param size
 * @constructor
 */
var BufferedLogStream = function(size) {

    this.size = size || 1000;
    this.buffer = [];

    this.decoratedStreams = [];
};

/**
 * Flushing the log will write records to streams added with this method
 * @param stream
 */
BufferedLogStream.prototype.decorateStream = function(stream) {
    this.decoratedStreams.push(stream);
};

/**
 * Write a record to the buffer
 * @param rec
 */
BufferedLogStream.prototype.write = function(rec) {

    if (this.buffer.length >= this.size) {
        this.buffer.shift();
    }

    this.buffer.push(rec);
};

/**
 * Flushes the buffer to a stream
 */
/* jshint ignore:start */
BufferedLogStream.prototype.flush = function() {
    var rec;
    while (rec = this.buffer.shift()) {
        this.decoratedStreams.forEach(function(stream) {
            stream.write(rec);
        });
    }
};
/* jshint ignore:end */

/**
 * Clears the buffer
 */
BufferedLogStream.prototype.clear = function() {
    this.buffer = [];
};

module.exports = BufferedLogStream;
},{}],182:[function(require,module,exports){
'use strict';

/**
 * Logs messages to the console without any pretty formatting.
 * @param opts
 * @constructor
 */
function ConsolePlainStream(opts) {
    opts = opts || {};
    this.printLevel = !!opts.printLevel;
    this.printTimestamp = !!opts.printTimestamp;
}

/**
 * Write a Bunyan log record
 * @param rec
 */
ConsolePlainStream.prototype.write = function(rec) {

    var loggerName = rec.childName ? rec.name + '/' + rec.childName : rec.name;

    var logMethod;
    if (rec.level < 30) {
        logMethod = 'log';
    } else if (rec.level < 40) {
        logMethod = 'info';
    } else if (rec.level < 50) {
        logMethod = 'warn';
    } else {
        logMethod = 'error';
    }

    function padZeros(number, len) {
        return Array((len + 1) - (number + '').length).join('0') + number;
    }

    function getTimestamp() {
        return '[' +
            padZeros(rec.time.getHours(), 2) + ':' +
            padZeros(rec.time.getMinutes(), 2) + ':' +
            padZeros(rec.time.getSeconds(), 2) + ':' +
            padZeros(rec.time.getMilliseconds(), 4) + ']';
    }
    
    var timestamp = this.printTimestamp ? (getTimestamp() + ' ') : '';
    var level = this.printLevel ? (rec.levelName.toUpperCase() + ': ') : '';
    console[logMethod](timestamp + level + loggerName + ': ' + rec.msg);
};

module.exports = ConsolePlainStream;
},{}],183:[function(require,module,exports){
(function (global){
'use strict';

var document = global.document; // jshint ignore:line

/**
 * Write log messages by create iframes whose src attribute contains the log info. This creates network 
 * request which can be intercepted by the native side.
 * @constructor
 */
var IFrameBridgeLogStream = function() {
};

/**
 * Write a bunyan log record
 * @param rec
 */
IFrameBridgeLogStream.prototype.write = function(rec) {
    var iframe = document.createElement('IFRAME');
    iframe.setAttribute('src', 'log://?type=' + rec.levelName + '&msg=' + rec.msg + ' (' + rec.time + ')');
    document.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
    iframe = null;   
};

module.exports = IFrameBridgeLogStream;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],184:[function(require,module,exports){
'use strict';

var PageRenderer = require('../../render/page-renderer');
var ConsolePlainLogStream = require('../../logging/console-plain-log-stream');

/**
 * Android Page Renderer
 * @constructor
 */
var AndroidPageRenderer = function() {
    PageRenderer.call(this);
};

//
AndroidPageRenderer.prototype = Object.create(PageRenderer.prototype);

AndroidPageRenderer.prototype._createLogStreams = function(logLevel) {

    return [{
        level: logLevel,
        stream: new ConsolePlainLogStream()
    }];
};

AndroidPageRenderer.prototype._renderForPlatform = function (widgetModel, renderer, rootEl) {

    // Page only can be rendered by passing it's children.
    // Page object can't contain features property, thus this check
    // This check is unstable. We should update MBaaS to include a type on items instead
    var model = widgetModel.features ? widgetModel : widgetModel.children;

    renderer.start(model, rootEl).then(function(details) {

        var message = 'Item tree rendered in ' + details.time + 'ms',
            resizeElement = document.getElementsByTagName('html')[0], //the html could contain paddings/margins
            resizeCallback = function() {
                window.cxp.mobile.resize(resizeElement.scrollHeight);
            };
        window.addResizeListener(resizeElement, resizeCallback);
        console.log(message);
        window.cxp.mobile.itemLoaded();
    }).catch(function(err) {
        console.log(err);
    });
};

module.exports = AndroidPageRenderer;

},{"../../logging/console-plain-log-stream":182,"../../render/page-renderer":190}],185:[function(require,module,exports){
(function (global){
'use strict';

var window = global.window;  // jshint ignore:line
var document = global.document; // jshint ignore:line

module.exports = {
    enable: function () {

        //force XMLHttpRequests to include a request header
        if(window.XMLHttpRequest) {
            (function(__send) {
                XMLHttpRequest.prototype.send = function(data) {
                    this.setRequestHeader('bb.nsurlrequest.webview', 'true');
                    __send.call(this, data);
                };
            })(XMLHttpRequest.prototype.send);
        }

        function encodeURIExtras(str){
            return encodeURIComponent(str)
                .replace(/[!()*]/g,
                    function(c) { return '%' + c.charCodeAt(0).toString(16);}
                )
                .replace(/[']/g,
                    function(c){ return '\\\''; }
                );
        }

        function addIframe(src) {
            var iframe = document.createElement('IFRAME');
            iframe.setAttribute('src', src);
            document.documentElement.appendChild(iframe);
            iframe.parentNode.removeChild(iframe);
            iframe = null;
        }

        function loaded(time) {
            addIframe('bb-loaded://?time=' + time);
        }

        function reload() {
            addIframe('bb-reload://');
        }

        function resizeTo(width, height) {
            addIframe('bb-resize://?w=' + width + '&h=' + height);
        }

        function scrollTo(x, y) {
            addIframe('bb-scroll://?x=' + x + '&y=' + y);
        }

        function publish(event, payload, eventType) {
            addIframe('bb-publish://?event=' + encodeURIExtras(event) + '&type=' + encodeURIExtras(
                    eventType) + '&payload=' + encodeURIExtras(payload));
        }

        function subscribe(event) {
            addIframe('bb-subscribe://?event=' + encodeURIExtras(event));
        }

        function unsubscribe(event) {
            addIframe('bb-unsubscribe://?event=' + encodeURIExtras(event));
        }

        function executePlugin() {
            if (arguments.length === 0) {
                return;
            }
            var args = [];
            Array.prototype.push.apply(args, arguments);

            var plugin = args.shift();
            var method = args.shift();
            var params = args;
            for (var i = 0; i < params.length; i++) {
                params[i] = encodeURIExtras(params[i]);
            }

            addIframe('bb-plugin://?plugin=' + encodeURIExtras(plugin) + '&method=' +
                encodeURIExtras(method) + '&params=' + params.join('&params='));
        }


        function callPlugin(pluginName, methodName, args, resolve, reject) {
            var _callbackId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, // jshint ignore:line
                    v = c == 'x' ? r : (r & 0x3 | 0x8); // jshint ignore:line
                return v.toString(16);
            });
            var eventName = [pluginName, methodName, _callbackId].join('.');
            var _unsubscribe = function () {
                window.gadgets.pubsub.unsubscribe('plugin.success.' + eventName, _success);
                window.gadgets.pubsub.unsubscribe('plugin.error.' + eventName, _error);
            };
            var _success = function (response) {
                if (!response.keep) {
                    _unsubscribe();
                }
                if (resolve) {
                    resolve(response.data);
                }
            };
            var _error = function (response) {
                if (!response.keep) {
                    _unsubscribe();
                }
                if (reject) {
                    reject(response.data);
                }
            };

            // convert object into JSON.stringify
            for (var i = 0; i < args.length; i++) {
                var arg = args[i];
                if (typeof arg === 'object') {
                    args[i] = JSON.stringify(arg);
                }
            }

            window.gadgets.pubsub.subscribe('plugin.success.' + eventName, _success);
            window.gadgets.pubsub.subscribe('plugin.error.' + eventName, _error);

            executePlugin.apply(window.cxp.mobile, [pluginName, methodName, _callbackId].concat(args));
            return _callbackId;
        }

        window.cxp.mobile = {
            loaded: loaded,
            reload: reload,
            resizeTo: resizeTo,
            scrollTo: scrollTo,
            publish: publish,
            subscribe: subscribe,
            unsubscribe: unsubscribe,
            callPlugin: callPlugin
        };
    }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],186:[function(require,module,exports){
'use strict';

var PageRenderer = require('../../render/page-renderer');
var ConsolePlainLogStream = require('../../logging/console-plain-log-stream');
var IFrameBridgeLogStream = require('../../logging/iframe-bridge-log-stream');
var BufferedLogStream = require('../../logging/buffered-log-stream');

/**
 * IOS Page Renderer
 * @constructor
 */
var IOSPageRenderer = function() {
    PageRenderer.call(this);
};

//extend PageRenderer
IOSPageRenderer.prototype = Object.create(PageRenderer.prototype);

/**
 * Creates IOS specific log streams
 * @param logLevel
 * @return {*[]}
 * @private
 */
IOSPageRenderer.prototype._createLogStreams = function(logLevel) {

    var consoleStream = new ConsolePlainLogStream({
        printTimestamp: true,
        printLevel: true
    });

    //buffered log stream allows a developer to replay the log by running bufferedLogStream.flush()
    var bufferedLogStream = new BufferedLogStream();
    bufferedLogStream.decorateStream(consoleStream);
    window.bufferedLogStream = bufferedLogStream; //expose globally

    //iframe log stream for logging to native land
    var iframeBridgeLogStream = new IFrameBridgeLogStream();

    //set up log streams
    return [{
        level: logLevel,
        stream: iframeBridgeLogStream
    }, {
        level: logLevel,
        stream: consoleStream
    }, {
        level: logLevel,
        stream: bufferedLogStream
    }];
};

/**
 * Does IOS specific rendering
 * @param widgetModel
 * @param renderer
 * @param rootEl
 * @private
 */
IOSPageRenderer.prototype._renderForPlatform = function(widgetModel, renderer, rootEl) {
    var page = document.getElementsByTagName('html')[0]; //the html could contain paddings/margins
    window.addResizeListener(page, function() {
        window.cxp.mobile.resizeTo(page.scrollWidth, page.scrollHeight);
    });

    // Page only can be rendered by passing it's children.
    // Page object can't contain features property, thus this check
    // This check is unstable. We should update MBaaS to include a type on items instead
    var model = widgetModel.features ? widgetModel : widgetModel.children;

    renderer.start(model, rootEl).then(function(details) {
        window.cxp.mobile.loaded(details.time);
        window.cxp.mobile.resizeTo(page.scrollWidth, page.scrollHeight);
        var message = 'Widget-Engine: Item tree rendered in ' + details.time + 'ms';
        console.log(message);
    }).catch(function(err) {
        console.log(err);
    });
};

module.exports = IOSPageRenderer;

},{"../../logging/buffered-log-stream":181,"../../logging/console-plain-log-stream":182,"../../logging/iframe-bridge-log-stream":183,"../../render/page-renderer":190}],187:[function(require,module,exports){
'use strict';

module.exports = function(featureList) {

    featureList = featureList || [];

    return {
        name: 'add-feature-plugin',
        postRead: function (widgetModel) {
            if (featureList.length === 0) {
                return widgetModel;
            }

            if (!Array.isArray(widgetModel.features)) {
                widgetModel.features = [];
            }

            featureList.forEach(function (featureName) {
                var widgetModelAlreadyHasFeature = widgetModel.features.some(function (widgetFeature) {
                    return widgetFeature.name === featureName;
                });

                if (!widgetModelAlreadyHasFeature) {
                    widgetModel.features.push({
                        name: featureName,
                        required: false
                    });
                }
            });

            return widgetModel;
        }
    };
};
},{}],188:[function(require,module,exports){
'use strict';

module.exports = function addSupportToAccessChildren() {
    return {
        name: 'expose-children-plugin',
        preRender: function (widgetInstance, widgetRenderer, widgetModel) {
            widgetInstance.children = widgetModel.children ? widgetModel.children.map(function (child) {
                return {
                    id: child.id,
                    name: child.name
                };
            }) : [];
            return widgetInstance;
        }
    };
};
},{}],189:[function(require,module,exports){
(function (global){
/* globals Promise: false */
'use strict';

// Jasmine mock f*ckery
var window = global.window; // jshint ignore:line

/*
Mobile Optimised Content (moc)

Description

This plugin caches ICE and structured content (5.6 content only!).

Usage

Include this plugin before the BackbaseFormatPlugin. If you include it
after, it doesn't do anything because the BackbaseFormatPlugin has
replaced the content g:includes with placeholders.

Internals

This plugin hooks into the postRender phase (it needs to have the widget
start file). It finds all ICE and structured content g:includes, and
renames them to moc:include so the BackbaseFormatPlugin cannot find them
anymore.

After this it checks the device cache (PersistentStorage) or localStorage
for the cached ICE / structured content template. If it finds a cached
template, it checks for expired caches using the widgetContentsUpdated
property.

If the cache is empty or expired, the plugin fetches the ICE /
structured content template itself. After this it finds all CS content
urls and fetches the contents of those urls and transforms them into
data-uris. This allows us to cache just the template. After that it
saves the template to PersistentStorage or localStorage. This plugin caches
successful responses only!

Widget preferences

There are some optional widget preferences that influence the caching.
 - widgetContentsUpdated    added and updated by ICE widgets
 - contentsCached           set this to false to disable caching

Events and activity indicators

This plugin doesn't replace the g:include with a placeholder, it just
renames it. So you can add a class or nest some image or other content
inside the g:include to show an activity indicator. After the content
is resolved, it replaces the g:include so the indicator will dissapear
automatically.

It is also possible to do this programatically. In your g:onload handler
you can display a spinner, and listen for the 'contentLoaded' and
'contentError' events by binding handlers to the widgetInstance.body.
In the handlers you can remove the spinner and show the content, or show
an error if the content cannot be fetched.
 */

var fetch = require('cxp-web-apis/src/util/deduping-fetch');

/*
 *  helpers
 */
var mimeTypes = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    html: 'text/html',
    js: 'application/javascript',
    css: 'text/css'
};

var toArray = function(htmlCollection) {
    return [].slice.call(htmlCollection);
};

var htmlToElement = function(html) {
    var template = window.document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
};

var replaceInclude = function(include, html) {
    var parent = include.parentNode;
    var newInclude = htmlToElement(html);

    parent.replaceChild(newInclude, include);

    return newInclude;
};

var createContentUrl = function(contextRoot, portalName, id) {
    return contextRoot + '/contenttemplates/rendered?' +
        'contextItemName=' + portalName + '&' +
        'uuid=' + id;
};

var parseXmlText = function(text) {
    var parsed = (new window.DOMParser())
        .parseFromString('<foo>' + text + '</foo>', 'text/xml');
    return parsed && parsed.childNodes &&
        parsed.childNodes[0] && parsed.childNodes[0].textContent;
};

var urlToMimeType = function(url) {
    var extension = url.match('\.([^.]+)$')[1];
    return mimeTypes[extension];
};

var sendEvent = function(domNode, eventName) {
    var event = window.document.createEvent('HTMLEvents');
    event.initEvent(eventName, true, true);
    domNode.dispatchEvent(event);
};

var contextToServer = function(contextRoot) {
    return contextRoot.match(/^[^/]+\/\/[^/]+/) || '';
};

/*
 *  storage functions
 */
var mangleName = function(id) {
    return 'moc-cache-' + id;
};

var readStorage = function(id, cb) {
    var storage = window.localStorage;
    var persistentStorage = window.cxp && window.cxp.mobile &&
        window.cxp.mobile.plugins && window.cxp.mobile.plugins.PersistentStorage;

    return new Promise(function(resolve, reject) {
        if (persistentStorage) {
            persistentStorage.getItem(
                function(data){
                    if(data){
                        resolve(JSON.parse(data));
                    }else{
                        resolve();
                    }
                },
                // we do not reject the promise if the id isn't found in
                // storage, we just return undefined
                function() {
                    resolve();
                },
                mangleName(id)
            );
        } else {
            var data = storage[mangleName(id)];
            if (data) {
                resolve(JSON.parse(data));
            } else {
                // we do not reject the promise if the id isn't found in
                // storage, we just return undefined
                resolve();
            }
        }
    });
};

var writeStorage = function(id, content) {
    var storage = window.localStorage;
    var persistentStorage = window.cxp && window.cxp.mobile &&
        window.cxp.mobile.plugins && window.cxp.mobile.plugins.PersistentStorage;

    return new Promise(function(resolve, reject) {
        if (persistentStorage) {
            persistentStorage.setItem(
                resolve,
                reject,
                mangleName(id),
                JSON.stringify(content)
            );
        } else {
            storage[mangleName(id)] = JSON.stringify(content);
            resolve();
        }
    });
};

var deleteFromStorage = function(id) {
    var storage = window.localStorage;
    var persistentStorage = window.cxp && window.cxp.mobile &&
        window.cxp.mobile.plugins && window.cxp.mobile.plugins.PersistentStorage;

    return new Promise(function(resolve, reject) {
        if (persistentStorage) {
            persistentStorage.removeItem(
                resolve,
                reject,
                mangleName(id)
            );
        } else {
            storage.removeItem(mangleName(id));
            resolve();
        }
    });
};


/*
 *  Promise based functions
 */

// taken from https://davidwalsh.name/convert-image-data-uri-javascript
// changed to work with promises and to use proper mimeTypes
var getDataUri = function(url) {
    return new Promise(function(resolve, reject) {
        var image = new window.Image();

        image.onload = function () {
            var canvas = window.document.createElement('canvas');
            canvas.width = this.naturalWidth;
            canvas.height = this.naturalHeight;

            canvas.getContext('2d').drawImage(this, 0, 0);

            resolve(canvas.toDataURL(urlToMimeType(url)));
        };

        image.onerror = function () {
            reject();
        };

        image.src = url;
    });
};

var fetchContent = function(contextRoot, portalName, id) {
    return fetch(createContentUrl(contextRoot, portalName, id))
        .then(function(res) {
            return res.status >= 200 && res.status < 300 ?
                Promise.resolve(res.text()) : Promise.reject(res.statusText);
        })
        .then(function(html) {
            // find all CS content urls to resolve
            return html
                .split(/([^"]+\/content\/atom\/[^"]+)|([^"]+\/content\/bbp\/repositories\/[^"]+)/g);
        })
        .then(function(chunks) {
            return Promise.all(
                chunks
                    .map(function(chunk) {
                        if (/\/content\/atom\/|\/content\/bbp\/repositories\//.test(chunk)) {
                            return getDataUri(
                                contextToServer(contextRoot) +
                                // CS content urls seem to be XML encoded. Fix that here
                                parseXmlText(chunk)
                            );
                        }
                        return chunk;
                    })
            );
        })
        .then(function(chunks) {
            return chunks
                .join('');
        });
};

var resolveContent = function(contextRoot, portalName, model) {
    return readStorage(model.id)
        .then(function(content) {
            var cacheKey = model.preferences.widgetContentsUpdated ? model.preferences.widgetContentsUpdated.value : 0;
            var contentsCached = model.preferences.contentsCached ? model.preferences.contentsCached.value === 'true' : true;

            // remove the previously cached element if the cache has been disabled for it.
            if (contentsCached === false){
                deleteFromStorage(model.id);
            }

            // ICE widget - proper expiry detection using 'widgetContentsUpdated' preference in the model
            if (contentsCached && content && content.cacheKey === cacheKey) {
                return content.data;

            // fetch content ourselves
            } else {
                return fetchContent(contextRoot, portalName, model.id)
                    .then(function(content) {
                        if(contentsCached){
                            writeStorage(model.id, {
                                cacheKey: cacheKey,
                                data: content
                            });
                        }
                        return content;
                    });
            }
        });
};

module.exports = function(contextRoot) {
    return {
        name: 'mobile-optimized-content-plugin',
        postRender: function(widgetInstance, widgetRenderer, widgetModel) {
            var portalName = widgetInstance.features.cxp.config.get('portalName');

            var includes = toArray(widgetInstance.body.getElementsByTagName('g:include'))
                .filter(function(include) {
                    return /\/contenttemplates\/rendered/.test(include.getAttribute('src')) &&
                        include.querySelectorAll('[name="templateUrl"]').length === 0;
                })
                .map(function(include) {
                    // replace the g:include with moc:include so the BackbaseFormatPlugin doesn't resolve it
                    var domNode = replaceInclude(include, include.outerHTML.replace(/g:include/g, 'moc:include'));

                    return resolveContent(contextRoot, portalName, widgetModel)
                        .then(function(content) {
                            replaceInclude(domNode, content);
                        });
                });

            if (includes.length) {
                Promise.all(includes)
                    // these fire only after all content g:includes have finished
                    .then(function() {
                        sendEvent(widgetInstance.body, 'contentLoaded');
                    })
                    .catch(function() {
                        sendEvent(widgetInstance.body, 'contentError');
                    });
            }

            return widgetInstance;
        }
    };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"cxp-web-apis/src/util/deduping-fetch":170}],190:[function(require,module,exports){
(function (global){
/* jshint unused: vars */

'use strict';

var window = global.window || {}; // jshint ignore:line

//needed for spec to run
if(!global.window) {
    global.window = window;
}

//core portal
var cxpWebApis = require('cxp-web-apis');

//plugins (these are all functions which should be called to get the plugin instance)
var addFeaturePlugin = require('../plugins/add-feature-plugin');
var exposeChildrenPlugin = require('../plugins/expose-children-plugin');
var mocPlugin = require('../plugins/mobile-optimised-content-plugin');

//retreive csrf tokens using this cookie name
var CSRF_TOKEN_COOKIE_NAME = 'bbCSRF';
//send csrf tokens using this request header name
var CSRF_TOKEN_HEADER_NAME = CSRF_TOKEN_COOKIE_NAME;

/**
 * Renders a page
 * @interface
 * @constructor
 */
var PageRenderer =  function(opts) {
};

/**
 * Starts the rendering process
 * @param rootEl
 * @param model
 * @param pubsub feature implementation
 * @param opts
 */
PageRenderer.prototype.render = function(rootEl, model, pubsub, opts) {

    //options
    opts = opts || {};
    var logLevel = opts.logLevel || 'warn';
    var localContextRoot = opts.localContextRoot || '';
    var remoteContextRoot = opts.remoteContextRoot || '';
    var apiRoot = opts.apiRoot || '';
    var portalName = opts.portalName || 'anonymous-portal';

    //set up config
    var config = cxpWebApis.createConfiguration({
        logStreams: this._createLogStreams(logLevel),
    });
    config.enable('compat');
    config.enable('fullConfigReplacement'); //enables $(contextRoot) replacement for all preferences
    config.set('portalName', portalName);
    config.set('contextRoot', localContextRoot);
    config.set('remoteContextRoot', remoteContextRoot);
    config.set('apiRoot', apiRoot);

    //CSRF
    var csrfTokenCookieValue = null; //TODO: where do we get a CSRF token from?
    if(csrfTokenCookieValue) {
        config.set('csrfToken', {
            name: CSRF_TOKEN_HEADER_NAME,
            value: csrfTokenCookieValue
        });
    }

    //set up renderer
    var renderer = cxpWebApis.getRenderer(config);
    renderer.addPlugin(mocPlugin(config.get('remoteContextRoot')));
    renderer.addPlugin(exposeChildrenPlugin());
    
    //expose CXP as a feature to widgets
    var cxpFeature = {
        name: 'cxp',
        config: config,
        render: renderer,
        model: cxpWebApis.getModel(config)
    };
    renderer.addPlugin(addFeaturePlugin([ cxpFeature.name ]));
    renderer.addFeature(cxpFeature);
    renderer.addFeature(pubsub); //enable the pubsub feature using the native implementation

    this._renderForPlatform(model, renderer, rootEl);
};

/**
 * Should return an array of browser-bunyan log streams.
 * @param opts
 * @private
 */
PageRenderer.prototype._createLogStreams = function(opts) {
    throw new Error('PageRenderer#_createLogStreams must be overridden.');
};

/**
 * Platform specific rendering part
 * @param model
 * @param renderer
 * @param rootEl
 * @private
 */
PageRenderer.prototype._renderForPlatform = function(model, renderer, rootEl) {
    throw new Error('PageRenderer#_renderForPlatform must be overridden.');
};

module.exports = PageRenderer;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../plugins/add-feature-plugin":187,"../plugins/expose-children-plugin":188,"../plugins/mobile-optimised-content-plugin":189,"cxp-web-apis":147}]},{},[180]);
