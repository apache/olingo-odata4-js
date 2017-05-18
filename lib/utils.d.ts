/** @module odatajs/utils */

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
export function assigned(value?: any): boolean;
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
