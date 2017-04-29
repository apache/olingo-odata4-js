/** @module odata */

import * as utils from './odata/odatautils';
import * as handler from './odata/handler';
import * as metadata from './odata/metadata';
import * as net from './odata/net';
import * as json from './odata/json';
import * as batch from './odata/batch';

import { Handler } from './odata/handler';
import { assigned, defined, throwErrorCallback } from './utils';

export { utils, handler, metadata, net, json, batch };

/** Default success handler for OData.
 * @param data - Data to process.
 */
export function defaultSuccess(data: any): void;
export var defaultError: (error: Object) => void;
export var defaultHandler: Handler;
export var defaultMetadata: any[];
/** Reads data from the specified URL.
 * @param urlOrRequest - URL to read data from.
 * @param {Function} [success] - 
 * @param {Function} [error] - 
 * @param {Object} [handler] - 
 * @param {Object} [httpClient] - 
 * @param {Object} [metadata] - 
 */
export function read(urlOrRequest: any, success?: (data: any, response: any) => void, error?: (error: Object) => void, handler?: Handler, httpClient?: Object, metadata?: Object): any;
/** Sends a request containing OData payload to a server.
 * @param {Object} request - Object that represents the request to be sent.
 * @param {Function} [success] - 
 * @param {Function} [error] - 
 * @param {Object} [handler] - 
 * @param {Object} [httpClient] - 
 * @param {Object} [metadata] - 
 */
export function request(request: Object, success?: (data: any, response: any) => void, error?: (error: Object) => void, handler?: Handler, httpClient?: Object, metadata?: Object): any;
/** Parses the csdl metadata to ODataJS metatdata format. This method can be used when the metadata is retrieved using something other than odatajs
 * @param {string} csdlMetadataDocument - A string that represents the entire csdl metadata.
 * @returns {Object} An object that has the representation of the metadata in odatajs format.
 */
export function parseMetadata(csdlMetadataDocument: string): Object;

export var metadataHandler: any;
export var jsonHandler: any;
