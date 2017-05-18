/** @module cache */

import { DjsDeferred } from './deferred';

export interface DataCacheOptions {
  pageSize: number;
  cacheSize: number;
  prefetchSize: number;
  name: string;
  source: string;
}

export interface DataCache {
  onIdle: any;
  stats: any;

  /** Counts the number of items in the collection.
  * @method DataCache#count
  * @returns {Object} A promise with the number of items.
  */
  count(): Object;

  /** Cancels all running operations and clears all local data associated with this cache.
   * New read requests made while a clear operation is in progress will not be canceled.
   * Instead they will be queued for execution once the operation is completed.
   * @method DataCache#clear
   * @returns {Object} A promise that has no value and can't be canceled.
   */
  clear(): Object;

  /** Filters the cache data based a predicate.
* Specifying a negative count value will yield all the items in the cache that satisfy the predicate.
* @method DataCache#filterForward
* @param {Number} index - The index of the item to start filtering forward from.
* @param {Number} count - Maximum number of items to include in the result.
* @param {Function} predicate - Callback function returning a boolean that determines whether an item should be included in the result or not.
* @returns {DjsDeferred} A promise for an array of results.
*/
  filterForward(index: number, count: number, predicate: () => boolean): DjsDeferred;
  /** Filters the cache data based a predicate.
   * Specifying a negative count value will yield all the items in the cache that satisfy the predicate.
   * @method DataCache#filterBack
   * @param {Number} index - The index of the item to start filtering backward from.
   * @param {Number} count - Maximum number of items to include in the result.
   * @param {Function} predicate - Callback function returning a boolean that determines whether an item should be included in the result or not.
   * @returns {DjsDeferred} A promise for an array of results.
   */
  filterBack(index: number, count: number, predicate: () => boolean): DjsDeferred;
  /** Reads a range of adjacent records.
* New read requests made while a clear operation is in progress will not be canceled.
* Instead they will be queued for execution once the operation is completed.
* @method DataCache#readRange
* @param {Number} index - Zero-based index of record range to read.
* @param {Number} count - Number of records in the range.
* @returns {DjsDeferred} A promise for an array of records; less records may be returned if the
* end of the collection is found.
*/
  readRange(index: number, count: number): DjsDeferred;
  /** Creates an Observable object that enumerates all the cache contents.
   * @method DataCache#ToObservable
   * @returns A new Observable object that enumerates all the cache contents.
   */
  ToObservable();
  /** Creates an Observable object that enumerates all the cache contents.
   * @method DataCache#toObservable
   * @returns A new Observable object that enumerates all the cache contents.
   */
  toObservable();
}
/** Estimates the size of an object in bytes.
 * Object trees are traversed recursively
 * @param {Object} object - Object to determine the size of.
 * @returns {Number} Estimated size of the object in bytes.
 */
export function estimateSize(object: Object): number;
/** Creates a data cache for a collection that is efficiently loaded on-demand.
 * @param options
 * Options for the data cache, including name, source, pageSize, TODO check doku
 * prefetchSize, cacheSize, storage mechanism, and initial prefetch and local-data handler.
 * @returns {DataCache} A new data cache instance.
 */
export function createDataCache(options: any): DataCache;
