/** @module odatajs/deferred */

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
export class DjsDeferred {
    _arguments: any[];
    _done: any[];
    _fail: any[];
    _resolved: boolean;
    _rejected: boolean;

    /** Adds success and error callbacks for this deferred object.
     * See Compatibility Note A.
     * @method DjsDeferred#then
     * @param {function} [fulfilledHandler] - Success callback ( may be null)
     * @param {function} [errorHandler] - Error callback ( may be null)
     */
    then(fulfilledHandler?: () => void, errorHandler?: (...args) => void): DjsDeferred;
    /** Invokes success callbacks for this deferred object.
 * All arguments are forwarded to success callbacks.
 * @method DjsDeferred#resolve
 */
    resolve(...args): void;
    /** Invokes error callbacks for this deferred object.
    * All arguments are forwarded to error callbacks.
    * @method DjsDeferred#reject
    */
    reject(...args): void;
    /** Returns a version of this object that has only the read-only methods available.
     * @method DjsDeferred#promise
     * @returns An object with only the promise object.
     */
    promise(): Object;
}

/** Creates a deferred object.
 * @returns {DjsDeferred} A new deferred object. If jQuery is installed, then a jQueryDeferred object is returned, which provides a superset of features.
*/
export function createDeferred(): DjsDeferred;
