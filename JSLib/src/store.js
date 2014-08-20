// Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation 
// files (the "Software"), to deal  in the Software without restriction, including without limitation the rights  to use, copy,
// modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the 
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  IMPLIED, INCLUDING BUT NOT LIMITED TO THE
// WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
// ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// store.js 

(function (window, undefined) {
   
    var datajs = window.odatajs || {};

    var DomStore = odatajs.DomStore;
    var IndexedDBStore = odatajs.IndexedDBStore;
    var MemoryStore = odatajs.MemoryStore;

    // CONTENT START

    var mechanisms = {
        indexeddb: IndexedDBStore,
        dom: DomStore,
        memory: MemoryStore
    };

    odatajs.defaultStoreMechanism = "best";

    odatajs.createStore = function (name, mechanism) {
        /// <summary>Creates a new store object.</summary>
        /// <param name="name" type="String">Store name.</param>
        /// <param name="mechanism" type="String" optional="true">A specific mechanism to use (defaults to best, can be "best", "dom", "indexeddb", "webdb").</param>
        /// <returns type="Object">Store object.</returns>

        if (!mechanism) {
            mechanism = odatajs.defaultStoreMechanism;
        }

        if (mechanism === "best") {
            mechanism = (DomStore.isSupported()) ? "dom" : "memory";
        }

        var factory = mechanisms[mechanism];
        if (factory) {
            return factory.create(name);
        }

        throw { message: "Failed to create store", name: name, mechanism: mechanism };
    };

    // DATAJS INTERNAL START
    odatajs.mechanisms = mechanisms;
    // DATAJS INTERNAL END

    // CONTENT END
})(this);