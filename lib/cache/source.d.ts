/** @module cache/source */

export class ODataCacheSource {
    identifier: string;
    options: any;

    /** Creates a data cache source object for requesting data from an OData service.
     * @class ODataCacheSource
     * @param options - Options for the cache data source.
     * @returns {ODataCacheSource} A new data cache source instance.
     */
    constructor(options: any);

    /** Gets the number of items in the collection.
     * @method ODataCacheSource#count
     * @param {Function} success - Success callback with the item count.
     * @param {Function} error - Error callback.
     * @returns {Object} Request object with an abort method.
     */
    count(success: (number) => void, error: (any) => void): { abort: () => void };
    /** Gets a number of consecutive items from the collection.
     * @method ODataCacheSource#read
     * @param {Number} index - Zero-based index of the items to retrieve.
     * @param {Number} count - Number of items to retrieve.
     * @param {Function} success - Success callback with the requested items.
     * @param {Function} error - Error callback.
     * @returns {Object} Request object with an abort method.
    */
    read(index: number, count: number, success: (any) => void, error: (any) => void): { abort: () => void };
}
