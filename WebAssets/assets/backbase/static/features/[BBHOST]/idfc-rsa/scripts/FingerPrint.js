/*global setTimeout*/
define(function (require, exports, module) {
    'use strict';
    var SEP,
        PAIR,
        ProxyCollector;

    SEP = '|';
    PAIR = '=';

    function activeXDetect(e) {
        var f = null;
        try {
            f = document.body.getComponentVersion('{' + e + '}', 'ComponentID');
        } catch (d) {
        }
        return (f !== null) ? f : false;
    }

    function getRandomPort() {
        return Math.floor(Math.random() * 60000 + 4000);
    }

    function Timer() {
        this.startTime = new Date().getTime();
    }
    Timer.prototype.start = function () {
        this.startTime = new Date().getTime();
    };
    Timer.prototype.duration = function () {
        return (new Date().getTime()) - this.startTime;
    };

    function stripIllegalChars(h) {
        h = h.toLowerCase();
        var t = '';
        var g = h.length;
        var f;
        for (f = 0; f < g; f++) {
            var e = h.charAt(f);
            if (e !== '\n' && e !== '/' && e !== '\\') {
                t += e;
            } else {
                if (e === '\n') {
                    t += 'n';
                }
            }
        }
        return t;
    }

    function stripFullPath(k, n, m) {
        var q = n;
        var o = m;
        var l = k;
        var filenameLen;
        var j = l.lastIndexOf(q);
        if (j >= 0) {
            filenameLen = l.length;
            l = l.substring(j + q.length, filenameLen);
        }
        var r = l.indexOf(o);
        if (r >= 0) {
            l = l.slice(0, r);
        }
        return l;
    }

    ProxyCollector = {};
    ProxyCollector.internalIP = '127.0.0.1';
    ProxyCollector.externalIP = null;
    ProxyCollector.internalPingTime = null;
    ProxyCollector.externalPingTime = null;

    function forceIE89Synchronicity() {
        if (!ProxyCollector.externalPingTime) {
            setTimeout(forceIE89Synchronicity, 100);
        } else {
            ProxyCollector.doAjax(ProxyCollector.internalIP, ProxyCollector.setInternalPingTime);
        }
    }

    ProxyCollector.setInternalPingTime = function (b) {
        ProxyCollector.internalPingTime = b;
    };
    ProxyCollector.setExternalPingTime = function (b) {
        ProxyCollector.externalPingTime = b;
    };
    ProxyCollector.PROXY_DETECTION_TIMEOUT = 5000;
    ProxyCollector.TIMEOUT_CHECK_FREQUENCY = 1000;
    ProxyCollector.isTimedOut = function (d, e, f) {
        var _timer = new Timer();
        if ((e - _timer.duration() <= 0) && (((typeof ProxyCollector.internalPingTime === 'undefined') && ((new RegExp('internalPingTime')).test(d))) || ((typeof ProxyCollector.externalPingTime === 'undefined') && ((new RegExp('externalPingTime')).test(d))))) {
            d.call(this, -1);
            f.abort();
        } else {
            if (((typeof ProxyCollector.internalPingTime === 'undefined') && ((new RegExp('internalPingTime')).test(d))) || ((typeof ProxyCollector.externalPingTime === 'undefined') && ((new RegExp('externalPingTime')).test(d)))) {
                setTimeout(function () {
                    ProxyCollector.isTimedOut(d, e - (_timer.duration() + ProxyCollector.TIMEOUT_CHECK_FREQUENCY), f);
                }, ProxyCollector.TIMEOUT_CHECK_FREQUENCY);
            }
        }
    };
    ProxyCollector.doAjax = function (k, l) {
        var j = document.location.protocol + '//' + k + ':' + getRandomPort() + '/NonExistentImage' + getRandomPort() + '.gif';
        var m;
        var o;
        if (window.XDomainRequest) {
            m = new window.XDomainRequest();
            o = new Timer();
            try {
                m.timeout = ProxyCollector.PROXY_DETECTION_TIMEOUT;
                m.ontimeout = function () {
                    l.call(this, -1);
                    m.abort();
                };
                m.onprogress = function () {
                    l.call(this, o.duration());
                    m.abort();
                };
                m.onerror = function () {
                    l.call(this, o.duration());
                    m.abort();
                };
                m.open('GET', j, true);
                m.send();
            } catch (h) {
                ProxyCollector.doAjaxViaImage(l, j);
            }
        } else {
            m = new XMLHttpRequest();
            var n = 'ontimeout' in m;
            o = new Timer();
            try {
                m.onreadystatechange = function () {
                    if (m.readyState === 4) {
                        if (((typeof ProxyCollector.internalPingTime === 'undefined') && ((new RegExp('internalPingTime')).test(l))) || ((typeof ProxyCollector.externalPingTime === 'undefined') && ((new RegExp('externalPingTime')).test(l)))) {
                            l.call(this, o.duration());
                        }
                    }
                };
                m.timeout = ProxyCollector.PROXY_DETECTION_TIMEOUT;
                m.ontimeout = function () {
                    l.call(this, -1);
                    m.abort();
                };
                m.open('GET', j, true);
                m.send();
                if (!n) {
                    ProxyCollector.isTimedOut(l, ProxyCollector.PROXY_DETECTION_TIMEOUT - o.duration(), m);
                }
            } catch (h) {
                ProxyCollector.doAjaxViaImage(l, j);
            }
        }
    };
    ProxyCollector.doAjaxViaImage = function (g, e) {
        var f = new Image();
        var h = new Timer();
        f.onerror = function () {
            g.call(this, h.duration());
        };
        f.src = e;
    };
    ProxyCollector.collect = function () {
        ProxyCollector.doAjax(ProxyCollector.externalIP, ProxyCollector.setExternalPingTime);
        if (typeof XDomainRequest === 'object') {
            if (!ProxyCollector.externalPingTime) {
                forceIE89Synchronicity();
            }
        } else {
            ProxyCollector.doAjax(ProxyCollector.internalIP, ProxyCollector.setInternalPingTime);
        }
    };
    ProxyCollector.isValidIPAddress = function (h) {
        var e = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
        if (e.test(h)) {
            var g = h.split('.');
            if (parseInt(parseFloat(g[0]), 10) === 0) {
                return false;
            }
            for (var f = 0; f < g.length; f++) {
                if (parseInt(parseFloat(g[f]), 10) > 255) {
                    return false;
                }
            }
            return true;
        }
        return false;
    };
    ProxyCollector.initProxyCollection = function () {
        if (ProxyCollector.isValidIPAddress(ProxyCollector.externalIP) && ProxyCollector.isValidIPAddress(ProxyCollector.internalIP)) {
            ProxyCollector.collect();
        }
    };

    function Hashtable() {
        var j,
            f,
            h,
            k;
        j = {indexToValue: [], indexToKeys: []};
        f = [];
        h = 0;
        k = this;

        function g(b) {
            var a,
                c;

            a = null;
            c = 0;
            while (typeof f[c] === 'number') {
                c += 1;
            }
            f[c] = 0;
            this.hasNext = this.hasMoreElements = function () {
                if (f[c] < h) {
                    return true;
                }
                if (typeof f[c] === 'number') {
                    f[c] = null;
                }
                return false;
            };
            this.next = this.nextElement = function () {
                if (this.hasNext) {
                    a = f[c];
                    return j[b][f[c]++];
                }
                return null;
            };
            this.remove = function () {
                if (typeof a === 'number') {
                    k.remove(j.indexToKeys[a]);
                    a = null;
                }
            };
        }

        this.get = function (a) {
            if (typeof j[a] === 'number') {
                return j.indexToValue[j[a]];
            }
            return null;
        };
        this.put = function (b, a) {
            if (typeof j[b] === 'number') {
                j.indexToValue[j[b]] = a;
            } else {
                j[b] = h;
                j.indexToValue[h] = a;
                j.indexToKeys[h++] = b;
            }
        };
        this.remove = function (b) {
            var a,
                c;
            c = j[b];
            if (typeof c === 'number') {
                delete j[b];
                h -= 1;
                for (a = c; a < h; a++) {
                    j.indexToValue[a] = j.indexToValue[a + 1];
                    j[(j.indexToKeys[a] = j.indexToKeys[a + 1])] = a;
                }
                for (a = 0; a < f.length; a++) {
                    if ((f[a]) && (c < f[a])) {
                        f[a] -= 1;
                    }
                }
            }
        };
        this.size = function () {
            return h;
        };
        this.enumerate = function (a) {
            return new g(a);
        };
        Hashtable.prototype.elements = function () {
            return this.enumerate('indexToValue');
        };
        Hashtable.prototype.keys = function () {
            return this.enumerate('indexToKeys');
        };
        Hashtable.prototype.clear = function () {
            var a = this.keys();
            while (a.hasNext()) {
                this.remove(a.next());
            }
        };
        Hashtable.prototype.toString = function () {
            var d = ' =&gt; ';
            var b = '\r\n';
            var a, c = this.keys();
            var e = '';
            while (c.hasNext()) {
                a = c.next();
                e += a + d + this.get(a) + b;
            }
            return e;
        };
        //hello
        Hashtable.prototype.contains = function (b) {
            var a = this.elements();
            while (a.hasNext()) {
                if (a.next() === b) {
                    return true;
                }
            }
            return false;
        };
        Hashtable.prototype.containsValue = Hashtable.prototype.contains;
        Hashtable.prototype.containsKey = function (a) {
            return (this.get(a) !== null);
        };
        Hashtable.prototype.isEmpty = function () {
            return (this.size() === 0);
        };
        Hashtable.prototype.putAll = function (b) {
            if (b.constructor === Hashtable) {
                var a, c = b.keys();
                while (c.hasNext()) {
                    a = c.next();
                    this.put(a, b.get(a));
                }
            }
        };
        Hashtable.prototype.clone = function () {
            var a = new Hashtable();
            a.putAll(this);
            return a;
        };
        Hashtable.prototype.equals = function (a) {
            return (a === this);
        };
    }

    function FingerPrint() {
        var d = '3.4.1.0_1';
        var c = new Hashtable();
        c.put('npnul32', 'def');
        c.put('npqtplugin6', 'qt6');
        c.put('npqtplugin5', 'qt5');
        c.put('npqtplugin4', 'qt4');
        c.put('npqtplugin3', 'qt3');
        c.put('npqtplugin2', 'qt2');
        c.put('npqtplugin', 'qt1');
        c.put('nppdf32', 'pdf');
        c.put('NPSWF32', 'swf');
        c.put('NPJava11', 'j11');
        c.put('NPJava12', 'j12');
        c.put('NPJava13', 'j13');
        c.put('NPJava32', 'j32');
        c.put('NPJava14', 'j14');
        c.put('npoji600', 'j61');
        c.put('NPJava131_16', 'j16');
        c.put('NPOFFICE', 'mso');
        c.put('npdsplay', 'wpm');
        c.put('npwmsdrm', 'drm');
        c.put('npdrmv2', 'drn');
        c.put('nprjplug', 'rjl');
        c.put('nppl3260', 'rpl');
        c.put('nprpjplug', 'rpv');
        c.put('npchime', 'chm');
        c.put('npCortona', 'cor');
        c.put('np32dsw', 'dsw');
        c.put('np32asw', 'asw');
        this.deviceprintVersion = function () {
            return d;
        };
        this.deviceprintBrowser = function () {
            var a = navigator.userAgent.toLowerCase();
            var b = a + SEP + navigator.appVersion + SEP + navigator.platform;
            return b;
        };
        this.deviceprintSoftware = function () {
            var a = '';
            var i;
            var plugin;
            var q = true;
            var b = '';
            var n = '';
            var s = navigator.plugins;
            var o = navigator.mimeTypes;
            var mimeType;
            if (s.length > 0) {
                var r = '';
                var u = 'Plugins';
                var m = s.length;
                for (i = 0;
                     i < m;
                     i++) {
                    plugin = s[i];
                    r = stripFullPath(plugin.filename, u, '.');
                    if (q === true) {
                        n = c.containsKey(r);
                        if (n) {
                            b += c.get(r);
                            q = false;
                        } else {
                            b = '';
                            q = false;
                        }
                    } else {
                        n = c.containsKey(r);
                        if (n) {
                            b += SEP + c.get(r);
                        } else {
                            b += '';
                        }
                    }
                }
                a = stripIllegalChars(b);
            } else {
                if (o.length > 0) {
                    n = '';
                    for (i = 0; i < o.length; i++) {
                        mimeType = o[i];
                        if (q === true) {
                            n = c.containsKey(mimeType);
                            if (n) {
                                a += c.get(mimeType) + PAIR + mimeType;
                                q = false;
                            } else {
                                a += 'unknown' + PAIR + mimeType;
                                q = false;
                            }
                        } else {
                            n = c.containsKey(mimeType);
                            if (n) {
                                a += SEP + c.get(mimeType) + PAIR + mimeType;
                            } else {
                                b += '';
                            }
                        }
                    }
                }
            }
            return a;
        };
        this.deviceprintDisplay = function () {
            var a = '';
            if (self.screen) {
                a += screen.colorDepth + SEP + screen.width + SEP + screen.height + SEP + screen.availHeight;
            }
            return a;
        };
        this.deviceprintAllSoftware = function () {
            var m = '';
            var r = true;
            var q = navigator.plugins;
            var b = q.length;
            var l;
            var i;
            if (b > 0) {
                var o = '';
                var a = '';
                for (i = 0; i < b; i++) {
                    l = q[i];
                    a = l.filename;
                    a = stripFullPath(a, 'Plugins', '.');
                    if (r === true) {
                        o += a;
                        r = false;
                    } else {
                        o += SEP + a;
                    }
                }
                m = stripIllegalChars(o);
            }
            return m;
        };
        this.deviceprintTimezone = function () {
            var a = (new Date().getTimezoneOffset() / 60) * (-1);
            var b = new Date();
            if (b.deviceprintDst()) {
                a--;
            }
            return a;
        };
        Date.prototype.deviceprintStdTimezoneOffset = function () {
            var b = new Date(this.getFullYear(), 0, 1);
            var a = new Date(this.getFullYear(), 6, 1);
            return Math.max(b.getTimezoneOffset(), a.getTimezoneOffset());
        };
        Date.prototype.deviceprintDst = function () {
            return this.getTimezoneOffset() < this.deviceprintStdTimezoneOffset();
        };
        this.deviceprintLanguage = function () {
            var j;
            var a = navigator.language;
            var k = navigator.browserLanguage;
            var b = navigator.systemLanguage;
            var h = navigator.userLanguage;
            if (typeof a !== 'undefined') {
                j = 'lang' + PAIR + a + SEP;
            } else {
                if (typeof k !== 'undefined') {
                    j = 'lang' + PAIR + k + SEP;
                } else {
                    j = 'lang' + PAIR + '' + SEP;
                }
            }
            if ((typeof b !== 'undefined')) {
                j += 'syslang' + PAIR + b + SEP;
            } else {
                j += 'syslang' + PAIR + '' + SEP;
            }
            if ((typeof h !== 'undefined')) {
                j += 'userlang' + PAIR + h;
            } else {
                j += 'userlang' + PAIR + '';
            }
            return j;
        };
        this.deviceprintJava = function () {
            return (navigator.javaEnabled()) ? 1 : 0;
        };
        this.deviceprintCookie = function () {
            var a = (navigator.cookieEnabled) ? 1 : 0;
            if (typeof navigator.cookieEnabled === 'undefined' && !a) {
                document.cookie = 'testcookie';
                a = (document.cookie.indexOf('testcookie') !== -1) ? 1 : 0;
            }
            return a;
        };
        this.deviceprintAppName = function () {
            var a = navigator.appName;
            return (typeof a !== 'undefined') ? a : '';
        };
        this.deviceprintAppCodeName = function () {
            var a = navigator.appCodeName;
            return (typeof a !== 'undefined') ? a : '';
        };
        this.deviceprintOnline = function () {
            var a = navigator.onLine;
            return (typeof a !== 'undefined') ? a : '';
        };
        this.deviceprintOpsProfile = function () {
            var a = navigator.opsProfile;
            return ((typeof a !== 'undefined') && (a !== null)) ? a : '';
        };
        this.deviceprintUserProfile = function () {
            var a = navigator.userProfile;
            return ((typeof a !== 'undefined') && (a !== null)) ? a : '';
        };
        this.deviceprintScreenAvailWidth = function () {
            var a = screen.availWidth;
            return (typeof a !== 'undefined') ? a : '';
        };
        this.deviceprintScreenPixelDepth = function () {
            var a = screen.pixelDepth;
            return (typeof a !== 'undefined') ? a : '';
        };
        this.deviceprintScreenBufferDepth = function () {
            var a = screen.bufferDepth;
            return (typeof a !== 'undefined') ? a : '';
        };
        this.deviceprintScreenDeviceXDPI = function () {
            var a = screen.deviceXDPI;
            return (typeof a !== 'undefined') ? a : '';
        };
        this.deviceprintScreenDeviceYDPI = function () {
            var a = screen.deviceYDPI;
            return (typeof a !== 'undefined') ? a : '';
        };
        this.deviceprintScreenLogicalXDPI = function () {
            var a = screen.logicalXDPI;
            return (typeof a !== 'undefined') ? a : '';
        };
        this.deviceprintScreenLogicalYDPI = function () {
            var a = screen.logicalYDPI;
            return (typeof a !== 'undefined') ? a : '';
        };
        this.deviceprintScreenFontSmoothingEnabled = function () {
            var a = screen.fontSmoothingEnabled;
            return (typeof a !== 'undefined') ? a : '';
        };
        this.deviceprintScreenUpdateInterval = function () {
            var a = screen.updateInterval;
            return (typeof a !== 'undefined') ? a : '';
        };
        this.deviceprintPingIn = function () {
            if (ProxyCollector && ProxyCollector.internalPingTime) {
                return ProxyCollector.internalPingTime;
            } else {
                return '';
            }
        };
        this.deviceprintPingEx = function () {
            if (ProxyCollector && ProxyCollector.externalPingTime) {
                return ProxyCollector.externalPingTime;
            } else {
                return '';
            }
        };
    }

    function IEFingerPrint() {
        var c = [
            'abk', 'wnt', 'aol', 'arb', 'chs', 'cht', 'dht', 'dhj', 'dan',
            'dsh', 'heb', 'ie5', 'icw', 'ibe', 'iec', 'ieh', 'iee', 'jap',
            'krn', 'lan', 'swf', 'shw', 'msn', 'wmp', 'obp', 'oex', 'net',
            'pan', 'thi', 'tks', 'uni', 'vtc', 'vnm', 'mvm', 'vbs', 'wfd'
        ];
        var d = [
            '7790769C-0471-11D2-AF11-00C04FA35D02', '89820200-ECBD-11CF-8B85-00AA005B4340',
            '47F67D00-9E55-11D1-BAEF-00C04FC2D130', '76C19B38-F0C8-11CF-87CC-0020AFEECF20',
            '76C19B34-F0C8-11CF-87CC-0020AFEECF20', '76C19B33-F0C8-11CF-87CC-0020AFEECF20',
            '9381D8F2-0288-11D0-9501-00AA00B911A5', '4F216970-C90C-11D1-B5C7-0000F8051515',
            '283807B5-2C60-11D0-A31D-00AA00B92C03', '44BBA848-CC51-11CF-AAFA-00AA00B6015C',
            '76C19B36-F0C8-11CF-87CC-0020AFEECF20', '89820200-ECBD-11CF-8B85-00AA005B4383',
            '5A8D6EE0-3E18-11D0-821E-444553540000', '630B1DA0-B465-11D1-9948-00C04F98BBC9',
            '08B0E5C0-4FCB-11CF-AAA5-00401C608555', '45EA75A0-A269-11D1-B5BF-0000F8051515',
            'DE5AED00-A4BF-11D1-9948-00C04F98BBC9', '76C19B30-F0C8-11CF-87CC-0020AFEECF20',
            '76C19B31-F0C8-11CF-87CC-0020AFEECF20', '76C19B50-F0C8-11CF-87CC-0020AFEECF20',
            'D27CDB6E-AE6D-11CF-96B8-444553540000', '2A202491-F00D-11CF-87CC-0020AFEECF20',
            '5945C046-LE7D-LLDL-BC44-00C04FD912BE', '22D6F312-B0F6-11D0-94AB-0080C74C7E95',
            '3AF36230-A269-11D1-B5BF-0000F8051515', '44BBA840-CC51-11CF-AAFA-00AA00B6015C',
            '44BBA842-CC51-11CF-AAFA-00AA00B6015B', '76C19B32-F0C8-11CF-87CC-0020AFEECF20',
            '76C19B35-F0C8-11CF-87CC-0020AFEECF20', 'CC2A9BA0-3BDD-11D0-821E-444553540000',
            '3BF42070-B3B1-11D1-B5C5-0000F8051515', '10072CEC-8CC1-11D1-986E-00A0C955B42F',
            '76C19B37-F0C8-11CF-87CC-0020AFEECF20', '08B0E5C0-4FCB-11CF-AAA5-00401C608500',
            '4F645220-306D-11D2-995D-00C04F98BBC9', '73FA19D0-2D75-11D2-995D-00C04F98BBC9'
        ];
        this.deviceprintBrowser = function () {
            var t;
            var a = navigator.userAgent.toLowerCase();
            t = a + SEP + navigator.appVersion + SEP + navigator.platform;
            t += SEP + navigator.appMinorVersion + SEP + navigator.cpuClass + SEP + navigator.browserLanguage;
            t += SEP + ScriptEngineBuildVersion();
            return t;
        };
        this.deviceprintSoftware = function () {
            var b = '';
            var l = true;
            var i;
            var k;
            var j;
            var m;
            try {
                document.body.addBehavior('#default#clientCaps');
                m = d.length;
                for (i = 0; i < m; i++) {
                    k = activeXDetect(d[i]);
                    j = c[i];
                    if (k) {
                        if (l === true) {
                            b += j + PAIR + k;
                            l = false;
                        } else {
                            b += SEP + j + PAIR + k;
                        }
                    } else {
                        b += '';
                        l = false;
                    }
                }
            } catch (a) {
            }
            return b;
        };
    }

    IEFingerPrint.prototype = new FingerPrint();
    function MozillaFingerPrint() {
    }

    MozillaFingerPrint.prototype = new FingerPrint();
    function OperaFingerPrint() {
    }

    OperaFingerPrint.prototype = new FingerPrint();

    exports.FingerPrint = FingerPrint;
    exports.IEFingerPrint = IEFingerPrint;
    exports.MozillaFingerPrint = MozillaFingerPrint;
    exports.OperaFingerPrint = OperaFingerPrint;
});
