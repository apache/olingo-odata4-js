(function (window, undefined) {
        window.OData = window.datajs.V4.oData;
        window.temp = window.datajs.V4;
        window.temp.store = window.datajs.V4.store;
        window.temp.cache = window.datajs.V4.cache;
        window.datajs = window.temp;
        delete window.temp;
})(this);