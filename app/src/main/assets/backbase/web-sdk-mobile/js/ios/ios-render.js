'use strict';

var cxpBridge = require('./cxp-bridge');
var javascriptDetectElementResize = require('javascript-detect-element-resize');
var cxpWebApis = require('cxp-web-apis');
var webviewKit = require('backbase-widget-engine/src/exports/webview-kit');
var ReplaceConfigVarsPlugin = require('backbase-widget-engine/src/plugins/replace-config-vars-plugin');
var BackbaseFormatPlugin = require('backbase-widget-engine/src/plugins/backbase-format-plugin');
var Q = require('q');

window.renderWidget = function(widget_root, localContext, remoteContext, widgetModel, features, logLevel, syncPreferences, portal){

    var root = document.getElementById(widget_root);

    //Promise polyfill
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

      if(this.buffer.length >= this.size) {
        this.buffer.shift();
      }

      this.buffer.push(rec);
    };

    /**
     * Flushes the buffer to a stream
     */
    BufferedLogStream.prototype.flush = function() {
      var rec;
      while(rec = this.buffer.shift()) {
        this.decoratedStreams.forEach(function(stream) {
          stream.write(rec);
        })
      }
    };

    /**
     * Clears the buffer
     */
    BufferedLogStream.prototype.clear = function() {
      this.buffer = [];
    };

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

        function padZeros(number, len) {
          return Array((len + 1) - (number + '').length).join('0') + number;
        }

        console[logMethod]('[' +
          padZeros(rec.time.getHours(), 2) +
          padZeros(rec.time.getMinutes(), 2) +
          padZeros(rec.time.getSeconds(), 2) +
          padZeros(rec.time.getMilliseconds(), 4) + '] ' +
          rec.levelName + ': ' + loggerName + ': ' + rec.msg);
    };

    //console stream for normal console logging
    var consoleStream =  new ConsolePlainStream();

    //buffered log stream allows a developer to replay the log by running bufferedLogStream.flush()
    var bufferedLogStream = new BufferedLogStream();
    bufferedLogStream.decorateStream(consoleStream);
    window.bufferedLogStream = bufferedLogStream;

    //log to native via an iframe bridge
    var iframeBridgeLogStream = {
      write: function(rec) {
        var iframe = document.createElement("IFRAME");
        iframe.setAttribute("src", "log://?type="+rec.levelName+"&msg=" + rec.msg + " (" + rec.time + ")");
        document.documentElement.appendChild(iframe);
        iframe.parentNode.removeChild(iframe);
        iframe = null;
      }
    };

    var configuration = cxpWebApis.createConfiguration({
      contextRoot: localContext,
      contextPath: localContext,
      remoteContextRoot: remoteContext,
      logStreams: [
        { level: logLevel, stream: iframeBridgeLogStream },
        { level: logLevel, stream: consoleStream },
        { level: logLevel, stream: bufferedLogStream }
      ]
    });

    configuration.set('itemEngineLocator', {
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

    var renderer = cxpWebApis.getRenderer(configuration);
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

    var page = document.getElementsByTagName("html")[0]; //the html could contain paddings/margins
    addResizeListener(page, function(){
      Cxp.resizeTo(page.scrollWidth, page.scrollHeight);
    });

    renderer.start(widgetModel, root)
    .then(function(details) {
      Cxp.loaded(details.time);
      Cxp.resizeTo(page.scrollWidth, page.scrollHeight);
      var message = 'CXPMobile Widget-Engine: Item tree rendered in ' + details.time + 'ms';
      console.log(message);
    })
    .fail(function(e) {
      console.log(e);
    });
};
