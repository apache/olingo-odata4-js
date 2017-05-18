/** @module odata/handler */

export interface ContentType {
    mediaType: string;
    properties: Object;
}

export interface Handler {
    accept: string;
    maxDataServiceVersion: string;
    read(response: any, context: any);
    write(request: any, context: any);
}

export var textHandler: Handler;
/** Parses a string into an object with media type and properties.
 * @param {String} str - String with media type to parse.
 * @return null if the string is empty; an object with 'mediaType' and a 'properties' dictionary otherwise.
 */
export function contentType(str: string): ContentType;
/** Serializes an object with media type and properties dictionary into a string.
 * @param {ContentType} contentType - Object with media type and properties dictionary to serialize.
 * @return String representation of the media type object; undefined if contentType is null or undefined.
 */
export function contentTypeToString(contentType: ContentType): string;
/** Creates a handler object for processing HTTP requests and responses.
 * @param {Function} parseCallback - Parser function that will process the response payload.
 * @param {Function} serializeCallback - Serializer function that will generate the request payload.
 * @param {String} accept - String containing a comma separated list of the mime types that this handler can work with.
 * @param {String} maxDataServiceVersion - String indicating the highest version of the protocol that this handler can work with.
 * @returns {Object} Handler object.
 */
export function handler(parseCallback: (handler: Handler, body: any, readContext: any) => any, serializeCallback: (handler: Handler, data: any, writeContext: any) => any, accept: string, maxDataServiceVersion: string): Handler;
/** Creates an object that is going to be used as the context for the handler's parser and serializer.
 * @param {ContentType} contentType - Object with media type and properties dictionary.
 * @param {String} dataServiceVersion - String indicating the version of the protocol to use.
 * @param context - Operation context.
 * @param handler - Handler object that is processing a request or response.
 * @return Context object.
 */
export function createReadWriteContext(contentType: ContentType, dataServiceVersion: string, context: any, handler: Handler): Object;
/** Sets a request header's value. If the header has already a value other than undefined, null or empty string, then this method does nothing.
 * @param request - Request object on which the header will be set.
 * @param {String} name - Header name.
 * @param {String} value - Header value.
 */
export function fixRequestHeader(request: any, name: string, value: string): void;
/** Gets the value of a request or response header.
 * @param requestOrResponse - Object representing a request or a response.
 * @param {String} name - Name of the header to retrieve.
 * @returns {String} String value of the header; undefined if the header cannot be found.
 */
export function getRequestOrResponseHeader(requestOrResponse: any, name: string): string;
/** Gets the value of the Content-Type header from a request or response.
 * @param requestOrResponse - Object representing a request or a response.
 * @returns {ContentType} Object with 'mediaType' and a 'properties' dictionary; null in case that the header is not found or doesn't have a value.
 */
export function getContentType(requestOrResponse: any): ContentType;
/** Gets the value of the DataServiceVersion header from a request or response.
 * @param requestOrResponse - Object representing a request or a response.
 * @returns {String} Data service version; undefined if the header cannot be found.
 */
export function getDataServiceVersion(requestOrResponse: any): string;
export var MAX_DATA_SERVICE_VERSION: string;
