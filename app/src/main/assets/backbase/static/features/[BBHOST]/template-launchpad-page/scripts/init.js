(function() {
    function getCurrentScript() {
        if (document.currentScript) {
            return document.currentScript;
        }
        var scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    };

    function getUrlVars(url) {
        var vars = {}, hash, hashes = url.split(' ').join('').slice(url.indexOf('?') + 1).split(';');
        for(var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars[hash[0]] = hash[1];
        }
        return vars;
    }
    
    var params = getUrlVars(getCurrentScript().src);

    b$.portal.config = b$.portal.config || {};
    b$.portal.config.serverRoot = params['cRoot'];
    b$.portal.config.resourceRoot || (b$.portal.config.resourceRoot = b$.portal.config.serverRoot);
    b$.portal.portalName = params['pName'];
    b$.portal.pageName = params['pageName'];
    b$.portal.pageUUID = params['pageUUID'];
    b$.portal.loggedInUserId = params['userName'];
    b$.portal.linkUUID = params['linkUUID'];
    b$.portal.loggedInUserRole = params['role'] ? 'role' : '';
    b$.portal.loggedInUserGroup = (function() {
        return (
            params['loggedInUserGroup'] && params['loggedInUserGroup'].length
                ? params['loggedInUserGroup']
                : ''
        ).split(',');
    })();

    window.launchpad = window.launchpad || {
        staticRoot: params['cRoot'] + '/static'
    };

})();
