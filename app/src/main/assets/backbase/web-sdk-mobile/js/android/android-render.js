'use strict';

var javascriptDetectElementResize = require('javascript-detect-element-resize');
var cxpWebApis = require('cxp-web-apis');
var webviewKit = require('backbase-widget-engine/src/exports/webview-kit');
var ReplaceConfigVarsPlugin = require('backbase-widget-engine/src/plugins/replace-config-vars-plugin');
var BackbaseFormatPlugin = require('backbase-widget-engine/src/plugins/backbase-format-plugin');
var Q = require('q');

window.renderWidget = function(widget_root, localContext, remoteContext, widgetModel, features, logLevel, syncPreferences, portal){

    console.log("Log level set to "+logLevel);

    //Promise polyfill.
    window.Promise = window.Promise || Q.Promise;

     window.syncPreferences = {
          listeners: [],
          update: function(action, key, value) {
            this.listeners.forEach(function(listener) {
              listener.call(null, action, key, value);
            });
          },
          addListener: function(callback) {
            this.listeners.push(callback);
          }
        };

    var root = document.getElementById(widget_root);

    function ConsolePlainStream() {}
    ConsolePlainStream.prototype.write = function (rec) {

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

        console[logMethod](loggerName + ': ' + rec.msg);
    };

    var config = cxpWebApis.createConfiguration({
        contextRoot: localContext,
        remoteContextRoot: remoteContext,
        logStreams: [
            { level: logLevel, stream: new ConsolePlainStream() }
        ]
    });

    config.set('itemEngineLocator', {
        locate: function (itemModel, engineOpts) {

            var EngineType = itemModel.children ? webviewKit.ContainerEngine : webviewKit.WidgetEngine;
            var engine =  new EngineType({
                log: engineOpts.log
            });
            engine.init({
                widgetUrl: engineOpts.widgetUrl,
                widgetEl: engineOpts.widgetEl,
                initialModel: itemModel,
                configVars: { contextRoot: localContext }
            });
            return engine;
        }
    });

    function iceContentWorkaroundPlugin() {
        return {
            postRead: function(widgetModel) {
                var templatePref = widgetModel.preferences.filter(function(pref) {
                    return pref.name === 'templateUrl';
                })[0];
                if(templatePref) {
                    templatePref._ignoreReplace = true;
                }

                return widgetModel;
            }
        };
    }

    function addSupportToAccessChildren() {
      return {
        preRender: function (widgetInstance, widgetRenderer, widgetModel) {
          widgetInstance.children = widgetModel.children ? widgetModel.children.map(function (child) {
            return {
              id: child.id,
              name: child.name
            }
          }) : [];
          return widgetInstance;
        }
      };
    }

    var renderer = cxpWebApis.getRenderer(config);
    renderer.addPlugin(addSupportToAccessChildren());
    renderer.addPlugin(iceContentWorkaroundPlugin());
    renderer.addPlugin(new ReplaceConfigVarsPlugin({
        contextRoot: localContext,
        remoteContextRoot: remoteContext
    }));
    renderer.addPlugin(new BackbaseFormatPlugin({
        contextRoot: localContext,
        remoteContextRoot: remoteContext,
        portalConf: {
            contextItemName: portal
        },
        makeIncludedRefsAbsolute: true
    }));
    renderer.addPlugin({
      postRead: function(widgetModel) {
        // inject the "SyncedPreferences" into the model.
        features.forEach(function(obj){
          if(obj.name === 'SyncedPreferences'){
            widgetModel.features.push(obj);
          }
        });

        return widgetModel;
      },
      postRender: function(widgetInstance, widgetRenderer, widgetModel) {
        // workaround for small issue in widget-engine
        // this should be fixed in widget-engine, and then this can be removed
        if (widgetInstance.length == 3) {widgetInstance = widgetInstance[0];}

        // initialization with the given syncPreferences
        widgetModel.preferences.forEach(function (pref) {
          // update only if the preference is defined and not readonly.
          if (!pref.readonly && pref.name in syncPreferences) {
            if(syncPreferences[pref.name] === '__null__')
              syncPreferences[pref.name] = null;
            widgetInstance.preferences.setItem(pref.name, syncPreferences[pref.name]);
          }
        });

        // listening to changes in the preferences externally
        window.syncPreferences.addListener(function (action, key, value) {
          // only affect the preferences in the syncPreferences list
          if (widgetInstance.preferences.hasOwnProperty(key) && (key in syncPreferences)) {
            widgetInstance.preferences._eventsEnabled = false;
            try {
              if (action === 'setItem') {
                widgetInstance.preferences.setItem(key, value);
              } else if (action === 'removeItem') {
                widgetInstance.preferences.setItem(key, null);
              }
            } catch (e) { // it might be readonly.
              console.log(e);
            }
            widgetInstance.preferences._eventsEnabled = true;
          }
        });

        // broadcasting changes in the preferences
        widgetInstance.addEventListener('storage', function(ev) {
          if(ev.key in syncPreferences) {
            var value = ev.newValue;
            var feature = widgetInstance.features['SyncedPreferences'];
            if(feature){
              feature.setItem(ev.key, value);
            }
          }
        });
        return widgetInstance;
      }
    });


    for (var i=0; i < features.length; i++) {
        renderer.addFeature(features[i]);
    }
    renderer.start(widgetModel, root).then(function(details) {
        var message = 'Item tree rendered in ' + details.time + 'ms',
            resizeElement = document.getElementsByTagName("html")[0], //the html could contain paddings/margins
            resizeCallback = function() {
                Cxp.resize(resizeElement.scrollHeight);
            };
        addResizeListener(resizeElement, resizeCallback);
        console.log(message);
        Cxp.itemLoaded();
    }).fail(function(e) {
        console.log(e);
    });
};

