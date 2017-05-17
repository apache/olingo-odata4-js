export namespace Edm {
    export interface Action {
        name: string;
        isBound?: string; /*boolean;*/
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

    export interface Annotation extends ASingleExpression {
        term: string;
        qualifier?: string;

        annotation?: Annotation[];
    }

    export interface Annotations {
        target: string;
        qualifier?: string;

        annotation: Annotation[];
    }

    export interface Apply extends AMultiExpression {
        function: string;

        annotation: Annotation[];
    }

    export interface Cast extends ASingleExpression {
        type: string;

        annotation?: Annotation[];
    }

    export interface Collection extends AMultiExpression { }

    export interface ComplexType {
        name: string;
        baseType?: string;
        abstract?: string; /*boolean;*/
        openType?: string; /*boolean;*/
        property?: Property[];
        navigationProperty?: NavigationProperty[];

        annotation?: Annotation[];
    }

    export interface EntityContainer {
        name: string;
        extends?: string;
        entitySet: EntitySet[];
        singleton?: Singleton[];
        actionImport?: ActionImport[];
        functionImport?: FunctionImport[];
        associationSet?: EdmExtra.Association[];

        annotation?: Annotation[];
    }

    export interface EntitySet {
        name: string;
        entityType: string;
        includeInServiceDocument?: string; /*boolean;*/
        navigationPropertyBinding?: NavigationPropertyBinding[];

        annotation?: Annotation[];
    }

    export interface EntityType {
        name: string;
        baseType?: string;
        abstract?: string; /*boolean;*/
        openType?: string; /*boolean;*/
        hasStream?: string; /*boolean;*/
        key?: Key;
        property?: Property[];
        navigationProperty?: NavigationProperty[];

        annotation?: Annotation[];
    }

    export interface EnumType {
        name: string;
        underlyingType?: "Edm.Byte" | "Edm.SByte" | "Edm.Int16" | "Edm.Int32" | "Edm.Int64";
        isFlags?: string; /*boolean;*/
        member: Member[];

        annotation?: Annotation[];
    }

    export interface Function {
        name: string;
        isBound?: string; /*boolean;*/
        isComposable?: string; /*boolean;*/
        entitySetPath?: string;
        returnType?: ReturnType;
        parameter?: Parameter[];

        annotation?: Annotation[];
    }

    export interface FunctionImport {
        name: string;
        function: string;
        entitySet?: string;
        includeInServiceDocument?: string; /*boolean;*/

        annotation?: Annotation[];
    }

    export interface If extends AMultiExpression {
        annotation?: Annotation[];
    }

    export interface IsOf extends ASingleExpression {
        type: string;

        maxLength?: string; /*number;*/
        precision?: string; /*number;*/
        scale?: string; /*number | "variable";*/
        SRID?: string; /*number | "variable";*/

        annotation?: Annotation[];
    }

    export interface LabeledElement extends ASingleExpression {
        name: string;

        annotation?: Annotation[];
    }

    export interface Key {
        propertyRef: PropertyRef[];
    }

    export interface Member {
        name: string;
        value?: string; /*number;*/

        annotation?: Annotation[];
    }

    export interface NavigationProperty extends BaseProperty {
        partner?: string;
        containsTarget?: string; /*boolean;*/
        referentialConstraint?: ReferentialConstraint[];
        onDelete?: OnDelete;
        relationship?: string;
        fromRole?: string;
        toRole?: string;

        annotation?: Annotation[];
    }

    export interface NavigationPropertyBinding {
        path: string;
        target: string;
    }

    export interface Null {
        annotation?: Annotation[];
    }

    export interface OnDelete {
        action: "Cascade" | "None" | "SetNull" | "SetDefault";

        annotation?: Annotation[];
    }

    export interface Parameter {
        name: string;
        type: string;
        nullable?: string; /*boolean;*/
        maxLength?: string; /*number;*/
        precision?: string; /*number;*/
        scale?: string; /*number | "variable";*/
        SRID?: string; /*number | "variable";*/

        annotation?: Annotation[];
    }

    export interface Property extends BaseProperty {
        nullable?: string; /*boolean;*/
        maxLength?: string; /*number;*/
        precision?: string; /*number;*/
        scale?: string; /*number | "variable";*/
        unicode?: string; /*boolean;*/
        SRID?: string; /*number | "variable";*/
        defaultValue?: any;

        annotation?: Annotation[];
    }

    export interface PropertyRef {
        name: string;
        alias?: string;
    }

    export interface PropertyValue extends ASingleExpression {
        property: string;

        annotation?: Annotation[];
    }

    export interface Record {
        propertyValue?: PropertyValue[];

        annotation?: Annotation[];
    }

    export interface ReferentialConstraint {
        property: string;
        referencedProperty: string;

        annotation?: Annotation[];
    }

    export interface ReturnType {
        type: string;
        nullable?: string; /*boolean;*/
        maxLength?: string; /*number;*/
        precision?: string; /*number;*/
        scale?: string; /*number | "variable";*/
        SRID?: string; /*number | "variable";*/

        annotation?: Annotation[];
    }

    export interface Schema {
        namespace: string;
        alias?: string;
        action?: Action[];
        annotations?: Annotations[];
        complexType?: ComplexType[];
        entityContainer: EntityContainer;
        entityType?: EntityType[];
        enumType?: EnumType[];
        function?: Function[];
        term?: Term[];
        typeDefinition?: TypeDefinition[];
        association?: EdmExtra.Association[];

        annotation?: Annotation[];
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
        nullable?: string; /*boolean;*/
        maxLength?: string; /*number;*/
        precision?: string; /*number;*/
        scale?: string; /*number | "variable";*/
        SRID?: string; /*number | "variable";*/
        defaultValue?: any;

        annotation?: Annotation[];
    }

    export interface TypeDefinition {
        name: string;
        underlyingType: string;
        maxLength?: string; /*number;*/
        precision?: string; /*number;*/
        scale?: string; /*number | "variable";*/
        unicode?: string; /*boolean;*/
        srid?: string; /*number | "variable";*/

        annotation?: Annotation[];
    }

    export interface UrlRef extends ASingleExpression {
        annotation?: Annotation[];
    }

    export interface And extends ASingleExpression {
        annotation?: Annotation[];
    }
    export interface Or extends ASingleExpression {
        annotation?: Annotation[];
    }
    export interface Not extends ASingleExpression {
        annotation?: Annotation[];
    }
    export interface Eq extends ASingleExpression {
        annotation?: Annotation[];
    }
    export interface Ne extends ASingleExpression {
        annotation?: Annotation[];
    }
    export interface Gt extends ASingleExpression {
        annotation?: Annotation[];
    }
    export interface Ge extends ASingleExpression {
        annotation?: Annotation[];
    }
    export interface Lt extends ASingleExpression {
        annotation?: Annotation[];
    }
    export interface Le extends ASingleExpression {
        annotation?: Annotation[];
    }

    export interface ASingleExpression {
        binary?: string | Text;
        bool?: string | Text; /*boolean;*/
        date?: string | Text;
        dateTimeOffset?: string | Text; /*Date;*/
        decimal?: string | Text; /*number;*/
        duration?: string | Text;
        enumMember?: string | Text;
        float?: string | Text; /*number;*/
        guid?: string | Text;
        int?: string | Text; /*number;*/
        string?: string | Text;
        timeOfDay?: string | Text;
        annotationPath?: string | Text;
        navigationPropertyPath?: string | Text;
        path?: string | Text;
        propertyPath?: string | Text;
        urlRef?: string | UrlRef;

        and?: And;
        or?: Or;
        not?: Not;
        eq?: Eq;
        ne?: Ne;
        gt?: Gt;
        ge?: Ge;
        lt?: Lt;
        le?: Le;

        apply?: Apply;
        cast?: Cast;
        collection?: Collection;
        if?: If;
        isOf?: IsOf;
        labeledElement?: LabeledElement;
        labeledElementReference?: Text;
        null?: Null;
        record?: Record;
    }

    export interface AMultiExpression {
        binary?: Text[];
        bool?: Text[];
        date?: Text[];
        dateTimeOffset?: Text[];
        decimal?: Text[];
        duration?: Text[];
        enumMember?: Text[];
        float?: Text[];
        guid?: Text[];
        int?: Text[];
        string?: Text[];
        timeOfDay?: Text[];
        annotationPath?: Text[];
        navigationPropertyPath?: Text[];
        path?: Text[];
        propertyPath?: Text[];
        urlRef?: UrlRef[];

        and?: And[];
        or?: Or[];
        not?: Not[];
        eq?: Eq[];
        ne?: Ne[];
        gt?: Gt[];
        ge?: Ge[];
        lt?: Lt[];
        le?: Le[];

        apply?: Apply[];
        cast?: Cast[];
        collection?: Collection[];
        if?: If[];
        isOf?: IsOf[];
        labeledElement?: LabeledElement[];
        labeledElementReference?: Text[];
        null?: Null[];
        record?: Record[];
    }

    export interface BaseProperty {
        name: string;
        type: string;
    }

    export interface Text {
        text: string;
    }
}

export namespace Edmx {
    export interface DataServices {
        schema: Edm.Schema[];
    }

    export interface Edmx {
        version: string;
        reference?: Reference;
        dataServices: DataServices;
    }

    export interface Reference {
        uri: string;
        include?: Include[];
        includeAnnotations?: IncludeAnnotations[];

        annotation?: Edm.Annotation[];
    }

    export interface Include {
        namespace: string;
        alias?: string;
    }

    export interface IncludeAnnotations {
        termNamespace: string;
        qualifier?: string;
        targetNamespace?: string;
    }
}

export namespace EdmExtra {
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

    export interface ConstraintMember {
        propertyRef: Edm.PropertyRef[];
        role: string;
    }
}