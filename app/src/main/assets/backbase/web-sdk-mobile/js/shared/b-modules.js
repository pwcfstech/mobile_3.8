/**
 * Provides operations for publishing and subscribing to message channels.
 * @class
 */
b$.module("gadgets.pubsub", function() {

    var Class = b$.Class;

    /**
     * Class for the event buss.
     * @class
     * @private
     */
    var Channel = Class.extend(function() {
        this.callbacks = [];
    },{

        //queue of message
        queue: [],

        /**
         * Subscribes the callback to the channel.
         * @private
         */
        subscribe: function(callback) {
            this.callbacks.push(callback);
        },

        /**
         * Unsubscribes the callback from the channel.
         * @private
         */
        unsubscribe: function(callback) {
            if(!callback) {
                this.callbacks = [];
            }
            else {
                this.callbacks = this.callbacks.filter(function(fChannelCallback) {
                    return fChannelCallback != callback;
                });
            }
        },

        /**
         * Publishes message to the channel.
         * @private
         */
        publish: function(message, flush) {
            var self = this;
            if(flush) {
                this.flush();
            }

            this.callbacks.forEach(function(callback) {
                callback(message);
            });
        },

        /**
         * Clears the queue
         */
        flush: function() {
            this.queue = [];
        }
    });

    /**
     * Class for the event buss.
     * @class
     * @private
     */
    var EventBus = Class.extend(function() {
        this.channels = {};
    },{

        /**
         * Subscribes the callback to the channel.
         * @private
         * @method
         */
        subscribe: function(channelName, callback) {
            if (!this.channels[channelName]) {
                this.channels[channelName] = new Channel();
            }

            this.channels[channelName].subscribe(callback);

            Cxp.subscribe(channelName);
        },

        /**
         * Unsubscribes the callback from the channel.
         * @method
         * @private
         */
        unsubscribe: function(channelName, fCallback) {

            if (this.channels[channelName]) {
                this.channels[channelName].unsubscribe(fCallback);

                Cxp.unsubscribe(channelName);
            }
        },

        /**
         * Publishes message to the channel.
         * @private
         * @method
         */
        publish: function(channelName, oMessage, flush, eventType) {
            if (this.channels[channelName]) {
                this.channels[channelName].publish(oMessage, flush);
            }
            oMessage = oMessage || {};
            eventType = eventType || "";
            if(eventType !== "SYSTEM") {
                Cxp.publish(channelName, JSON.stringify(oMessage), eventType);
            }
        },

        /**
         * Flushes the message on a channel
         * @param channelName
         */
        flush: function(channelName) {
            if (this.channels[channelName]) {
                this.channels[channelName].flush();
            }
        }
    });

    var mainBus = new EventBus();

    /**
     * Publishes a string-type message to a channel.
     *
     * @param {String} channelName The name of the channel
     * @param {String} message The message to publish
     */
    function publish(channelName, message, flush, eventType) {
        if(typeof flush !== "boolean") {
            flush = true;
        }
        mainBus.publish(channelName, message, flush, eventType);
    }

    /**
     * Subscribes a widget to a message channel.
     *
     * @param {String} channelName The name of the channel
     * @param {Function} callback A function that will be called with the channel messages
     */
    function subscribe(channelName, callback) {
        mainBus.subscribe(channelName, callback);
    }

    /**
     * Unsubscribes the widget from a message channel.
     *
     * @param {String} channelName The name of the channel
     */
    function unsubscribe(channelName, callback) {
        mainBus.unsubscribe(channelName, callback);
    }

    function flush(channelName) {
        mainBus.flush(channelName);
    }

    this.publish = publish;
    this.subscribe = subscribe;
    this.unsubscribe = unsubscribe;
    this.flush = flush;
});
