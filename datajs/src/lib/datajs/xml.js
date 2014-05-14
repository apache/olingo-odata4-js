/* {
    oldname:'xml.js',
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

// xml.js

var utils    = require('./utils.js');

var activeXObject = utils.activeXObject;
var djsassert = utils.djsassert;
var extend = utils.extend;
var isArray = utils.isArray;
var isObject = utils.isObject;
var normalizeURI = utils.normalizeURI;

// CONTENT START

// URI prefixes to generate smaller code.
var http = "http://";
var w3org = http + "www.w3.org/";               // http://www.w3.org/

var xhtmlNS = w3org + "1999/xhtml";             // http://www.w3.org/1999/xhtml
var xmlnsNS = w3org + "2000/xmlns/";            // http://www.w3.org/2000/xmlns/
var xmlNS = w3org + "XML/1998/namespace";       // http://www.w3.org/XML/1998/namespace

var mozillaParserErroNS = http + "www.mozilla.org/newlayout/xml/parsererror.xml";

var hasLeadingOrTrailingWhitespace = function (text) {
    /// <summary>Checks whether the specified string has leading or trailing spaces.</summary>
    /// <param name="text" type="String">String to check.</param>
    /// <returns type="Boolean">true if text has any leading or trailing whitespace; false otherwise.</returns>

    var re = /(^\s)|(\s$)/;
    return re.test(text);
};

var isWhitespace = function (text) {
    /// <summary>Determines whether the specified text is empty or whitespace.</summary>
    /// <param name="text" type="String">Value to inspect.</param>
    /// <returns type="Boolean">true if the text value is empty or all whitespace; false otherwise.</returns>

    var ws = /^\s*$/;
    return text === null || ws.test(text);
};

var isWhitespacePreserveContext = function (domElement) {
    /// <summary>Determines whether the specified element has xml:space='preserve' applied.</summary>
    /// <param name="domElement">Element to inspect.</param>
    /// <returns type="Boolean">Whether xml:space='preserve' is in effect.</returns>

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
};

var isXmlNSDeclaration = function (domAttribute) {
    /// <summary>Determines whether the attribute is a XML namespace declaration.</summary>
    /// <param name="domAttribute">Element to inspect.</param>
    /// <returns type="Boolean">
    ///    True if the attribute is a namespace declaration (its name is 'xmlns' or starts with 'xmlns:'; false otherwise.
    /// </returns>

    var nodeName = domAttribute.nodeName;
    return nodeName == "xmlns" || nodeName.indexOf("xmlns:") === 0;
};

var safeSetProperty = function (obj, name, value) {
    /// <summary>Safely set as property in an object by invoking obj.setProperty.</summary>
    /// <param name="obj">Object that exposes a setProperty method.</param>
    /// <param name="name" type="String" mayBeNull="false">Property name.</param>
    /// <param name="value">Property value.</param>

    try {
        obj.setProperty(name, value);
    } catch (_) { }
};

var msXmlDom3 = function () {
    /// <summary>Creates an configures new MSXML 3.0 ActiveX object.</summary>
    /// <remakrs>
    ///    This function throws any exception that occurs during the creation
    ///    of the MSXML 3.0 ActiveX object.
    /// <returns type="Object">New MSXML 3.0 ActiveX object.</returns>

    var msxml3 = activeXObject("Msxml2.DOMDocument.3.0");
    if (msxml3) {
        safeSetProperty(msxml3, "ProhibitDTD", true);
        safeSetProperty(msxml3, "MaxElementDepth", 256);
        safeSetProperty(msxml3, "AllowDocumentFunction", false);
        safeSetProperty(msxml3, "AllowXsltScript", false);
    }
    return msxml3;
};

var msXmlDom = function () {
    /// <summary>Creates an configures new MSXML 6.0 or MSXML 3.0 ActiveX object.</summary>
    /// <remakrs>
    ///    This function will try to create a new MSXML 6.0 ActiveX object. If it fails then
    ///    it will fallback to create a new MSXML 3.0 ActiveX object. Any exception that
    ///    happens during the creation of the MSXML 6.0 will be handled by the function while
    ///    the ones that happend during the creation of the MSXML 3.0 will be thrown.
    /// <returns type="Object">New MSXML 3.0 ActiveX object.</returns>

    try {
        var msxml = activeXObject("Msxml2.DOMDocument.6.0");
        if (msxml) {
            msxml.async = true;
        }
        return msxml;
    } catch (_) {
        return msXmlDom3();
    }
};

var msXmlParse = function (text) {
    /// <summary>Parses an XML string using the MSXML DOM.</summary>
    /// <remakrs>
    ///    This function throws any exception that occurs during the creation
    ///    of the MSXML ActiveX object.  It also will throw an exception
    ///    in case of a parsing error.
    /// <returns type="Object">New MSXML DOMDocument node representing the parsed XML string.</returns>

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
};

var xmlThrowParserError = function (exceptionOrReason, srcText, errorXmlText) {
    /// <summary>Throws a new exception containing XML parsing error information.</summary>
    /// <param name="exceptionOrReason">
    ///    String indicatin the reason of the parsing failure or
    ///    Object detailing the parsing error.
    /// </param>
    /// <param name="srcText" type="String">
    ///    String indicating the part of the XML string that caused the parsing error.
    /// </param>
    /// <param name="errorXmlText" type="String">XML string for wich the parsing failed.</param>

    if (typeof exceptionOrReason === "string") {
        exceptionOrReason = { message: exceptionOrReason };
    }
    throw extend(exceptionOrReason, { srcText: srcText || "", errorXmlText: errorXmlText || "" });
};

var xmlParse = function (text) {
    /// <summary>Returns an XML DOM document from the specified text.</summary>
    /// <param name="text" type="String">Document text.</param>
    /// <returns>XML DOM document.</returns>
    /// <remarks>This function will throw an exception in case of a parse error.</remarks>

    var domParser = window.DOMParser && new window.DOMParser();
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
};

var xmlQualifiedName = function (prefix, name) {
    /// <summary>Builds a XML qualified name string in the form of "prefix:name".</summary>
    /// <param name="prefix" type="String" maybeNull="true">Prefix string.</param>
    /// <param name="name" type="String">Name string to qualify with the prefix.</param>
    /// <returns type="String">Qualified name.</returns>

    return prefix ? prefix + ":" + name : name;
};

var xmlAppendText = function (domNode, textNode) {
    /// <summary>Appends a text node into the specified DOM element node.</summary>
    /// <param name="domNode">DOM node for the element.</param>
    /// <param name="text" type="String" mayBeNull="false">Text to append as a child of element.</param>
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
};

var xmlAttributes = function (element, onAttributeCallback) {
    /// <summary>Iterates through the XML element's attributes and invokes the callback function for each one.</summary>
    /// <param name="element">Wrapped element to iterate over.</param>
    /// <param name="onAttributeCallback" type="Function">Callback function to invoke with wrapped attribute nodes.</param>

    var attributes = element.attributes;
    var i, len;
    for (i = 0, len = attributes.length; i < len; i++) {
        onAttributeCallback(attributes.item(i));
    }
};

var xmlAttributeValue = function (domNode, localName, nsURI) {
    /// <summary>Returns the value of a DOM element's attribute.</summary>
    /// <param name="domNode">DOM node for the owning element.</param>
    /// <param name="localName" type="String">Local name of the attribute.</param>
    /// <param name="nsURI" type="String">Namespace URI of the attribute.</param>
    /// <returns type="String" maybeNull="true">The attribute value, null if not found.</returns>

    var attribute = xmlAttributeNode(domNode, localName, nsURI);
    return attribute ? xmlNodeValue(attribute) : null;
};

var xmlAttributeNode = function (domNode, localName, nsURI) {
    /// <summary>Gets an attribute node from a DOM element.</summary>
    /// <param name="domNode">DOM node for the owning element.</param>
    /// <param name="localName" type="String">Local name of the attribute.</param>
    /// <param name="nsURI" type="String">Namespace URI of the attribute.</param>
    /// <returns>The attribute node, null if not found.</returns>

    var attributes = domNode.attributes;
    if (attributes.getNamedItemNS) {
        return attributes.getNamedItemNS(nsURI || null, localName);
    }

    return attributes.getQualifiedItem(localName, nsURI) || null;
};

var xmlBaseURI = function (domNode, baseURI) {
    /// <summary>Gets the value of the xml:base attribute on the specified element.</summary>
    /// <param name="domNode">Element to get xml:base attribute value from.</param>
    /// <param name="baseURI" mayBeNull="true" optional="true">Base URI used to normalize the value of the xml:base attribute.</param>
    /// <returns type="String">Value of the xml:base attribute if found; the baseURI or null otherwise.</returns>

    var base = xmlAttributeNode(domNode, "base", xmlNS);
    return (base ? normalizeURI(base.value, baseURI) : baseURI) || null;
};


var xmlChildElements = function (domNode, onElementCallback) {
    /// <summary>Iterates through the XML element's child DOM elements and invokes the callback function for each one.</summary>
    /// <param name="element">DOM Node containing the DOM elements to iterate over.</param>
    /// <param name="onElementCallback" type="Function">Callback function to invoke for each child DOM element.</param>

    xmlTraverse(domNode, /*recursive*/false, function (child) {
        if (child.nodeType === 1) {
            onElementCallback(child);
        }
        // continue traversing.
        return true;
    });
};

var xmlFindElementByPath = function (root, namespaceURI, path) {
    /// <summary>Gets the descendant element under root that corresponds to the specified path and namespace URI.</summary>
    /// <param name="root">DOM element node from which to get the descendant element.</param>
    /// <param name="namespaceURI" type="String">The namespace URI of the element to match.</param>
    /// <param name="path" type="String">Path to the desired descendant element.</param>
    /// <returns>The element specified by path and namespace URI.</returns>
    /// <remarks>
    ///     All the elements in the path are matched against namespaceURI.
    ///     The function will stop searching on the first element that doesn't match the namespace and the path.
    /// </remarks>

    var parts = path.split("/");
    var i, len;
    for (i = 0, len = parts.length; i < len; i++) {
        root = root && xmlFirstChildElement(root, namespaceURI, parts[i]);
    }
    return root || null;
};

var xmlFindNodeByPath = function (root, namespaceURI, path) {
    /// <summary>Gets the DOM element or DOM attribute node under root that corresponds to the specified path and namespace URI.</summary>
    /// <param name="root">DOM element node from which to get the descendant node.</param>
    /// <param name="namespaceURI" type="String">The namespace URI of the node to match.</param>
    /// <param name="path" type="String">Path to the desired descendant node.</param>
    /// <returns>The node specified by path and namespace URI.</returns>
    /// <remarks>
    ///     This function will traverse the path and match each node associated to a path segement against the namespace URI.
    ///     The traversal stops when the whole path has been exahusted or a node that doesn't belogong the specified namespace is encountered.
    ///
    ///     The last segment of the path may be decorated with a starting @ character to indicate that the desired node is a DOM attribute.
    /// </remarks>

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
};

var xmlFirstChildElement = function (domNode, namespaceURI, localName) {
    /// <summary>Returns the first child DOM element under the specified DOM node that matches the specified namespace URI and local name.</summary>
    /// <param name="domNode">DOM node from which the child DOM element is going to be retrieved.</param>
    /// <param name="namespaceURI" type="String" optional="true">The namespace URI of the element to match.</param>
    /// <param name="localName" type="String" optional="true">Name of the element to match.</param>
    /// <returns>The node's first child DOM element that matches the specified namespace URI and local name; null otherwise.</returns>

    return xmlFirstElementMaybeRecursive(domNode, namespaceURI, localName, /*recursive*/false);
};

var xmlFirstDescendantElement = function (domNode, namespaceURI, localName) {
    /// <summary>Returns the first descendant DOM element under the specified DOM node that matches the specified namespace URI and local name.</summary>
    /// <param name="domNode">DOM node from which the descendant DOM element is going to be retrieved.</param>
    /// <param name="namespaceURI" type="String" optional="true">The namespace URI of the element to match.</param>
    /// <param name="localName" type="String" optional="true">Name of the element to match.</param>
    /// <returns>The node's first descendant DOM element that matches the specified namespace URI and local name; null otherwise.</returns>

    if (domNode.getElementsByTagNameNS) {
        var result = domNode.getElementsByTagNameNS(namespaceURI, localName);
        return result.length > 0 ? result[0] : null;
    }
    return xmlFirstElementMaybeRecursive(domNode, namespaceURI, localName, /*recursive*/true);
};

var xmlFirstElementMaybeRecursive = function (domNode, namespaceURI, localName, recursive) {
    /// <summary>Returns the first descendant DOM element under the specified DOM node that matches the specified namespace URI and local name.</summary>
    /// <param name="domNode">DOM node from which the descendant DOM element is going to be retrieved.</param>
    /// <param name="namespaceURI" type="String" optional="true">The namespace URI of the element to match.</param>
    /// <param name="localName" type="String" optional="true">Name of the element to match.</param>
    /// <param name="recursive" type="Boolean">
    ///     True if the search should include all the descendants of the DOM node.
    ///     False if the search should be scoped only to the direct children of the DOM node.
    /// </param>
    /// <returns>The node's first descendant DOM element that matches the specified namespace URI and local name; null otherwise.</returns>

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
};

var xmlInnerText = function (xmlElement) {
    /// <summary>Gets the concatenated value of all immediate child text and CDATA nodes for the specified element.</summary>
    /// <param name="domElement">Element to get values for.</param>
    /// <returns type="String">Text for all direct children.</returns>

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
};

var xmlLocalName = function (domNode) {
    /// <summary>Returns the localName of a XML node.</summary>
    /// <param name="domNode">DOM node to get the value from.</param>
    /// <returns type="String">localName of domNode.</returns>

    return domNode.localName || domNode.baseName;
};

var xmlNamespaceURI = function (domNode) {
    /// <summary>Returns the namespace URI of a XML node.</summary>
    /// <param name="node">DOM node to get the value from.</param>
    /// <returns type="String">Namespace URI of domNode.</returns>

    return domNode.namespaceURI || null;
};

var xmlNodeValue = function (domNode) {
    /// <summary>Returns the value or the inner text of a XML node.</summary>
    /// <param name="node">DOM node to get the value from.</param>
    /// <returns>Value of the domNode or the inner text if domNode represents a DOM element node.</returns>
    
    if (domNode.nodeType === 1) {
        return xmlInnerText(domNode);
    }
    return domNode.nodeValue;
};

var xmlTraverse = function (domNode, recursive, onChildCallback) {
    /// <summary>Walks through the descendants of the domNode and invokes a callback for each node.</summary>
    /// <param name="domNode">DOM node whose descendants are going to be traversed.</param>
    /// <param name="recursive" type="Boolean">
    ///    True if the traversal should include all the descenants of the DOM node.
    ///    False if the traversal should be scoped only to the direct children of the DOM node.
    /// </param>
    /// <returns type="String">Namespace URI of node.</returns>

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
};

var xmlSiblingElement = function (domNode, namespaceURI, localName) {
    /// <summary>Returns the next sibling DOM element of the specified DOM node.</summary>
    /// <param name="domNode">DOM node from which the next sibling is going to be retrieved.</param>
    /// <param name="namespaceURI" type="String" optional="true">The namespace URI of the element to match.</param>
    /// <param name="localName" type="String" optional="true">Name of the element to match.</param>
    /// <returns>The node's next sibling DOM element, null if there is none.</returns>

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
};

var xmlDom = function () {
    /// <summary>Creates a new empty DOM document node.</summary>
    /// <returns>New DOM document node.</returns>
    /// <remarks>
    ///    This function will first try to create a native DOM document using
    ///    the browsers createDocument function.  If the browser doesn't
    ///    support this but supports ActiveXObject, then an attempt to create
    ///    an MSXML 6.0 DOM will be made. If this attempt fails too, then an attempt
    ///    for creating an MXSML 3.0 DOM will be made.  If this last attemp fails or
    ///    the browser doesn't support ActiveXObject then an exception will be thrown.
    /// </remarks>

    var implementation = window.document.implementation;
    return (implementation && implementation.createDocument) ?
       implementation.createDocument(null, null, null) :
       msXmlDom();
};

var xmlAppendChildren = function (parent, children) {
    /// <summary>Appends a collection of child nodes or string values to a parent DOM node.</summary>
    /// <param name="parent">DOM node to which the children will be appended.</param>
    /// <param name="children" type="Array">Array containing DOM nodes or string values that will be appended to the parent.</param>
    /// <returns>The parent with the appended children or string values.</returns>
    /// <remarks>
    ///    If a value in the children collection is a string, then a new DOM text node is going to be created
    ///    for it and then appended to the parent.
    /// </remarks>

    if (!isArray(children)) {
        return xmlAppendChild(parent, children);
    }

    var i, len;
    for (i = 0, len = children.length; i < len; i++) {
        children[i] && xmlAppendChild(parent, children[i]);
    }
    return parent;
};

var xmlAppendChild = function (parent, child) {
    /// <summary>Appends a child node or a string value to a parent DOM node.</summary>
    /// <param name="parent">DOM node to which the child will be appended.</param>
    /// <param name="child">Child DOM node or string value to append to the parent.</param>
    /// <returns>The parent with the appended child or string value.</returns>
    /// <remarks>
    ///    If child is a string value, then a new DOM text node is going to be created
    ///    for it and then appended to the parent.
    /// </remarks>

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
};

var xmlNewAttribute = function (dom, namespaceURI, qualifiedName, value) {
    /// <summary>Creates a new DOM attribute node.</summary>
    /// <param name="dom">DOM document used to create the attribute.</param>
    /// <param name="prefix" type="String">Namespace prefix.</param>
    /// <param name="namespaceURI" type="String">Namespace URI.</param>
    /// <returns>DOM attribute node for the namespace declaration.</returns>

    var attribute =
        dom.createAttributeNS && dom.createAttributeNS(namespaceURI, qualifiedName) ||
        dom.createNode(2, qualifiedName, namespaceURI || undefined);

    attribute.value = value || "";
    return attribute;
};

var xmlNewElement = function (dom, nampespaceURI, qualifiedName, children) {
    /// <summary>Creates a new DOM element node.</summary>
    /// <param name="dom">DOM document used to create the DOM element.</param>
    /// <param name="namespaceURI" type="String">Namespace URI of the new DOM element.</param>
    /// <param name="qualifiedName" type="String">Qualified name in the form of "prefix:name" of the new DOM element.</param>
    /// <param name="children" type="Array" optional="true">
    ///     Collection of child DOM nodes or string values that are going to be appended to the new DOM element.
    /// </param>
    /// <returns>New DOM element.</returns>
    /// <remarks>
    ///    If a value in the children collection is a string, then a new DOM text node is going to be created
    ///    for it and then appended to the new DOM element.
    /// </remarks>

    var element =
        dom.createElementNS && dom.createElementNS(nampespaceURI, qualifiedName) ||
        dom.createNode(1, qualifiedName, nampespaceURI || undefined);

    return xmlAppendChildren(element, children || []);
};

var xmlNewNSDeclaration = function (dom, namespaceURI, prefix) {
    /// <summary>Creates a namespace declaration attribute.</summary>
    /// <param name="dom">DOM document used to create the attribute.</param>
    /// <param name="namespaceURI" type="String">Namespace URI.</param>
    /// <param name="prefix" type="String">Namespace prefix.</param>
    /// <returns>DOM attribute node for the namespace declaration.</returns>

    return xmlNewAttribute(dom, xmlnsNS, xmlQualifiedName("xmlns", prefix), namespaceURI);
};

var xmlNewFragment = function (dom, text) {
    /// <summary>Creates a new DOM document fragment node for the specified xml text.</summary>
    /// <param name="dom">DOM document from which the fragment node is going to be created.</param>
    /// <param name="text" type="String" mayBeNull="false">XML text to be represented by the XmlFragment.</param>
    /// <returns>New DOM document fragment object.</returns>

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
};

var xmlNewText = function (dom, text) {
    /// <summary>Creates new DOM text node.</summary>
    /// <param name="dom">DOM document used to create the text node.</param>
    /// <param name="text" type="String">Text value for the DOM text node.</param>
    /// <returns>DOM text node.</returns>

    return dom.createTextNode(text);
};

var xmlNewNodeByPath = function (dom, root, namespaceURI, prefix, path) {
    /// <summary>Creates a new DOM element or DOM attribute node as specified by path and appends it to the DOM tree pointed by root.</summary>
    /// <param name="dom">DOM document used to create the new node.</param>
    /// <param name="root">DOM element node used as root of the subtree on which the new nodes are going to be created.</param>
    /// <param name="namespaceURI" type="String">Namespace URI of the new DOM element or attribute.</param>
    /// <param name="namespacePrefix" type="String">Prefix used to qualify the name of the new DOM element or attribute.</param>
    /// <param name="Path" type="String">Path string describing the location of the new DOM element or attribute from the root element.</param>
    /// <returns>DOM element or attribute node for the last segment of the path.</returns>
    /// <remarks>
    ///     This function will traverse the path and will create a new DOM element with the specified namespace URI and prefix
    ///     for each segment that doesn't have a matching element under root.
    ///
    ///     The last segment of the path may be decorated with a starting @ character. In this case a new DOM attribute node
    ///     will be created.
    /// </remarks>

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
};

var xmlSerialize = function (domNode) {
    /// <summary>
    /// Returns the text representation of the document to which the specified node belongs.
    /// </summary>
    /// <param name="root">Wrapped element in the document to serialize.</param>
    /// <returns type="String">Serialized document.</returns>

    var xmlSerializer = window.XMLSerializer;
    if (xmlSerializer) {
        var serializer = new xmlSerializer();
        return serializer.serializeToString(domNode);
    }

    if (domNode.xml) {
        return domNode.xml;
    }

    throw { message: "XML serialization unsupported" };
};

var xmlSerializeDescendants = function (domNode) {
    /// <summary>Returns the XML representation of the all the descendants of the node.</summary>
    /// <param name="domNode" optional="false" mayBeNull="false">Node to serialize.</param>
    /// <returns type="String">The XML representation of all the descendants of the node.</returns>

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
};

var xmlSerializeNode = function (domNode) {
    /// <summary>Returns the XML representation of the node and all its descendants.</summary>
    /// <param name="domNode" optional="false" mayBeNull="false">Node to serialize.</param>
    /// <returns type="String">The XML representation of the node and all its descendants.</returns>

    var xml = domNode.xml;
    if (xml !== undefined) {
        return xml;
    }

    if (window.XMLSerializer) {
        var serializer = new window.XMLSerializer();
        return serializer.serializeToString(domNode);
    }

    throw { message: "XML serialization unsupported" };
};

// DATAJS INTERNAL START
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
// DATAJS INTERNAL END
