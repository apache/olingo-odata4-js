/* {
    oldname:'deferred.js',
    updated:'20140514 12:59'
}*/
/// <reference path="odata-utils.js" />

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

// deferred.js


// CONTENT START

var forwardCall = function (thisValue, name, returnValue) {
    /// <summary>Creates a new function to forward a call.</summary>
    /// <param name="thisValue" type="Object">Value to use as the 'this' object.</param>
    /// <param name="name" type="String">Name of function to forward to.</param>
    /// <param name="returnValue" type="Object">Return value for the forward call (helps keep identity when chaining calls).</param>
    /// <returns type="Function">A new function that will forward a call.</returns>

    return function () {
        thisValue[name].apply(thisValue, arguments);
        return returnValue;
    };
};

var DjsDeferred = function () {
    /// <summary>Initializes a new DjsDeferred object.</summary>
    /// <remarks>
    /// Compability Note A - Ordering of callbacks through chained 'then' invocations
    ///
    /// The Wiki entry at http://wiki.commonjs.org/wiki/Promises/A
    /// implies that .then() returns a distinct object.
    ////
    /// For compatibility with http://api.jquery.com/category/deferred-object/
    /// we return this same object. This affects ordering, as
    /// the jQuery version will fire callbacks in registration
    /// order regardless of whether they occur on the result
    /// or the original object.
    ///
    /// Compability Note B - Fulfillment value
    ///
    /// The Wiki entry at http://wiki.commonjs.org/wiki/Promises/A
    /// implies that the result of a success callback is the
    /// fulfillment value of the object and is received by
    /// other success callbacks that are chained.
    ///
    /// For compatibility with http://api.jquery.com/category/deferred-object/
    /// we disregard this value instead.
    /// </remarks>

    this._arguments = undefined;
    this._done = undefined;
    this._fail = undefined;
    this._resolved = false;
    this._rejected = false;
};

DjsDeferred.prototype = {
    then: function (fulfilledHandler, errorHandler /*, progressHandler */) {
        /// <summary>Adds success and error callbacks for this deferred object.</summary>
        /// <param name="fulfilledHandler" type="Function" mayBeNull="true" optional="true">Success callback.</param>
        /// <param name="errorHandler" type="Function" mayBeNull="true" optional="true">Error callback.</param>
        /// <remarks>See Compatibility Note A.</remarks>

        if (fulfilledHandler) {
            if (!this._done) {
                this._done = [fulfilledHandler];
            } else {
                this._done.push(fulfilledHandler);
            }
        }

        if (errorHandler) {
            if (!this._fail) {
                this._fail = [errorHandler];
            } else {
                this._fail.push(errorHandler);
            }
        }

        //// See Compatibility Note A in the DjsDeferred constructor.
        //// if (!this._next) {
        ////    this._next = createDeferred();
        //// }
        //// return this._next.promise();

        if (this._resolved) {
            this.resolve.apply(this, this._arguments);
        } else if (this._rejected) {
            this.reject.apply(this, this._arguments);
        }

        return this;
    },

    resolve: function (/* args */) {
        /// <summary>Invokes success callbacks for this deferred object.</summary>
        /// <remarks>All arguments are forwarded to success callbacks.</remarks>


        if (this._done) {
            var i, len;
            for (i = 0, len = this._done.length; i < len; i++) {
                //// See Compability Note B - Fulfillment value.
                //// var nextValue =
                this._done[i].apply(null, arguments);
            }

            //// See Compatibility Note A in the DjsDeferred constructor.
            //// this._next.resolve(nextValue);
            //// delete this._next;

            this._done = undefined;
            this._resolved = false;
            this._arguments = undefined;
        } else {
            this._resolved = true;
            this._arguments = arguments;
        }
    },

    reject: function (/* args */) {
        /// <summary>Invokes error callbacks for this deferred object.</summary>
        /// <remarks>All arguments are forwarded to error callbacks.</remarks>
        if (this._fail) {
            var i, len;
            for (i = 0, len = this._fail.length; i < len; i++) {
                this._fail[i].apply(null, arguments);
            }

            this._fail = undefined;
            this._rejected = false;
            this._arguments = undefined;
        } else {
            this._rejected = true;
            this._arguments = arguments;
        }
    },

    promise: function () {
        /// <summary>Returns a version of this object that has only the read-only methods available.</summary>
        /// <returns>An object with only the promise object.</returns>

        var result = {};
        result.then = forwardCall(this, "then", result);
        return result;
    }
};

var createDeferred = function () {
    /// <summary>Creates a deferred object.</summary>
    /// <returns type="DjsDeferred">
    /// A new deferred object. If jQuery is installed, then a jQuery
    /// Deferred object is returned, which provides a superset of features.
    /// </returns>

    if (window.jQuery && window.jQuery.Deferred) {
        return new window.jQuery.Deferred();
    } else {
        return new DjsDeferred();
    }
};

// DATAJS INTERNAL START
//window.datajs.createDeferred = createDeferred;
//window.datajs.DjsDeferred = DjsDeferred;
exports.createDeferred = createDeferred;
exports.DjsDeferred = DjsDeferred;
// DATAJS INTERNAL END
