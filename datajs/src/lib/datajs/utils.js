/* {
    oldname:'utils.js',
    updated:'20140514 12:59'
}*/
// Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation 
// files (the "Software"), to deal  in the Software without restriction, including without limitation the rights  to use, copy,
// modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the 
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  IMPLIED, INCLUDING BUT NOT LIMITED TO THE
// WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
// ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// utils.js



var activeXObject = function (progId) {
    /// <summary>Creates a new ActiveXObject from the given progId.</summary>
    /// <param name="progId" type="String" mayBeNull="false" optional="false">
    ///    ProgId string of the desired ActiveXObject.
    /// </param>
    /// <remarks>
    ///    This function throws whatever exception might occur during the creation
    ///    of the ActiveXObject.
    /// </remarks>
    /// <returns type="Object">
    ///     The ActiveXObject instance. Null if ActiveX is not supported by the
    ///     browser.
    /// </returns>
    if (window.ActiveXObject) {
        return new window.ActiveXObject(progId);
    }
    return null;
};

var assigned = function (value) {
    /// <summary>Checks whether the specified value is different from null and undefined.</summary>
    /// <param name="value" mayBeNull="true" optional="true">Value to check.</param>
    /// <returns type="Boolean">true if the value is assigned; false otherwise.</returns>
    return value !== null && value !== undefined;
};

var contains = function (arr, item) {
    /// <summary>Checks whether the specified item is in the array.</summary>
    /// <param name="arr" type="Array" optional="false" mayBeNull="false">Array to check in.</param>
    /// <param name="item">Item to look for.</param>
    /// <returns type="Boolean">true if the item is contained, false otherwise.</returns>

    var i, len;
    for (i = 0, len = arr.length; i < len; i++) {
        if (arr[i] === item) {
            return true;
        }
    }

    return false;
};

var defined = function (a, b) {
    /// <summary>Given two values, picks the first one that is not undefined.</summary>
    /// <param name="a">First value.</param>
    /// <param name="b">Second value.</param>
    /// <returns>a if it's a defined value; else b.</returns>
    return (a !== undefined) ? a : b;
};

var delay = function (callback) {
    /// <summary>Delays the invocation of the specified function until execution unwinds.</summary>
    /// <param name="callback" type="Function">Callback function.</param>
    if (arguments.length === 1) {
        window.setTimeout(callback, 0);
        return;
    }

    var args = Array.prototype.slice.call(arguments, 1);
    window.setTimeout(function () {
        callback.apply(this, args);
    }, 0);
};

// DATAJS INTERNAL START
var djsassert = function (condition, message, data) {
    /// <summary>Throws an exception in case that a condition evaluates to false.</summary>
    /// <param name="condition" type="Boolean">Condition to evaluate.</param>
    /// <param name="message" type="String">Message explaining the assertion.</param>
    /// <param name="data" type="Object">Additional data to be included in the exception.</param>

    if (!condition) {
        throw { message: "Assert fired: " + message, data: data };
    };
};
// DATAJS INTERNAL END

var extend = function (target, values) {
    /// <summary>Extends the target with the specified values.</summary>
    /// <param name="target" type="Object">Object to add properties to.</param>
    /// <param name="values" type="Object">Object with properties to add into target.</param>
    /// <returns type="Object">The target object.</returns>

    for (var name in values) {
        target[name] = values[name];
    }

    return target;
};

var find = function (arr, callback) {
    /// <summary>Returns the first item in the array that makes the callback function true.</summary>
    /// <param name="arr" type="Array" optional="false" mayBeNull="true">Array to check in.</param>
    /// <param name="callback" type="Function">Callback function to invoke once per item in the array.</param>
    /// <returns>The first item that makes the callback return true; null otherwise or if the array is null.</returns>

    if (arr) {
        var i, len;
        for (i = 0, len = arr.length; i < len; i++) {
            if (callback(arr[i])) {
                return arr[i];
            }
        }
    }
    return null;
};

var isArray = function (value) {
    /// <summary>Checks whether the specified value is an array object.</summary>
    /// <param name="value">Value to check.</param>
    /// <returns type="Boolean">true if the value is an array object; false otherwise.</returns>

    return Object.prototype.toString.call(value) === "[object Array]";
};

var isDate = function (value) {
    /// <summary>Checks whether the specified value is a Date object.</summary>
    /// <param name="value">Value to check.</param>
    /// <returns type="Boolean">true if the value is a Date object; false otherwise.</returns>

    return Object.prototype.toString.call(value) === "[object Date]";
};

var isObject = function (value) {
    /// <summary>Tests whether a value is an object.</summary>
    /// <param name="value">Value to test.</param>
    /// <remarks>
    ///     Per javascript rules, null and array values are objects and will cause this function to return true.
    /// </remarks>
    /// <returns type="Boolean">True is the value is an object; false otherwise.</returns>

    return typeof value === "object";
};

var parseInt10 = function (value) {
    /// <summary>Parses a value in base 10.</summary>
    /// <param name="value" type="String">String value to parse.</param>
    /// <returns type="Number">The parsed value, NaN if not a valid value.</returns>

    return parseInt(value, 10);
};

var renameProperty = function (obj, oldName, newName) {
    /// <summary>Renames a property in an object.</summary>
    /// <param name="obj" type="Object">Object in which the property will be renamed.</param>
    /// <param name="oldName" type="String">Name of the property that will be renamed.</param>
    /// <param name="newName" type="String">New name of the property.</param>
    /// <remarks>
    ///    This function will not do anything if the object doesn't own a property with the specified old name.
    /// </remarks>

    if (obj.hasOwnProperty(oldName)) {
        obj[newName] = obj[oldName];
        delete obj[oldName];
    }
};

var throwErrorCallback = function (error) {
    /// <summary>Default error handler.</summary>
    /// <param name="error" type="Object">Error to handle.</param>
    throw error;
};

var trimString = function (str) {
    /// <summary>Removes leading and trailing whitespaces from a string.</summary>
    /// <param name="str" type="String" optional="false" mayBeNull="false">String to trim</param>
    /// <returns type="String">The string with no leading or trailing whitespace.</returns>

    if (str.trim) {
        return str.trim();
    }

    return str.replace(/^\s+|\s+$/g, '');
};

var undefinedDefault = function (value, defaultValue) {
    /// <summary>Returns a default value in place of undefined.</summary>
    /// <param name="value" mayBeNull="true" optional="true">Value to check.</param>
    /// <param name="defaultValue">Value to return if value is undefined.</param>
    /// <returns>value if it's defined; defaultValue otherwise.</returns>
    /// <remarks>
    /// This should only be used for cases where falsy values are valid;
    /// otherwise the pattern should be 'x = (value) ? value : defaultValue;'.
    /// </remarks>
    return (value !== undefined) ? value : defaultValue;
};

// Regular expression that splits a uri into its components:
// 0 - is the matched string.
// 1 - is the scheme.
// 2 - is the authority.
// 3 - is the path.
// 4 - is the query.
// 5 - is the fragment.
var uriRegEx = /^([^:\/?#]+:)?(\/\/[^\/?#]*)?([^?#:]+)?(\?[^#]*)?(#.*)?/;
var uriPartNames = ["scheme", "authority", "path", "query", "fragment"];

var getURIInfo = function (uri) {
    /// <summary>Gets information about the components of the specified URI.</summary>
    /// <param name="uri" type="String">URI to get information from.</param>
    /// <returns type="Object">
    /// An object with an isAbsolute flag and part names (scheme, authority, etc.) if available.
    /// </returns>

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
};

var getURIFromInfo = function (uriInfo) {
    /// <summary>Builds a URI string from its components.</summary>
    /// <param name="uriInfo" type="Object"> An object with uri parts (scheme, authority, etc.).</param>
    /// <returns type="String">URI string.</returns>

    return "".concat(
        uriInfo.scheme || "",
        uriInfo.authority || "",
        uriInfo.path || "",
        uriInfo.query || "",
        uriInfo.fragment || "");
};

// Regular expression that splits a uri authority into its subcomponents:
// 0 - is the matched string.
// 1 - is the userinfo subcomponent.
// 2 - is the host subcomponent.
// 3 - is the port component.
var uriAuthorityRegEx = /^\/{0,2}(?:([^@]*)@)?([^:]+)(?::{1}(\d+))?/;

// Regular expression that matches percentage enconded octects (i.e %20 or %3A);
var pctEncodingRegEx = /%[0-9A-F]{2}/ig;

var normalizeURICase = function (uri) {
    /// <summary>Normalizes the casing of a URI.</summary>
    /// <param name="uri" type="String">URI to normalize, absolute or relative.</param>
    /// <returns type="String">The URI normalized to lower case.</returns>

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
};

var normalizeURI = function (uri, base) {
    /// <summary>Normalizes a possibly relative URI with a base URI.</summary>
    /// <param name="uri" type="String">URI to normalize, absolute or relative.</param>
    /// <param name="base" type="String" mayBeNull="true">Base URI to compose with.</param>
    /// <returns type="String">The composed URI if relative; the original one if absolute.</returns>

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
};

var mergeUriPathWithBase = function (uriPath, basePath) {
    /// <summary>Merges the path of a relative URI and a base URI.</summary>
    /// <param name="uriPath" type="String>Relative URI path.</param>
    /// <param name="basePath" type="String">Base URI path.</param>
    /// <returns type="String">A string with the merged path.</returns>

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
};

var removeDotsFromPath = function (path) {
    /// <summary>Removes the special folders . and .. from a URI's path.</summary>
    /// <param name="path" type="string">URI path component.</param>
    /// <returns type="String">Path without any . and .. folders.</returns>

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
};

var convertByteArrayToHexString = function (str) {
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
};

var decodeBase64 = function (str) {
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
};

var getBase64IndexValue = function (character) {
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
};

var addBase64Padding = function (binaryString) {
    while (binaryString.length < 6) {
        binaryString = "0" + binaryString;
    }
    return binaryString;

};

var getJsonValueArraryLength = function (data) {
    if (data && data.value) {
        return data.value.length;
    }

    return 0;
};

var sliceJsonValueArray = function (data, start, end) {
    if (data == undefined || data.value == undefined) {
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
};

var concatJsonValueArray = function (data, concatData) {
    if (concatData == undefined || concatData.value == undefined) {
        return data;
    }

    if (data == undefined || Object.keys(data).length == 0) {
        return concatData;
    }

    if (data.value == undefined) {
        data.value = concatData.value;
        return data;
    }

    data.value = data.value.concat(concatData.value);

    return data;
};

// DATAJS INTERNAL START
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
// DATAJS INTERNAL END

    