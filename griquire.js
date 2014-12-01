/**
 * load libraries asynchronuosly, but execute them one by one
 * griquire(['libs/jquery.min.js', 'libs/bootstrap.min.js'], function() {
 * 		//.. here jquery and bootstrap are already loaded
 * }); 
 */
(function() {
	// function(method, url, params, successFn, failureFn)
	var ajax=function(d,e,a,g,h){var b;if("undefined"!==typeof XMLHttpRequest)b=new XMLHttpRequest;else for(var c=["MSXML2.XmlHttp.5.0","MSXML2.XmlHttp.4.0","MSXML2.XmlHttp.3.0","MSXML2.XmlHttp.2.0","Microsoft.XmlHttp"],f=0,l=c.length;f<l;f++)try{b=new ActiveXObject(c[f]);break}catch(m){}c=[];if(a&&a instanceof Object&&0<Object.keys(a).length)for(var k in a)c.push(k+"="+encodeURIComponent(a[k]));c=c.join("&");d=d.toUpperCase();"POST"==d&&a&&0<Object.keys(a).length&&b.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	"GET"==d&&a&&0<Object.keys(a).length&&(a=e.indexOf("?"),e+=(0<a?"&":"?")+c);b.open(d,e,!0);b.onreadystatechange=function(){4==b.readyState&&(200<=b.status&&299>=b.status?"function"==typeof g&&g(b.responseText):"function"==typeof h&&h(b.responseText))};b.send(c)};
	
	var loadedScripts = {};



	var loadScript = function(scriptSrc, callbackFn) {
		
		// check if loaded before
		if (loadedScripts[scriptSrc] && loadedScripts[scriptSrc].content) {
			// call callback
			if (typeof(callbackFn) == 'function') {
				callbackFn();
			}
		} else {
			ajax('get', scriptSrc, {}, function(res) {
				
				// store locally
				loadedScripts[scriptSrc] = {
					content: res
				};
				
				// call callback
				if (typeof(callbackFn) == 'function') {
					callbackFn();
				}
				
			});
		}
	};
	

	var loadScripts = function(scriptSrcs, callbackFn) {
		var totalToLoad = scriptSrcs.length;
		
		scriptSrcs.forEach(function(scriptSrc) {
			loadScript(scriptSrc, function() {
				// when all the deps are loaded, call the callback
				if (--totalToLoad == 0) {
					if (typeof(callbackFn) == 'function') {
						callbackFn();
					}
				}
			});
		});
	};
	
	var embedScript = function(scriptSrc) {
		if (!loadedScripts[scriptSrc] || !loadedScripts[scriptSrc].content) {
			console.error(scriptSrc + ' has to be loaded before embedded');
			return;
		}
		
		// embed if not embedded before
		if (!loadedScripts[scriptSrc].loaded) {
			
			// add the script to the header
			var script = document.createElement('script');
			script.textContent = '/** '+scriptSrc+" (" +(new Date()).toISOString()+ ") **/\n"+loadedScripts[scriptSrc].content;
			document.getElementsByTagName('head')[0].appendChild(script);

			
			// mark that the script already loaded
			loadedScripts[scriptSrc].loaded = true;
		}
		
	};
	
	var embedScripts = function(scriptSrcs) {
		scriptSrcs.forEach(function(scriptSrc) {
			embedScript(scriptSrc);
		});
	};

	var queue = (function() {

		// the queue of the items to be processed
		var q = [];

		// prepare the item for the queue
		var getQObject = function(item) {
			if (typeof(item) == 'function') {
				return {
					action: 'execute',
					item: item
				};
			} else if (typeof(item) == 'string') {
				return {
					action: 'load',
					item: item
				};
			} else {
				return false;
			}
		}

		// q processor
		var processing = false;
		var process = function() {
			if (processing || q.length == 0) return;
			processing = true;

			var theItem = q.shift();

			if (theItem === false) {
				processing = false;
				process();
			} else if (theItem.action == 'load') {
				loadScript(theItem.item, function() {
					embedScript(theItem.item);

					processing = false;
					process();
				});
			} else if (theItem.action == 'execute') {
				theItem.item();

				processing = false;
				process();
			}
		};

		// the object itself
		var self = {
			append: function(items) {
				if (!(items instanceof Array)) {
					items = [items];
				}

				items.forEach(function(item) {
					q.push(getQObject(item));
				});

				process();
			},

			inject: function(items) {
				if (!(items instanceof Array)) {
					items = [items];
				}

				items.reverse().forEach(function(item) {
					q.unshift(getQObject(item));
				});

				process();
			}
		};

		return self;
	})();

	var executedCallbacks = {};
	
	window.griquire = function(deps, callbackFn) {
		
		// convert deps to array if it's string (when only one script requested)
		if (deps && typeof(deps) == 'string') {
			deps = [deps];
		}
		
		// check if there are scripts to load
		if (deps && deps.length > 0) {

			var operations = deps.slice(0);

			if (!executedCallbacks[deps.join(',')]) {
				operations.push(callbackFn);
				executedCallbacks[deps.join(',')] = true;
			}

			queue.inject(operations);
		} else {
			if (typeof(callbackFn) == 'function') {
				callbackFn();
			}
		}
	};
})();
