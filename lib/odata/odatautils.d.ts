/** @module odata/utils */

/** Gets the type name of a data item value that belongs to a feed, an entry, a complex type property, or a collection property
 * @param {string} value - Value of the data item from which the type name is going to be retrieved.
 * @param {object} [metadata] - Object containing metadata about the data item.
 * @returns {string} Data item type name; null if the type name cannot be found within the value or the metadata
 * This function will first try to get the type name from the data item's value itself if it is an object with a __metadata property; otherwise
 * it will try to recover it from the metadata.  If both attempts fail, it will return null.
 */
export var dataItemTypeName: (value: string, metadata?: any) => string;
export var EDM_BINARY: string;
export var EDM_BOOLEAN: string;
export var EDM_BYTE: string;
export var EDM_DATE: string;
export var EDM_DATETIMEOFFSET: string;
export var EDM_DURATION: string;
export var EDM_DECIMAL: string;
export var EDM_DOUBLE: string;
export var EDM_GEOGRAPHY: string;
export var EDM_GEOGRAPHY_POINT: string;
export var EDM_GEOGRAPHY_LINESTRING: string;
export var EDM_GEOGRAPHY_POLYGON: string;
export var EDM_GEOGRAPHY_COLLECTION: string;
export var EDM_GEOGRAPHY_MULTIPOLYGON: string;
export var EDM_GEOGRAPHY_MULTILINESTRING: string;
export var EDM_GEOGRAPHY_MULTIPOINT: string;
export var EDM_GEOMETRY: string;
export var EDM_GEOMETRY_POINT: string;
export var EDM_GEOMETRY_LINESTRING: string;
export var EDM_GEOMETRY_POLYGON: string;
export var EDM_GEOMETRY_COLLECTION: string;
export var EDM_GEOMETRY_MULTIPOLYGON: string;
export var EDM_GEOMETRY_MULTILINESTRING: string;
export var EDM_GEOMETRY_MULTIPOINT: string;
export var EDM_GUID: string;
export var EDM_INT16: string;
export var EDM_INT32: string;
export var EDM_INT64: string;
export var EDM_SBYTE: string;
export var EDM_SINGLE: string;
export var EDM_STRING: string;
export var EDM_TIMEOFDAY: string;
export var GEOJSON_POINT: string;
export var GEOJSON_LINESTRING: string;
export var GEOJSON_POLYGON: string;
export var GEOJSON_MULTIPOINT: string;
export var GEOJSON_MULTILINESTRING: string;
export var GEOJSON_MULTIPOLYGON: string;
export var GEOJSON_GEOMETRYCOLLECTION: string;

/** Invokes a function once per schema in metadata.
 * @param metadata - Metadata store; one of edmx, schema, or an array of any of them.
 * @param {Function} callback - Callback function to invoke once per schema.
 * @returns The first truthy value to be returned from the callback; null or the last falsy value otherwise.
 */
export function forEachSchema(metadata: any, callback: (any) => any): any;

export function formatDateTimeOffsetJSON(value: Date): string;
/** Formats a DateTime or DateTimeOffset value a string.
 * @param {Date} value - Value to format
 * @returns {String} Formatted text.
 * If the value is already as string it's returned as-is
´*/
export function formatDateTimeOffset(value: any): string;
/** Converts a duration to a string in xsd:duration format.
 * @param {Object} value - Object with ms and __edmType properties.
 * @returns {String} String representation of the time object in xsd:duration format.
 */
export function formatDuration(value: any): string;
/** Formats the specified value to the given width.
 * @param {Number} value - Number to format (non-negative).
 * @param {Number} width - Minimum width for number.
 * @param {Boolean} append - Flag indicating if the value is padded at the beginning (false) or at the end (true).
 * @returns {String} Text representation.
 */
export function formatNumberWidth(value: number, width: number, append: boolean): string;
/** Gets the canonical timezone representation.
 * @param {String} timezone - Timezone representation.
 * @returns {String} An 'Z' string if the timezone is absent or 0; the timezone otherwise.
 */
export function getCanonicalTimezone(timezone: string): string;
/** Gets the type of a collection type name.
 * @param {String} typeName - Type name of the collection.
 * @returns {String} Type of the collection; null if the type name is not a collection type.
 */
export function getCollectionType(typeName: string): string;
/** Sends a request containing OData payload to a server.
* @param request - Object that represents the request to be sent..
* @param success - Callback for a successful read operation.
* @param error - Callback for handling errors.
* @param handler - Handler for data serialization.
* @param httpClient - HTTP client layer.
* @param context - Context used for processing the request
*/
export function invokeRequest(request: any, success: any, error: any, handler: any, httpClient: any, context: any): any;
/** Tests whether a value is a batch object in the library's internal representation.
 * @param value - Value to test.
 * @returns {Boolean} True is the value is a batch object; false otherwise.
 */
export function isBatch(value: any): boolean;
/** Tests whether a value is a collection value in the library's internal representation.
 * @param value - Value to test.
 * @param {String} typeName - Type name of the value. This is used to disambiguate from a collection property value.
 * @returns {Boolean} True is the value is a feed value; false otherwise.
 */
export function isCollection(value: any, typeName: string): boolean;
/** Checks whether the specified type name is a collection type.
 * @param {String} typeName - Name of type to check.
 * @returns {Boolean} True if the type is the name of a collection type; false otherwise.
 */
export function isCollectionType(typeName: string): boolean;
/** Tests whether a value is a complex type value in the library's internal representation.
 * @param value - Value to test.
 * @returns {Boolean} True is the value is a complex type value; false otherwise.
 */
export function isComplex(value: any): boolean;
/** Checks whether a Date object is DateTimeOffset value
 * @param {Date} value - Value to check
 * @returns {Boolean} true if the value is a DateTimeOffset, false otherwise.
 */
export function isDateTimeOffset(value: any): boolean;
/** Tests whether a value is a deferred navigation property in the library's internal representation.
 * @param value - Value to test.
 * @returns {Boolean} True is the value is a deferred navigation property; false otherwise.
 */
export function isDeferred(value: any): boolean;
/** Tests whether a value is an entry object in the library's internal representation.
 * @param value - Value to test.
 * @returns {Boolean} True is the value is an entry object; false otherwise.
 */
export function isEntry(value: any): boolean;
/** Tests whether a value is a feed value in the library's internal representation.
 * @param value - Value to test.
 * @param {String} typeName - Type name of the value. This is used to disambiguate from a collection property value.
 * @returns {Boolean} True is the value is a feed value; false otherwise.
 */
export function isFeed(value: any, typeName: string): boolean;
/** Checks whether the specified type name is a geography EDM type.
 * @param {String} typeName - Name of type to check.
 * @returns {Boolean} True if the type is a geography EDM type; false otherwise.
 */
export function isGeographyEdmType(typeName: string): boolean;
/** Checks whether the specified type name is a geometry EDM type.
 * @param {String} typeName - Name of type to check.
 * @returns {Boolean} True if the type is a geometry EDM type; false otherwise.
 */
export function isGeometryEdmType(typeName: string): boolean;
/** Tests whether a value is a named stream value in the library's internal representation.
 * @param value - Value to test.
 * @returns {Boolean} True is the value is a named stream; false otherwise.
 */
export function isNamedStream(value: any): boolean;
/** Tests whether a value is a primitive type value in the library's internal representation.
 * @param value - Value to test.
 * @returns {Boolean} True is the value is a primitive type value.
 * Date objects are considered primitive types by the library.
 */
export function isPrimitive(value: any): boolean;
/** Checks whether the specified type name is a primitive EDM type.
 * @param {String} typeName - Name of type to check.
 * @returns {Boolean} True if the type is a primitive EDM type; false otherwise.
 */
export function isPrimitiveEdmType(typeName: string): boolean;
/** Looks up a complex type object by name.
 * @param {String} name - Name, possibly null or empty.
 * @param metadata - Metadata store; one of edmx, schema, or an array of any of them.
 * @returns A complex type description if the name is found; null otherwise.
 */
export function lookupComplexType(name: string, metadata: any): any;
/** Looks up an
 * @param metadata - Metadata store; one of edmx, schema, or an array of any of them.
 * @returns An entity container description if the name is found; null otherwise.
 */
export function lookupDefaultEntityContainer(metadata: any): any;
/** Looks up an entity container object by name.
 * @param {String} name - Name, possibly null or empty.
 * @param metadata - Metadata store; one of edmx, schema, or an array of any of them.
 * @returns An entity container description if the name is found; null otherwise.
 */
export function lookupEntityContainer(name: string, metadata: any): any;
/** Looks up a entity set by name.
 * @param {Array} entitySets - Array of entity set objects as per EDM metadata( may be null)
 * @param {String} name - Name to look for.
 * @returns {Object} The entity set object; null if not found.
 */
export function lookupEntitySet(entitySets: any[], name: string): any;
/** Looks up a entity set by name.
 * @param {Array} singletons - Array of entity set objects as per EDM metadata (may be null)
 * @param {String} name - Name to look for.
 * @returns {Object} The entity set object; null if not found.
 */
export function lookupSingleton(singletons: any[], name: string): any;
/** Looks up an entity type object by name.
 * @param {String} name - Name, possibly null or empty.
 * @param metadata - Metadata store; one of edmx, schema, or an array of any of them.
 * @returns An entity type description if the name is found; null otherwise.
 */
export function lookupEntityType(name: string, metadata: any): any;
/** Looks up a function import by name.
 * @param {Array} functionImports - Array of function import objects as per EDM metadata (May be null)
 * @param {String} name - Name to look for.
 * @returns {Object} The entity set object; null if not found.
 */
export function lookupFunctionImport(functionImports: any[], name: string): any;
/** Looks up the target entity type for a navigation property.
 * @param {Object} navigationProperty -
 * @param {Object} metadata -
 * @returns {String} The entity type name for the specified property, null if not found.
 */
export function lookupNavigationPropertyType(navigationProperty: any, metadata: any): string;
/** Looks up the target entityset name for a navigation property.
 * @param {Object} navigationProperty -
 * @param {Object} sourceEntitySetName -
 * @param {Object} metadata -
 * metadata
 * @returns {String} The entityset name for the specified property, null if not found.
 */
export function lookupNavigationPropertyEntitySet(navigationProperty: any, sourceEntitySetName: string, metadata: any): string;
/** Looks up a schema object by name.
 * @param {String} name - Name (assigned).
 * @param schema - Schema object as per EDM metadata.
 * @param {String} kind - Kind of object to look for as per EDM metadata.
 * @returns An entity type description if the name is found; null otherwise.
 */
export function lookupInSchema(name: string, schema: any, kind: string): any;
/** Looks up a property by name.
 * @param {Array} properties - Array of property objects as per EDM metadata (may be null)
 * @param {String} name - Name to look for.
 * @returns {Object} The property object; null if not found.
 */
export function lookupProperty(properties: any[], name: string): any;
/** Looks up a type object by name.
 * @param {String} name - Name, possibly null or empty.
 * @param metadata - Metadata store; one of edmx, schema, or an array of any of them.
 * @param {String} kind - Kind of object to look for as per EDM metadata.
 * @returns An type description if the name is found; null otherwise
 */
export function lookupInMetadata(name: string, metadata: any, kind: string): any;
/** Gets the entitySet info, container name and functionImports for an entitySet
 * @param {Object} entitySetName -
 * @param {Object} metadata -
 * @returns {Object} The info about the entitySet.
 */
export function getEntitySetInfo(entitySetName: string, metadata: any): any;
/** Compares to version strings and returns the higher one.
 * @param {String} left - Version string in the form "major.minor.rev"
 * @param {String} right - Version string in the form "major.minor.rev"
 * @returns {String} The higher version string.
 */
export function maxVersion(left: string, right: string): string;
/** Gets the kind of a navigation property value.
 * @param value - Value of the navigation property.
 * @param {Object} [propertyModel] - Object that describes the navigation property in an OData conceptual schema.
 * @returns {String} String value describing the kind of the navigation property; null if the kind cannot be determined.
 */
export function navigationPropertyKind(value: any, propertyModel?: any): "deferred" | "entry" | "feed";
/** Normalizes headers so they can be found with consistent casing.
 * @param {Object} headers - Dictionary of name/value pairs.
 */
export function normalizeHeaders(headers: any): void;
/** Parses a string into a boolean value.
 * @param propertyValue - Value to parse.
 * @returns {Boolean} true if the property value is 'true'; false otherwise.
 */
export function parseBool(propertyValue: any): boolean;

/** Parses a string into a Date object.
 * @param {String} propertyValue - Value to parse.
 * @param {Boolean} nullOnError - return null instead of throwing an exception
 * @returns {Date} The parsed with year, month, day set, time values are set to 0
 */
export function parseDate(propertyValue: string, nullOnError: boolean): Date;
/** Parses a string into a DateTimeOffset value.
 * @param {String} propertyValue - Value to parse.
 * @param {Boolean} nullOnError - return null instead of throwing an exception
 * @returns {Date} The parsed value.
 * The resulting object is annotated with an __edmType property and
 * an __offset property reflecting the original intended offset of
 * the value. The time is adjusted for UTC time, as the current
 * timezone-aware Date APIs will only work with the local timezone.
 */
export function parseDateTimeOffset(propertyValue: string, nullOnError: boolean): Date;
/** Parses a string in xsd:duration format.
 * @param {String} duration - Duration value.

 * This method will throw an exception if the input string has a year or a month component.

 * @returns {Object} Object representing the time
 */
export function parseDuration(duration: string): {
    ms: string;
    __edmType: string;
};
/** Parses a time into a Date object.
 * @param propertyValue
 * @param {Boolean} nullOnError - return null instead of throwing an exception
 * @returns {{h: Number, m: Number, s: Number, ms: Number}}
 */
export function parseTimeOfDay(propertyValue: any, nullOnError: boolean): {
    'h': number;
    'm': number;
    's': number;
    'ms': number;
};

export var parseInt;
/** Prepares a request object so that it can be sent through the network.
* @param request - Object that represents the request to be sent.
* @param handler - Handler for data serialization
* @param context - Context used for preparing the request
*/
export function prepareRequest(request: any, handler: any, context: any): void;
/** Given an expected namespace prefix, removes it from a full name.
 * @param {String} ns - Expected namespace.
 * @param {String} fullName - Full name in 'ns'.'name' form.
 * @returns {String} The local name, null if it isn't found in the expected namespace.
 */
export function removeNamespace(ns: string, fullName: string): string;
/** Traverses a tree of objects invoking callback for every value.
 * @param {Object} item - Object or array to traverse.
 * @param {Function} callback - Callback function with key and value, similar to JSON.parse reviver.
 * @returns {Object} The traversed object.
 * Unlike the JSON reviver, this won't delete null members.
*/
export function traverse(item: any, callback: (string, any) => any): any;
