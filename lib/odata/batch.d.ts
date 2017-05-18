/** @module odata/batch */

import { isBatch, normalizeHeaders, prepareRequest } from './odatautils';
import { Handler } from './handler';

export interface BatchHandler extends Handler {
    partHandler: Handler;
}

/** batchHandler (see {@link module:odata/batch~batchParser}) */
export var batchHandler: BatchHandler;
/** Serializes a batch object representation into text.
 * @param handler - This handler.
 * @param {Object} data - Representation of a batch.
 * @param {Object} context - Object with parsing context.
 * @return An text representation of the batch object; undefined if not applicable.#
 */
export function batchSerializer(handler: Handler, data: Object, context: Object): string;
/** Serializes a request object to a string.
 * @param request - Request object to serialize
 * @returns {String} String representing the serialized request
 */
export function writeRequest(request: any): string;