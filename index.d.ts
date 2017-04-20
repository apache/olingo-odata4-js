export as namespace odatajs;

export var version: {
    major: number;
    minor: number;
    build: number;
};

export namespace cache {
    import DjsDeferred = deferred.DjsDeferred;

    export interface DataCacheOptions {
        pageSize: number;
        cacheSize: number;
        prefetchSize: number;
        name: string;
        source: string;
    }

    export interface DataCache {
        onidle: any;
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
    export function createDataCache(options: DataCacheOptions): DataCache;
}

export namespace deferred {
    export class DjsDeferred {
        _arguments: any[];
        _done: any[];
        _fail: any[];
        _resolved: boolean;
        _rejected: boolean;

        /** Adds success and error callbacks for this deferred object.
         * See Compatibility Note A.
         * @method DjsDeferred#then
         * @param {function} [fulfilledHandler] - Success callback ( may be null)
         * @param {function} [errorHandler] - Error callback ( may be null)
         */
        then(fulfilledHandler?: () => void, errorHandler?: (...args) => void): DjsDeferred;
        /** Invokes success callbacks for this deferred object.
     * All arguments are forwarded to success callbacks.
     * @method DjsDeferred#resolve
     */
        resolve(...args): void;
        /** Invokes error callbacks for this deferred object.
        * All arguments are forwarded to error callbacks.
        * @method DjsDeferred#reject
        */
        reject(...args): void;
        /** Returns a version of this object that has only the read-only methods available.
         * @method DjsDeferred#promise
         * @returns An object with only the promise object.
         */
        promise(): Object;
    }

    /** Creates a deferred object.
     * @returns {DjsDeferred} A new deferred object. If jQuery is installed, then a jQueryDeferred object is returned, which provides a superset of features.
    */
    export function createDeferred(): DjsDeferred;
}

export namespace oData {
    import Handler = handler.Handler;

    export namespace batch {

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
    }

    export namespace handler {
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
         * @param handler - Handler object that is processing a resquest or response.
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
    }

    export namespace json {
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
        export function jsonParser(handler: any, text: any, context: Object): any;
        /** Serializes a ODataJs payload structure to the wire format which can be send to the server
         * @param handler - This handler.
         * @param data - Data to serialize.
         * @param {Object} context - Object with serialization context.
         * @returns {String} The string representation of data.
         */
        export function jsonSerializer(handler: any, data: any, context: Object): string;
        /** Parses the JSON Date representation into a Date object.
         * @param {String} value - String value.
         * @returns {Date} A Date object if the value matches one; falsy otherwise.
         */
        export function parseJsonDateString(value: string): Date;
    }

    export namespace metadata {
        export interface SchemaElement {
            attributes?: string[];
            elements?: string[];
            text?: boolean;
            ns?: string;
        }

        export var metadataHandler: any;
        export var schema: {
            elements: {
                Action: SchemaElement;
                ActionImport: SchemaElement;
                Annotation: SchemaElement;
                AnnotationPath: SchemaElement;
                Annotations: SchemaElement;
                Apply: SchemaElement;
                And: SchemaElement;
                Or: SchemaElement;
                Not: SchemaElement;
                Eq: SchemaElement;
                Ne: SchemaElement;
                Gt: SchemaElement;
                Ge: SchemaElement;
                Lt: SchemaElement;
                Le: SchemaElement;
                Binary: SchemaElement;
                Bool: SchemaElement;
                Cast: SchemaElement;
                Collection: SchemaElement;
                ComplexType: SchemaElement;
                Date: SchemaElement;
                DateTimeOffset: SchemaElement;
                Decimal: SchemaElement;
                Duration: SchemaElement;
                EntityContainer: SchemaElement;
                EntitySet: SchemaElement;
                EntityType: SchemaElement;
                EnumMember: SchemaElement;
                EnumType: SchemaElement;
                Float: SchemaElement;
                Function: SchemaElement;
                FunctionImport: SchemaElement;
                Guid: SchemaElement;
                If: SchemaElement;
                Int: SchemaElement;
                IsOf: SchemaElement;
                Key: SchemaElement;
                LabeledElement: SchemaElement;
                LabeledElementReference: SchemaElement;
                Member: SchemaElement;
                NavigationProperty: SchemaElement;
                NavigationPropertyBinding: SchemaElement;
                NavigationPropertyPath: SchemaElement;
                Null: SchemaElement;
                OnDelete: SchemaElement;
                Path: SchemaElement;
                Parameter: SchemaElement;
                Property: SchemaElement;
                PropertyPath: SchemaElement;
                PropertyRef: SchemaElement;
                PropertyValue: SchemaElement;
                Record: SchemaElement;
                ReferentialConstraint: SchemaElement;
                ReturnType: SchemaElement;
                String: SchemaElement;
                Schema: SchemaElement;
                Singleton: SchemaElement;
                Term: SchemaElement;
                TimeOfDay: SchemaElement;
                TypeDefinition: SchemaElement;
                UrlRef: SchemaElement;
                Edmx: SchemaElement;
                DataServices: SchemaElement;
                Reference: SchemaElement;
                Include: SchemaElement;
                IncludeAnnotations: SchemaElement;
            };
        };
        /** Converts a Pascal-case identifier into a camel-case identifier.
        * @param {String} text - Text to convert.
        * @returns {String} Converted text.
        * If the text starts with multiple uppercase characters, it is left as-is.
        */
        export function scriptCase(text: string): string;
        /** Gets the schema node for the specified element.
         * @param {Object} parentSchema - Schema of the parent XML node of 'element'.
         * @param candidateName - XML element name to consider.
         * @returns {Object} The schema that describes the specified element; null if not found.
         */
        export function getChildSchema(parentSchema: Object, candidateName: string): Object;
        /** Parses a CSDL document.
         * @param element - DOM element to parse.
         * @returns {Object} An object describing the parsed element.
         */
        export function parseConceptualModelElement(element: any): Object;
        /** Parses a metadata document.
         * @param handler - This handler.
         * @param {String} text - Metadata text.
         * @returns An object representation of the conceptual model.
         */
        export function metadataParser(handler: any, text: string): Object;
    }

    export namespace net {
        export var defaultHttpClient: {
            formatQueryString: string;
            /** Performs a network request.
         * @param {Object} request - Request description
         * @param {Function} success - Success callback with the response object.
         * @param {Function} error - Error callback with an error object.
         * @returns {Object} Object with an 'abort' method for the operation.
         */
            request: (request: Object, success: (any) => void, error: (any) => void) => { abort: () => void };
        };

        /* Checks whether the specified request can be satisfied with a JSONP request.
         * @param request - Request object to check.
         * @returns {Boolean} true if the request can be satisfied; false otherwise.
        
         * Requests that 'degrade' without changing their meaning by going through JSONP
         * are considered usable.
         *
         * We allow data to come in a different format, as the servers SHOULD honor the Accept
         * request but may in practice return content with a different MIME type.
         */
        export function canUseJSONP(request: any): boolean;
        /** Checks whether the specified URL is an absolute URL.
         * @param {String} url - URL to check.
         * @returns {Boolean} true if the url is an absolute URL; false otherwise.
        */
        export function isAbsoluteUrl(url: string): boolean;
        /** Checks whether the specified URL is local to the current context.
         * @param {String} url - URL to check.
         * @returns {Boolean} true if the url is a local URL; false otherwise.
         */
        export function isLocalUrl(url: string): boolean;
    }

    export namespace utils {
        /** Gets the type name of a data item value that belongs to a feed, an entry, a complex type property, or a collection property
         * @param {string} value - Value of the data item from which the type name is going to be retrieved.
         * @param {object} [metadata] - Object containing metadata about the data tiem.
         * @returns {string} Data item type name; null if the type name cannot be found within the value or the metadata
         * This function will first try to get the type name from the data item's value itself if it is an object with a __metadata property; otherwise
         * it will try to recover it from the metadata.  If both attempts fail, it will return null.
         */
        export var dataItemTypeName: (value: string, metadata: any) => string;
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
        export function navigationPropertyKind(value: any, propertyModel: any): "deferred" | "entry" | "feed";
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
    }

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
    export function read(urlOrRequest: any, success: (data: any) => void, error: (error: Object) => void, handler: Handler, httpClient: Object, metadata: Object): any;
    /** Parses the csdl metadata to ODataJS metatdata format. This method can be used when the metadata is retrieved using something other than odatajs
     * @param {string} csdlMetadataDocument - A string that represents the entire csdl metadata.
     * @returns {Object} An object that has the representation of the metadata in odatajs format.
     */
    export function parseMetadata(csdlMetadataDocument: string): Object;

    export var jsonHandler: any;
}

export namespace store {
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

    /** @module store/dom */
    class DomStore {
        defaultError: (error: any) => void;
        /** Identifies the underlying mechanism used by the store.*/
        mechanism: string;
        name: string;

        /** Constructor for store objects that use DOM storage as the underlying mechanism.
         * @class DomStore
         * @constructor
         * @param {String} name - Store name.
         */
        constructor(name: string);

        /** Creates a store object that uses DOM Storage as its underlying mechanism.
         * @method module:store/dom~DomStore.create
         * @param {String} name - Store name.
         * @returns {Object} Store object.
         */
        static create(name: string): DomStore;
        /** Checks whether the underlying mechanism for this kind of store objects is supported by the browser.
        * @method DomStore.isSupported
        * @returns {Boolean} - True if the mechanism is supported by the browser; otherwise false.
       */
        static isSupported(): boolean;
        /** Adds a new value identified by a key to the store.
         * @method module:store/dom~DomStore#add
         * @param {String} key - Key string.
         * @param value - Value that is going to be added to the store.
         * @param {Function} success - Callback for a successful add operation.
         * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
         * This method errors out if the store already contains the specified key.
         */
        add(key: string, value: Object, success: (key: string, value: any) => void, error?: (error: any) => void): void;
        /** This method will overwrite the key's current value if it already exists in the store; otherwise it simply adds the new key and value.
        * @summary Adds or updates a value identified by a key to the store.
        * @method module:store/dom~DomStore#addOrUpdate
        * @param {String} key - Key string.
        * @param value - Value that is going to be added or updated to the store.
        * @param {Function} success - Callback for a successful add or update operation.
        * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
        */
        addOrUpdate(key: string, value: Object, success: (key: string, value: any) => void, error?: (error: any) => void): void;
        /** In case of an error, this method will not restore any keys that might have been deleted at that point.
        * @summary Removes all the data associated with this store object.
        * @method module:store/dom~DomStore#clear
        * @param {Function} success - Callback for a successful clear operation.
        * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
        */
        clear(success: () => void, error?: (error: any) => void): void;
        /** This function does nothing in DomStore as it does not have a connection model
         * @method module:store/dom~DomStore#close
         */
        close(): void;
        /** Checks whether a key exists in the store.
        * @method module:store/dom~DomStore#contains
        * @param {String} key - Key string.
        * @param {Function} success - Callback indicating whether the store contains the key or not.
        * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
       */
        contains(key: string, success: (successful: boolean) => void, error?: (error: any) => void): void;

        /** Gets all the keys that exist in the store.
         * @method module:store/dom~DomStore#getAllKeys
         * @param {Function} success - Callback for a successful get operation.
         * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
         */
        getAllKeys(success: (keys: string[]) => void, error?: (error: any) => void): void;
        /** Reads the value associated to a key in the store.
        * @method module:store/dom~DomStore#read
        * @param {String} key - Key string.
        * @param {Function} success - Callback for a successful reads operation.
        * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
        */
        read(key: string, success: (key: string, value: any) => void, error?: (error: any) => void): void;
        /** Removes a key and its value from the store.
         * @method module:store/dom~DomStore#remove
         * @param {String} key - Key string.
         * @param {Function} success - Callback for a successful remove operation.
         * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
         */
        remove(key: string, success: () => void, error?: (error: any) => void): void;
        /** Updates the value associated to a key in the store.
        * @method module:store/dom~DomStore#update
        * @param {String} key - Key string.
        * @param value - New value.
        * @param {Function} success - Callback for a successful update operation.
        * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked
        * This method errors out if the specified key is not found in the store.
        */
        update(key: string, value: Object, success: (key: string, value: any) => void, error?: (error: any) => void): void;
    }

    /** @module store/indexeddb */
    class IndexedDBStore {
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

    /** @module store/memory */
    class MemoryStore {
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
}

export namespace utils {
    export function inBrowser(): boolean;
    /** Creates a new ActiveXObject from the given progId.
     * @param {String} progId - ProgId string of the desired ActiveXObject.
     * @returns {Object} The ActiveXObject instance. Null if ActiveX is not supported by the browser.
     * This function throws whatever exception might occur during the creation
     * of the ActiveXObject.
    */
    export var activeXObject: (progId: string) => Object;
    /** Checks whether the specified value is different from null and undefined.
     * @param [value] Value to check ( may be null)
     * @returns {Boolean} true if the value is assigned; false otherwise.
    */
    export function assigned(value: any): boolean;
    /** Checks whether the specified item is in the array.
     * @param {Array} [arr] Array to check in.
     * @param item - Item to look for.
     * @returns {Boolean} true if the item is contained, false otherwise.
    */
    export function contains(arr: any[], item: any): boolean;
    /** Given two values, picks the first one that is not undefined.
     * @param a - First value.
     * @param b - Second value.
     * @returns a if it's a defined value; else b.
     */
    export function defined(a: any, b: any): any;
    /** Delays the invocation of the specified function until execution unwinds.
     * @param {Function} callback - Callback function.
     */
    export function delay(callback: any): void;
    /** Throws an exception in case that a condition evaluates to false.
     * @param {Boolean} condition - Condition to evaluate.
     * @param {String} message - Message explaining the assertion.
     * @param {Object} data - Additional data to be included in the exception.
     */
    export function djsassert(condition: boolean, message: string, data: Object): void;
    /** Extends the target with the specified values.
     * @param {Object} target - Object to add properties to.
     * @param {Object} values - Object with properties to add into target.
     * @returns {Object} The target object.
    */
    export function extend(target: Object, values: Object): Object;
    export function find(arr: any, callback: any): any;
    export function isArray(value: any): boolean;
    /** Checks whether the specified value is a Date object.
     * @param value - Value to check.
     * @returns {Boolean} true if the value is a Date object; false otherwise.
     */
    export function isDate(value: any): boolean;
    /** Tests whether a value is an object.
     * @param value - Value to test.
     * @returns {Boolean} True is the value is an object; false otherwise.
     * Per javascript rules, null and array values are objects and will cause this function to return true.
     */
    export function isObject(value: any): boolean;
    /** Parses a value in base 10.
     * @param {String} value - String value to parse.
     * @returns {Number} The parsed value, NaN if not a valid value.
    */
    export function parseInt10(value: string): number;
    /** Renames a property in an object.
     * @param {Object} obj - Object in which the property will be renamed.
     * @param {String} oldName - Name of the property that will be renamed.
     * @param {String} newName - New name of the property.
     * This function will not do anything if the object doesn't own a property with the specified old name.
     */
    export function renameProperty(obj: Object, oldName: string, newName: string): void;
    /** Default error handler.
     * @param {Object} error - Error to handle.
     */
    export function throwErrorCallback(error: Object): void;
    /** Removes leading and trailing whitespaces from a string.
     * @param {String} str String to trim
     * @returns {String} The string with no leading or trailing whitespace.
     */
    export function trimString(str: string): string;
    /** Returns a default value in place of undefined.
     * @param [value] Value to check (may be null)
     * @param defaultValue - Value to return if value is undefined.
     * @returns value if it's defined; defaultValue otherwise.
     * This should only be used for cases where falsy values are valid;
     * otherwise the pattern should be 'x = (value) ? value : defaultValue;'.
     */
    export function undefinedDefault(value: any, defaultValue: any): any;
    /** Gets information about the components of the specified URI.
     * @param {String} uri - URI to get information from.
     * @return  {Object} An object with an isAbsolute flag and part names (scheme, authority, etc.) if available.
     */
    export function getURIInfo(uri: string): {
        isAbsolute: boolean;
    };
    /** Normalizes the casing of a URI.
     * @param {String} uri - URI to normalize, absolute or relative.
     * @returns {String} The URI normalized to lower case.
    */
    export function normalizeURICase(uri: string): string;
    /** Normalizes a possibly relative URI with a base URI.
     * @param {String} uri - URI to normalize, absolute or relative
     * @param {String} base - Base URI to compose with (may be null)
     * @returns {String} The composed URI if relative; the original one if absolute.
     */
    export function normalizeURI(uri: string, base: string): string;
    export function convertByteArrayToHexString(str: string): string;
    export function decodeBase64(str: string): number[];
    export function getJsonValueArraryLength(data: any): number;
    export function sliceJsonValueArray(data: any, start: any, end: any): any;
    export function concatJsonValueArray(data: any, concatData: any): any;
    export function endsWith(input: string, search: string): boolean;
    export function startsWith(input: string, search: string): boolean;
    export function getFormatKind(format: string, defaultFormatKind: number): number; // should define enum
}

export namespace xml {
    export var http: string;
    export var w3org: string;
    export var xmlNS: string;
    export var xmlnsNS: string;
    /** Checks whether the specified string has leading or trailing spaces.
     * @param {String} text - String to check.
     * @returns {Boolean} true if text has any leading or trailing whitespace; false otherwise.
     */
    export function hasLeadingOrTrailingWhitespace(text: string): boolean;
    /** Determines whether the attribute is a XML namespace declaration.
     * @param domAttribute - Element to inspect.
     * @return {Boolean} True if the attribute is a namespace declaration (its name is 'xmlns' or starts with 'xmlns:'; false otherwise.
     */
    export function isXmlNSDeclaration(domAttribute: any): boolean;
    /** Appends a child node or a string value to a parent DOM node.
     * @param parent - DOM node to which the child will be appended.
     * @param child - Child DOM node or string value to append to the parent.
     * @return The parent with the appended child or string value.
     * If child is a string value, then a new DOM text node is going to be created
     * for it and then appended to the parent.
     */
    export function xmlAppendChild(parent: any, child: any): any;
    /** Appends a collection of child nodes or string values to a parent DOM node.
     * @param parent - DOM node to which the children will be appended.
     * @param {Array} children - Array containing DOM nodes or string values that will be appended to the parent.
     * @return The parent with the appended children or string values.
     *  If a value in the children collection is a string, then a new DOM text node is going to be created
     *  for it and then appended to the parent.
     */
    export function xmlAppendChildren(parent: any, children: any[]): any;
    /** Gets an attribute node from a DOM element.
     * @param domNode - DOM node for the owning element.
     * @param {String} localName - Local name of the attribute.
     * @param {String} nsURI - Namespace URI of the attribute.
     * @returns The attribute node, null if not found.
     */
    export function xmlAttributeNode(domNode: any, localName: string, nsURI: string): any;
    /** Iterates through the XML element's attributes and invokes the callback function for each one.
     * @param element - Wrapped element to iterate over.
     * @param {Function} onAttributeCallback - Callback function to invoke with wrapped attribute nodes.
    */
    export function xmlAttributes(element: any, onAttributeCallback: (any) => void): void;
    /** Returns the value of a DOM element's attribute.
     * @param domNode - DOM node for the owning element.
     * @param {String} localName - Local name of the attribute.
     * @param {String} nsURI - Namespace URI of the attribute.
     * @returns {String} - The attribute value, null if not found (may be null)
     */
    export function xmlAttributeValue(domNode: any, localName: string, nsURI: string): string;
    /** Gets the value of the xml:base attribute on the specified element.
     * @param domNode - Element to get xml:base attribute value from.
     * @param [baseURI] - Base URI used to normalize the value of the xml:base attribute ( may be null)
     * @returns {String} Value of the xml:base attribute if found; the baseURI or null otherwise.
     */
    export function xmlBaseURI(domNode: any, baseURI: any): string;
    /** Iterates through the XML element's child DOM elements and invokes the callback function for each one.
     * @param domNode - DOM Node containing the DOM elements to iterate over.
     * @param {Function} onElementCallback - Callback function to invoke for each child DOM element.
    */
    export function xmlChildElements(domNode: any, onElementCallback: any): void;
    /** Gets the descendant element under root that corresponds to the specified path and namespace URI.
     * @param root - DOM element node from which to get the descendant element.
     * @param {String} namespaceURI - The namespace URI of the element to match.
     * @param {String} path - Path to the desired descendant element.
     * @return The element specified by path and namespace URI.
     * All the elements in the path are matched against namespaceURI.
     * The function will stop searching on the first element that doesn't match the namespace and the path.
     */
    export function xmlFindElementByPath(root: any, namespaceURI: string, path: string): any;
    /** Gets the DOM element or DOM attribute node under root that corresponds to the specified path and namespace URI.
     * @param root - DOM element node from which to get the descendant node.
     * @param {String} namespaceURI - The namespace URI of the node to match.
     * @param {String} path - Path to the desired descendant node.
     * @return The node specified by path and namespace URI.
    
    * This function will traverse the path and match each node associated to a path segement against the namespace URI.
    * The traversal stops when the whole path has been exahusted or a node that doesn't belogong the specified namespace is encountered.
    * The last segment of the path may be decorated with a starting @ character to indicate that the desired node is a DOM attribute.
    */
    export function xmlFindNodeByPath(root: any, namespaceURI: string, path: string): any;
    /** Returns the first child DOM element under the specified DOM node that matches the specified namespace URI and local name.
     * @param domNode - DOM node from which the child DOM element is going to be retrieved.
     * @param {String} [namespaceURI] - The namespace URI of the node to match.
     * @param {String} [localName] - Local name of the attribute.
     * @return The node's first child DOM element that matches the specified namespace URI and local name; null otherwise.
     */
    export function xmlFirstChildElement(domNode: any, namespaceURI: string, localName: string): any;
    /** Returns the first descendant DOM element under the specified DOM node that matches the specified namespace URI and local name.
     * @param domNode - DOM node from which the descendant DOM element is going to be retrieved.
     * @param {String} [namespaceURI] - The namespace URI of the node to match.
     * @param {String} [localName] - Local name of the attribute.
     * @return The node's first descendant DOM element that matches the specified namespace URI and local name; null otherwise.
    */
    export function xmlFirstDescendantElement(domNode: any, namespaceURI: string, localName: string): any;
    /** Gets the concatenated value of all immediate child text and CDATA nodes for the specified element.
     * @param xmlElement - Element to get values for.
     * @returns {String} Text for all direct children.
     */
    export function xmlInnerText(xmlElement: any): string;
    /** Returns the localName of a XML node.
     * @param domNode - DOM node to get the value from.
     * @returns {String} localName of domNode.
     */
    export function xmlLocalName(domNode: any): string;
    /** Returns the namespace URI of a XML node.
     * @param domNode - DOM node to get the value from.
     * @returns {String} Namespace URI of domNode.
     */
    export function xmlNamespaceURI(domNode: any): string;
    /** Returns the value or the inner text of a XML node.
     * @param domNode - DOM node to get the value from.
     * @return Value of the domNode or the inner text if domNode represents a DOM element node.
     */
    export function xmlNodeValue(domNode: any): any;
    /** Creates a new empty DOM document node.
     * @return New DOM document node.
     *
     * This function will first try to create a native DOM document using
     * the browsers createDocument function.  If the browser doesn't
     * support this but supports ActiveXObject, then an attempt to create
     * an MSXML 6.0 DOM will be made. If this attempt fails too, then an attempt
     * for creating an MXSML 3.0 DOM will be made.  If this last attemp fails or
     * the browser doesn't support ActiveXObject then an exception will be thrown.
     */
    export function xmlDom(): any;
    /** Creates a new DOM attribute node.
     * @param dom - DOM document used to create the attribute.
     * @param {String} namespaceURI - Namespace URI.
     * @param {String} qualifiedName - Qualified OData name
     * @param {String} value - Value of the new attribute
     * @return DOM attribute node for the namespace declaration.
     */
    export function xmlNewAttribute(dom: any, namespaceURI: any, qualifiedName: any, value: any): any;
    /** Creates a new DOM element node.
     * @param dom - DOM document used to create the DOM element.
     * @param {String} namespaceURI - Namespace URI of the new DOM element.
     * @param {String} qualifiedName - Qualified name in the form of "prefix:name" of the new DOM element.
     * @param {Array} [children] Collection of child DOM nodes or string values that are going to be appended to the new DOM element.
     * @return New DOM element.
     * If a value in the children collection is a string, then a new DOM text node is going to be created
     * for it and then appended to the new DOM element.
     */
    export function xmlNewElement(dom: any, namespaceURI: string, qualifiedName: string, children: any[]): any;
    /** Creates a new DOM document fragment node for the specified xml text.
     * @param dom - DOM document from which the fragment node is going to be created.
     * @param {String} text XML text to be represented by the XmlFragment.
     * @return New DOM document fragment object.
     */
    export function xmlNewFragment(dom: any, text: string): any;
    /** Creates a new DOM element or DOM attribute node as specified by path and appends it to the DOM tree pointed by root.
     * @param dom - DOM document used to create the new node.
     * @param root - DOM element node used as root of the subtree on which the new nodes are going to be created.
     * @param {String} namespaceURI - Namespace URI of the new DOM element or attribute.
     * @param {String} prefix - Prefix used to qualify the name of the new DOM element or attribute.
     * @param {String} path - Path string describing the location of the new DOM element or attribute from the root element.
     * @return DOM element or attribute node for the last segment of the path.
    
     * This function will traverse the path and will create a new DOM element with the specified namespace URI and prefix
     * for each segment that doesn't have a matching element under root.
     * The last segment of the path may be decorated with a starting @ character. In this case a new DOM attribute node
     * will be created.
     */
    export function xmlNewNodeByPath(dom: any, root: any, namespaceURI: string, prefix: string, path: string): any;
    /** Creates a namespace declaration attribute.
     * @param dom - DOM document used to create the attribute.
     * @param {String} namespaceURI - Namespace URI.
     * @param {String} prefix - Namespace prefix.
     * @return DOM attribute node for the namespace declaration.
     */
    export function xmlNewNSDeclaration(dom: any, namespaceURI: string, prefix: string): any;
    /** Creates new DOM text node.
     * @param dom - DOM document used to create the text node.
     * @param {String} text - Text value for the DOM text node.
     * @return DOM text node.
     */
    export function xmlNewText(dom: any, text: string): any;
    /** Returns an XML DOM document from the specified text.
     * @param {String} text - Document text.
     * @returns XML DOM document.
     * This function will throw an exception in case of a parse error
     */
    export function xmlParse(text: string): any;
    /** Builds a XML qualified name string in the form of "prefix:name".
     * @param {String} prefix - Prefix string (may be null)
     * @param {String} name - Name string to qualify with the prefix.
     * @returns {String} Qualified name.
     */
    export function xmlQualifiedName(prefix: string, name: string): string;
    /** Returns the text representation of the document to which the specified node belongs.
     * @param domNode - Wrapped element in the document to serialize.
     * @returns {String} Serialized document.
    */
    export function xmlSerialize(domNode: any): any;
    /** Returns the XML representation of the all the descendants of the node.
     * @param domNode - Node to serialize.
     * @returns {String} The XML representation of all the descendants of the node.
     */
    export function xmlSerializeDescendants(domNode: any): any;
    /** Returns the next sibling DOM element of the specified DOM node.
     * @param domNode - DOM node from which the next sibling is going to be retrieved.
     * @param {String} [namespaceURI] -
     * @param {String} [localName] -
     * @return The node's next sibling DOM element, null if there is none.
     */
    export function xmlSiblingElement(domNode: any, namespaceURI: string, localName: string): any;
}
