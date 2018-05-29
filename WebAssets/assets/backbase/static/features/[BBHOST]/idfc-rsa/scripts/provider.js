define(function (require, exports, module) {
    'use strict';

    var FingerPrintItems,
        BrowserDetect,
        fingerPrintFactory;

    FingerPrintItems = require('./FingerPrint');
    BrowserDetect = exports.BrowserDetect = {
        init: function () {
            this.browser = this.searchString(this.dataBrowser) || 'an unknown browser';
            this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || 'an unknown version';
            this.OS = this.searchString(this.dataOS) || 'an unknown OS';
        },
        searchString: function (l) {
            var k = l.length,
                o,
                h,
                n,
                m,
                j;

            for (o = 0; o < k; o++) {
                h = l[o];
                n = h.string;
                m = h.prop;
                j = h.identity;
                this.versionSearchString = h.versionSearch || j;
                if (n) {
                    if (n.toLowerCase().indexOf(h.subString.toLowerCase()) !== -1) {
                        return j;
                    }
                } else {
                    if (m) {
                        return j;
                    }
                }
            }
        },
        searchVersion: function (d) {
            var e,
                f;

            e = d.toLowerCase().indexOf(this.versionSearchString.toLowerCase());
            if (e !== -1) {
                f = d.substring(e + this.versionSearchString.length);
                if (f.indexOf(' ') === 0 || f.indexOf('/') === 0) {
                    f = f.substring(1);
                }
                return parseFloat(f);
            }
            return 0;
        },
        dataBrowser: [
            {
                string: navigator.userAgent,
                subString: 'Chrome',
                identity: 'Chrome'
            },
            {
                string: navigator.userAgent,
                subString: 'OmniWeb',
                versionSearch: 'OmniWeb/',
                identity: 'OmniWeb'
            },
            {
                string: navigator.userAgent.toLowerCase(),
                subString: 'opera',
                identity: 'Opera',
                versionSearch: 'version'
            },
            {
                string: navigator.vendor,
                subString: 'Apple',
                identity: 'Safari',
                versionSearch: 'Version'
            },
            {
                string: navigator.userAgent,
                subString: 'mobile safari',
                identity: 'Mobile Safari',
                versionSearch: 'mobile safari'
            },
            {
                string: navigator.vendor,
                subString: 'iCab',
                identity: 'iCab'
            }, {
                string: navigator.vendor,
                subString: 'KDE',
                identity: 'Konqueror'
            },
            {
                string: navigator.userAgent,
                subString: 'Firefox',
                identity: 'Firefox'
            },
            {
                string: navigator.vendor,
                subString: 'Camino',
                identity: 'Camino'
            },
            {
                string: navigator.userAgent.toLocaleLowerCase(),
                subString: 'blackberry',
                identity: 'BlackBerry',
                versionSearch: '0/'
            },
            {
                string: navigator.userAgent,
                subString: 'Netscape',
                identity: 'Netscape'
            },
            {
                string: navigator.userAgent,
                subString: 'MSIE',
                identity: 'Explorer',
                versionSearch: 'MSIE'
            },
            {
                string: navigator.userAgent,
                subString: 'Gecko',
                identity: 'Mozilla',
                versionSearch: 'rv'
            },
            {
                string: navigator.userAgent,
                subString: 'Mozilla',
                identity: 'Netscape',
                versionSearch: 'Mozilla'
            }
        ],
        dataOS: [
            {
                string: navigator.userAgent,
                subString: 'BlackBerry',
                identity: 'BlackBerry'
            },
            {
                string: navigator.userAgent.toLowerCase(),
                subString: 'android',
                identity: 'Android'
            },
            {
                string: navigator.userAgent,
                subString: 'Symbian',
                identity: 'Symbian'
            },
            {
                string: navigator.platform,
                subString: 'Mac',
                identity: 'Mac'
            },
            {
                string: navigator.userAgent,
                subString: 'iPhone',
                identity: 'iPhone/iPod'
            },
            {
                string: navigator.platform,
                subString: 'Linux',
                identity: 'Linux'
            },
            {
                string: navigator.userAgent,
                subString: 'Windows CE',
                identity: 'Windows CE'
            },
            {
                string: navigator.platform,
                subString: 'Win',
                identity: 'Windows'
            }
        ]
    };

    fingerPrintFactory = {
        Explorer: function () {
            return new FingerPrintItems.IEFingerPrint();
        },
        Firefox: function () {
            return new FingerPrintItems.MozillaFingerPrint();
        },
        Opera: function () {
            return new FingerPrintItems.OperaFingerPrint();
        },
        default: function () {
            return new FingerPrintItems.FingerPrint();
        }
    };

    function urlEncode(url) {
        var encodedUrl = encodeURIComponent(url)
            .replace(/\~/g, '%7E')
            .replace(/\!/g, '%21')
            .replace(/\*/g, '%2A')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29')
            .replace(/\'/g, '%27')
            .replace(/\-/g, '%2D')
            .replace(/\_/g, '%5F')
            .replace(/\./g, '%2E');
        return encodedUrl;
    }

    function addDevicePrint() {
        var browserFingerPrintFactory,
            browserFingerPrint,
            key,
            queryArray = [],
            queryObject;
        BrowserDetect.init();

        browserFingerPrintFactory = fingerPrintFactory[BrowserDetect.browser] || fingerPrintFactory.default;
        browserFingerPrint = browserFingerPrintFactory();

        queryObject = {
            version: browserFingerPrint.deviceprintVersion(),
            pm_fpua: browserFingerPrint.deviceprintBrowser(),
            pm_fpsc: browserFingerPrint.deviceprintDisplay(),
            pm_fpsw: browserFingerPrint.deviceprintSoftware(),
            pm_fptz: browserFingerPrint.deviceprintTimezone(),
            pm_fpln: browserFingerPrint.deviceprintLanguage(),
            pm_fpjv: browserFingerPrint.deviceprintJava(),
            pm_fpco: browserFingerPrint.deviceprintCookie(),
            pm_fpasw: browserFingerPrint.deviceprintAllSoftware(),
            pm_fpan: browserFingerPrint.deviceprintAppName(),
            pm_fpacn: browserFingerPrint.deviceprintAppCodeName(),
            pm_fpol: browserFingerPrint.deviceprintOnline(),
            pm_fposp: browserFingerPrint.deviceprintOpsProfile(),
            pm_fpup: browserFingerPrint.deviceprintUserProfile(),
            pm_fpsaw: browserFingerPrint.deviceprintScreenAvailWidth(),
            pm_fpspd: browserFingerPrint.deviceprintScreenPixelDepth(),
            pm_fpsbd: browserFingerPrint.deviceprintScreenBufferDepth(),
            pm_fpsdx: browserFingerPrint.deviceprintScreenDeviceXDPI(),
            pm_fpsdy: browserFingerPrint.deviceprintScreenDeviceYDPI(),
            pm_fpslx: browserFingerPrint.deviceprintScreenLogicalXDPI(),
            pm_fpsly: browserFingerPrint.deviceprintScreenLogicalYDPI(),
            pm_fpsfse: browserFingerPrint.deviceprintScreenFontSmoothingEnabled(),
            pm_fpsui: browserFingerPrint.deviceprintScreenUpdateInterval(),
            pm_os: BrowserDetect.OS,
            pm_brmjv: parseInt(BrowserDetect.version, 10),
            pm_br: BrowserDetect.browser,
            pm_inpt: browserFingerPrint.deviceprintPingIn(),
            pm_expt: browserFingerPrint.deviceprintPingEx()
        };

        for (key in queryObject) {
            if (queryObject.hasOwnProperty(key)) {
                queryArray.push(key + '=' + queryObject[key]);
            }
        }


        return queryArray.join('&');
    }

    function encodeDevicePrint() {
        var b = addDevicePrint();
        return urlEncode(b);
    }

    exports.setDevicePrint = function () {
        return encodeDevicePrint();
    };

    exports.isNotEmptyObject = function (obj) {
        obj = obj || {};
        return obj && Object.keys(obj).length > 0;
    };
	
	 exports.rsaDevicePrint = {
        execute: function () {
            return encodeDevicePrint();
        }
    };
});
