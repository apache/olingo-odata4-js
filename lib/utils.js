/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
'use strict';

/** @module odatajs/utils */


function inBrowser() {
    return typeof window !== 'undefined';
}

/** Creates a new ActiveXObject from the given progId.
 * @param {String} progId - ProgId string of the desired ActiveXObject.
 * @returns {Object} The ActiveXObject instance. Null if ActiveX is not supported by the browser.
 * This function throws whatever exception might occur during the creation
 * of the ActiveXObject.
*/
var activeXObject = function (progId) {
    
    if (window.ActiveXObject) {
        return new window.ActiveXObject(progId);
    }
    return null;
};

/** Checks whether the specified value is different from null and undefined.
 * @param [value] Value to check ( may be null)
 * @returns {Boolean} true if the value is assigned; false otherwise.
*/     
function assigned(value) {
    return value !== null && value !== undefined;
}

/** Checks whether the specified item is in the array.
 * @param {Array} [arr] Array to check in.
 * @param item - Item to look for.
 * @returns {Boolean} true if the item is contained, false otherwise.
*/
function contains(arr, item) {
    var i, len;
    for (i = 0, len = arr.length; i < len; i++) {
        if (arr[i] === item) {
            return true;
        }
    }
    return false;
}

/** Given two values, picks the first one that is not undefined.
 * @param a - First value.
 * @param b - Second value.
 * @returns a if it's a defined value; else b.
 */
function defined(a, b) {
    return (a !== undefined) ? a : b;
}

/** Delays the invocation of the specified function until execution unwinds.
 * @param {Function} callback - Callback function.
 */
function delay(callback) {

    if (arguments.length === 1) {
        window.setTimeout(callback, 0);
        return;
    }

    var args = Array.prototype.slice.call(arguments, 1);
    window.setTimeout(function () {
        callback.apply(this, args);
    }, 0);
}

/** Throws an exception in case that a condition evaluates to false.
 * @param {Boolean} condition - Condition to evaluate.
 * @param {String} message - Message explaining the assertion.
 * @param {Object} data - Additional data to be included in the exception.
 */
function djsassert(condition, message, data) {


    if (!condition) {
        throw { message: "Assert fired: " + message, data: data };
    }
}

/** Extends the target with the specified values.
 * @param {Object} target - Object to add properties to.
 * @param {Object} values - Object with properties to add into target.
 * @returns {Object} The target object.
*/
function extend(target, values) {
    for (var name in values) {
        target[name] = values[name];
    }

    return target;
}

function find(arr, callback) {
    /** Returns the first item in the array that makes the callback function true.
     * @param {Array} [arr] Array to check in. ( may be null)
     * @param {Function} callback - Callback function to invoke once per item in the array.
     * @returns The first item that makes the callback return true; null otherwise or if the array is null.
    */

    if (arr) {
        var i, len;
        for (i = 0, len = arr.length; i < len; i++) {
            if (callback(arr[i])) {
                return arr[i];
            }
        }
    }
    return null;
}

function isArray(value) {
    /** Checks whether the specified value is an array object.
     * @param value - Value to check.
     * @returns {Boolean} true if the value is an array object; false otherwise.
     */

    return Object.prototype.toString.call(value) === "[object Array]";
}

/** Checks whether the specified value is a Date object.
 * @param value - Value to check.
 * @returns {Boolean} true if the value is a Date object; false otherwise.
 */
function isDate(value) {
    return Object.prototype.toString.call(value) === "[object Date]";
}

/** Tests whether a value is an object.
 * @param value - Value to test.
 * @returns {Boolean} True is the value is an object; false otherwise.
 * Per javascript rules, null and array values are objects and will cause this function to return true.
 */
function isObject(value) {
    return typeof value === "object";
}

/** Parses a value in base 10.
 * @param {String} value - String value to parse.
 * @returns {Number} The parsed value, NaN if not a valid value.
*/   
function parseInt10(value) {
    return parseInt(value, 10);
}

/** Renames a property in an object.
 * @param {Object} obj - Object in which the property will be renamed.
 * @param {String} oldName - Name of the property that will be renamed.
 * @param {String} newName - New name of the property.
 * This function will not do anything if the object doesn't own a property with the specified old name.
 */
function renameProperty(obj, oldName, newName) {
    if (obj.hasOwnProperty(oldName)) {
        obj[newName] = obj[oldName];
        delete obj[oldName];
    }
}

/** Default error handler.
 * @param {Object} error - Error to handle.
 */
function throwErrorCallback(error) {
    throw error;
}

/** Removes leading and trailing whitespaces from a string.
 * @param {String} str String to trim
 * @returns {String} The string with no leading or trailing whitespace.
 */
function trimString(str) {
    if (str.trim) {
        return str.trim();
    }

    return str.replace(/^\s+|\s+$/g, '');
}

/** Returns a default value in place of undefined.
 * @param [value] Value to check (may be null)
 * @param defaultValue - Value to return if value is undefined.
 * @returns value if it's defined; defaultValue otherwise.
 * This should only be used for cases where falsy values are valid;
 * otherwise the pattern should be 'x = (value) ? value : defaultValue;'.
 */
function undefinedDefault(value, defaultValue) {
    return (value !== undefined) ? value : defaultValue;
}

// Regular expression that splits a uri into its components:
// 0 - is the matched string.
// 1 - is the scheme.
// 2 - is the authority.
// 3 - is the path.
// 4 - is the query.
// 5 - is the fragment.
var uriRegEx = /^([^:\/?#]+:)?(\/\/[^\/?#]*)?([^?#:]+)?(\?[^#]*)?(#.*)?/;
var uriPartNames = ["scheme", "authority", "path", "query", "fragment"];

/** Gets information about the components of the specified URI.
 * @param {String} uri - URI to get information from.
 * @return  {Object} An object with an isAbsolute flag and part names (scheme, authority, etc.) if available.
 */
function getURIInfo(uri) {
    var result = { isAbsolute: false };

    if (uri) {
        var matches = uriRegEx.exec(uri);
        if (matches) {
            var i, len;
            for (i = 0, len = uriPartNames.length; i < len; i++) {
                if (matches[i + 1]) {
                    result[uriPartNames[i]] = matches[i + 1];
                }
            }
        }
        if (result.scheme) {
            result.isAbsolute = true;
        }
    }

    return result;
}

/** Builds a URI string from its components.
 * @param {Object} uriInfo -  An object with uri parts (scheme, authority, etc.).
 * @returns {String} URI string.
 */
function getURIFromInfo(uriInfo) {
    return "".concat(
        uriInfo.scheme || "",
        uriInfo.authority || "",
        uriInfo.path || "",
        uriInfo.query || "",
        uriInfo.fragment || "");
}

// Regular expression that splits a uri authority into its subcomponents:
// 0 - is the matched string.
// 1 - is the userinfo subcomponent.
// 2 - is the host subcomponent.
// 3 - is the port component.
var uriAuthorityRegEx = /^\/{0,2}(?:([^@]*)@)?([^:]+)(?::{1}(\d+))?/;

// Regular expression that matches percentage enconded octects (i.e %20 or %3A);
var pctEncodingRegEx = /%[0-9A-F]{2}/ig;

/** Normalizes the casing of a URI.
 * @param {String} uri - URI to normalize, absolute or relative.
 * @returns {String} The URI normalized to lower case.
*/
function normalizeURICase(uri) {
    var uriInfo = getURIInfo(uri);
    var scheme = uriInfo.scheme;
    var authority = uriInfo.authority;

    if (scheme) {
        uriInfo.scheme = scheme.toLowerCase();
        if (authority) {
            var matches = uriAuthorityRegEx.exec(authority);
            if (matches) {
                uriInfo.authority = "//" +
                (matches[1] ? matches[1] + "@" : "") +
                (matches[2].toLowerCase()) +
                (matches[3] ? ":" + matches[3] : "");
            }
        }
    }

    uri = getURIFromInfo(uriInfo);

    return uri.replace(pctEncodingRegEx, function (str) {
        return str.toLowerCase();
    });
}

/** Normalizes a possibly relative URI with a base URI.
 * @param {String} uri - URI to normalize, absolute or relative
 * @param {String} base - Base URI to compose with (may be null)
 * @returns {String} The composed URI if relative; the original one if absolute.
 */
function normalizeURI(uri, base) {
    if (!base) {
        return uri;
    }

    var uriInfo = getURIInfo(uri);
    if (uriInfo.isAbsolute) {
        return uri;
    }

    var baseInfo = getURIInfo(base);
    var normInfo = {};
    var path;

    if (uriInfo.authority) {
        normInfo.authority = uriInfo.authority;
        path = uriInfo.path;
        normInfo.query = uriInfo.query;
    } else {
        if (!uriInfo.path) {
            path = baseInfo.path;
            normInfo.query = uriInfo.query || baseInfo.query;
        } else {
            if (uriInfo.path.charAt(0) === '/') {
                path = uriInfo.path;
            } else {
                path = mergeUriPathWithBase(uriInfo.path, baseInfo.path);
            }
            normInfo.query = uriInfo.query;
        }
        normInfo.authority = baseInfo.authority;
    }

    normInfo.path = removeDotsFromPath(path);

    normInfo.scheme = baseInfo.scheme;
    normInfo.fragment = uriInfo.fragment;

    return getURIFromInfo(normInfo);
}

/** Merges the path of a relative URI and a base URI.
 * @param {String} uriPath - Relative URI path.
 * @param {String} basePath - Base URI path.
 * @returns {String} A string with the merged path.
 */
function mergeUriPathWithBase(uriPath, basePath) {
    var path = "/";
    var end;

    if (basePath) {
        end = basePath.lastIndexOf("/");
        path = basePath.substring(0, end);

        if (path.charAt(path.length - 1) !== "/") {
            path = path + "/";
        }
    }

    return path + uriPath;
}

/** Removes the special folders . and .. from a URI's path.
 * @param {string} path - URI path component.
 * @returns {String} Path without any . and .. folders.
 */
function removeDotsFromPath(path) {
    var result = "";
    var segment = "";
    var end;

    while (path) {
        if (path.indexOf("..") === 0 || path.indexOf(".") === 0) {
            path = path.replace(/^\.\.?\/?/g, "");
        } else if (path.indexOf("/..") === 0) {
            path = path.replace(/^\/\..\/?/g, "/");
            end = result.lastIndexOf("/");
            if (end === -1) {
                result = "";
            } else {
                result = result.substring(0, end);
            }
        } else if (path.indexOf("/.") === 0) {
            path = path.replace(/^\/\.\/?/g, "/");
        } else {
            segment = path;
            end = path.indexOf("/", 1);
            if (end !== -1) {
                segment = path.substring(0, end);
            }
            result = result + segment;
            path = path.replace(segment, "");
        }
    }
    return result;
}

function convertByteArrayToHexString(str) {
    var arr = [];
    if (window.atob === undefined) {
        arr = decodeBase64(str);
    } else {
        var binaryStr = window.atob(str);
        for (var i = 0; i < binaryStr.length; i++) {
            arr.push(binaryStr.charCodeAt(i));
        }
    }
    var hexValue = "";
    var hexValues = "0123456789ABCDEF";
    for (var j = 0; j < arr.length; j++) {
        var t = arr[j];
        hexValue += hexValues[t >> 4];
        hexValue += hexValues[t & 0x0F];
    }
    return hexValue;
}

function decodeBase64(str) {
    var binaryString = "";
    for (var i = 0; i < str.length; i++) {
        var base65IndexValue = getBase64IndexValue(str[i]);
        var binaryValue = "";
        if (base65IndexValue !== null) {
            binaryValue = base65IndexValue.toString(2);
            binaryString += addBase64Padding(binaryValue);
        }
    }
    var byteArray = [];
    var numberOfBytes = parseInt(binaryString.length / 8, 10);
    for (i = 0; i < numberOfBytes; i++) {
        var intValue = parseInt(binaryString.substring(i * 8, (i + 1) * 8), 2);
        byteArray.push(intValue);
    }
    return byteArray;
}

function getBase64IndexValue(character) {
    var asciiCode = character.charCodeAt(0);
    var asciiOfA = 65;
    var differenceBetweenZanda = 6;
    if (asciiCode >= 65 && asciiCode <= 90) {           // between "A" and "Z" inclusive
        return asciiCode - asciiOfA;
    } else if (asciiCode >= 97 && asciiCode <= 122) {   // between 'a' and 'z' inclusive
        return asciiCode - asciiOfA - differenceBetweenZanda;
    } else if (asciiCode >= 48 && asciiCode <= 57) {    // between '0' and '9' inclusive
        return asciiCode + 4;
    } else if (character == "+") {
        return 62;
    } else if (character == "/") {
        return 63;
    } else {
        return null;
    }
}

function addBase64Padding(binaryString) {
    while (binaryString.length < 6) {
        binaryString = "0" + binaryString;
    }
    return binaryString;

}

function getJsonValueArraryLength(data) {
    if (data && data.value) {
        return data.value.length;
    }

    return 0;
}

function sliceJsonValueArray(data, start, end) {
    if (data === undefined || data.value === undefined) {
        return data;
    }

    if (start < 0) {
        start = 0;
    }

    var length = getJsonValueArraryLength(data);
    if (length < end) {
        end = length;
    }

    var newdata = {};
    for (var property in data) {
        if (property == "value") {
            newdata[property] = data[property].slice(start, end);
        } else {
            newdata[property] = data[property];
        }
    }

    return newdata;
}

function concatJsonValueArray(data, concatData) {
    if (concatData === undefined || concatData.value === undefined) {
        return data;
    }

    if (data === undefined || Object.keys(data).length === 0) {
        return concatData;
    }

    if (data.value === undefined) {
        data.value = concatData.value;
        return data;
    }

    data.value = data.value.concat(concatData.value);

    return data;
}

function endsWith(input, search) {
    return input.indexOf(search, input.length - search.length) !== -1;
}

function startsWith (input, search) {
    return input.indexOf(search) === 0;
}

function getFormatKind(format, defaultFormatKind) {
    var formatKind = defaultFormatKind;
    if (!assigned(format)) {
        return formatKind;
    }

    var normalizedFormat = format.toLowerCase();
    switch (normalizedFormat) {
        case "none":
            formatKind = 0;
            break;
        case "minimal":
            formatKind = 1;
            break;
        case "full":
            formatKind = 2;
            break;
        default:
            break;
    }

    return formatKind;
}


    
    
exports.inBrowser = inBrowser;
exports.activeXObject = activeXObject;
exports.assigned = assigned;
exports.contains = contains;
exports.defined = defined;
exports.delay = delay;
exports.djsassert = djsassert;
exports.extend = extend;
exports.find = find;
exports.getURIInfo = getURIInfo;
exports.isArray = isArray;
exports.isDate = isDate;
exports.isObject = isObject;
exports.normalizeURI = normalizeURI;
exports.normalizeURICase = normalizeURICase;
exports.parseInt10 = parseInt10;
exports.renameProperty = renameProperty;
exports.throwErrorCallback = throwErrorCallback;
exports.trimString = trimString;
exports.undefinedDefault = undefinedDefault;
exports.decodeBase64 = decodeBase64;
exports.convertByteArrayToHexString = convertByteArrayToHexString;
exports.getJsonValueArraryLength = getJsonValueArraryLength;
exports.sliceJsonValueArray = sliceJsonValueArray;
exports.concatJsonValueArray = concatJsonValueArray;
exports.startsWith = startsWith;
exports.endsWith = endsWith;
exports.getFormatKind = getFormatKind;