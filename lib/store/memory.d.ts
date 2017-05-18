/** @module store/memory */

/** MemoryStore (see {@link MemoryStore}) */
export class MemoryStore {
    defaultError: (error: any) => void;
    /** Identifies the underlying mechanism used by the store.*/
    mechanism: string;
    name: string;

/** Constructor for store objects that use a sorted array as the underlying mechanism.
 * @class MemoryStore
 * @constructor
 * @param {String} name - Store name.
 */
    constructor(name: string);

/** Creates a store object that uses memory storage as its underlying mechanism.
 * @method MemoryStore.create
 * @param {String} name - Store name.
 * @returns {Object} Store object.
 */
    static create(name: string): MemoryStore;
/** Checks whether the underlying mechanism for this kind of store objects is supported by the browser.
 * @method MemoryStore.isSupported
 * @returns {Boolean} True if the mechanism is supported by the browser; otherwise false.
 */
    static isSupported(): boolean;
    /** This method errors out if the store already contains the specified key.
     * @summary Adds a new value identified by a key to the store.
     * @method module:store/memory~MemoryStore#add
     * @param {String} key - Key string.
     * @param value - Value that is going to be added to the store.
     * @param {Function} success - Callback for a successful add operation.
     * @param {Function} error - Callback for handling errors. If not specified then store.defaultError is invoked.
     */
    add(key: string, value: Object, success: (key: string, value: any) => void, error?: (error: any) => void): void;
    /** This method will overwrite the key's current value if it already exists in the store; otherwise it simply adds the new key and value.
     * @summary Adds or updates a value identified by a key to the store.
     * @method module:store/memory~MemoryStore#addOrUpdate
     * @param {String} key - Key string.
     * @param value - Value that is going to be added or updated to the store.
     * @param {Function} success - Callback for a successful add or update operation.
     * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
    */
    addOrUpdate(key: string, value: Object, success: (key: string, value: any) => void, error?: (error: any) => void): void;
    /** Removes all the data associated with this store object.
     * @method module:store/memory~MemoryStore#clear
     * @param {Function} success - Callback for a successful clear operation.
     */
    clear(success: () => void): void;
    /** This function does nothing in DomStore as it does not have a connection model
     * @method module:store/dom~DomStore#close
     */
    close(): void;
    /** Checks whether a key exists in the store.
     * @method module:store/memory~MemoryStore#contains
     * @param {String} key - Key string.
     * @param {Function} success - Callback indicating whether the store contains the key or not.
     */
    contains(key: string, success: (successful: boolean) => void, error?: (error: any) => void): void;

    /** Gets all the keys that exist in the store.
     * @method module:store/memory~MemoryStore#getAllKeys
     * @param {Function} success - Callback for a successful get operation.
     */
    getAllKeys(success: (keys: string[]) => void, error?: (error: any) => void): void;
    /** Reads the value associated to a key in the store.
     * @method module:store/memory~MemoryStore#read
     * @param {String} key - Key string.
     * @param {Function} success - Callback for a successful reads operation.
     * @param {Function} error - Callback for handling errors. If not specified then store.defaultError is invoked.
     */
    read(key: string, success: (key: string, value: any) => void, error?: (error: any) => void): void;
    /** Removes a key and its value from the store.
     * @method module:store/memory~MemoryStore#remove
     * @param {String} key - Key string.
     * @param {Function} success - Callback for a successful remove operation.
     * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
     */
    remove(key: string, success: () => void, error?: (error: any) => void): void;
    /** Updates the value associated to a key in the store.
     * @method module:store/memory~MemoryStore#update
     * @param {String} key - Key string.
     * @param value - New value.
     * @param {Function} success - Callback for a successful update operation.
     * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
     * This method errors out if the specified key is not found in the store.
     */
    update(key: string, value: Object, success: (key: string, value: any) => void, error?: (error: any) => void): void;
}