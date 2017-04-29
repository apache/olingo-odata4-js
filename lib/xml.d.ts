/** @module odatajs/xml */

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
export function xmlBaseURI(domNode: any, baseURI?: any): string;
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
export function xmlFirstChildElement(domNode: any, namespaceURI?: string, localName?: string): any;
/** Returns the first descendant DOM element under the specified DOM node that matches the specified namespace URI and local name.
 * @param domNode - DOM node from which the descendant DOM element is going to be retrieved.
 * @param {String} [namespaceURI] - The namespace URI of the node to match.
 * @param {String} [localName] - Local name of the attribute.
 * @return The node's first descendant DOM element that matches the specified namespace URI and local name; null otherwise.
*/
export function xmlFirstDescendantElement(domNode: any, namespaceURI?: string, localName?: string): any;
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
export function xmlNewElement(dom: any, namespaceURI: string, qualifiedName: string, children?: any[]): any;
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
 * @param {String} [namespaceURI] - The namespace URI of the node to match.
 * @param {String} [localName] - Local name of the attribute.
 * @return The node's next sibling DOM element, null if there is none.
 */
export function xmlSiblingElement(domNode: any, namespaceURI?: string, localName?: string): any;
