! function(e, t) {
    "object" == typeof exports && "object" == typeof module ? module.exports = t(require("base"), require("core"), require("jquery"), require("hammerjs")) : "function" == typeof define && define.amd ? define(["base", "core", "jquery", "hammerjs"], t) : "object" == typeof exports ? exports.ui = t(require("base"), require("core"), require("jquery"), require("hammerjs")) : e.ui = t(e.base, e.core, e.jquery, e.hammerjs)
}(this, function(e, t, n, i) {
    return function(e) {
        function t(i) {
            if (n[i]) return n[i].exports;
            var a = n[i] = {
                exports: {},
                id: i,
                loaded: !1
            };
            return e[i].call(a.exports, a, a.exports, t), a.loaded = !0, a.exports
        }
        var n = {};
        return t.m = e, t.c = n, t.p = "", t(0)
    }([function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                i.name = "ui";
                var a = n(2);
                n(3);
                var o = ["ui.bootstrap", n(4).name, n(6).name, n(9).name, n(11).name, n(15).name, n(18).name, n(21).name, n(23).name, n(25).name, n(27).name, n(29).name, n(31).name, n(33).name, n(36).name, n(38).name, n(41).name, n(43).name, n(45).name, n(47).name, n(57).name, n(60).name, n(63).name, n(66).name, n(68).name, n(70).name];
                i.exports = a.createModule(i.name, o)
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t) {
        e.exports = function(e) {
            return e.webpackPolyfill || (e.deprecate = function() {}, e.paths = [], e.children = [], e.webpackPolyfill = 1), e
        }
    }, function(t, n) {
        t.exports = e
    }, function(e, t, n) {
        var i;
        i = function(e, t, i) {
            var a = n(2).ng;
            a.module("ui.bootstrap", ["ui.bootstrap.tpls", "ui.bootstrap.transition", "ui.bootstrap.collapse", "ui.bootstrap.accordion", "ui.bootstrap.dateparser", "ui.bootstrap.alert", "ui.bootstrap.bindHtml", "ui.bootstrap.buttons", "ui.bootstrap.carousel", "ui.bootstrap.position", "ui.bootstrap.datepicker", "ui.bootstrap.dropdown", "ui.bootstrap.dropdownSelect", "ui.bootstrap.modal", "ui.bootstrap.pagination", "ui.bootstrap.tooltip", "ui.bootstrap.popover", "ui.bootstrap.progressbar", "ui.bootstrap.rating", "ui.bootstrap.tabs", "ui.bootstrap.timepicker", "ui.bootstrap.typeahead"]), a.module("ui.bootstrap.tpls", ["template/accordion/accordion-group.html", "template/accordion/accordion.html", "template/alert/alert.html", "template/carousel/carousel.html", "template/carousel/slide.html", "template/datepicker/datepicker.html", "template/datepicker/day.html", "template/datepicker/month.html", "template/datepicker/popup.html", "template/datepicker/year.html", "template/dropdownSelect/option.html", "template/dropdownSelect/placeholder-empty.html", "template/dropdownSelect/select.html", "template/modal/backdrop.html", "template/modal/window.html", "template/pagination/pager.html", "template/pagination/pagination.html", "template/tooltip/tooltip-html-unsafe-popup.html", "template/tooltip/tooltip-popup.html", "template/popover/popover.html", "template/progressbar/bar.html", "template/progressbar/progress.html", "template/progressbar/progressbar.html", "template/rating/rating.html", "template/tabs/tab.html", "template/tabs/tabset.html", "template/timepicker/timepicker.html", "template/typeahead/typeahead-match.html", "template/typeahead/typeahead-popup.html"]), a.module("ui.bootstrap.transition", []).factory("$transition", ["$q", "$timeout", "$rootScope", function(e, t, n) {
                function i(e) {
                    for (var t in e)
                        if (void 0 !== r.style[t]) return e[t]
                }
                var o = function(i, r, l) {
                        l = l || {};
                        var s = e.defer(),
                            c = o[l.animation ? "animationEndEventName" : "transitionEndEventName"],
                            u = function(e) {
                                n.$apply(function() {
                                    i.unbind(c, u), s.resolve(i)
                                })
                            };
                        return c && i.bind(c, u), t(function() {
                            a.isString(r) ? i.addClass(r) : a.isFunction(r) ? r(i) : a.isObject(r) && i.css(r), c || s.resolve(i)
                        }), s.promise.cancel = function() {
                            c && i.unbind(c, u), s.reject("Transition cancelled")
                        }, s.promise
                    },
                    r = document.createElement("trans"),
                    l = {
                        WebkitTransition: "webkitTransitionEnd",
                        MozTransition: "transitionend",
                        OTransition: "oTransitionEnd",
                        transition: "transitionend"
                    },
                    s = {
                        WebkitTransition: "webkitAnimationEnd",
                        MozTransition: "animationend",
                        OTransition: "oAnimationEnd",
                        transition: "animationend"
                    };
                return o.transitionEndEventName = i(l), o.animationEndEventName = i(s), o
            }]), a.module("ui.bootstrap.collapse", ["ui.bootstrap.transition"]).directive("collapse", ["$transition", function(e) {
                return {
                    link: function(t, n, i) {
                        function a(t) {
                            function i() {
                                c === a && (c = void 0)
                            }
                            var a = e(n, t);
                            return c && c.cancel(), c = a, a.then(i, i), a
                        }

                        function o() {
                            u ? (u = !1, r()) : (n.removeClass("collapse").addClass("collapsing"), a({
                                height: n[0].scrollHeight + "px"
                            }).then(r))
                        }

                        function r() {
                            n.removeClass("collapsing"), n.addClass("collapse in"), n.css({
                                height: "auto"
                            })
                        }

                        function l() {
                            if (u) u = !1, s(), n.css({
                                height: 0
                            });
                            else {
                                n.css({
                                    height: n[0].scrollHeight + "px"
                                });
                                n[0].offsetWidth;
                                n.removeClass("collapse in").addClass("collapsing"), a({
                                    height: 0
                                }).then(s)
                            }
                        }

                        function s() {
                            n.removeClass("collapsing"), n.addClass("collapse")
                        }
                        var c, u = !0;
                        t.$watch(i.collapse, function(e) {
                            e ? l() : o()
                        })
                    }
                }
            }]), a.module("ui.bootstrap.accordion", ["ui.bootstrap.collapse"]).constant("accordionConfig", {
                closeOthers: !0
            }).controller("AccordionController", ["$scope", "$attrs", "accordionConfig", function(e, t, n) {
                this.groups = [], this.closeOthers = function(i) {
                    var o = a.isDefined(t.closeOthers) ? e.$eval(t.closeOthers) : n.closeOthers;
                    o && a.forEach(this.groups, function(e) {
                        e !== i && (e.isOpen = !1)
                    })
                }, this.addGroup = function(e) {
                    var t = this;
                    this.groups.push(e), e.$on("$destroy", function(n) {
                        t.removeGroup(e)
                    })
                }, this.removeGroup = function(e) {
                    var t = this.groups.indexOf(e); - 1 !== t && this.groups.splice(t, 1)
                }
            }]).directive("accordion", function() {
                return {
                    restrict: "EA",
                    controller: "AccordionController",
                    transclude: !0,
                    replace: !1,
                    templateUrl: "template/accordion/accordion.html"
                }
            }).directive("accordionGroup", function() {
                return {
                    require: "^accordion",
                    restrict: "EA",
                    transclude: !0,
                    replace: !0,
                    templateUrl: "template/accordion/accordion-group.html",
                    scope: {
                        heading: "@",
                        isOpen: "=?",
                        isDisabled: "=?"
                    },
                    controller: function() {
                        this.setHeading = function(e) {
                            this.heading = e
                        }
                    },
                    link: function(e, t, n, i) {
                        i.addGroup(e), e.$watch("isOpen", function(t) {
                            t && i.closeOthers(e)
                        }), e.toggleOpen = function() {
                            e.isDisabled || (e.isOpen = !e.isOpen)
                        }
                    }
                }
            }).directive("accordionHeading", function() {
                return {
                    restrict: "EA",
                    transclude: !0,
                    template: "",
                    replace: !0,
                    require: "^accordionGroup",
                    link: function(e, t, n, i, a) {
                        i.setHeading(a(e, function() {}))
                    }
                }
            }).directive("accordionTransclude", function() {
                return {
                    require: "^accordionGroup",
                    link: function(e, t, n, i) {
                        e.$watch(function() {
                            return i[n.accordionTransclude]
                        }, function(e) {
                            e && (t.html(""), t.append(e))
                        })
                    }
                }
            }), a.module("ui.bootstrap.alert", []).controller("AlertController", ["$scope", "$attrs", function(e, t) {
                e.closeable = "close" in t
            }]).directive("alert", function() {
                return {
                    restrict: "EA",
                    controller: "AlertController",
                    templateUrl: "template/alert/alert.html",
                    transclude: !0,
                    replace: !0,
                    scope: {
                        type: "@",
                        close: "&"
                    }
                }
            }), a.module("ui.bootstrap.bindHtml", []).directive("bindHtmlUnsafe", function() {
                return function(e, t, n) {
                    t.addClass("ng-binding").data("$binding", n.bindHtmlUnsafe), e.$watch(n.bindHtmlUnsafe, function(e) {
                        t.html(e || "")
                    })
                }
            }), a.module("ui.bootstrap.buttons", []).constant("buttonConfig", {
                activeClass: "active",
                toggleEvent: "click"
            }).controller("ButtonsController", ["buttonConfig", function(e) {
                this.activeClass = e.activeClass || "active", this.toggleEvent = e.toggleEvent || "click"
            }]).directive("btnRadio", function() {
                return {
                    require: ["btnRadio", "ngModel"],
                    controller: "ButtonsController",
                    link: function(e, t, n, i) {
                        var o = i[0],
                            r = i[1];
                        r.$render = function() {
                            t.toggleClass(o.activeClass, a.equals(r.$modelValue, e.$eval(n.btnRadio)))
                        }, t.bind(o.toggleEvent, function() {
                            t.hasClass(o.activeClass) || e.$apply(function() {
                                r.$setViewValue(e.$eval(n.btnRadio)), r.$render()
                            })
                        })
                    }
                }
            }).directive("btnCheckbox", function() {
                return {
                    require: ["btnCheckbox", "ngModel"],
                    controller: "ButtonsController",
                    link: function(e, t, n, i) {
                        function o() {
                            return l(n.btnCheckboxTrue, !0)
                        }

                        function r() {
                            return l(n.btnCheckboxFalse, !1)
                        }

                        function l(t, n) {
                            var i = e.$eval(t);
                            return a.isDefined(i) ? i : n
                        }
                        var s = i[0],
                            c = i[1];
                        c.$render = function() {
                            t.toggleClass(s.activeClass, a.equals(c.$modelValue, o()))
                        }, t.bind(s.toggleEvent, function() {
                            e.$apply(function() {
                                c.$setViewValue(t.hasClass(s.activeClass) ? r() : o()), c.$render()
                            })
                        })
                    }
                }
            }), a.module("ui.bootstrap.carousel", ["ui.bootstrap.transition"]).controller("CarouselController", ["$scope", "$timeout", "$transition", function(e, t, n) {
                function i() {
                    o();
                    var n = +e.interval;
                    !isNaN(n) && n >= 0 && (l = t(r, n))
                }

                function o() {
                    l && (t.cancel(l), l = null)
                }

                function r() {
                    s ? (e.next(), i()) : e.pause()
                }
                var l, s, c = this,
                    u = c.slides = e.slides = [],
                    p = -1;
                c.currentSlide = null;
                var d = !1;
                c.select = e.select = function(o, r) {
                    function l() {
                        if (!d) {
                            if (c.currentSlide && a.isString(r) && !e.noTransition && o.$element) {
                                o.$element.addClass(r);
                                o.$element[0].offsetWidth;
                                a.forEach(u, function(e) {
                                        a.extend(e, {
                                            direction: "",
                                            entering: !1,
                                            leaving: !1,
                                            active: !1
                                        })
                                    }), a.extend(o, {
                                        direction: r,
                                        active: !0,
                                        entering: !0
                                    }), a.extend(c.currentSlide || {}, {
                                        direction: r,
                                        leaving: !0
                                    }), e.$currentTransition = n(o.$element, {}),
                                    function(t, n) {
                                        e.$currentTransition.then(function() {
                                            s(t, n)
                                        }, function() {
                                            s(t, n)
                                        })
                                    }(o, c.currentSlide)
                            } else s(o, c.currentSlide);
                            c.currentSlide = o, p = f, i()
                        }
                    }

                    function s(t, n) {
                        a.extend(t, {
                            direction: "",
                            active: !0,
                            leaving: !1,
                            entering: !1
                        }), a.extend(n || {}, {
                            direction: "",
                            active: !1,
                            leaving: !1,
                            entering: !1
                        }), e.$currentTransition = null
                    }
                    var f = u.indexOf(o);
                    void 0 === r && (r = f > p ? "next" : "prev"), o && o !== c.currentSlide && (e.$currentTransition ? (e.$currentTransition.cancel(), t(l)) : l())
                }, e.$on("$destroy", function() {
                    d = !0
                }), c.indexOfSlide = function(e) {
                    return u.indexOf(e)
                }, e.next = function() {
                    var t = (p + 1) % u.length;
                    return e.$currentTransition ? void 0 : c.select(u[t], "next")
                }, e.prev = function() {
                    var t = 0 > p - 1 ? u.length - 1 : p - 1;
                    return e.$currentTransition ? void 0 : c.select(u[t], "prev")
                }, e.isActive = function(e) {
                    return c.currentSlide === e
                }, e.$watch("interval", i), e.$on("$destroy", o), e.play = function() {
                    s || (s = !0, i())
                }, e.pause = function() {
                    e.noPause || (s = !1, o())
                }, c.addSlide = function(t, n) {
                    t.$element = n, u.push(t), 1 === u.length || t.active ? (c.select(u[u.length - 1]), 1 == u.length && e.play()) : t.active = !1
                }, c.removeSlide = function(e) {
                    var t = u.indexOf(e);
                    u.splice(t, 1), u.length > 0 && e.active ? t >= u.length ? c.select(u[t - 1]) : c.select(u[t]) : p > t && p--
                }
            }]).directive("carousel", [function() {
                return {
                    restrict: "EA",
                    transclude: !0,
                    replace: !0,
                    controller: "CarouselController",
                    require: "carousel",
                    templateUrl: "template/carousel/carousel.html",
                    scope: {
                        interval: "=",
                        noTransition: "=",
                        noPause: "="
                    }
                }
            }]).directive("slide", function() {
                return {
                    require: "^carousel",
                    restrict: "EA",
                    transclude: !0,
                    replace: !0,
                    templateUrl: "template/carousel/slide.html",
                    scope: {
                        active: "=?"
                    },
                    link: function(e, t, n, i) {
                        i.addSlide(e, t), e.$on("$destroy", function() {
                            i.removeSlide(e)
                        }), e.$watch("active", function(t) {
                            t && i.select(e)
                        })
                    }
                }
            }), a.module("ui.bootstrap.position", []).factory("$position", ["$document", "$window", function(e, t) {
                function n(e, n) {
                    return e.currentStyle ? e.currentStyle[n] : t.getComputedStyle ? t.getComputedStyle(e)[n] : e.style[n]
                }

                function i(e) {
                    return "static" === (n(e, "position") || "static")
                }
                var o = function(t) {
                    for (var n = e[0], a = t.offsetParent || n; a && a !== n && i(a);) a = a.offsetParent;
                    return a || n
                };
                return {
                    position: function(t) {
                        var n = this.offset(t),
                            i = {
                                top: 0,
                                left: 0
                            },
                            r = o(t[0]);
                        r != e[0] && (i = this.offset(a.element(r)), i.top += r.clientTop - r.scrollTop, i.left += r.clientLeft - r.scrollLeft);
                        var l = t[0].getBoundingClientRect();
                        return {
                            width: l.width || t.prop("offsetWidth"),
                            height: l.height || t.prop("offsetHeight"),
                            top: n.top - i.top,
                            left: n.left - i.left
                        }
                    },
                    offset: function(n) {
                        var i = n[0].getBoundingClientRect();
                        return {
                            width: i.width || n.prop("offsetWidth"),
                            height: i.height || n.prop("offsetHeight"),
                            top: i.top + (t.pageYOffset || e[0].documentElement.scrollTop),
                            left: i.left + (t.pageXOffset || e[0].documentElement.scrollLeft)
                        }
                    },
                    positionElements: function(e, t, n, i) {
                        var a, o, r, l, s = n.split("-"),
                            c = s[0],
                            u = s[1] || "center";
                        a = i ? this.offset(e) : this.position(e), o = t.prop("offsetWidth"), r = t.prop("offsetHeight");
                        var p = {
                                center: function() {
                                    return a.left + a.width / 2 - o / 2
                                },
                                left: function() {
                                    return a.left
                                },
                                right: function() {
                                    return a.left + a.width
                                }
                            },
                            d = {
                                center: function() {
                                    return a.top + a.height / 2 - r / 2
                                },
                                top: function() {
                                    return a.top
                                },
                                bottom: function() {
                                    return a.top + a.height
                                }
                            };
                        switch (c) {
                            case "right":
                                l = {
                                    top: d[u](),
                                    left: p[c]()
                                };
                                break;
                            case "left":
                                l = {
                                    top: d[u](),
                                    left: a.left - o
                                };
                                break;
                            case "bottom":
                                l = {
                                    top: d[c](),
                                    left: p[u]()
                                };
                                break;
                            default:
                                l = {
                                    top: a.top - r,
                                    left: p[u]()
                                }
                        }
                        return l
                    }
                }
            }]), a.module("ui.bootstrap.dateparser", []).service("dateParser", ["$locale", "orderByFilter", function(e, t) {
                function n(e, t, n) {
                    return 1 === t && n > 28 ? 29 === n && (e % 4 === 0 && e % 100 !== 0 || e % 400 === 0) : 3 === t || 5 === t || 8 === t || 10 === t ? 31 > n : !0
                }
                this.parsers = {};
                var i = {
                    yyyy: {
                        regex: "\\d{4}",
                        apply: function(e) {
                            this.year = +e
                        }
                    },
                    yy: {
                        regex: "\\d{2}",
                        apply: function(e) {
                            this.year = +e + 2e3
                        }
                    },
                    y: {
                        regex: "\\d{1,4}",
                        apply: function(e) {
                            this.year = +e
                        }
                    },
                    MMMM: {
                        regex: e.DATETIME_FORMATS.MONTH.join("|"),
                        apply: function(t) {
                            this.month = e.DATETIME_FORMATS.MONTH.indexOf(t)
                        }
                    },
                    MMM: {
                        regex: e.DATETIME_FORMATS.SHORTMONTH.join("|"),
                        apply: function(t) {
                            this.month = e.DATETIME_FORMATS.SHORTMONTH.indexOf(t)
                        }
                    },
                    MM: {
                        regex: "0[1-9]|1[0-2]",
                        apply: function(e) {
                            this.month = e - 1
                        }
                    },
                    M: {
                        regex: "[1-9]|1[0-2]",
                        apply: function(e) {
                            this.month = e - 1
                        }
                    },
                    dd: {
                        regex: "[0-2][0-9]{1}|3[0-1]{1}",
                        apply: function(e) {
                            this.date = +e
                        }
                    },
                    d: {
                        regex: "[1-2]?[0-9]{1}|3[0-1]{1}",
                        apply: function(e) {
                            this.date = +e
                        }
                    },
                    EEEE: {
                        regex: e.DATETIME_FORMATS.DAY.join("|")
                    },
                    EEE: {
                        regex: e.DATETIME_FORMATS.SHORTDAY.join("|")
                    }
                };
                this.createParser = function(e) {
                    var n = [],
                        o = e.split("");
                    return a.forEach(i, function(t, i) {
                        var a = e.indexOf(i);
                        if (a > -1) {
                            e = e.split(""), o[a] = "(" + t.regex + ")", e[a] = "$";
                            for (var r = a + 1, l = a + i.length; l > r; r++) o[r] = "", e[r] = "$";
                            e = e.join(""), n.push({
                                index: a,
                                apply: t.apply
                            })
                        }
                    }), {
                        regex: new RegExp("^" + o.join("") + "$"),
                        map: t(n, "index")
                    }
                }, this.parse = function(t, i) {
                    if (!a.isString(t)) return t;
                    i = e.DATETIME_FORMATS[i] || i, this.parsers[i] || (this.parsers[i] = this.createParser(i));
                    var o = this.parsers[i],
                        r = o.regex,
                        l = o.map,
                        s = t.match(r);
                    if (s && s.length) {
                        for (var c, u = {
                                year: 1900,
                                month: 0,
                                date: 1,
                                hours: 0
                            }, p = 1, d = s.length; d > p; p++) {
                            var f = l[p - 1];
                            f.apply && f.apply.call(u, s[p])
                        }
                        return n(u.year, u.month, u.date) && (c = new Date(u.year, u.month, u.date, u.hours)), c
                    }
                }
            }]), a.module("ui.bootstrap.datepicker", ["ui.bootstrap.dateparser", "ui.bootstrap.position"]).constant("datepickerConfig", {
                formatDay: "dd",
                formatMonth: "MMMM",
                formatYear: "yyyy",
                formatDayHeader: "EEE",
                formatDayTitle: "MMMM yyyy",
                formatMonthTitle: "yyyy",
                datepickerMode: "day",
                minMode: "day",
                maxMode: "year",
                showWeeks: !1,
                startingDay: 0,
                yearRange: 20,
                minDate: null,
                maxDate: null
            }).controller("DatepickerController", ["$scope", "$attrs", "$parse", "$interpolate", "$timeout", "$log", "dateFilter", "datepickerConfig", function(e, t, n, i, o, r, l, s) {
                var c = this,
                    u = {
                        $setViewValue: a.noop
                    };
                this.modes = ["day", "month", "year"], a.forEach(["formatDay", "formatMonth", "formatYear", "formatDayHeader", "formatDayTitle", "formatMonthTitle", "minMode", "maxMode", "showWeeks", "startingDay", "yearRange"], function(n, o) {
                    c[n] = a.isDefined(t[n]) ? 8 > o ? i(t[n])(e.$parent) : e.$parent.$eval(t[n]) : s[n]
                }), a.forEach(["minDate", "maxDate"], function(i) {
                    t[i] ? e.$parent.$watch(n(t[i]), function(e) {
                        c[i] = e ? new Date(e) : null, c.refreshView()
                    }) : c[i] = s[i] ? new Date(s[i]) : null
                }), e.datepickerMode = e.datepickerMode || s.datepickerMode, e.uniqueId = "datepicker-" + e.$id + "-" + Math.floor(1e4 * Math.random()), this.activeDate = a.isDefined(t.initDate) ? e.$parent.$eval(t.initDate) : new Date, e.isActive = function(t) {
                    return 0 === c.compare(t.date, c.activeDate) ? (e.activeDateId = t.uid, !0) : !1
                }, this.init = function(e) {
                    u = e, u.$render = function() {
                        c.render()
                    }
                }, this.render = function() {
                    if (u.$modelValue) {
                        var e = new Date(u.$modelValue),
                            t = !isNaN(e);
                        t ? this.activeDate = e : r.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.'), u.$setValidity("date", t)
                    }
                    this.refreshView()
                }, this.refreshView = function() {
                    if (this.element) {
                        this._refreshView();
                        var e = u.$modelValue ? new Date(u.$modelValue) : null;
                        u.$setValidity("date-disabled", !e || this.element && !this.isDisabled(e))
                    }
                }, this.createDateObject = function(e, t) {
                    var n = u.$modelValue ? new Date(u.$modelValue) : null;
                    return {
                        date: e,
                        label: l(e, t),
                        selected: n && 0 === this.compare(e, n),
                        disabled: this.isDisabled(e),
                        current: 0 === this.compare(e, new Date)
                    }
                }, this.isDisabled = function(n) {
                    return this.minDate && this.compare(n, this.minDate) < 0 || this.maxDate && this.compare(n, this.maxDate) > 0 || t.dateDisabled && e.dateDisabled({
                        date: n,
                        mode: e.datepickerMode
                    })
                }, this.split = function(e, t) {
                    for (var n = []; e.length > 0;) n.push(e.splice(0, t));
                    return n
                }, e.select = function(t) {
                    if (e.datepickerMode === c.minMode) {
                        var n = u.$modelValue ? new Date(u.$modelValue) : new Date(0, 0, 0, 0, 0, 0, 0);
                        n.setFullYear(t.getFullYear(), t.getMonth(), t.getDate()), u.$setViewValue(n), u.$render()
                    } else c.activeDate = t, e.datepickerMode = c.modes[c.modes.indexOf(e.datepickerMode) - 1]
                }, e.move = function(e) {
                    var t = c.activeDate.getFullYear() + e * (c.step.years || 0),
                        n = c.activeDate.getMonth() + e * (c.step.months || 0);
                    c.activeDate.setFullYear(t, n, 1), c.refreshView()
                }, e.toggleMode = function(t) {
                    t = t || 1, e.datepickerMode === c.maxMode && 1 === t || e.datepickerMode === c.minMode && -1 === t || (e.datepickerMode = c.modes[c.modes.indexOf(e.datepickerMode) + t])
                }, e.keys = {
                    13: "enter",
                    32: "space",
                    33: "pageup",
                    34: "pagedown",
                    35: "end",
                    36: "home",
                    37: "left",
                    38: "up",
                    39: "right",
                    40: "down"
                };
                var p = function() {
                    o(function() {
                        c.element[0].focus()
                    }, 0, !1)
                };
                e.$on("datepicker.focus", p), e.keydown = function(t) {
                    var n = e.keys[t.which];
                    if (n && !t.shiftKey && !t.altKey)
                        if (t.preventDefault(), t.stopPropagation(), "enter" === n || "space" === n) {
                            if (c.isDisabled(c.activeDate)) return;
                            e.select(c.activeDate), p()
                        } else !t.ctrlKey || "up" !== n && "down" !== n ? (c.handleKeyDown(n, t), c.refreshView()) : (e.toggleMode("up" === n ? 1 : -1), p())
                }
            }]).directive("datepicker", function() {
                return {
                    restrict: "EA",
                    replace: !0,
                    templateUrl: "template/datepicker/datepicker.html",
                    scope: {
                        datepickerMode: "=?",
                        dateDisabled: "&"
                    },
                    require: ["datepicker", "?^ngModel"],
                    controller: "DatepickerController",
                    link: function(e, t, n, i) {
                        var a = i[0],
                            o = i[1];
                        n.datepickerMode && (e.datepickerMode = n.datepickerMode), o && a.init(o)
                    }
                }
            }).directive("daypicker", ["dateFilter", function(e) {
                return {
                    restrict: "EA",
                    replace: !0,
                    templateUrl: "template/datepicker/day.html",
                    require: "^datepicker",
                    link: function(t, n, i, o) {
                        function r(e, t) {
                            return 32 - new Date(e, t, 32).getDate()
                        }

                        function l(e, t) {
                            var n = new Array(t),
                                i = new Date(e),
                                a = 0;
                            for (i.setHours(12); t > a;) n[a++] = new Date(i), i.setDate(i.getDate() + 1);
                            return n
                        }

                        function s(e) {
                            var t = new Date(e);
                            t.setDate(t.getDate() + 4 - (t.getDay() || 7));
                            var n = t.getTime();
                            return t.setMonth(0), t.setDate(1), Math.floor(Math.round((n - t) / 864e5) / 7) + 1
                        }
                        t.showWeeks = o.showWeeks, o.step = {
                            months: 1
                        }, o.element = n, o._refreshView = function() {
                            var n = o.activeDate.getFullYear(),
                                i = o.activeDate.getMonth(),
                                c = new Date(n, i, 1),
                                u = o.startingDay - c.getDay(),
                                p = u > 0 ? 7 - u : -u,
                                d = new Date(c),
                                f = 0;
                            p > 0 && (d.setDate(-p + 1), f += p), f += r(n, i), f += (7 - f % 7) % 7;
                            for (var m = l(d, f), h = 0; f > h; h++) m[h] = a.extend(o.createDateObject(m[h], o.formatDay), {
                                secondary: m[h].getMonth() !== i,
                                uid: t.uniqueId + "-" + h
                            });
                            t.labels = new Array(7);
                            for (var g = 0; 7 > g; g++) t.labels[g] = {
                                abbr: e(m[g].date, o.formatDayHeader),
                                full: e(m[g].date, "EEEE")
                            };
                            if (t.title = e(o.activeDate, o.formatDayTitle), t.rows = o.split(m, 7), t.showWeeks) {
                                t.weekNumbers = [];
                                for (var v = s(t.rows[0][0].date), b = t.rows.length; t.weekNumbers.push(v++) < b;);
                            }
                        }, o.compare = function(e, t) {
                            return new Date(e.getFullYear(), e.getMonth(), e.getDate()) - new Date(t.getFullYear(), t.getMonth(), t.getDate())
                        }, o.handleKeyDown = function(e, t) {
                            var n = o.activeDate.getDate();
                            if ("left" === e) n -= 1;
                            else if ("up" === e) n -= 7;
                            else if ("right" === e) n += 1;
                            else if ("down" === e) n += 7;
                            else if ("pageup" === e || "pagedown" === e) {
                                var i = o.activeDate.getMonth() + ("pageup" === e ? -1 : 1);
                                o.activeDate.setMonth(i, 1), n = Math.min(r(o.activeDate.getFullYear(), o.activeDate.getMonth()), n)
                            } else "home" === e ? n = 1 : "end" === e && (n = r(o.activeDate.getFullYear(), o.activeDate.getMonth()));
                            o.activeDate.setDate(n)
                        }, o.refreshView()
                    }
                }
            }]).directive("monthpicker", ["dateFilter", function(e) {
                return {
                    restrict: "EA",
                    replace: !0,
                    templateUrl: "template/datepicker/month.html",
                    require: "^datepicker",
                    link: function(t, n, i, o) {
                        o.step = {
                            years: 1
                        }, o.element = n, o._refreshView = function() {
                            for (var n = new Array(12), i = o.activeDate.getFullYear(), r = 0; 12 > r; r++) n[r] = a.extend(o.createDateObject(new Date(i, r, 1), o.formatMonth), {
                                uid: t.uniqueId + "-" + r
                            });
                            t.title = e(o.activeDate, o.formatMonthTitle), t.rows = o.split(n, 3)
                        }, o.compare = function(e, t) {
                            return new Date(e.getFullYear(), e.getMonth()) - new Date(t.getFullYear(), t.getMonth())
                        }, o.handleKeyDown = function(e, t) {
                            var n = o.activeDate.getMonth();
                            if ("left" === e) n -= 1;
                            else if ("up" === e) n -= 3;
                            else if ("right" === e) n += 1;
                            else if ("down" === e) n += 3;
                            else if ("pageup" === e || "pagedown" === e) {
                                var i = o.activeDate.getFullYear() + ("pageup" === e ? -1 : 1);
                                o.activeDate.setFullYear(i)
                            } else "home" === e ? n = 0 : "end" === e && (n = 11);
                            o.activeDate.setMonth(n)
                        }, o.refreshView()
                    }
                }
            }]).directive("yearpicker", ["dateFilter", function(e) {
                return {
                    restrict: "EA",
                    replace: !0,
                    templateUrl: "template/datepicker/year.html",
                    require: "^datepicker",
                    link: function(e, t, n, i) {
                        function o(e) {
                            return parseInt((e - 1) / r, 10) * r + 1
                        }
                        var r = i.yearRange;
                        i.step = {
                            years: r
                        }, i.element = t, i._refreshView = function() {
                            for (var t = new Array(r), n = 0, l = o(i.activeDate.getFullYear()); r > n; n++) t[n] = a.extend(i.createDateObject(new Date(l + n, 0, 1), i.formatYear), {
                                uid: e.uniqueId + "-" + n
                            });
                            e.title = [t[0].label, t[r - 1].label].join(" - "), e.rows = i.split(t, 5)
                        }, i.compare = function(e, t) {
                            return e.getFullYear() - t.getFullYear()
                        }, i.handleKeyDown = function(e, t) {
                            var n = i.activeDate.getFullYear();
                            "left" === e ? n -= 1 : "up" === e ? n -= 5 : "right" === e ? n += 1 : "down" === e ? n += 5 : "pageup" === e || "pagedown" === e ? n += ("pageup" === e ? -1 : 1) * i.step.years : "home" === e ? n = o(i.activeDate.getFullYear()) : "end" === e && (n = o(i.activeDate.getFullYear()) + r - 1), i.activeDate.setFullYear(n)
                        }, i.refreshView()
                    }
                }
            }]).constant("datepickerPopupConfig", {
                datepickerPopup: "yyyy-MM-dd",
                currentText: "Today",
                clearText: "Clear",
                closeText: "Done",
                closeOnDateSelection: !0,
                appendToBody: !1,
                showButtonBar: !0
            }).directive("datepickerPopup", ["$compile", "$parse", "$document", "$position", "dateFilter", "datepickerPopupConfig", "dateParser", function(e, t, n, i, o, r, l) {
                return {
                    restrict: "EA",
                    require: "ngModel",
                    scope: {
                        isOpen: "=?",
                        currentText: "@",
                        clearText: "@",
                        closeText: "@",
                        dateDisabled: "&"
                    },
                    link: function(s, c, u, p) {
                        function d(e) {
                            return e.replace(/([A-Z])/g, function(e) {
                                return "-" + e.toLowerCase()
                            })
                        }

                        function f(e) {
                            if (e) {
                                if (a.isDate(e) && !isNaN(e)) return p.$setValidity("date", !0), e;
                                if (a.isString(e)) {
                                    var t = l.parse(e, m);
                                    return isNaN(t) ? void p.$setValidity("date", !1) : (p.$setValidity("date", !0), t)
                                }
                                return void p.$setValidity("date", !1)
                            }
                            return p.$setValidity("date", !0), null
                        }
                        var m, h = a.isDefined(u.closeOnDateSelection) ? s.$parent.$eval(u.closeOnDateSelection) : r.closeOnDateSelection,
                            g = a.isDefined(u.datepickerAppendToBody) ? s.$parent.$eval(u.datepickerAppendToBody) : r.appendToBody;
                        s.showButtonBar = a.isDefined(u.showButtonBar) ? s.$parent.$eval(u.showButtonBar) : r.showButtonBar, s.datepickerMode = a.isDefined(u.datepickerMode) ? u.datepickerMode : "day", s.showWeeks = a.isDefined(u.showWeeks) ? u.showWeeks : !1, s.getText = function(e) {
                            return s[e + "Text"] || r[e + "Text"]
                        }, u.$observe("datepickerPopup", function(e) {
                            m = e || r.datepickerPopup, p.$render()
                        });
                        var v = a.element("<div datepicker-popup-wrap><div datepicker></div></div>");
                        v.attr({
                            "ng-model": "date",
                            "ng-change": "dateSelection()"
                        });
                        var b = a.element(v.children()[0]);
                        u.datepickerOptions && a.forEach(s.$parent.$eval(u.datepickerOptions), function(e, t) {
                            b.attr(d(t), e)
                        }), a.forEach(["minDate", "maxDate"], function(e) {
                            u[e] && (s.$parent.$watch(t(u[e]), function(t) {
                                s[e] = t
                            }), b.attr(d(e), e))
                        }), u.dateDisabled && b.attr("date-disabled", "dateDisabled({ date: date, mode: mode })"), p.$parsers.unshift(f), s.dateSelection = function(e) {
                            a.isDefined(e) && (s.date = e), p.$setViewValue(s.date), p.$render(), h && (s.isOpen = !1, c[0].focus())
                        }, c.bind("input change keyup", function() {
                            s.$apply(function() {
                                s.date = p.$modelValue
                            })
                        }), p.$render = function() {
                            var e = p.$viewValue ? o(p.$viewValue, m) : "";
                            c.val(e), s.date = f(p.$modelValue)
                        };
                        var y = function(e) {
                                s.isOpen && e.target !== c[0] && s.$apply(function() {
                                    s.isOpen = !1
                                })
                            },
                            w = function() {
                                n.find("input").bind("click", y), n.find("button").bind("click", y), k.find("input").unbind("click", y), k.find("button").unbind("click", y)
                            },
                            x = function() {
                                n.find("input").unbind("click", y), n.find("button").unbind("click", y)
                            },
                            $ = function(e, t) {
                                s.keydown(e)
                            };
                        c.bind("keydown", $), s.keydown = function(e) {
                            27 === e.which ? (e.preventDefault(), e.stopPropagation(), s.close()) : 40 !== e.which || s.isOpen || (s.isOpen = !0)
                        }, s.$watch("isOpen", function(e) {
                            e ? (s.$broadcast("datepicker.focus"), s.position = g ? i.offset(c) : i.position(c), s.position.top = s.position.top + c.prop("offsetHeight"), n.bind("click", y), w()) : (n.unbind("click", y), x())
                        }), s.select = function(e) {
                            if ("today" === e) {
                                var t = new Date;
                                a.isDate(p.$modelValue) ? (e = new Date(p.$modelValue), e.setFullYear(t.getFullYear(), t.getMonth(), t.getDate())) : e = new Date(t.setHours(0, 0, 0, 0))
                            }
                            s.dateSelection(e)
                        }, s.close = function() {
                            s.isOpen = !1, c[0].focus()
                        };
                        var k = e(v)(s);
                        g ? n.find("body").append(k) : c.after(k), s.$on("$destroy", function() {
                            k.remove(), c.unbind("keydown", $), n.unbind("click", y), x()
                        })
                    }
                }
            }]).directive("datepickerPopupWrap", function() {
                return {
                    restrict: "EA",
                    replace: !0,
                    transclude: !0,
                    templateUrl: "template/datepicker/popup.html",
                    link: function(e, t, n) {
                        t.bind("click", function(e) {
                            e.preventDefault(), e.stopPropagation()
                        }), t.bind("keydown", function(t) {
                            9 === t.which && e.$apply(function() {
                                e.isOpen = !1
                            })
                        })
                    }
                }
            }), a.module("ui.bootstrap.dropdown", []).constant("dropdownConfig", {
                openClass: "open"
            }).service("dropdownService", ["$document", function(e) {
                var t = null;
                this.open = function(a) {
                    t || (e.bind("click", n), e.bind("keydown", i)), t && t !== a && (t.isOpen = !1), t = a
                }, this.close = function(a) {
                    t === a && (t = null, e.unbind("click", n), e.unbind("keydown", i))
                };
                var n = function() {
                        t.$apply(function() {
                            t.isOpen = !1
                        })
                    },
                    i = function(e) {
                        27 === e.which && n()
                    }
            }]).controller("DropdownController", ["$scope", "$attrs", "$parse", "dropdownConfig", "dropdownService", "$animate", function(e, t, n, i, o, r) {
                var l, s = this,
                    c = e.$new(),
                    u = i.openClass,
                    p = a.noop,
                    d = t.onToggle ? n(t.onToggle) : a.noop;
                this.init = function(i) {
                    s.$element = i, t.isOpen && (l = n(t.isOpen), p = l.assign, e.$watch(l, function(e) {
                        c.isOpen = !!e
                    }))
                }, this.toggle = function(e) {
                    return c.isOpen = arguments.length ? !!e : !c.isOpen
                }, this.isOpen = function() {
                    return c.isOpen
                }, c.focusToggleElement = function() {
                    s.triggerElement && s.triggerElement[0].focus()
                }, c.$watch("isOpen", function(t, n) {
                    r[t ? "addClass" : "removeClass"](s.$element, u), t ? o.open(c) : (o.close(c), n && c.focusToggleElement()), p(e, t), d(e, {
                        open: !!t
                    })
                }), e.$on("$locationChangeSuccess", function() {
                    c.isOpen = !1
                }), e.$on("$destroy", function() {
                    c.$destroy()
                })
            }]).directive("dropdown", function() {
                return {
                    restrict: "CA",
                    controller: "DropdownController",
                    link: function(e, t, n, i) {
                        i.init(t)
                    }
                }
            }).directive("dropdownToggle", function() {
                return {
                    restrict: "CA",
                    require: "?^dropdown",
                    link: function(e, t, n, i) {
                        i && (i.triggerElement = t, t.bind("click", function(n) {
                            n.preventDefault(), n.stopPropagation(), t.hasClass("disabled") || t.prop("disabled") || e.$apply(function() {
                                i.toggle()
                            })
                        }), t.attr({
                            "aria-haspopup": !0,
                            "aria-expanded": !1
                        }), e.$watch(i.isOpen, function(e) {
                            t.attr("aria-expanded", !!e)
                        }))
                    }
                }
            }), a.module("ui.bootstrap.dropdownSelect", ["ui.bootstrap.dropdown"]).constant("dropdownSelectConfig", {
                emptyPlaceholderText: "Nothing selected"
            }).factory("optionsParser", ["$parse", function(e) {
                var t = /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;
                return {
                    parse: function(n) {
                        var i = n.match(t);
                        if (!i) throw new Error('Expected dropdown specification in form of "_viewValue_ (as _label_)? (group by _groupname_)? for _item_ in _collection_" but got "' + n + '".');
                        var a = i[4] || i[6];
                        return {
                            displayFn: e(i[2] || i[1]),
                            valueName: a,
                            keyName: i[5],
                            groupByFn: e(i[3] || ""),
                            valueFn: e(i[2] ? i[1] : a),
                            valuesFn: e(i[5])
                        }
                    }
                }
            }]).controller("DropdownSelectController", ["$scope", "$attrs", "$parse", "optionsParser", "dropdownSelectConfig", "filterFilter", "$timeout", function(e, t, n, i, o, r, l) {
                function s() {
                    e.selectedOption = null, e.activeOption = null;
                    var t = !1;
                    a.forEach(e.options, function(n) {
                        n.selected = !t && a.equals(f.$viewValue, n.value), n.selected && (e.selectedOption = n, e.activeOption = n, t = !0)
                    })
                }

                function c() {
                    e.selectedOption = [];
                    var t = a.isArray(f.$viewValue) ? f.$viewValue : [];
                    a.forEach(e.options, function(n) {
                        n.selected = t.indexOf(n.value) > -1, n.selected && e.selectedOption.push(n)
                    })
                }
                var u, p = this,
                    d = i.parse(t.ngOptions),
                    f = {
                        $setViewValue: a.noop
                    };
                t.onToggle ? n(t.onToggle) : a.noop;
                e.wasOpen = !1, e.multiple = a.isDefined(t.multiple) ? e.$parent.$eval(t.multiple) : !1, e.filter = {
                    enabled: a.isDefined(t.filter) ? e.$parent.$eval(t.filter) : !1,
                    value: "",
                    key: e.filterKey
                }, e.options = [], this.init = function(e, t) {
                    f = e, u = t, f.$render = function() {
                        p.render()
                    }
                }, this.onOptionsChange = function(t) {
                    var n = {};
                    e.groups = {}, e.options.length = 0, a.forEach(t, function(t, i) {
                        n[d.valueName] = t;
                        var a = d.groupByFn(e, n) || "";
                        (group = e.groups[a]) || (group = e.groups[a] = {
                            options: []
                        });
                        var o = {
                            label: d.displayFn(e, n),
                            value: d.valueFn(e, n),
                            id: e.uniqueId + "-" + i
                        };
                        e.filter.key && (o[e.filter.key] = t[e.filter.key]), group.options.push(o), e.options.push(o)
                    }), e.filterOptions(), this.render()
                }, e.filterOptions = function() {
                    if (e.filter.value) {
                        var t = {},
                            n = e.filter.key || "label";
                        t[n] = e.filter.value, e.validOptions = r(e.options, t), a.forEach(e.options, function(t) {
                            t.valid = e.validOptions.indexOf(t) > -1
                        })
                    } else e.validOptions = e.options, a.forEach(e.options, function(e) {
                        e.valid = !0
                    })
                }, this.render = function() {
                    e.multiple ? c() : s()
                }, e.isActive = function(t) {
                    return t === e.activeOption
                }, this.selectSingle = function(e) {
                    f.$setViewValue(e.value), f.$render()
                }, this.selectMultiple = function(e) {
                    var t = f.$viewValue || [];
                    e.selected = !e.selected, e.selected ? t.push(e.value) : t.splice(t.indexOf(e.value), 1), f.$setViewValue(t), f.$render()
                }, e.select = function(t, n) {
                    e.multiple ? p.selectMultiple(t) : (p.selectSingle(t), e.isopen = !1)
                }, e.isEmpty = function() {
                    return !e.selectedOption || e.multiple && 0 === e.selectedOption.length
                }, e.prevent = function(e) {
                    e.preventDefault(), e.stopPropagation()
                }, e.$parent.$watchCollection(d.valuesFn, function(e) {
                    p.onOptionsChange(e)
                }), e.onKeydown = function(t) {
                    if (e.isopen && /^(38|40|13|32|9)$/.test(t.which)) {
                        t.preventDefault(), t.stopPropagation();
                        for (var n = e.validOptions, i = n.indexOf(e.activeOption), o = u.find("li"), r = 0; r < o.length; r++) {
                            var l = a.element(o[r]);
                            "option" !== l.attr("role") && (o.splice(r, 1), r--)
                        }
                        if ((13 === t.which || 32 === t.which || 9 === t.which) && i > -1) return void e.select(n[i]);
                        38 === t.which && i > 0 ? i-- : 40 === t.which && i < n.length - 1 && i++, o[i].focus(), e.activeOption = n[i]
                    }
                }, (t.ngDisabled || t.disabled) && t.$observe("disabled", function(t) {
                    a.isDefined(t) && (e.isDisabled = t)
                })
            }]).directive("dropdownSelect", function() {
                var e = 0;
                return {
                    require: ["dropdownSelect", "?^ngModel"],
                    restrict: "EA",
                    replace: !0,
                    scope: {
                        type: "@",
                        size: "@",
                        emptyPlaceholderText: "@",
                        filterPlaceholderText: "@",
                        optionTemplateUrl: "@",
                        filterKey: "@",
                        label: "@"
                    },
                    templateUrl: "template/dropdownSelect/select.html",
                    controller: "DropdownSelectController",
                    link: function(t, n, i, a) {
                        var o = a[0],
                            r = a[1];
                        t.uniqueId = "select-" + e++ + "-" + Math.floor(1e4 * Math.random()), r && o.init(r, n)
                    }
                }
            }).directive("selectOption", ["$http", "$templateCache", "$compile", "$parse", function(e, t, n, i) {
                return {
                    require: "^dropdownSelect",
                    restrict: "A",
                    scope: {
                        option: "=selectOption"
                    },
                    compile: function(a, o) {
                        var r = i(o.templateUrl);
                        return function(i, a, o) {
                            var l = r(i.$parent) || "template/dropdownSelect/option.html";
                            e.get(l, {
                                cache: t
                            }).success(function(e) {
                                e = e.replace(/(^\s+|\s+$)/g, ""), a.append(n(e)(i))
                            })
                        }
                    }
                }
            }]).directive("placeholderEmpty", ["dropdownSelectConfig", function(e) {
                return {
                    restrict: "EA",
                    scope: {
                        emptyPlaceholderText: "@"
                    },
                    replace: !0,
                    templateUrl: "template/dropdownSelect/placeholder-empty.html",
                    link: function(t, n, i) {
                        t.getEmptyText = function() {
                            return t.emptyPlaceholderText || e.emptyPlaceholderText
                        }
                    }
                }
            }]), a.module("ui.bootstrap.modal", ["ui.bootstrap.transition"]).factory("$$stackedMap", function() {
                return {
                    createNew: function() {
                        var e = [];
                        return {
                            add: function(t, n) {
                                e.push({
                                    key: t,
                                    value: n
                                })
                            },
                            get: function(t) {
                                for (var n = 0; n < e.length; n++)
                                    if (t == e[n].key) return e[n]
                            },
                            keys: function() {
                                for (var t = [], n = 0; n < e.length; n++) t.push(e[n].key);
                                return t
                            },
                            top: function() {
                                return e[e.length - 1]
                            },
                            remove: function(t) {
                                for (var n = -1, i = 0; i < e.length; i++)
                                    if (t == e[i].key) {
                                        n = i;
                                        break
                                    }
                                return e.splice(n, 1)[0]
                            },
                            removeTop: function() {
                                return e.splice(e.length - 1, 1)[0]
                            },
                            length: function() {
                                return e.length
                            }
                        }
                    }
                }
            }).directive("modalBackdrop", ["$timeout", function(e) {
                return {
                    restrict: "EA",
                    replace: !0,
                    templateUrl: "template/modal/backdrop.html",
                    link: function(t) {
                        t.animate = !1, e(function() {
                            t.animate = !0
                        })
                    }
                }
            }]).directive("modalWindow", ["$modalStack", "$timeout", function(e, t) {
                return {
                    restrict: "EA",
                    scope: {
                        index: "@",
                        animate: "="
                    },
                    replace: !0,
                    transclude: !0,
                    templateUrl: "template/modal/window.html",
                    link: function(n, i, a) {
                        n.windowClass = a.windowClass || "", t(function() {
                            n.animate = !0, i[0].focus()
                        }), n.close = function(t) {
                            var n = e.getTop();
                            n && n.value.backdrop && "static" != n.value.backdrop && t.target === t.currentTarget && (t.preventDefault(), t.stopPropagation(), e.dismiss(n.key, "backdrop click"))
                        }
                    }
                }
            }]).factory("$modalStack", ["$transition", "$timeout", "$document", "$compile", "$rootScope", "$$stackedMap", function(e, t, n, i, o, r) {
                function l() {
                    for (var e = -1, t = m.keys(), n = 0; n < t.length; n++) m.get(t[n]).value.backdrop && (e = n);
                    return e
                }

                function s(e) {
                    var t = n.find("body").eq(0),
                        i = m.get(e).value;
                    m.remove(e), u(i.modalDomEl, i.modalScope, 300, function() {
                        i.modalScope.$destroy(), t.toggleClass(f, m.length() > 0), c()
                    })
                }

                function c() {
                    if (p && -1 == l()) {
                        var e = d;
                        u(p, d, 150, function() {
                            e.$destroy(), e = null
                        }), p = void 0, d = void 0
                    }
                }

                function u(n, i, a, o) {
                    function r() {
                        r.done || (r.done = !0, n.remove(), o && o())
                    }
                    i.animate = !1;
                    var l = e.transitionEndEventName;
                    if (l) {
                        var s = t(r, a);
                        n.bind(l, function() {
                            t.cancel(s), r(), i.$apply()
                        })
                    } else t(r, 0)
                }
                var p, d, f = "modal-open",
                    m = r.createNew(),
                    h = {};
                return o.$watch(l, function(e) {
                    d && (d.index = e)
                }), n.bind("keydown", function(e) {
                    var t;
                    27 === e.which && (t = m.top(), t && t.value.keyboard && o.$apply(function() {
                        h.dismiss(t.key)
                    }))
                }), h.open = function(e, t) {
                    m.add(e, {
                        deferred: t.deferred,
                        modalScope: t.scope,
                        backdrop: t.backdrop,
                        keyboard: t.keyboard
                    });
                    var r = n.find("body").eq(0),
                        s = l();
                    s >= 0 && !p && (d = o.$new(!0), d.index = s, p = i("<div modal-backdrop></div>")(d), r.append(p));
                    var c = a.element("<div modal-window></div>");
                    c.attr("window-class", t.windowClass), c.attr("index", m.length() - 1), c.attr("animate", "animate"), c.html(t.content);
                    var u = i(c)(t.scope);
                    m.top().value.modalDomEl = u, r.append(u), r.addClass(f)
                }, h.close = function(e, t) {
                    var n = m.get(e).value;
                    n && (n.deferred.resolve(t), s(e))
                }, h.dismiss = function(e, t) {
                    var n = m.get(e).value;
                    n && (n.deferred.reject(t), s(e))
                }, h.dismissAll = function(e) {
                    for (var t = this.getTop(); t;) this.dismiss(t.key, e), t = this.getTop()
                }, h.getTop = function() {
                    return m.top()
                }, h
            }]).provider("$modal", function() {
                var e = {
                    options: {
                        backdrop: !0,
                        keyboard: !0
                    },
                    $get: ["$injector", "$rootScope", "$q", "$http", "$templateCache", "$controller", "$modalStack", function(t, n, i, o, r, l, s) {
                        function c(e) {
                            return e.template ? i.when(e.template) : o.get(e.templateUrl, {
                                cache: r
                            }).then(function(e) {
                                return e.data
                            })
                        }

                        function u(e) {
                            var n = [];
                            return a.forEach(e, function(e, o) {
                                (a.isFunction(e) || a.isArray(e)) && n.push(i.when(t.invoke(e)))
                            }), n
                        }
                        var p = {};
                        return p.open = function(t) {
                            var o = i.defer(),
                                r = i.defer(),
                                p = {
                                    result: o.promise,
                                    opened: r.promise,
                                    close: function(e) {
                                        s.close(p, e)
                                    },
                                    dismiss: function(e) {
                                        s.dismiss(p, e)
                                    }
                                };
                            if (t = a.extend({}, e.options, t), t.resolve = t.resolve || {}, !t.template && !t.templateUrl) throw new Error("One of template or templateUrl options is required.");
                            var d = i.all([c(t)].concat(u(t.resolve)));
                            return d.then(function(e) {
                                var i = (t.scope || n).$new();
                                i.$close = p.close, i.$dismiss = p.dismiss;
                                var r, c = {},
                                    u = 1;
                                t.controller && (c.$scope = i, c.$modalInstance = p, a.forEach(t.resolve, function(t, n) {
                                    c[n] = e[u++]
                                }), r = l(t.controller, c)), s.open(p, {
                                    scope: i,
                                    deferred: o,
                                    content: e[0],
                                    backdrop: t.backdrop,
                                    keyboard: t.keyboard,
                                    windowClass: t.windowClass
                                })
                            }, function(e) {
                                o.reject(e)
                            }), d.then(function() {
                                r.resolve(!0)
                            }, function() {
                                r.reject(!1)
                            }), p
                        }, p
                    }]
                };
                return e
            }), a.module("ui.bootstrap.pagination", []).controller("PaginationController", ["$scope", "$attrs", "$parse", function(e, t, n) {
                var i = this,
                    o = {
                        $setViewValue: a.noop
                    },
                    r = t.numPages ? n(t.numPages).assign : a.noop;
                this.init = function(a, r) {
                    o = a, this.config = r, o.$render = function() {
                        i.render()
                    }, t.itemsPerPage ? e.$parent.$watch(n(t.itemsPerPage), function(t) {
                        i.itemsPerPage = parseInt(t, 10), e.totalPages = i.calculateTotalPages()
                    }) : this.itemsPerPage = r.itemsPerPage
                }, this.calculateTotalPages = function() {
                    var t = this.itemsPerPage < 1 ? 1 : Math.ceil(e.totalItems / this.itemsPerPage);
                    return Math.max(t || 0, 1)
                }, this.render = function() {
                    e.page = parseInt(o.$viewValue, 10) || 1
                }, e.selectPage = function(t) {
                    e.page !== t && t > 0 && t <= e.totalPages && (o.$setViewValue(t), o.$render())
                }, e.getText = function(t) {
                    return e[t + "Text"] || i.config[t + "Text"]
                }, e.noPrevious = function() {
                    return 1 === e.page
                }, e.noNext = function() {
                    return e.page === e.totalPages
                }, e.$watch("totalItems", function() {
                    e.totalPages = i.calculateTotalPages()
                }), e.$watch("totalPages", function(t) {
                    r(e.$parent, t), e.page > t ? e.selectPage(t) : o.$render()
                })
            }]).constant("paginationConfig", {
                itemsPerPage: 10,
                boundaryLinks: !1,
                directionLinks: !0,
                firstText: "First",
                previousText: "Previous",
                nextText: "Next",
                lastText: "Last",
                rotate: !0
            }).directive("pagination", ["$parse", "paginationConfig", function(e, t) {
                return {
                    restrict: "EA",
                    scope: {
                        totalItems: "=",
                        firstText: "@",
                        previousText: "@",
                        nextText: "@",
                        lastText: "@"
                    },
                    require: ["pagination", "?ngModel"],
                    controller: "PaginationController",
                    templateUrl: "template/pagination/pagination.html",
                    replace: !0,
                    link: function(n, i, o, r) {
                        function l(e, t, n) {
                            return {
                                number: e,
                                text: t,
                                active: n
                            }
                        }

                        function s(e, t) {
                            var n = [],
                                i = 1,
                                o = t,
                                r = a.isDefined(p) && t > p;
                            r && (d ? (i = Math.max(e - Math.floor(p / 2), 1), o = i + p - 1, o > t && (o = t, i = o - p + 1)) : (i = (Math.ceil(e / p) - 1) * p + 1, o = Math.min(i + p - 1, t)));
                            for (var s = i; o >= s; s++) {
                                var c = l(s, s, s === e);
                                n.push(c)
                            }
                            if (r && !d) {
                                if (i > 1) {
                                    var u = l(i - 1, "...", !1);
                                    n.unshift(u)
                                }
                                if (t > o) {
                                    var f = l(o + 1, "...", !1);
                                    n.push(f)
                                }
                            }
                            return n
                        }
                        var c = r[0],
                            u = r[1];
                        if (u) {
                            var p = a.isDefined(o.maxSize) ? n.$parent.$eval(o.maxSize) : t.maxSize,
                                d = a.isDefined(o.rotate) ? n.$parent.$eval(o.rotate) : t.rotate;
                            n.boundaryLinks = a.isDefined(o.boundaryLinks) ? n.$parent.$eval(o.boundaryLinks) : t.boundaryLinks, n.directionLinks = a.isDefined(o.directionLinks) ? n.$parent.$eval(o.directionLinks) : t.directionLinks, c.init(u, t), o.maxSize && n.$parent.$watch(e(o.maxSize), function(e) {
                                p = parseInt(e, 10), c.render()
                            });
                            var f = c.render;
                            c.render = function() {
                                f(), n.page > 0 && n.page <= n.totalPages && (n.pages = s(n.page, n.totalPages))
                            }
                        }
                    }
                }
            }]).constant("pagerConfig", {
                itemsPerPage: 10,
                previousText: "� Previous",
                nextText: "Next �",
                align: !0
            }).directive("pager", ["pagerConfig", function(e) {
                return {
                    restrict: "EA",
                    scope: {
                        totalItems: "=",
                        previousText: "@",
                        nextText: "@"
                    },
                    require: ["pager", "?ngModel"],
                    controller: "PaginationController",
                    templateUrl: "template/pagination/pager.html",
                    replace: !0,
                    link: function(t, n, i, o) {
                        var r = o[0],
                            l = o[1];
                        l && (t.align = a.isDefined(i.align) ? t.$parent.$eval(i.align) : e.align, r.init(l, e))
                    }
                }
            }]), a.module("ui.bootstrap.tooltip", ["ui.bootstrap.position", "ui.bootstrap.bindHtml"]).provider("$tooltip", function() {
                function e(e) {
                    var t = /[A-Z]/g,
                        n = "-";
                    return e.replace(t, function(e, t) {
                        return (t ? n : "") + e.toLowerCase()
                    })
                }
                var t = {
                        placement: "top",
                        animation: !0,
                        popupDelay: 0
                    },
                    n = {
                        mouseenter: "mouseleave",
                        click: "click",
                        focus: "blur"
                    },
                    i = {};
                this.options = function(e) {
                    a.extend(i, e)
                }, this.setTriggers = function(e) {
                    a.extend(n, e)
                }, this.$get = ["$window", "$compile", "$timeout", "$parse", "$document", "$position", "$interpolate", function(o, r, l, s, c, u, p) {
                    return function(o, d, f) {
                        function m(e) {
                            var t = e || h.trigger || f,
                                i = n[t] || t;
                            return {
                                show: t,
                                hide: i
                            }
                        }
                        var h = a.extend({}, t, i),
                            g = e(o),
                            v = p.startSymbol(),
                            b = p.endSymbol(),
                            y = "<div " + g + '-popup title="' + v + "tt_title" + b + '" content="' + v + "tt_content" + b + '" placement="' + v + "tt_placement" + b + '" animation="tt_animation" is-open="tt_isOpen"></div>';
                        return {
                            restrict: "EA",
                            scope: !0,
                            compile: function(e, t) {
                                var n = r(y);
                                return function(e, t, i) {
                                    function r() {
                                        e.tt_isOpen ? f() : p()
                                        document.body.addEventListener('click', v, true);
                                    }

                                    function p() {
                                        (!D || e.$eval(i[d + "Enable"])) && (e.tt_popupDelay ? ($ = l(g, e.tt_popupDelay, !1), $.then(function(e) {
                                            e()
                                        })) : g()())
                                    }

                                    function f() {
                                        e.$apply(function() {
                                            v()
                                        })
                                    }

                                    function g() {
                                        return e.tt_content ? (b(), x && l.cancel(x), w.css({
                                            top: 0,
                                            left: 0,
                                            display: "block"
                                        }), k ? c.find("body").append(w) : t.after(w), T(), e.tt_isOpen = !0, e.$digest(), T) : a.noop
                                    }

                                    function v() {
                                        e.tt_isOpen = !1, l.cancel($), e.tt_animation ? x = l(y, 100) : y()
                                    }

                                    function b() {

                                        w && y(), w = n(e, function() {}), e.$digest()
                                    }

                                    function y() {
                                        w && (w.remove(), w = null)
                                    }
                                    var w, x, $, k = a.isDefined(h.appendToBody) ? h.appendToBody : !1,
                                        C = m(void 0),
                                        D = a.isDefined(i[d + "Enable"]),
                                        T = function() {
                                            var n = u.positionElements(t, w, e.tt_placement, k);
                                            n.top += "px", n.left += "px", w.css(n)
                                        };
                                    e.tt_isOpen = !1, i.$observe(o, function(t) {
                                        e.tt_content = t, !t && e.tt_isOpen && v()
                                    }), i.$observe(d + "Title", function(t) {
                                        e.tt_title = t
                                    }), i.$observe(d + "Placement", function(t) {
                                        e.tt_placement = a.isDefined(t) ? t : h.placement
                                    }), i.$observe(d + "PopupDelay", function(t) {
                                        var n = parseInt(t, 10);
                                        e.tt_popupDelay = isNaN(n) ? h.popupDelay : n
                                    });
                                    var S = function() {
                                        t.unbind(C.show, p), t.unbind(C.hide, f)
                                    };
                                    i.$observe(d + "Trigger", function(e) {
                                        S(), C = m(e), C.show === C.hide ? t.bind(C.show, r) : (t.bind(C.show, p), t.bind(C.hide, f))
                                    });
                                    var M = e.$eval(i[d + "Animation"]);
                                    e.tt_animation = a.isDefined(M) ? !!M : h.animation, i.$observe(d + "AppendToBody", function(t) {
                                        k = a.isDefined(t) ? s(t)(e) : k
                                    }), k && e.$on("$locationChangeSuccess", function() {
                                        e.tt_isOpen && v()
                                    }), e.$on("$destroy", function() {
                                        l.cancel(x), l.cancel($), S(), y()
                                    })
                                }
                            }
                        }
                    }
                }]
            }).directive("tooltipPopup", function() {
                return {
                    restrict: "EA",
                    replace: !0,
                    scope: {
                        content: "@",
                        placement: "@",
                        animation: "&",
                        isOpen: "&"
                    },
                    templateUrl: "template/tooltip/tooltip-popup.html"
                }
            }).directive("tooltip", ["$tooltip", function(e) {
                return e("tooltip", "tooltip", "mouseenter")
            }]).directive("tooltipHtmlUnsafePopup", function() {
                return {
                    restrict: "EA",
                    replace: !0,
                    scope: {
                        content: "@",
                        placement: "@",
                        animation: "&",
                        isOpen: "&"
                    },
                    templateUrl: "template/tooltip/tooltip-html-unsafe-popup.html"
                }
            }).directive("tooltipHtmlUnsafe", ["$tooltip", function(e) {
                return e("tooltipHtmlUnsafe", "tooltip", "mouseenter")
            }]), a.module("ui.bootstrap.popover", ["ui.bootstrap.tooltip"]).directive("popoverPopup", function() {
                return {
                    restrict: "EA",
                    replace: !0,
                    scope: {
                        title: "@",
                        content: "@",
                        placement: "@",
                        animation: "&",
                        isOpen: "&"
                    },
                    templateUrl: "template/popover/popover.html"
                }
            }).directive("popover", ["$tooltip", function(e) {
                return e("popover", "popover", "click")
            }]), a.module("ui.bootstrap.progressbar", []).constant("progressConfig", {
                animate: !0,
                max: 100
            }).controller("ProgressController", ["$scope", "$attrs", "progressConfig", function(e, t, n) {
                var i = this,
                    o = a.isDefined(t.animate) ? e.$parent.$eval(t.animate) : n.animate;
                this.bars = [], e.max = a.isDefined(t.max) ? e.$parent.$eval(t.max) : n.max, this.addBar = function(t, n) {
                    o || n.css({
                        transition: "none"
                    }), this.bars.push(t), t.$watch("value", function(n) {
                        t.percent = +(100 * n / e.max).toFixed(2)
                    }), t.$on("$destroy", function() {
                        n = null, i.removeBar(t)
                    })
                }, this.removeBar = function(e) {
                    this.bars.splice(this.bars.indexOf(e), 1)
                }
            }]).directive("progress", function() {
                return {
                    restrict: "EA",
                    replace: !0,
                    transclude: !0,
                    controller: "ProgressController",
                    require: "progress",
                    scope: {},
                    templateUrl: "template/progressbar/progress.html"
                }
            }).directive("bar", function() {
                return {
                    restrict: "EA",
                    replace: !0,
                    transclude: !0,
                    require: "^progress",
                    scope: {
                        value: "=",
                        type: "@"
                    },
                    templateUrl: "template/progressbar/bar.html",
                    link: function(e, t, n, i) {
                        i.addBar(e, t)
                    }
                }
            }).directive("progressbar", function() {
                return {
                    restrict: "EA",
                    replace: !0,
                    transclude: !0,
                    controller: "ProgressController",
                    scope: {
                        value: "=",
                        type: "@"
                    },
                    templateUrl: "template/progressbar/progressbar.html",
                    link: function(e, t, n, i) {
                        i.addBar(e, a.element(t.children()[0]))
                    }
                }
            }), a.module("ui.bootstrap.rating", []).constant("ratingConfig", {
                max: 5,
                stateOn: null,
                stateOff: null
            }).controller("RatingController", ["$scope", "$attrs", "ratingConfig", function(e, t, n) {
                var i = {
                    $setViewValue: a.noop
                };
                this.init = function(o) {
                    i = o, i.$render = this.render, this.stateOn = a.isDefined(t.stateOn) ? e.$parent.$eval(t.stateOn) : n.stateOn, this.stateOff = a.isDefined(t.stateOff) ? e.$parent.$eval(t.stateOff) : n.stateOff;
                    var r = a.isDefined(t.ratingStates) ? e.$parent.$eval(t.ratingStates) : new Array(a.isDefined(t.max) ? e.$parent.$eval(t.max) : n.max);
                    e.range = this.buildTemplateObjects(r)
                }, this.buildTemplateObjects = function(e) {
                    for (var t = 0, n = e.length; n > t; t++) e[t] = a.extend({
                        index: t
                    }, {
                        stateOn: this.stateOn,
                        stateOff: this.stateOff
                    }, e[t]);
                    return e
                }, e.rate = function(t) {
                    !e.readonly && t >= 0 && t <= e.range.length && (i.$setViewValue(t), i.$render())
                }, e.enter = function(t) {
                    e.readonly || (e.value = t), e.onHover({
                        value: t
                    })
                }, e.reset = function() {
                    e.value = i.$viewValue, e.onLeave()
                }, e.onKeydown = function(t) {
                    /(37|38|39|40)/.test(t.which) && (t.preventDefault(), t.stopPropagation(), e.rate(e.value + (38 === t.which || 39 === t.which ? 1 : -1)))
                }, this.render = function() {
                    e.value = i.$viewValue
                }
            }]).directive("rating", function() {
                return {
                    restrict: "EA",
                    require: ["rating", "ngModel"],
                    scope: {
                        readonly: "=?",
                        onHover: "&",
                        onLeave: "&"
                    },
                    controller: "RatingController",
                    templateUrl: "template/rating/rating.html",
                    replace: !0,
                    link: function(e, t, n, i) {
                        var a = i[0],
                            o = i[1];
                        o && a.init(o)
                    }
                }
            }), a.module("ui.bootstrap.tabs", []).controller("TabsetController", ["$scope", function(e) {
                var t, n = this,
                    i = n.tabs = e.tabs = [];
                n.select = function(e) {
                    a.forEach(i, function(e) {
                        e.active = !1
                    }), e.active = !0, t = i.indexOf(e)
                }, n.addTab = function(e) {
                    i.push(e), (1 === i.length || e.active) && n.select(e)
                }, n.removeTab = function(e) {
                    var t = i.indexOf(e);
                    if (e.active && i.length > 1) {
                        var a = t == i.length - 1 ? t - 1 : t + 1;
                        n.select(i[a])
                    }
                    i.splice(t, 1)
                }, e.onKeydown = function(e) {
                    if (/(37|38|39|40)/.test(e.which) && !e.shiftKey && !e.altKey) {
                        e.preventDefault(), e.stopPropagation();
                        for (var n = e.which > 38 ? 1 : -1, a = 1, o = i.length; o > a; a++) {
                            var r = (t + a * n + o) % o,
                                l = i[r];
                            if (!l.disabled) {
                                l.active = !0, l.$element.find("a")[0].focus();
                                break
                            }
                        }
                    }
                }
            }]).directive("tabset", function() {
                return {
                    restrict: "EA",
                    transclude: !0,
                    replace: !0,
                    scope: {},
                    controller: "TabsetController",
                    templateUrl: "template/tabs/tabset.html",
                    link: function(e, t, n) {
                        e.vertical = a.isDefined(n.vertical) ? e.$parent.$eval(n.vertical) : !1, e.justified = a.isDefined(n.justified) ? e.$parent.$eval(n.justified) : !1, e.type = a.isDefined(n.type) ? e.$parent.$eval(n.type) : "tabs"
                    }
                }
            }).directive("tab", ["$parse", function(e) {
                var t = 0;
                return {
                    require: "^tabset",
                    restrict: "EA",
                    replace: !0,
                    templateUrl: "template/tabs/tab.html",
                    transclude: !0,
                    scope: {
                        heading: "@",
                        onSelect: "&select",
                        onDeselect: "&deselect"
                    },
                    controller: function() {},
                    compile: function(n, i, o) {
                        return function(n, i, r, l) {
                            n.$element = i, n.uniqueId = "select-" + t++ + "-" + Math.floor(1e4 * Math.random());
                            var s, c;
                            r.active ? (s = e(r.active), c = s.assign, n.$parent.$watch(s, function(e, t) {
                                e !== t && (n.active = !!e)
                            }), n.active = s(n.$parent)) : c = s = a.noop, n.$watch("active", function(e) {
                                c(n.$parent, e), e ? (l.select(n), n.onSelect()) : n.onDeselect()
                            }), n.disabled = !1, r.disabled && n.$parent.$watch(e(r.disabled), function(e) {
                                n.disabled = !!e
                            }), n.select = function() {
                                n.disabled || (n.active = !0)
                            }, l.addTab(n), n.$on("$destroy", function() {
                                l.removeTab(n), n.$element = null
                            }), n.$transcludeFn = o
                        }
                    }
                }
            }]).directive("tabHeadingTransclude", [function() {
                return {
                    restrict: "A",
                    require: "^tab",
                    link: function(e, t, n, i) {
                        e.$watch("headingElement", function(e) {
                            e && (t.html(""), t.append(e))
                        })
                    }
                }
            }]).directive("tabContentTransclude", function() {
                function e(e) {
                    return e.tagName && (e.hasAttribute("tab-heading") || e.hasAttribute("data-tab-heading") || "tab-heading" === e.tagName.toLowerCase() || "data-tab-heading" === e.tagName.toLowerCase())
                }
                return {
                    restrict: "A",
                    require: "^tabset",
                    link: function(t, n, i) {
                        var o = t.$eval(i.tabContentTransclude);
                        o.$transcludeFn(o.$parent, function(t) {
                            a.forEach(t, function(t) {
                                e(t) ? o.headingElement = t : n.append(t)
                            })
                        })
                    }
                }
            }), a.module("ui.bootstrap.timepicker", []).constant("timepickerConfig", {
                hourStep: 1,
                minuteStep: 1,
                showMeridian: !0,
                meridians: null,
                readonlyInput: !1,
                mousewheel: !0
            }).controller("TimepickerController", ["$scope", "$attrs", "$parse", "$log", "$locale", "timepickerConfig", function(e, t, n, i, o, r) {
                function l() {
                    var t = parseInt(e.hours, 10),
                        n = e.showMeridian ? t > 0 && 13 > t : t >= 0 && 24 > t;
                    return n ? (e.showMeridian && (12 === t && (t = 0), e.meridian === g[1] && (t += 12)), t) : void 0
                }

                function s() {
                    var t = parseInt(e.minutes, 10);
                    return t >= 0 && 60 > t ? t : void 0
                }

                function c(e) {
                    return a.isDefined(e) && e.toString().length < 2 ? "0" + e : e
                }

                function u(e) {
                    p(), h.$setViewValue(new Date(m)), d(e)
                }

                function p() {
                    h.$setValidity("time", !0), e.invalidHours = !1, e.invalidMinutes = !1
                }

                function d(t) {
                    var n = m.getHours(),
                        i = m.getMinutes();
                    e.showMeridian && (n = 0 === n || 12 === n ? 12 : n % 12), e.hours = "h" === t ? n : c(n), e.minutes = "m" === t ? i : c(i), e.meridian = m.getHours() < 12 ? g[0] : g[1]
                }

                function f(e) {
                    var t = new Date(m.getTime() + 6e4 * e);
                    m.setHours(t.getHours(), t.getMinutes()), u()
                }
                var m = new Date,
                    h = {
                        $setViewValue: a.noop
                    },
                    g = a.isDefined(t.meridians) ? e.$parent.$eval(t.meridians) : r.meridians || o.DATETIME_FORMATS.AMPMS;
                this.init = function(n, i) {
                    h = n, h.$render = this.render;
                    var o = i.eq(0),
                        l = i.eq(1),
                        s = a.isDefined(t.mousewheel) ? e.$parent.$eval(t.mousewheel) : r.mousewheel;
                    s && this.setupMousewheelEvents(o, l), e.readonlyInput = a.isDefined(t.readonlyInput) ? scope.$parent.$eval(t.readonlyInput) : r.readonlyInput, this.setupInputEvents(o, l)
                };
                var v = r.hourStep;
                t.hourStep && e.$parent.$watch(n(t.hourStep), function(e) {
                    v = parseInt(e, 10)
                });
                var b = r.minuteStep;
                t.minuteStep && e.$parent.$watch(n(t.minuteStep), function(e) {
                    b = parseInt(e, 10)
                }), e.showMeridian = r.showMeridian, t.showMeridian && e.$parent.$watch(n(t.showMeridian), function(t) {
                    if (e.showMeridian = !!t, h.$error.time) {
                        var n = l(),
                            i = s();
                        a.isDefined(n) && a.isDefined(i) && (m.setHours(n), u())
                    } else d()
                }), this.setupMousewheelEvents = function(t, n) {
                    var i = function(e) {
                        e.originalEvent && (e = e.originalEvent);
                        var t = e.wheelDelta ? e.wheelDelta : -e.deltaY;
                        return e.detail || t > 0
                    };
                    t.bind("mousewheel wheel", function(t) {
                        e.$apply(i(t) ? e.incrementHours() : e.decrementHours()), t.preventDefault()
                    }), n.bind("mousewheel wheel", function(t) {
                        e.$apply(i(t) ? e.incrementMinutes() : e.decrementMinutes()), t.preventDefault()
                    })
                }, this.setupInputEvents = function(t, n) {
                    if (e.readonlyInput) return e.updateHours = a.noop, void(e.updateMinutes = a.noop);
                    var i = function(t, n) {
                        h.$setViewValue(null), h.$setValidity("time", !1), a.isDefined(t) && (e.invalidHours = t), a.isDefined(n) && (e.invalidMinutes = n)
                    };
                    e.updateHours = function() {
                        var e = l();
                        a.isDefined(e) ? (m.setHours(e), u("h")) : i(!0)
                    }, t.bind("blur", function(t) {
                        !e.validHours && e.hours < 10 && e.$apply(function() {
                            e.hours = c(e.hours)
                        })
                    }), e.updateMinutes = function() {
                        var e = s();
                        a.isDefined(e) ? (m.setMinutes(e), u("m")) : i(void 0, !0)
                    }, n.bind("blur", function(t) {
                        !e.invalidMinutes && e.minutes < 10 && e.$apply(function() {
                            e.minutes = c(e.minutes)
                        })
                    })
                }, this.render = function() {
                    var e = h.$modelValue ? new Date(h.$modelValue) : null;
                    isNaN(e) ? (h.$setValidity("time", !1), i.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.')) : (e && (m = e), p(), d())
                }, e.incrementHours = function() {
                    f(60 * v)
                }, e.decrementHours = function() {
                    f(60 * -v)
                }, e.incrementMinutes = function() {
                    f(b)
                }, e.decrementMinutes = function() {
                    f(-b)
                }, e.toggleMeridian = function() {
                    f(720 * (m.getHours() < 12 ? 1 : -1))
                }
            }]).directive("timepicker", function() {
                return {
                    restrict: "EA",
                    require: ["timepicker", "?^ngModel"],
                    controller: "TimepickerController",
                    replace: !0,
                    scope: {},
                    templateUrl: "template/timepicker/timepicker.html",
                    link: function(e, t, n, i) {
                        var a = i[0],
                            o = i[1];
                        o && a.init(o, t.find("input"))
                    }
                }
            }), a.module("ui.bootstrap.typeahead", ["ui.bootstrap.position", "ui.bootstrap.bindHtml"]).factory("typeaheadParser", ["$parse", function(e) {
                var t = /^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;
                return {
                    parse: function(n) {
                        var i = n.match(t);
                        if (!i) throw new Error('Expected typeahead specification in form of "_modelValue_ (as _label_)? for _item_ in _collection_" but got "' + n + '".');
                        return {
                            itemName: i[3],
                            source: e(i[4]),
                            viewMapper: e(i[2] || i[1]),
                            modelMapper: e(i[1])
                        }
                    }
                }
            }]).directive("typeahead", ["$compile", "$parse", "$q", "$timeout", "$document", "$position", "typeaheadParser", function(e, t, n, i, o, r, l) {
                var s = [9, 13, 27, 38, 40];
                return {
                    require: "ngModel",
                    link: function(c, u, p, d) {
                        var f, m = c.$eval(p.typeaheadMinLength) || 1,
                            h = c.$eval(p.typeaheadWaitMs) || 0,
                            g = c.$eval(p.typeaheadEditable) !== !1,
                            v = t(p.typeaheadLoading).assign || a.noop,
                            b = t(p.typeaheadOnSelect),
                            y = p.typeaheadInputFormatter ? t(p.typeaheadInputFormatter) : void 0,
                            w = p.typeaheadAppendToBody ? c.$eval(p.typeaheadAppendToBody) : !1,
                            x = t(p.ngModel).assign,
                            $ = l.parse(p.typeahead);
                        u.attr({
                            "aria-autocomplete": "list",
                            "aria-expanded": !1
                        });
                        var k = a.element("<div typeahead-popup></div>");
                        k.attr({
                            matches: "matches",
                            active: "activeIdx",
                            select: "select(activeIdx)",
                            query: "query",
                            position: "position"
                        }), a.isDefined(p.typeaheadTemplateUrl) && k.attr("template-url", p.typeaheadTemplateUrl);
                        var C = c.$new();
                        c.$on("$destroy", function() {
                            C.$destroy()
                        });
                        var D = function() {
                                C.matches = [], C.activeIdx = -1, u.attr("aria-expanded", !1)
                            },
                            T = function(e) {
                                var t = {
                                    $viewValue: e
                                };
                                v(c, !0), n.when($.source(c, t)).then(function(n) {
                                    if (e === d.$viewValue && f) {
                                        if (n.length > 0) {
                                            C.activeIdx = 0, C.matches.length = 0;
                                            for (var i = 0; i < n.length; i++) t[$.itemName] = n[i], C.matches.push({
                                                label: $.viewMapper(C, t),
                                                model: n[i]
                                            });
                                            C.query = e, C.position = w ? r.offset(u) : r.position(u), C.position.top = C.position.top + u.prop("offsetHeight"), u.attr("aria-expanded", !0)
                                        } else D();
                                        v(c, !1)
                                    }
                                }, function() {
                                    D(), v(c, !1)
                                })
                            };
                        D(), C.query = void 0;
                        var S;
                        d.$parsers.unshift(function(e) {
                            return f = !0, e && e.length >= m ? h > 0 ? (S && i.cancel(S), S = i(function() {
                                T(e)
                            }, h)) : T(e) : (v(c, !1), D()), g ? e : e ? void d.$setValidity("editable", !1) : (d.$setValidity("editable", !0), e)
                        }), d.$formatters.push(function(e) {
                            var t, n, i = {};
                            return y ? (i.$model = e, y(c, i)) : (i[$.itemName] = e, t = $.viewMapper(c, i), i[$.itemName] = void 0, n = $.viewMapper(c, i), t !== n ? t : e)
                        }), C.select = function(e) {
                            var t, n, i = {};
                            i[$.itemName] = n = C.matches[e].model, t = $.modelMapper(c, i), x(c, t), d.$setValidity("editable", !0), b(c, {
                                $item: n,
                                $model: t,
                                $label: $.viewMapper(c, i)
                            }), D(), u[0].focus()
                        }, u.bind("keydown", function(e) {
                            0 !== C.matches.length && -1 !== s.indexOf(e.which) && (e.preventDefault(), 40 === e.which ? (C.activeIdx = (C.activeIdx + 1) % C.matches.length, C.$digest()) : 38 === e.which ? (C.activeIdx = (C.activeIdx ? C.activeIdx : C.matches.length) - 1, C.$digest()) : 13 === e.which || 9 === e.which ? C.$apply(function() {
                                C.select(C.activeIdx)
                            }) : 27 === e.which && (e.stopPropagation(), D(), C.$digest()))
                        }), u.bind("blur", function(e) {
                            f = !1
                        });
                        var M = function(e) {
                            u[0] !== e.target && (D(), C.$digest())
                        };
                        o.bind("click", M), c.$on("$destroy", function() {
                            o.unbind("click", M)
                        });
                        var E = e(k)(C);
                        w ? o.find("body").append(E) : u.after(E)
                    }
                }
            }]).directive("typeaheadPopup", function() {
                return {
                    restrict: "EA",
                    scope: {
                        matches: "=",
                        query: "=",
                        active: "=",
                        position: "=",
                        select: "&"
                    },
                    replace: !0,
                    templateUrl: "template/typeahead/typeahead-popup.html",
                    link: function(e, t, n) {
                        e.templateUrl = n.templateUrl, e.isOpen = function() {
                            return e.matches.length > 0
                        }, e.isActive = function(t) {
                            return e.active == t
                        }, e.selectActive = function(t) {
                            e.active = t
                        }, e.selectMatch = function(t) {
                            e.select({
                                activeIdx: t
                            })
                        }
                    }
                }
            }).directive("typeaheadMatch", ["$http", "$templateCache", "$compile", "$parse", function(e, t, n, i) {
                return {
                    restrict: "EA",
                    scope: {
                        index: "=",
                        match: "=",
                        query: "="
                    },
                    link: function(a, o, r) {
                        var l = i(r.templateUrl)(a.$parent) || "template/typeahead/typeahead-match.html";
                        e.get(l, {
                            cache: t
                        }).success(function(e) {
                            o.replaceWith(n(e.trim())(a))
                        })
                    }
                }
            }]).filter("typeaheadHighlight", function() {
                function e(e) {
                    return e.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1")
                }
                return function(t, n) {
                    return n ? ("" + t).replace(new RegExp(e(n), "gi"), "<strong>$&</strong>") : t
                }
            }), a.module("template/accordion/accordion-group.html", []).run(["$templateCache", function(e) {
                e.put("template/accordion/accordion-group.html", '<div class="panel panel-default">\n  <div class="panel-heading">\n    <h4 class="panel-title">\n      <a class="accordion-toggle" ng-click="toggleOpen()" accordion-transclude="heading"><span ng-class="{\'text-muted\': isDisabled}">{{heading}}</span></a>\n    </h4>\n  </div>\n  <div class="panel-collapse" collapse="!isOpen">\n   <div class="panel-body" ng-transclude></div>\n  </div>\n</div>')
            }]), a.module("template/accordion/accordion.html", []).run(["$templateCache", function(e) {
                e.put("template/accordion/accordion.html", '<div class="panel-group" ng-transclude></div>')
            }]), a.module("template/alert/alert.html", []).run(["$templateCache", function(e) {
                e.put("template/alert/alert.html", '<div class="alert" ng-class="{\'alert-{{type || \'warning\'}}\': true, \'alert-dismissable\': closeable}" role="alert">\n    <button ng-show="closeable" type="button" class="close" ng-click="close()">\n        <span aria-hidden="true">&times;</span>\n        <span class="sr-only">Close</span>\n    </button>\n    <div ng-transclude></div>\n</div>\n')
            }]), a.module("template/carousel/carousel.html", []).run(["$templateCache", function(e) {
                e.put("template/carousel/carousel.html", '<div ng-mouseenter="pause()" ng-mouseleave="play()" class="carousel" ng-swipe-right="prev()" ng-swipe-left="next()">\n    <ol class="carousel-indicators" ng-show="slides.length > 1">\n        <li ng-repeat="slide in slides track by $index" ng-class="{active: isActive(slide)}" ng-click="select(slide)"></li>\n    </ol>\n    <div class="carousel-inner" ng-transclude></div>\n    <a class="left carousel-control" ng-click="prev()" ng-show="slides.length > 1"><span class="icon-prev"></span></a>\n    <a class="right carousel-control" ng-click="next()" ng-show="slides.length > 1"><span class="icon-next"></span></a>\n</div>\n')
            }]), a.module("template/carousel/slide.html", []).run(["$templateCache", function(e) {
                e.put("template/carousel/slide.html", "<div ng-class=\"{\n    'active': leaving || (active && !entering),\n    'prev': (next || active) && direction=='prev',\n    'next': (next || active) && direction=='next',\n    'right': direction=='prev',\n    'left': direction=='next'\n  }\" class=\"item text-center\" ng-transclude></div>\n")
            }]), a.module("template/datepicker/datepicker.html", []).run(["$templateCache", function(e) {
                e.put("template/datepicker/datepicker.html", '<div ng-switch="datepickerMode" role="application" ng-keydown="keydown($event)">\n  <div daypicker="daypicker" ng-switch-when="day" tabindex="0"></div>\n  <div monthpicker="monthpicker" ng-switch-when="month" tabindex="0"></div>\n  <div yearpicker="yearpicker" ng-switch-when="year" tabindex="0"></div>\n</div>')
            }]), a.module("template/datepicker/day.html", []).run(["$templateCache", function(e) {
                e.put("template/datepicker/day.html", '<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="lp-icon lp-icon-angle-left"></i></button></th>\n      <th colspan="{{5 + showWeeks}}"><button style="width:100%;" id="{{uniqueId}}-title" role="heading"       aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="lp-icon lp-icon-angle-right"></i></button></th>\n    </tr>\n    <tr>\n      <th ng-show="showWeeks" class="text-center"></th>\n      <th ng-repeat="label in labels track by $index" class="text-center"><small aria-label="{{label.full}}">{{label.abbr}}</small></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-show="showWeeks" class="text-center h6"><em>{{ weekNumbers[$index] }}</em></td>\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default btn-sm" ng-class="{\'btn-muted\': dt.secondary, \'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-muted\': dt.secondary, \'text-info\': dt.current}">{{dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n')
            }]), a.module("template/datepicker/month.html", []).run(["$templateCache", function(e) {
                e.put("template/datepicker/month.html", '<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="lp-icon lp-icon-angle-left"></i></button></th>\n      <th><button style="width:100%;" id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="lp-icon lp-icon-angle-right"></i></button></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-info\': dt.current}">{{dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n')
            }]), a.module("template/datepicker/popup.html", []).run(["$templateCache", function(e) {
                e.put("template/datepicker/popup.html", '<ul class="dropdown-menu lp-datepicker" ng-style="{display: (isOpen && \'block\') || \'none\', top: position.top+\'px\', left: position.left+\'px\'}" ng-keydown="keydown($event)">\n <li ng-transclude></li>\n <li ng-if="showButtonBar" style="padding:10px 9px 2px">\n   <span class="btn-group">\n     <button type="button" class="btn btn-sm btn-info" ng-click="select(\'today\')">{{ getText(\'current\') }}</button>\n     <button type="button" class="btn btn-sm btn-danger" ng-click="select(null)">{{ getText(\'clear\') }}</button>\n   </span>\n   <button type="button" class="btn btn-sm btn-success pull-right" ng-click="close()">{{ getText(\'close\') }}</button>\n </li>\n</ul>\n')
            }]), a.module("template/datepicker/year.html", []).run(["$templateCache", function(e) {
                e.put("template/datepicker/year.html", '<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="lp-icon lp-icon-angle-left"></i></button></th>\n      <th colspan="3"><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm btn-block" ng-click="toggleMode()" tabindex="-1"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="lp-icon lp-icon-angle-right"></i></button></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-info\': dt.current}">{{dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n')
            }]), a.module("template/dropdown/dropdown-multiple.html", []).run(["$templateCache", function(e) {
                e.put("template/dropdown/dropdown-multiple.html", '<a tabindex="-1">\n <i class="icon-ok pull-right" ng-show="option.selected"></i>\n <div bind-html-unsafe="option.label" style="overflow: hidden;"></div>\n</a>')
            }]), a.module("template/dropdown/dropdown-option.html", []).run(["$templateCache", function(e) {
                e.put("template/dropdown/dropdown-option.html", '<a tabindex="-1" bind-html-unsafe="option.label"></a>')
            }]), a.module("template/dropdown/dropdown.html", []).run(["$templateCache", function(e) {
                e.put("template/dropdown/dropdown.html", '<div class="btn-group dropdown">\n    <button class="btn btn-block dropdown-toggle" ng-class="[type && \'btn-\' + type, disabled && \'disabled\']" style="text-align: left; padding-left:5px;">\n        <span bind-html-unsafe="label || emptyLabel"></span>\n        <span class="caret" style="position: absolute; right: 12px"></span>\n    </button>\n    <ul class="dropdown-menu" style="min-width:100%;">\n        <li ng-show="header" ng-click="prevent($event)"><h3 class="popover-title" >{{header}}</h3></li>\n        <li ng-repeat-start="(group, options) in groups" ng-click="prevent($event)" style="padding-left:5px;"><dt>{{group}}</dt></li>\n        <li ng-repeat="option in options" ng-click="select($event, option)" ng-class="{ disabled: option.disabled }">\n            <div dropdown-option="dropdown-option" option="option" template-url="templateUrl" multiple="multiple"></div>\n        </li>\n        <li class="divider" ng-hide="$index === numGroups - 1" ng-repeat-end></li>\n    </ul>\n</div>\n')
            }]), a.module("template/dropdownSelect/option.html", []).run(["$templateCache", function(e) {
                e.put("template/dropdownSelect/option.html", "<span>{{option}}</span>")
            }]), a.module("template/dropdownSelect/placeholder-empty.html", []).run(["$templateCache", function(e) {
                e.put("template/dropdownSelect/placeholder-empty.html", "<span>{{getEmptyText()}}</span>")
            }]), a.module("template/dropdownSelect/select.html", []).run(["$templateCache", function(e) {
                e.put("template/dropdownSelect/select.html", '<div class="btn-group dropdown" ng-keydown="onKeydown($event)" is-open="isopen" role="combobox" aria-activedescendant="{{activeOption.id}}">\n    <button tabindex="0" type="button" class="btn dropdown-toggle" ng-class="[\'btn-\' + (type || \'default\'), size && (\'btn-\' + size)]" ng-disabled="isDisabled" style="width:100%;" aria-label="{{label}}" >\n        <span placeholder-empty ng-if="isEmpty()" empty-placeholder-text="{{emptyPlaceholderText}}"></span>\n        <span ng-if="!isEmpty() && !multiple" select-option="selectedOption.label" template-url="optionTemplateUrl"></span>\n        <span ng-if="!isEmpty() && multiple" ng-repeat="option in selectedOption track by $index"><span select-option="option.label" template-url="optionTemplateUrl"></span><span ng-if="!$last">, </span></span>\n        <span class="caret"></span>\n    </button>\n    <ul class="dropdown-menu" style="width:100%;" ng-click="prevent($event)" role="listbox" ng-if="isopen">\n        <li ng-if="filter.enabled" style="padding:5px"><input tabindex="-1" type="search" class="form-control" style="width: 100%" ng-model="filter.value" ng-change="filterOptions()" aria-readonly="true" aria-activedescendant="{{activeOption.id}}" placeholder="{{filterPlaceholderText}}"></li>\n        <li ng-repeat-start="(groupName, group) in groups track by $index" class="dropdown-header" ng-if="groupName">{{groupName}}</li>\n        <li tabindex="{{isActive(option) ? 0 : -1}}" ng-repeat="option in group.options track by $index" ng-class="{active: isActive(option)}" role="option" ng-click="select(option, $event)" ng-if="option.valid" aria-selected="{{!!option.selected}}" aria-labelledby="{{option.id}}" >\n            <a href tabindex="-1" select-option="option.label" template-url="optionTemplateUrl" id="{{option.id}}">\n                <i ng-if="multiple && option.selected" class="glyphicon glyphicon-ok pull-right"></i>\n            </a>\n        </li>\n        <li class="divider" ng-if="!$last" ng-repeat-end></li>\n    </ul>\n</div>\n');
            }]), a.module("template/modal/backdrop.html", []).run(["$templateCache", function(e) {
                e.put("template/modal/backdrop.html", '<div class="modal-backdrop fade"\n     ng-class="{in: animate}"\n     ng-style="{\'z-index\': 1040 + (index && 1 || 0) + index*10}"\n></div>\n')
            }]), a.module("template/modal/window.html", []).run(["$templateCache", function(e) {
                e.put("template/modal/window.html", '<div tabindex="-1" class="modal fade {{ windowClass }}" ng-class="{in: animate}" ng-style="{\'z-index\': 1050 + index*10, display: \'block\'}" ng-click="close($event)">\n    <div class="modal-dialog"><div class="modal-content" ng-transclude></div></div>\n</div>')
            }]), a.module("template/pagination/pager.html", []).run(["$templateCache", function(e) {
                e.put("template/pagination/pager.html", '<ul class="pager">\n  <li ng-class="{disabled: noPrevious(), previous: align}"><a href ng-click="selectPage(page - 1)">{{getText(\'previous\')}}</a></li>\n  <li ng-class="{disabled: noNext(), next: align}"><a href ng-click="selectPage(page + 1)">{{getText(\'next\')}}</a></li>\n</ul>')
            }]), a.module("template/pagination/pagination.html", []).run(["$templateCache", function(e) {
                e.put("template/pagination/pagination.html", '<ul class="pagination">\n  <li ng-if="boundaryLinks" ng-class="{disabled: noPrevious()}"><a href ng-click="selectPage(1)">{{getText(\'first\')}}</a></li>\n  <li ng-if="directionLinks" ng-class="{disabled: noPrevious()}"><a href ng-click="selectPage(page - 1)">{{getText(\'previous\')}}</a></li>\n  <li ng-repeat="page in pages track by $index" ng-class="{active: page.active}"><a href ng-click="selectPage(page.number)">{{page.text}}</a></li>\n  <li ng-if="directionLinks" ng-class="{disabled: noNext()}"><a href ng-click="selectPage(page + 1)">{{getText(\'next\')}}</a></li>\n  <li ng-if="boundaryLinks" ng-class="{disabled: noNext()}"><a href ng-click="selectPage(totalPages)">{{getText(\'last\')}}</a></li>\n</ul>')
            }]), a.module("template/tooltip/tooltip-html-unsafe-popup.html", []).run(["$templateCache", function(e) {
                e.put("template/tooltip/tooltip-html-unsafe-popup.html", '<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="tooltip-arrow"></div>\n  <div class="tooltip-inner" bind-html-unsafe="content"></div>\n</div>\n')
            }]), a.module("template/tooltip/tooltip-popup.html", []).run(["$templateCache", function(e) {
                e.put("template/tooltip/tooltip-popup.html", '<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="tooltip-arrow"></div>\n  <div class="tooltip-inner" ng-bind="content"></div>\n</div>\n')
            }]), a.module("template/popover/popover.html", []).run(["$templateCache", function(e) {
                e.put("template/popover/popover.html", '<div class="popover {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="arrow"></div>\n\n  <div class="popover-inner">\n      <h3 class="popover-title" ng-bind="title" ng-show="title"></h3>\n      <div class="popover-content" ng-bind="content"></div>\n  </div>\n</div>\n')
            }]), a.module("template/progressbar/bar.html", []).run(["$templateCache", function(e) {
                e.put("template/progressbar/bar.html", '<div class="progress-bar" ng-class="type && \'progress-bar-\' + type" role="progressbar" aria-valuenow="{{value}}" aria-valuemin="0" aria-valuemax="{{max}}" ng-style="{width: percent + \'%\'}" aria-valuetext="{{percent | number:0}}%" ng-transclude></div>')
            }]), a.module("template/progressbar/progress.html", []).run(["$templateCache", function(e) {
                e.put("template/progressbar/progress.html", '<div class="progress" ng-transclude></div>')
            }]), a.module("template/progressbar/progressbar.html", []).run(["$templateCache", function(e) {
                e.put("template/progressbar/progressbar.html", '<div class="progress">\n  <div class="progress-bar" ng-class="type && \'progress-bar-\' + type" role="progressbar" aria-valuenow="{{value}}" aria-valuemin="0" aria-valuemax="{{max}}" ng-style="{width: percent + \'%\'}" aria-valuetext="{{percent | number:0}}%" ng-transclude></div>\n</div>')
            }]), a.module("template/rating/rating.html", []).run(["$templateCache", function(e) {
                e.put("template/rating/rating.html", '<span ng-mouseleave="reset()" ng-keydown="onKeydown($event)" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="{{range.length}}" aria-valuenow="{{value}}">\n    <i ng-repeat="r in range track by $index" ng-mouseenter="enter($index + 1)" ng-click="rate($index + 1)" class="glyphicon" ng-class="$index < value && (r.stateOn || \'glyphicon-star\') || (r.stateOff || \'glyphicon-star-empty\')">\n        <span class="sr-only">({{ $index < value ? \'*\' : \' \' }})</span>\n    </i>\n</span>')
            }]), a.module("template/tabs/tab.html", []).run(["$templateCache", function(e) {
                e.put("template/tabs/tab.html", '<li ng-class="{active: active, disabled: disabled}" id="{{uniqueId}}" role="presentation" ng-click="select()">\n  <a href role="tab" tabindex="0" aria-labelledby="{{uniqueId}}" aria-expanded="{{!!active}}" aria-selected="{{!!active}}" tab-heading-transclude>{{heading}}</a>\n</li>\n')
            }]), a.module("template/tabs/tabset.html", []).run(["$templateCache", function(e) {
                e.put("template/tabs/tabset.html", '<div>\n  <ul ng-keydown="onKeydown($event)" class="nav nav-{{type || \'tabs\'}}" ng-class="{\'nav-stacked\': vertical, \'nav-justified\': justified}" role="tablist" ng-transclude></ul>\n  <div class="tab-content">\n    <div class="tab-pane" ng-repeat="tab in tabs" ng-class="{active: tab.active}"\n         role="tabpanel" aria-hidden="{{!tab.active}}"\n         tab-content-transclude="tab">\n    </div>\n  </div>\n</div>\n')
            }]), a.module("template/timepicker/timepicker.html", []).run(["$templateCache", function(e) {
                e.put("template/timepicker/timepicker.html", '<table>\n <tbody>\n   <tr class="text-center">\n     <td><a ng-click="incrementHours()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-up"></span></a></td>\n     <td>&nbsp;</td>\n     <td><a ng-click="incrementMinutes()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-up"></span></a></td>\n     <td ng-show="showMeridian"></td>\n   </tr>\n   <tr>\n     <td style="width:50px;" class="form-group" ng-class="{\'has-error\': invalidHours}">\n       <input type="text" ng-model="hours" ng-change="updateHours()" class="form-control text-center" ng-mousewheel="incrementHours()" ng-readonly="readonlyInput" maxlength="2">\n     </td>\n     <td>:</td>\n     <td style="width:50px;" class="form-group" ng-class="{\'has-error\': invalidMinutes}">\n       <input type="text" ng-model="minutes" ng-change="updateMinutes()" class="form-control text-center" ng-readonly="readonlyInput" maxlength="2">\n     </td>\n     <td ng-show="showMeridian"><button type="button" class="btn btn-default text-center" ng-click="toggleMeridian()">{{meridian}}</button></td>\n   </tr>\n   <tr class="text-center">\n     <td><a ng-click="decrementHours()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-down"></span></a></td>\n     <td>&nbsp;</td>\n     <td><a ng-click="decrementMinutes()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-down"></span></a></td>\n     <td ng-show="showMeridian"></td>\n   </tr>\n </tbody>\n</table>\n')
            }]), a.module("template/typeahead/typeahead-match.html", []).run(["$templateCache", function(e) {
                e.put("template/typeahead/typeahead-match.html", '<a tabindex="-1" bind-html-unsafe="match.label | typeaheadHighlight:query"></a>')
            }]), a.module("template/typeahead/typeahead-popup.html", []).run(["$templateCache", function(e) {
                e.put("template/typeahead/typeahead-popup.html", '<ul class="dropdown-menu" ng-if="isOpen()" ng-style="{top: position.top+\'px\', left: position.left+\'px\'}" style="display: block;" role="listbox" aria-hidden="{{!isOpen()}}">\n    <li ng-repeat="match in matches track by $index" ng-class="{active: isActive($index) }" ng-mouseenter="selectActive($index)" ng-click="selectMatch($index)" role="option">\n        <div typeahead-match index="$index" match="match" query="query" template-url="templateUrl"></div>\n    </li>\n</ul>')
            }])
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                var a = n(2);
                i.name = "ui.input-overflow", i.exports = a.createModule(i.name, []).directive(n(5))
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        i = function(e, t) {
            "use strict";
            var i = n(2).ng;
            t.lpInputOverflow = function(e) {
                function t(e) {
                    return i.element('<div class="lp-input-overflow"><div class="lp-input-overflow-indicator"><span class="lp-input-overflow-elipsis">...</span></div><span class="lp-input-overflow-input-text" style="font-size: ' + e + '"></span></div>')
                }
                return {
                    require: "ngModel",
                    link: function(n, i, a, o) {
                        function r() {
                            var e = u.text(o.$modelValue).width(),
                                t = i.width();
                            p.toggleClass("inactive", t > e)
                        }

                        function l() {
                            p.hasClass("inactive") || (p.addClass("inactive"), i.focus())
                        }
                        var s = i.css("font-size"),
                            c = i.after(t(s)).next().append(i),
                            u = c.find(".lp-input-overflow-input-text"),
                            p = c.find(".lp-input-overflow-indicator");
                        i.on("blur", r), i.on("click focus", l), p.on("click", l), e(r, 100)
                    }
                }
            }, t.lpInputOverflow.$inject = ["$timeout"]
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                i.name = "ui.amount";
                var a = n(2),
                    o = n(7);
                i.exports = a.createModule(i.name, [o.name]).directive(n(8))
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, n) {
        e.exports = t
    }, function(e, t, n) {
        var i;
        i = function(e, t, n) {
            "use strict";
            t.lpAmount = function(e) {
                function t() {
                    return '<span class="{{signClass}}">{{formattedAmount}}</span>'
                }

                function n(t, n, o) {
                    function r() {
                        var n = parseFloat(t.amount);
                        t.signClass = 0 > n ? i : a, t.formattedAmount = e.formatCurrency(n, t.currency)
                    }
                    t.$watch("amount", r), t.$watch("currency", r), t.$on("$localeChangeSuccess", r)
                }
                var i = "lp-amount-negative",
                    a = "lp-amount-positive";
                return {
                    restrict: "EA",
                    template: t,
                    link: n,
                    scope: {
                        amount: "=lpAmount",
                        currency: "=lpAmountCurrency"
                    }
                }
            }, t.lpAmount.$inject = ["lpCoreI18n"]
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                i.name = "ui.list";
                var a = n(2),
                    o = n(7);
                i.exports = a.createModule(i.name, [o.name]).directive(n(10))
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        i = function(e, t, n) {
            "use strict";
            t.lpList = function() {
                function e() {
                    return ['<div class="list">', "</div>"].join("")
                }

                function t(t, a) {
                    var o = n.element(e()).append(t.contents()).addClass(i);
                    t.append(o)
                }
                var n = window.angular,
                    i = "list-group";
                return {
                    restrict: "EA",
                    priority: Number.MAX_VALUE,
                    compile: t,
                    scope: {}
                }
            }, t.lpItem = function() {
                function e(e, t, n) {
                    e.href = function() {
                        return n.href || n.ngHref
                    }, e.target = function() {
                        return n.target || "_self"
                    }
                }

                function t(e) {
                    return ["<div", e ? ' ng-href="{{href()}}" target="{{target()}}"' : "", ">", "</div>"].join("")
                }

                function n(n, r) {
                    var l, s;
                    return l = i.isDefined(r.href) || i.isDefined(r.ngHref), s = i.element(t(l)), s.append(n.contents()), s.addClass(a), n.append(s), n.addClass(o), e
                }
                var i = window.angular,
                    a = "list-group-item clearfix",
                    o = "list-group-container";
                return {
                    restrict: "EA",
                    compile: n,
                    scope: !0
                }
            }, t.lpItemCell = function() {
                function e() {
                    return ["<div>", "</div>"].join("")
                }

                function t(e, t) {
                    var n = ["xs", "sm", "md", "lg"],
                        a = i.isDefined(t.width) ? t.width : Math.floor(12 / e.children().length);
                    i.forEach(n, function(n) {
                        var o = n + "Width",
                            r = i.isDefined(t[o]) ? t[o] : a;
                        e.addClass("col-" + n + "-" + r)
                    })
                }

                function n(n, a) {
                    var o;
                    o = i.element(e()), o.append(n.contents()), t(n, a), n.append(o)
                }
                var i = window.angular;
                return {
                    restrict: "EA",
                    compile: n,
                    scope: !0
                }
            }
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                i.name = "ui.field";
                var a = n(2),
                    o = n(7),
                    r = a.utils;
                i.exports = a.createModule(i.name, [o.name]).directive(n(12)).controller(n(14)).value("defaultErrorMessages", {
                    required: "This field is required."
                }).filter("newlines", function() {
                    return function(e) {
                        return r.isString(e) ? e.replace(/\n/g, "<br/>") : e
                    }
                })
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        i = function(e, t, i) {
            "use strict";
            var a = n(2),
                o = a.ng,
                r = n(13),
                l = {},
                s = function(e, t) {
                    return o.element(e && e.querySelector(t))
                };
            t.lpField = function() {
                return {
                    restrict: "EA",
                    replace: !0,
                    transclude: !0,
                    template: l.lpField,
                    scope: {
                        label: "@",
                        tip: "@",
                        help: "@",
                        actionLabel: "@",
                        action: "@"
                    },
                    controller: "FieldController",
                    link: function(e, t, n, i, a) {
                        e.extraControls = n.extraControls && "true" === n.extraControls, a(e.$parent, function(n) {
                            var i = [];
                            if (n.length > 1)
                                for (var a = 0; a < n.length; a++) 1 === n[a].nodeType && i.push(n[a]);
                            else i.push(n[0]);
                            var r = o.element(i[0]);
                            if (s(t[0], ".field-area").prepend(r), e.extraControls) {
                                var l = o.element(i[1]);
                                s(t[0], ".extra-control").prepend(l)
                            }
                        })
                    }
                }
            }, t.lpEnterPressed = function() {
                return {
                    restrict: "A",
                    scope: !0,
                    link: function(e, t, n) {
                        t.on("keydown", function(t) {
                            13 === t.which && (t.preventDefault(), e.$apply(function() {
                                e.save(e.model.value)
                            }))
                        })
                    }
                }
            }, t.lpControl = function(e, t, n) {
                function i() {
                    return l.lpControl
                }
                return {
                    restrict: "EA",
                    replace: !0,
                    transclude: !0,
                    template: i,
                    scope: {
                        label: "@",
                        tip: "@",
                        validate: "&",
                        loading: "="
                    },
                    require: ["^lpField", "?ngModel"],
                    link: function(i, a, l, c) {
                        var u = c[1],
                            p = c[0];
                        if (i.keepEdittingOpen = !1, i.readonly = o.isDefined(l.readonly) ? i.$parent.$eval(l.readonly) : !1, a.on("keydown", function(e) {
                                13 !== e.which || i.editting || i.setEditMode(!0)
                            }), !u) return void(i.readonly = !0);
                        var d = o.isDefined(l.required) ? i.$parent.$eval(l.required) : !0;
                        l.$observe("type", function(e) {
                            i.type = e || "text", ("select" === i.type || "checkbox" === i.type || "select-multiple" === i.type || "radio" === i.type) && (i.options = i.$parent.$eval(l.options))
                        }), i.model = {};
                        var f, m = function() {
                            return f || (f = s(a[0], "select" === i.type || "select-multiple" === i.type ? "select" : "textarea" === i.type ? "textarea" : "input")), f.length > 1 ? f[1] : f
                        };
                        i.edditing = !1, i.setEditMode = function(t) {
                            i.editting = t, i.editting ? (i.model.value = o.copy(u.$modelValue), i.keepEdittingOpen || e(function() {
                                m().focus()
                            }, 0)) : p.clearErrors()
                        }, e(function() {
                            r.enable(a).rule({
                                "max-width": 240,
                                then: function() {
                                    i.keepEdittingOpen = !0, i.setEditMode(!0)
                                }
                            }).rule({
                                "min-width": 241,
                                then: function() {
                                    i.keepEdittingOpen = !1, i.setEditMode(!1)
                                }
                            })
                        }), i.save = function(e) {
                            p.clearErrors(), e = o.element("<div>").text(e).html();
                            var n = !0,
                                a = e.length;
                            return d && 1 > a ? (p.addError("required"), !1) : (n && l.validate && (n = i.validate({
                                value: e
                            }), "string" == typeof n && (p.addError(n), n = !1)), void(n && (i.keepEdittingOpen || i.setEditMode(!1), u.$setViewValue(e), i.model.text = t.trustAsHtml(i.getText(e)))))
                        }, i.isChecked = function(e) {
                            return u.$modelValue.indexOf(e) > -1
                        }, i.toggleCheck = function(e) {
                            var t = i.model.value.indexOf(e);
                            t > -1 ? i.model.value.splice(t, 1) : i.model.value.push(e)
                        }, i.getText = function(e) {
                            var t, a, o = i.options;
                            if ("textarea" === i.type) e = n(e);
                            else if ("select" === i.type || "radio" === i.type) {
                                for (t = 0, a = o.length; a > t; t++)
                                    if (o[t].value.toString() === e.toString()) return o[t].text
                            } else if ("checkbox" === i.type || "select-multiple" === i.type) {
                                var r = [];
                                for (t = 0, a = o.length; a > t; t++) e.indexOf(o[t].value) > -1 && r.push(o[t].text);
                                return r.join(", ")
                            }
                            return e ? e.toString().replace("<br/>", "\n") : ""
                        }, u.$render = function() {
                            i.model.text = t.trustAsHtml(i.getText(u.$modelValue)), i.model.value = i.getText(u.$modelValue)
                        }
                    }
                }
            }, t.lpControl.$inject = ["$timeout", "$sce", "newlinesFilter"], l.lpField = ['<div class="lp-field form-group">', '	<label class="col-sm-3 control-label labelText">', '		<span lp-i18n="{{label}}">{{label}}</span> <i class="lp-icon infoIcon" tooltip="{{tip}}" tooltip-append-to-body="true" tooltip-trigger="click" ng-show="tip"><img class="infoWidth" src="static/features/[BBHOST]/theme-idfc/images/info_xxxhdpi.png"></i>', "	</label>", '	<div class="col-sm-6 field-area text-center">', '		<div ng-repeat="error in errorMessages" class="text-danger"><small>{{error}}</small></div>', '		<div class="lp-field-help" ng-show="help">', '			<small class="text-muted" lp-i18n="{{help}}">{{help}}</small>', "		</div>", "	</div>", '	<div class="col-sm-3 no-padding extra-control">', '		<a ng-if="action" ng-href="{{action}}"><small>{{actionLabel || action}}</small></a>', "	</div>", "</div>"].join("\n"), l.fieldFn = function(e) {
                return ['<div ng-switch-when="', e, '" class="input-group">', '	<input type="', e, '" ng-model="model.value" class="form-control" lp-enter-pressed="" />', l.inputGroupBtn, "</div>"].join("")
            }, l.btnFn = function(e) {
                return ['<div class="' + e + '">', '	<button type="button" class="btn btn-default propertiesreset" ng-click="setEditMode(false)" ng-hide="keepEdittingOpen">', '		<i class="glyphicon glyphicon-remove"></i>', "	</button>", '	<button type="button" class="btn btn-default propertiessubmit" ng-click="save(model.value)" >', '		<i class=" glyphicon glyphicon-ok"></i>', "	</button>", "</div>"].join("")
            }, l.inputGroupBtn = l.btnFn("input-group-btn"), l.inputGroupBtnRight = l.btnFn("btn-group pull-right"), l.lpControl = ['<div class="lp-editable">', '	<div ng-hide="editting" class="has-feedback">', '		<input type="input" tabindex="-1" ng-model="model.text" class="form-control" readonly="readonly" />', '		<span class="lp-icon lp-icon-pencil pull-right lp-editable-edit" tabindex="0" ', '			ng-click="setEditMode(true)" ng-hide="readonly || loading" style="cursor:pointer;"></span>', "	</div>", '	<div ng-show="editting" ng-switch on="type">', l.fieldFn("text"), l.fieldFn("number"), l.fieldFn("tel"), l.fieldFn("email"), l.fieldFn("url"), '	<div ng-switch-when="textarea">', '		<textarea ng-model="model.value" class="form-control" rows="3" lp-enter-pressed=""></textarea>', l.inputGroupBtnRight, "	</div>", '	<div ng-switch-when="select" class="input-group">', '		<select ng-model="model.value" class="form-control" ng-options="option.value as option.text for option in options"></select>', l.inputGroupBtn, "	</div>", '	<div ng-switch-when="select-multiple" class="input-group">', '		<select ng-model="model.value" multiple="multiple" class="form-control" ng-options="option.value as option.text for option in options"></select>', '		<span type="button" class="input-group-addon" ng-click="save(model.value)"><i class="lp-icon lp-icon-ok-sign"></i></span>', '		<span class="input-group-addon" ng-hide="keepEdittingOpen" ng-click="setEditMode(false)"><span class="lp-icon lp-icon-remove"></span></span>', "	</div>", '	<div ng-switch-when="checkbox">', '		<div class="btn-group pull-right">', '			<button type="button" class="btn btn-default" ng-click="save(model.value)"><i class="lp-icon lp-icon-ok-sign"></i></button>', "		</div>", '		<div class="checkbox" ng-repeat="option in options">', '			<label><input type="checkbox" value="{{option.value}}" ng-checked="isChecked(option.value)" ', '					ng-click="toggleCheck(option.value)"> {{option.text}}</label>', "		</div>", "	</div>", '	<div ng-switch-when="radio">', l.inputGroupBtnRight, '		<div class="radio" ng-repeat="option in options">', '			<label><input type="radio" value="{{option.value}}" ng-model="model.value"> {{option.text}}</label>', "		</div>", "	</div>", "	</div>", "</div>"].join("\n")
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        i = function(e, t, n) {
            "use strict";
            var i = window.jQuery,
                a = 150,
                o = function(e) {
                    return i ? i(e).is(":visible") : e[0] ? null === e[0].offsetParent : void 0
                },
                r = function(e) {
                    return i ? i(e).width() : e[0] ? e[0].offsetWidth : void 0
                },
                l = function(e) {
                    this.element = e, this.checkSizeInterval = a, this.rules = [], this.lastWidth = 0, this.forceCheck = !1
                };
            l.prototype.stop = function() {
                return window.clearTimeout(this.checkSizeTimeout), this
            }, l.prototype.start = function() {
                return this._checkForSizeChange(), this
            }, l.prototype.rule = function(e) {
                return "min-width" in e && (e.minWidth = e["min-width"]), "max-width" in e && (e.maxWidth = e["max-width"]), e.minWidth = parseInt(e.minWidth, 10), e.maxWidth = parseInt(e.maxWidth, 10), ("number" == typeof e.minWidth || "number" == typeof e.maxWidth) && (e.active = !1, this.rules.push(e), this.forceCheck = !0), this._hasSizeChanged(), this
            }, l.prototype.any = function(e) {
                return this.anyFn = e, this
            }, l.prototype.resize = function(e) {
                return this.resize = e, this
            }, l.prototype._checkForSizeChange = function() {
                var e = this;
                return this.checkSizeTimeout = window.setTimeout(function() {
                    e._hasSizeChanged(), e._checkForSizeChange()
                }, this.checkSizeInterval), this
            }, l.prototype._hasSizeChanged = function() {
                var e = this._isWidthChanged();
                return e > 0 && (this._checkRules(e), "function" == typeof this.resize && this.resize.call(this.element, {
                    width: e
                })), this
            }, l.prototype._isWidthChanged = function() {
                var e = r(this.element),
                    t = e !== this.lastWidth && o(this.element);
                return t || this.forceCheck ? (this.lastWidth = e, e) : 0
            }, l.prototype._checkRules = function(e) {
                var t, n, i = this,
                    a = this.rules.length;
                for (t = 0; a > t; t++) {
                    n = this.rules[t];
                    var o = (!n.minWidth || n.minWidth && e >= n.minWidth) && (!n.maxWidth || n.maxWidth && e <= n.maxWidth);
                    if (o && !n.active) {
                        var r = {
                            width: e
                        };
                        "function" == typeof n.then && n.then.call(this.element, r), "function" == typeof i.anyFn && i.anyFn.call(this.element, r)
                    }
                    n.active = o
                }
            }, l.enable = function(e) {
                var t = new l(e);
                return t.start(), t
            }, n.exports = l, window.lp = window.lp || {}, window.lp.responsive = l
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        i = function(e, t, i) {
            "use strict";
            var a = n(2),
                o = a.ng;
            t.FieldController = function(e, t, n, i, a, r) {
                var l, s, c = this;
                e.errors = [];
                var u = o.isDefined(i.errorMessages) ? o.copy(e.$parent.$eval(i.errorMessages)) : {};
                u = o.extend({}, r, u), i.errors && (l = a(i.errors), s = l.assign, e.$parent.$watch(l, function(t) {
                    e.errors = t, e.setErrorMessages()
                }, !0), e.$watch("errors", function(t) {
                    s && s(e.$parent, t)
                })), e.setErrorMessages = function() {
                    var t = [];
                    if (e.errors)
                        for (var n = 0, i = e.errors.length; i > n; n++) {
                            var a = e.errors[n];
                            t.push(c.getErrorMessage(a))
                        }
                    e.errorMessages = t
                }, this.getErrorMessage = function(e) {
                    return u && u[e] ? u[e] : e
                }, this.addError = function(t) {
                    e.errors.push(t)
                }, this.clearErrors = function() {
                    e.errors && (e.errors.length = 0)
                }
            }, t.FieldController.$inject = ["$scope", "$templateCache", "$sce", "$attrs", "$parse", "defaultErrorMessages"]
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                i.name = "ui.responsive";
                var a = n(2),
                    o = n(7),
                    r = n(13);
                i.exports = a.createModule(i.name, [o.name]).constant("lpUIResponsiveConfig", {
                    classPattern: "lp-{{size}}-size",
                    rules: [{
                        max: 200,
                        size: "tile"
                    }, {
                        min: 201,
                        max: 350,
                        size: "small"
                    }, {
                        min: 351,
                        size: "large"
                    }]
                }).controller(n(16)).directive(n(17)).factory("lpUIResponsive", function() {
                    return r
                })
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        i = function(e, t, i) {
            "use strict";
            var a = n(2),
                o = a.utils;
            t.ResponsiveController = function(e, t, n, i, a, r) {
                var l = this,
                    s = o.isUndefined(t.lpSize) ? null : n(t.lpSize).assign,
                    c = o.identity;
                this.init = function(i) {
                    this.element = i, this.responsive = r.enable(i);
                    var l = o.isUndefined(t.sizeRules) ? a.rules : e.$eval(t.sizeRules);
                    this.addRules(l), t.lpOnResize && (c = n(t.lpOnResize), this.setResizeWatcher())
                }, this.addRules = function(e) {
                    o.forEach(e, function(e) {
                        l.addRule(e.min, e.max, e.size)
                    })
                };
                var u;
                t.onSizeChange && (u = n(t.onSizeChange)), this.addRule = function(t, n, a) {
                    var r = {};
                    t && (r["min-width"] = t), n && (r["max-width"] = n), o.extend(r, {
                        then: function() {
                            var t = l.size;
                            i(function() {
                                l.toggleClass(a, t), l.size = a, u && u(e, {
                                    size: a
                                })
                            })
                        }
                    }), this.responsive.rule(r)
                }, this.toggleClass = function(t, n) {
                    l.element.addClass(a.classPattern.replace("{{size}}", t)), n && l.element.removeClass(a.classPattern.replace("{{size}}", n)), s && s(e, t)
                };
                var p = null;
                this.setResizeWatcher = function() {
                    this.responsive.resize = function(t) {
                        t.width !== p && (p = t.width, e.$apply(function() {
                            c(e, {
                                width: p
                            })
                        }))
                    }
                }
            }, t.ResponsiveController.$inject = ["$scope", "$attrs", "$parse", "$timeout", "lpUIResponsiveConfig", "lpUIResponsive"]
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        i = function(e, t, n) {
            "use strict";
            t.lpResponsive = function() {
                return {
                    replace: !1,
                    controller: "ResponsiveController",
                    link: function(e, t, n, i) {
                        i.init(t)
                    }
                }
            }
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                i.name = "ui.wizard";
                var a = n(2),
                    o = n(7);
                i.exports = a.createModule(i.name, [o.name]).directive(n(19)).controller(n(20))
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        i = function(e, t, i) {
            "use strict";
            var a = n(2),
                o = a.utils;
            t.lpWizard = function() {
                return {
                    restrict: "A",
                    transclude: !0,
                    replace: !0,
                    scope: {
                        wizard: "=lpWizard",
                        title: "@title"
                    },
                    controller: "WizardController",
                    link: function(e, t, n) {
                        e.wizard = e.wizard || {}, e.currentStepIndex = 0, e.wizard.nextStep = function() {
                            e.wizardSteps[e.currentStepIndex + 1] && (e.wizardSteps[++e.currentStepIndex].active = !0)
                        }, e.wizard.getActiveStep = function() {
                            return e.currentStepIndex + 1
                        }, e.wizard.previousStep = function() {
                            e.wizardSteps[e.currentStepIndex - 1] && (e.wizardSteps[--e.currentStepIndex].active = !0)
                        }, e.wizard.goToStep = function(t) {
                            --t, e.wizardSteps[t] && (e.currentStepIndex = t, e.wizardSteps[e.currentStepIndex].active = !0)
                        }, e.$parent.$parent[n.nextStep] = e.wizard.nextStep, e.$parent.$parent[n.getActiveStep] = e.wizard.getActiveStep, e.$parent.$parent[n.previousStep] = e.wizard.previousStep, e.$parent.$parent[n.goToStep] = e.wizard.goToStep
                    },
                    template: '<div class="wizard-wrapper">	<div class="panel panel-default wizard-header text-center" tabindex="0" aria-labelledby="{{wizardSteps[currentStepIndex].uniqueId}}">		<div class="panel-heading">			<h3 class="wizard-header-title" ng-show="title">{{title}}</h3>			<div class="clearfix wizard-steps text-center" role="navigation" ng-transclude></div>		</div>	</div>	<div>		<div class="wizard-views">			<div ng-repeat="step in wizardSteps" class="wizard-view" ng-show="step.active" lp-wizard-content-transclude="step"></div>		</div>	</div></div>'
                }
            }, t.lpWizardStep = function(e) {
                return {
                    require: "^lpWizard",
                    restrict: "A",
                    replace: !0,
                    template: '<div class="wizard-step-container">	<i ng-if="stepIndex !== 1" class="glyphicon glyphicon-arrow-right pull-left wizard-step-arrow"></i>	<div class="wizard-step pull-left" ng-class="{\'wizard-active-step\': active}" lp-wizard-heading-transclude="">		<span class="wizard-step-number cursor-pointer" ng-click="goToStep(stepIndex)" ng-class="{\'wizard-step-number-active\': active, \'wizard-step-done\': completed, \'text-muted\': !completed && !active}">{{stepIndex}}</span>		<span id="{{uniqueId}}" class="wizard-step-heading visible-xs-block visible-sm-inline visible-md-inline visible-lg-inline heading-text" ng-class="{\'wizard-active-step\': active, \'hidden-sm hidden-xs\': !active,\'text-muted\': !completed && !active}">{{heading}}</span>	</div></div>',
                    transclude: !0,
                    scope: {
                        active: "=?",
                        heading: "@"
                    },
                    controller: function() {},
                    compile: function(e, t, n) {
                        return function(e, t, i, a) {
                            e.uniqueId = "wizardStep-" + a.instance++ + "-" + Math.floor(1e4 * Math.random()), e.stepIndex = a.instance, e.$watch("active", function(t) {
                                t && a.select(e)
                            }), e.goToStep = a.goToStep, a.addStep(e), e.$transcludeFn = n
                        }
                    }
                }
            }, t.lpWizardStep.$inject = ["$parse"], t.lpWizardHeadingTransclude = function() {
                return {
                    restrict: "A",
                    require: "^lpWizardStep",
                    link: function(e, t, n, i) {
                        e.$watch("headingElement", function(e) {
                            e && (t.html(""), t.append(e))
                        })
                    }
                }
            }, t.lpWizardContentTransclude = function() {
                return {
                    restrict: "A",
                    require: "^lpWizard",
                    link: function(e, t, n) {
                        var i = e.$eval(n.lpWizardContentTransclude);
                        i.$transcludeFn(i.$parent, function(e) {
                            o.forEach(e, function(e) {
                                t.append(e)
                            })
                        })
                    }
                }
            }
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        i = function(e, t, i) {
            "use strict";
            var a = n(2),
                o = a.utils;
            t.WizardController = function(e) {
                var t = this,
                    n = t.wizardSteps = e.wizardSteps = [];
                t.instance = 0, t.select = function(e) {
                    o.forEach(n, function(t) {
                        t.active = !1, e.stepIndex > t.stepIndex ? t.completed = !0 : t.completed = !1
                    }), e.active = !0
                }, t.addStep = function(e) {
                    n.push(e), 1 === n.length ? e.active = !0 : e.active && t.select(e)
                }, t.goToStep = function(i) {
                    i--, i < e.currentStepIndex && (t.select(n[i]), e.currentStepIndex = i)
                }
            }, t.WizardController.$inject = ["$scope"]
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                i.name = "ui.progress-indicator";
                var a = n(2),
                    o = n(7);
                i.exports = a.createModule(i.name, [o.name]).directive(n(22))
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        i = function(e, t, n) {
            "use strict";
            t.progressIndicator = function(e, t) {
                return e.put("$progressIndicator.html", '<div ng-show="showProgress" class="panel panel-default progress-indicator"><div class="panel-body"><p class="panel-message text-center {{customClasses}}"><i class="lp-icon lp-icon-spinner2 lp-spin loading-icon"></i></p></div></div>'), {
                    restrict: "A",
                    scope: {
                        isLoading: "=",
                        progressIndicator: "=",
                        customClasses: "="
                    },
                    link: function(n, i) {
                        ! function(e) {
                            n.showProgress = n[e], n.$watch(e, function() {
                                n.showProgress = n[e]
                            })
                        }("undefined" == typeof n.isLoading ? "progressIndicator" : "isLoading");
                        var a = function() {
                            i.wrap('<div class="progress-indicator-container"></div>');
                            var a = t(e.get("$progressIndicator.html"))(n);
                            i.append(a)
                        };
                        a()
                    }
                }
            }, t.progressIndicator.$inject = ["$templateCache", "$compile"]
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                i.name = "ui.input";
                var a = n(2),
                    o = n(7),
                    r = [o.name];
                return a.createModule(i.name, r).directive(n(24))
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        i = function(e, t, n) {
            "use strict";

            function i(e, t) {
                return function() {
                    function n(t, n, i) {
                        t.placeholder = i.placeholder, t.label = i.label, t.change = function(e) {
                            t.onChange({
                                $event: e
                            })
                        }, "autofocus" in i && n.find("input").attr("autofocus", !0), "text" === e && (n.find("input").attr("autocorrect", "autocorrect" in i ? "on" : "off"), n.find("input").attr("spellcheck", "spellcheck" in i))
                    }
                    var i = '<div class="form-group"><label class="control-label" ng-show="label">{{label | translate}}</label><input type="' + e + '" name="' + t + '" lp-focus-id="{{focusId}}" placeholder="{{placeholder | translate}}" ng-disabled="disabled" ng-model="val" ng-change="change($event)" class="form-control"/></div>';
                    return {
                        scope: {
                            config: "=lpInput",
                            val: "=ngModel",
                            focusId: "@",
                            disabled: "=ngDisabled",
                            onChange: "&"
                        },
                        restrict: "AE",
                        link: n,
                        template: i
                    }
                }
            }
            t.lpTextInput = i("text", "username"), t.lpPasswordInput = i("password", "password")
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                i.name = "ui.checkbox";
                var a = n(2),
                    o = n(7),
                    r = [o.name];
                return a.createModule(i.name, r).directive(n(26))
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        i = function(e, t, n) {
            "use strict";
            t.lpCheckbox = function() {
                function e(e, t, n) {
                    e.label = n.label || ""
                }

                function t() {
                    return e
                }
                var n = ["<label>", '<input type="checkbox" ng-model="checked" ng-disabled="disabled" /> {{label | translate}}', "</label>"].join("");
                return {
                    scope: {
                        config: "=lpCheckbox",
                        checked: "=ngModel",
                        disabled: "=ngDisabled"
                    },
                    restrict: "AE",
                    require: "?^ngModel",
                    compile: t,
                    template: n
                }
            }
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                i.name = "ui.timer";
                var a = n(2);
                return a.createModule(i.name, []).directive(n(28))
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        i = function(e, t, n) {
            "use strict";
            t.lpTimer = function() {
                function e(e, t, n) {
                    function i(e) {
                        return Math.ceil(e / 1e3) + "s"
                    }

                    function a() {
                        o = setTimeout(function() {
                            var t = l - new Date,
                                n = c + u - t,
                                o = u - n;
                            e.onTick({
                                percentage: e.percentage,
                                time: t,
                                startIn: o
                            }), o > 0 ? (e.percentage = 100, e.formattedTime = i(c), a()) : t > 0 ? (p || (p = !0, e.onCountdownstart()), e.percentage = t / c * 100, e.formattedTime = i(t), a()) : (e.percentage = 0, e.formattedTime = "", e.onFinish()), e.$apply()
                        }, s)
                    }
                    var o, r, l, s = 100,
                        c = parseInt(n.millis, 10),
                        u = parseInt(n.delayCountdown, 10) || 0,
                        p = !1;
                    e.run = function() {
                        (100 === e.percentage || "undefined" == typeof e.percentage) && (r = +new Date, l = r + u + c, p = !1, a())
                    }, e.pause = function() {
                        o && clearTimeout(o)
                    }, e.resume = a, e.reset = function() {
                        e.pause(), e.animate = !1, e.percentage = 100, e.formattedTime = i(c), e.animate = !0
                    }, e.reset(), n.autostart && e.run(), e.$on("timer-run", e.run), e.$on("timer-pause", e.pause), e.$on("timer-resume", e.resume), e.$on("timer-reset", e.reset)
                }

                function t() {
                    return e
                }
                var n = ['<div class="lp-timer">', '<progressbar animate="animate" value="percentage" type="success"><b>{{formattedTime}}</b></progressbar>', "</div>"].join("");
                return {
                    scope: {
                        config: "=lpTimer",
                        onTick: "&",
                        onCountdownstart: "&",
                        onFinish: "&"
                    },
                    restrict: "AE",
                    compile: t,
                    template: n
                }
            }
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                i.name = "ui.switcher";
                var a = n(2),
                    o = n(7),
                    r = [o.name];
                return a.createModule(i.name, r).directive(n(30))
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        i = function(e, t, n) {
            "use strict";
            t.lpEnableDisableToggle = function(e, t) {
                return e.put("enable-disable-toggle.html", '<div class="enable-disable-toggle-wrapper"><div class="enable-disable-slider {{ directiveAnimationClasses }}" ng-class="{\'is-disabled\': !active}"><div class="enable-disable-enabled"><div class="note note-text note-text-wide">{{ enabledTextLong | limitTo : 8 }}</div><div class="note note-text note-text-short">{{ enabledTextShort | limitTo : 3 }}</div></div><i class="zipper">&nbsp;</i><i class="zipper">&nbsp;</i><div class="enable-disable-disabled"><div class="note note-text note-text-wide">{{ disabledTextLong | limitTo : 8 }}</div><div class="note note-text note-text-short">{{ disabledTextShort | limitTo : 3 }}</div></div></div></div>'), {
                    scope: {
                        active: "=lpEnableDisableToggle"
                    },
                    restrict: "A",
                    template: e.get("enable-disable-toggle.html"),
                    link: function(e, n, i) {
                        e.enabledTextLong = i.enabledTextLong || "Enabled", e.disabledTextLong = i.disabledTextLong || "Disabled", e.enabledTextShort = i.enabledTextShort || "On", e.disabledTextShort = i.disabledTextShort || "Off", e.$watch("active", function(n, i) {
                            n !== i ? e.directiveAnimationClasses = e.active ? "animated slideInLeft" : "animated slideInRight" : e.directiveAnimationClasses = "", t(function() {
                                e.directiveAnimationClasses = ""
                            }, 3500)
                        })
                    }
                }
            }, t.lpEnableDisableToggle.$inject = ["$templateCache", "$timeout"]
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                i.name = "ui.card";
                var a = n(2),
                    o = n(7),
                    r = [o.name];
                i.exports = a.createModule(i.name, r).directive(n(32))
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        i = function(e, t) {
            "use strict";
            t.lpCard = function() {
                function e() {
                    return ["<div>", '<div class="panel panel-default">', '<div class="panel-heading clearfix">', '<h5 class="pull-left">{{title}}</h5>', '<div class="buttons pull-right"><button ng-repeat="button in buttons" class="btn btn-default {{button.className}}" role="button"         ng-click="button.onclick(data)"         lp-i18n="{{button.label}}"></button>', "</div>", "</div>", '<div class="panel-body" ng-transclude></div>', "</div>"].join("")
                }
                return {
                    restrict: "AE",
                    transclude: !0,
                    scope: {
                        data: "=",
                        title: "@",
                        buttons: "="
                    },
                    template: e
                }
            }
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                var a = n(2);
                i.name = "ui.focus", i.exports = a.createModule(i.name, []).directive(n(34)).factory(n(35))
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        i = function(e, t) {
            "use strict";

            function n(e) {
                setTimeout(function() {
                    e.focus(), "INPUT" === e.tagName && e.select()
                }, 50)
            }
            t.lpFocusOn = function(e) {
                return {
                    link: function(t, i, a) {
                        var o = e(a.lpFocusOn)(t);
                        t.$on(o, function() {
                            n(i[0])
                        })
                    }
                }
            }, t.lpFocusOn.$inject = ["$interpolate"], t.lpFocusId = function() {
                return {
                    link: function(e, t, i) {
                        e.$on("lpFocusId", function(e, a) {
                            a === i.lpFocusId && n(t[0])
                        })
                    }
                }
            }, "autofocus" in document.createElement("input") || (t.autofocus = function() {
                return {
                    link: function(e, t) {
                        setTimeout(function() {
                            t[0].focus()
                        }, 100)
                    }
                }
            })
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        i = function(e, t) {
            "use strict";
            t.lpFocus = function(e, t) {
                return function(n) {
                    t(function() {
                        e.$broadcast("lpFocusId", n)
                    }, 100)
                }
            }, t.lpFocus.$inject = ["$rootScope", "$timeout"]
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                var a = n(2);
                i.name = "ui.nav-icon", i.exports = a.createModule(i.name, []).directive(n(37))
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        i = function(e, t) {
            "use strict";
            t.navIcon = function() {
                var e = {
                    "arrow-left": "chevron-left"
                };
                return {
                    scope: !0,
                    replace: !0,
                    template: '<span class="glyphicon glyphicon-{{icon}}"></span>',
                    link: function(t, n, i) {
                        i.icon ? t.icon = t.$eval(i.icon) : "nav-icon" !== i.navIcon && (t.icon = t.$eval(i.navIcon)), t.icon in e && (t.icon = e[t.icon])
                    }
                }
            }
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                var a = n(2);
                i.name = "ui.aria", i.exports = a.createModule(i.name, []).directive(n(39)).filter(n(40))
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        i = function(e, t) {
            "use strict";
            t.lpAriaNumber = function(e) {
                function t(t) {
                    t.$watch("lpAriaNumber", function(n) {
                        t.srNumber = e("lpAriaNumber")(n)
                    })
                }
                return {
                    restrict: "A",
                    link: t,
                    scope: {
                        lpAriaNumber: "="
                    },
                    template: '<span aria-hidden="true">{{lpAriaNumber}}</span><span class="sr-only">{{srNumber}}</span>'
                }
            }, t.lpAriaNumber.$inject = ["$filter"]
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        i = function(e, t) {
            "use strict";
            t.lpAriaNumber = function() {
                return function(e) {
                    return e ? String(e).split("").join(" ") : ""
                }
            }
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                var a = n(2);
                i.name = "ui.scrolling-hook", i.exports = a.createModule(i.name, []).directive(n(42))
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        i = function(e, t) {
            "use strict";
            var i = n(2),
                a = i.ng,
                o = i.utils;
            t.scrollingHook = function(e) {
                function t() {
                    return Math.max(document.documentElement.scrollTop, document.body.scrollTop)
                }
                return {
                    scope: {
                        className: "=scrollClass",
                        distance: "=scrollDistance",
                        hookCallback: "="
                    },
                    link: function(n, i, r) {
                        var l = t(),
                            s = n.className,
                            c = function() {
                                var e = t();
                                e >= n.distance ? l - e >= 5 || 0 >= l ? i.hasClass(s) && i.removeClass(s) : e > l && (i.hasClass(s) || i.addClass(s)) : i.hasClass(s) && i.removeClass(s), l = e, n.hookCallback && n.hookCallback(i)
                            };
                        a.element(e).on("scroll", o.debounce(c, 10))
                    }
                }
            }, t.scrollingHook.$inject = ["$window"]
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                var a = n(2);
                i.name = "ui.number-input", i.exports = a.createModule(i.name, []).directive(n(44))
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        i = function(e, t) {
            "use strict";
            t.lpNumberInput = function() {
                return {
                    scope: {
                        lpMaxLength: "="
                    },
                    link: function(e, t, n) {
                        var i = n.max || Number.MAX_VALUE,
                            a = n.min || -Number.MAX_VALUE,
                            o = "number" === t[0].getAttribute("type") && "number" === t[0].type,
                            r = function(e) {
                                e && (i = Math.pow(10, e) - 1, t.attr("max", i))
                            },
                            l = function(e) {
                                e && t.attr("maxlength", e)
                            };
                        e.lpMaxLength && (o ? (r(e.lpMaxLength), e.$watch("lpMaxLength", function(e) {
                            r(e)
                        })) : (l(e.lpMaxLength), e.$watch("lpMaxLength", function(e) {
                            l(e)
                        }))), t.bind("keypress", function(e) {
                            var n, o = new RegExp("(4[8-9]|5[0-7])"),
                                r = 45 === e.which,
                                l = null,
                                s = t[0];
                            if (!(e.ctrlKey || e.metaKey || /^(8|9|13|189|190|45)$/.test(e.keyCode) || o.test(e.which) || r)) return !1;
                            if (a >= 0 && r) return !1;
                            if (o.test(e.which) || r) {
                                l = String.fromCharCode(e.which);
                                var c = s.valueAsNumber;
                                if (isNaN(c) && !this.value && (r || (c = "")), n = c || this.value, r && (n || String(c || this.value).match(/-/g).length)) return !1;
                                if (c = parseInt(n + l, 10), a > c || c > i) return !1
                            }
                        })
                    }
                }
            }
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                i.name = "ui.modal-dialog";
                var a = n(2);
                i.exports = a.createModule(i.name, []).directive(n(46))
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        i = function(e, t) {
            "use strict";
            var n = window.jQuery,
                i = window.be,
                a = window.bd,
                o = function(e) {
                    var t = function(e) {
                        if (i && i.ice && i.ice.controller) {
                            e.iceConfig = i.ice.config;
                            var t = String(e.getPreference("templateUrl"));
                            return t.match(/\/image\.html$/) && (t = t.replace(/\/image\.html$/, "/image-editorial.html")), i.ice.controller.edit(e, t).then(function(e) {
                                return e
                            })
                        }
                    };
                    return a && "true" === a.designMode ? t(e) : void 0
                };
            t.modalDialog = function(e, t) {
                return t.put("$modalDialog.html", '<div class="lp-modal modal" ng-show="show">    <div class="ng-modal-overlay" ng-click="hideModal()"></div>    <div class="modal-dialog" ng-style="dialogStyle" tabindex="-1">        <div class="modal-content" ng-transclude=""></div>    </div></div>'), {
                    restrict: "AE",
                    scope: {
                        show: "="
                    },
                    replace: !0,
                    transclude: !0,
                    template: t.get("$modalDialog.html"),
                    link: function(t, i, a) {
                        t.closable = a.closable ? t.$parent.$eval(a.closable) : !0, t.dialogStyle = {}, a.width && (t.dialogStyle.width = a.width), a.height && (t.dialogStyle.height = a.height);
                        var r = function() {
                            n(i).find(".modal-close-button").on("click", function() {
                                t.hideModal(), t.$apply()
                            })
                        };
                        if (a.isice && e.getPreference("templateUrl")) {
                            var l = o(e);
                            l ? l.then(function(e) {
                                n(i).find(".bp-g-include").html(e), n(i).find("[contenteditable]").on("keypress keydown", function(e) {
                                    e.stopPropagation()
                                }), r()
                            }) : r()
                        }
                        t.hideModal = function() {
                            t.show = !1
                        }, t.focusModal = function() {
                            i.find(".modal-dialog").focus()
                        };
                        var s = function(e) {
                            27 === e.keyCode && (e.stopPropagation(), e.preventDefault(), t.hideModal(), t.$apply())
                        };
                        t.$watch("show", function(e) {
                            e ? (i.bind("keydown.modalDialog", s), t.focusModal()) : i.unbind("keydown.modalDialog", s)
                        })
                    }
                }
            }, t.modalDialog.$inject = ["widget", "$templateCache"]
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                i.name = "ui.smartsuggest";
                var a = n(2),
                    o = n(7);
                n(48);
                var r = n(50),
                    l = n(56);
                i.exports = a.createModule(i.name, [o.name, r.name, l.name])
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i, a, o;
        ! function(r) {
            "use strict";
            a = [n(49)], i = r, o = "function" == typeof i ? i.apply(t, a) : i, !(void 0 !== o && (e.exports = o))
        }(function(e) {
            "use strict";

            function t(n, i) {
                var a = function() {},
                    o = this,
                    r = {
                        autoSelectFirst: !1,
                        circularSelect: !0,
                        appendTo: "body",
                        serviceUrl: null,
                        lookup: null,
                        onSelect: null,
                        width: "auto",
                        minChars: 1,
                        maxHeight: 300,
                        deferRequestBy: 0,
                        params: {},
                        formatResult: t.formatResult,
                        delimiter: null,
                        zIndex: 9999,
                        type: "GET",
                        noCache: !1,
                        onSearchStart: a,
                        onSearchComplete: a,
                        onClear: a,
                        onChangeModel: a,
                        containerClass: "lp-autosuggest-suggestions",
                        tabDisabled: !0,
                        dataType: "text",
                        currentRequest: null,
                        paramName: "query",
                        transformResult: function(t) {
                            return "string" == typeof t ? e.parseJSON(t) : t
                        }
                    };
                o.element = n, o.el = e(n), o.suggestions = [], o.badQueries = [], o.selectedIndex = -1, o.currentValue = o.element.value, o.intervalId = 0, o.cachedResponse = [], o.onChangeInterval = null, o.onChange = null, o.isLocal = !1, o.suggestionsContainer = null, o.options = e.extend({}, r, i), o.classes = {
                    selected: "lp-autosuggest-selected",
                    suggestion: "lp-autosuggest-suggestion"
                }, o.hint = null, o.hintValue = "", o.selection = null, o.initialize(), o.setOptions(i)
            }
            var n = function() {
                    return {
                        escapeRegExChars: function(e) {
                            return e.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
                        },
                        createNode: function(e) {
                            var t = document.createElement("div");
                            return t.innerHTML = e, t.firstChild
                        }
                    }
                }(),
                i = {
                    ESC: 27,
                    TAB: 9,
                    RETURN: 13,
                    LEFT: 37,
                    UP: 38,
                    RIGHT: 39,
                    DOWN: 40
                };
            t.utils = n, e.Autocomplete = t, t.formatResult = function(e, t) {
                var i = "(" + n.escapeRegExChars(t) + ")";
                return e.value.replace(new RegExp(i, "gi"), "<strong>$1</strong>")
            }, t.prototype = {
                killerFn: null,
                initialize: function() {
                    var n, i = this,
                        a = "." + i.classes.suggestion,
                        o = i.classes.selected,
                        r = i.options;
                    i.element.setAttribute("autosuggest", "off"), i.element.setAttribute("aria-autocomplete", "list"), i.killerFn = function(t) {
                        0 !== e(t.target).closest("." + i.options.containerClass).length || i.el.is(":focus") || (i.killSuggestions(), i.disableKillerFn())
                    }, i.suggestionsContainer = t.utils.createNode('<div class="' + r.containerClass + '" style="position: absolute; display: none;"></div>'), n = e(i.suggestionsContainer), n.appendTo(r.appendTo), "auto" !== r.width && n.width(r.width), n.on("mouseover.autosuggest", a, function() {
                        i.activate(e(this).data("index"))
                    }), n.on("mouseout.autosuggest", function() {
                        i.selectedIndex = -1, n.children("." + o).removeClass(o)
                    }), n.on("mousedown.autosuggest touchstart.autosuggest", a, function() {
                        i.select(e(this).data("index")), i.el.trigger("blur")
                    }), i.fixPosition(), i.fixPositionCapture = function() {
                        i.visible && i.fixPosition()
                    }, e(window).on("resize", i.fixPositionCapture), i.el.on("keydown.autosuggest", function(e) {
                        i.onKeyPress(e)
                    }), i.el.on("keyup.autosuggest", function(e) {
                        i.onKeyUp(e)
                    }), i.el.on("blur.autosuggest", function(e) {
                        var t;
                        e.isTrigger ? (clearTimeout(t), i.killerFn(e)) : t = setTimeout(function() {
                            i.killerFn(e)
                        }, 100)
                    }), i.el.on("focus.autosuggest", function() {
                        i.onFocus()
                    }), i.el.on("change.autosuggest", function(e) {
                        i.onKeyUp(e)
                    }), i.el.on("toggle.autosuggest", function(e) {
                        i.onToggle(e)
                    })
                },
                onToggle: function() {
                    this.visible ? this.el.blur() : this.el.focus()
                },
                onBlur: function() {
                    this.enableKillerFn()
                },
                setOptions: function(t) {
                    var n = this,
                        i = n.options;
                    e.extend(i, t), n.isLocal = e.isArray(i.lookup), n.isLocal && (i.lookup = n.verifySuggestionsFormat(i.lookup)), e(n.suggestionsContainer).css({
                        "max-height": i.maxHeight + "px",
                        width: i.width + "px",
                        "z-index": i.zIndex
                    })
                },
                clearCache: function() {
                    this.cachedResponse = [], this.badQueries = []
                },
                clear: function() {
                    this.clearCache(), this.currentValue = "", this.suggestions = []
                },
                disable: function() {
                    this.disabled = !0
                },
                enable: function() {
                    this.disabled = !1
                },
                changeModel: function() {
                    var e = this;
                    e.options.onChangeModel.call(e.element)
                },
                fixPosition: function() {
                    var t, n = this;
                    "body" === n.options.appendTo && (t = n.el.offset(), e(n.suggestionsContainer).css({
                        top: t.top + n.el.outerHeight() + "px",
                        left: t.left + "px"
                    }))
                },
                enableKillerFn: function() {
                    var t = this;
                    e(document).on("click.autosuggest", t.killerFn)
                },
                disableKillerFn: function() {
                    var t = this;
                    e(document).off("click.autosuggest", t.killerFn)
                },
                killSuggestions: function() {
                    var e = this;
                    e.stopKillSuggestions(), e.intervalId = window.setInterval(function() {
                        e.hide(), e.stopKillSuggestions()
                    }, 100)
                },
                stopKillSuggestions: function() {
                    window.clearInterval(this.intervalId)
                },
                isCursorAtEnd: function() {
                    var e, t = this,
                        n = t.el.val().length,
                        i = t.element.selectionStart;
                    return "number" == typeof i ? i === n : document.selection ? (e = document.selection.createRange(), e.moveStart("character", -n), n === e.text.length) : !0
                },
                onKeyPress: function(e) {
                    var t = this;
                    if (!t.disabled && !t.visible && e.which === i.DOWN && t.currentValue) return void t.suggest();
                    if (!t.disabled && t.visible) {
                        switch (e.which) {
                            case i.ESC:
                                t.el.val(""), t.hide(), t.options.onClear.call(t.element);
                                break;
                            case i.RIGHT:
                                if (t.hint && t.options.onHint && t.isCursorAtEnd()) {
                                    t.selectHint();
                                    break
                                }
                                return;
                            case i.TAB:
                                if (t.hint && t.options.onHint) return void t.selectHint();
                            case i.RETURN:
                                if (-1 === t.selectedIndex) return void t.hide();
                                if (t.select(t.selectedIndex), e.which === i.TAB && t.options.tabDisabled === !1) return;
                                break;
                            case i.UP:
                                t.moveUp();
                                break;
                            case i.DOWN:
                                t.moveDown();
                                break;
                            default:
                                return
                        }
                        e.stopImmediatePropagation(), e.preventDefault()
                    }
                },
                onKeyUp: function(e) {
                    var t = this;
                    t.disabled || e.which === i.UP || e.which === i.DOWN || (clearInterval(t.onChangeInterval), t.currentValue !== t.el.val() && (t.findBestHint(), t.options.deferRequestBy > 0 ? t.onChangeInterval = setInterval(function() {
                        t.onValueChange()
                    }, t.options.deferRequestBy) : t.onValueChange()))
                },
                onFocus: function() {
                    this.currentValue = this.el.val(), this.fixPosition(), this.getSuggestions("", "focus")
                },
                onValueChange: function() {
                    var t, n = this;
                    n.selection && (n.selection = null, (n.options.onInvalidateSelection || e.noop)()), clearInterval(n.onChangeInterval), n.currentValue = n.el.val(), n.currentValue || n.options.onClear.call(n.element), t = n.getQuery(n.currentValue), n.selectedIndex = -1, t.length < n.options.minChars ? n.hide() : n.getSuggestions(t, "change")
                },
                getQuery: function(t) {
                    var n, i = this.options.delimiter;
                    return i ? (n = t.split(i), e.trim(n[n.length - 1])) : e.trim(t)
                },
                getSuggestionsLocal: function(e) {
                    var t = this,
                        n = t.options.lookup.call(this.element, e);
                    return {
                        suggestions: n
                    }
                },
                getSuggestions: function(e, t) {
                    var n = this,
                        i = n.options;
                    if (n.cachedResponse[e]) n.suggestions = n.cachedResponse[e], n.suggest();
                    else if (!n.isBadQuery(e)) {
                        if (i.params[i.paramName] = e, i.onSearchStart.call(n.element, i.params) === !1) return;
                        var a = n.getSuggestionsLocal(e);
                        n.processResponse(a, e, t), i.onSearchComplete.call(n.element, e)
                    }
                },
                isBadQuery: function(e) {
                    for (var t = this.badQueries, n = t.length; n--;)
                        if (0 === e.indexOf(t[n])) return !0;
                    return !1
                },
                hide: function() {
                    var t = this;
                    t.visible = !1, t.selectedIndex = -1, e(t.suggestionsContainer).hide(), t.signalHint(null)
                },
                suggest: function() {
                    if (0 === this.suggestions.length) return void this.hide();
                    var t, n = this,
                        i = n.options.formatResult,
                        a = n.getQuery(n.currentValue),
                        o = n.classes.suggestion,
                        r = n.classes.selected,
                        l = e(n.suggestionsContainer),
                        s = "";
                    e.each(n.suggestions, function(e, t) {
                        s += '<div class="' + o + '" data-index="' + e + '" role="option">' + i(t, a) + "</div>"
                    }), "auto" === n.options.width && (t = n.el.outerWidth() - 2, l.width(t > 0 ? t : 300)), l.html(s).show(), n.visible = !0, n.options.autoSelectFirst && (n.selectedIndex = 0, l.children().first().addClass(r)), n.findBestHint()
                },
                findBestHint: function() {
                    var t = this,
                        n = t.el.val().toLowerCase(),
                        i = null;
                    n && (e.each(t.suggestions, function(e, t) {
                        var a = t.value.toLowerCase && 0 === t.value.toLowerCase().indexOf(n);
                        return a && (i = t), !a
                    }), t.signalHint(i))
                },
                signalHint: function(t) {
                    var n = "",
                        i = this;
                    t && (n = i.currentValue + t.value.substr(i.currentValue.length)), i.hintValue !== n && (i.hintValue = n, i.hint = t, (this.options.onHint || e.noop)(n))
                },
                verifySuggestionsFormat: function(t) {
                    return t.length && "string" == typeof t[0] ? e.map(t, function(e) {
                        return {
                            value: e,
                            data: null
                        }
                    }) : t
                },
                processResponse: function(e, t, n) {
                    var i = this,
                        a = i.options,
                        o = a.transformResult(e, t);
                    o.suggestions = i.verifySuggestionsFormat(o.suggestions), a.noCache || (i.cachedResponse[o[a.paramName]] = o, 0 === o.suggestions.length && i.badQueries.push(o[a.paramName])), (t === i.getQuery(i.currentValue) || "focus" === n) && (i.suggestions = o.suggestions, i.suggest())
                },
                activate: function(t) {
                    var n, i = this,
                        a = i.classes.selected,
                        o = e(i.suggestionsContainer),
                        r = o.children();
                    return o.children("." + a).removeClass(a), i.selectedIndex = t, -1 !== i.selectedIndex && r.length > i.selectedIndex ? (n = r.get(i.selectedIndex), e(n).addClass(a), n) : null
                },
                selectHint: function() {
                    var t = this,
                        n = e.inArray(t.hint, t.suggestions);
                    t.select(n)
                },
                select: function(e) {
                    var t = this;
                    t.hide(), t.onSelect(e)
                },
                moveUp: function() {
                    var t = this;
                    if (-1 !== t.selectedIndex) {
                        var n;
                        if (0 === t.selectedIndex) {
                            if (!t.options.circularSelect) return e(t.suggestionsContainer).children().first().removeClass(t.classes.selected), t.selectedIndex = -1, t.el.val(t.currentValue), t.el.trigger("input"), void t.findBestHint();
                            n = t.suggestions.length - 1
                        } else n = -1;
                        t.adjustScroll(t.selectedIndex + n)
                    }
                },
                moveDown: function() {
                    var e, t = this;
                    if (t.selectedIndex === t.suggestions.length - 1) {
                        if (!t.options.circularSelect) return;
                        e = -1 * (t.suggestions.length - 1)
                    } else e = 1;
                    t.adjustScroll(t.selectedIndex + e)
                },
                adjustScroll: function(t) {
                    var n, i, a, o = this,
                        r = o.activate(t),
                        l = 75;
                    r && (n = r.offsetTop, i = e(o.suggestionsContainer).scrollTop(), a = i + o.options.maxHeight - l, i > n ? e(o.suggestionsContainer).scrollTop(n) : n > a && e(o.suggestionsContainer).scrollTop(n - o.options.maxHeight + l), o.el.val(o.getValue(o.suggestions[t].value)), o.el.trigger("input"), o.signalHint(null))
                },
                onSelect: function(t) {
                    var n = this,
                        i = n.options.onSelect,
                        a = n.suggestions[t],
                        o = !0;
                    n.currentValue = n.getValue(a.value), n.signalHint(null), n.suggestions = [], n.selection = a, e.isFunction(i) && i.call(n.element, a) === !1 && (o = !1), o && (n.el.val(n.currentValue), n.el.trigger("input"))
                },
                getValue: function(e) {
                    var t, n, i = this,
                        a = i.options.delimiter;
                    return a ? (t = i.currentValue, n = t.split(a), 1 === n.length ? e : t.substr(0, t.length - n[n.length - 1].length) + e) : e
                },
                dispose: function() {
                    var t = this;
                    t.el.off(".autosuggest").removeData("autosuggest"), t.disableKillerFn(), e(window).off("resize", t.fixPositionCapture), e(t.suggestionsContainer).remove()
                }
            }, e.fn.autosuggest = function(n, i) {
                var a = "autosuggest";
                return 0 === arguments.length ? this.first().data(a) : this.each(function() {
                    var o = e(this),
                        r = o.data(a);
                    "string" == typeof n ? r && "function" == typeof r[n] && r[n](i) : (r && r.dispose && r.dispose(), r = new t(this, n), o.data(a, r))
                })
            }
        })
    }, function(e, t) {
        e.exports = n
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                var a = n(2),
                    o = n(7),
                    r = n(51),
                    l = n(54),
                    s = n(55),
                    c = n(53);
                i.name = "ui.smartsuggest-engine", i.exports = a.createModule(i.name, [o.name, r.name, s.name, l.name]);
                var u = c.RANGE_REGEX,
                    p = function(e, t, n, i) {
                        var a = function(e) {
                            this.options = e || {}, this.suggesters = []
                        };
                        return e.mixin(a, t), a.types = t.TYPES, a.labels = t.LABELS, a.icons = t.ICONS, a.util = n, a.builtIn = i, a.prototype.getSuggestions = function(t) {
                            var n = this;
                            t = e.stripHtml(t);
                            var i = [];
                            a.util.isRange(t) ? i = t.match(u) : i[1] = t;
                            var o = [];
                            return this.suggesters.forEach(function(e) {
                                var t = e.suggest.call({
                                    data: e.data || null,
                                    type: e.type,
                                    options: e.options || {}
                                }, i[1], i[2]);
                                n.options.showTitles && t.length > 0 && (o = o.concat({
                                    type: a.types.TITLE,
                                    title: e.type
                                })), o = o.concat(t)
                            }), o
                        }, a.prototype.addSuggester = function(e) {
                            e = a.builtIn.addSuggestFunction(e);
                            for (var t = !1, n = 0; n < this.suggesters.length && !t; n++) this.suggesters[n].type === e.type && (this.suggesters[n] = e, t = !0);
                            return t || this.suggesters.push(e), this
                        }, a.prototype.clearSuggesters = function() {
                            this.suggesters = []
                        }, a
                    };
                p.$inject = ["lpCoreUtils", "SmartSuggestConfig", "SmartSuggestEngineUtil", "SmartSuggestEngineBuiltInSuggesters"], i.exports.factory("SmartSuggestEngine", p)
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                var a = n(2),
                    o = n(7),
                    r = n(52),
                    l = n(53);
                i.name = "ui.smartsuggest-engine-util", i.exports = a.createModule(i.name, [o.name, r.name]);
                var s = function(e, t) {
                    var n = {},
                        i = l.RANGE_REGEX,
                        a = l.NUMBER_REGEX;
                    return n.isRange = function(e) {
                        return i.test(e)
                    }, n.parseAmount = function(e) {
                        var t = null;
                        if (e) {
                            var n = e.match(a);
                            n && n.length && (t = parseFloat(n[0]))
                        }
                        return isNaN(t) ? null : Math.abs(t)
                    }, n.isYearDate = function(e) {
                        var t = n.parseAmount(e);
                        return !isNaN(t) && t > 1900 && 2100 > t ? t : !1
                    }, n.parseDate = function(e) {
                        var t, i = n.isYearDate(e),
                            a = parseFloat(e);
                        return t = i ? new Date(i, 0, 1) : 31 >= a ? new Date((new Date).setDate(a)) : null
                    }, n.getAdvancedDatesArray = function(e, n) {
                        return t.getDatesArray(e, n)
                    }, n.getDateTermSpecificity = function(e) {
                        var t, i = l.dateRegex,
                            a = n.isYearDate(e),
                            o = !a && (e.match(i.jan) || e.match(i.feb) || e.match(i.mar) || e.match(i.apr) || e.match(i.may) || e.match(i.jun) || e.match(i.jul) || e.match(i.aug) || e.match(i.sep) || e.match(i.oct) || e.match(i.nov) || null !== e.match(i.dec));
                        return t = a ? "year" : o ? "month" : "day"
                    }, n.makeToDateInclusive = function(t, i) {
                        var a, o = n.getDateTermSpecificity(t);
                        a = "year" === o ? {
                            years: 1
                        } : "month" === o ? {
                            months: 1
                        } : {
                            days: 1
                        };
                        var r = e.date(i).clone().add(a).subtract(1, "ms");
                        return r.toDate()
                    }, n.predictToDate = function(t, i) {
                        var a, o = n.getDateTermSpecificity(t);
                        a = "year" === o ? {
                            years: 1
                        } : "month" === o ? {
                            months: 1
                        } : {
                            weeks: 1
                        };
                        var r = e.date(i).clone().add(a).subtract(1, "ms");
                        return r.toDate()
                    }, n.makeNumberFuzzy = function(e) {
                        var t = e / 10 / 2,
                            n = {
                                from: Math.floor(e - t),
                                to: Math.ceil(e + t)
                            };
                        return n
                    }, n.predictToAmount = function(e) {
                        var t = Math.ceil(e + e / 2);
                        return t
                    }, n.getFormatterFnName = function(t) {
                        return e.camelCase("--format-" + (t || "general"))
                    }, n
                };
                s.$inject = ["lpCoreUtils", "SmartSuggestEngineUtilDatesAdvanced"], i.exports.factory("SmartSuggestEngineUtil", s)
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                var a = n(2),
                    o = n(7),
                    r = n(53);
                i.name = "ui.smartsuggest-engine-util-dates-advanced", i.exports = a.createModule(i.name, [o.name]);
                var l = function() {
                    var e = {},
                        t = "-",
                        n = (new Date).getFullYear(),
                        i = r.dateRegex;
                    return e.getDatesArray = function(t, n) {
                        return t && !n ? e.getDatesSingleTerm(t) : []
                    }, e.getDatesSingleTerm = function(t) {
                        var i, a = [];
                        return e.isDatePattern(t) || (i = e.getMonthNumber(t), i && (i -= 1, i <= (new Date).getMonth() && a.push({
                            from: new Date(n, i, 1),
                            to: new Date(n, i, e.daysInMonth(i, n), 23, 59)
                        }), a.push({
                            from: new Date(n - 1, i, 1),
                            to: new Date(n - 1, i, e.daysInMonth(i, n - 1), 23, 59)
                        }))), a
                    }, e.isDatePattern = function(e) {
                        var n = e.split(t);
                        return n.length < 2 ? !1 : n
                    }, e.getMonthNumber = function(e) {
                        var t = e.match(i.jan) ? 1 : e.match(i.feb) ? 2 : e.match(i.mar) ? 3 : e.match(i.apr) ? 4 : e.match(i.may) ? 5 : e.match(i.jun) ? 6 : e.match(i.jul) ? 7 : e.match(i.aug) ? 8 : e.match(i.sep) ? 9 : e.match(i.oct) ? 10 : e.match(i.nov) ? 11 : e.match(i.dec) ? 12 : !1;
                        return t
                    }, e.daysInMonth = function(e, t) {
                        return 32 - new Date(t, e, 32).getDate()
                    }, e
                };
                i.exports.factory("SmartSuggestEngineUtilDatesAdvanced", l)
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        i = function(e) {
            "use strict";
            var t = /^(.+)\sto\s?(.*)$/i,
                n = /[\-+]?([0-9]*\.)?[0-9]+/,
                i = /[\.+\s+\-]/g,
                a = {
                    jan: /^jan(uary)?/i,
                    feb: /^feb(ruary)?/i,
                    mar: /^mar(ch)?/i,
                    apr: /^apr(il)?/i,
                    may: /^may/i,
                    jun: /^jun(e)?/i,
                    jul: /^jul(y)?/i,
                    aug: /^aug(ust)?/i,
                    sep: /^sep(t(ember)?)?/i,
                    oct: /^oct(ober)?/i,
                    nov: /^nov(ember)?/i,
                    dec: /^dec(ember)?/i,
                    sun: /^su(n(day)?)?/i,
                    mon: /^mo(n(day)?)?/i,
                    tue: /^tu(e(s(day)?)?)?/i,
                    wed: /^we(d(nesday)?)?/i,
                    thu: /^th(u(r(s(day)?)?)?)?/i,
                    fri: /^fr(i(day)?)?/i,
                    sat: /^sa(t(urday)?)?/i,
                    future: /^next/i,
                    past: /^last|past|prev(ious)?/i,
                    add: /^(\+|aft(er)?|from|hence)/i,
                    subtract: /^(\-|bef(ore)?|ago)/i,
                    yesterday: /^yes(terday)?/i,
                    today: /^t(od(ay)?)?/i,
                    tomorrow: /^tom(orrow)?/i,
                    now: /^n(ow)?/i,
                    millisecond: /^ms|milli(second)?s?/i,
                    second: /^sec(ond)?s?/i,
                    minute: /^mn|min(ute)?s?/i,
                    hour: /^h(our)?s?/i,
                    week: /^w(eek)?s?/i,
                    month: /^m(onth)?s?/i,
                    day: /^d(ay)?s?/i,
                    year: /^y(ear)?s?/i,
                    shortMeridian: /^(a|p)/i,
                    longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
                    timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt|utc)/i,
                    ordinalSuffix: /^\s*(st|nd|rd|th)/i,
                    timeContext: /^\s*(\:|a(?!u|p)|p)/i
                };
            return {
                RANGE_REGEX: t,
                NUMBER_REGEX: n,
                STRIP_ACC_FORMATTING_REGEX: i,
                dateRegex: a
            }
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                var a = n(2),
                    o = n(7),
                    r = n(55),
                    l = n(51),
                    s = n(53);
                i.name = "ui.smartsuggest-engine-built-in-suggesters", i.exports = a.createModule(i.name, [o.name, l.name, r.name]);
                var c = s.STRIP_ACC_FORMATTING_REGEX,
                    u = function(e, t, n) {
                        var i = {},
                            a = t.TYPES,
                            o = function(t) {
                                return e.camelCase("--get-" + (t || "general") + "-suggestions")
                            };
                        return i.addSuggestFunction = function(e) {
                            return "function" != typeof e.suggest && (e.suggest = i[o(e.type)]), e
                        }, i.getDateSuggestions = function(t, i) {
                            var o = this,
                                r = [],
                                l = n.parseDate(t),
                                s = n.parseDate(i);
                            l && !s && (s = n.makeToDateInclusive(t, l), r.push({
                                terms: [t, i],
                                type: this.type || a.DATE,
                                displayAsRange: !1,
                                search: {
                                    from: l,
                                    to: s
                                }
                            }));
                            var c = !1;
                            l && (!i || s && l.getTime() > s.getTime() ? (s = n.predictToDate(t, l), c = !0) : s = n.makeToDateInclusive(i, s), l.getTime() < s.getTime() && r.push({
                                terms: [t, i],
                                type: this.type,
                                displayAsRange: !0,
                                predicted: c,
                                search: {
                                    from: l,
                                    to: s
                                }
                            }));
                            var u = n.getAdvancedDatesArray(t, i) || [];
                            return u.forEach(function(n) {
                                e.isDate(n.from) && r.push({
                                    terms: [t, i],
                                    type: o.type,
                                    displayAsRange: e.isDate(n.to) ? !0 : !1,
                                    search: {
                                        from: n.from,
                                        to: n.to
                                    }
                                })
                            }), r
                        }, i.getAmountSuggestions = function(e, t) {
                            var i = [],
                                o = n.parseAmount(e),
                                r = n.parseAmount(t);
                            if (o && !r) {
                                var l = n.makeNumberFuzzy(o);
                                i.push({
                                    terms: [e, t],
                                    type: this.type || a.AMOUNT,
                                    displayAsRange: !1,
                                    search: {
                                        original: o,
                                        from: l.from,
                                        to: l.to
                                    }
                                })
                            }
                            var s = !1;
                            return o && ((!t || r && o > r) && (r = n.predictToAmount(o), s = !0), r > o && i.push({
                                terms: [e, t],
                                type: this.type,
                                displayAsRange: !0,
                                predicted: s,
                                search: {
                                    from: o,
                                    to: r
                                }
                            })), i
                        }, i.getAccountSuggestions = function(e) {
                            var t = this,
                                n = [],
                                i = this.data || [];
                            return e.length < 2 && !this.options.showAll ? n : (i.forEach(function(i) {
                                var o = new RegExp("(" + e + ")", "ig"),
                                    r = i.name.match(o),
                                    l = !1;
                                if (!r) {
                                    var s = e.replace(c, ""),
                                        u = new RegExp("^(" + s + ")", "i");
                                    l = (i.bban + "").match(u)
                                }(e.length < 2 && t.options.showAll || r || l) && n.push({
                                    terms: [e],
                                    type: t.type || a.ACCOUNT,
                                    matchType: l ? "number" : "name",
                                    account: i,
                                    search: {
                                        account: i.id
                                    }
                                })
                            }), n)
                        }, i.getContactSuggestions = function(t) {
                            var n = this,
                                i = [];
                            if (t.length < 2 && !this.options.showAll) return i;
                            var o = this.data || [];
                            return o.forEach(function(o) {
                                var r = new RegExp("(" + t + ")", "ig"),
                                    l = e.isString(o.name) && o.name.match(r),
                                    s = !1;
                                if (!l) {
                                    var u = t.replace(c, ""),
                                        p = new RegExp("^(" + u + ")", "i");
                                    s = o.account && (o.account + "").match(p)
                                }(t.length < 2 && n.options.showAll || l || s) && i.push({
                                    terms: [t],
                                    type: n.type || a.CONTACT,
                                    matchType: s ? "account" : "name",
                                    contact: o,
                                    search: {
                                        contact: o.account
                                    }
                                })
                            }), i
                        }, i.getCategorySuggestions = function(e) {
                            var t = this,
                                n = [],
                                i = t.data || [],
                                o = e.split(","),
                                r = 2,
                                l = [],
                                s = [],
                                c = function(e, t) {
                                    var n = !1;
                                    return e.forEach(function(e) {
                                        e.length >= r && 0 === t.toLowerCase().indexOf(e.toLowerCase()) && (n = !0)
                                    }), n
                                };
                            return i.forEach(function(e) {
                                c(o, e.name) && (l.push(e), s.push(e.id))
                            }), s.length >= 1 && n.push({
                                terms: [o],
                                type: t.type || a.CATEGORY,
                                category: l,
                                search: {
                                    category: s.join(",")
                                }
                            }), n
                        }, i.getGeneralSuggestions = function(e, t) {
                            var i = [],
                                o = t ? e + " to " + t : e;
                            return o.length >= 2 && (n.isRange(o) || i.push({
                                terms: [o],
                                type: this.type || a.GENERAL,
                                search: {
                                    query: o
                                }
                            })), i
                        }, i
                    };
                u.$inject = ["lpCoreUtils", "SmartSuggestConfig", "SmartSuggestEngineUtil"], i.exports.factory("SmartSuggestEngineBuiltInSuggesters", u)
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                var a = n(2),
                    o = n(7);
                i.name = "ui.smartsuggest-engine-config", i.exports = a.createModule(i.name, [o.name]);
                var r = {
                        DATE: {
                            type: "date",
                            label: "On",
                            icon: "lp-icon-calendar"
                        },
                        AMOUNT: {
                            type: "amount",
                            label: "Of",
                            icon: "lp-icon-transactions-v1"
                        },
                        ACCOUNT: {
                            type: "account",
                            label: "Account",
                            icon: "lp-icon-search2"
                        },
                        CONTACT: {
                            type: "contact",
                            label: "Contact",
                            icon: "lp-icon-search2"
                        },
                        CATEGORY: {
                            type: "category",
                            label: "Category",
                            icon: "lp-icon-tag"
                        },
                        GENERAL: {
                            type: "general",
                            label: "Description",
                            icon: "lp-icon-search2"
                        },
                        TITLE: {
                            type: "title",
                            label: ""
                        }
                    },
                    l = function(e) {
                        var t = function(t) {
                                return e.mapValues(r, function(e) {
                                    return e[t]
                                })
                            },
                            n = function(t, n) {
                                var i = {},
                                    a = e.pluck(r, t),
                                    o = e.pluck(r, n);
                                return e.forEach(a, function(e, t) {
                                    i[e] = o[t]
                                }), i
                            },
                            i = function(t, n, i, a) {
                                return e.isObject(t) && e.isObject(t[n]) && e.isString(i) && e.isString(a) ? (t[n][i] = a, !0) : (console.warn("updateProp: input arguments validation failed..."), !1)
                            },
                            a = function() {
                                return t("type")
                            },
                            o = function() {
                                return n("type", "label")
                            },
                            l = function() {
                                return n("type", "icon")
                            },
                            s = a(),
                            c = o(),
                            u = l(),
                            p = function() {
                                s = a(), c = o(), u = l()
                            },
                            d = function(e, t, n) {
                                i(e, t, "icon", n) && p()
                            },
                            f = function(e, t, n) {
                                i(e, t, "label", n) && p()
                            },
                            m = function(e, t, n) {
                                i(e, t, "type", n) && p()
                            },
                            h = function(t, n) {
                                e.isObject(n) && e.isString(n.type) && !r[t] ? (r[t] = n, p()) : console.warn("addConfigItem: input arguments validation failed...")
                            };
                        return {
                            TYPES: s,
                            LABELS: c,
                            ICONS: u,
                            addConfigItem: h,
                            updateConfigIcon: d,
                            updateConfigLabel: f,
                            updateConfigType: m
                        }
                    };
                l.$inject = ["lpCoreUtils"], i.exports.factory("SmartSuggestConfig", l)
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                var a = n(2),
                    o = n(7);
                i.name = "ui.smartsuggest-formatter", i.exports = a.createModule(i.name, [o.name]), i.exports.factory("SmartSuggestFormatter", ["SmartSuggestEngine", "lpCoreI18n", "lpCoreUtils", function(e, t, n) {
                    var i = e.util.getFormatterFnName,
                        a = function(e) {
                            this.locale = e.locale || null, this.currency = e.currency || null
                        };
                    return a.prototype.addFormatter = function(e, t) {
                        n.isString(e) && n.isFunction(t) ? a.prototype[i(e)] = t : console.log("addFormatter: input arguments validation failure")
                    }, a.prototype.format = function(t) {
                        var i = [];
                        return t.displayAsRange ? (i[0] = this.formatValue(t.search.from, t.type), i[1] = this.formatValue(t.search.to, t.type)) : t.type === e.types.DATE ? i[0] = this.formatValue(t.search.from, t.type) : t.type === e.types.AMOUNT ? i[0] = this.formatValue(t.search.original, t.type) : t.type === e.types.CONTACT ? (i[0] = this.formatValue(t.contact.name, t.type), i[1] = this.formatValue(t.contact.account, t.type)) : t.type === e.types.CATEGORY ? i[0] = this.formatValue(t.category, t.type) : t.type === e.types.ACCOUNT ? (i[0] = this.formatValue(t.account.name, t.type), i[1] = this.formatValue(t.account.iban, t.type), i[2] = this.formatAmount(t.account.balance, t.account.currency)) : t.type === e.types.TITLE ? i[0] = this.formatValue(t.title, t.type) : i[0] = this.formatValue(t.search.query, t.type), i = n.map(i, n.stripHtml)
                    }, a.prototype.formatValue = function(e, t) {
                        return n.isFunction(this[i(t)]) ? this[i(t)](e) : e
                    }, a.prototype.formatAmount = function(e, n) {
                        return t.formatCurrency(e, n || this.currency)
                    }, a.prototype.formatDate = function(e) {
                        return t.formatDate(e)
                    }, a.prototype.formatAccount = function(e) {
                        return e.name
                    }, a.prototype.formatCategory = function(e) {
                        var t = e;
                        return t.map(function(e) {
                            return e.name
                        }).join(", ")
                    }, a.prototype.formatGeneral = function(e) {
                        return e
                    }, a.prototype.formatTitle = function(t) {
                        switch (t) {
                            case e.types.ACCOUNT:
                                return "My accounts";
                            case e.types.CONTACT:
                                return "Address Book"
                        }
                        return t
                    }, a.prototype.getTypeLabel = function(n) {
                        var i;
                        return i = n.displayAsRange ? "Between" : e.labels[n.type] || "Description", t.instant(i) + ": "
                    }, a.prototype.getSuggestionIcon = function(t, n) {
                        return "lp-icon lp-icon-" + (n ? "small" : "medium") + " " + e.icons[t.type]
                    }, a.prototype.getSuggestionHtml = function(n) {
                        var i = "lp-smartsuggest-" + n.type,
                            a = this.format(n),
                            o = '<div class="lp-smartsuggest-result clearfix ' + i + '">',
                            r = n.predicted ? "lp-smartsuggest-predicted" : "";
                        if (n.type !== e.types.ACCOUNT && n.type !== e.types.TITLE) {
                            if (o += '<span class="lp-smartsuggest-icon">', n.type === e.types.CONTACT && "string" == typeof n.contact.photoUrl) o += '<img src="' + decodeURIComponent(n.contact.photoUrl) + '" width="35" height="35">';
                            else if (n.type === e.types.CONTACT && n.contact.initials) o += '<span class="lp-smartsuggest-intials">' + n.contact.initials + "</span>";
                            else {
                                var l = this.getSuggestionIcon(n);
                                o += '<i class="' + l + '"></i>'
                            }
                            o += "</span>"
                        }
                        return o += '<div class="lp-smartsuggest-valuegroup">', n.contact || n.account || (o += '<span class="lp-smartsuggest-category">' + this.getTypeLabel(n) + "</span>"), n.contact ? (o += '<span class="lp-smartsuggest-value ' + i + '-value">' + a[0] + "</span><br>", o += '<span class="' + i + '-value">' + a[1] + "</span>") : n.account ? (o += '<div class="lp-smartsuggest-value ' + i + '-value">' + a[0] + "</div>", o += '<div><small class="' + i + '-value pull-left muted">' + a[1] + "</small>", o += '<span class="' + i + '-value pull-right">' + a[2] + "</span></div>") : 2 === a.length ? (o += '<span class="lp-smartsuggest-from lp-smartsuggest-value ' + i + '-value">' + a[0] + "</span> " + t.instant("to"), o += ' <span class="lp-smartsuggest-to lp-smartsuggest-value ' + i + "-value " + r + '">' + a[1] + "</span>") : o += '<span class="lp-smartsuggest-value ' + i + '-value">' + a[0] + "</span>", o += "</div>", o += "</div>"
                    }, a
                }])
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i));
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                i.name = "ui.touch";
                var a = n(2);
                i.exports = a.createModule(i.name, []).directive(n(58).directives)
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        i = function(e, t, i) {
            "use strict";

            function a(e) {
                var t = "ontouchstart" in window;
                return ["$parse", function(n) {
                    var i = e.substr(2).toLowerCase();
                    return {
                        link: function(a, r, l) {
                            var s, c, u = r.data("touch"),
                                p = n(l[e]),
                                d = n(l.onGestureOptions)(a, {});
                            c = function(e) {
                                a.$apply(function() {
                                    p(a, {
                                        $event: event,
                                        $element: r
                                    })
                                })
                            }, "undefined" != typeof o && t && (u || (u = new o(r[0], d), r.data("touch", u)), s = u.on(i, c), a.$on("$destroy", function() {
                                s.off(i, c)
                            }))
                        }
                    }
                }]
            }
            var o = n(59),
                r = ["onPan", "onPanUp", "onPanDown", "onPanLeft", "onPanRight", "onPanStart", "onPanEnd", "onPanMove", "onPanCancel", "onSwipe", "onSwipeUp", "onSwipeDown", "onSwipeLeft", "onSwipeRight", "onPinch", "onPinchIn", "onPinchOut", "onPinchStart", "onPinchEnd", "onPinchMove", "onPinchCancel", "onRotate", "onRotateMove", "onRotateStart", "onRotateEnd", "onRotateCancel", "onTap", "onPress"],
                l = {};
            r.forEach(function(e) {
                l[e] = a(e)
            }), t.directives = l
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t) {
        e.exports = i
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                i.name = "ui.placeholder";
                var a = n(2);
                n(61);
                var o = [];
                i.exports = a.createModule(i.name, o).directive(n(62))
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i, a, o;
        ! function(r) {
            a = [n(49)], i = r, o = "function" == typeof i ? i.apply(t, a) : i, !(void 0 !== o && (e.exports = o))
        }(function(e) {
            function t(t) {
                var n = {},
                    i = /^jQuery\d+$/;
                return e.each(t.attributes, function(e, t) {
                    t.specified && !i.test(t.name) && (n[t.name] = t.value)
                }), n
            }

            function n(t, n) {
                var i = this,
                    o = e(i);
                if (i.value == o.attr("placeholder") && o.hasClass(d.customClass))
                    if (o.data("placeholder-password")) {
                        if (o = o.hide().nextAll('input[type="password"]:first').show().attr("id", o.removeAttr("id").data("placeholder-id")), t === !0) return o[0].value = n;
                        o.focus()
                    } else i.value = "", o.removeClass(d.customClass), i == a() && i.select()
            }

            function i() {
                var i, a = this,
                    o = e(a),
                    r = this.id;
                if ("" === a.value) {
                    if ("password" === a.type) {
                        if (!o.data("placeholder-textinput")) {
                            try {
                                i = o.clone().attr({
                                    type: "text"
                                })
                            } catch (l) {
                                i = e("<input>").attr(e.extend(t(this), {
                                    type: "text"
                                }))
                            }
                            i.removeAttr("name").data({
                                "placeholder-password": o,
                                "placeholder-id": r
                            }).bind("focus.placeholder", n), o.data({
                                "placeholder-textinput": i,
                                "placeholder-id": r
                            }).before(i)
                        }
                        o = o.removeAttr("id").hide().prevAll('input[type="text"]:first').attr("id", r).show()
                    }
                    o.addClass(d.customClass), o[0].value = o.attr("placeholder")
                } else o.removeClass(d.customClass)
            }

            function a() {
                try {
                    return document.activeElement
                } catch (e) {}
            }
            var o, r, l = "[object OperaMini]" == Object.prototype.toString.call(window.operamini),
                s = "placeholder" in document.createElement("input") && !l,
                c = "placeholder" in document.createElement("textarea") && !l,
                u = e.valHooks,
                p = e.propHooks;
            if (s && c) r = e.fn.placeholder = function() {
                return this
            }, r.input = r.textarea = !0;
            else {
                var d = {};
                r = e.fn.placeholder = function(t) {
                    var a = {
                        customClass: "placeholder"
                    };
                    d = e.extend({}, a, t);
                    var o = this;
                    return o.filter((s ? "textarea" : ":input") + "[placeholder]").not("." + d.customClass).bind({
                        "focus.placeholder": n,
                        "blur.placeholder": i
                    }).data("placeholder-enabled", !0).trigger("blur.placeholder"), o
                }, r.input = s, r.textarea = c, o = {
                    get: function(t) {
                        var n = e(t),
                            i = n.data("placeholder-password");
                        return i ? i[0].value : n.data("placeholder-enabled") && n.hasClass(d.customClass) ? "" : t.value
                    },
                    set: function(t, o) {
                        var r = e(t),
                            l = r.data("placeholder-password");
                        return l ? l[0].value = o : r.data("placeholder-enabled") ? ("" === o ? (t.value = o, t != a() && i.call(t)) : r.hasClass(d.customClass) ? n.call(t, !0, o) || (t.value = o) : t.value = o, r) : t.value = o
                    }
                }, s || (u.input = o, p.value = o), c || (u.textarea = o, p.value = o), e(function() {
                    e(document).delegate("form", "submit.placeholder", function() {
                        var t = e("." + d.customClass, this).each(n);
                        setTimeout(function() {
                            t.each(i)
                        }, 10)
                    })
                }), e(window).bind("beforeunload.placeholder", function() {
                    e("." + d.customClass).each(function() {
                        this.value = ""
                    })
                })
            }
        })
    }, function(e, t, n) {
        var i;
        i = function(e, t, n) {
            "use strict";
            var i = window.jQuery;
            t.placeholder = function(e) {
                return {
                    restrict: "A",
                    link: function(t, n, a) {
                        var o = a.placeholder;
                        o && e(function() {
                            i(n).placeholder()
                        }, 0, !1)
                    }
                }
            }, t.placeholder.$inject = ["$timeout"]
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                i.name = "ui.color-picker";
                var a = n(2),
                    o = [];
                i.exports = a.createModule(i.name, o).constant(n(64)).directive(n(65))
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        i = function(e, t, n) {
            "use strict";
            t.COLORS = [{
                name: "Cantaloupe",
                value: "#FFD479"
            }, {
                name: "Honeydew",
                value: "#D4FB79"
            }, {
                name: "Spindrift",
                value: "#73FCD6"
            }, {
                name: "Sky",
                value: "#76D6FF"
            }, {
                name: "Lavender",
                value: "#D783FF"
            }, {
                name: "Carnation",
                value: "#FF8AD8"
            }, {
                name: "Licorice",
                value: "#000000"
            }, {
                name: "Snow",
                value: "#FFFFFF"
            }, {
                name: "Salmon",
                value: "#FF7E79"
            }, {
                name: "Banana",
                value: "#FFFC79"
            }, {
                name: "Flora",
                value: "#73FA79"
            }, {
                name: "Ice",
                value: "#73FDFF"
            }, {
                name: "Orchid",
                value: "#7A81FF"
            }, {
                name: "Bubblegum",
                value: "#FF85FF"
            }, {
                name: "Lead",
                value: "#212121"
            }, {
                name: "Mercury",
                value: "#EBEBEB"
            }, {
                name: "Tangerine",
                value: "#FF9300"
            }, {
                name: "Lime",
                value: "#8EFA00"
            }, {
                name: "Sea Foam",
                value: "#00FA92"
            }, {
                name: "Aqua",
                value: "#0096FF"
            }, {
                name: "Grape",
                value: "#9437FF"
            }, {
                name: "Strawberry",
                value: "#FF2F92"
            }, {
                name: "Tungsten",
                value: "#424242"
            }, {
                name: "Silver",
                value: "#D6D6D6"
            }, {
                name: "Maraschino",
                value: "#FF2600"
            }, {
                name: "Lemon",
                value: "#FFFB00"
            }, {
                name: "Spring",
                value: "#00F900"
            }, {
                name: "Turquoise",
                value: "#00FDFF"
            }, {
                name: "Blueberry",
                value: "#0433FF"
            }, {
                name: "Iron",
                value: "#5E5E5E"
            }, {
                name: "Magnesium",
                value: "#C0C0C0"
            }, {
                name: "Mocha",
                value: "#945200"
            }, {
                name: "Fern",
                value: "#4F8F00"
            }]
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        i = function(e, t, n) {
            "use strict";
            t.lpColorPicker = function(e, t) {
                function n(n, i, a) {
                    n.colors = t, e(function() {
                        i.find("li")[0].focus()
                    }, 0), n.keyDown = function(e, t) {
                        (13 === e.which || 32 === e.which) && (e.preventDefault(), e.stopPropagation(), n.selectColor(t))
                    }
                }

                function i() {
                    return n
                }
                var a = ['<ul class="color-picker clearfix">', '<li ng-repeat="color in colors" tabIndex="0" class="color cursor-pointer" title="{{color.name}}" ng-click="selectColor(color.value)" ng-keydown="keyDown($event, color.value)">', "<div ng-style=\"{'background-color':color.value}\"></div>", "</li>", "</ul>"].join("");
                return {
                    scope: {
                        selectColor: "="
                    },
                    restrict: "AE",
                    compile: i,
                    template: a
                }
            }, t.lpColorPicker.$inject = ["$timeout", "COLORS"]
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                var a = n(2);
                i.name = "ui.infinite-scroll", i.exports = a.createModule(i.name, []).directive(n(67))
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        i = function(e, t, n) {
            "use strict";
            t.lpInfiniteScroll = function(e) {
                function t(t, n, i) {
                    var a = n[0],
                        o = e(i.lpInfiniteScrollDisabled),
                        r = e(i.lpInfiniteScrollEnd),
                        l = function(e) {
                            var n, l, s = o(t);
                            r(t) || s || (n = a.scrollTop, l = a.scrollHeight - a.offsetHeight, n === l && t.$apply(i.lpInfiniteScroll))
                        },
                        s = function(e) {
                            var n, i;
                            return r(t) || (n = a.scrollTop, i = a.scrollHeight - a.offsetHeight, n !== i) ? void 0 : o(t) ? void 0 : e.preventDefault()
                        };
                    t.$on("$destroy", function() {
                        return n.unbind("scroll", l), n.unbind("mousewheel", s)
                    }), n.bind("scroll", l), n.bind("mousewheel", s)
                }
                return {
                    restrict: "A",
                    link: t
                }
            }, t.lpInfiniteScroll.$inject = ["$parse"]
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                i.name = "ui.element-resize";
                var a = n(2),
                    o = [];
                i.exports = a.createModule(i.name, o).directive(n(69))
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        i = function(e, t, i) {
            "use strict";
            var a = n(2).ng,
                o = function(e) {
                    var t = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function() {
                        return window.setTimeout(e, 20)
                    };
                    return t(e)
                },
                r = function(e) {
                    var t = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.clearTimeout;
                    return t(e)
                };
            t.lpElementResize = function(e) {
                return {
                    restrict: "A",
                    link: function(t, n, i) {
                        var l, s, c, u = e(i.elementResize || i.lpElementResize),
                            p = n[0],
                            d = {},
                            f = !1,
                            m = function() {
                                return p.offsetWidth !== d.width || p.offsetHeight !== d.height
                            },
                            h = function() {
                                var e = l[0],
                                    t = e.querySelector(".expand-trigger"),
                                    n = e.querySelector(".contract-trigger"),
                                    i = e.querySelector(".expand-trigger > div");
                                n.scrollLeft = n.scrollWidth, n.scrollTop = n.scrollHeight, i.style.width = t.offsetWidth + 1 + "px", i.style.height = t.offsetHeight + 1 + "px", t.scrollLeft = t.scrollWidth, t.scrollTop = t.scrollHeight
                            },
                            g = function(e) {
                                f || h(), s && r(s), s = o(function() {
                                    m() && (d.width = p.offsetWidth, d.height = p.offsetHeight, u(t, {
                                        data: {
                                            element: n,
                                            width: p.offsetWidth,
                                            height: p.offsetHeight
                                        }
                                    }))
                                })
                            },
                            v = function() {
                                d.width = p.offsetWidth, d.height = p.offsetHeight, p.attachEvent("onresize", g), u(t, {
                                    data: {
                                        element: n,
                                        width: p.offsetWidth,
                                        height: p.offsetHeight
                                    }
                                })
                            },
                            b = function() {
                                l = a.element('<div class="responsive-shadow"><div class="expand-trigger"><div></div></div><div class="contract-trigger"></div></div>'), n.append(l), h(), d.width = p.offsetWidth, d.height = p.offsetHeight, p.addEventListener("scroll", g, !0), u(t, {
                                    data: {
                                        element: n,
                                        width: p.offsetWidth,
                                        height: p.offsetHeight
                                    }
                                })
                            },
                            y = function() {
                                f = !!document.attachEvent, f ? v() : 0 === p.offsetWidth && 0 === p.offsetHeight ? c || (c = window.setInterval(function() {
                                    0 !== p.offsetWidth && 0 !== p.offsetHeight && (window.clearInterval(c), b())
                                }, 250)) : b()
                            };
                        y()
                    }
                }
            }, t.lpElementResize.$inject = ["$parse"], t.elementResize = t.lpElementResize
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        (function(e) {
            i = function(e, t, i) {
                "use strict";
                i.name = "ui.utils";
                var a = n(2),
                    o = a.utils;
                o.mixin(n(71)), o.mixin(n(72)), i.exports = a.createModule(i.name, []).constant({
                    lpUIUtils: o
                })
            }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
        }).call(t, n(1)(e))
    }, function(e, t, n) {
        var i;
        i = function(e, t, n) {
            "use strict";
            t.getSelectionPositionOfInput = function(e, t) {
                var n = [];
                if (t || (t = function(e) {
                        return e
                    }), "selectionStart" in e) n = [t(e.selectionStart), t(e.selectionEnd)];
                else {
                    var i = document.selection.createRange();
                    if (i && i.parentElement() === e) {
                        var a = e.createTextRange();
                        a.moveToBookmark(i.getBookmark()), n[0] = t(a.moveStart("character", -e.value.length)), n[1] = t(a.moveEnd("character", -e.value.length))
                    }
                }
                return n
            }, t.getNewCaretPosition = function(e, t, n, i) {
                var a = t[0];
                return n = t[1] - t[0] + n, 0 >= n && (n = 1), e.value.length || (t = [0, 0]), a = t[0] === t[1] ? i ? 0 === t[0] ? 0 : t[0] - 1 : t[0] + n : i ? t[0] : t[0] + n
            }, t.setCaretPositionOfInput = function(e, t, n, i) {
                var a;
                if ("setSelectionRange" in e) e.setSelectionRange(t, t);
                else {
                    var o = e.createTextRange();
                    o.collapse(!0), o.moveEnd("character", t), o.moveStart("character", t), o.select()
                }
                n && i && (n ? i.text(n.substr(0, t)) : i.text(""), a = i.width() - e.offsetWidth / 2, e.scrollLeft = a)
            }
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }, function(e, t, n) {
        var i;
        i = function(e, t, n) {
            "use strict";
            t.extractInitials = function(e) {
                var t = "";
                if (e = e.split(" "), 1 == e.length) t = e[0].substr(0, 2);
                else
                    for (var n = 0; n < e.length; n++) t += e[n].substr(0, 1);
                return t = t.toUpperCase()
            }, t.getColorFromInitials = function(e) {
                var t = e.charCodeAt(0) - 64,
                    n = t + 120,
                    i = Math.floor((t - 1) / 25 * 4 + 1 - 1),
                    a = [
                        [n, 210, 210],
                        [n, n, 210],
                        [210, n, n],
                        [n, 210, n],
                        [210, n, 210]
                    ];
                return a[i]
            };
            var i = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABPCAIAAADz89W0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3MkVFRDI3OTJERUQxMUUzQkU4Qzk1MDlEQzAyMjFFNCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3MkVFRDI3QTJERUQxMUUzQkU4Qzk1MDlEQzAyMjFFNCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjcyRUVEMjc3MkRFRDExRTNCRThDOTUwOURDMDIyMUU0IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjcyRUVEMjc4MkRFRDExRTNCRThDOTUwOURDMDIyMUU0Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+gildPAAABRdJREFUeNrsmstKI0EUhicmRmO8IoKIgigoCoovIOhOX8m38RncuHWjG0HFjeAl4GWhoAvvUZPMZ/6ZQ9OtmUBa04OnFk2luqo9X51LnVMzqZWVlV8/qbX8+mHNgR3YgR3YgR3YgR3YgR3YgR3YgR3YgR3YgR3YgR3YgR34O1umkcWVSiX4M5VK2Yj6PDUt9Co6GPxI6MvB+U0GDlL9MZiWluBe6KkJ9iqI8RmDjVeq7cO/1TQN8wTm9fX16ekpn88/Pj5ms1kky+VyLy8vdMrlMoOtra100um0MWgLghj0mfD29mav+JnJZJKiYWuA9fb2jo2NiRYwhL64uIBf0k9NTTFHWyMY5kRtVX0msIqfPK+vr0ulUnRrmgyMHF1dXQsLCz09PYChlpubm7W1tbu7O2SFbXx8fGZmxpiZDwzToobKTwhZgmKfn5/Pz883NjaKxaJMo3FR0/Pz841/Ba0iGSSDg4MPDw/Ih27b29uPj495hbUXCoWRkRGELlYb5MDAzCv6etJ4xaD2BWzGh4aGmHl5eVnD4b8PWPpBFbK6q6ur0dFRlCxzbWtrw6sZ7OjoQNXIPTs7y2ScOVttTGCVvFTN+lI7P/kyP9k4vhkLc6NBCwmQiT76RLdbW1vLy8tyP8inp6dPT09RFHi49Pb29sDAgMyVJ+N0YI6eW6yFljkMEvyYw19pftCSQ0osheWTk5OjoyNCFLolgGHGc3Nzm5ubnZ2dbMf6+jquzvj7H85kbLOCja+xO4uLi2wWO4I5yMJjceBGMy3bcsRCOBnhzs7O/f09CmcvwJ6cnAQbWgi7u7vhyVcbVIxg1cxkOX1G6LM1eDLBWX4hS47LgWMAthiLuKgCJEx3b2+PETk2KsV1IZS7QmgeyxL5M5y5apO1M5lpds4rqicrtUS94gESZoAnJib6+/sBYBcI3ZiojqtQvik1auNub2+xDu2j3CRGS47fhzVCrEJRGCR+u7S0pIAE5/DwsDpRYEuniOe7u7vsnbKO1N8WL3MMufT74VZNIVAvHY4f/JDgjEoVYC0g84x+oVRt5WpjrX3zizTcaHloSlBKaJkjZ698WOoy3do0dfTKEmw6+DNPTbCWFA2HVC0DVpOtKsYyfnBwsL+/T4gyk+aVlC8kebuKEL1VREhWPRws8aIVrD15RWp9dnYGQyhpEZvgdUQpb5MXVAItKUHLXM4MW/KZKeotZ4/O3mipYGvVOITxZKUllmNGLxuar+HQ1QT6URqsA5noRVIZugOIOoX8glWazEdk2DF6ciZ2J7E8RC4qbPItKkTxh6wjeDeiJcQ50hVLM1G4YkGC6uEQsIWcYMWD6HaVESo8dKppnBGcWaFLsZrz2WJbEjUsEqvvTWl20RHKW2zQtsBuCKiZqCsPDw/tbiiJGpboxFskNjyJa5VgjSs73RCpzKbuJ9ksFApkMhYLkwgMGInx6uoqRZKUo6u5f2rJ/FlVhOqwvr6+GAumr9Kwkko0U7+UZtLsi2KVQoDcwbKUJPqwLiikIrmxyil5bG0N6zKEQlpHsZRsdwzJ1TAiIqhiDzmj7qssONVYq9ybtVKsrUpWLh2NQBDKaaVnRFc9XOdyqVp3l1aZJNSkLdlUTLYiIXjY1nm1EDx77QxL6DkcyoHr+QexaGYe7SRUw9EEu55z5bOFH36qaRcA/11zYAd2YAd2YAd2YAd2YAd2YAd2YAd24B/QMrH/J4qkA8f7Pyhcw+7DzW6/BRgAykJQPtOgddIAAAAASUVORK5CYII=";
            t.getDefaultProfileImage = function(e, n, a, o) {
                var r = document.createElement("canvas");
                if (!r.getContext || !r.getContext("2d")) return i;
                var l = t.extractInitials(e);
                o = "rgb(255,173,27)", r.setAttribute("width", n), r.setAttribute("height", a);
                var s = r.getContext("2d"),
                    c = "[object Array]" === Object.prototype.toString.call(o);
                s.fillStyle = c ? "rgb(" + o.join(",") + ")" : o, s.fillRect(0, 0, n, a), s.fillStyle = "rgb(250,250,250)";
                var u;
                switch (l.length) {
                    case 1:
                        u = .6;
                        break;
                    case 2:
                        u = .5;
                        break;
                    case 3:
                        u = .45;
                        break;
                    default:
                        u = .3
                }
                var p = parseInt(u * a * .75, 10),
                    d = Math.floor(.35 * a);
                s.font = p + "px Proxima Regular, Helvetica Nueue, Helvetica, Arial, sans-serif", s.textAlign = "center", s.fillText(l, .5 * n, a - d);
                var f = r.toDataURL("image/png");
                return f
            }, t.decodePhotoUrl = function(e) {
                return e ? decodeURIComponent(e) : null
            }
        }.call(t, n, t, e), !(void 0 !== i && (e.exports = i))
    }])
});