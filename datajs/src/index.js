

window.datajs = require('./lib/datajs.js');
window.OData = require('./lib/odata.js');


extend(window.OData, require('./lib/store.js'));
extend(window.OData, require('./lib/cache.js'));



function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}


