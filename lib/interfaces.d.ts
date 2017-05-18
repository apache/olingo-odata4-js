export namespace Batch {
    export interface BatchRequest {
        __batchRequests: ChangeRequestSet[];
    }

    export interface ChangeRequestSet {
        __changeRequests: ChangeRequest[];
    }

    export interface ChangeRequest {
        headers: { [name: string]: string; };
        requestUri: string;
        method: string;
        data?: any;
    }

    export interface BatchResponse {
        __batchResponses: ChangeResponseSet[];
    }

    export interface ChangeResponseSet {
        __changeResponses: (ChangeResponse | FailedResponse)[];
    }

    export interface ChangeResponse {
        [x: string]: any;
        statusCode: string;
        statusText: string;
        headers: { [name: string]: string; };
        body: string;
        data?: any;
    }

    export interface FailedResponse {
        message: string;
        response: ChangeResponse;
    }
}

export namespace Edm {

    export interface Action extends Base.NamedExpression, Base.Annotatable {
        isBound?: string; /*boolean;*/
        entitySetPath?: string;
        returnType?: ReturnType;
        parameter?: Parameter[];
    }

    export interface ActionImport extends Base.NamedExpression, Base.Annotatable {
        action: string;
        entitySet?: string;
    }

    export interface And extends Base.ASingleExpression, Base.Annotatable { }

    export interface Annotation extends Base.ASingleExpression, Base.Annotatable {
        term: string;
        qualifier?: string;
    }

    export interface Annotations extends Base.Annotatable {
        target: string;
        qualifier?: string;
    }

    export interface Apply extends Base.AMultiExpression, Base.Annotatable {
        function: string;
    }

    export interface Cast extends Base.ASingleExpression, Base.Annotatable {
        type: string;
    }

    export interface Collection extends Base.AMultiExpression { }

    export interface ComplexType extends Base.NamedExpression, Base.Annotatable {
        baseType?: string;
        abstract?: string; /*boolean;*/
        openType?: string; /*boolean;*/
        property?: Property[];
        navigationProperty?: NavigationProperty[];
    }

    export interface EntityContainer extends Base.NamedExpression, Base.Annotatable {
        extends?: string;
        entitySet: EntitySet[];
        singleton?: Singleton[];
        actionImport?: ActionImport[];
        functionImport?: FunctionImport[];
        associationSet?: EdmExtra.Association[];
    }

    export interface EntitySet extends Base.NamedExpression, Base.Annotatable {
        entityType: string;
        includeInServiceDocument?: string; /*boolean;*/
        navigationPropertyBinding?: NavigationPropertyBinding[];
    }

    export interface EntityType extends Base.NamedExpression, Base.Annotatable {
        baseType?: string;
        abstract?: string; /*boolean;*/
        openType?: string; /*boolean;*/
        hasStream?: string; /*boolean;*/
        key?: Key;
        property?: Property[];
        navigationProperty?: NavigationProperty[];
    }

    export interface EnumType extends Base.NamedExpression, Base.Annotatable {
        underlyingType?: "Edm.Byte" | "Edm.SByte" | "Edm.Int16" | "Edm.Int32" | "Edm.Int64";
        isFlags?: string; /*boolean;*/
        member: Member[];
    }

    export interface Eq extends Base.ASingleExpression, Base.Annotatable { }

    export interface Function extends Base.NamedExpression, Base.Annotatable {
        isBound?: string; /*boolean;*/
        isComposable?: string; /*boolean;*/
        entitySetPath?: string;
        returnType?: ReturnType;
        parameter?: Parameter[];
    }

    export interface FunctionImport extends Base.NamedExpression, Base.Annotatable {
        function: string;
        entitySet?: string;
        includeInServiceDocument?: string; /*boolean;*/
    }

    export interface Ge extends Base.ASingleExpression, Base.Annotatable { }

    export interface Gt extends Base.ASingleExpression, Base.Annotatable { }

    export interface If extends Base.AMultiExpression, Base.Annotatable { }

    export interface IsOf extends Base.ASingleExpression, Base.Annotatable {
        type: string;

        maxLength?: string; /*number;*/
        precision?: string; /*number;*/
        scale?: string; /*number | "variable";*/
        SRID?: string; /*number | "variable";*/
    }

    export interface Key {
        propertyRef: PropertyRef[];
    }

    export interface LabeledElement extends Base.ASingleExpression, Base.NamedExpression, Base.Annotatable { }

    export interface Le extends Base.ASingleExpression, Base.Annotatable { }

    export interface Lt extends Base.ASingleExpression, Base.Annotatable { }

    export interface Member extends Base.NamedExpression, Base.Annotatable {
        value?: string; /*number;*/
    }

    export interface NavigationProperty extends Base.NamedExpression, Base.Annotatable {
        type: string;
        partner?: string;
        containsTarget?: string; /*boolean;*/
        referentialConstraint?: ReferentialConstraint[];
        onDelete?: OnDelete;
        relationship?: string;
        fromRole?: string;
        toRole?: string;
    }

    export interface NavigationPropertyBinding {
        path: string;
        target: string;
    }

    export interface Ne extends Base.ASingleExpression, Base.Annotatable { }

    export interface Not extends Base.ASingleExpression, Base.Annotatable { }

    export interface Null extends Base.Annotatable { }

    export interface OnDelete extends Base.Annotatable {
        action: "Cascade" | "None" | "SetNull" | "SetDefault";
    }

    export interface Or extends Base.ASingleExpression, Base.Annotatable { }

    export interface Parameter extends Base.NamedExpression, Base.Annotatable {
        type: string;
        nullable?: string; /*boolean;*/
        maxLength?: string; /*number;*/
        precision?: string; /*number;*/
        scale?: string; /*number | "variable";*/
        SRID?: string; /*number | "variable";*/
    }

    export interface Property extends Base.NamedExpression, Base.Annotatable {
        type: string;
        nullable?: string; /*boolean;*/
        maxLength?: string; /*number;*/
        precision?: string; /*number;*/
        scale?: string; /*number | "variable";*/
        unicode?: string; /*boolean;*/
        SRID?: string; /*number | "variable";*/
        defaultValue?: any;
    }

    export interface PropertyRef extends Base.NamedExpression {
        alias?: string;
    }

    export interface PropertyValue extends Base.ASingleExpression, Base.Annotatable {
        property: string;
    }

    export interface Record extends Base.Annotatable {
        propertyValue?: PropertyValue[];
    }

    export interface ReferentialConstraint extends Base.Annotatable {
        property: string;
        referencedProperty: string;
    }

    export interface ReturnType extends Base.Annotatable {
        type: string;
        nullable?: string; /*boolean;*/
        maxLength?: string; /*number;*/
        precision?: string; /*number;*/
        scale?: string; /*number | "variable";*/
        SRID?: string; /*number | "variable";*/
    }

    export interface Schema extends Base.Annotatable {
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
    }

    export interface Singleton extends Base.NamedExpression, Base.Annotatable {
        type: string;
        navigationPropertyBinding?: NavigationPropertyBinding[];
    }

    export interface Term extends Base.NamedExpression, Base.Annotatable {
        type: string;
        baseTerm?: string;
        appliesTo?: string;
        nullable?: string; /*boolean;*/
        maxLength?: string; /*number;*/
        precision?: string; /*number;*/
        scale?: string; /*number | "variable";*/
        SRID?: string; /*number | "variable";*/
        defaultValue?: any;
    }

    export interface TypeDefinition extends Base.NamedExpression, Base.Annotatable {
        underlyingType: string;
        maxLength?: string; /*number;*/
        precision?: string; /*number;*/
        scale?: string; /*number | "variable";*/
        unicode?: string; /*boolean;*/
        SRID?: string; /*number | "variable";*/
    }

    export interface UrlRef extends Base.ASingleExpression, Base.Annotatable { }

    export namespace Base {

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

        export interface Annotatable {
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

        export interface NamedExpression {
            name: string;
        }

        export interface Text {
            text: string;
        }

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

    export interface Reference extends Edm.Base.Annotatable {
        uri: string;
        include?: Include[];
        includeAnnotations?: IncludeAnnotations[];
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