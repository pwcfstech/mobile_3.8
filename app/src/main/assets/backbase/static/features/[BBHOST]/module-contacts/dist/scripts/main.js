/* example-test@v1.0.0 build with ♥ by bb-lp-cli@v1.9.17 */ ! function(t, e) {
    "object" == typeof exports && "object" == typeof module ? module.exports = e(require("base"), require("module-users"), require("idfccommon"), require("idfcerror"), require("jquery")) : "function" == typeof define && define.amd ? define(["base", "module-users", "idfccommon", "idfcerror", "jquery"], e) : "object" == typeof exports ? exports["example-test"] = e(require("base"), require("module-users"), require("idfccommon"), require("idfcerror"), require("jquery")) : t["example-test"] = e(t.base, t["module-users"], t.idfccommon, t.idfcerror, t.jquery)
}(this, function(__WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_6__, __WEBPACK_EXTERNAL_MODULE_7__, __WEBPACK_EXTERNAL_MODULE_8__) {
    return function(t) {
        function e(a) {
            if (n[a]) return n[a].exports;
            var r = n[a] = {
                exports: {},
                id: a,
                loaded: !1
            };
            return t[a].call(r.exports, r, r.exports, e), r.loaded = !0, r.exports
        }
        var n = {};
        return e.m = t, e.c = n, e.p = "/", e(0)
    }([function(t, exports, e) {
        t.exports = e(1)
    }, function(t, exports, e) {
        var n;
        (function(t) {
            "use strict";
            n = function(require, exports, t) {
                t.name = "module-contacts";
                var n = e(3),
                    a = e(4),
                    r = [a.name];
                t.exports = n.createModule(t.name, r).factory(e(5))
            }.call(exports, e, exports, t), !(void 0 !== n && (t.exports = n))
        }).call(exports, e(2)(t))
    }, function(t, exports) {
        t.exports = function(t) {
            return t.webpackPolyfill || (t.deprecate = function() {}, t.paths = [], t.children = [], t.webpackPolyfill = 1), t
        }
    }, function(t, exports) {
        t.exports = __WEBPACK_EXTERNAL_MODULE_3__
    }, function(t, exports) {
        t.exports = __WEBPACK_EXTERNAL_MODULE_4__
    }, function(module, exports, __webpack_require__) {
        var __WEBPACK_AMD_DEFINE_RESULT__;
        __WEBPACK_AMD_DEFINE_RESULT__ = function(require, exports, module) {
            "use strict";
            var idfcConstants = __webpack_require__(6).idfcConstants,
                idfcHandler = __webpack_require__(7),
                $ = __webpack_require__(8);
            exports.ContactsModel = function($http, orderByFilter, httpService, lpCoreUtils, lpDefaultProfileImage) {
                var ContactsModel = function(t) {
                    t = t || {}, this.defaults = {
                        locale: t.locale,
                        contactListEndpoint: t.contacts,
                        contactDataCreateServiceEndpoint: t.contactDataCreate,
                        contactDataModifyServiceEndpoint: t.contactDataModify,
                        contactDetailsServiceEndpoint: t.contactDetails,
                        metaDataEndpoint: t.metaData,
                        bankServiceEndpoint: t.bankServiceDetails,
                        databaseServiceEndpoint: t.databaseServiceDetails,
                        generateOTPServiceEndPoint: t.generateOTPDetails,
                        rsaAnalyzeServiceEndPoint: t.rsaAnalyzeService
                    }, this.locale = t.locale, t.contactDetails && (this.contactDetailsData = []), self.contacts = [], self.banksList = [], self.ifscList = [], self.countryCodesList = [], t.lazyload || this.loadContacts()
                };
                return ContactsModel.prototype.generateOTP = function(t) {
                    var e = null,
                        n = lpCoreUtils.resolvePortalPlaceholders(this.defaults.generateOTPServiceEndPoint);
                    e = "resend" === t;
                    var a = {
                        resendOTP: e
                    };
                    a = $.param(a || {});
                    var r = $http({
                        method: "POST",
                        url: n,
                        data: a,
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/x-www-form-urlencoded;"
                        }
                    });
                    return r
                }, ContactsModel.prototype.checkDailyAddLimit = function() {
                    var t = this;
                    t.databaseService = httpService.getInstance({
                        endpoint: this.defaults.databaseServiceEndpoint,
                        urlVars: {
                            requestId: "dailyCount"
                        }
                    });
                    var e = t.databaseService.read();
                    return e
                }, ContactsModel.prototype.loadBanksList = function() {
                    var t = this;
                    t.bankService = httpService.getInstance({
                        endpoint: this.defaults.bankServiceEndpoint,
                        urlVars: {
                            requestId: "banksList",
                            bizObjId: ""
                        }
                    });
                    var e = t.bankService.read();
                    return e.success(function(e) {
                        e && "null" !== e ? (t.banksList = e.banksList, t.ifscList = e.ifscList) : (t.banksList = [], t.ifscList = [])
                    }), e
                }, ContactsModel.prototype.loadCountryCodesList = function() {
                    var t = this;
                    t.bankService = httpService.getInstance({
                        endpoint: this.defaults.bankServiceEndpoint,
                        urlVars: {
                            requestId: "countryCodesList",
                            bizObjId: ""
                        }
                    });
                    var e = t.bankService.read();
                    return e.success(function(e) {
                        e && "null" !== e ? t.countryCodesList = e.countryCodesList : t.countryCodesList = []
                    }), e
                }, ContactsModel.prototype.loadContacts = function() {
                    var t = this;
                    t.errorSpin = !0;
                    var e = new Date,
                        n = this.defaults.contactListEndpoint + "&cParam=" + e,
                        a = $http.get(n);
                    return this.loading = !0, a.success(function(e) {
                        t.errorSpin = !1, e && "null" !== e ? (t.currentContact && "AddBeneficiary" === t.transactionName && (t.currentContact = e[0], t.currentContact.id = e[0].id), t.contacts = t.preprocessContacts(e), t.activeContacts = [], lpCoreUtils.forEach(t.contacts, function(e) {
                            e && "ACTIVE" === e.status && t.activeContacts.push(e)
                        }), t.contacts = t.activeContacts) : t.contacts = []
                    }), a.error(function(e) {
                        t.errorSpin = !1, e.cd && idfcHandler.checkTimeout(e), t.error = {
                            message: e.statusText
                        }
                    }), a.finally(function() {
                        t.loading = !1
                    }), a
                }, ContactsModel.prototype.loadContactDetails = function(t, e) {
                    var n = this;
                    if (n.selected && t && (n.selected = t), this.contactDetailsData.length > 0 && lpCoreUtils.forEach(this.contactDetailsData, function(a) {
                            if (a && a.id === t && !e) return n.currentDetails = a, n.currentContact.branchAdd = n.currentDetails.branchAdd, n.currentContact.accountType = n.currentDetails.accountType, n.currentContact.ifscCode = n.currentDetails.ifscCode, n.currentContact.ifscCode && (n.currentContact.bankName = n.currentDetails.bankName), n.currentContact.ifscCode && "" !== n.currentContact.ifscCode || (n.currentContact.bankName = idfcConstants.BENEFICIARY_OWN_BANK_NAME), n.currentContact.transferLimit = n.currentDetails.transferLimit, n.currentContact.email = n.currentDetails.email, n.currentContact.phone = n.currentDetails.phone, void(n.detailsLoaded = !0)
                        }), !this.detailsLoaded) {
                        this.loading = !0, n.errorSpin = !0;
                        var a = new Date,
                            r = this.defaults.contactDetailsServiceEndpoint + "&cDetailT=" + a,
                            c = $http({
                                url: r,
                                method: "GET",
                                params: {
                                    contactId: t,
                                    bizObjId: t
                                }
                            });
                        return c.success(function(t) {
                            n.errorSpin = !1, n.currentDetails = t, n.currentContact.branchAdd = n.currentDetails.branchAdd, n.currentContact.accountType = n.currentDetails.accountType, n.currentContact.ifscCode = n.currentDetails.ifscCode, n.currentContact.ifscCode && (n.currentContact.bankName = n.currentDetails.bankName), n.currentContact.ifscCode && "" !== n.currentContact.ifscCode || (n.currentContact.bankName = idfcConstants.BENEFICIARY_OWN_BANK_NAME), n.currentContact.transferLimit = n.currentDetails.transferLimit, n.currentContact.email = n.currentDetails.email, n.currentContact.phone = n.currentDetails.phone, n.contactDetailsData.push(n.currentDetails)
                        }), c.error(function(t) {
                            n.errorSpin = !1, t.cd && idfcHandler.checkTimeout(t), n.error = {
                                message: t.statusText
                            }
                        }), c.finally(function() {
                            n.loading = !1
                        }), c
                    }
                    this.detailsLoaded = !1
                }, ContactsModel.prototype.preprocessContacts = function(t) {
                    var e = [];
                    return e = orderByFilter(t, "nickName")
                }, ContactsModel.prototype.createContact = function(valid, isRSA, challengeValue, verifyData) {
                    if (!valid) return !1;
                    var self = this,
                        contactId = this.currentContact.id;
                    if (self.currentContact.transaction = "AddBeneficiary", self.transactionName = "AddBeneficiary", "AddBeneficiary" === isRSA) {
                        /*if ("QUESTION" === challengeValue || "OTPANDQUESTION" === challengeValue || "RSAOTPANDQUESTION" === challengeValue) {
                            for (var i = 0; i < verifyData.challengeQuestions.length; i++) eval("self.currentContact.question" + i + "=verifyData.challengeQuestions[i].questionId;");
                            for (var i = 0; i < verifyData.challengeQuesAnswers.length; i++) eval("self.currentContact.answer" + i + "=verifyData.challengeQuesAnswers[i].answer;");
                            self.currentContact.length = verifyData.challengeQuesAnswers.length
                        }*/
                        self.currentContact.credentialType = challengeValue, self.contactDataCreateService = httpService.getInstance({
                            endpoint: this.defaults.contactDataCreateServiceEndpoint,
                            urlVars: {
                                contactId: contactId,
                                bizObjId: self.currentContact.partyId
                            }
                        })
                    } else "rsa" === isRSA && (self.contactDataCreateService = httpService.getInstance({
                        endpoint: this.defaults.rsaAnalyzeServiceEndPoint,
                        urlVars: {
                            contactId: contactId,
                            bizObjId: self.currentContact.partyId,
                            devicePrint: verifyData.devicePrint
                        }
                    }));
                  	self.currentContact.mobileSdkData = verifyData.mobileSdkData;
                    var xhrContactUpdate = self.contactDataCreateService.create({
                            data: self.currentContact
                        }),
                        detailsCallback = function() {
                            self.contacts.push(self.currentContact), self.contactDetailsData.push(self.currentDetails), self.refreshModel(!0)
                        };
                    return "rsa" === isRSA ? xhrContactUpdate : (self.sendXhrRequest(xhrContactUpdate), self.sendXhrRequest(xhrContactUpdate, detailsCallback))
                }, ContactsModel.prototype.createCounterParty = function(t) {
                    if (!t) return !1;
                    var e = this,
                        n = function() {
                            e.contacts.push(e.currentContact)
                        };
                    return this.sendXhrRequest($http({
                        method: "POST",
                        url: this.defaults.contactListEndpoint,
                        data: lpCoreUtils.buildQueryString(this.currentContact)
                    }), n)
                }, ContactsModel.prototype.updateContact = function(valid, isRSA, challengeValue, verifyData, transactionName) {
                    if (!valid) return !1;
                    var self = this,
                        currentId = self.currentContact.id,
                        cleanData = function(t, e) {
                            var n = {};
                            return lpCoreUtils.forEach(e, function(e, a) {
                                lpCoreUtils.forEach(t, function(t) {
                                    t === a && (n[a] = e)
                                })
                            }), n
                        },
                        addEmptyFields = function(t, e) {
                            return lpCoreUtils.forEach(t, function(t) {
                                e[t] || (e[t] = null)
                            }), e
                        };
                    if ("DeleteBeneficiary" === transactionName ? (self.currentContact.transaction = transactionName, self.transactionName = "DeleteBeneficiary") : (self.currentContact.transaction = "EditBeneficiary", self.transactionName = "EditBeneficiary"), "EditBeneficiary" === isRSA || "DeleteBeneficiary" === isRSA) {
                        /*if ("QUESTION" === challengeValue || "OTPANDQUESTION" === challengeValue || "RSAOTPANDQUESTION" === challengeValue) {
                            for (var i = 0; i < verifyData.challengeQuestions.length; i++) eval("self.currentContact.question" + i + "=verifyData.challengeQuestions[i].questionId;");
                            for (var i = 0; i < verifyData.challengeQuesAnswers.length; i++) eval("self.currentContact.answer" + i + "=verifyData.challengeQuesAnswers[i].answer;");
                            self.currentContact.length = verifyData.challengeQuesAnswers.length
                        }*/
                        self.contactDataModifyService = httpService.getInstance({
                            endpoint: this.defaults.contactDataModifyServiceEndpoint,
                            urlVars: {
                                contactId: currentId,
                                bizObjId: currentId
                            }
                        })
                    } else "rsa" === isRSA && (self.contactDataModifyService = httpService.getInstance({
                        endpoint: this.defaults.rsaAnalyzeServiceEndPoint,
                        urlVars: {
                            contactId: currentId,
                            bizObjId: currentId,
                            devicePrint: verifyData.devicePrint
                        }
                    }));
                    self.currentContact.credentialType = challengeValue;
                  	self.currentContact.mobileSdkData = verifyData.mobileSdkData;
                    var contactFields = ["name", "nickName", "id", "partyId", "account", "confirmAccount", "ifscCode", "bankName", "branchName", "branchAdd", "status", "accountType", "transferLimit", "beneficiaryType", "otpValue", "email", "phone", "creationDate", "coolingPeriod", "transaction", "credentialType"],
                        cleanContactData = cleanData(contactFields, self.currentContact),
                        xhrContactUpdate = self.contactDataModifyService.create({
                            data: self.currentContact
                        }),
                        contactCallback = function() {
                            self.contacts[self.index] = self.currentContact, self.contactDetailsData[self.index] = self.currentDetails, self.refreshModel(!0)
                        };
                    return "rsa" === isRSA ? xhrContactUpdate : (self.sendXhrRequest(xhrContactUpdate), self.sendXhrRequest(xhrContactUpdate, contactCallback))
                }, ContactsModel.prototype.deleteContact = function(t, e, n) {
                    var a, r = this;
                    r.currentContact.id;
                    return r.currentContact.status = "INACTIVE", a = r.updateContact(!0, t, e, n, "DeleteBeneficiary")
                }, ContactsModel.prototype.noContactsFound = function() {
                    var t = !this.loading && 0 === this.contacts.length;
                    return t
                }, ContactsModel.prototype.sendXhrRequest = function(t, e) {
                    var n = this;
                    return t.loading = !0, t.success(function(t) {
                        lpCoreUtils.isFunction(e) && e()
                    }), t.error(function(t) {
                        t.cd && idfcHandler.checkTimeout(t), n.error = {
                            message: t.statusText
                        }
                    }), t.finally(function() {
                        t.loading = !1
                    }), t
                }, ContactsModel.prototype.selectContact = function(t, e) {
                    var n = this;
                    t && !this.disableSelection && (this.contacts.length > 0 ? ("DeleteBeneficiary" === n.transactionName ? (n.contacts.length <= n.idx && (n.idx = n.contacts.length - 1), n.selected = n.contacts[n.idx].id, n.currentContact = n.contacts[n.idx]) : "EditBeneficiary" !== n.transactionName && (n.selected = t.id, n.currentContact = t, n.idx = n.contacts.indexOf(t)), n.loadContactDetails(n.currentContact.id, e)) : (this.currentContact = null, this.moduleState = "contactsNone"))
                }, ContactsModel.prototype.refreshModel = function(t) {
                    var e = this;
                    e.disableSelection = !1, t && "EditBeneficiary" !== e.transactionName ? e.loadContacts().success(function(n) {
                        e.currentContact && (e.selectContact(e.currentContact, t), e.moduleState = "contactsView")
                    }) : e.currentContact && (e.selectContact(e.currentContact, t), e.moduleState = "contactsView")
                }, ContactsModel.prototype.findByName = function(t) {
                    return lpCoreUtils.find(this.contacts, {
                        name: t
                    })
                }, ContactsModel
            }, exports.ContactsModel.$inject = ["$http", "orderByFilter", "httpService", "lpCoreUtils", "lpDefaultProfileImage"]
        }.call(exports, __webpack_require__, exports, module), !(void 0 !== __WEBPACK_AMD_DEFINE_RESULT__ && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
    }, function(t, exports) {
        t.exports = __WEBPACK_EXTERNAL_MODULE_6__
    }, function(t, exports) {
        t.exports = __WEBPACK_EXTERNAL_MODULE_7__
    }, function(t, exports) {
        t.exports = __WEBPACK_EXTERNAL_MODULE_8__
    }])
});
//# sourceMappingURL=main.js.map