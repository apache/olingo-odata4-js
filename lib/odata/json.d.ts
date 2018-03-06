/** @module odata/json */

/** Infers the information describing the JSON payload from its metadata annotation, structure, and data model.
 * @param {Object} data - Json response payload object.
 * @param {Object} model - Object describing an OData conceptual schema.
 * If the arguments passed to the function don't convey enough information about the payload to determine without doubt that the payload is a feed then it
 * will try to use the payload object structure instead.  If the payload looks like a feed (has value property that is an array or non-primitive values) then
 * the function will report its kind as PAYLOADTYPE_FEED unless the inferFeedAsComplexType flag is set to true. This flag comes from the user request
 * and allows the user to control how the library behaves with an ambigous JSON payload.
 * @return Object with kind and type fields. Null if there is no metadata annotation or the payload info cannot be obtained..
 */
export function createPayloadInfo(data: Object, model: Object): Object;
export var jsonHandler: any;
/** Extend JSON OData payload with metadata
 * @param handler - This handler.
 * @param text - Payload text (this parser also handles pre-parsed objects).
 * @param {Object} context - Object with parsing context.
 * @return An object representation of the OData payload.
 */
declare function jsonParser(handler: any, text: any, context: Object): any;
/** Serializes a ODataJs payload structure to the wire format which can be send to the server
 * @param handler - This handler.
 * @param data - Data to serialize.
 * @param {Object} context - Object with serialization context.
 * @returns {String} The string representation of data.
 */
declare function jsonSerializer(handler: any, data: any, context: Object): string;
/** Parses the JSON Date representation into a Date object.
 * @param {String} value - String value.
 * @returns {Date} A Date object if the value matches one; falsy otherwise.
 */
declare function parseJsonDateString(value: string): Date;
