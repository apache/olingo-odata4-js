/** @module odata/metadata */

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
