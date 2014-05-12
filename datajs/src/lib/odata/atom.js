//SK name /odata/odata-atom.js
/// <reference path="odata-utils.js" />
/// <reference path="odata-handler.js" />
/// <reference path="odata-xml.js" />

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

// odata-atom.js

var utils    = require('./../datajs.js').utils;
var xml      = require('./../datajs.js').xml;
//var xml      = require('./../datajs/xml.js').xml;
var odataXML = require('./xml.js');
var odataUtils = require('./utils.js');
var odataHandler = require('./handler.js');


// imports
var contains  = utils.contains;
var djsassert = utils.djsassert;
var isArray   = utils.isArray;
var isObject  = utils.isObject;

var normalizeURI = utils.normalizeURI;
var parseInt10 = utils.parseInt10;

var isXmlNSDeclaration = xml.isXmlNSDeclaration;
var xmlAppendChild = xml.xmlAppendChild;
var xmlAppendChildren = xml.xmlAppendChildren
var xmlAttributes = xml.xmlAttributes;
var xmlAttributeNode = xml.xmlAttributeNode;
var xmlAttributeValue = xml.xmlAttributeValue;
var xmlBaseURI = xml.xmlBaseURI;
var xmlChildElements = xml.xmlChildElements;
var xmlDom = xml.xmlDom;
var xmlFirstChildElement = xml.xmlFirstChildElement;
var xmlFindElementByPath = xml.xmlFindElementByPath;
var xmlFindNodeByPath = xml.xmlFindNodeByPath;
var xmlInnerText = xml.xmlInnerText;
var xmlLocalName = xml.xmlLocalName;
var xmlNamespaceURI = xml.xmlNamespaceURI;
var xmlNewAttribute = xml.xmlNewAttribute;
var xmlNewElement = xml.xmlNewElement;
var xmlNewFragment = xml.xmlNewFragment;
var xmlNewNodeByPath = xml.xmlNewNodeByPath;
var xmlNewNSDeclaration = xml.xmlNewNSDeclaration;
var xmlNewText = xml.xmlNewText;
var xmlNodeValue = xml.xmlNodeValue;
var xmlNS = xml.xmlNS;
var xmlnsNS = xml.xmlnsNS;
var xmlQualifiedName = xml.xmlQualifiedName;
var xmlParse = xml.xmlParse;
var xmlSerialize = xml.xmlSerialize;
var xmlSerializeDescendants = xml.xmlSerializeDescendants;
var xmlSibling = xml.xmlSibling;


var w3org = xml.w3org;

var adoDs = odataXML.adoDs;
var contentType = odataXML.contentType;
var createAttributeExtension = odataXML.createAttributeExtension;
var createElementExtension = odataXML.createElementExtension;
var handler = odataHandler.handler;
var isPrimitiveEdmType = odataUtils.isPrimitiveEdmType;
var isFeed = odataUtils.isFeed;
var isNamedStream = odataUtils.isNamedStream;
var lookupEntityType = odataUtils.lookupEntityType;
var lookupComplexType = odataUtils.lookupComplexType;
var lookupProperty = odataUtils.lookupProperty;
var navigationPropertyKind = odataUtils.navigationPropertyKind;

var MAX_DATA_SERVICE_VERSION = odataHandler.MAX_DATA_SERVICE_VERSION;
var maxVersion = odataXML.maxVersion;
var odataXmlNs = odataXML.odataXmlNs;
var odataMetaXmlNs = odataXML.odataMetaXmlNs;
var odataMetaPrefix = odataXML.odataMetaPrefix;
var odataPrefix = odataXML.odataPrefix;
var odataRelatedPrefix = odataXML.odataRelatedPrefix;
var odataScheme = odataXML.odataScheme;
var parseBool = odataXML.parseBool;
var parseDateTime = odataXML.parseDateTime;
var parseDateTimeOffset = odataXML.parseDateTimeOffset;
var parseDuration = odataXML.parseDuration;
var parseTimezone = odataXML.parseTimezone;
var xmlNewODataElement = odataXML.xmlNewODataElement;
var xmlNewODataElementInfo = odataXML.xmlNewODataElementInfo;
var xmlNewODataMetaAttribute = odataXML.xmlNewODataMetaAttribute;
var xmlNewODataMetaElement = odataXML.xmlNewODataMetaElement;
var xmlNewODataDataElement = odataXML.xmlNewODataDataElement;
var xmlReadODataEdmPropertyValue = odataXML.xmlReadODataEdmPropertyValue;
var xmlReadODataProperty = odataXML.xmlReadODataProperty;

// CONTENT START

var atomPrefix = "a";

var atomXmlNs = w3org + "2005/Atom";                    // http://www.w3.org/2005/Atom
var appXmlNs = w3org + "2007/app";                      // http://www.w3.org/2007/app

var odataEditMediaPrefix = adoDs + "/edit-media/";        // http://schemas.microsoft.com/ado/2007/08/dataservices/edit-media
var odataMediaResourcePrefix = adoDs + "/mediaresource/"; // http://schemas.microsoft.com/ado/2007/08/dataservices/mediaresource
var odataRelatedLinksPrefix = adoDs + "/relatedlinks/";   // http://schemas.microsoft.com/ado/2007/08/dataservices/relatedlinks

var atomAcceptTypes = ["application/atom+xml", "application/atomsvc+xml", "application/xml"];
var atomMediaType = atomAcceptTypes[0];

// These are the namespaces that are not considered ATOM extension namespaces.
var nonExtensionNamepaces = [atomXmlNs, appXmlNs, xmlNS, xmlnsNS];

// These are entity property mapping paths that have well-known paths.
var knownCustomizationPaths = {
    SyndicationAuthorEmail: "author/email",
    SyndicationAuthorName: "author/name",
    SyndicationAuthorUri: "author/uri",
    SyndicationContributorEmail: "contributor/email",
    SyndicationContributorName: "contributor/name",
    SyndicationContributorUri: "contributor/uri",
    SyndicationPublished: "published",
    SyndicationRights: "rights",
    SyndicationSummary: "summary",
    SyndicationTitle: "title",
    SyndicationUpdated: "updated"
};

var expandedFeedCustomizationPath = function (path) {
    /// <summary>Returns an expanded customization path if it's well-known.</summary>
    /// <param name="path" type="String">Path to expand.</param>
    /// <returns type="String">Expanded path or just 'path' otherwise.</returns>

    return knownCustomizationPaths[path] || path;
};

var isExtensionNs = function (nsURI) {
    /// <summary>Checks whether the specified namespace is an extension namespace to ATOM.</summary>
    /// <param type="String" name="nsURI">Namespace to check.</param>
    /// <returns type="Boolean">true if nsURI is an extension namespace to ATOM; false otherwise.</returns>

    return !(contains(nonExtensionNamepaces, nsURI));
};

var atomFeedCustomization = function (customizationModel, entityType, model, propertyName, suffix) {
    /// <summary>Creates an object describing a feed customization that was delcared in an OData conceptual schema.</summary>
    /// <param name="customizationModel" type="Object">Object describing the customization delcared in the conceptual schema.</param>
    /// <param name="entityType" type="Object">Object describing the entity type that owns the customization in an OData conceputal schema.</param>
    /// <param name="model" type="Object">Object describing an OData conceptual schema.</param>
    /// <param name="propertyName" type="String" optional="true">Name of the property to which this customization applies.</param>
    /// <param name="suffix" type="String" optional="true">Suffix to feed customization properties in the conceptual schema.</param>
    /// <returns type="Object">Object that describes an applicable feed customization.</returns>

    suffix = suffix || "";
    var targetPath = customizationModel["FC_TargetPath" + suffix];
    if (!targetPath) {
        return null;
    }

    var sourcePath = customizationModel["FC_SourcePath" + suffix];
    var targetXmlPath = expandedFeedCustomizationPath(targetPath);

    var propertyPath = propertyName ? propertyName + (sourcePath ? "/" + sourcePath : "") : sourcePath;
    var propertyType = propertyPath && lookupPropertyType(model, entityType, propertyPath);
    var nsURI = customizationModel["FC_NsUri" + suffix] || null;
    var nsPrefix = customizationModel["FC_NsPrefix" + suffix] || null;
    var keepinContent = customizationModel["FC_KeepInContent" + suffix] || "";

    if (targetPath !== targetXmlPath) {
        nsURI = atomXmlNs;
        nsPrefix = atomPrefix;
    }

    return {
        contentKind: customizationModel["FC_ContentKind" + suffix],
        keepInContent: keepinContent.toLowerCase() === "true",
        nsPrefix: nsPrefix,
        nsURI: nsURI,
        propertyPath: propertyPath,
        propertyType: propertyType,
        entryPath: targetXmlPath
    };
};

var atomApplyAllFeedCustomizations = function (entityType, model, callback) {
    /// <summary>Gets all the feed customizations that have to be applied to an entry as per the enity type declared in an OData conceptual schema.</summary>
    /// <param name="entityType" type="Object">Object describing an entity type in a conceptual schema.</param>
    /// <param name="model" type="Object">Object describing an OData conceptual schema.</param>
    /// <param name="callback" type="Function">Callback function to be invoked for each feed customization that needs to be applied.</param>

    var customizations = [];
    while (entityType) {
        var sourcePath = entityType.FC_SourcePath;
        var customization = atomFeedCustomization(entityType, entityType, model);
        if (customization) {
            callback(customization);
        }

        var properties = entityType.property || [];
        var i, len;
        for (i = 0, len = properties.length; i < len; i++) {
            var property = properties[i];
            var suffixCounter = 0;
            var suffix = "";

            while (customization = atomFeedCustomization(property, entityType, model, property.name, suffix)) {
                callback(customization);
                suffixCounter++;
                suffix = "_" + suffixCounter;
            }
        }
        entityType = lookupEntityType(entityType.baseType, model);
    }
    return customizations;
};

var atomReadExtensionAttributes = function (domElement) {
    /// <summary>Reads ATOM extension attributes (any attribute not in the Atom namespace) from a DOM element.</summary>
    /// <param name="domElement">DOM element with zero or more extension attributes.</param>
    /// <returns type="Array">An array of extension attribute representations.</returns>

    var extensions = [];
    xmlAttributes(domElement, function (attribute) {
        var nsURI = xmlNamespaceURI(attribute);
        if (isExtensionNs(nsURI)) {
            extensions.push(createAttributeExtension(attribute, true));
        }
    });
    return extensions;
};

var atomReadExtensionElement = function (domElement) {
    /// <summary>Reads an ATOM extension element (an element not in the ATOM namespaces).</summary>
    /// <param name="domElement">DOM element not part of the atom namespace.</param>
    /// <returns type="Object">Object representing the extension element.</returns>

    return createElementExtension(domElement, /*addNamespaceURI*/true);
};

var atomReadDocument = function (domElement, baseURI, model) {
    /// <summary>Reads an ATOM entry, feed or service document, producing an object model in return.</summary>
    /// <param name="domElement">Top-level ATOM DOM element to read.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the ATOM document.</param>
    /// <param name="model" type="Object">Object that describes the conceptual schema.</param>
    /// <returns type="Object">The object model representing the specified element, undefined if the top-level element is not part of the ATOM specification.</returns>

    var nsURI = xmlNamespaceURI(domElement);
    var localName = xmlLocalName(domElement);

    // Handle service documents.
    if (nsURI === appXmlNs && localName === "service") {
        return atomReadServiceDocument(domElement, baseURI);
    }

    // Handle feed and entry elements.
    if (nsURI === atomXmlNs) {
        if (localName === "feed") {
            return atomReadFeed(domElement, baseURI, model);
        }
        if (localName === "entry") {
            return atomReadEntry(domElement, baseURI, model);
        }
    }

    // Allow undefined to be returned.
};

var atomReadAdvertisedActionOrFunction = function (domElement, baseURI) {
    /// <summary>Reads the DOM element for an action or a function in an OData Atom document.</summary>
    /// <param name="domElement">DOM element to read.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing the action or function target url.</param>
    /// <returns type="Object">Object with title, target, and metadata fields.</returns>

    var extensions = [];
    var result = { extensions: extensions };
    xmlAttributes(domElement, function (attribute) {
        var localName = xmlLocalName(attribute);
        var nsURI = xmlNamespaceURI(attribute);
        var value = xmlNodeValue(attribute);

        if (nsURI === null) {
            if (localName === "title" || localName === "metadata") {
                result[localName] = value;
                return;
            }
            if (localName === "target") {
                result.target = normalizeURI(value, xmlBaseURI(domElement, baseURI));
                return;
            }
        }

        if (isExtensionNs(nsURI)) {
            extensions.push(createAttributeExtension(attribute, true));
        }
    });
    return result;
};

var atomReadAdvertisedAction = function (domElement, baseURI, parentMetadata) {
    /// <summary>Reads the DOM element for an action in an OData Atom document.</summary>
    /// <param name="domElement">DOM element to read.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing the action or target url.</param>
    /// <param name="parentMetadata" type="Object">Object to update with the action metadata.</param>

    var actions = parentMetadata.actions = parentMetadata.actions || [];
    actions.push(atomReadAdvertisedActionOrFunction(domElement, baseURI));
};

var atomReadAdvertisedFunction = function (domElement, baseURI, parentMetadata) {
    /// <summary>Reads the DOM element for an action in an OData Atom document.</summary>
    /// <param name="domElement">DOM element to read.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing the action or target url.</param>
    /// <param name="parentMetadata" type="Object">Object to update with the action metadata.</param>

    var functions = parentMetadata.functions = parentMetadata.functions || [];
    functions.push(atomReadAdvertisedActionOrFunction(domElement, baseURI));
};

var atomReadFeed = function (domElement, baseURI, model) {
    /// <summary>Reads a DOM element for an ATOM feed, producing an object model in return.</summary>
    /// <param name="domElement">ATOM feed DOM element.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the ATOM feed.</param>
    /// <param name="model">Metadata that describes the conceptual schema.</param>
    /// <returns type="Object">A new object representing the feed.</returns>

    var extensions = atomReadExtensionAttributes(domElement);
    var feedMetadata = { feed_extensions: extensions };
    var results = [];

    var feed = { __metadata: feedMetadata, results: results };

    baseURI = xmlBaseURI(domElement, baseURI);

    xmlChildElements(domElement, function (child) {
        var nsURI = xmlNamespaceURI(child);
        var localName = xmlLocalName(child);

        if (nsURI === odataMetaXmlNs) {
            if (localName === "count") {
                feed.__count = parseInt(xmlInnerText(child), 10);
                return;
            }
            if (localName === "action") {
                atomReadAdvertisedAction(child, baseURI, feedMetadata);
                return;
            }
            if (localName === "function") {
                atomReadAdvertisedFunction(child, baseURI, feedMetadata);
                return;
            }
        }

        if (isExtensionNs(nsURI)) {
            extensions.push(createElementExtension(child));
            return;
        }

        // The element should belong to the ATOM namespace.
        djsassert(nsURI === atomXmlNs, "atomReadFeed - child feed element is not in the atom namespace!!");

        if (localName === "entry") {
            results.push(atomReadEntry(child, baseURI, model));
            return;
        }
        if (localName === "link") {
            atomReadFeedLink(child, feed, baseURI);
            return;
        }
        if (localName === "id") {
            feedMetadata.uri = normalizeURI(xmlInnerText(child), baseURI);
            feedMetadata.uri_extensions = atomReadExtensionAttributes(child);
            return;
        }
        if (localName === "title") {
            feedMetadata.title = xmlInnerText(child) || "";
            feedMetadata.title_extensions = atomReadExtensionAttributes(child);
            return;
        }
    });

    return feed;
};

var atomReadFeedLink = function (domElement, feed, baseURI) {
    /// <summary>Reads an ATOM link DOM element for a feed.</summary>
    /// <param name="domElement">ATOM link DOM element.</param>
    /// <param name="feed">Feed object to be annotated with the link data.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>

    var link = atomReadLink(domElement, baseURI);
    var href = link.href;
    var rel = link.rel;
    var extensions = link.extensions;
    var metadata = feed.__metadata;

    if (rel === "next") {
        feed.__next = href;
        metadata.next_extensions = extensions;
        return;
    }
    if (rel === "self") {
        metadata.self = href;
        metadata.self_extensions = extensions;
        return;
    }
};

var atomReadLink = function (domElement, baseURI) {
    /// <summary>Reads an ATOM link DOM element.</summary>
    /// <param name="linkElement">DOM element to read.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing the link href.</param>
    /// <returns type="Object">A link element representation.</returns>

    baseURI = xmlBaseURI(domElement, baseURI);

    var extensions = [];
    var link = { extensions: extensions, baseURI: baseURI };

    xmlAttributes(domElement, function (attribute) {
        var nsURI = xmlNamespaceURI(attribute);
        var localName = xmlLocalName(attribute);
        var value = attribute.value;

        if (localName === "href") {
            link.href = normalizeURI(value, baseURI);
            return;
        }
        if (localName === "type" || localName === "rel") {
            link[localName] = value;
            return;
        }

        if (isExtensionNs(nsURI)) {
            extensions.push(createAttributeExtension(attribute, true));
        }
    });

    if (!link.href) {
        throw { error: "href attribute missing on link element", element: domElement };
    }

    return link;
};

var atomGetObjectValueByPath = function (path, item) {
    /// <summary>Gets a slashed path value from the specified item.</summary>
    /// <param name="path" type="String">Property path to read ('/'-separated).</param>
    /// <param name="item" type="Object">Object to get value from.</param>
    /// <returns>The property value, possibly undefined if any path segment is missing.</returns>

    // Fast path.
    if (path.indexOf('/') === -1) {
        return item[path];
    } else {
        var parts = path.split('/');
        var i, len;
        for (i = 0, len = parts.length; i < len; i++) {
            // Avoid traversing a null object.
            if (item === null) {
                return undefined;
            }

            item = item[parts[i]];
            if (item === undefined) {
                return item;
            }
        }

        return item;
    }
};

var atomSetEntryValueByPath = function (path, target, value, propertyType) {
    /// <summary>Sets a slashed path value on the specified target.</summary>
    /// <param name="path" type="String">Property path to set ('/'-separated).</param>
    /// <param name="target" type="Object">Object to set value on.</param>
    /// <param name="value">Value to set.</param>
    /// <param name="propertyType" type="String" optional="true">Property type to set in metadata.</param>

    var propertyName;
    if (path.indexOf('/') === -1) {
        target[path] = value;
        propertyName = path;
    } else {
        var parts = path.split('/');
        var i, len;
        for (i = 0, len = (parts.length - 1); i < len; i++) {
            // We construct each step of the way if the property is missing;
            // if it's already initialized to null, we stop further processing.
            var next = target[parts[i]];
            if (next === undefined) {
                next = {};
                target[parts[i]] = next;
            } else if (next === null) {
                return;
            }
            target = next;
        }
        propertyName = parts[i];
        target[propertyName] = value;
    }

    if (propertyType) {
        var metadata = target.__metadata = target.__metadata || {};
        var properties = metadata.properties = metadata.properties || {};
        var property = properties[propertyName] = properties[propertyName] || {};
        property.type = propertyType;
    }
};

var atomApplyCustomizationToEntryObject = function (customization, domElement, entry) {
    /// <summary>Applies a specific feed customization item to an object.</summary>
    /// <param name="customization">Object with customization description.</param>
    /// <param name="sourcePath">Property path to set ('source' in the description).</param>
    /// <param name="entryElement">XML element for the entry that corresponds to the object being read.</param>
    /// <param name="entryObject">Object being read.</param>
    /// <param name="propertyType" type="String">Name of property type to set.</param>
    /// <param name="suffix" type="String">Suffix to feed customization properties.</param>

    var propertyPath = customization.propertyPath;
    // If keepInConent equals true or the property value is null we do nothing as this overrides any other customization.
    if (customization.keepInContent || atomGetObjectValueByPath(propertyPath, entry) === null) {
        return;
    }

    var xmlNode = xmlFindNodeByPath(domElement, customization.nsURI, customization.entryPath);

    // If the XML tree does not contain the necessary elements to read the value,
    // then it shouldn't be considered null, but rather ignored at all. This prevents
    // the customization from generating the object path down to the property.
    if (!xmlNode) {
        return;
    }

    var propertyType = customization.propertyType;
    var propertyValue;

    if (customization.contentKind === "xhtml") {
        // Treat per XHTML in http://tools.ietf.org/html/rfc4287#section-3.1.1, including the DIV
        // in the content.
        propertyValue = xmlSerializeDescendants(xmlNode);
    } else {
        propertyValue = xmlReadODataEdmPropertyValue(xmlNode, propertyType || "Edm.String");
    }
    // Set the value on the entry.
    atomSetEntryValueByPath(propertyPath, entry, propertyValue, propertyType);
};

var lookupPropertyType = function (metadata, owningType, path) {
    /// <summary>Looks up the type of a property given its path in an entity type.</summary>
    /// <param name="metadata">Metadata in which to search for base and complex types.</param>
    /// <param name="owningType">Type to which property belongs.</param>
    /// <param name="path" type="String" mayBeNull="false">Property path to look at.</param>
    /// <returns type="String">The name of the property type; possibly null.</returns>

    var parts = path.split("/");
    var i, len;
    while (owningType) {
        // Keep track of the type being traversed, necessary for complex types.
        var traversedType = owningType;

        for (i = 0, len = parts.length; i < len; i++) {
            // Traverse down the structure as necessary.
            var properties = traversedType.property;
            if (!properties) {
                break;
            }

            // Find the property by scanning the property list (might be worth pre-processing).
            var propertyFound = lookupProperty(properties, parts[i]);
            if (!propertyFound) {
                break;
            }

            var propertyType = propertyFound.type;

            // We could in theory still be missing types, but that would
            // be caused by a malformed path.
            if (!propertyType || isPrimitiveEdmType(propertyType)) {
                return propertyType || null;
            }

            traversedType = lookupComplexType(propertyType, metadata);
            if (!traversedType) {
                return null;
            }
        }

        // Traverse up the inheritance chain.
        owningType = lookupEntityType(owningType.baseType, metadata);
    }

    return null;
};

var atomReadEntry = function (domElement, baseURI, model) {
    /// <summary>Reads a DOM element for an ATOM entry, producing an object model in return.</summary>
    /// <param name="domElement">ATOM entry DOM element.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the ATOM entry.</param>
    /// <param name="model">Metadata that describes the conceptual schema.</param>
    /// <returns type="Object">A new object representing the entry.</returns>

    var entryMetadata = {};
    var entry = { __metadata: entryMetadata };

    var etag = xmlAttributeValue(domElement, "etag", odataMetaXmlNs);
    if (etag) {
        entryMetadata.etag = etag;
    }

    baseURI = xmlBaseURI(domElement, baseURI);

    xmlChildElements(domElement, function (child) {
        var nsURI = xmlNamespaceURI(child);
        var localName = xmlLocalName(child);

        if (nsURI === atomXmlNs) {
            if (localName === "id") {
                atomReadEntryId(child, entryMetadata, baseURI);
                return;
            }
            if (localName === "category") {
                atomReadEntryType(child, entryMetadata);
                return;
            }
            if (localName === "content") {
                atomReadEntryContent(child, entry, entryMetadata, baseURI);
                return;
            }
            if (localName === "link") {
                atomReadEntryLink(child, entry, entryMetadata, baseURI, model);
                return;
            }
            return;
        }

        if (nsURI === odataMetaXmlNs) {
            if (localName === "properties") {
                atomReadEntryStructuralObject(child, entry, entryMetadata);
                return;
            }
            if (localName === "action") {
                atomReadAdvertisedAction(child, baseURI, entryMetadata);
                return;
            }
            if (localName === "function") {
                atomReadAdvertisedFunction(child, baseURI, entryMetadata);
                return;
            }
        }
    });

    // Apply feed customizations if applicable
    var entityType = lookupEntityType(entryMetadata.type, model);
    atomApplyAllFeedCustomizations(entityType, model, function (customization) {
        atomApplyCustomizationToEntryObject(customization, domElement, entry);
    });

    return entry;
};

var atomReadEntryId = function (domElement, entryMetadata, baseURI) {
    /// <summary>Reads an ATOM entry id DOM element.</summary>
    /// <param name="domElement">ATOM id DOM element.</param>
    /// <param name="entryMetadata">Entry metadata object to update with the id information.</param>

    entryMetadata.uri = normalizeURI(xmlInnerText(domElement), xmlBaseURI(domElement, baseURI));
    entryMetadata.uri_extensions = atomReadExtensionAttributes(domElement);
};

var atomReadEntryType = function (domElement, entryMetadata) {
    /// <summary>Reads type information from an ATOM category DOM element.</summary>
    /// <param name="domElement">ATOM category DOM element.</param>
    /// <param name="entryMetadata">Entry metadata object to update with the type information.</param>

    if (xmlAttributeValue(domElement, "scheme") === odataScheme) {
        if (entryMetadata.type) {
            throw { message: "Invalid AtomPub document: multiple category elements defining the entry type were encounterd withing an entry", element: domElement };
        }

        var typeExtensions = [];
        xmlAttributes(domElement, function (attribute) {
            var nsURI = xmlNamespaceURI(attribute);
            var localName = xmlLocalName(attribute);

            if (!nsURI) {
                if (localName !== "scheme" && localName !== "term") {
                    typeExtensions.push(createAttributeExtension(attribute, true));
                }
                return;
            }

            if (isExtensionNs(nsURI)) {
                typeExtensions.push(createAttributeExtension(attribute, true));
            }
        });

        entryMetadata.type = xmlAttributeValue(domElement, "term");
        entryMetadata.type_extensions = typeExtensions;
    }
};

var atomReadEntryContent = function (domElement, entry, entryMetadata, baseURI) {
    /// <summary>Reads an ATOM content DOM element.</summary>
    /// <param name="domElement">ATOM content DOM element.</param>
    /// <param name="entry">Entry object to update with information.</param>
    /// <param name="entryMetadata">Entry metadata object to update with the content information.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the Atom entry content.</param>

    var src = xmlAttributeValue(domElement, "src");
    var type = xmlAttributeValue(domElement, "type");

    if (src) {
        if (!type) {
            throw {
                message: "Invalid AtomPub document: content element must specify the type attribute if the src attribute is also specified",
                element: domElement
            };
        }

        entryMetadata.media_src = normalizeURI(src, xmlBaseURI(domElement, baseURI));
        entryMetadata.content_type = type;
    }

    xmlChildElements(domElement, function (child) {
        if (src) {
            throw { message: "Invalid AtomPub document: content element must not have child elements if the src attribute is specified", element: domElement };
        }

        if (xmlNamespaceURI(child) === odataMetaXmlNs && xmlLocalName(child) === "properties") {
            atomReadEntryStructuralObject(child, entry, entryMetadata);
        }
    });
};

var atomReadEntryLink = function (domElement, entry, entryMetadata, baseURI, model) {
    /// <summary>Reads a link element on an entry.</summary>
    /// <param name="atomEntryLink">'link' element on the entry.</param>
    /// <param name="entry" type="Object">Entry object to update with the link data.</param>
    /// <param name="entryMetadata">Entry metadata object to update with the link metadata.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing the link href.</param>
    /// <param name="model" type="Object">Metadata that describes the conceptual schema.</param>

    var link = atomReadLink(domElement, baseURI);

    var rel = link.rel;
    var href = link.href;
    var extensions = link.extensions;

    if (rel === "self") {
        entryMetadata.self = href;
        entryMetadata.self_link_extensions = extensions;
        return;
    }

    if (rel === "edit") {
        entryMetadata.edit = href;
        entryMetadata.edit_link_extensions = extensions;
        return;
    }

    if (rel === "edit-media") {
        entryMetadata.edit_media = link.href;
        entryMetadata.edit_media_extensions = extensions;
        atomReadLinkMediaEtag(link, entryMetadata);
        return;
    }

    // This might be a named stream edit link
    if (rel.indexOf(odataEditMediaPrefix) === 0) {
        atomReadNamedStreamEditLink(link, entry, entryMetadata);
        return;
    }

    // This might be a named stram media resource (read) link
    if (rel.indexOf(odataMediaResourcePrefix) === 0) {
        atomReadNamedStreamSelfLink(link, entry, entryMetadata);
        return;
    }

    // This might be a navigation property
    if (rel.indexOf(odataRelatedPrefix) === 0) {
        atomReadNavPropLink(domElement, link, entry, entryMetadata, model);
        return;
    }

    if (rel.indexOf(odataRelatedLinksPrefix) === 0) {
        atomReadNavPropRelatedLink(link, entryMetadata);
        return;
    }
};

var atomReadNavPropRelatedLink = function (link, entryMetadata) {
    /// <summary>Reads a link represnting the links related to a navigation property in an OData Atom document.</summary>
    /// <param name="link" type="Object">Object representing the parsed link DOM element.</param>
    /// <param name="entryMetadata" type="Object">Entry metadata object to update with the related links information.</param>

    var propertyName = link.rel.substring(odataRelatedLinksPrefix.length);
    djsassert(propertyName, "atomReadNavPropRelatedLink - property name is null, empty or undefined!");

    // Set the extra property information on the entry object metadata.
    entryMetadata.properties = entryMetadata.properties || {};
    var propertyMetadata = entryMetadata.properties[propertyName] = entryMetadata.properties[propertyName] || {};

    propertyMetadata.associationuri = link.href;
    propertyMetadata.associationuri_extensions = link.extensions;
};

var atomReadNavPropLink = function (domElement, link, entry, entryMetadata, model) {
    /// <summary>Reads a link representing a navigation property in an OData Atom document.</summary>
    /// <param name="domElement">DOM element for a navigation property in an OData Atom document.</summary>
    /// <param name="link" type="Object">Object representing the parsed link DOM element.</param>
    /// <param name="entry" type="Object">Entry object to update with the navigation property.</param>
    /// <param name="entryMetadata">Entry metadata object to update with the navigation property metadata.</param>
    /// <param name="model" type="Object">Metadata that describes the conceptual schema.</param>

    // Get any inline data.
    var inlineData;
    var inlineElement = xmlFirstChildElement(domElement, odataMetaXmlNs, "inline");
    if (inlineElement) {
        var inlineDocRoot = xmlFirstChildElement(inlineElement);
        var inlineBaseURI = xmlBaseURI(inlineElement, link.baseURI);
        inlineData = inlineDocRoot ? atomReadDocument(inlineDocRoot, inlineBaseURI, model) : null;
    } else {
        // If the link has no inline content, we consider it deferred.
        inlineData = { __deferred: { uri: link.href} };
    }

    var propertyName = link.rel.substring(odataRelatedPrefix.length);

    // Set the property value on the entry object.
    entry[propertyName] = inlineData;

    // Set the extra property information on the entry object metadata.
    entryMetadata.properties = entryMetadata.properties || {};
    var propertyMetadata = entryMetadata.properties[propertyName] = entryMetadata.properties[propertyName] || {};

    propertyMetadata.extensions = link.extensions;
};

var atomReadNamedStreamEditLink = function (link, entry, entryMetadata) {
    /// <summary>Reads a link representing the edit-media url of a named stream in an OData Atom document.</summary>
    /// <param name="link" type="Object">Object representing the parsed link DOM element.</param>
    /// <param name="entry" type="Object">Entry object to update with the named stream data.</param>
    /// <param name="entryMetadata">Entry metadata object to update with the named stream metadata.</param>

    var propertyName = link.rel.substring(odataEditMediaPrefix.length);
    djsassert(propertyName, "atomReadNamedStreamEditLink - property name is null, empty or undefined!");

    var namedStreamMediaResource = atomGetEntryNamedStreamMediaResource(propertyName, entry, entryMetadata);
    var mediaResource = namedStreamMediaResource.value;
    var mediaResourceMetadata = namedStreamMediaResource.metadata;

    var editMedia = link.href;

    mediaResource.edit_media = editMedia;
    mediaResource.content_type = link.type;
    mediaResourceMetadata.edit_media_extensions = link.extensions;

    // If there is only the edit link, make it the media self link as well.
    mediaResource.media_src = mediaResource.media_src || editMedia;
    mediaResourceMetadata.media_src_extensions = mediaResourceMetadata.media_src_extensions || [];

    atomReadLinkMediaEtag(link, mediaResource);
};

var atomReadNamedStreamSelfLink = function (link, entry, entryMetadata) {
    /// <summary>Reads a link representing the self url of a named stream in an OData Atom document.</summary>
    /// <param name="link" type="Object">Object representing the parsed link DOM element.</param>
    /// <param name="entry" type="Object">Entry object to update with the named stream data.</param>
    /// <param name="entryMetadata">Entry metadata object to update with the named stream metadata.</param>

    var propertyName = link.rel.substring(odataMediaResourcePrefix.length);
    djsassert(propertyName, "atomReadNamedStreamEditLink - property name is null, empty or undefined!");

    var namedStreamMediaResource = atomGetEntryNamedStreamMediaResource(propertyName, entry, entryMetadata);
    var mediaResource = namedStreamMediaResource.value;
    var mediaResourceMetadata = namedStreamMediaResource.metadata;

    mediaResource.media_src = link.href;
    mediaResourceMetadata.media_src_extensions = link.extensions;
    mediaResource.content_type = link.type;
};

var atomGetEntryNamedStreamMediaResource = function (name, entry, entryMetadata) {
    /// <summary>Gets the media resource object and metadata object for a named stream in an entry object.</summary>
    /// <param name="link" type="Object">Object representing the parsed link DOM element.</param>
    /// <param name="entry" type="Object">Entry object from which the media resource object will be obtained.</param>
    /// <param name="entryMetadata" type="Object">Entry metadata object from which the media resource metadata object will be obtained.</param>
    /// <remarks>
    ///    If the entry doest' have a media resource for the named stream indicated by the name argument, then this function will create a new
    ///    one along with its metadata object.
    /// <remarks>
    /// <returns type="Object"> Object containing the value and metadata of the named stream's media resource. <returns>

    entryMetadata.properties = entryMetadata.properties || {};

    var mediaResourceMetadata = entryMetadata.properties[name];
    var mediaResource = entry[name] && entry[name].__mediaresource;

    if (!mediaResource) {
        mediaResource = {};
        entry[name] = { __mediaresource: mediaResource };
        entryMetadata.properties[name] = mediaResourceMetadata = {};
    }
    return { value: mediaResource, metadata: mediaResourceMetadata };
};

var atomReadLinkMediaEtag = function (link, mediaResource) {
    /// <summary>Gets the media etag from the link extensions and updates the media resource object with it.</summary>
    /// <param name="link" type="Object">Object representing the parsed link DOM element.</param>
    /// <param name="mediaResource" type="Object">Object containing media information for an OData Atom entry.</param>
    /// <remarks>
    ///    The function will remove the extension object for the etag if it finds it in the link extensions and will set
    ///    its value under the media_etag property of the mediaResource object.
    /// <remarks>
    /// <returns type="Object"> Object containing the value and metadata of the named stream's media resource. <returns>

    var extensions = link.extensions;
    var i, len;
    for (i = 0, len = extensions.length; i < len; i++) {
        if (extensions[i].namespaceURI === odataMetaXmlNs && extensions[i].name === "etag") {
            mediaResource.media_etag = extensions[i].value;
            extensions.splice(i, 1);
            return;
        }
    }
};

var atomReadEntryStructuralObject = function (domElement, parent, parentMetadata) {
    /// <summary>Reads an atom entry's property as a structural object and sets its value in the parent and the metadata in the parentMetadata objects.</summary>
    /// <param name="propertiesElement">XML element for the 'properties' node.</param>
    /// <param name="parent">
    ///     Object that will contain the property value. It can be either an antom entry or
    ///     an atom complex property object.
    /// </param>
    /// <param name="parentMetadata">Object that will contain the property metadata. It can be either an atom entry metadata or a complex property metadata object</param>

    xmlChildElements(domElement, function (child) {
        var property = xmlReadODataProperty(child);
        if (property) {
            var propertyName = property.name;
            var propertiesMetadata = parentMetadata.properties = parentMetadata.properties || {};
            propertiesMetadata[propertyName] = property.metadata;
            parent[propertyName] = property.value;
        }
    });
};

var atomReadServiceDocument = function (domElement, baseURI) {
    /// <summary>Reads an AtomPub service document</summary>
    /// <param name="atomServiceDoc">DOM element for the root of an AtomPub service document</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the AtomPub service document.</param>
    /// <returns type="Object">An object that contains the properties of the service document</returns>

    var workspaces = [];
    var extensions = [];

    baseURI = xmlBaseURI(domElement, baseURI);
    // Find all the workspace elements.
    xmlChildElements(domElement, function (child) {
        if (xmlNamespaceURI(child) === appXmlNs && xmlLocalName(child) === "workspace") {
            workspaces.push(atomReadServiceDocumentWorkspace(child, baseURI));
            return;
        }
        extensions.push(createElementExtension(child));
    });

    // AtomPub (RFC 5023 Section 8.3.1) says a service document MUST contain one or
    // more workspaces. Throw if we don't find any.
    if (workspaces.length === 0) {
        throw { message: "Invalid AtomPub service document: No workspace element found.", element: domElement };
    }

    return { workspaces: workspaces, extensions: extensions };
};

var atomReadServiceDocumentWorkspace = function (domElement, baseURI) {
    /// <summary>Reads a single workspace element from an AtomPub service document</summary>
    /// <param name="domElement">DOM element that represents a workspace of an AtomPub service document</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the AtomPub service document workspace.</param>
    /// <returns type="Object">An object that contains the properties of the workspace</returns>

    var collections = [];
    var extensions = [];
    var title; // = undefined;

    baseURI = xmlBaseURI(domElement, baseURI);

    xmlChildElements(domElement, function (child) {
        var nsURI = xmlNamespaceURI(child);
        var localName = xmlLocalName(child);

        if (nsURI === atomXmlNs) {
            if (localName === "title") {
                if (title !== undefined) {
                    throw { message: "Invalid AtomPub service document: workspace has more than one child title element", element: child };
                }

                title = xmlInnerText(child);
                return;
            }
        }

        if (nsURI === appXmlNs) {
            if (localName === "collection") {
                collections.push(atomReadServiceDocumentCollection(child, baseURI));
            }
            return;
        }
        extensions.push(atomReadExtensionElement(child));
    });

    return { title: title || "", collections: collections, extensions: extensions };
};

var atomReadServiceDocumentCollection = function (domElement, baseURI) {
    /// <summary>Reads a service document collection element into an object.</summary>
    /// <param name="domElement">DOM element that represents a collection of an AtomPub service document.</param>
    /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the AtomPub service document collection.</param>
    /// <returns type="Object">An object that contains the properties of the collection.</returns>


    var href = xmlAttributeValue(domElement, "href");

    if (!href) {
        throw { message: "Invalid AtomPub service document: collection has no href attribute", element: domElement };
    }

    baseURI = xmlBaseURI(domElement, baseURI);
    href = normalizeURI(href, xmlBaseURI(domElement, baseURI));
    var extensions = [];
    var title; // = undefined;

    xmlChildElements(domElement, function (child) {
        var nsURI = xmlNamespaceURI(child);
        var localName = xmlLocalName(child);

        if (nsURI === atomXmlNs) {
            if (localName === "title") {
                if (title !== undefined) {
                    throw { message: "Invalid AtomPub service document: collection has more than one child title element", element: child };
                }
                title = xmlInnerText(child);
            }
            return;
        }

        if (nsURI !== appXmlNs) {
            extensions.push(atomReadExtensionElement(domElement));
        }
    });

    // AtomPub (RFC 5023 Section 8.3.3) says the collection element MUST contain
    // a title element. It's likely to be problematic if the service doc doesn't
    // have one so here we throw.
    if (!title) {
        throw { message: "Invalid AtomPub service document: collection has no title element", element: domElement };
    }

    return { title: title, href: href, extensions: extensions };
};

var atomNewElement = function (dom, name, children) {
    /// <summary>Creates a new DOM element in the Atom namespace.</summary>
    /// <param name="dom">DOM document used for creating the new DOM Element.</param>
    /// <param name="name" type="String">Local name of the Atom element to create.</param>
    /// <param name="children" type="Array">Array containing DOM nodes or string values that will be added as children of the new DOM element.</param>
    /// <returns>New DOM element in the Atom namespace.</returns>
    /// <remarks>
    ///    If a value in the children collection is a string, then a new DOM text node is going to be created
    ///    for it and then appended as a child of the new DOM Element.
    /// </remarks>

    return xmlNewElement(dom, atomXmlNs, xmlQualifiedName(atomPrefix, name), children);
};

var atomNewAttribute = function (dom, name, value) {
    /// <summary>Creates a new DOM attribute for an Atom element in the default namespace.</summary>
    /// <param name="dom">DOM document used for creating the new DOM Element.</param>
    /// <param name="name" type="String">Local name of the OData attribute to create.</param>
    /// <param name="value">Attribute value.</param>
    /// <returns>New DOM attribute in the default namespace.</returns>

    return xmlNewAttribute(dom, null, name, value);
};

var atomCanRemoveProperty = function (propertyElement) {
    /// <summary>Checks whether the property represented by domElement can be removed from the atom document DOM tree.</summary>
    /// <param name="propertyElement">DOM element for the property to test.</param>
    /// <remarks>
    ///     The property can only be removed if it doens't have any children and only has namespace or type declaration attributes.
    /// </remarks>
    /// <returns type="Boolean">True is the property can be removed; false otherwise.</returns>

    if (propertyElement.childNodes.length > 0) {
        return false;
    }

    var isEmpty = true;
    var attributes = propertyElement.attributes;
    var i, len;
    for (i = 0, len = attributes.length; i < len && isEmpty; i++) {
        var attribute = attributes[i];

        isEmpty = isEmpty && isXmlNSDeclaration(attribute) ||
             (xmlNamespaceURI(attribute) == odataMetaXmlNs && xmlLocalName(attribute) === "type");
    }
    return isEmpty;
};

var atomNewODataNavigationProperty = function (dom, name, kind, value, model) {
    /// <summary>Creates a new Atom link DOM element for a navigation property in an OData Atom document.</summary>
    /// <param name="dom">DOM document used for creating the new DOM Element.</param>
    /// <param name="name" type="String">Property name.</param>
    /// <param name="kind" type="String">Navigation property kind. Expected values are "deferred", "entry", or "feed".</param>
    /// <param name="value" optional="true" mayBeNull="true">Value of the navigation property, if any.</param>
    /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
    /// <returns type="Object">
    ///     Object containing the new Atom link DOM element for the navigation property and the
    ///     required data service version for this property.
    /// </returns>

    var linkType = null;
    var linkContent = null;
    var linkContentBodyData = null;
    var href = "";

    if (kind !== "deferred") {
        linkType = atomNewAttribute(dom, "type", "application/atom+xml;type=" + kind);
        linkContent = xmlNewODataMetaElement(dom, "inline");

        if (value) {
            href = value.__metadata && value.__metadata.uri || "";
            linkContentBodyData =
                atomNewODataFeed(dom, value, model) ||
                atomNewODataEntry(dom, value, model);
            xmlAppendChild(linkContent, linkContentBodyData.element);
        }
    } else {
        href = value.__deferred.uri;
    }

    var navProp = atomNewElement(dom, "link", [
        atomNewAttribute(dom, "href", href),
        atomNewAttribute(dom, "rel", normalizeURI(name, odataRelatedPrefix)),
        linkType,
        linkContent
    ]);

    return xmlNewODataElementInfo(navProp, linkContentBodyData ? linkContentBodyData.dsv : "1.0");
};

var atomNewODataEntryDataItem = function (dom, name, value, dataItemMetadata, dataItemModel, model) {
    /// <summary>Creates a new DOM element for a data item in an entry, complex property, or collection property.</summary>
    /// <param name="dom">DOM document used for creating the new DOM Element.</param>
    /// <param name="name" type="String">Data item name.</param>
    /// <param name="value" optional="true" mayBeNull="true">Value of the data item, if any.</param>
    /// <param name="dataItemMetadata" type="Object" optional="true">Object containing metadata about the data item.</param>
    /// <param name="dataItemModel" type="Object" optional="true">Object describing the data item in an OData conceptual schema.</param>
    /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
    /// <returns type="Object">
    ///     Object containing the new DOM element in the appropriate namespace for the data item and the
    ///     required data service version for it.
    /// </returns>

    if (isNamedStream(value)) {
        return null;
    }

    var dataElement = xmlNewODataDataElement(dom, name, value, dataItemMetadata, dataItemModel, model);
    if (!dataElement) {
        // This may be a navigation property.
        var navPropKind = navigationPropertyKind(value, dataItemModel);
        djsassert(navPropKind !== null, "atomNewODataEntryDataItem - navigation property kind is null for property " + name);

        dataElement = atomNewODataNavigationProperty(dom, name, navPropKind, value, model);
    }
    return dataElement;
};

var atomEntryCustomization = function (dom, entry, entryProperties, customization) {
    /// <summary>Applies a feed customization by transforming an Atom entry DOM element as needed.</summary>
    /// <param name="dom">DOM document used for creating any new DOM nodes required by the customization.</param>
    /// <param name="entry">DOM element for the Atom entry to which the customization is going to be applied.</param>
    /// <param name="entryProperties">DOM element containing the properties of the Atom entry.</param>
    /// <param name="customization" type="Object">Object describing an applicable feed customization.</param>
    /// <remarks>
    ///     Look into the atomfeedCustomization function for a description of the customization object.
    /// </remarks>
    /// <returns type="String">Data service version required by the applied customization</returns>

    var atomProperty = xmlFindElementByPath(entryProperties, odataXmlNs, customization.propertyPath);
    var atomPropertyNullAttribute = atomProperty && xmlAttributeNode(atomProperty, "null", odataMetaXmlNs);
    var atomPropertyValue;
    var dataServiceVersion = "1.0";

    if (atomPropertyNullAttribute && atomPropertyNullAttribute.value === "true") {
        return dataServiceVersion;
    }

    if (atomProperty) {
        atomPropertyValue = xmlInnerText(atomProperty) || "";
        if (!customization.keepInContent) {
            dataServiceVersion = "2.0";
            var parent = atomProperty.parentNode;
            var candidate = parent;

            parent.removeChild(atomProperty);
            while (candidate !== entryProperties && atomCanRemoveProperty(candidate)) {
                parent = candidate.parentNode;
                parent.removeChild(candidate);
                candidate = parent;
            }
        }
    }

    var targetNode = xmlNewNodeByPath(dom, entry,
        customization.nsURI, customization.nsPrefix, customization.entryPath);

    if (targetNode.nodeType === 2) {
        targetNode.value = atomPropertyValue;
        return dataServiceVersion;
    }

    var contentKind = customization.contentKind;
    xmlAppendChildren(targetNode, [
            contentKind && xmlNewAttribute(dom, null, "type", contentKind),
            contentKind === "xhtml" ? xmlNewFragment(dom, atomPropertyValue) : atomPropertyValue
    ]);

    return dataServiceVersion;
};

var atomNewODataEntry = function (dom, data, model) {
    /// <summary>Creates a new DOM element for an Atom entry.</summary>
    /// <param name="dom">DOM document used for creating the new DOM Element.</param>
    /// <param name="data" type="Object">Entry object in the library's internal representation.</param>
    /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
    /// <returns type="Object">
    ///     Object containing the new DOM element for the Atom entry and the required data service version for it.
    /// </returns>

    var payloadMetadata = data.__metadata || {};
    var propertiesMetadata = payloadMetadata.properties || {};

    var etag = payloadMetadata.etag;
    var uri = payloadMetadata.uri;
    var typeName = payloadMetadata.type;
    var entityType = lookupEntityType(typeName, model);

    var properties = xmlNewODataMetaElement(dom, "properties");
    var entry = atomNewElement(dom, "entry", [
        atomNewElement(dom, "author",
            atomNewElement(dom, "name")
        ),
        etag && xmlNewODataMetaAttribute(dom, "etag", etag),
        uri && atomNewElement(dom, "id", uri),
        typeName && atomNewElement(dom, "category", [
            atomNewAttribute(dom, "term", typeName),
            atomNewAttribute(dom, "scheme", odataScheme)
        ]),
    // TODO: MLE support goes here.
        atomNewElement(dom, "content", [
            atomNewAttribute(dom, "type", "application/xml"),
            properties
        ])
    ]);

    var dataServiceVersion = "1.0";
    for (var name in data) {
        if (name !== "__metadata") {
            var entryDataItemMetadata = propertiesMetadata[name] || {};
            var entryDataItemModel = entityType && (
                lookupProperty(entityType.property, name) ||
                lookupProperty(entityType.navigationProperty, name));

            var entryDataItem = atomNewODataEntryDataItem(dom, name, data[name], entryDataItemMetadata, entryDataItemModel, model);
            if (entryDataItem) {
                var entryElement = entryDataItem.element;
                var entryElementParent = (xmlNamespaceURI(entryElement) === atomXmlNs) ? entry : properties;

                xmlAppendChild(entryElementParent, entryElement);
                dataServiceVersion = maxVersion(dataServiceVersion, entryDataItem.dsv);
            }
        }
    }

    atomApplyAllFeedCustomizations(entityType, model, function (customization) {
        var customizationDsv = atomEntryCustomization(dom, entry, properties, customization);
        dataServiceVersion = maxVersion(dataServiceVersion, customizationDsv);
    });

    return xmlNewODataElementInfo(entry, dataServiceVersion);
};

var atomNewODataFeed = function (dom, data, model) {
    /// <summary>Creates a new DOM element for an Atom feed.</summary>
    /// <param name="dom">DOM document used for creating the new DOM Element.</param>
    /// <param name="data" type="Object">Feed object in the library's internal representation.</param>
    /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
    /// <returns type="Object">
    ///     Object containing the new DOM element for the Atom feed and the required data service version for it.
    /// </returns>

    var entries = isArray(data) ? data : data.results;

    if (!entries) {
        return null;
    }

    var dataServiceVersion = "1.0";
    var atomFeed = atomNewElement(dom, "feed");

    var i, len;
    for (i = 0, len = entries.length; i < len; i++) {
        var atomEntryData = atomNewODataEntry(dom, entries[i], model);
        xmlAppendChild(atomFeed, atomEntryData.element);
        dataServiceVersion = maxVersion(dataServiceVersion, atomEntryData.dsv);
    }
    return xmlNewODataElementInfo(atomFeed, dataServiceVersion);
};

var atomNewODataDocument = function (data, model) {
    /// <summary>Creates a new OData Atom document.</summary>
    /// <param name="data" type="Object">Feed or entry object in the libary's internal representaion.</param>
    /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
    /// <returns type="Object">
    ///     Object containing the new DOM document for the Atom document and the required data service version for it.
    /// </returns>

    if (data) {
        var atomRootWriter = isFeed(data) && atomNewODataFeed ||
            isObject(data) && atomNewODataEntry;

        if (atomRootWriter) {
            var dom = xmlDom();
            var atomRootData = atomRootWriter(dom, data, model);

            if (atomRootData) {
                var atomRootElement = atomRootData.element;
                xmlAppendChildren(atomRootElement, [
                    xmlNewNSDeclaration(dom, odataMetaXmlNs, odataMetaPrefix),
                    xmlNewNSDeclaration(dom, odataXmlNs, odataPrefix)
                ]);
                return xmlNewODataElementInfo(xmlAppendChild(dom, atomRootElement), atomRootData.dsv);
            }
        }
    }
    return null;
};

var atomParser = function (handler, text, context) {
    /// <summary>Parses an ATOM document (feed, entry or service document).</summary>
    /// <param name="handler">This handler.</param>
    /// <param name="text" type="String">Document text.</param>
    /// <param name="context" type="Object">Object with parsing context.</param>
    /// <returns>An object representation of the document; undefined if not applicable.</returns>

    if (text) {
        var atomDoc = xmlParse(text);
        var atomRoot = xmlFirstChildElement(atomDoc);
        if (atomRoot) {
            return atomReadDocument(atomRoot, null, context.metadata);
        }
    }
};

var atomSerializer = function (handler, data, context) {
    /// <summary>Serializes an ATOM object into a document (feed or entry).</summary>
    /// <param name="handler">This handler.</param>
    /// <param name="data" type="Object">Representation of feed or entry.</param>
    /// <param name="context" type="Object">Object with parsing context.</param>
    /// <returns>An text representation of the data object; undefined if not applicable.</returns>

    var cType = context.contentType = context.contentType || contentType(atomMediaType);
    if (cType && cType.mediaType === atomMediaType) {
        var atomDoc = atomNewODataDocument(data, context.metadata);
        if (atomDoc) {
            context.dataServiceVersion = maxVersion(context.dataServiceVersion || "1.0", atomDoc.dsv);
            return xmlSerialize(atomDoc.element);
        }
    }
    // Allow undefined to be returned.
};

exports.atomHandler = handler(atomParser, atomSerializer, atomAcceptTypes.join(","), MAX_DATA_SERVICE_VERSION);

// DATAJS INTERNAL START
exports.atomParser = atomParser;
exports.atomSerializer = atomSerializer;
exports.atomReadDocument = atomReadDocument;
exports.atomReadFeed = atomReadFeed;
exports.atomReadFeedLink = atomReadFeedLink;
exports.atomReadLink = atomReadLink;
exports.atomReadExtensionElement = atomReadExtensionElement;
exports.atomReadExtensionAttributes = atomReadExtensionAttributes;
exports.atomReadEntry = atomReadEntry;
exports.atomReadEntryType = atomReadEntryType;
exports.atomReadEntryContent = atomReadEntryContent;
exports.atomReadEntryLink = atomReadEntryLink;
exports.atomReadEntryStructuralObject = atomReadEntryStructuralObject;
exports.atomReadServiceDocument = atomReadServiceDocument;
exports.atomReadServiceDocumentWorkspace = atomReadServiceDocumentWorkspace;
exports.atomReadServiceDocumentCollection = atomReadServiceDocumentCollection;
exports.expandedFeedCustomizationPath = expandedFeedCustomizationPath;
exports.lookupPropertyType = lookupPropertyType;
exports.atomSetEntryValueByPath = atomSetEntryValueByPath;
// DATAJS INTERNAL END