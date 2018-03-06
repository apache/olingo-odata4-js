/** @module store/indexeddb */

/** IndexedDBStore (see {@link IndexedDBStore}) */
export class IndexedDBStore {
    defaultError: (error: any) => void;
    /** Identifies the underlying mechanism used by the store.*/
    mechanism: string;
    name: string;

    /** Creates a new IndexedDBStore.
     * @class IndexedDBStore
     * @constructor
     * @param {String} name - The name of the store.
     * @returns {Object} The new IndexedDBStore.
     */
    constructor(name: string);

    /** Creates a new IndexedDBStore.
     * @method module:store/indexeddb~IndexedDBStore.create
     * @param {String} name - The name of the store.
     * @returns {Object} The new IndexedDBStore.
     */
    static create(name: string): IndexedDBStore;
    /** Returns whether IndexedDB is supported.
     * @method module:store/indexeddb~IndexedDBStore.isSupported
     * @returns {Boolean} True if IndexedDB is supported, false otherwise.
     */
    static isSupported(): boolean;
    /** Adds a key/value pair to the store
     * @method module:store/indexeddb~IndexedDBStore#add
     * @param {String} key - The key
     * @param {Object} value - The value
     * @param {Function} success - The success callback
     * @param {Function} error - The error callback
    */
    add(key: string, value: Object, success: (key: string, value: any) => void, error?: (error: any) => void): void;
    /** Adds or updates a key/value pair in the store
     * @method module:store/indexeddb~IndexedDBStore#addOrUpdate
     * @param {String} key - The key
     * @param {Object} value - The value
     * @param {Function} success - The success callback
     * @param {Function} error - The error callback
     */
    addOrUpdate(key: string, value: Object, success: (key: string, value: any) => void, error?: (error: any) => void): void;
    /** Clears the store
     * @method module:store/indexeddb~IndexedDBStore#clear
     * @param {Function} success - The success callback
     * @param {Function} error - The error callback
     */
    clear(success: () => void, error?: (error: any) => void): void;
    /** Closes the connection to the database
     * @method module:store/indexeddb~IndexedDBStore#close
    */
    close(): void;
    /** Returns whether the store contains a key
     * @method module:store/indexeddb~IndexedDBStore#contains
     * @param {String} key - The key
     * @param {Function} success - The success callback
     * @param {Function} error - The error callback
     */
    contains(key: string, success: (successful: boolean) => void, error?: (error: any) => void): void;

    /** Gets all the keys from the store
     * @method module:store/indexeddb~IndexedDBStore#getAllKeys
     * @param {Function} success - The success callback
     * @param {Function} error - The error callback
     */
    getAllKeys(success: (keys: string[]) => void, error?: (error: any) => void): void;
    /** Reads the value for the specified key
     * @method module:store/indexeddb~IndexedDBStore#read
     * @param {String} key - The key
     * @param {Function} success - The success callback
     * @param {Function} error - The error callback
     * If the key does not exist, the success handler will be called with value = undefined
     */
    read(key: string, success: (key: string, value: any) => void, error?: (error: any) => void): void;
    /** Removes the specified key from the store
     * @method module:store/indexeddb~IndexedDBStore#remove
     * @param {String} key - The key
     * @param {Function} success - The success callback
     * @param {Function} error - The error callback
     */
    remove(key: string, success: () => void, error?: (error: any) => void): void;
    /** Updates a key/value pair in the store
     * @method module:store/indexeddb~IndexedDBStore#update
     * @param {String} key - The key
     * @param {Object} value - The value
     * @param {Function} success - The success callback
     * @param {Function} error - The error callback
     */
    update(key: string, value: Object, success: (key: string, value: any) => void, error?: (error: any) => void): void;
}
