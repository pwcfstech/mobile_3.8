// jshint ignore:start

window.setupPortalShim = function(window, config) {

    config = config || {};

    window.b$ = {};
    window.b$.portal = {};
    window.b$.portal.portalName = config.portalName || 'New Portal';
    window.b$.portal.config = {};
    window.b$.portal.config.apiRoot = config.apiRoot || '';
    window.b$.portal.config.resourceRoot = config.contextRoot;
    window.b$.portal.config.serverRoot = config.remoteContextRoot || config.contextRoot;
    window.b$.portal.portalServer = {};
    window.b$.portal.portalServer.serverURL = config.remoteContextRoot || config.contextRoot;
    window.b$.view = window.b$.view || {};
    window.b$.view.url2state = window.b$.view.url2state || { active: false };
    window.b$._private = {};
    window.b$._private.uri = {};
    window.b$._private.uri.URI = window.location.href;
    window.b$._private.resourceManager = {};
    window.b$._private.resourceManager.resources = [];
    // TODO: temporary commented to work with the local service
    //window.b$.portal.portalModel.serverURL = config.remoteContextRoot; //CXPM-488
    window.b$.portal.portalModel = {
        serverURL: config.remoteContextRoot
    }; //CXPM-488

    window.bd = {};
    window.bd.apiPrefix = config.contextRoot;
    window.be = {};
    window.lp = {};
    window.lp.servicesPath = config.remoteContextRoot || config.contextRoot;

    window.b$.portal.getCurrentPortal = function(){
        return {
            name: window.b$.portal.portalName
        };
    };

    window.b$.portal.getCurrentPage = function(){
        return {
            name: ''
        };
    };

    window.b$.bdom = {};

    function mixin(oDestination, oSource) {
        var sMember;

        if (oSource) {
            for (sMember in oSource) {
                if (hasOwnProperty.call(oSource, sMember)) {
                    oDestination[sMember] = oSource[sMember];
                }
            }
        }

        return oDestination;
    }

    /**
     * Extends a constructor from the current class, adding additional members and static members.
     * @param {Function} superClass
     *     The class to inherit from
     * @param {Function} constructor
     *     The constructor function for the new class (optional)
     * @param {Object} members
     *     Instance members to add to the new class (optional)
     * @param {Object} staticMembers
     *     Static members to add to the new class (optional)
     * @return {Function}
     *     The constructor object with prototype and members applied to it, a class object
     * @private
     */
    function extend(cSuperClass, fConstructor, hMembers, hStaticMembers) {
        fConstructor = fConstructor || function() {
            cSuperClass.apply(this, arguments);
        };

        mixin(fConstructor, cSuperClass); // inherit static members

        if (hStaticMembers) {
            mixin(fConstructor, hStaticMembers); // add static members
        }

        var fExtender = new Function;
        fExtender.prototype = cSuperClass.prototype;
        fConstructor.prototype = mixin(new fExtender, hMembers);	// add prototype members
        fConstructor.prototype.constructor = fConstructor;

        fConstructor.superClass = cSuperClass;

        return fConstructor;
    }

    /**
     * The Class object is used as a basis for classes.
     *
     * You extend your own classes from the Class object, there are a few possible
     * variations for your definitions, according to personal preference.
     * The constructor is passed while extending, so it is not a member.
     * @class b$.Class
     */
    var Class = function() {};

    Class.superClass = null;
    Class.classID = 0;

    var _b$_iClassIDCounter = 1;

    /**
     * @method extend
     * Extends a constructor from the current class, adding additional members and static members.
     * @param {Function} constructor The constructor function for the class (optional)
     * @param {Object} members Instance members to add to the new class (optional)
     * @param {Object} staticMembers Static members to add to the new class (optional)
     * @returns {Class} The constructor object with prototype and members applied to it
     */
    Class.extend = function(fConstructor, hMembers, hStaticMembers) {
        var cClass = extend(this, fConstructor, hMembers, hStaticMembers);
        cClass.classID = _b$_iClassIDCounter++;

        if (hMembers && hMembers.namespaceURI && hMembers.localName) {
            namespaceContext.classes[hMembers.localName] = cClass;
        }

        var DOMReady = function (e) {
            if (hMembers && typeof hMembers.DOMReady === 'function') {
                hMembers.DOMReady(e);
            }
        }.bind(this);

        window.document.addEventListener('DOMContentLoaded', DOMReady);

        return cClass;
    };

    /**
     * Returns a unique class ID.
     * @return {Number} An ID unique to the class.
     */
    Class.getClassID = function() {
        return this.classID;
    };

    window.b$.Class = Class;


    /**
     * b$ module shim
     * @param moduleName
     * @param callback
     * @returns {*}
     */
    window.b$.module = function(moduleName, callback) {
        function setNamespace(namespace, parts){
            var next = parts.shift();

            if(next) {
                if(namespace[next] === undefined) {
                    namespace[next] = {};
                }

                namespace = setNamespace(namespace[next], parts);
            }

            return namespace;
        }

        var parts = moduleName.split(/\./);
        var module = setNamespace(window, parts);

        if(typeof callback === 'function') {
            callback.call(module);
        }

        return module;
    };

    window.b$.view.preferences = {
        UserPreferenceField: Class,
        UserPreferenceForm: Class
    };

    var namespaceContext = window.__namespaceContext = {
        getClass: function(className) {
            return this.classes[className] || Class;
        },
        classes: {
            container: Class
        }
    };

    window.b$.bdom.getNamespace = function() {
        return namespaceContext;
    };

    /**
     * URI Class
     * @type {RegExp}
     * @private
     */
    var _URI_ParseRegex=/^(?:([^:/?#]+):)?(?:\/\/([^/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?$/,_URI_CaseRegex=/%[0-9a-z]{2}/gi,_URI_PercentRegex=/[a-zA-Z0-9\-\._~]/,_URI_AuthorityRegex=/(.*@)?([^@:]*)(:.*)?/;function _URI_fCase(a){var b=unescape(a);return _URI_PercentRegex.test(b)?b:a.toUpperCase()}function _URI_fAuthority(a,b,c,d){return(b||"")+c.toLowerCase()+(d||"")}
    var _URI_hCache={},URI=b$.Class.extend(function(a){a instanceof URI?(this.scheme=a.scheme,this.authority=a.authority,this.path=a.path,this.query=a.query,this.fragment=a.fragment):a&&(a=_URI_ParseRegex.exec(a),this.scheme=a[1],this.authority=a[2],this.path=a[3],this.query=a[4],this.fragment=a[5])},{scheme:null,authority:null,path:"",query:null,fragment:null,getScheme:function(){return this.scheme},getAuthority:function(){return this.authority},getPath:function(){return this.path},getQuery:function(){return this.query},
        getFragment:function(){return this.fragment},isAbsolute:function(){return this.scheme&&!this.fragment},isSameDocumentAs:function(a){return a.scheme==this.scheme&&a.authority==this.authority&&a.path==this.path&&a.query==this.query},equals:function(a){return this.isSameDocumentAs(a)&&a.fragment==this.fragment},normalize:function(){this.removeDotSegments();this.scheme&&(this.scheme=this.scheme.toLowerCase());this.authority&&(this.authority=this.authority.replace(_URI_AuthorityRegex,_URI_fAuthority).replace(_URI_CaseRegex,
            _URI_fCase));this.path&&(this.path=this.path.replace(_URI_CaseRegex,_URI_fCase));this.query&&(this.query=this.query.replace(_URI_CaseRegex,_URI_fCase));this.fragment&&(this.fragment=this.fragment.replace(_URI_CaseRegex,_URI_fCase))},resolve:function(a){var b=new URI;this.scheme?(b.scheme=this.scheme,b.authority=this.authority,b.path=this.path,b.query=this.query):(b.scheme=a.scheme,this.authority?(b.authority=this.authority,b.path=this.path,b.query=this.query):(b.authority=a.authority,""==this.path?
            (b.path=a.path,b.query=this.query||a.query):("/"==this.path.charAt(0)?b.path=this.path:b.path=a.authority&&""==a.path?"/"+this.path:a.path.substring(0,a.path.lastIndexOf("/")+1)+this.path,b.removeDotSegments(),b.query=this.query)));b.fragment=this.fragment;return b},removeDotSegments:function(){var a=this.path.split("/"),b=[],c,d=""==a[0];d&&a.shift();for(""==a[0]&&a.shift();a.length;)c=a.shift(),".."==c?b.pop():"."!=c&&b.push(c);"."!=c&&".."!=c||b.push("");d&&b.unshift("");this.path=b.join("/")},
        toString:function(){var a="";this.scheme&&(a+=this.scheme+":");this.authority&&(a+="//"+this.authority);a+=this.path;this.query&&(a+="?"+this.query);this.fragment&&(a+="#"+this.fragment);return a}},{resolve:function(a,b){var c=_URI_hCache[a]||(_URI_hCache[a]=new URI(a)),d=_URI_hCache[b]||(_URI_hCache[b]=new URI(b));return c.resolve(d).toString()}});b$.module("b$._private.uri",function(){this.URI=URI});

};
