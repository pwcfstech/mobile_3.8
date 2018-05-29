! function(e, t) {
    "object" == typeof exports && "object" == typeof module ? module.exports = t(require("base"), require("core"), require("ui")) : "function" == typeof define && define.amd ? define(["base", "core", "ui"], t) : "object" == typeof exports ? exports["module-accounts"] = t(require("base"), require("core"), require("ui")) : e["module-accounts"] = t(e.base, e.core, e.ui)
}(this, function(e, t, n) {
    return function(e) {
        function t(o) {
            if (n[o]) return n[o].exports;
            var a = n[o] = {
                exports: {},
                id: o,
                loaded: !1
            };
            return e[o].call(a.exports, a, a.exports, t), a.loaded = !0, a.exports
        }
        var n = {};
        return t.m = e, t.c = n, t.p = "", t(0)
    }([function(e, t, n) {
        n(3), e.exports = n(7)
    }, , , function(e, t, n) {
        var o = n(4);
        "string" == typeof o && (o = [
            [e.id, o, ""]
        ]), n(6)(o, {}), o.locals && (e.exports = o.locals)
    }, function(e, t, n) {
        t = e.exports = n(5)(), t.push([e.id, "/*----------------------------------------------------------------*/\n/* Import Components\n/*----------------------------------------------------------------*/\n.lp-account-select .dropdown {\n  width: 100%;\n}\n.lp-account-select button.dropdown-toggle .lp-acct-detail,\n.lp-account-select ul.dropdown-menu .lp-acct-detail {\n  padding-top: 7px;\n  color: inherit;\n}\n.lp-account-select button.dropdown-toggle .lp-acct-from,\n.lp-account-select ul.dropdown-menu .lp-acct-from {\n  width: 40px;\n  font-size: 90%;\n  font-weight: bold;\n  padding-top: 2px;\n}\n.lp-account-select button.dropdown-toggle .lp-acct-name,\n.lp-account-select ul.dropdown-menu .lp-acct-name {\n  color: inherit;\n}\n.lp-account-select button.dropdown-toggle .lp-account-amount,\n.lp-account-select ul.dropdown-menu .lp-account-amount {\n  color: inherit;\n}\n.lp-account-select button.dropdown-toggle .lp-account-bal,\n.lp-account-select ul.dropdown-menu .lp-account-bal {\n  color: inherit;\n}\n.lp-account-select button.dropdown-toggle {\n  text-align: left;\n  border-radius: 0px;\n  border: none;\n  padding-top: 15px;\n  padding-bottom: 15px;\n}\n.lp-account-select button.dropdown-toggle .caret {\n  position: absolute;\n  top: 45%;\n  right: 5px;\n}\n.lp-account-select button.dropdown-toggle .lp-acct-name {\n  font-weight: bold;\n}\n.lp-account-select ul.dropdown-menu .lp-acct-from span {\n  visibility: hidden;\n}\n.lp-account-select .lp-large-account-select-size ul.dropdown-menu li a,\n.lp-account-select .lp-small-account-select-size ul.dropdown-menu li a {\n  padding: 15px 25px 15px 12px;\n}\n.lp-account-select .lp-small-account-select-size button.dropdown-toggle .lp-acct-num,\n.lp-account-select .lp-normal-account-select-size button.dropdown-toggle .lp-acct-num,\n.lp-account-select .lp-small-account-select-size button.dropdown-toggle .lp-account-bal,\n.lp-account-select .lp-normal-account-select-size button.dropdown-toggle .lp-account-bal,\n.lp-account-select .lp-small-account-select-size button.dropdown-toggle .lp-acct-from,\n.lp-account-select .lp-normal-account-select-size button.dropdown-toggle .lp-acct-from,\n.lp-account-select .lp-small-account-select-size ul.dropdown-menu .lp-acct-from,\n.lp-account-select .lp-normal-account-select-size ul.dropdown-menu .lp-acct-from {\n  display: none;\n}\n.lp-account-select .lp-small-account-select-size button.dropdown-toggle .lp-acct-detail,\n.lp-account-select .lp-normal-account-select-size button.dropdown-toggle .lp-acct-detail,\n.lp-account-select .lp-small-account-select-size button.dropdown-toggle .lp-account-amount,\n.lp-account-select .lp-normal-account-select-size button.dropdown-toggle .lp-account-amount {\n  padding-top: 0px;\n}\n.lp-account-select .lp-large-account-select-size button.dropdown-toggle .lp-acct-name,\n.lp-account-select .lp-large-account-select-size ul.dropdown-menu .lp-acct-name {\n  font-size: 110% !important;\n  font-weight: bold;\n}\n.lp-account-select .lp-large-account-select-size button.dropdown-toggle .lp-account-amount,\n.lp-account-select .lp-large-account-select-size ul.dropdown-menu .lp-account-amount {\n  font-size: 200% !important;\n  font-weight: bold;\n}\n.lp-payee-account-select .dropdown {\n  width: 100%;\n}\n.lp-payee-account-select button.dropdown-toggle .lp-acct-detail,\n.lp-payee-account-select ul.dropdown-menu .lp-acct-detail {\n  padding-top: 7px;\n  color: inherit;\n}\n.lp-payee-account-select button.dropdown-toggle .lp-acct-from,\n.lp-payee-account-select ul.dropdown-menu .lp-acct-from {\n  width: 40px;\n  font-size: 90%;\n  font-weight: bold;\n  padding-top: 2px;\n}\n.lp-payee-account-select button.dropdown-toggle .lp-acct-name,\n.lp-payee-account-select ul.dropdown-menu .lp-acct-name {\n  color: inherit;\n}\n.lp-payee-account-select button.dropdown-toggle .lp-account-amount,\n.lp-payee-account-select ul.dropdown-menu .lp-account-amount {\n  color: inherit;\n}\n.lp-payee-account-select button.dropdown-toggle .lp-account-bal,\n.lp-payee-account-select ul.dropdown-menu .lp-account-bal {\n  color: inherit;\n}\n.lp-payee-account-select button.dropdown-toggle {\n  text-align: left;\n  padding-top: 15px;\n  padding-bottom: 15px;\n}\n.lp-payee-account-select button.dropdown-toggle .caret {\n  position: absolute;\n  top: 45%;\n  right: 5px;\n}\n.lp-payee-account-select button.dropdown-toggle .lp-acct-name {\n  font-weight: bold;\n}\n.lp-payee-account-select ul.dropdown-menu .lp-acct-from span {\n  visibility: hidden;\n}\n.lp-payee-account-select .input-group button.dropdown-toggle {\n  border-bottom-left-radius: 0px;\n  border-top-left-radius: 0px;\n}\n.lp-payee-account-select .lp-large-account-select-size ul.dropdown-menu li a,\n.lp-payee-account-select .lp-small-account-select-size ul.dropdown-menu li a {\n  padding: 15px 25px 15px 12px;\n}\n.lp-payee-account-select .lp-small-account-select-size button.dropdown-toggle .lp-acct-num,\n.lp-payee-account-select .lp-normal-account-select-size button.dropdown-toggle .lp-acct-num,\n.lp-payee-account-select .lp-small-account-select-size button.dropdown-toggle .lp-account-bal,\n.lp-payee-account-select .lp-normal-account-select-size button.dropdown-toggle .lp-account-bal,\n.lp-payee-account-select .lp-small-account-select-size button.dropdown-toggle .lp-acct-from,\n.lp-payee-account-select .lp-normal-account-select-size button.dropdown-toggle .lp-acct-from,\n.lp-payee-account-select .lp-small-account-select-size ul.dropdown-menu .lp-acct-from,\n.lp-payee-account-select .lp-normal-account-select-size ul.dropdown-menu .lp-acct-from {\n  display: none;\n}\n.lp-payee-account-select .lp-small-account-select-size button.dropdown-toggle .lp-acct-detail,\n.lp-payee-account-select .lp-normal-account-select-size button.dropdown-toggle .lp-acct-detail,\n.lp-payee-account-select .lp-small-account-select-size button.dropdown-toggle .lp-account-amount,\n.lp-payee-account-select .lp-normal-account-select-size button.dropdown-toggle .lp-account-amount {\n  padding-top: 0px;\n}\n.lp-payee-account-select .lp-large-account-select-size button.dropdown-toggle .lp-acct-name,\n.lp-payee-account-select .lp-large-account-select-size ul.dropdown-menu .lp-acct-name {\n  font-size: 110% !important;\n  font-weight: bold;\n}\n.lp-payee-account-select .lp-large-account-select-size button.dropdown-toggle .lp-account-amount,\n.lp-payee-account-select .lp-large-account-select-size ul.dropdown-menu .lp-account-amount {\n  font-size: 200% !important;\n  font-weight: bold;\n}\n", ""])
    }, function(e, t) {
        e.exports = function() {
            var e = [];
            return e.toString = function() {
                for (var e = [], t = 0; t < this.length; t++) {
                    var n = this[t];
                    n[2] ? e.push("@media " + n[2] + "{" + n[1] + "}") : e.push(n[1])
                }
                return e.join("")
            }, e.i = function(t, n) {
                "string" == typeof t && (t = [
                    [null, t, ""]
                ]);
                for (var o = {}, a = 0; a < this.length; a++) {
                    var c = this[a][0];
                    "number" == typeof c && (o[c] = !0)
                }
                for (a = 0; a < t.length; a++) {
                    var l = t[a];
                    "number" == typeof l[0] && o[l[0]] || (n && !l[2] ? l[2] = n : n && (l[2] = "(" + l[2] + ") and (" + n + ")"), e.push(l))
                }
            }, e
        }
    }, function(e, t, n) {
        function o(e, t) {
            for (var n = 0; n < e.length; n++) {
                var o = e[n],
                    a = p[o.id];
                if (a) {
                    a.refs++;
                    for (var c = 0; c < a.parts.length; c++) a.parts[c](o.parts[c]);
                    for (; c < o.parts.length; c++) a.parts.push(r(o.parts[c], t))
                } else {
                    for (var l = [], c = 0; c < o.parts.length; c++) l.push(r(o.parts[c], t));
                    p[o.id] = {
                        id: o.id,
                        refs: 1,
                        parts: l
                    }
                }
            }
        }

        function a(e) {
            for (var t = [], n = {}, o = 0; o < e.length; o++) {
                var a = e[o],
                    c = a[0],
                    l = a[1],
                    r = a[2],
                    i = a[3],
                    s = {
                        css: l,
                        media: r,
                        sourceMap: i
                    };
                n[c] ? n[c].parts.push(s) : t.push(n[c] = {
                    id: c,
                    parts: [s]
                })
            }
            return t
        }

        function c() {
            var e = document.createElement("style"),
                t = m();
            return e.type = "text/css", t.appendChild(e), e
        }

        function l() {
            var e = document.createElement("link"),
                t = m();
            return e.rel = "stylesheet", t.appendChild(e), e
        }

        function r(e, t) {
            var n, o, a;
            if (t.singleton) {
                var r = g++;
                n = v || (v = c()), o = i.bind(null, n, r, !1), a = i.bind(null, n, r, !0)
            } else e.sourceMap && "function" == typeof URL && "function" == typeof URL.createObjectURL && "function" == typeof URL.revokeObjectURL && "function" == typeof Blob && "function" == typeof btoa ? (n = l(), o = u.bind(null, n), a = function() {
                n.parentNode.removeChild(n), n.href && URL.revokeObjectURL(n.href)
            }) : (n = c(), o = s.bind(null, n), a = function() {
                n.parentNode.removeChild(n)
            });
            return o(e),
                function(t) {
                    if (t) {
                        if (t.css === e.css && t.media === e.media && t.sourceMap === e.sourceMap) return;
                        o(e = t)
                    } else a()
                }
        }

        function i(e, t, n, o) {
            var a = n ? "" : o.css;
            if (e.styleSheet) e.styleSheet.cssText = h(t, a);
            else {
                var c = document.createTextNode(a),
                    l = e.childNodes;
                l[t] && e.removeChild(l[t]), l.length ? e.insertBefore(c, l[t]) : e.appendChild(c)
            }
        }

        function s(e, t) {
            var n = t.css,
                o = t.media;
            if (t.sourceMap, o && e.setAttribute("media", o), e.styleSheet) e.styleSheet.cssText = n;
            else {
                for (; e.firstChild;) e.removeChild(e.firstChild);
                e.appendChild(document.createTextNode(n))
            }
        }

        function u(e, t) {
            var n = t.css,
                o = (t.media, t.sourceMap);
            o && (n += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(o)))) + " */");
            var a = new Blob([n], {
                    type: "text/css"
                }),
                c = e.href;
            e.href = URL.createObjectURL(a), c && URL.revokeObjectURL(c)
        }
        var p = {},
            d = function(e) {
                var t;
                return function() {
                    return "undefined" == typeof t && (t = e.apply(this, arguments)), t
                }
            },
            f = d(function() {
                return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase())
            }),
            m = d(function() {
                return document.head || document.getElementsByTagName("head")[0]
            }),
            v = null,
            g = 0;
        e.exports = function(e, t) {
            t = t || {}, "undefined" == typeof t.singleton && (t.singleton = f());
            var n = a(e);
            return o(n, t),
                function(e) {
                    for (var c = [], l = 0; l < n.length; l++) {
                        var r = n[l],
                            i = p[r.id];
                        i.refs--, c.push(i)
                    }
                    if (e) {
                        var s = a(e);
                        o(s, t)
                    }
                    for (var l = 0; l < c.length; l++) {
                        var i = c[l];
                        if (0 === i.refs) {
                            for (var u = 0; u < i.parts.length; u++) i.parts[u]();
                            delete p[i.id]
                        }
                    }
                }
        };
        var h = function() {
            var e = [];
            return function(t, n) {
                return e[t] = n, e.filter(Boolean).join("\n")
            }
        }()
    }, function(e, t, n) {
        var o;
        (function(e) {
            o = function(e, t, o) {
                "use strict";
                o.name = "module-accounts";
                var a = n(9),
                    c = n(10),
                    l = n(11),
                    r = n(12),
                    i = n(14),
                    s = n(16),
                    u = [c.name, l.name, r.name, i.name, s.name];
                o.exports = a.createModule(o.name, u).value("groupsTimeout", 6e5).value("accountsTimeout", 1e4).provider(n(18)).value("customerId", "3").factory(n(19)).factory(n(20)).factory(n(21)).directive(n(22)).directive(n(23))
            }.call(t, n, t, e), !(void 0 !== o && (e.exports = o))
        }).call(t, n(8)(e))
    }, function(e, t) {
        e.exports = function(e) {
            return e.webpackPolyfill || (e.deprecate = function() {}, e.paths = [], e.children = [], e.webpackPolyfill = 1), e
        }
    }, function(t, n) {
        t.exports = e
    }, function(e, n) {
        e.exports = t
    }, function(e, t) {
        e.exports = n
    }, function(e, t, n) {
        var o;
        (function(e) {
            o = function(e, t, o) {
                "use strict";
                o.name = "account-select";
                var a = n(9),
                    c = n(10),
                    l = n(11),
                    r = [c.name, l.name];
                o.exports = a.createModule(o.name, r).directive(n(13))
            }.call(t, n, t, e), !(void 0 !== o && (e.exports = o))
        }).call(t, n(8)(e))
    }, function(e, t, n) {
        var o;
        o = function(e, t, o) {
            "use strict";
            var a = n(9).ng;
            t.lpAccountsSelect = function(e, t, n, o) {
                e.put("$accountSelectTemplate.html", '<div class=clearfix><div class="pull-left-custom lp-acct-detail"><div class=clearfix><div class=pull-left-custom><div class="labelAcc">Acc No. : <span class=labelAcc>{{option.id}}</span></div><div class="account-balance balance-amount amount-span" style="margin-top:5%;font-size:18px!important" ng-if="option.homeSaver">Available Balance :</div><div class="account-balance balance-amount amount-span pratz-pull-accbal" ng-if="option.preferredBalance === \'current\'"><span class="RupeeSymbol">&#8377;</span> <span ng-if="!option.homeSaver">{{option.availableBalance | currency: " "}}</span><span ng-if="option.homeSaver">{{option.bookedBalance | currency: " "}}</span></div><div class=lp-custom-fields><div ng-repeat="f in option.customFields track by $index" ng-class="\'lp-cf-\' + f">{{option[f]}}</div></div></div></div></div><div class=pull-accbal><div class="account-balance balance-amount amount-span" ng-show="!option.homeSaver" ng-if="option.preferredBalance === \'current\'">Account Balance : <span class="rupee-symbol">&#8377;</span> <span>{{option.availableBalance | currency: " "}}</span></div><div class="account-balance balance-amount amount-span" ng-show="!option.homeSaver" ng-if="option.preferredBalance === \'current\'">Hold Balance : <span class="rupee-symbol">&#8377;</span> <span>{{option.holdBalance | currency: " "}}</span></div></div></div>'), e.put("$cardsSelectTemplate.html", '<div class="clearfix"><div class="card-name-info hidden-sm"><div class="clearfix"><div class="pull-left-custom"><div class="lp-acct-name"><span>{{option.alias}}</span></div><div class="lp-acct-num"><small lp-i18n="card ending"></small> <span lp-aria-number="option.cardNumber"></span></div><div class="lp-custom-fields"><div ng-repeat="f in option.customFields track by $index" ng-class="\'lp-cf-\' + f">{{option[f]}}</div></div></div></div></div><div class="card-balance-info text-right text-uppercase h6"><div><small ng-if="option.preferredBalance === \'current\'" lp-i18n="Current balance"></small><br/><small ng-if="option.preferredBalance !== \'current\'" lp-i18n="Available credit"></small><br/><span class="h4" lp-format-amount="option" lp-balance-update="lp-balance-update" ng-model="option"></span></div><div ng-if="option.preferredBalance === \'current\'"><small lp-i18n="Available credit"></small> <span lp-amount="option.availableBalance" lp-amount-currency="option.currency"/></div><div ng-if="option.preferredBalance !== \'current\'"><small lp-i18n="Current balance"></small><br/><span lp-amount="option.bookedBalance" lp-amount-currency="option.currency"/></div></div></div>');
                var c = function(e) {
                        var t = "cards" === e ? "$cardsSelectTemplate.html" : "$accountSelectTemplate.html";
                        return ['<div class="lp-account-select">', '<div class="clearfix" dropdown-select ng-model="model" ng-options="account as account for account in accounts"', 'option-template-url="' + t + '" ng-change="changed()" lp-element-resize="resize(data)"', 'empty-placeholder-text="Select an account...">', "</div>", "</div>"].join("")
                    },
                    l = function(e) {
                        return e > 400 ? "lp-large-account-select-size" : e > 300 ? "lp-normal-account-select-size" : "lp-small-account-select-size"
                    },
                    r = function(e, r, i, s) {
                        function u() {
                            t(function() {
                                e.$apply()
                            })
                        }
                        i.prefferedBalanceView && !i.preferredBalanceView && (i.preferredBalanceView = i.prefferedBalanceView), e.preferredBalance = i.preferredBalanceView || "current", r.html(c(i.type));
                        var p = i.customFields;
                        if (p && (p = p.split(",")), n(r.contents())(e), i.designatedClass) {
                            var d = a.element(r.children()[0]);
                            d.addClass(i.designatedClass)
                        }
                        s.$render = function() {
                            var t = s.$modelValue,
                                n = e.accounts;
                            n && n.length > 0 ? a.forEach(n, function(n) {
                                n.preferredBalance = e.preferredBalance, p && !n.customFields && (n.customFields = p), t && t.id === n.id && (e.model = n)
                            }) : e.model = null, u()
                        }, e.changed = function() {
                            s.$setViewValue(e.model)
                        }, e.$watch("lpAccounts", function(t) {
                            e.accounts = t || [], s.$render()
                        }), o.subscribe("accounts-dropdown.select-account", function(e) {
                            s.$modelValue = e, s.$render()
                        }), e.resize = function(e) {
                            e.element.removeClass("lp-large-account-select-size"), e.element.removeClass("lp-normal-account-select-size"), e.element.removeClass("lp-small-account-select-size"), e.element.addClass(l(e.width))
                        }
                    };
                return {
                    restrict: "EA",
                    replace: !0,
                    require: "ngModel",
                    scope: {
                        lpAccounts: "="
                    },
                    link: r
                }
            }, t.lpAccountsSelect.$inject = ["$templateCache", "$timeout", "$compile", "lpCoreBus"]
        }.call(t, n, t, e), !(void 0 !== o && (e.exports = o))
    }, function(e, t, n) {
        var o;
        (function(e) {
            o = function(e, t, o) {
                "use strict";
                o.name = "payee-account-select";
                var a = n(9),
                    c = n(10),
                    l = n(11),
                    r = [c.name, l.name];
                o.exports = a.createModule(o.name, r).directive(n(15))
            }.call(t, n, t, e), !(void 0 !== o && (e.exports = o))
        }).call(t, n(8)(e))
    }, function(e, t, n) {
        var o;
        o = function(e, t, o) {
            "use strict";
            var a = n(9).ng;
            t.lpPayeeAccountSelect = function(e, t) {
                e.put("$payeeAccountSelect.html", '<div class="clearfix"><div class="pull-left-custom lp-acct-detail"><div class="clearfix"><div class="pull-left-custom"><div class="lp-acct-name"><span>{{option.alias}}</span><span class="lp-acct-num">{{ option.shortIdentifier }}</span></div><div class="lp-custom-fields"><div ng-repeat="f in option.customFields track by $index" ng-class="\'lp-cf-\' + f">{{option[f]}}</div></div></div></div></div><div ng-hide="option.hideAmounts" class="pull-right text-right"><div class="lp-account-amount"><span class="sr-only" lp-i18n="Account balance"></span><span lp-format-amount="option" lp-balance-update="lp-balance-update" ng-model="option"></span></div></div></div>');
                var n = function() {
                        var e = "$payeeAccountSelect.html";
                        return ['<div class="lp-payee-account-select">', "<div ng-class=\"{ 'input-group': lpSelectLabel }\">", '<span class="input-group-addon" ng-if="lpSelectLabel">{{ lpSelectLabel }}</span>', '<div class="clearfix" dropdown-select ng-model="model" ng-options="account as account for account in accounts"', 'option-template-url="' + e + '" ng-change="changed()" lp-element-resize="resize(data)"', 'empty-placeholder-text="Select your destination account...">', "</div>", "</div>", "</div>"].join("")
                    },
                    o = function(e) {
                        return e > 400 ? "lp-large-account-select-size" : e > 300 ? "lp-normal-account-select-size" : "lp-small-account-select-size"
                    },
                    c = function(e, c, l, r) {
                        l.prefferedBalanceView && !l.preferredBalanceView && (l.preferredBalanceView = l.prefferedBalanceView), e.preferredBalance = l.preferredBalanceView || "current", c.html(n());
                        var i = l.customFields;
                        if (i && (i = i.split(",")), t(c.contents())(e), l.designatedClass) {
                            var s = a.element(c.children()[0]);
                            s.addClass(l.designatedClass)
                        }
                        r.$render = function() {
                            var t = r.$modelValue,
                                n = e.accounts;
                            n && n.length > 0 ? a.forEach(n, function(n) {
                                n.preferredBalance = e.preferredBalance, n.shortIdentifier = " * " + n.identifier.substr(-4), i && !n.customFields && (n.customFields = i), t && t.id === n.id && (e.model = n)
                            }) : e.model = null
                        }, e.changed = function() {
                            r.$setViewValue(e.model)
                        }, e.$watch("lpAccounts", function(t) {
                            e.accounts = t || [], r.$render()
                        }), e.resize = function(e) {
                            e.element.removeClass("lp-large-account-select-size"), e.element.removeClass("lp-normal-account-select-size"), e.element.removeClass("lp-small-account-select-size"), e.element.addClass(o(e.width))
                        }
                    };
                return {
                    restrict: "EA",
                    replace: !0,
                    require: "ngModel",
                    scope: {
                        lpAccounts: "=",
                        lpSelectLabel: "@"
                    },
                    link: c
                }
            }, t.lpPayeeAccountSelect.$inject = ["$templateCache", "$compile"]
        }.call(t, n, t, e), !(void 0 !== o && (e.exports = o))
    }, function(e, t, n) {
        var o;
        (function(e) {
            o = function(e, t, o) {
                "use strict";
                o.name = "module-accounts-deprecated";
                var a = n(9);
                o.exports = a.createModule(o.name, []).factory(n(17))
            }.call(t, n, t, e), !(void 0 !== o && (e.exports = o))
        }).call(t, n(8)(e))
    }, function(e, t, n) {
        var o;
        o = function(e, t, o) {
            "use strict";
            var a = n(9);
            t.AccountsChartModel = function(e, t) {
                var n = function(e) {
                    a.utils.deprecate("AccountsChartModel is deprecated."), this.accountsChartModel = t.getInstance({
                        endpoint: e.accountsChartEndpoint,
                        urlVars: {
                            accountId: e.accountId
                        }
                    }), this.chartData = null, this.error = !1
                };
                return n.prototype.load = function(e) {
                    var t, n = this;
                    return t = n.accountsChartModel.read(e).success(function(e) {
                        n.chartData = e
                    }), t.error(function(e) {
                        e.errors && (n.error = e.errors[0].code)
                    }), t
                }, {
                    getInstance: function(e) {
                        return new n(e)
                    }
                }
            }, t.AccountsChartModel.$inject = ["$rootScope", "httpService"]
        }.call(t, n, t, e), !(void 0 !== o && (e.exports = o))
    }, function(e, t, n) {
        var o;
        o = function(e, t, n) {
            "use strict";
            var o = "accountsEndpoint",
                a = "defaultAccount";
            t.lpAccounts = function(e) {
                var t;
                this.setConfig = function(e) {
                    t = e
                };
                var n = function(t, n, o) {
                        var a, c;
                        return o = o || "*", n = parseInt(n, 10) || 0, t ? n ? (c = e.range(n).map(function() {
                            return o
                        }).join(""), a = new RegExp("^.{0," + n + "}", "i"), t.replace(a, c)) : t : ""
                    },
                    c = function(t) {
                        return e.isPlainObject(t) ? e.chain(t).values().flatten().value() : t
                    };
                this.$get = function(l, r) {
                    var i = function(e) {
                        this.accounts = [], this.error = !1, this.setConfig(e)
                    };
                    return i.prototype.setConfig = function(t) {
                        t && t[o] && (t[o] = e.resolvePortalPlaceholders(t[o])), this.config = t
                    }, i.prototype.getAttribute = function(e) {
                        return this.config && this.config[e]
                    }, i.prototype.load = function(e) {
                        return l.get(this.getAttribute(o)).then(function(t) {
                            return this.refreshAccounts(t.data, e)
                        }.bind(this))
                    }, i.prototype.getAll = function(e) {
                        return this.load(e)
                    }, i.prototype.pluckDefaultAccount = function(t) {
                        var n = e(t);
                        return n.first()
                    }, i.prototype.getDefaultAccountBban = function() {
                        return this.getAttribute(a)
                    }, i.prototype.configureAccountIdentifiers = function(t) {
                        var o = this,
                            a = {
                                EU: "IBAN",
                                US: "BBAN",
                                "en-US": "BBAN"
                            },
                            c = function(t) {
                                return o.config[t] || e.getPagePreference(t) || e.getPortalProperty(t)
                            },
                            l = c("locale");
                        l && a[l] || (l = "EU"), t.accountIdentification && e.forEach(t.accountIdentification, function(e) {
                            e.scheme === a[l] && (!c("hideAccount") && c("maskAccount") ? t.identifier = n(e.id, c("maskAccount")) : c("hideAccount") || c("maskAccount") || (t.identifier = e.id))
                        })
                    }, i.prototype.findById = function(e) {
                        return this.accounts.filter(function(t) {
                            return t.id === e
                        })[0]
                    }, i.prototype.findByAccountNumber = function(e) {
                        return this.accounts.filter(function(t) {
                            return t.bban === e
                        })[0]
                    }, i.prototype.getPending = function(e) {
                        return e.bookedBalance - e.availableBalance
                    }, i.prototype.getGroupSize = function(e) {
                        for (var t = 0, n = 0; n < this.accounts.length; n++) this.accounts[n].groupCode === e.code && t++;
                        return t
                    }, i.prototype.configurePreviousBalanceDeltas = function(e) {
                        var t = this;
                        t.previousBalances ? (t.previousBalances[e.id] > e.availableBalance ? e.delta = -1 : t.previousBalances[e.id] < e.availableBalance ? e.delta = 1 : e.delta = 0, t.previousBalances[e.id] = e.availableBalance) : (t.previousBalances = [], e.delta = 0, t.previousBalances[e.id] = e.availableBalance)
                    }, i.prototype.refreshAccounts = function(e, t) {
                        t === !0 && (this.accounts = []), e = c(e);
                        for (var n = 0; n < e.length; n++) this.configureAccountIdentifiers(e[n]), this.configurePreviousBalanceDeltas(e[n]), this.formatAccountBalance(e[n]), this.accounts.push(e[n]);
                        return this.accounts
                    }, i.prototype.getGroupTotal = function(e) {
                        for (var t, n, o = 0, a = 0; a < this.accounts.length; a++) t = this.accounts[a], t.groupCode === e.code && (o += t.balance, n = t.currency);
                        return {
                            totalBalance: o,
                            currency: n
                        }
                    }, i.prototype.formatAccountBalance = function(e) {
                        e.availableBalance = parseFloat(e.availableBalance), e.bookedBalance = parseFloat(e.bookedBalance)
                    }, new i(t)
                }, this.$get.$inject = ["$http", "$q"]
            }, t.lpAccounts.$inject = ["lpCoreUtils"], t.AccountsModel = t.lpAccounts
        }.call(t, n, t, e), !(void 0 !== o && (e.exports = o))
    }, function(e, t, n) {
        var o;
        o = function(e, t, n) {
            "use strict";
            t.AssetsModel = function(e, t, n, o, a, c) {
                var l = function(e) {
                    var t = this;
                    e.assetsEndpoint = a.resolvePortalPlaceholders(e.assetsEndpoint), t.assetsResource = o(e.assetsEndpoint), t.groupsEnabled = !!e.groupsEndpoint, t.groupsEnabled && (e.groupsEndpoint = a.resolvePortalPlaceholders(e.groupsEndpoint), t.groupsResource = o(e.groupsEndpoint)), t.filterByGroupCode = e.groupCodeFilter, t.accounts = null, t.groups = null, t.assetCollection = [], t.error = !1, gadgets.pubsub.subscribe("launchpad-retail:ACCOUNT_BALANCE_CHANGED", function(e) {
                        null !== t.accounts && t.load()
                    })
                };
                return l.prototype.load = function() {
                    var e = c.defer(),
                        t = this;
                    return t.assetsResource.get().$promise.then(function(n) {
                        t.accounts = n, gadgets.pubsub.publish("launchpad-retail.accountsLoaded", n["current-account"]), t.groupsResource ? t.groupsResource.query().$promise.then(function(n) {
                            t.groups = n, t.configureAssetCollection(), e.resolve()
                        }) : (t.configureAssetCollection(), e.resolve())
                    }), e.promise
                }, l.prototype.configureAssetCollection = function() {
                    var e = this;
                    if (e.groupsEnabled)
                        for (var t, n = 0; n < e.groups.length; n++) {
                            t = {
                                title: e.groups[n].defaultTitle,
                                code: e.groups[n].code,
                                accounts: [],
                                isCollapsed: !1
                            };
                            for (var o in e.accounts) e.accounts.hasOwnProperty(o) && o === e.groups[n].code && (t.accounts = e.checkExternalAccountVisibility(e.accounts[o]));
                            if (t.accounts.length > 0) {
                                for (var a = 0; a < t.accounts.length; a++) e.formatAccountBalance(t.accounts[a]), e.configurePreviousBalanceDelta(t.accounts[a]);
                                e.assetCollection.push(t)
                            }
                        } else
                            for (var c in e.accounts)
                                if (e.accounts.hasOwnProperty(c))
                                    for (var l = 0; l < e.accounts[c].length; l++) e.formatAccountBalance(e.accounts[c][l]), e.configurePreviousBalanceDelta(e.accounts[c][l]), e.assetCollection.push(e.accounts[c][l])
                }, l.prototype.checkExternalAccountVisibility = function(e) {
                    return a.filter(e, function(e) {
                        return !e.accountServicer || e.accountServicer.display
                    })
                }, l.prototype.getPending = function(e) {
                    return e.bookedBalance - e.availableBalance
                }, l.prototype.configurePreviousBalanceDelta = function(e) {
                    var t = this;
                    t.previousBalances ? (t.previousBalances[e.id] > e.availableBalance ? e.delta = -1 : t.previousBalances[e.id] < e.availableBalance ? e.delta = 1 : e.delta = 0, t.previousBalances[e.id] = e.availableBalance) : (t.previousBalances = [], e.delta = 0, t.previousBalances[e.id] = e.availableBalance)
                }, l.prototype.findById = function(e) {
                    var t, n = this;
                    if (n.groupsEnabled) {
                        for (var o = 0; o < n.assetCollection.length; o++)
                            for (var a = 0; a < n.assetCollection[o].accounts.length; a++)
                                if (n.assetCollection[o].accounts[a].id === e) {
                                    t = n.assetCollection[o].accounts[a];
                                    break
                                }
                    } else
                        for (var c = 0; c < n.assetCollection.length; c++)
                            if (n.assetCollection[c].id === e) {
                                t = n.assetCollection[c];
                                break
                            } return t
                }, l.prototype.getGroupTotal = function(e) {
                    for (var t, n, o = 0, a = 0; a < e.accounts.length; a++) t = e.accounts[a], o += t.availableBalance, n = t.currency;
                    return {
                        totalBalance: o,
                        currency: n
                    }
                }, l.prototype.formatAccountBalance = function(e) {
                    e.availableBalance = parseFloat(e.availableBalance), e.bookedBalance = parseFloat(e.bookedBalance)
                }, {
                    getInstance: function(e) {
                        return new l(e)
                    }
                }
            }, t.AssetsModel.$inject = ["$rootScope", "accountsTimeout", "groupsTimeout", "$resource", "lpCoreUtils", "$q"]
        }.call(t, n, t, e), !(void 0 !== o && (e.exports = o))
    }, function(e, t, n) {
        var o;
        o = function(e, t, n) {
            "use strict";
            t.CardsModel = function(e, t) {
                var n = function(n) {
                    var o = this;
                    n.cardsEndpoint = e.resolvePortalPlaceholders(n.cardsEndpoint), o.cards = [], o.selected = {}, o.cardsService = t(n.cardsEndpoint, {}, {
                        update: {
                            method: "PUT"
                        }
                    })
                };
                return n.prototype.load = function() {
                    var e = this;
                    return e.cardsService.query({}, function(t) {
                        e.cards = t
                    }).$promise
                }, n.prototype.loadCardDetails = function(e) {
                    var t = this;
                    return t.cardsService.get({
                        id: e
                    }, function(e) {
                        t.selected = e
                    }).$promise
                }, n.prototype.loadCardLoyaltyDetails = function(e) {
                    var t = this;
                    return e || (e = t.selected.id), t.cardsService.get({
                        id: e,
                        noun: "loyalty"
                    }, function(e) {
                        t.selected.loyalty = e.loyalty
                    }).$promise
                }, n.prototype.findById = function(e) {
                    for (var t, n = this, o = 0; o < n.cards.length; o++)
                        if (n.cards[o].id === e) {
                            t = n.cards[o];
                            break
                        }
                    return t
                }, {
                    getInstance: function(e) {
                        return new n(e)
                    }
                }
            }, t.CardsModel.$inject = ["lpCoreUtils", "$resource"]
        }.call(t, n, t, e), !(void 0 !== o && (e.exports = o))
    }, function(e, t, n) {
        var o;
        o = function(e, t, n) {
            "use strict";
            t.FinancialInstituteModel = function(e, t, n) {
                var o = function(e) {
                    var o = this;
                    o.enableGrouping = e.enableGrouping, e.financialInstitutesEndpoint = n.resolvePortalPlaceholders(e.financialInstitutesEndpoint), o.financialInstitutesService = t(e.financialInstitutesEndpoint), e.membershipRequestsEndpoint = n.resolvePortalPlaceholders(e.membershipRequestsEndpoint), o.membershipRequestsService = t(e.membershipRequestsEndpoint), o.selected = {}, o.selectedMembership = {}, o.financialInstitutes = [], o.membershipRequests = [], o.errors = [], o.warnings = []
                };
                return o.prototype.searchFinancialInstitutes = function(e, t) {
                    var n = this;
                    e.search = "search";
                    var o = n.financialInstitutesService.query(e).$promise;
                    return o.then(function(e) {
                        if (t)
                            for (var o = 0; o < e.length; o++) n.financialInstitutes.push(e[o]);
                        else n.financialInstitutes = e
                    }, function(e) {
                        n.addError({
                            captionCode: "badConnection"
                        })
                    }), o
                }, o.prototype.setSelected = function(e) {
                    var t = this;
                    t.selected = e
                }, o.prototype.loadMembershipRequests = function() {
                    var e = this,
                        t = e.membershipRequestsService.query().$promise;
                    return t.then(function(t) {
                        e.membershipRequests = t
                    }, function() {
                        e.addError({
                            captionCode: "badConnection"
                        })
                    }), t
                }, o.prototype.loadMembershipRequestByID = function(e) {
                    var t = this,
                        n = t.membershipRequestsService.get({
                            id: e
                        }).$promise;
                    return n.then(function(e) {
                        t.selectedMembership = e
                    }, function() {
                        t.addError({
                            captionCode: "badConnection"
                        })
                    }), n
                }, o.prototype.getRequiredCredentials = function() {
                    var e = this,
                        t = {
                            id: e.selected.id,
                            credentials: "credentials"
                        },
                        n = e.financialInstitutesService.query(t).$promise;
                    return n.then(function(t) {
                        e.selected.requiredUserCredentials = t
                    }, function(t) {
                        e.addError({
                            captionCode: "badConnection"
                        })
                    }), n
                }, o.prototype.createMembershipRequest = function(e) {
                    var t = this,
                        n = new t.membershipRequestsService;
                    n.institutionId = e.id, n.credentials = [];
                    for (var o = 0; o < e.requiredUserCredentials.length; o++) {
                        var a = {};
                        a.credentialId = e.requiredUserCredentials[o].id, a.value = e.requiredUserCredentials[o].fieldValue, n.credentials.push(a)
                    }
                    var c = n.$save();
                    return c.then(function(e) {
                        t.selectedMembership = e
                    }, function() {
                        t.addError({
                            captionCode: "invalidCredentials"
                        })
                    }), c
                }, o.prototype.updateMembershipRequest = function(e) {
                    var t = this,
                        n = new t.membershipRequestsService;
                    n.institutionId = e.institutionId, n.credentials = [];
                    for (var o = 0; o < t.selected.requiredUserCredentials.length; o++) {
                        var a = {};
                        a.credentialId = t.selected.requiredUserCredentials[o].id, a.value = t.selected.requiredUserCredentials[o].fieldValue, n.credentials.push(a)
                    }
                    var c = n.$save({
                        id: e.id,
                        credentials: "credentials"
                    });
                    return c.then(function(e) {
                        t.selectedMembership = e
                    }, function(e) {
                        401 === e.status ? t.addError({
                            captionCode: "invalidCredentials"
                        }) : t.addError({
                            captionCode: "badConnection"
                        })
                    }), c
                }, o.prototype.addError = function(e) {
                    for (var t = this, n = !1, o = 0; o < t.errors.length; o++) t.errors[o].captionCode === e.captionCode && (n = !0);
                    n || t.errors.push(e)
                }, o.prototype.addWarning = function(e) {
                    for (var t = this, n = !1, o = 0; o < t.warnings.length; o++) t.warnings[o].captionCode === e.captionCode && (n = !0);
                    n || t.warnings.push(e)
                }, o.prototype.clearErrors = function() {
                    var e = this;
                    e.errors = []
                }, o.prototype.clearWarnings = function() {
                    var e = this;
                    e.warnings = []
                }, {
                    getInstance: function(e) {
                        return new o(e)
                    }
                }
            }, t.FinancialInstituteModel.$inject = ["httpService", "$resource", "lpCoreUtils"]
        }.call(t, n, t, e), !(void 0 !== o && (e.exports = o))
    }, function(e, t, n) {
        var o;
        o = function(e, t, n) {
            "use strict";
            t.dynamicCredentialInput = function(e) {
                return e.put("credentialInput.html", '<div ng-switch on="credential.inputFieldType"><div ng-switch-when="text"><input type="text" class="form-control" ng-model="credential.fieldValue" aria-label="{{credential.inputFieldLabel}}" /></div><div ng-switch-when="password"><input type="password" class="form-control" ng-model="credential.fieldValue" aria-label="{{credential.inputFieldLabel}}" /></div><div ng-switch-when="hidden"><input type="hidden" class="form-control" ng-model="credential.fieldValue" aria-label="{{credential.inputFieldLabel}}" /></div><div ng-switch-when="select"><div dropdown-select="dropdown-select" ng-model="credential.fieldValue" ng-options="option as option for option in credential.options"></div></div><div ng-switch-when="checkbox" class="checkbox"><div ng-repeat="option in credential.options"><label><input type="checkbox" ng-click="handleMultiCheckbox(option)" aria-label="{{option}}" />{{option}}</label></div></div><div ng-switch-when="radio" class="radio"><div ng-repeat="option in credential.options"><label><input type="radio" ng-model="credential.fieldValue" name="radio-{{credential.id}}" value="{{option}}" aria-label="{{option}}" />{{option}}</label></div></div><div ng-switch-when="img"><img ng-src="{{credential.metaData}}" alt="{{credential.inputFieldlabel}}" /><br /><br /><label class="radio-inline"><input type="radio" ng-model="credential.fieldValue" name="radio-{{credential.id}} value="true" aria-label="Yes" />Yes</label><label class="radio-inline"><input type="radio" ng-model="credential.fieldValue" name="radio-{{credential.id}} value="false" aria-label="False" />No</label></div><div ng-switch-when="imgd"><img ng-src="data:{{credential.metaData}}" alt="{{credential.inputFieldlabel}}" /><br /><br /><label class="radio-inline"><input type="radio" ng-model="credential.fieldValue" name="radio-{{credential.id}} value="true" aria-label="Yes" />Yes</label><label class="radio-inline"><input type="radio" ng-model="credential.fieldValue" name="radio-{{credential.id}} value="false" aria-label="False" />No</label></div></div>'), {
                    restrict: "A",
                    replace: !0,
                    require: "ngModel",
                    scope: {
                        credential: "="
                    },
                    template: e.get("credentialInput.html"),
                    link: function(e, t, n, o) {
                        var a = {
                                TEXT: "text",
                                PASSWORD: "password",
                                OPTIONS: "select",
                                LOGIN: "text",
                                CHECKBOX: "checkbox",
                                RADIO: "radio",
                                URL: "text",
                                HIDDEN: "hidden",
                                IMAGE_URL: "img",
                                CONTENT_URL: "text",
                                CUSTOM: "text",
                                CLUDGE: "text",
                                TOKEN: "text",
                                IMAGE_DATA: "imgd"
                            },
                            c = function() {
                                l(e.credential)
                            };
                        e.handleMultiCheckbox = function(t) {
                            for (var n = !1, o = 0; o < e.credential.fieldValue.length; o++)
                                if (e.credential.fieldValue[o] === t) {
                                    n = !0, e.credential.fieldValue.splice(o, 1);
                                    break
                                }
                            n || e.credential.fieldValue.push(t)
                        };
                        var l = function(e) {
                            e.inputFieldType = a[e.inputFieldType], e.inputFieldType === a.CHECKBOX && (e.fieldValue = [])
                        };
                        c()
                    }
                }
            }, t.dynamicCredentialInput.$inject = ["$templateCache"]
        }.call(t, n, t, e), !(void 0 !== o && (e.exports = o))
    }, function(e, t, n) {
        var o;
        o = function(e, t, o) {
            "use strict";
            n(9).ng, t.lpFormatAmount = function(e, t, n) {
                return {
                    restrict: "A",
                    scope: {
                        account: "=lpFormatAmount"
                    },
                    link: function(e, o, a) {
                        e.$watch("account", function(e) {
                            var a = [];
                            a.available = e.availableBalance, a.current = e.bookedBalance;
                            var c = n.getPreferenceFromParents("preferredBalanceView") || "current",
                                l = t.formatCurrency(a[c], e.currency);
                            l = l.replace(/(\d*)$/, '<span class="decimals">$1</span>'), o.html(l)
                        })
                    }
                }
            }, t.lpFormatAmount.$inject = ["$parse", "lpCoreI18n", "widget"]
        }.call(t, n, t, e), !(void 0 !== o && (e.exports = o))
    }])
});