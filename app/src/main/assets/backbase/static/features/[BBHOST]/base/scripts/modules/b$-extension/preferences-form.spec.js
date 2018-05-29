/*global expect, beforeEach, describe, require, jasmine, it */

/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : preferences-form.spec.js
 *  Description:
 *  ----------------------------------------------------------------
 */
'use strict';

var mkPreferencesForm = require('./preferences-form');

describe('Preferences Form', function() {
    beforeEach(function() {
        this.chromes = undefined;

        this.portalModel = jasmine.createSpyObj('portal', ['filterPreferences']);
        this.portalModel.filterPreferences.and.callFake(function(prefs) {
            return prefs.returnValue;
        });
        this.portal = {
            portalModel: this.portalModel
        };

        this.mkEvent = function (prefs) {
            return {detail: {context: {model: {preferences: {array: { returnValue: prefs }}}}}};
        };
    });

    describe('instance', function() {
        beforeEach(function() {
            this.form = mkPreferencesForm(this.chromes, this.portal);
        });

        it('should be an object', function() {
            expect(this.form).toBeObject();
        });

        it('should have properties', function() {
            expect(this.form.handlers).toBeObject();
        });
    });

    describe('preferences-form handler', function() {
        it('should be a function', function() {
            var form = mkPreferencesForm(this.chromes, this.portal);
            var handler = form.handlers['preferences-form'];
            expect(handler).toBeFunction();
        });

        describe('when it is triggered', function() {
            it('should attach the custom preferences to the event', function() {
                var form = mkPreferencesForm(this.chromes, this.portal);

                var prefs = [{}];
                var ev = this.mkEvent(prefs);

                form.handlers['preferences-form'](ev);
                expect(ev.detail.customPrefsModel).toBe(prefs);
            });

            describe('when the preferences is for widget chrome with no options', function() {
                beforeEach(function() {
                    this.chromes = ['chrome1', 'chrome2'];
                });
                it('should set the inputType options', function() {
                    var form = mkPreferencesForm(this.chromes, this.portal);
                    var prefs = [{name: 'widgetChrome', inputType: {options: []}}];
                    var ev = this.mkEvent(prefs);

                    form.handlers['preferences-form'](ev);

                    expect(ev.detail.customPrefsModel[0].inputType.name).toEqual('select-one');
                    expect(ev.detail.customPrefsModel[0].inputType.options).toEqual(this.chromes);
                });
            });

        });

    });
});
