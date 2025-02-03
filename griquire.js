(function () {
    var loadedScripts = {};

    function loadScript(scriptSrc) {
        if (loadedScripts[scriptSrc]) {
            return loadedScripts[scriptSrc]; // Return existing promise
        }

        loadedScripts[scriptSrc] = new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", scriptSrc, true);
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    loadedScripts[scriptSrc] = xhr.responseText;
                    resolve(xhr.responseText);
                } else {
                    reject(`Failed to load ${scriptSrc}`);
                }
            };
            xhr.onerror = () => reject(`Network error while loading ${scriptSrc}`);
            xhr.send();
        });

        return loadedScripts[scriptSrc];
    }

    function executeScript(scriptContent) {
        var script = document.createElement("script");
        script.textContent = scriptContent;
        document.head.appendChild(script);
    }

    window.griquire = function (scriptSrcs, callbackFn) {
        if (typeof scriptSrcs === "string") {
            scriptSrcs = [scriptSrcs];
        }

        Promise.all(scriptSrcs.map(loadScript))
            .then((scripts) => {
                scripts.forEach(executeScript); // Execute in order
                if (typeof callbackFn === "function") {
                    callbackFn();
                }
            })
            .catch(console.error);
    };
})();
