(function(window) {
	"use strict";

	function addIframe(src) {
		var iframe = document.createElement("IFRAME");
		iframe.setAttribute("src", src);
		document.documentElement.appendChild(iframe);
		iframe.parentNode.removeChild(iframe);
		iframe = null;
	}

	function loaded(time) {
		addIframe("cxp-loaded://?time=" + time);
	}

	function reload() {
		addIframe("cxp-reload://");
	}

	function resizeTo(width, height) {
		addIframe("cxp-resize://?w=" + width + "&h=" + height);
	}
 
    function scrollTo(x, y) {
        addIframe("cxp-scroll://?x=" + x + "&y=" + y);
	}

	function publish(event, payload, eventType) {
		addIframe("cxp-publish://?event=" + encodeURIComponent(event) + "&type=" + encodeURIComponent(
			eventType) + "&payload=" + encodeURIComponent(payload));
	}

	function subscribe(event) {
		addIframe("cxp-subscribe://?event=" + encodeURIComponent(event));
	}

	function unsubscribe(event) {
		addIframe("cxp-unsubscribe://?event=" + encodeURIComponent(event));
	}

	function executeFeature() {
		if (arguments.length === 0) return;
		var args = [];
		Array.prototype.push.apply(args, arguments);

		var feature = args.shift();
		var method = args.shift();
		var params = args;
		for (var i = 0; i < params.length; i++){
			params[i] = encodeURIComponent(params[i]);
		}
		
		addIframe("cxp-feature://?feature=" + encodeURIComponent(feature) + "&method=" +
			encodeURIComponent(method) + "&params=" + params.join("&params="));
	}

	window.Cxp = {
		loaded: loaded,
		reload: reload,
		resizeTo: resizeTo,
        scrollTo: scrollTo,
		publish: publish,
		subscribe: subscribe,
		unsubscribe: unsubscribe,
		executeFeature: executeFeature
	};

})(window);