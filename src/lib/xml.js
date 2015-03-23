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
 

/** @module odatajs/xml */

var utils    = require('./utils.js');

var activeXObject = utils.activeXObject;
var djsassert = utils.djsassert;
var extend = utils.extend;
var isArray = utils.isArray;
var normalizeURI = utils.normalizeURI;

// URI prefixes to generate smaller code.
var http = "http://";
var w3org = http + "www.w3.org/";               // http://www.w3.org/

var xhtmlNS = w3org + "1999/xhtml";             // http://www.w3.org/1999/xhtml
var xmlnsNS = w3org + "2000/xmlns/";            // http://www.w3.org/2000/xmlns/
var xmlNS = w3org + "XML/1998/namespace";       // http://www.w3.org/XML/1998/namespace

var mozillaParserErroNS = http + "www.mozilla.org/newlayout/xml/parsererror.xml";

/** Checks whether the specified string has leading or trailing spaces.
 * @param {String} text - String to check.
 * @returns {Boolean} true if text has any leading or trailing whitespace; false otherwise.
 */
function hasLeadingOrTrailingWhitespace(text) {
    var re = /(^\s)|(\s$)/;
    return re.test(text);
}

/** Determines whether the specified text is empty or whitespace.
 * @param {String} text - Value to inspect.
 * @returns {Boolean} true if the text value is empty or all whitespace; false otherwise.
 */
function isWhitespace(text) {


    var ws = /^\s*$/;
    return text === null || ws.test(text);
}

/** Determines whether the specified element has xml:space='preserve' applied.
 * @param domElement - Element to inspect.
 * @returns {Boolean} Whether xml:space='preserve' is in effect.
 */
function isWhitespacePreserveContext(domElement) {


    while (domElement !== null && domElement.nodeType === 1) {
        var val = xmlAttributeValue(domElement, "space", xmlNS);
        if (val === "preserve") {
            return true;
        } else if (val === "default") {
            break;
        } else {
            domElement = domElement.parentNode;
        }
    }

    return false;
}

/** Determines whether the attribute is a XML namespace declaration.
 * @param domAttribute - Element to inspect.
 * @return {Boolean} True if the attribute is a namespace declaration (its name is 'xmlns' or starts with 'xmlns:'; false otherwise.
 */
function isXmlNSDeclaration(domAttribute) {
    var nodeName = domAttribute.nodeName;
    return nodeName == "xmlns" || nodeName.indexOf("xmlns:") === 0;
}

/** Safely set as property in an object by invoking obj.setProperty.
 * @param obj - Object that exposes a setProperty method.
 * @param {String} name - Property name
 * @param value - Property value.
 */
function safeSetProperty(obj, name, value) {


    try {
        obj.setProperty(name, value);
    } catch (_) { }
}

/** Creates an configures new MSXML 3.0 ActiveX object.
 * @returns {Object} New MSXML 3.0 ActiveX object.
 * This function throws any exception that occurs during the creation
 * of the MSXML 3.0 ActiveX object.
 */
function msXmlDom3() {
    var msxml3 = activeXObject("Msxml2.DOMDocument.3.0");
    if (msxml3) {
        safeSetProperty(msxml3, "ProhibitDTD", true);
        safeSetProperty(msxml3, "MaxElementDepth", 256);
        safeSetProperty(msxml3, "AllowDocumentFunction", false);
        safeSetProperty(msxml3, "AllowXsltScript", false);
    }
    return msxml3;
}

/** Creates an configures new MSXML 6.0 or MSXML 3.0 ActiveX object.
 * @returns {Object} New MSXML 3.0 ActiveX object.
 * This function will try to create a new MSXML 6.0 ActiveX object. If it fails then
 * it will fallback to create a new MSXML 3.0 ActiveX object. Any exception that
 * happens during the creation of the MSXML 6.0 will be handled by the function while
 * the ones that happend during the creation of the MSXML 3.0 will be thrown.
 */
function msXmlDom() {
    try {
        var msxml = activeXObject("Msxml2.DOMDocument.6.0");
        if (msxml) {
            msxml.async = true;
        }
        return msxml;
    } catch (_) {
        return msXmlDom3();
    }
}

/** Parses an XML string using the MSXML DOM.
 * @returns {Object} New MSXML DOMDocument node representing the parsed XML string.
 * This function throws any exception that occurs during the creation
 * of the MSXML ActiveX object.  It also will throw an exception
 * in case of a parsing error.
 */
function msXmlParse(text) {
    var dom = msXmlDom();
    if (!dom) {
        return null;
    }

    dom.loadXML(text);
    var parseError = dom.parseError;
    if (parseError.errorCode !== 0) {
        xmlThrowParserError(parseError.reason, parseError.srcText, text);
    }
    return dom;
}

/** Throws a new exception containing XML parsing error information.
 * @param exceptionOrReason - String indicating the reason of the parsing failure or Object detailing the parsing error.
 * @param {String} srcText -     String indicating the part of the XML string that caused the parsing error.
 * @param {String} errorXmlText - XML string for wich the parsing failed.
 */
function xmlThrowParserError(exceptionOrReason, srcText, errorXmlText) {

    if (typeof exceptionOrReason === "string") {
        exceptionOrReason = { message: exceptionOrReason };
    }
    throw extend(exceptionOrReason, { srcText: srcText || "", errorXmlText: errorXmlText || "" });
}

/** Returns an XML DOM document from the specified text.
 * @param {String} text - Document text.
 * @returns XML DOM document.
 * This function will throw an exception in case of a parse error
 */
function xmlParse(text) {
    var domParser = undefined;
    if (utils.inBrowser()) {
        domParser = window.DOMParser && new window.DOMParser();
    } else {
        domParser = new (require('xmldom').DOMParser)();
    }
    var dom;

    if (!domParser) {
        dom = msXmlParse(text);
        if (!dom) {
            xmlThrowParserError("XML DOM parser not supported");
        }
        return dom;
    }

    try {
        dom = domParser.parseFromString(text, "text/xml");
    } catch (e) {
        xmlThrowParserError(e, "", text);
    }

    var element = dom.documentElement;
    var nsURI = element.namespaceURI;
    var localName = xmlLocalName(element);

    // Firefox reports errors by returing the DOM for an xml document describing the problem.
    if (localName === "parsererror" && nsURI === mozillaParserErroNS) {
        var srcTextElement = xmlFirstChildElement(element, mozillaParserErroNS, "sourcetext");
        var srcText = srcTextElement ? xmlNodeValue(srcTextElement) : "";
        xmlThrowParserError(xmlInnerText(element) || "", srcText, text);
    }

    // Chrome (and maybe other webkit based browsers) report errors by injecting a header with an error message.
    // The error may be localized, so instead we simply check for a header as the
    // top element or descendant child of the document.
    if (localName === "h3" && nsURI === xhtmlNS || xmlFirstDescendantElement(element, xhtmlNS, "h3")) {
        var reason = "";
        var siblings = [];
        var cursor = element.firstChild;
        while (cursor) {
            if (cursor.nodeType === 1) {
                reason += xmlInnerText(cursor) || "";
            }
            siblings.push(cursor.nextSibling);
            cursor = cursor.firstChild || siblings.shift();
        }
        reason += xmlInnerText(element) || "";
        xmlThrowParserError(reason, "", text);
    }

    return dom;
}

/** Builds a XML qualified name string in the form of "prefix:name".
 * @param {String} prefix - Prefix string (may be null)
 * @param {String} name - Name string to qualify with the prefix.
 * @returns {String} Qualified name.
 */
function xmlQualifiedName(prefix, name) {
    return prefix ? prefix + ":" + name : name;
}

/** Appends a text node into the specified DOM element node.
 * @param domNode - DOM node for the element.
 * @param {String} textNode - Text to append as a child of element.
*/
function xmlAppendText(domNode, textNode) {
    if (hasLeadingOrTrailingWhitespace(textNode.data)) {
        var attr = xmlAttributeNode(domNode, xmlNS, "space");
        if (!attr) {
            attr = xmlNewAttribute(domNode.ownerDocument, xmlNS, xmlQualifiedName("xml", "space"));
            xmlAppendChild(domNode, attr);
        }
        attr.value = "preserve";
    }
    domNode.appendChild(textNode);
    return domNode;
}

/** Iterates through the XML element's attributes and invokes the callback function for each one.
 * @param element - Wrapped element to iterate over.
 * @param {Function} onAttributeCallback - Callback function to invoke with wrapped attribute nodes.
*/
function xmlAttributes(element, onAttributeCallback) {
    var attributes = element.attributes;
    var i, len;
    for (i = 0, len = attributes.length; i < len; i++) {
        onAttributeCallback(attributes.item(i));
    }
}

/** Returns the value of a DOM element's attribute.
 * @param domNode - DOM node for the owning element.
 * @param {String} localName - Local name of the attribute.
 * @param {String} nsURI - Namespace URI of the attribute.
 * @returns {String} - The attribute value, null if not found (may be null)
 */
function xmlAttributeValue(domNode, localName, nsURI) {

    var attribute = xmlAttributeNode(domNode, localName, nsURI);
    return attribute ? xmlNodeValue(attribute) : null;
}

/** Gets an attribute node from a DOM element.
 * @param domNode - DOM node for the owning element.
 * @param {String} localName - Local name of the attribute.
 * @param {String} nsURI - Namespace URI of the attribute.
 * @returns The attribute node, null if not found.
 */
function xmlAttributeNode(domNode, localName, nsURI) {

    var attributes = domNode.attributes;
    if (attributes.getNamedItemNS) {
        return attributes.getNamedItemNS(nsURI || null, localName);
    }

    return attributes.getQualifiedItem(localName, nsURI) || null;
}

/** Gets the value of the xml:base attribute on the specified element.
 * @param domNode - Element to get xml:base attribute value from.
 * @param [baseURI] - Base URI used to normalize the value of the xml:base attribute ( may be null)
 * @returns {String} Value of the xml:base attribute if found; the baseURI or null otherwise.
 */
function xmlBaseURI(domNode, baseURI) {

    var base = xmlAttributeNode(domNode, "base", xmlNS);
    return (base ? normalizeURI(base.value, baseURI) : baseURI) || null;
}


/** Iterates through the XML element's child DOM elements and invokes the callback function for each one.
 * @param domNode - DOM Node containing the DOM elements to iterate over.
 * @param {Function} onElementCallback - Callback function to invoke for each child DOM element.
*/
function xmlChildElements(domNode, onElementCallback) {

    xmlTraverse(domNode, /*recursive*/false, function (child) {
        if (child.nodeType === 1) {
            onElementCallback(child);
        }
        // continue traversing.
        return true;
    });
}

/** Gets the descendant element under root that corresponds to the specified path and namespace URI.
 * @param root - DOM element node from which to get the descendant element.
 * @param {String} namespaceURI - The namespace URI of the element to match.
 * @param {String} path - Path to the desired descendant element.
 * @return The element specified by path and namespace URI.
 * All the elements in the path are matched against namespaceURI.
 * The function will stop searching on the first element that doesn't match the namespace and the path.
 */
function xmlFindElementByPath(root, namespaceURI, path) {
    var parts = path.split("/");
    var i, len;
    for (i = 0, len = parts.length; i < len; i++) {
        root = root && xmlFirstChildElement(root, namespaceURI, parts[i]);
    }
    return root || null;
}

/** Gets the DOM element or DOM attribute node under root that corresponds to the specified path and namespace URI.
 * @param root - DOM element node from which to get the descendant node.
 * @param {String} namespaceURI - The namespace URI of the node to match.
 * @param {String} path - Path to the desired descendant node.
 * @return The node specified by path and namespace URI.

* This function will traverse the path and match each node associated to a path segement against the namespace URI.
* The traversal stops when the whole path has been exahusted or a node that doesn't belogong the specified namespace is encountered.
* The last segment of the path may be decorated with a starting @ character to indicate that the desired node is a DOM attribute.
*/
function xmlFindNodeByPath(root, namespaceURI, path) {
    

    var lastSegmentStart = path.lastIndexOf("/");
    var nodePath = path.substring(lastSegmentStart + 1);
    var parentPath = path.substring(0, lastSegmentStart);

    var node = parentPath ? xmlFindElementByPath(root, namespaceURI, parentPath) : root;
    if (node) {
        if (nodePath.charAt(0) === "@") {
            return xmlAttributeNode(node, nodePath.substring(1), namespaceURI);
        }
        return xmlFirstChildElement(node, namespaceURI, nodePath);
    }
    return null;
}

/** Returns the first child DOM element under the specified DOM node that matches the specified namespace URI and local name.
 * @param domNode - DOM node from which the child DOM element is going to be retrieved.
 * @param {String} [namespaceURI] - 
 * @param {String} [localName] - 
 * @return The node's first child DOM element that matches the specified namespace URI and local name; null otherwise.
 */
function xmlFirstChildElement(domNode, namespaceURI, localName) {

    return xmlFirstElementMaybeRecursive(domNode, namespaceURI, localName, /*recursive*/false);
}

/** Returns the first descendant DOM element under the specified DOM node that matches the specified namespace URI and local name.
 * @param domNode - DOM node from which the descendant DOM element is going to be retrieved.
 * @param {String} [namespaceURI] - 
 * @param {String} [localName] - 
 * @return The node's first descendant DOM element that matches the specified namespace URI and local name; null otherwise.
*/
function xmlFirstDescendantElement(domNode, namespaceURI, localName) {
    if (domNode.getElementsByTagNameNS) {
        var result = domNode.getElementsByTagNameNS(namespaceURI, localName);
        return result.length > 0 ? result[0] : null;
    }
    return xmlFirstElementMaybeRecursive(domNode, namespaceURI, localName, /*recursive*/true);
}

/** Returns the first descendant DOM element under the specified DOM node that matches the specified namespace URI and local name.
 * @param domNode - DOM node from which the descendant DOM element is going to be retrieved.
 * @param {String} [namespaceURI] - 
 * @param {String} [localName] - 
 * @param {Boolean} recursive 
 * - True if the search should include all the descendants of the DOM node.  
 * - False if the search should be scoped only to the direct children of the DOM node.
 * @return The node's first descendant DOM element that matches the specified namespace URI and local name; null otherwise.
 */
function xmlFirstElementMaybeRecursive(domNode, namespaceURI, localName, recursive) {

    var firstElement = null;
    xmlTraverse(domNode, recursive, function (child) {
        if (child.nodeType === 1) {
            var isExpectedNamespace = !namespaceURI || xmlNamespaceURI(child) === namespaceURI;
            var isExpectedNodeName = !localName || xmlLocalName(child) === localName;

            if (isExpectedNamespace && isExpectedNodeName) {
                firstElement = child;
            }
        }
        return firstElement === null;
    });
    return firstElement;
}

/** Gets the concatenated value of all immediate child text and CDATA nodes for the specified element.
 * @param xmlElement - Element to get values for.
 * @returns {String} Text for all direct children.
 */
function xmlInnerText(xmlElement) {

    var result = null;
    var root = (xmlElement.nodeType === 9 && xmlElement.documentElement) ? xmlElement.documentElement : xmlElement;
    var whitespaceAlreadyRemoved = root.ownerDocument.preserveWhiteSpace === false;
    var whitespacePreserveContext;

    xmlTraverse(root, false, function (child) {
        if (child.nodeType === 3 || child.nodeType === 4) {
            // isElementContentWhitespace indicates that this is 'ignorable whitespace',
            // but it's not defined by all browsers, and does not honor xml:space='preserve'
            // in some implementations.
            //
            // If we can't tell either way, we walk up the tree to figure out whether
            // xml:space is set to preserve; otherwise we discard pure-whitespace.
            //
            // For example <a>  <b>1</b></a>. The space between <a> and <b> is usually 'ignorable'.
            var text = xmlNodeValue(child);
            var shouldInclude = whitespaceAlreadyRemoved || !isWhitespace(text);
            if (!shouldInclude) {
                // Walk up the tree to figure out whether we are in xml:space='preserve' context
                // for the cursor (needs to happen only once).
                if (whitespacePreserveContext === undefined) {
                    whitespacePreserveContext = isWhitespacePreserveContext(root);
                }

                shouldInclude = whitespacePreserveContext;
            }

            if (shouldInclude) {
                if (!result) {
                    result = text;
                } else {
                    result += text;
                }
            }
        }
        // Continue traversing?
        return true;
    });
    return result;
}

/** Returns the localName of a XML node.
 * @param domNode - DOM node to get the value from.
 * @returns {String} localName of domNode.
 */
function xmlLocalName(domNode) {

    return domNode.localName || domNode.baseName;
}

/** Returns the namespace URI of a XML node.
 * @param domNode - DOM node to get the value from.
 * @returns {String} Namespace URI of domNode.
 */
function xmlNamespaceURI(domNode) {

    return domNode.namespaceURI || null;
}

/** Returns the value or the inner text of a XML node.
 * @param domNode - DOM node to get the value from.
 * @return Value of the domNode or the inner text if domNode represents a DOM element node.
 */
function xmlNodeValue(domNode) {
    
    if (domNode.nodeType === 1) {
        return xmlInnerText(domNode);
    }
    return domNode.nodeValue;
}

/** Walks through the descendants of the domNode and invokes a callback for each node.
 * @param domNode - DOM node whose descendants are going to be traversed.
 * @param {Boolean} recursive
 * - True if the traversal should include all the descenants of the DOM node.
 * - False if the traversal should be scoped only to the direct children of the DOM node.
 * @param {Boolean} onChildCallback - Called for each child
 * @returns {String} Namespace URI of node.
 */
function xmlTraverse(domNode, recursive, onChildCallback) {

    var subtrees = [];
    var child = domNode.firstChild;
    var proceed = true;
    while (child && proceed) {
        proceed = onChildCallback(child);
        if (proceed) {
            if (recursive && child.firstChild) {
                subtrees.push(child.firstChild);
            }
            child = child.nextSibling || subtrees.shift();
        }
    }
}

/** Returns the next sibling DOM element of the specified DOM node.
 * @param domNode - DOM node from which the next sibling is going to be retrieved.
 * @param {String} [namespaceURI] - 
 * @param {String} [localName] - 
 * @return The node's next sibling DOM element, null if there is none.
 */
function xmlSiblingElement(domNode, namespaceURI, localName) {

    var sibling = domNode.nextSibling;
    while (sibling) {
        if (sibling.nodeType === 1) {
            var isExpectedNamespace = !namespaceURI || xmlNamespaceURI(sibling) === namespaceURI;
            var isExpectedNodeName = !localName || xmlLocalName(sibling) === localName;

            if (isExpectedNamespace && isExpectedNodeName) {
                return sibling;
            }
        }
        sibling = sibling.nextSibling;
    }
    return null;
}

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
function xmlDom() {
    var implementation = window.document.implementation;
    return (implementation && implementation.createDocument) ?
       implementation.createDocument(null, null, null) :
       msXmlDom();
}

/** Appends a collection of child nodes or string values to a parent DOM node.
 * @param parent - DOM node to which the children will be appended.
 * @param {Array} children - Array containing DOM nodes or string values that will be appended to the parent.
 * @return The parent with the appended children or string values.
 *  If a value in the children collection is a string, then a new DOM text node is going to be created
 *  for it and then appended to the parent.
 */
function xmlAppendChildren(parent, children) {
    if (!isArray(children)) {
        return xmlAppendChild(parent, children);
    }

    var i, len;
    for (i = 0, len = children.length; i < len; i++) {
        children[i] && xmlAppendChild(parent, children[i]);
    }
    return parent;
}

/** Appends a child node or a string value to a parent DOM node.
 * @param parent - DOM node to which the child will be appended.
 * @param child - Child DOM node or string value to append to the parent.
 * @return The parent with the appended child or string value.
 * If child is a string value, then a new DOM text node is going to be created
 * for it and then appended to the parent.
 */
function xmlAppendChild(parent, child) {

    djsassert(parent !== child, "xmlAppendChild() - parent and child are one and the same!");
    if (child) {
        if (typeof child === "string") {
            return xmlAppendText(parent, xmlNewText(parent.ownerDocument, child));
        }
        if (child.nodeType === 2) {
            parent.setAttributeNodeNS ? parent.setAttributeNodeNS(child) : parent.setAttributeNode(child);
        } else {
            parent.appendChild(child);
        }
    }
    return parent;
}

/** Creates a new DOM attribute node.
 * @param dom - DOM document used to create the attribute.
 * @param {String} namespaceURI - Namespace URI.
 * @param {String} qualifiedName - Qualified OData name
 * @param {String} value - Value of the new attribute
 * @return DOM attribute node for the namespace declaration.
 */
function xmlNewAttribute(dom, namespaceURI, qualifiedName, value) {

    var attribute =
        dom.createAttributeNS && dom.createAttributeNS(namespaceURI, qualifiedName) ||
        dom.createNode(2, qualifiedName, namespaceURI || undefined);

    attribute.value = value || "";
    return attribute;
}

/** Creates a new DOM element node.
 * @param dom - DOM document used to create the DOM element.
 * @param {String} namespaceURI - Namespace URI of the new DOM element.
 * @param {String} qualifiedName - Qualified name in the form of "prefix:name" of the new DOM element.
 * @param {Array} [children] Collection of child DOM nodes or string values that are going to be appended to the new DOM element.
 * @return New DOM element.
 * If a value in the children collection is a string, then a new DOM text node is going to be created
 * for it and then appended to the new DOM element.
 */
function xmlNewElement(dom, namespaceURI, qualifiedName, children) {
    var element =
        dom.createElementNS && dom.createElementNS(nampespaceURI, qualifiedName) ||
        dom.createNode(1, qualifiedName, nampespaceURI || undefined);

    return xmlAppendChildren(element, children || []);
}

/** Creates a namespace declaration attribute.
 * @param dom - DOM document used to create the attribute.
 * @param {String} namespaceURI - Namespace URI.
 * @param {String} prefix - Namespace prefix.
 * @return DOM attribute node for the namespace declaration.
 */
function xmlNewNSDeclaration(dom, namespaceURI, prefix) {
    return xmlNewAttribute(dom, xmlnsNS, xmlQualifiedName("xmlns", prefix), namespaceURI);
}

/** Creates a new DOM document fragment node for the specified xml text.
 * @param dom - DOM document from which the fragment node is going to be created.
 * @param {String} text XML text to be represented by the XmlFragment.
 * @return New DOM document fragment object.
 */
function xmlNewFragment(dom, text) {

    var value = "<c>" + text + "</c>";
    var tempDom = xmlParse(value);
    var tempRoot = tempDom.documentElement;
    var imported = ("importNode" in dom) ? dom.importNode(tempRoot, true) : tempRoot;
    var fragment = dom.createDocumentFragment();

    var importedChild = imported.firstChild;
    while (importedChild) {
        fragment.appendChild(importedChild);
        importedChild = importedChild.nextSibling;
    }
    return fragment;
}

/** Creates new DOM text node.
 * @param dom - DOM document used to create the text node.
 * @param {String} text - Text value for the DOM text node.
 * @return DOM text node.
 */ 
function xmlNewText(dom, text) {
    return dom.createTextNode(text);
}

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
function xmlNewNodeByPath(dom, root, namespaceURI, prefix, path) {
    var name = "";
    var parts = path.split("/");
    var xmlFindNode = xmlFirstChildElement;
    var xmlNewNode = xmlNewElement;
    var xmlNode = root;

    var i, len;
    for (i = 0, len = parts.length; i < len; i++) {
        name = parts[i];
        if (name.charAt(0) === "@") {
            name = name.substring(1);
            xmlFindNode = xmlAttributeNode;
            xmlNewNode = xmlNewAttribute;
        }

        var childNode = xmlFindNode(xmlNode, namespaceURI, name);
        if (!childNode) {
            childNode = xmlNewNode(dom, namespaceURI, xmlQualifiedName(prefix, name));
            xmlAppendChild(xmlNode, childNode);
        }
        xmlNode = childNode;
    }
    return xmlNode;
}

/** Returns the text representation of the document to which the specified node belongs.
 * @param domNode - Wrapped element in the document to serialize.
 * @returns {String} Serialized document.
*/
function xmlSerialize(domNode) {
    var xmlSerializer = window.XMLSerializer;
    if (xmlSerializer) {
        var serializer = new xmlSerializer();
        return serializer.serializeToString(domNode);
    }

    if (domNode.xml) {
        return domNode.xml;
    }

    throw { message: "XML serialization unsupported" };
}

/** Returns the XML representation of the all the descendants of the node.
 * @param domNode - Node to serialize.
 * @returns {String} The XML representation of all the descendants of the node.
 */
function xmlSerializeDescendants(domNode) {
    var children = domNode.childNodes;
    var i, len = children.length;
    if (len === 0) {
        return "";
    }

    // Some implementations of the XMLSerializer don't deal very well with fragments that
    // don't have a DOMElement as their first child. The work around is to wrap all the
    // nodes in a dummy root node named "c", serialize it and then just extract the text between
    // the <c> and the </c> substrings.

    var dom = domNode.ownerDocument;
    var fragment = dom.createDocumentFragment();
    var fragmentRoot = dom.createElement("c");

    fragment.appendChild(fragmentRoot);
    // Move the children to the fragment tree.
    for (i = 0; i < len; i++) {
        fragmentRoot.appendChild(children[i]);
    }

    var xml = xmlSerialize(fragment);
    xml = xml.substr(3, xml.length - 7);

    // Move the children back to the original dom tree.
    for (i = 0; i < len; i++) {
        domNode.appendChild(fragmentRoot.childNodes[i]);
    }

    return xml;
}

/** Returns the XML representation of the node and all its descendants.
 * @param domNode - Node to serialize
 * @returns {String} The XML representation of the node and all its descendants.
 */
function xmlSerializeNode(domNode) {

    var xml = domNode.xml;
    if (xml !== undefined) {
        return xml;
    }

    if (window.XMLSerializer) {
        var serializer = new window.XMLSerializer();
        return serializer.serializeToString(domNode);
    }

    throw { message: "XML serialization unsupported" };
}

exports.http = http;
exports.w3org = w3org;
exports.xmlNS = xmlNS;
exports.xmlnsNS = xmlnsNS;

exports.hasLeadingOrTrailingWhitespace = hasLeadingOrTrailingWhitespace;
exports.isXmlNSDeclaration = isXmlNSDeclaration;
exports.xmlAppendChild = xmlAppendChild;
exports.xmlAppendChildren = xmlAppendChildren;
exports.xmlAttributeNode = xmlAttributeNode;
exports.xmlAttributes = xmlAttributes;
exports.xmlAttributeValue = xmlAttributeValue;
exports.xmlBaseURI = xmlBaseURI;
exports.xmlChildElements = xmlChildElements;
exports.xmlFindElementByPath = xmlFindElementByPath;
exports.xmlFindNodeByPath = xmlFindNodeByPath;
exports.xmlFirstChildElement = xmlFirstChildElement;
exports.xmlFirstDescendantElement = xmlFirstDescendantElement;
exports.xmlInnerText = xmlInnerText;
exports.xmlLocalName = xmlLocalName;
exports.xmlNamespaceURI = xmlNamespaceURI;
exports.xmlNodeValue = xmlNodeValue;
exports.xmlDom = xmlDom;
exports.xmlNewAttribute = xmlNewAttribute;
exports.xmlNewElement = xmlNewElement;
exports.xmlNewFragment = xmlNewFragment;
exports.xmlNewNodeByPath = xmlNewNodeByPath;
exports.xmlNewNSDeclaration = xmlNewNSDeclaration;
exports.xmlNewText = xmlNewText;
exports.xmlParse = xmlParse;
exports.xmlQualifiedName = xmlQualifiedName;
exports.xmlSerialize = xmlSerialize;
exports.xmlSerializeDescendants = xmlSerializeDescendants;
exports.xmlSiblingElement = xmlSiblingElement;
