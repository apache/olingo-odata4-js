//SK name /odata/odata-metadata.js
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

// odata-metadata.js


var utils    = require('./../datajs.js').utils;
var oDataXML    = require('./xml.js');
var oDSxml    = require('./../datajs.js').xml;
var odataHandler    = require('./handler.js');

// imports 

var contains = utils.contains;
var normalizeURI = utils.normalizeURI;
var xmlAttributes = oDSxml.xmlAttributes;
var xmlChildElements = oDSxml.xmlChildElements;
var xmlFirstChildElement = oDSxml.xmlFirstChildElement;
var xmlInnerText = oDSxml.xmlInnerText;
var xmlLocalName = oDSxml.xmlLocalName;
var xmlNamespaceURI = oDSxml.xmlNamespaceURI;
var xmlNS = oDSxml.xmlNS;
var xmlnsNS = oDSxml.xmlnsNS;
var xmlParse = oDSxml.xmlParse;

var createAttributeExtension = oDataXML.createAttributeExtension;
var createElementExtension = oDataXML.createElementExtension;
var edmxNs = oDataXML.edmxNs;
var edmNs1 = oDataXML.edmNs1;
var edmNs1_1 = oDataXML.edmNs1_1;
var edmNs1_2 = oDataXML.edmNs1_2;
var edmNs2a = oDataXML.edmNs2a;
var edmNs2b = oDataXML.edmNs2b;
var edmNs3 = oDataXML.edmNs3;
var handler = oDataXML.handler;
var MAX_DATA_SERVICE_VERSION = oDataXML.MAX_DATA_SERVICE_VERSION;
var odataMetaXmlNs = oDataXML.odataMetaXmlNs;


var xmlMediaType = "application/xml";

// CONTENT START

var schemaElement = function (attributes, elements, text, ns) {
    /// <summary>Creates an object that describes an element in an schema.</summary>
    /// <param name="attributes" type="Array">List containing the names of the attributes allowed for this element.</param>
    /// <param name="elements" type="Array">List containing the names of the child elements allowed for this element.</param>
    /// <param name="text" type="Boolean">Flag indicating if the element's text value is of interest or not.</param>
    /// <param name="ns" type="String">Namespace to which the element belongs to.</param>
    /// <remarks>
    ///    If a child element name ends with * then it is understood by the schema that that child element can appear 0 or more times.
    /// </remarks>
    /// <returns type="Object">Object with attributes, elements, text, and ns fields.</returns>

    return {
        attributes: attributes,
        elements: elements,
        text: text || false,
        ns: ns
    };
};

// It's assumed that all elements may have Documentation children and Annotation elements.
// See http://msdn.microsoft.com/en-us/library/bb399292.aspx for a CSDL reference.
var schema = {
    elements: {
        Annotations: schemaElement(
        /*attributes*/["Target", "Qualifier"],
        /*elements*/["TypeAnnotation*", "ValueAnnotation*"]
        ),
        Association: schemaElement(
        /*attributes*/["Name"],
        /*elements*/["End*", "ReferentialConstraint", "TypeAnnotation*", "ValueAnnotation*"]
        ),
        AssociationSet: schemaElement(
        /*attributes*/["Name", "Association"],
        /*elements*/["End*", "TypeAnnotation*", "ValueAnnotation*"]
        ),
        Binary: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Bool: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Collection: schemaElement(
        /*attributes*/null,
        /*elements*/["String*", "Int*", "Float*", "Decimal*", "Bool*", "DateTime*", "DateTimeOffset*", "Guid*", "Binary*", "Time*", "Collection*", "Record*"]
        ),
        CollectionType: schemaElement(
        /*attributes*/["ElementType", "Nullable", "DefaultValue", "MaxLength", "FixedLength", "Precision", "Scale", "Unicode", "Collation", "SRID"],
        /*elements*/["CollectionType", "ReferenceType", "RowType", "TypeRef"]
        ),
        ComplexType: schemaElement(
        /*attributes*/["Name", "BaseType", "Abstract"],
        /*elements*/["Property*", "TypeAnnotation*", "ValueAnnotation*"]
        ),
        DateTime: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        DateTimeOffset: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Decimal: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        DefiningExpression: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Dependent: schemaElement(
        /*attributes*/["Role"],
        /*elements*/["PropertyRef*"]
        ),
        Documentation: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        End: schemaElement(
        /*attributes*/["Type", "Role", "Multiplicity", "EntitySet"],
        /*elements*/["OnDelete"]
        ),
        EntityContainer: schemaElement(
        /*attributes*/["Name", "Extends"],
        /*elements*/["EntitySet*", "AssociationSet*", "FunctionImport*", "TypeAnnotation*", "ValueAnnotation*"]
        ),
        EntitySet: schemaElement(
        /*attributes*/["Name", "EntityType"],
        /*elements*/["TypeAnnotation*", "ValueAnnotation*"]
        ),
        EntityType: schemaElement(
        /*attributes*/["Name", "BaseType", "Abstract", "OpenType"],
        /*elements*/["Key", "Property*", "NavigationProperty*", "TypeAnnotation*", "ValueAnnotation*"]
        ),
        EnumType: schemaElement(
        /*attributes*/["Name", "UnderlyingType", "IsFlags"],
        /*elements*/["Member*"]
        ),
        Float: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Function: schemaElement(
        /*attributes*/["Name", "ReturnType"],
        /*elements*/["Parameter*", "DefiningExpression", "ReturnType", "TypeAnnotation*", "ValueAnnotation*"]
        ),
        FunctionImport: schemaElement(
        /*attributes*/["Name", "ReturnType", "EntitySet", "IsSideEffecting", "IsComposable", "IsBindable", "EntitySetPath"],
        /*elements*/["Parameter*", "ReturnType", "TypeAnnotation*", "ValueAnnotation*"]
        ),
        Guid: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Int: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Key: schemaElement(
        /*attributes*/null,
        /*elements*/["PropertyRef*"]
        ),
        LabeledElement: schemaElement(
        /*attributes*/["Name"],
        /*elements*/["Path", "String", "Int", "Float", "Decimal", "Bool", "DateTime", "DateTimeOffset", "Guid", "Binary", "Time", "Collection", "Record", "LabeledElement", "Null"]
        ),
        Member: schemaElement(
        /*attributes*/["Name", "Value"]
        ),
        NavigationProperty: schemaElement(
        /*attributes*/["Name", "Relationship", "ToRole", "FromRole", "ContainsTarget"],
        /*elements*/["TypeAnnotation*", "ValueAnnotation*"]
        ),
        Null: schemaElement(
        /*attributes*/null,
        /*elements*/null
        ),
        OnDelete: schemaElement(
        /*attributes*/["Action"]
        ),
        Path: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Parameter: schemaElement(
        /*attributes*/["Name", "Type", "Mode", "Nullable", "DefaultValue", "MaxLength", "FixedLength", "Precision", "Scale", "Unicode", "Collation", "ConcurrencyMode", "SRID"],
        /*elements*/["CollectionType", "ReferenceType", "RowType", "TypeRef", "TypeAnnotation*", "ValueAnnotation*"]
        ),
        Principal: schemaElement(
        /*attributes*/["Role"],
        /*elements*/["PropertyRef*"]
        ),
        Property: schemaElement(
        /*attributes*/["Name", "Type", "Nullable", "DefaultValue", "MaxLength", "FixedLength", "Precision", "Scale", "Unicode", "Collation", "ConcurrencyMode", "CollectionKind", "SRID"],
        /*elements*/["CollectionType", "ReferenceType", "RowType", "TypeAnnotation*", "ValueAnnotation*"]
        ),
        PropertyRef: schemaElement(
        /*attributes*/["Name"]
        ),
        PropertyValue: schemaElement(
        /*attributes*/["Property", "Path", "String", "Int", "Float", "Decimal", "Bool", "DateTime", "DateTimeOffset", "Guid", "Binary", "Time"],
        /*Elements*/["Path", "String", "Int", "Float", "Decimal", "Bool", "DateTime", "DateTimeOffset", "Guid", "Binary", "Time", "Collection", "Record", "LabeledElement", "Null"]
        ),
        ReferenceType: schemaElement(
        /*attributes*/["Type"]
        ),
        ReferentialConstraint: schemaElement(
        /*attributes*/null,
        /*elements*/["Principal", "Dependent"]
        ),
        ReturnType: schemaElement(
        /*attributes*/["ReturnType", "Type", "EntitySet"],
        /*elements*/["CollectionType", "ReferenceType", "RowType"]
        ),
        RowType: schemaElement(
        /*elements*/["Property*"]
        ),
        String: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Schema: schemaElement(
        /*attributes*/["Namespace", "Alias"],
        /*elements*/["Using*", "EntityContainer*", "EntityType*", "Association*", "ComplexType*", "Function*", "ValueTerm*", "Annotations*"]
        ),
        Time: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        TypeAnnotation: schemaElement(
        /*attributes*/["Term", "Qualifier"],
        /*elements*/["PropertyValue*"]
        ),
        TypeRef: schemaElement(
        /*attributes*/["Type", "Nullable", "DefaultValue", "MaxLength", "FixedLength", "Precision", "Scale", "Unicode", "Collation", "SRID"]
        ),
        Using: schemaElement(
        /*attributes*/["Namespace", "Alias"]
        ),
        ValueAnnotation: schemaElement(
        /*attributes*/["Term", "Qualifier", "Path", "String", "Int", "Float", "Decimal", "Bool", "DateTime", "DateTimeOffset", "Guid", "Binary", "Time"],
        /*Elements*/["Path", "String", "Int", "Float", "Decimal", "Bool", "DateTime", "DateTimeOffset", "Guid", "Binary", "Time", "Collection", "Record", "LabeledElement", "Null"]
        ),
        ValueTerm: schemaElement(
        /*attributes*/["Name", "Type"],
        /*elements*/["TypeAnnotation*", "ValueAnnotation*"]
        ),

        // See http://msdn.microsoft.com/en-us/library/dd541238(v=prot.10) for an EDMX reference.
        Edmx: schemaElement(
        /*attributes*/["Version"],
        /*elements*/["DataServices", "Reference*", "AnnotationsReference*"],
        /*text*/false,
        /*ns*/edmxNs
        ),
        DataServices: schemaElement(
        /*attributes*/null,
        /*elements*/["Schema*"],
        /*text*/false,
        /*ns*/edmxNs
        )
    }
};

// See http://msdn.microsoft.com/en-us/library/ee373839.aspx for a feed customization reference.
var customizationAttributes = ["m:FC_ContentKind", "m:FC_KeepInContent", "m:FC_NsPrefix", "m:FC_NsUri", "m:FC_SourcePath", "m:FC_TargetPath"];
schema.elements.Property.attributes = schema.elements.Property.attributes.concat(customizationAttributes);
schema.elements.EntityType.attributes = schema.elements.EntityType.attributes.concat(customizationAttributes);

// See http://msdn.microsoft.com/en-us/library/dd541284(PROT.10).aspx for an EDMX reference.
schema.elements.Edmx = { attributes: ["Version"], elements: ["DataServices"], ns: edmxNs };
schema.elements.DataServices = { elements: ["Schema*"], ns: edmxNs };

// See http://msdn.microsoft.com/en-us/library/dd541233(v=PROT.10) for Conceptual Schema Definition Language Document for Data Services.
schema.elements.EntityContainer.attributes.push("m:IsDefaultEntityContainer");
schema.elements.Property.attributes.push("m:MimeType");
schema.elements.FunctionImport.attributes.push("m:HttpMethod");
schema.elements.FunctionImport.attributes.push("m:IsAlwaysBindable");
schema.elements.EntityType.attributes.push("m:HasStream");
schema.elements.DataServices.attributes = ["m:DataServiceVersion", "m:MaxDataServiceVersion"];

var scriptCase = function (text) {
    /// <summary>Converts a Pascal-case identifier into a camel-case identifier.</summary>
    /// <param name="text" type="String">Text to convert.</param>
    /// <returns type="String">Converted text.</returns>
    /// <remarks>If the text starts with multiple uppercase characters, it is left as-is.</remarks>

    if (!text) {
        return text;
    }

    if (text.length > 1) {
        var firstTwo = text.substr(0, 2);
        if (firstTwo === firstTwo.toUpperCase()) {
            return text;
        }

        return text.charAt(0).toLowerCase() + text.substr(1);
    }

    return text.charAt(0).toLowerCase();
};

var getChildSchema = function (parentSchema, candidateName) {
    /// <summary>Gets the schema node for the specified element.</summary>
    /// <param name="parentSchema" type="Object">Schema of the parent XML node of 'element'.</param>
    /// <param name="candidateName">XML element name to consider.</param>
    /// <returns type="Object">The schema that describes the specified element; null if not found.</returns>

    if (candidateName === "Documentation") {
        return { isArray: true, propertyName: "documentation" };
    }

    var elements = parentSchema.elements;
    if (!elements) {
        return null;
    }

    var i, len;
    for (i = 0, len = elements.length; i < len; i++) {
        var elementName = elements[i];
        var multipleElements = false;
        if (elementName.charAt(elementName.length - 1) === "*") {
            multipleElements = true;
            elementName = elementName.substr(0, elementName.length - 1);
        }

        if (candidateName === elementName) {
            var propertyName = scriptCase(elementName);
            return { isArray: multipleElements, propertyName: propertyName };
        }
    }

    return null;
};

// This regular expression is used to detect a feed customization element
// after we've normalized it into the 'm' prefix. It starts with m:FC_,
// followed by other characters, and ends with _ and a number.
// The captures are 0 - whole string, 1 - name as it appears in internal table.
var isFeedCustomizationNameRE = /^(m:FC_.*)_[0-9]+$/;

var isEdmNamespace = function (nsURI) {
    /// <summary>Checks whether the specifies namespace URI is one of the known CSDL namespace URIs.</summary>
    /// <param name="nsURI" type="String">Namespace URI to check.</param>
    /// <returns type="Boolean">true if nsURI is a known CSDL namespace; false otherwise.</returns>

    return nsURI === edmNs1 ||
           nsURI === edmNs1_1 ||
           nsURI === edmNs1_2 ||
           nsURI === edmNs2a ||
           nsURI === edmNs2b ||
           nsURI === edmNs3;
};

var parseConceptualModelElement = function (element) {
    /// <summary>Parses a CSDL document.</summary>
    /// <param name="element">DOM element to parse.</param>
    /// <returns type="Object">An object describing the parsed element.</returns>

    var localName = xmlLocalName(element);
    var nsURI = xmlNamespaceURI(element);
    var elementSchema = schema.elements[localName];
    if (!elementSchema) {
        return null;
    }

    if (elementSchema.ns) {
        if (nsURI !== elementSchema.ns) {
            return null;
        }
    } else if (!isEdmNamespace(nsURI)) {
        return null;
    }

    var item = {};
    var extensions = [];
    var attributes = elementSchema.attributes || [];
    xmlAttributes(element, function (attribute) {

        var localName = xmlLocalName(attribute);
        var nsURI = xmlNamespaceURI(attribute);
        var value = attribute.value;

        // Don't do anything with xmlns attributes.
        if (nsURI === xmlnsNS) {
            return;
        }

        // Currently, only m: for metadata is supported as a prefix in the internal schema table,
        // un-prefixed element names imply one a CSDL element.
        var schemaName = null;
        var handled = false;
        if (isEdmNamespace(nsURI) || nsURI === null) {
            schemaName = "";
        } else if (nsURI === odataMetaXmlNs) {
            schemaName = "m:";
        }

        if (schemaName !== null) {
            schemaName += localName;

            // Feed customizations for complex types have additional
            // attributes with a suffixed counter starting at '1', so
            // take that into account when doing the lookup.
            var match = isFeedCustomizationNameRE.exec(schemaName);
            if (match) {
                schemaName = match[1];
            }

            if (contains(attributes, schemaName)) {
                handled = true;
                item[scriptCase(localName)] = value;
            }
        }

        if (!handled) {
            extensions.push(createAttributeExtension(attribute));
        }
    });

    xmlChildElements(element, function (child) {
        var localName = xmlLocalName(child);
        var childSchema = getChildSchema(elementSchema, localName);
        if (childSchema) {
            if (childSchema.isArray) {
                var arr = item[childSchema.propertyName];
                if (!arr) {
                    arr = [];
                    item[childSchema.propertyName] = arr;
                }
                arr.push(parseConceptualModelElement(child));
            } else {
                item[childSchema.propertyName] = parseConceptualModelElement(child);
            }
        } else {
            extensions.push(createElementExtension(child));
        }
    });

    if (elementSchema.text) {
        item.text = xmlInnerText(element);
    }

    if (extensions.length) {
        item.extensions = extensions;
    }

    return item;
};

var metadataParser = function (handler, text) {
    /// <summary>Parses a metadata document.</summary>
    /// <param name="handler">This handler.</param>
    /// <param name="text" type="String">Metadata text.</param>
    /// <returns>An object representation of the conceptual model.</returns>

    var doc = xmlParse(text);
    var root = xmlFirstChildElement(doc);
    return parseConceptualModelElement(root) || undefined;
};

exports.metadataHandler = odataHandler.handler(metadataParser, null, xmlMediaType, MAX_DATA_SERVICE_VERSION);

// DATAJS INTERNAL START
exports.schema = schema;
exports.scriptCase = scriptCase;
exports.getChildSchema = getChildSchema;
exports.parseConceptualModelElement = parseConceptualModelElement;
exports.metadataParser = metadataParser;
// DATAJS INTERNAL END
