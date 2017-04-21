 /** @module store */
 
import { DomStore } from "./store/dom";
import { IndexedDBStore } from "./store/indexeddb";
import { MemoryStore } from "./store/memory";

export var defaultStoreMechanism: string;

/** Creates a new store object.
 * @param {String} name - Store name.
 * @param {String} [mechanism] - 
 * @returns {Object} Store object.
*/
export function createStore(name: string, mechanism: string): Object;

export var mechanisms: {
    indexeddb: IndexedDBStore;
    dom: DomStore;
    memory: MemoryStore;
};
