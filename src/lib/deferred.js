/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
'use strict';

/** @module odatajs/deferred */



/** Creates a new function to forward a call.
 * @param {Object} thisValue - Value to use as the 'this' object.
 * @param {String} name - Name of function to forward to.
 * @param {Object} returnValue - Return value for the forward call (helps keep identity when chaining calls).
 * @returns {Function} A new function that will forward a call.
 */
function forwardCall(thisValue, name, returnValue) {
    return function () {
        thisValue[name].apply(thisValue, arguments);
        return returnValue;
    };
}

/** Initializes a new DjsDeferred object.
 * <ul>
 * <li> Compability Note A - Ordering of callbacks through chained 'then' invocations <br>
 *
 * The Wiki entry at http://wiki.commonjs.org/wiki/Promises/A
 * implies that .then() returns a distinct object.
 *
 * For compatibility with http://api.jquery.com/category/deferred-object/
 * we return this same object. This affects ordering, as
 * the jQuery version will fire callbacks in registration
 * order regardless of whether they occur on the result
 * or the original object.
 * </li>
 * <li>Compability Note B - Fulfillment value <br>
 *
 * The Wiki entry at http://wiki.commonjs.org/wiki/Promises/A
 * implies that the result of a success callback is the
 * fulfillment value of the object and is received by
 * other success callbacks that are chained.
 *
 * For compatibility with http://api.jquery.com/category/deferred-object/
 * we disregard this value instead.
 * </li></ul>
 * @class DjsDeferred 
 */
 function DjsDeferred() {
    this._arguments = undefined;
    this._done = undefined;
    this._fail = undefined;
    this._resolved = false;
    this._rejected = false;
}


DjsDeferred.prototype = {

    /** Adds success and error callbacks for this deferred object.
     * See Compatibility Note A.
     * @method DjsDeferred#then
     * @param {function} [fulfilledHandler] - Success callback ( may be null)
     * @param {function} [errorHandler] - Error callback ( may be null)
     */
    then: function (fulfilledHandler, errorHandler) {

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

    /** Invokes success callbacks for this deferred object.
     * All arguments are forwarded to success callbacks.
     * @method DjsDeferred#resolve
     */
    resolve: function (/* args */) {
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

    /** Invokes error callbacks for this deferred object.
     * All arguments are forwarded to error callbacks.
     * @method DjsDeferred#reject
     */
    reject: function (/* args */) {
        
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

    /** Returns a version of this object that has only the read-only methods available.
     * @method DjsDeferred#promise
     * @returns An object with only the promise object.
     */

    promise: function () {
        var result = {};
        result.then = forwardCall(this, "then", result);
        return result;
    }
};

/** Creates a deferred object.
 * @returns {DjsDeferred} A new deferred object. If jQuery is installed, then a jQueryDeferred object is returned, which provides a superset of features.
*/
function createDeferred() {
    if (window.jQuery && window.jQuery.Deferred) {
        return new window.jQuery.Deferred();
    } else {
        return new DjsDeferred();
    }
}




/** createDeferred (see {@link module:datajs/deferred~createDeferred}) */
exports.createDeferred = createDeferred;

/** DjsDeferred (see {@link DjsDeferred}) */
exports.DjsDeferred = DjsDeferred;