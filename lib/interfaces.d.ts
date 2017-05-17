export interface Action {
    name: string;
    isBound?: boolean;
    entitySetPath?: string;
    returnType?: ReturnType;
    parameter?: Parameter[];
    annotation?: Annotation[];
}

export interface ActionImport {
    name: string;
    action: string;
    entitySet?: string;
    annotation?: Annotation[];
}

export interface Annotation {
    term: string;
    qualifier?: string;
    annotation?: Annotation[];
}

export interface Annotations {
    target: string;
    qualifier?: string;
    annotation: Annotation[];
}

export interface Association {
    association: string;
    end: AssociationEndpoint[];
    name: string;
    referentialConstraint: AssociationConstraint;
}

export interface AssociationConstraint {
    dependent: ConstraintMember;
    principal: ConstraintMember;
}

export interface AssociationEndpoint {
    entitySet: string;
    multiplicity: string;
    role: string;
    type: string;
}

export interface ComplexType {
    name: string;
    baseType?: string;
    abstract?: boolean;
    openType?: boolean;
    property?: Property[];
    navigationProperty?: NavigationProperty[];
    annotation?: Annotation[];
}

export interface ConstraintMember {
    propertyRef: PropertyRef[];
    role: string;
}

export interface EntityContainer {
    name: string;
    extends?: string;
    entitySet: EntitySet[];
    singleton?: Singleton[];
    actionImport?: ActionImport[];
    functionImport?: FunctionImport[];
    associationSet?: Association[];
    annotation?: Annotation[];
}

export interface EntitySet {
    name: string;
    entityType: string;
    includeInServiceDocument?: boolean;
    navigationPropertyBinding?: NavigationPropertyBinding[];
    annotation?: Annotation[];
}

export interface EntityType {
    name: string;
    baseType?: string;
    abstract?: boolean;
    openType?: boolean;
    hasStream?: boolean;
    key?: Key;
    property?: Property[];
    navigationProperty?: NavigationProperty[];
    annotation?: Annotation[];
}

export interface EnumType {
    name: string;
    underlyingType?: "Edm.Byte" | "Edm.SByte" | "Edm.Int16" | "Edm.Int32" | "Edm.Int64";
    isFlags?: boolean;
    member: Member[];
    annotation?: Annotation[];
}

export interface Function {
    name: string;
    isBound?: boolean;
    isComposable?: boolean;
    entitySetPath?: string;
    returnType?: ReturnType;
    parameter?: Parameter[];
    annotation?: Annotation[];
}

export interface FunctionImport {
    name: string;
    function: string;
    entitySet?: string;
    includeInServiceDocument?: boolean;
    annotation?: Annotation[];
}

export interface Key {
    propertyRef: PropertyRef[];
}

export interface Member {
    name: string;
    value?: number;
    annotation?: Annotation[];
}

export interface NavigationProperty {
    name: string;
    type: string;
    partner?: string;
    containsTarget?: boolean;
    referentialConstraint?: ReferentialConstraint[];
    onDelete?: "Cascade" | "None" | "SetNull" | "SetDefault";
    relationship?: string;
    fromRole?: string;
    toRole?: string;
    annotation?: Annotation[];
}

export interface NavigationPropertyBinding {
    path: string;
    target: string;
}

export interface Parameter {
    name: string;
    type: string;
    nullable?: boolean;
    maxLength?: number;
    precision?: number;
    scale?: number | "variable";
    srid?: number | "variable";
    annotation?: Annotation[];
}

export interface Property {
    name: string;
    type: string;
    nullable?: boolean;
    maxLength?: number;
    precision?: number;
    scale?: number | "variable";
    unicode?: boolean;
    srid?: number | "variable";
    defaultValue?: any;
    annotation?: Annotation[];
}

export interface PropertyRef {
    name: string;
    alias?: string;
}

export interface ReferentialConstraint {
    property: string;
    referencedProperty: string;
    annotation?: Annotation[];
}

export interface ReturnType {
    type: string;
    nullable?: boolean;
    maxLength?: number;
    precision?: number;
    scale?: number | "variable";
    srid?: number | "variable";
    annotation?: Annotation[];
}

export interface Schema {
    namespace: string;
    alias?: string;
    action?: Action[];
    annotations?: Annotations[];
    annotation?: Annotation[];
    complexType?: ComplexType[];
    entityContainer: EntityContainer;
    entityType?: EntityType[];
    enumType?: EnumType[];
    function?: Function[];
    term?: Term[];
    typeDefinition?: TypeDefinition[];
    association?: Association[];
}

export interface Singleton {
    name: string;
    type: string;
    navigationPropertyBinding?: NavigationPropertyBinding[];    
    annotation?: Annotation[];
}

export interface Term {
    name: string;
    type: string;
    baseTerm?: string;
    appliesTo?: string;
    nullable?: boolean;
    maxLength?: number;
    precision?: number;
    scale?: number | "variable";
    srid?: number | "variable";
    defaultValue?: any;
    annotation?: Annotation[];
}

export interface TypeDefinition {
    name: string;
    underlyingType: string;
    maxLength?: number;
    precision?: number;
    scale?: number | "variable";
    unicode?: boolean;
    srid?: number | "variable";
    annotation?: Annotation[];
}