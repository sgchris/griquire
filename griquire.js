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
			script.textContent = loadedScripts[scriptSrc].content;
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
	
	window.griquire = function(deps, callbackFn) {
		
		// check if there are scripts to load
		if (deps && deps.length > 0) {
			
			// load scripts' content
			loadScripts(deps, function() {
				
				// add scripts to the page
				embedScripts(deps);
				
				// call the callback
				if (typeof(callbackFn) == 'function') {
					callbackFn();
				}
			});
		} else {
			if (typeof(callbackFn) == 'function') {
				callbackFn();
			}
		}
	};
})();
