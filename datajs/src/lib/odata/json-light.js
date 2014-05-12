//SK name /odata/odata-json-light.js
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

// odata-json-light.js

// Imports

var utils    = require('./../datajs.js').utils;
var oDataUtils    = require('./utils.js');

var assigned = utils.assigned;
var djsassert = utils.djsassert;
var extend = utils.extend;
var getURIInfo = utils.getURIInfo;
var isArray = utils.isArray;
var isDate = utils.isDate;
var normalizeURI = utils.normalizeURI;
var renameProperty = utils.renameProperty;
var undefinedDefault = utils.undefinedDefault;
var convertByteArrayToHexString = utils.convertByteArrayToHexString;

var dataItemTypeName = oDataUtils.dataItemTypeName;
var EDM_DATETIME = oDataUtils.EDM_DATETIME;
var EDM_DATETIMEOFFSET = oDataUtils.EDM_DATETIMEOFFSET;
var EDM_TIME = oDataUtils.EDM_TIME;
var getCollectionType = oDataUtils.getCollectionType;
var isCollection = oDataUtils.isCollection;
var isCollectionType = oDataUtils.isCollectionType;
var isComplex = oDataUtils.isComplex;
var isDeferred = oDataUtils.isDeferred;
var isFeed = oDataUtils.isFeed;
var isEntry = oDataUtils.isEntry;
var isGeographyEdmType = oDataUtils.isGeographyEdmType;
var isGeometryEdmType = oDataUtils.isGeometryEdmType;
var isPrimitiveEdmType = oDataUtils.isPrimitiveEdmType;
var isPrimitive = oDataUtils.isPrimitive;
var lookupComplexType = oDataUtils.lookupComplexType;
var lookupDefaultEntityContainer = oDataUtils.lookupDefaultEntityContainer;
var lookupEntityContainer = oDataUtils.lookupEntityContainer;
var lookupEntitySet = oDataUtils.lookupEntitySet;
var lookupEntityType = oDataUtils.lookupEntityType;
var lookupFunctionImport = oDataUtils.lookupFunctionImport;
var lookupNavigationPropertyType = oDataUtils.lookupNavigationPropertyType;
var getEntitySetInfo = oDataUtils.getEntitySetInfo;
var lookupNavigationPropertyEntitySet = oDataUtils.lookupNavigationPropertyEntitySet;
var lookupProperty = oDataUtils.lookupProperty;
var parseBool = oDataUtils.parseBool;
var parseDateTime = oDataUtils.parseDateTime;
var parseDateTimeOffset = oDataUtils.parseDateTimeOffset;
var parseDuration = oDataUtils.parseDuration;

// CONTENT START

var PAYLOADTYPE_OBJECT = "o";
var PAYLOADTYPE_FEED = "f";
var PAYLOADTYPE_PRIMITIVE = "p";
var PAYLOADTYPE_COLLECTION = "c";
var PAYLOADTYPE_SVCDOC = "s";
var PAYLOADTYPE_LINKS = "l";

var odataNs = "odata";
var odataAnnotationPrefix = odataNs + ".";

var bindAnnotation = "@" + odataAnnotationPrefix + "bind";
var metadataAnnotation = odataAnnotationPrefix + "metadata";
var navUrlAnnotation = odataAnnotationPrefix + "navigationLinkUrl";
var typeAnnotation = odataAnnotationPrefix + "type";

var jsonLightNameMap = {
    readLink: "self",
    editLink: "edit",
    nextLink: "__next",
    mediaReadLink: "media_src",
    mediaEditLink: "edit_media",
    mediaContentType: "content_type",
    mediaETag: "media_etag",
    count: "__count",
    media_src: "mediaReadLink",
    edit_media: "mediaEditLink",
    content_type: "mediaContentType",
    media_etag: "mediaETag",
    url: "uri"
};

var jsonLightAnnotations = {
    metadata: "odata.metadata",
    count: "odata.count",
    next: "odata.nextLink",
    id: "odata.id",
    etag: "odata.etag",
    read: "odata.readLink",
    edit: "odata.editLink",
    mediaRead: "odata.mediaReadLink",
    mediaEdit: "odata.mediaEditLink",
    mediaEtag: "odata.mediaETag",
    mediaContentType: "odata.mediaContentType",
    actions: "odata.actions",
    functions: "odata.functions",
    navigationUrl: "odata.navigationLinkUrl",
    associationUrl: "odata.associationLinkUrl",
    type: "odata.type"
};

var jsonLightAnnotationInfo = function (annotation) {
    /// <summary>Gets the name and target of an annotation in a JSON light payload.</summary>
    /// <param name="annotation" type="String">JSON light payload annotation.</param>
    /// <returns type="Object">Object containing the annotation name and the target property name.</param>

    if (annotation.indexOf(".") > 0) {
        var targetEnd = annotation.indexOf("@");
        var target = targetEnd > -1 ? annotation.substring(0, targetEnd) : null;
        var name = annotation.substring(targetEnd + 1);

        return {
            target: target,
            name: name,
            isOData: name.indexOf(odataAnnotationPrefix) === 0
        };
    }
    return null;
};

var jsonLightDataItemType = function (name, value, container, dataItemModel, model) {
    /// <summary>Gets the type name of a JSON light data item that belongs to a feed, an entry, a complex type property, or a collection property.</summary>
    /// <param name="name" type="String">Name of the data item for which the type name is going to be retrieved.</param>
    /// <param name="value">Value of the data item.</param>
    /// <param name="container" type="Object">JSON light object that owns the data item.</param>
    /// <param name="dataItemModel" type="Object" optional="true">Object describing the data item in an OData conceptual schema.</param>
    /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
    /// <remarks>
    ///    This function will first try to get the type name from the data item's value itself if it is a JSON light object; otherwise
    ///    it will try to get it from the odata.type annotation applied to the data item in the container. Then, it will fallback to the data item model.
    ///    If all attempts fail, it will return null.
    /// </remarks>
    /// <returns type="String">Data item type name; null if the type name cannot be found.</returns>

    return (isComplex(value) && value[typeAnnotation]) ||
        (container && container[name + "@" + typeAnnotation]) ||
        (dataItemModel && dataItemModel.type) ||
        (lookupNavigationPropertyType(dataItemModel, model)) ||
        null;
};

var jsonLightDataItemModel = function (name, containerModel) {
    /// <summary>Gets an object describing a data item in an OData conceptual schema.</summary>
    /// <param name="name" type="String">Name of the data item for which the model is going to be retrieved.</param>
    /// <param name="containerModel" type="Object">Object describing the owner of the data item in an OData conceptual schema.</param>
    /// <returns type="Object">Object describing the data item; null if it cannot be found.</returns>

    if (containerModel) {
        return lookupProperty(containerModel.property, name) ||
            lookupProperty(containerModel.navigationProperty, name);
    }
    return null;
};

var jsonLightIsEntry = function (data) {
    /// <summary>Determines whether data represents a JSON light entry object.</summary>
    /// <param name="data" type="Object">JSON light object to test.</param>
    /// <returns type="Boolean">True if the data is JSON light entry object; false otherwise.</returns>

    return isComplex(data) && ((odataAnnotationPrefix + "id") in data);
};

var jsonLightIsNavigationProperty = function (name, data, dataItemModel) {
    /// <summary>Determines whether a data item in a JSON light object is a navigation property.</summary>
    /// <param name="name" type="String">Name of the data item to test.</param>
    /// <param name="data" type="Object">JSON light object that owns the data item.</param>
    /// <param name="dataItemModel" type="Object">Object describing the data item in an OData conceptual schema.</param>
    /// <returns type="Boolean">True if the data item is a navigation property; false otherwise.</returns>

    djsassert(isComplex(data), "jsonLightIsNavProp - data is not an object!!");
    if (!!data[name + "@" + navUrlAnnotation] || (dataItemModel && dataItemModel.relationship)) {
        return true;
    }

    // Sniff the property value.
    var value = isArray(data[name]) ? data[name][0] : data[name];
    return jsonLightIsEntry(value);
};

var jsonLightIsPrimitiveType = function (typeName) {
    /// <summary>Determines whether a type name is a primitive type in a JSON light payload.</summary>
    /// <param name="typeName" type="String">Type name to test.</param>
    /// <returns type="Boolean">True if the type name an EDM primitive type or an OData spatial type; false otherwise.</returns>

    return isPrimitiveEdmType(typeName) || isGeographyEdmType(typeName) || isGeometryEdmType(typeName);
};

var jsonLightReadDataAnnotations = function (data, obj, baseURI, dataModel, model) {
    /// <summary>Converts annotations found in a JSON light payload object to either properties or metadata.</summary>
    /// <param name="data" type="Object">JSON light payload object containing the annotations to convert.</param>
    /// <param name="obj" type="Object">Object that will store the converted annotations.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
    /// <param name="dataModel" type="Object">Object describing the JSON light payload in an OData conceptual schema.</param>
    /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
    /// <returns>JSON light payload object with its annotations converted to either properties or metadata.</param>

    for (var name in data) {
        if (name.indexOf(".") > 0 && name.charAt(0) !== "#") {
            var annotationInfo = jsonLightAnnotationInfo(name);
            if (annotationInfo) {
                var annotationName = annotationInfo.name;
                var target = annotationInfo.target;
                var targetModel = null;
                var targetType = null;

                if (target) {
                    targetModel = jsonLightDataItemModel(target, dataModel);
                    targetType = jsonLightDataItemType(target, data[target], data, targetModel, model);
                }

                if (annotationInfo.isOData) {
                    jsonLightApplyPayloadODataAnnotation(annotationName, target, targetType, data[name], data, obj, baseURI);
                } else {
                    obj[name] = data[name];
                }
            }
        }
    }
    return obj;
};

var jsonLightApplyPayloadODataAnnotation = function (name, target, targetType, value, data, obj, baseURI) {
    /// <summary>
    ///   Processes a JSON Light payload OData annotation producing either a property, payload metadata, or property metadata on its owner object.
    /// </summary>
    /// <param name="name" type="String">Annotation name.</param>
    /// <param name="target" type="String">Name of the property that is being targeted by the annotation.</param>
    /// <param name="targetType" type="String">Type name of the target property.</param>
    /// <param name="data" type="Object">JSON light object containing the annotation.</param>
    /// <param name="obj" type="Object">Object that will hold properties produced by the annotation.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>

    var annotation = name.substring(odataAnnotationPrefix.length);

    switch (annotation) {
        case "navigationLinkUrl":
            jsonLightApplyNavigationUrlAnnotation(annotation, target, targetType, value, data, obj, baseURI);
            return;
        case "nextLink":
        case "count":
            jsonLightApplyFeedAnnotation(annotation, target, value, obj, baseURI);
            return;
        case "mediaReadLink":
        case "mediaEditLink":
        case "mediaContentType":
        case "mediaETag":
            jsonLightApplyMediaAnnotation(annotation, target, targetType, value, obj, baseURI);
            return;
        default:
            jsonLightApplyMetadataAnnotation(annotation, target, value, obj, baseURI);
            return;
    }
};

var jsonLightApplyMetadataAnnotation = function (name, target, value, obj, baseURI) {
    /// <summary>
    ///    Converts a JSON light annotation that applies to entry metadata only (i.e. odata.editLink or odata.readLink) and its value
    ///    into their library's internal representation and saves it back to data.
    /// </summary>
    /// <param name="name" type="String">Annotation name.</param>
    /// <param name="target" type="String">Name of the property on which the annotation should be applied.</param>
    /// <param name="value" type="Object">Annotation value.</param>
    /// <param name="obj" type="Object">Object that will hold properties produced by the annotation.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>

    var metadata = obj.__metadata = obj.__metadata || {};
    var mappedName = jsonLightNameMap[name] || name;

    if (name === "editLink") {
        metadata.uri = normalizeURI(value, baseURI);
        metadata[mappedName] = metadata.uri;
        return;
    }

    if (name === "readLink" || name === "associationLinkUrl") {
        value = normalizeURI(value, baseURI);
    }

    if (target) {
        var propertiesMetadata = metadata.properties = metadata.properties || {};
        var propertyMetadata = propertiesMetadata[target] = propertiesMetadata[target] || {};

        if (name === "type") {
            propertyMetadata[mappedName] = propertyMetadata[mappedName] || value;
            return;
        }
        propertyMetadata[mappedName] = value;
        return;
    }
    metadata[mappedName] = value;
};

var jsonLightApplyFeedAnnotation = function (name, target, value, obj, baseURI) {
    /// <summary>
    ///    Converts a JSON light annotation that applies to feeds only (i.e. odata.count or odata.nextlink) and its value
    ///    into their library's internal representation and saves it back to data.
    /// </summary>
    /// <param name="name" type="String">Annotation name.</param>
    /// <param name="target" type="String">Name of the property on which the annotation should be applied.</param>
    /// <param name="value" type="Object">Annotation value.</param>
    /// <param name="obj" type="Object">Object that will hold properties produced by the annotation.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>

    var mappedName = jsonLightNameMap[name];
    var feed = target ? obj[target] : obj;
    feed[mappedName] = (name === "nextLink") ? normalizeURI(value, baseURI) : value;
};

var jsonLightApplyMediaAnnotation = function (name, target, targetType, value, obj, baseURI) {
    /// <summary>
    ///    Converts a JSON light media annotation in and its value into their library's internal representation
    ///    and saves it back to data or metadata.
    /// </summary>
    /// <param name="name" type="String">Annotation name.</param>
    /// <param name="target" type="String">Name of the property on which the annotation should be applied.</param>
    /// <param name="targetType" type="String">Type name of the target property.</param>
    /// <param name="value" type="Object">Annotation value.</param>
    /// <param name="obj" type="Object">Object that will hold properties produced by the annotation.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>

    var metadata = obj.__metadata = obj.__metadata || {};
    var mappedName = jsonLightNameMap[name];

    if (name === "mediaReadLink" || name === "mediaEditLink") {
        value = normalizeURI(value, baseURI);
    }

    if (target) {
        var propertiesMetadata = metadata.properties = metadata.properties || {};
        var propertyMetadata = propertiesMetadata[target] = propertiesMetadata[target] || {};
        propertyMetadata.type = propertyMetadata.type || targetType;

        obj.__metadata = metadata;
        obj[target] = obj[target] || { __mediaresource: {} };
        obj[target].__mediaresource[mappedName] = value;
        return;
    }

    metadata[mappedName] = value;
};

var jsonLightApplyNavigationUrlAnnotation = function (name, target, targetType, value, data, obj, baseURI) {
    /// <summary>
    ///    Converts a JSON light navigation property annotation and its value into their library's internal representation
    ///    and saves it back to data o metadata.
    /// </summary>
    /// <param name="name" type="String">Annotation name.</param>
    /// <param name="target" type="String">Name of the property on which the annotation should be applied.</param>
    /// <param name="targetType" type="String">Type name of the target property.</param>
    /// <param name="value" type="Object">Annotation value.</param>
    /// <param name="data" type="Object">JSON light object containing the annotation.</param>
    /// <param name="obj" type="Object">Object that will hold properties produced by the annotation.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>

    var metadata = obj.__metadata = obj.__metadata || {};
    var propertiesMetadata = metadata.properties = metadata.properties || {};
    var propertyMetadata = propertiesMetadata[target] = propertiesMetadata[target] || {};
    var uri = normalizeURI(value, baseURI);

    if (data.hasOwnProperty(target)) {
        // The navigation property is inlined in the payload,
        // so the navigation link url should be pushed to the object's
        // property metadata instead.
        propertyMetadata.navigationLinkUrl = uri;
        return;
    }
    obj[target] = { __deferred: { uri: uri} };
    propertyMetadata.type = propertyMetadata.type || targetType;
};


var jsonLightReadDataItemValue = function (value, typeName, dataItemMetadata, baseURI, dataItemModel, model, recognizeDates) {
    /// <summary>Converts the value of a data item in a JSON light object to its library representation.</summary>
    /// <param name="value">Data item value to convert.</param>
    /// <param name="typeName" type="String">Type name of the data item.</param>
    /// <param name="dataItemMetadata" type="Object">Object containing metadata about the data item.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
    /// <param name="dataItemModel" type="Object" optional="true">Object describing the data item in an OData conceptual schema.</param>
    /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
    /// <param name="recognizeDates" type="Boolean" optional="true">Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.</param>
    /// <returns>Data item value in its library representation.</param>

    if (typeof value === "string") {
        return jsonLightReadStringPropertyValue(value, typeName, recognizeDates);
    }

    if (!jsonLightIsPrimitiveType(typeName)) {
        if (isArray(value)) {
            return jsonLightReadCollectionPropertyValue(value, typeName, dataItemMetadata, baseURI, model, recognizeDates);
        }

        if (isComplex(value)) {
            return jsonLightReadComplexPropertyValue(value, typeName, dataItemMetadata, baseURI, model, recognizeDates);
        }
    }
    return value;
};

var jsonLightReadStringPropertyValue = function (value, propertyType, recognizeDates) {
    /// <summary>Convertes the value of a string property in a JSON light object to its library representation.</summary>
    /// <param name="value" type="String">String value to convert.</param>
    /// <param name="propertyType" type="String">Type name of the property.</param>
    /// <param name="recognizeDates" type="Boolean" optional="true">Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.</param>
    /// <returns>String property value in its library representation.</returns>

    switch (propertyType) {
        case EDM_TIME:
            return parseDuration(value);
        case EDM_DATETIME:
            return parseDateTime(value, /*nullOnError*/false);
        case EDM_DATETIMEOFFSET:
            return parseDateTimeOffset(value, /*nullOnError*/false);
    }

    if (recognizeDates) {
        return parseDateTime(value, /*nullOnError*/true) ||
               parseDateTimeOffset(value, /*nullOnError*/true) ||
               value;
    }
    return value;
};

var jsonLightReadCollectionPropertyValue = function (value, propertyType, propertyMetadata, baseURI, model, recognizeDates) {
    /// <summary>Converts the value of a collection property in a JSON light object into its library representation.</summary>
    /// <param name="value" type="Array">Collection property value to convert.</param>
    /// <param name="propertyType" type="String">Property type name.</param>
    /// <param name="propertyMetadata" type="Object">Object containing metadata about the collection property.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
    /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
    /// <param name="recognizeDates" type="Boolean" optional="true">Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.</param>
    /// <returns type="Object">Collection property value in its library representation.</returns>

    var collectionType = getCollectionType(propertyType);
    var itemsMetadata = [];
    var items = [];

    var i, len;
    for (i = 0, len = value.length; i < len; i++) {
        var itemType = jsonLightDataItemType(null, value[i]) || collectionType;
        var itemMetadata = { type: itemType };
        var item = jsonLightReadDataItemValue(value[i], itemType, itemMetadata, baseURI, null, model, recognizeDates);

        if (!jsonLightIsPrimitiveType(itemType) && !isPrimitive(value[i])) {
            itemsMetadata.push(itemMetadata);
        }
        items.push(item);
    }

    if (itemsMetadata.length > 0) {
        propertyMetadata.elements = itemsMetadata;
    }

    return { __metadata: { type: propertyType }, results: items };
};

var jsonLightReadComplexPropertyValue = function (value, propertyType, propertyMetadata, baseURI, model, recognizeDates) {
    /// <summary>Converts the value of a comples property in a JSON light object into its library representation.</summary>
    /// <param name="value" type="Object">Complex property value to convert.</param>
    /// <param name="propertyType" type="String">Property type name.</param>
    /// <param name="propertyMetadata" type="Object">Object containing metadata about the complx type property.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
    /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
    /// <param name="recognizeDates" type="Boolean" optional="true">Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.</param>
    /// <returns type="Object">Complex property value in its library representation.</returns>

    var complexValue = jsonLightReadObject(value, { type: propertyType }, baseURI, model, recognizeDates);
    var complexMetadata = complexValue.__metadata;
    var complexPropertiesMetadata = complexMetadata.properties;

    if (complexPropertiesMetadata) {
        propertyMetadata.properties = complexPropertiesMetadata;
        delete complexMetadata.properties;
    }
    return complexValue;
};

var jsonLightReadNavigationPropertyValue = function (value, propertyInfo, baseURI, model, recognizeDates) {
    /// <summary>Converts the value of a navigation property in a JSON light object into its library representation.</summary>
    /// <param name="value">Navigation property property value to convert.</param>
    /// <param name="propertyInfo" type="String">Information about the property whether it's an entry, feed or complex type.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
    /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
    /// <param name="recognizeDates" type="Boolean" optional="true">Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.</param>
    /// <returns type="Object">Collection property value in its library representation.</returns>

    if (isArray(value)) {
        return jsonLightReadFeed(value, propertyInfo, baseURI, model, recognizeDates);
    }

    if (isComplex(value)) {
        return jsonLightReadObject(value, propertyInfo, baseURI, model, recognizeDates);
    }
    return null;
};

var jsonLightReadObject = function (data, objectInfo, baseURI, model, recognizeDates) {
    /// <summary>Converts a JSON light entry or complex type object into its library representation.</summary>
    /// <param name="data" type="Object">JSON light entry or complex type object to convert.</param>
    /// <param name="objectInfo" type="Object">Information about the entry or complex.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
    /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
    /// <param name="recognizeDates" type="Boolean" optional="true">Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.</param>
    /// <returns type="Object">Entry or complex type object.</param>

    objectInfo = objectInfo || {};
    var actualType = data[typeAnnotation] || objectInfo.type || null;
    var dataModel = lookupEntityType(actualType, model);
    var isEntry = true;
    if (!dataModel) {
        isEntry = false;
        dataModel = lookupComplexType(actualType, model);
    }

    var metadata = { type: actualType };
    var obj = { __metadata: metadata };
    var propertiesMetadata = {};
    var baseTypeModel;
    if (isEntry && dataModel && objectInfo.entitySet && objectInfo.contentTypeOdata == "minimalmetadata") {
        var serviceURI = baseURI.substring(0, baseURI.lastIndexOf("$metadata"));
        baseTypeModel = null; // check if the key model is in a parent type.
        if (!dataModel.key) {
            baseTypeModel = dataModel;
        }
        while (!!baseTypeModel && !baseTypeModel.key && baseTypeModel.baseType) {
            baseTypeModel = lookupEntityType(baseTypeModel.baseType, model);
        }

        if (dataModel.key || (!!baseTypeModel && baseTypeModel.key)) {
            var entryKey;
            if (dataModel.key) {
                entryKey = jsonLightGetEntryKey(data, dataModel);
            } else {
                entryKey = jsonLightGetEntryKey(data, baseTypeModel);
            }
            if (entryKey) {
                var entryInfo = {
                    key: entryKey,
                    entitySet: objectInfo.entitySet,
                    functionImport: objectInfo.functionImport,
                    containerName: objectInfo.containerName
                };
                jsonLightComputeUrisIfMissing(data, entryInfo, actualType, serviceURI, dataModel, baseTypeModel);
            }
        }
    }

    for (var name in data) {
        if (name.indexOf("#") === 0) {
            // This is an advertised function or action.
            jsonLightReadAdvertisedFunctionOrAction(name.substring(1), data[name], obj, baseURI, model);
        } else {
            // Is name NOT an annotation?
            if (name.indexOf(".") === -1) {
                if (!metadata.properties) {
                    metadata.properties = propertiesMetadata;
                }

                var propertyValue = data[name];
                var propertyModel = propertyModel = jsonLightDataItemModel(name, dataModel);
                baseTypeModel = dataModel;
                while (!!dataModel && propertyModel === null && baseTypeModel.baseType) {
                    baseTypeModel = lookupEntityType(baseTypeModel.baseType, model);
                    propertyModel = propertyModel = jsonLightDataItemModel(name, baseTypeModel);
                }
                var isNavigationProperty = jsonLightIsNavigationProperty(name, data, propertyModel);
                var propertyType = jsonLightDataItemType(name, propertyValue, data, propertyModel, model);
                var propertyMetadata = propertiesMetadata[name] = propertiesMetadata[name] || { type: propertyType };
                if (isNavigationProperty) {
                    var propertyInfo = {};
                    if (objectInfo.entitySet !== undefined) {
                        var navigationPropertyEntitySetName = lookupNavigationPropertyEntitySet(propertyModel, objectInfo.entitySet.name, model);
                        propertyInfo = getEntitySetInfo(navigationPropertyEntitySetName, model);
                    }
                    propertyInfo.contentTypeOdata = objectInfo.contentTypeOdata;
                    propertyInfo.kind = objectInfo.kind;
                    propertyInfo.type = propertyType;
                    obj[name] = jsonLightReadNavigationPropertyValue(propertyValue, propertyInfo, baseURI, model, recognizeDates);
                } else {
                    obj[name] = jsonLightReadDataItemValue(propertyValue, propertyType, propertyMetadata, baseURI, propertyModel, model, recognizeDates);
                }
            }
        }
    }

    return jsonLightReadDataAnnotations(data, obj, baseURI, dataModel, model);
};

var jsonLightReadAdvertisedFunctionOrAction = function (name, value, obj, baseURI, model) {
    /// <summary>Converts a JSON light advertised action or function object into its library representation.</summary>
    /// <param name="name" type="String">Advertised action or function name.</param>
    /// <param name="value">Advertised action or function value.</param>
    /// <param name="obj" type="Object">Object that will the converted value of the advertised action or function.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing the action's or function's relative URIs.</param>
    /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
    /// <remarks>
    ///     Actions and functions have the same representation in json light, so to disambiguate them the function uses
    ///     the model object.  If available, the function will look for the functionImport object that describes the
    ///     the action or the function.  If for whatever reason the functionImport can't be retrieved from the model (like
    ///     there is no model available or there is no functionImport within the model), then the value is going to be treated
    ///     as an advertised action and stored under obj.__metadata.actions.
    /// </remarks>

    if (!name || !isArray(value) && !isComplex(value)) {
        return;
    }

    var isFunction = false;
    var nsEnd = name.lastIndexOf(".");
    var simpleName = name.substring(nsEnd + 1);
    var containerName = (nsEnd > -1) ? name.substring(0, nsEnd) : "";

    var container = (simpleName === name || containerName.indexOf(".") === -1) ?
        lookupDefaultEntityContainer(model) :
        lookupEntityContainer(containerName, model);

    if (container) {
        var functionImport = lookupFunctionImport(container.functionImport, simpleName);
        if (functionImport && !!functionImport.isSideEffecting) {
            isFunction = !parseBool(functionImport.isSideEffecting);
        }
    }

    var metadata = obj.__metadata;
    var targetName = isFunction ? "functions" : "actions";
    var metadataURI = normalizeURI(name, baseURI);
    var items = (isArray(value)) ? value : [value];

    var i, len;
    for (i = 0, len = items.length; i < len; i++) {
        var item = items[i];
        if (item) {
            var targetCollection = metadata[targetName] = metadata[targetName] || [];
            var actionOrFunction = { metadata: metadataURI, title: item.title, target: normalizeURI(item.target, baseURI) };
            targetCollection.push(actionOrFunction);
        }
    }
};

var jsonLightReadFeed = function (data, feedInfo, baseURI, model, recognizeDates) {
    /// <summary>Converts a JSON light feed or top level collection property object into its library representation.</summary>
    /// <param name="data" type="Object">JSON light feed object to convert.</param>
    /// <param name="typeName" type="String">Type name of the feed or collection items.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
    /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
    /// <param name="recognizeDates" type="Boolean" optional="true">Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.</param>
    /// <returns type="Object">Feed or top level collection object.</param>

    var items = isArray(data) ? data : data.value;
    var entries = [];
    var i, len, entry;
    for (i = 0, len = items.length; i < len; i++) {
        entry = jsonLightReadObject(items[i], feedInfo, baseURI, model, recognizeDates);
        entries.push(entry);
    }

    var feed = { results: entries };

    if (isComplex(data)) {
        for (var name in data) {
            if (name.indexOf("#") === 0) {
                // This is an advertised function or action.
                feed.__metadata = feed.__metadata || {};
                jsonLightReadAdvertisedFunctionOrAction(name.substring(1), data[name], feed, baseURI, model);
            }
        }
        feed = jsonLightReadDataAnnotations(data, feed, baseURI);
    }
    return feed;
};

var jsonLightGetEntryKey = function (data, entityModel) {
    /// <summary>Gets the key of an entry.</summary>
    /// <param name="data" type="Object">JSON light entry.</param>
    /// <param name="entityModel" type="String">Object describing the entry Model</param>
    /// <returns type="string">Entry instance key.</returns>

    var entityInstanceKey;
    var entityKeys = entityModel.key.propertyRef;
    var type;
    entityInstanceKey = "(";
    if (entityKeys.length == 1) {
        type = lookupProperty(entityModel.property, entityKeys[0].name).type;
        entityInstanceKey += formatLiteral(data[entityKeys[0].name], type);
    } else {
        var first = true;
        for (var i = 0; i < entityKeys.length; i++) {
            if (!first) {
                entityInstanceKey += ",";
            } else {
                first = false;
            }
            type = lookupProperty(entityModel.property, entityKeys[i].name).type;
            entityInstanceKey += entityKeys[i].name + "=" + formatLiteral(data[entityKeys[i].name], type);
        }
    }
    entityInstanceKey += ")";
    return entityInstanceKey;
};


var jsonLightComputeUrisIfMissing = function (data, entryInfo, actualType, serviceURI, entityModel, baseTypeModel) {
    /// <summary>Compute the URI according to OData conventions if it doesn't exist</summary>
    /// <param name="data" type="Object">JSON light entry.</param>
    /// <param name="entryInfo" type="Object">Information about the entry includes type, key, entitySet and entityContainerName.</param>
    /// <param name="actualType" type="String">Type of the entry</param>
    /// <param name="serviceURI" type="String">Base URI the service.</param>
    /// <param name="entityModel" type="Object">Object describing an OData conceptual schema of the entry.</param>
    /// <param name="baseTypeModel" type="Object" optional="true">Object escribing an OData conceptual schema of the baseType if it exists.</param>

    var lastIdSegment = data[jsonLightAnnotations.id] || data[jsonLightAnnotations.read] || data[jsonLightAnnotations.edit] || entryInfo.entitySet.name + entryInfo.key;
    data[jsonLightAnnotations.id] = serviceURI + lastIdSegment;
    if (!data[jsonLightAnnotations.edit]) {
        data[jsonLightAnnotations.edit] = entryInfo.entitySet.name + entryInfo.key;
        if (entryInfo.entitySet.entityType != actualType) {
            data[jsonLightAnnotations.edit] += "/" + actualType;
        }
    }
    data[jsonLightAnnotations.read] = data[jsonLightAnnotations.read] || data[jsonLightAnnotations.edit];
    if (!data[jsonLightAnnotations.etag]) {
        var etag = jsonLightComputeETag(data, entityModel, baseTypeModel);
        if (!!etag) {
            data[jsonLightAnnotations.etag] = etag;
        }
    }

    jsonLightComputeStreamLinks(data, entityModel, baseTypeModel);
    jsonLightComputeNavigationAndAssociationProperties(data, entityModel, baseTypeModel);
    jsonLightComputeFunctionImports(data, entryInfo);
};

var jsonLightComputeETag = function (data, entityModel, baseTypeModel) {
    /// <summary>Computes the etag of an entry</summary>
    /// <param name="data" type="Object">JSON light entry.</param>
    /// <param name="entryInfo" type="Object">Object describing the entry model.</param>
    /// <param name="baseTypeModel" type="Object"  optional="true">Object describing an OData conceptual schema of the baseType if it exists.</param>
    /// <returns type="string">Etag value</returns>
    var etag = "";
    var propertyModel;
    for (var i = 0; entityModel.property && i < entityModel.property.length; i++) {
        propertyModel = entityModel.property[i];
        etag = jsonLightAppendValueToEtag(data, etag, propertyModel);

    }
    if (baseTypeModel) {
        for (i = 0; baseTypeModel.property && i < baseTypeModel.property.length; i++) {
            propertyModel = baseTypeModel.property[i];
            etag = jsonLightAppendValueToEtag(data, etag, propertyModel);
        }
    }
    if (etag.length > 0) {
        return etag + "\"";
    }
    return null;
};

var jsonLightAppendValueToEtag = function (data, etag, propertyModel) {
    /// <summary>Adds a propery value to the etag after formatting.</summary>
    /// <param name="data" type="Object">JSON light entry.</param>
    /// <param name="etag" type="Object">value of the etag.</param>
    /// <param name="propertyModel" type="Object">Object describing an OData conceptual schema of the property.</param>
    /// <returns type="string">Etag value</returns>

    if (propertyModel.concurrencyMode == "Fixed") {
        if (etag.length > 0) {
            etag += ",";
        } else {
            etag += "W/\"";
        }
        if (data[propertyModel.name] !== null) {
            etag += formatLiteral(data[propertyModel.name], propertyModel.type);
        } else {
            etag += "null";
        }
    }
    return etag;
};

var jsonLightComputeNavigationAndAssociationProperties = function (data, entityModel, baseTypeModel) {
    /// <summary>Adds navigation links to the entry metadata</summary>
    /// <param name="data" type="Object">JSON light entry.</param>
    /// <param name="entityModel" type="Object">Object describing the entry model.</param>
    /// <param name="baseTypeModel" type="Object"  optional="true">Object describing an OData conceptual schema of the baseType if it exists.</param>

    var navigationLinkAnnotation = "@odata.navigationLinkUrl";
    var associationLinkAnnotation = "@odata.associationLinkUrl";
    var navigationPropertyName, navigationPropertyAnnotation, associationPropertyAnnotation;
    for (var i = 0; entityModel.navigationProperty && i < entityModel.navigationProperty.length; i++) {
        navigationPropertyName = entityModel.navigationProperty[i].name;
        navigationPropertyAnnotation = navigationPropertyName + navigationLinkAnnotation;
        if (data[navigationPropertyAnnotation] === undefined) {
            data[navigationPropertyAnnotation] = data[jsonLightAnnotations.edit] + "/" + encodeURIComponent(navigationPropertyName);
        }
        associationPropertyAnnotation = navigationPropertyName + associationLinkAnnotation;
        if (data[associationPropertyAnnotation] === undefined) {
            data[associationPropertyAnnotation] = data[jsonLightAnnotations.edit] + "/$links/" + encodeURIComponent(navigationPropertyName);
        }
    }

    if (baseTypeModel && baseTypeModel.navigationProperty) {
        for (i = 0; i < baseTypeModel.navigationProperty.length; i++) {
            navigationPropertyName = baseTypeModel.navigationProperty[i].name;
            navigationPropertyAnnotation = navigationPropertyName + navigationLinkAnnotation;
            if (data[navigationPropertyAnnotation] === undefined) {
                data[navigationPropertyAnnotation] = data[jsonLightAnnotations.edit] + "/" + encodeURIComponent(navigationPropertyName);
            }
            associationPropertyAnnotation = navigationPropertyName + associationLinkAnnotation;
            if (data[associationPropertyAnnotation] === undefined) {
                data[associationPropertyAnnotation] = data[jsonLightAnnotations.edit] + "/$links/" + encodeURIComponent(navigationPropertyName);
            }
        }
    }
};

var formatLiteral = function (value, type) {
    /// <summary>Formats a value according to Uri literal format</summary>
    /// <param name="value">Value to be formatted.</param>
    /// <param name="type">Edm type of the value</param>
    /// <returns type="string">Value after formatting</returns>

    value = "" + formatRowLiteral(value, type);
    value = encodeURIComponent(value.replace("'", "''"));
    switch ((type)) {
        case "Edm.Binary":
            return "X'" + value + "'";
        case "Edm.DateTime":
            return "datetime" + "'" + value + "'";
        case "Edm.DateTimeOffset":
            return "datetimeoffset" + "'" + value + "'";
        case "Edm.Decimal":
            return value + "M";
        case "Edm.Guid":
            return "guid" + "'" + value + "'";
        case "Edm.Int64":
            return value + "L";
        case "Edm.Float":
            return value + "f";
        case "Edm.Double":
            return value + "D";
        case "Edm.Geography":
            return "geography" + "'" + value + "'";
        case "Edm.Geometry":
            return "geometry" + "'" + value + "'";
        case "Edm.Time":
            return "time" + "'" + value + "'";
        case "Edm.String":
            return "'" + value + "'";
        default:
            return value;
    }
};


var formatRowLiteral = function (value, type) {
    switch (type) {
        case "Edm.Binary":
            return convertByteArrayToHexString(value);
        default:
            return value;
    }
};

var jsonLightComputeFunctionImports = function (data, entryInfo) {
    /// <summary>Adds functions and actions links to the entry metadata</summary>
    /// <param name="entry" type="Object">JSON light entry.</param>
    /// <param name="entityInfo" type="Object">Object describing the entry</param>

    var functionImport = entryInfo.functionImport || [];
    for (var i = 0; i < functionImport.length; i++) {
        if (functionImport[i].isBindable && functionImport[i].parameter[0] && functionImport[i].parameter[0].type == entryInfo.entitySet.entityType) {
            var functionImportAnnotation = "#" + entryInfo.containerName + "." + functionImport[i].name;
            if (data[functionImportAnnotation] == undefined) {
                data[functionImportAnnotation] = {
                    title: functionImport[i].name,
                    target: data[jsonLightAnnotations.edit] + "/" + functionImport[i].name
                };
            }
        }
    }
};

var jsonLightComputeStreamLinks = function (data, entityModel, baseTypeModel) {
    /// <summary>Adds stream links to the entry metadata</summary>
    /// <param name="data" type="Object">JSON light entry.</param>
    /// <param name="entityModel" type="Object">Object describing the entry model.</param>
    /// <param name="baseTypeModel" type="Object"  optional="true">Object describing an OData conceptual schema of the baseType if it exists.</param>

    if (entityModel.hasStream || (baseTypeModel && baseTypeModel.hasStream)) {
        data[jsonLightAnnotations.mediaEdit] = data[jsonLightAnnotations.mediaEdit] || data[jsonLightAnnotations.mediaEdit] + "/$value";
        data[jsonLightAnnotations.mediaRead] = data[jsonLightAnnotations.mediaRead] || data[jsonLightAnnotations.mediaEdit];
    }
};

var jsonLightReadTopPrimitiveProperty = function (data, typeName, baseURI, recognizeDates) {
    /// <summary>Converts a JSON light top level primitive property object into its library representation.</summary>
    /// <param name="data" type="Object">JSON light feed object to convert.</param>
    /// <param name="typeName" type="String">Type name of the primitive property.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
    /// <param name="recognizeDates" type="Boolean" optional="true">Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.</param>
    /// <returns type="Object">Top level primitive property object.</param>

    var metadata = { type: typeName };
    var value = jsonLightReadDataItemValue(data.value, typeName, metadata, baseURI, null, null, recognizeDates);
    return jsonLightReadDataAnnotations(data, { __metadata: metadata, value: value }, baseURI);
};

var jsonLightReadTopCollectionProperty = function (data, typeName, baseURI, model, recognizeDates) {
    /// <summary>Converts a JSON light top level collection property object into its library representation.</summary>
    /// <param name="data" type="Object">JSON light feed object to convert.</param>
    /// <param name="typeName" type="String">Type name of the collection property.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
    /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
    /// <param name="recognizeDates" type="Boolean" optional="true">Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.</param>
    /// <returns type="Object">Top level collection property object.</param>

    var propertyMetadata = {};
    var value = jsonLightReadCollectionPropertyValue(data.value, typeName, propertyMetadata, baseURI, model, recognizeDates);
    extend(value.__metadata, propertyMetadata);
    return jsonLightReadDataAnnotations(data, value, baseURI);
};

var jsonLightReadLinksDocument = function (data, baseURI) {
    /// <summary>Converts a JSON light links collection object to its library representation.</summary>
    /// <param name="data" type="Object">JSON light link object to convert.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
    /// <returns type="Object">Links collection object.</param>

    var items = data.value;
    if (!isArray(items)) {
        return jsonLightReadLink(data, baseURI);
    }

    var results = [];
    var i, len;
    for (i = 0, len = items.length; i < len; i++) {
        results.push(jsonLightReadLink(items[i], baseURI));
    }

    var links = { results: results };
    return jsonLightReadDataAnnotations(data, links, baseURI);
};

var jsonLightReadLink = function (data, baseURI) {
    /// <summary>Converts a JSON light link object to its library representation.</summary>
    /// <param name="data" type="Object">JSON light link object to convert.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
    /// <returns type="Object">Link object.</param>

    var link = { uri: normalizeURI(data.url, baseURI) };

    link = jsonLightReadDataAnnotations(data, link, baseURI);
    var metadata = link.__metadata || {};
    var metadataProperties = metadata.properties || {};

    jsonLightRemoveTypePropertyMetadata(metadataProperties.url);
    renameProperty(metadataProperties, "url", "uri");

    return link;
};

var jsonLightRemoveTypePropertyMetadata = function (propertyMetadata) {
    /// <summary>Removes the type property from a property metadata object.</summary>
    /// <param name="propertyMetadata" type="Object">Property metadata object.</param>

    if (propertyMetadata) {
        delete propertyMetadata.type;
    }
};

var jsonLightReadSvcDocument = function (data, baseURI) {
    /// <summary>Converts a JSON light service document object to its library representation.</summary>
    /// <param name="data" type="Object">JSON light service document object to convert.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
    /// <returns type="Object">Link object.</param>

    var items = data.value;
    var collections = [];
    var workspace = jsonLightReadDataAnnotations(data, { collections: collections }, baseURI);

    var metadata = workspace.__metadata || {};
    var metadataProperties = metadata.properties || {};

    jsonLightRemoveTypePropertyMetadata(metadataProperties.value);
    renameProperty(metadataProperties, "value", "collections");

    var i, len;
    for (i = 0, len = items.length; i < len; i++) {
        var item = items[i];
        var collection = { title: item.name, href: normalizeURI(item.url, baseURI) };

        collection = jsonLightReadDataAnnotations(item, collection, baseURI);
        metadata = collection.__metadata || {};
        metadataProperties = metadata.properties || {};

        jsonLightRemoveTypePropertyMetadata(metadataProperties.name);
        jsonLightRemoveTypePropertyMetadata(metadataProperties.url);

        renameProperty(metadataProperties, "name", "title");
        renameProperty(metadataProperties, "url", "href");

        collections.push(collection);
    }

    return { workspaces: [workspace] };
};

var jsonLightMakePayloadInfo = function (kind, type) {
    /// <summary>Creates an object containing information for the json light payload.</summary>
    /// <param name="kind" type="String">JSON light payload kind, one of the PAYLOADTYPE_XXX constant values.</param>
    /// <param name="typeName" type="String">Type name of the JSON light payload.</param>
    /// <returns type="Object">Object with kind and type fields.</returns>

    /// <field name="kind" type="String">Kind of the JSON light payload. One of the PAYLOADTYPE_XXX constant values.</field>
    /// <field name="type" type="String">Data type of the JSON light payload.</field>

    return { kind: kind, type: type || null };
};

var jsonLightPayloadInfo = function (data, model, inferFeedAsComplexType) {
    /// <summary>Infers the information describing the JSON light payload from its metadata annotation, structure, and data model.</summary>
    /// <param name="data" type="Object">Json light response payload object.</param>
    /// <param name="model" type="Object">Object describing an OData conceptual schema.</param>
    /// <param name="inferFeedAsComplexType" type="Boolean">True if a JSON light payload that looks like a feed should be treated as a complex type property instead.</param>
    /// <remarks>
    ///     If the arguments passed to the function don't convey enough information about the payload to determine without doubt that the payload is a feed then it
    ///     will try to use the payload object structure instead.  If the payload looks like a feed (has value property that is an array or non-primitive values) then
    ///     the function will report its kind as PAYLOADTYPE_FEED unless the inferFeedAsComplexType flag is set to true. This flag comes from the user request
    ///     and allows the user to control how the library behaves with an ambigous JSON light payload.
    /// </remarks>
    /// <returns type="Object">
    ///     Object with kind and type fields. Null if there is no metadata annotation or the payload info cannot be obtained..
    /// </returns>

    var metadataUri = data[metadataAnnotation];
    if (!metadataUri || typeof metadataUri !== "string") {
        return null;
    }

    var fragmentStart = metadataUri.lastIndexOf("#");
    if (fragmentStart === -1) {
        return jsonLightMakePayloadInfo(PAYLOADTYPE_SVCDOC);
    }

    var elementStart = metadataUri.indexOf("@Element", fragmentStart);
    var fragmentEnd = elementStart - 1;

    if (fragmentEnd < 0) {
        fragmentEnd = metadataUri.indexOf("?", fragmentStart);
        if (fragmentEnd === -1) {
            fragmentEnd = metadataUri.length;
        }
    }

    var fragment = metadataUri.substring(fragmentStart + 1, fragmentEnd);
    if (fragment.indexOf("/$links/") > 0) {
        return jsonLightMakePayloadInfo(PAYLOADTYPE_LINKS);
    }

    var fragmentParts = fragment.split("/");
    if (fragmentParts.length >= 0) {
        var qualifiedName = fragmentParts[0];
        var typeCast = fragmentParts[1];

        if (jsonLightIsPrimitiveType(qualifiedName)) {
            return jsonLightMakePayloadInfo(PAYLOADTYPE_PRIMITIVE, qualifiedName);
        }

        if (isCollectionType(qualifiedName)) {
            return jsonLightMakePayloadInfo(PAYLOADTYPE_COLLECTION, qualifiedName);
        }

        var entityType = typeCast;
        var entitySet, functionImport, containerName;
        if (!typeCast) {
            var nsEnd = qualifiedName.lastIndexOf(".");
            var simpleName = qualifiedName.substring(nsEnd + 1);
            var container = (simpleName === qualifiedName) ?
                lookupDefaultEntityContainer(model) :
                lookupEntityContainer(qualifiedName.substring(0, nsEnd), model);

            if (container) {
                entitySet = lookupEntitySet(container.entitySet, simpleName);
                functionImport = container.functionImport;
                containerName = container.name;
                entityType = !!entitySet ? entitySet.entityType : null;
            }
        }

        var info;
        if (elementStart > 0) {
            info = jsonLightMakePayloadInfo(PAYLOADTYPE_OBJECT, entityType);
            info.entitySet = entitySet;
            info.functionImport = functionImport;
            info.containerName = containerName;
            return info;
        }

        if (entityType) {
            info = jsonLightMakePayloadInfo(PAYLOADTYPE_FEED, entityType);
            info.entitySet = entitySet;
            info.functionImport = functionImport;
            info.containerName = containerName;
            return info;
        }

        if (isArray(data.value) && !lookupComplexType(qualifiedName, model)) {
            var item = data.value[0];
            if (!isPrimitive(item)) {
                if (jsonLightIsEntry(item) || !inferFeedAsComplexType) {
                    return jsonLightMakePayloadInfo(PAYLOADTYPE_FEED, null);
                }
            }
        }

        return jsonLightMakePayloadInfo(PAYLOADTYPE_OBJECT, qualifiedName);
    }

    return null;
};

var jsonLightReadPayload = function (data, model, recognizeDates, inferFeedAsComplexType, contentTypeOdata) {
    /// <summary>Converts a JSON light response payload object into its library's internal representation.</summary>
    /// <param name="data" type="Object">Json light response payload object.</param>
    /// <param name="model" type="Object">Object describing an OData conceptual schema.</param>
    /// <param name="recognizeDates" type="Boolean" optional="true">Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.</param>
    /// <param name="inferFeedAsComplexType" type="Boolean">True if a JSON light payload that looks like a feed should be reported as a complex type property instead.</param>
    /// <param name="contentTypeOdata" type="string">Includes the type of json ( minimalmetadata, fullmetadata .. etc )</param>
    /// <returns type="Object">Object in the library's representation.</returns>

    if (!isComplex(data)) {
        return data;
    }

    contentTypeOdata = contentTypeOdata || "minimalmetadata";
    var baseURI = data[metadataAnnotation];
    var payloadInfo = jsonLightPayloadInfo(data, model, inferFeedAsComplexType);
    if (assigned(payloadInfo)) {
        payloadInfo.contentTypeOdata = contentTypeOdata;
    }
    var typeName = null;
    if (payloadInfo) {
        delete data[metadataAnnotation];

        typeName = payloadInfo.type;
        switch (payloadInfo.kind) {
            case PAYLOADTYPE_FEED:
                return jsonLightReadFeed(data, payloadInfo, baseURI, model, recognizeDates);
            case PAYLOADTYPE_COLLECTION:
                return jsonLightReadTopCollectionProperty(data, typeName, baseURI, model, recognizeDates);
            case PAYLOADTYPE_PRIMITIVE:
                return jsonLightReadTopPrimitiveProperty(data, typeName, baseURI, recognizeDates);
            case PAYLOADTYPE_SVCDOC:
                return jsonLightReadSvcDocument(data, baseURI);
            case PAYLOADTYPE_LINKS:
                return jsonLightReadLinksDocument(data, baseURI);
        }
    }
    return jsonLightReadObject(data, payloadInfo, baseURI, model, recognizeDates);
};

var jsonLightSerializableMetadata = ["type", "etag", "media_src", "edit_media", "content_type", "media_etag"];

var formatJsonLight = function (obj, context) {
    /// <summary>Converts an object in the library's internal representation to its json light representation.</summary>
    /// <param name="obj" type="Object">Object the library's internal representation.</param>
    /// <param name="context" type="Object">Object with the serialization context.</param>
    /// <returns type="Object">Object in its json light representation.</returns>

    // Regular expression used to test that the uri is for a $links document.
    var linksUriRE = /\/\$links\//;
    var data = {};
    var metadata = obj.__metadata;

    var islinks = context && linksUriRE.test(context.request.requestUri);
    formatJsonLightData(obj, (metadata && metadata.properties), data, islinks);
    return data;
};

var formatJsonLightMetadata = function (metadata, data) {
    /// <summary>Formats an object's metadata into the appropriate json light annotations and saves them to data.</summary>
    /// <param name="obj" type="Object">Object whose metadata is going to be formatted as annotations.</param>
    /// <param name="data" type="Object">Object on which the annotations are going to be stored.</param>

    if (metadata) {
        var i, len;
        for (i = 0, len = jsonLightSerializableMetadata.length; i < len; i++) {
            // There is only a subset of metadata values that are interesting during update requests.
            var name = jsonLightSerializableMetadata[i];
            var qName = odataAnnotationPrefix + (jsonLightNameMap[name] || name);
            formatJsonLightAnnotation(qName, null, metadata[name], data);
        }
    }
};

var formatJsonLightData = function (obj, pMetadata, data, isLinks) {
    /// <summary>Formats an object's data into the appropriate json light values and saves them to data.</summary>
    /// <param name="obj" type="Object">Object whose data is going to be formatted.</param>
    /// <param name="pMetadata" type="Object">Object that contains metadata for the properties that are being formatted.</param>
    /// <param name="data" type="Object">Object on which the formatted values are going to be stored.</param>
    /// <param name="isLinks" type="Boolean">True if a links document is being formatted.  False otherwise.</param>

    for (var key in obj) {
        var value = obj[key];
        if (key === "__metadata") {
            // key is the object metadata.
            formatJsonLightMetadata(value, data);
        } else if (key.indexOf(".") === -1) {
            // key is an regular property or array element.
            if (isLinks && key === "uri") {
                formatJsonLightEntityLink(value, data);
            } else {
                formatJsonLightProperty(key, value, pMetadata, data, isLinks);
            }
        } else {
            data[key] = value;
        }
    }
};

var formatJsonLightProperty = function (name, value, pMetadata, data) {
    /// <summary>Formats an object's value identified by name to its json light representation and saves it to data.</summary>
    /// <param name="name" type="String">Property name.</param>
    /// <param name="value">Property value.</param>
    /// <param name="pMetadata" type="Object">Object that contains metadata for the property that is being formatted.</param>
    /// <param name="data" type="Object">Object on which the formatted value is going to be stored.</param>

    // Get property type from property metadata
    var propertyMetadata = pMetadata && pMetadata[name] || { properties: undefined, type: undefined };
    var typeName = dataItemTypeName(value, propertyMetadata);

    if (isPrimitive(value) || !value) {
        // It is a primitive value then.
        formatJsonLightAnnotation(typeAnnotation, name, typeName, data);
        data[name] = value;
        return;
    }

    if (isFeed(value, typeName) || isEntry(value)) {
        formatJsonLightInlineProperty(name, value, data);
        return;
    }

    if (!typeName && isDeferred(value)) {
        // It is really a deferred property.
        formatJsonLightDeferredProperty(name, value, data);
        return;
    }

    if (isCollection(value, typeName)) {
        // The thing is a collection, format it as one.
        if (getCollectionType(typeName)) {
            formatJsonLightAnnotation(typeAnnotation, name, typeName, data);
        }
        formatJsonLightCollectionProperty(name, value, data);
        return;
    }

    djsassert(isComplex(value), "formatJsonLightProperty - Value is not a complex type value");

    // Format the complex property value in a new object in data[name].
    data[name] = {};
    formatJsonLightAnnotation(typeAnnotation, null, typeName, data[name]);
    formatJsonLightData(value, propertyMetadata.properties, data[name]);
};

var formatJsonLightEntityLink = function (value, data) {
    /// <summary>Formats an entity link in a $links document and saves it into data.</summary>
    /// <param name="value" type="String">Entity link value.</summary>
    /// <param name="data" type="Object">Object on which the formatted value is going to be stored.</param>
    data.url = value;
};

var formatJsonLightDeferredProperty = function (name, value, data) {
    /// <summary>Formats the object value's identified by name as an odata.navigalinkurl annotation and saves it to data.</summary>
    /// <param name="name" type="String">Name of the deferred property to be formatted.</param>
    /// <param name="value" type="Object">Deferred property value to be formatted.</param>
    /// <param name="data" type="Object">Object on which the formatted value is going to be stored.</param>

    formatJsonLightAnnotation(navUrlAnnotation, name, value.__deferred.uri, data);
};

var formatJsonLightCollectionProperty = function (name, value, data) {
    /// <summary>Formats a collection property in obj identified by name as a json light collection property and saves it to data.</summary>
    /// <param name="name" type="String">Name of the collection property to be formatted.</param>
    /// <param name="value" type="Object">Collection property value to be formatted.</param>
    /// <param name="data" type="Object">Object on which the formatted value is going to be stored.</param>

    data[name] = [];
    var items = isArray(value) ? value : value.results;
    formatJsonLightData(items, null, data[name]);
};

var formatJsonLightInlineProperty = function (name, value, data) {
    /// <summary>Formats an inline feed or entry property in obj identified by name as a json light value and saves it to data.</summary>
    /// <param name="name" type="String">Name of the inline feed or entry property to be formatted.</param>
    /// <param name="value" type="Object or Array">Value of the inline feed or entry property.</param>
    /// <param name="data" type="Object">Object on which the formatted value is going to be stored.</param>

    if (isFeed(value)) {
        data[name] = [];
        // Format each of the inline feed entries
        var entries = isArray(value) ? value : value.results;
        var i, len;
        for (i = 0, len = entries.length; i < len; i++) {
            formatJsonLightInlineEntry(name, entries[i], true, data);
        }
        return;
    }
    formatJsonLightInlineEntry(name, value, false, data);
};

var formatJsonLightInlineEntry = function (name, value, inFeed, data) {
    /// <summary>Formats an inline entry value in the property identified by name as a json light value and saves it to data.</summary>
    /// <param name="name" type="String">Name of the inline feed or entry property that owns the entry formatted.</param>
    /// <param name="value" type="Object">Inline entry value to be formatted.</param>
    /// <param name="inFeed" type="Boolean">True if the entry is in an inline feed; false otherwise.
    /// <param name="data" type="Object">Object on which the formatted value is going to be stored.</param>

    // This might be a bind instead of a deep insert.
    var uri = value.__metadata && value.__metadata.uri;
    if (uri) {
        formatJsonLightBinding(name, uri, inFeed, data);
        return;
    }

    var entry = formatJsonLight(value);
    if (inFeed) {
        data[name].push(entry);
        return;
    }
    data[name] = entry;
};

var formatJsonLightBinding = function (name, uri, inFeed, data) {
    /// <summary>Formats an entry binding in the inline property in obj identified by name as an odata.bind annotation and saves it to data.</summary>
    /// <param name="name" type="String">Name of the inline property that has the binding to be formated.</param>
    /// <param name="uri" type="String">Uri to the bound entry.</param>
    /// <param name="inFeed" type="Boolean">True if the binding is in an inline feed; false otherwise.
    /// <param name="data" type="Object">Object on which the formatted value is going to be stored.</param>

    var bindingName = name + bindAnnotation;
    if (inFeed) {
        // The binding is inside an inline feed, so merge it with whatever other bindings already exist in data.
        data[bindingName] = data[bindingName] || [];
        data[bindingName].push(uri);
        return;
    }
    // The binding is on an inline entry; it can be safely overwritten.
    data[bindingName] = uri;
};

var formatJsonLightAnnotation = function (qName, target, value, data) {
    /// <summary>Formats a value as a json light annotation and stores it in data</summary>
    /// <param name="qName" type="String">Qualified name of the annotation.</param>
    /// <param name="target" type="String">Name of the property that the metadata value targets.</param>
    /// <param name="value">Annotation value.</param>
    /// <param name="data" type="Object">Object on which the annotation is going to be stored.</param>

    if (value !== undefined) {
        if(target) {
            data[target + "@" + qName] = value;
        }
        else {
            data[qName] = value;
        }
    }
};

// DATAJS INTERNAL START
exports.jsonLightReadPayload = jsonLightReadPayload;
exports.formatJsonLight = formatJsonLight;
// DATAJS INTERNAL END
