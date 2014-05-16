/// <reference path="../src/odata-utils.js" />
/// <reference path="../src/odata-handler.js" />
/// <reference path="../src/odata-atom.js" />
/// <reference path="../src/odata-xml.js" />
/// <reference path="common/djstest.js" />

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

// odata-atom-tests.js

(function (window, undefined) {

    module("Unit");

    var parseMetadataHelper = function (text) {
        var response = { statusCode: 200, body: text, headers: { "Content-Type": "application/xml"} };
        OData.metadataHandler.read(response, {});
        return response.data;
    };

    var resetFoodData = function () {
        $.ajax({ url: "./endpoints/FoodStoreDataServiceV4.svc/ResetData", async: false, type: "POST" });
    };

    var customerSampleMetadataText = '' +
    '<edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx">\r\n' +
    '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0">\r\n' +
    '<Schema Namespace="Ns" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns="http://schemas.microsoft.com/ado/2006/04/edm">\r\n' +
    '    <EntityType Name="Customer">\r\n' +
    '    <Key><PropertyRef Name="ID" /></Key>\r\n' +
    '     <Property Name="ID" Type="Edm.Int32" Nullable="false" />\r\n' +
    '     <Property Name="Name" Type="Edm.String" Nullable="true" m:FC_TargetPath="SyndicationSummary" m:FC_ContentKind="xhtml" m:FC_KeepInContent="false" />\r\n' +
    '     <Property Name="LastName" Type="Edm.String" Nullable="true" m:FC_TargetPath="foo/bar/@baz" m:FC_NsUri="htp://prefix" m:FC_NsPrefix="prefix" m:FC_KeepInContent="false" />\r\n' +
    '     <Property Name="FavoriteNumber" Type="Edm.Int32" Nullable="true" m:FC_TargetPath="favorite/number" m:FC_NsUri="htp://prefix" m:FC_NsPrefix="prefix" m:FC_KeepInContent="false" />\r\n' +
    '     <Property Name="Address" Type="Ns.Address" Nullable="false" \r\n' +
    '       m:FC_TargetPath="foo/bar/@city" m:FC_NsUri="htp://prefix" m:FC_NsPrefix="prefix" m:FC_SourcePath="City" m:FC_KeepInContent="false" \r\n' +
    '       m:FC_TargetPath_1="foo/bar" m:FC_NsUri_1="htp://prefix" m:FC_NsPrefix_1="prefix" m:FC_SourcePath_1="Street" m:FC_KeepInContent_1="false" />\r\n' +
    '    </EntityType>\r\n' +
    '    <ComplexType Name="Address">\r\n' +
    '     <Property Name="Street" Type="Edm.String" Nullable="true" />\r\n' +
    '     <Property Name="City" Type="Edm.String" Nullable="true" />\r\n' +
    '    </ComplexType>\r\n' +
    '    <EntityContainer Name="SampleContext" m:IsDefaultEntityContainer="true">\r\n' +
    '     <EntitySet Name="Customers" EntityType="Ns.Customer" />\r\n' +
    '    </EntityContainer>\r\n' +
    '</Schema>\r\n' +
    '</edmx:DataServices></edmx:Edmx>';

    var foodServiceV4FoodsSampleText = '' +
    '<feed xml:base="http://localhost:46541/tests/endpoints/FoodStoreDataServiceV4.svc/" xmlns="http://www.w3.org/2005/Atom" xmlns:d="http://docs.oasis-open.org/odata/ns/data" xmlns:m="http://docs.oasis-open.org/odata/ns/metadata" xmlns:georss="http://www.georss.org/georss" xmlns:gml="http://www.opengis.net/gml" m:context="http://localhost:46541/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods">' +
	'<id>http://localhost:46541/tests/endpoints/FoodStoreDataServiceV4.svc/Foods</id>' +
	'<title type="text">Foods</title>' +
	'<updated>2013-12-30T05:45:07Z</updated>' +
	'<link rel="self" title="Foods" href="Foods" />' +
	'<entry>' +
	'	<id>http://localhost:46541/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)</id>' +
	'	<category term="#DataJS.Tests.V4.Food" scheme="http://docs.oasis-open.org/odata/ns/scheme" />' +
	'	<link rel="edit" title="Food" href="Foods(0)" />' +
	'	<link rel="http://docs.oasis-open.org/odata/ns/related/Category" type="application/atom+xml;type=entry" title="Category" href="Foods(0)/Category" />' +
	'	<title />' +
	'	<updated>2013-12-30T05:45:07Z</updated>' +
	'	<author>' +
	'		<name />' +
	'	</author>' +
	'	<link rel="http://docs.oasis-open.org/odata/ns/mediaresource/Picture" type="image/png" title="Picture" href="http://localhost:46541/tests/endpoints/FoodStoreDataServiceV4.svc/Picture" />' +
	'	<link rel="http://docs.oasis-open.org/odata/ns/edit-media/Picture" type="image/png" title="Picture" href="Foods(0)/Picture" m:etag="W/&quot;123456789&quot;" />' +
	'	<content type="application/xml">' +
	'		<m:properties>' +
	'			<d:FoodID m:type="Int32">0</d:FoodID>' +
	'			<d:Name>flour</d:Name>' +
	'			<d:UnitPrice m:type="Double">0.19999</d:UnitPrice>' +
	'			<d:ServingSize m:type="Decimal">1</d:ServingSize>' +
	'			<d:MeasurementUnit>Cup</d:MeasurementUnit>' +
	'			<d:ProteinGrams m:type="Byte">3</d:ProteinGrams>' +
	'			<d:FatGrams m:type="Int16">1</d:FatGrams>' +
	'			<d:CarbohydrateGrams m:type="Int32">20</d:CarbohydrateGrams>' +
	'			<d:CaloriesPerServing m:type="Int64">140</d:CaloriesPerServing>' +
	'			<d:IsAvailable m:type="Boolean">true</d:IsAvailable>' +
	'			<d:ExpirationDate m:type="DateTimeOffset">2010-12-25T12:00:00Z</d:ExpirationDate>' +
	'			<d:ItemGUID m:type="Guid">27272727-2727-2727-2727-272727272727</d:ItemGUID>' +
	'			<d:Weight m:type="Single">10</d:Weight>' +
	'			<d:AvailableUnits m:type="SByte">1</d:AvailableUnits>' +
	'			<d:Packaging m:type="#DataJS.Tests.V4.Package">' +
	'				<d:Type m:null="true" />' +
	'				<d:Color></d:Color>' +
	'				<d:NumberPerPackage m:type="Int32">2147483647</d:NumberPerPackage>' +
	'				<d:RequiresRefridgeration m:type="Boolean">false</d:RequiresRefridgeration>' +
	'				<d:ShipDate m:type="DateTimeOffset">2000-12-29T00:00:00Z</d:ShipDate>' +
	'				<d:PackageDimensions m:type="#DataJS.Tests.V4.Dimensions">' +
	'					<d:Length m:type="Decimal">79228162514264337593543950335</d:Length>' +
	'					<d:Height m:type="Int16">32767</d:Height>' +
	'					<d:Width m:type="Int64">9223372036854775807</d:Width>' +
	'					<d:Volume m:type="Double">1.7976931348623157E+308</d:Volume>' +
	'				</d:PackageDimensions>' +
	'			</d:Packaging>' +
	'			<d:CookedSize m:type="#DataJS.Tests.V4.CookedDimensions">' +
	'				<d:Length m:type="Decimal">2</d:Length>' +
	'				<d:Height m:type="Int16">1</d:Height>' +
	'				<d:Width m:type="Int64">3</d:Width>' +
	'				<d:Volume m:type="Double">6</d:Volume>' +
	'			</d:CookedSize>' +
	'			<d:AlternativeNames m:type="#Collection(String)">' +
	'				<m:element>ground cereal</m:element>' +
	'				<m:element>ground grain</m:element>' +
	'			</d:AlternativeNames>' +
	'			<d:Providers m:type="#Collection(DataJS.Tests.V4.Provider)">' +
	'				<m:element>' +
	'					<d:Name>Flour Provider</d:Name>' +
	'					<d:Aliases m:type="#Collection(String)">' +
	'						<m:element>fp1</m:element>' +
	'						<m:element>flour provider1</m:element>' +
	'					</d:Aliases>' +
	'					<d:Details m:type="#DataJS.Tests.V4.ProviderDetails">' +
	'						<d:Telephone>555-555-555</d:Telephone>' +
	'						<d:PreferredCode m:type="Int32">1001</d:PreferredCode>' +
	'					</d:Details>' +
	'				</m:element>' +
	'				<m:element>' +
	'					<d:Name>Ground Grains</d:Name>' +
	'					<d:Aliases m:type="#Collection(String)" />' +
	'					<d:Details m:null="true" />' +
	'				</m:element>' +
	'			</d:Providers>' +
	'			<d:SpatialData m:type="GeometryCollection">' +
	'				<gml:MultiGeometry gml:srsName="http://www.opengis.net/def/crs/EPSG/0/4326">' +
	'					<gml:geometryMembers>' +
	'						<gml:Point>' +
	'							<gml:pos>5 5</gml:pos>' +
	'						</gml:Point>' +
	'					</gml:geometryMembers>' +
	'				</gml:MultiGeometry>' +
	'			</d:SpatialData>' +
	'		</m:properties>' +
	'	</content>' +
	'</entry>' +
	'<entry>' +
	'	<id>http://localhost:46541/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(1)</id>' +
	'	<category term="#DataJS.Tests.V4.Food" scheme="http://docs.oasis-open.org/odata/ns/scheme" />' +
	'	<link rel="edit" title="Food" href="Foods(1)" />' +
	'	<link rel="http://docs.oasis-open.org/odata/ns/related/Category" type="application/atom+xml;type=entry" title="Category" href="Foods(1)/Category" />' +
	'	<title />' +
	'	<updated>2013-12-30T05:45:07Z</updated>' +
	'	<author>' +
	'		<name />' +
	'	</author>' +
	'	<link rel="http://docs.oasis-open.org/odata/ns/mediaresource/Picture" type="image/png" title="Picture" href="http://localhost:46541/tests/endpoints/FoodStoreDataServiceV4.svc/Picture" />' +
	'	<link rel="http://docs.oasis-open.org/odata/ns/edit-media/Picture" type="image/png" title="Picture" href="Foods(1)/Picture" m:etag="W/&quot;123456789&quot;" />' +
	'	<content type="application/xml">' +
	'		<m:properties>' +
	'			<d:FoodID m:type="Int32">1</d:FoodID>' +
	'			<d:Name>sugar</d:Name>' +
	'			<d:UnitPrice m:type="Double">0.2</d:UnitPrice>' +
	'			<d:ServingSize m:type="Decimal">1</d:ServingSize>' +
	'			<d:MeasurementUnit>tsp</d:MeasurementUnit>' +
	'			<d:ProteinGrams m:type="Byte">0</d:ProteinGrams>' +
	'			<d:FatGrams m:type="Int16">0</d:FatGrams>' +
	'			<d:CarbohydrateGrams m:type="Int32">4</d:CarbohydrateGrams>' +
	'			<d:CaloriesPerServing m:type="Int64">16</d:CaloriesPerServing>' +
	'			<d:IsAvailable m:type="Boolean">false</d:IsAvailable>' +
	'			<d:ExpirationDate m:type="DateTimeOffset">2011-12-28T00:00:00Z</d:ExpirationDate>' +
	'			<d:ItemGUID m:type="Guid">ffffffff-ffff-ffff-ffff-ffffffffffff</d:ItemGUID>' +
	'			<d:Weight m:type="Single">0.1</d:Weight>' +
	'			<d:AvailableUnits m:type="SByte">0</d:AvailableUnits>' +
	'			<d:Packaging m:type="#DataJS.Tests.V4.Package">' +
	'				<d:Type xml:space="preserve"> </d:Type>' +
	'				<d:Color>BLUE</d:Color>' +
	'				<d:NumberPerPackage m:type="Int32">-2147483648</d:NumberPerPackage>' +
	'				<d:RequiresRefridgeration m:type="Boolean">true</d:RequiresRefridgeration>' +
	'				<d:ShipDate m:type="DateTimeOffset">2000-12-29T00:00:00Z</d:ShipDate>' +
	'				<d:PackageDimensions m:type="#DataJS.Tests.V4.Dimensions">' +
	'					<d:Length m:type="Decimal">-79228162514264337593543950335</d:Length>' +
	'					<d:Height m:type="Int16">-32768</d:Height>' +
	'					<d:Width m:type="Int64">-9223372036854775808</d:Width>' +
	'					<d:Volume m:type="Double">-1.7976931348623157E+308</d:Volume>' +
	'				</d:PackageDimensions>' +
	'			</d:Packaging>' +
	'			<d:CookedSize m:null="true" />' +
	'			<d:AlternativeNames m:type="#Collection(String)" />' +
	'			<d:Providers m:type="#Collection(DataJS.Tests.V4.Provider)" />' +
	'			<d:SpatialData m:null="true" />' +
	'		</m:properties>' +
	'	</content>' +
	'</entry>' +
    '</feed>';

    var foodServiceV4MetadataText = '' +
    '<?xml version="1.0" encoding="utf-8"?>\r\n' +
    '<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">\r\n' +
	'<edmx:DataServices>\r\n' +
	'	<Schema Namespace="DataJS.Tests.V4" xmlns="http://docs.oasis-open.org/odata/ns/edm">\r\n' +
	'		<EntityType Name="Category">\r\n' +
	'			<Key>\r\n' +
	'				<PropertyRef Name="CategoryID" />\r\n' +
	'			</Key>\r\n' +
	'			<Property Name="Icon" Type="Edm.Stream" Nullable="false" />\r\n' +
	'			<Property Name="CategoryID" Type="Edm.Int32" Nullable="false" />\r\n' +
	'			<Property Name="Name" Type="Edm.String" />\r\n' +
	'			<NavigationProperty Name="Foods" Type="Collection(DataJS.Tests.V4.Food)" Partner="Category" />\r\n' +
	'		</EntityType>\r\n' +
	'		<EntityType Name="Food">\r\n' +
	'			<Key>\r\n' +
	'				<PropertyRef Name="FoodID" />\r\n' +
	'			</Key>\r\n' +
	'			<Property Name="Picture" Type="Edm.Stream" Nullable="false" />\r\n' +
	'			<Property Name="FoodID" Type="Edm.Int32" Nullable="false" />\r\n' +
	'			<Property Name="Name" Type="Edm.String" />\r\n' +
	'			<Property Name="UnitPrice" Type="Edm.Double" Nullable="false" />\r\n' +
	'			<Property Name="ServingSize" Type="Edm.Decimal" Nullable="false" />\r\n' +
	'			<Property Name="MeasurementUnit" Type="Edm.String" />\r\n' +
	'			<Property Name="ProteinGrams" Type="Edm.Byte" Nullable="false" />\r\n' +
	'			<Property Name="FatGrams" Type="Edm.Int16" Nullable="false" />\r\n' +
	'			<Property Name="CarbohydrateGrams" Type="Edm.Int32" Nullable="false" />\r\n' +
	'			<Property Name="CaloriesPerServing" Type="Edm.Int64" Nullable="false" />\r\n' +
	'			<Property Name="IsAvailable" Type="Edm.Boolean" Nullable="false" />\r\n' +
	'			<Property Name="ExpirationDate" Type="Edm.DateTimeOffset" Nullable="false" />\r\n' +
	'			<Property Name="ItemGUID" Type="Edm.Guid" Nullable="false" />\r\n' +
	'			<Property Name="Weight" Type="Edm.Single" Nullable="false" />\r\n' +
	'			<Property Name="AvailableUnits" Type="Edm.SByte" Nullable="false" />\r\n' +
	'			<Property Name="Packaging" Type="DataJS.Tests.V4.Package" />\r\n' +
	'			<Property Name="CookedSize" Type="DataJS.Tests.V4.CookedDimensions" />\r\n' +
	'			<Property Name="AlternativeNames" Type="Collection(Edm.String)" Nullable="false" />\r\n' +
	'			<Property Name="Providers" Type="Collection(DataJS.Tests.V4.Provider)" Nullable="false" />\r\n' +
	'			<Property Name="SpatialData" Type="Edm.GeometryCollection" SRID="Variable" />\r\n' +
	'			<NavigationProperty Name="Category" Type="DataJS.Tests.V4.Category" Partner="Foods" />\r\n' +
	'		</EntityType>\r\n' +
	'		<EntityType Name="PreparedFood" BaseType="DataJS.Tests.V4.Food">\r\n' +
	'			<Property Name="Instructions" Type="Edm.String" />\r\n' +
	'			<Property Name="NumberOfIngredients" Type="Edm.Single" Nullable="false" />\r\n' +
	'		</EntityType>\r\n' +
	'		<ComplexType Name="Package">\r\n' +
	'			<Property Name="Type" Type="Edm.String" />\r\n' +
	'			<Property Name="Color" Type="Edm.String" />\r\n' +
	'			<Property Name="NumberPerPackage" Type="Edm.Int32" Nullable="false" />\r\n' +
	'			<Property Name="RequiresRefridgeration" Type="Edm.Boolean" Nullable="false" />\r\n' +
	'			<Property Name="ShipDate" Type="Edm.DateTimeOffset" Nullable="false" />\r\n' +
	'			<Property Name="PackageDimensions" Type="DataJS.Tests.V4.Dimensions" />\r\n' +
	'		</ComplexType>\r\n' +
	'		<ComplexType Name="Dimensions">\r\n' +
	'			<Property Name="Length" Type="Edm.Decimal" Nullable="false" />\r\n' +
	'			<Property Name="Height" Type="Edm.Int16" Nullable="false" />\r\n' +
	'			<Property Name="Width" Type="Edm.Int64" Nullable="false" />\r\n' +
	'			<Property Name="Volume" Type="Edm.Double" Nullable="false" />\r\n' +
	'		</ComplexType>\r\n' +
	'		<ComplexType Name="CookedDimensions">\r\n' +
	'			<Property Name="Length" Type="Edm.Decimal" Nullable="false" />\r\n' +
	'			<Property Name="Height" Type="Edm.Int16" Nullable="false" />\r\n' +
	'			<Property Name="Width" Type="Edm.Int64" Nullable="false" />\r\n' +
	'			<Property Name="Volume" Type="Edm.Double" Nullable="false" />\r\n' +
	'		</ComplexType>\r\n' +
	'		<ComplexType Name="Provider">\r\n' +
	'			<Property Name="Name" Type="Edm.String" />\r\n' +
	'			<Property Name="Aliases" Type="Collection(Edm.String)" Nullable="false" />\r\n' +
	'			<Property Name="Details" Type="DataJS.Tests.V4.ProviderDetails" />\r\n' +
	'		</ComplexType>\r\n' +
	'		<ComplexType Name="ProviderDetails">\r\n' +
	'			<Property Name="Telephone" Type="Edm.String" />\r\n' +
	'			<Property Name="PreferredCode" Type="Edm.Int32" Nullable="false" />\r\n' +
	'		</ComplexType>\r\n' +
	'		<Action Name="ResetData">\r\n' +
	'			<ReturnType Type="Edm.String" />\r\n' +
	'		</Action>\r\n' +
	'		<Function Name="FoodsAvailable" IsComposable="true">\r\n' +
	'			<ReturnType Type="Collection(Edm.String)" />\r\n' +
	'		</Function>\r\n' +
	'		<Function Name="PackagingTypes" IsComposable="true">\r\n' +
	'			<ReturnType Type="Collection(DataJS.Tests.V4.Package)" />\r\n' +
	'		</Function>\r\n' +
	'		<Function Name="UserNameAndPassword">\r\n' +
	'			<ReturnType Type="Edm.String" />\r\n' +
	'		</Function>\r\n' +
	'		<EntityContainer Name="FoodContainer">\r\n' +
	'			<EntitySet Name="Categories" EntityType="DataJS.Tests.V4.Category">\r\n' +
	'				<NavigationPropertyBinding Path="Foods" Target="Foods" />\r\n' +
	'			</EntitySet>\r\n' +
	'			<EntitySet Name="Foods" EntityType="DataJS.Tests.V4.Food">\r\n' +
	'				<NavigationPropertyBinding Path="Category" Target="Categories" />\r\n' +
	'			</EntitySet>\r\n' +
	'			<ActionImport Name="ResetData" Action="DataJS.Tests.V4.ResetData" />\r\n' +
	'			<FunctionImport Name="FoodsAvailable" Function="DataJS.Tests.V4.FoodsAvailable" IncludeInServiceDocument="true" />\r\n' +
	'			<FunctionImport Name="PackagingTypes" Function="DataJS.Tests.V4.PackagingTypes" IncludeInServiceDocument="true" />\r\n' +
	'			<FunctionImport Name="UserNameAndPassword" Function="DataJS.Tests.V4.UserNameAndPassword" IncludeInServiceDocument="true" />\r\n' +
	'		</EntityContainer>\r\n' +
	'	</Schema>\r\n' +
	'</edmx:DataServices>\r\n' +
    '</edmx:Edmx>';

    djstest.addFullTest(true, function applyEntryCustomizationToEntryTest() {
        var metadata = parseMetadataHelper(customerSampleMetadataText);
        var data = { __metadata: { type: "Ns.Customer" }, Name: "Name", LastName: "Last Name", Address: { Street: "Street Value", City: "City Value" }, FavoriteNumber: 123 };
        var request = { data: data, headers: { "Content-Type": "application/atom+xml"} };
        OData.atomHandler.write(request, { metadata: metadata });

        djstest.assert(request.body !== null, "request.body !== null");
        djstest.assert(request.body.indexOf("<a:summary type=\"xhtml\">Name</a:summary>") !== -1, 'request.body.indexOf("<a:summary>Name</a:summary>") !== -1');
        djstest.assert(request.body.indexOf('baz="Last Name"') !== -1, 'request.body.indexOf(baz="Last Name") !== -1');
        djstest.assert(request.body.indexOf('city="City Value"') !== -1, 'request.body.indexOf(city="City Value") !== -1');
        djstest.assert(request.body.indexOf('<prefix:foo ') !== -1, "request.body.indexOf('<prefix:foo ') !== -1");
        djstest.assert(request.body.indexOf('term="Ns.Customer"') !== -1, "request.body.indexOf(term='Ns.Customer') !== -1");
        djstest.assert(request.body.indexOf('>123</') !== -1, "request.body.indexOf(>123</) !== -1");

        // Try with other mapping types.
        metadata.dataServices.schema[0].entityType[0].property[1].FC_ContentKind = "html";
        request.body = undefined;
        OData.atomHandler.write(request, { metadata: metadata });
        djstest.assert(request.body.indexOf("<a:summary type=\"html\">Name</a:summary>") !== -1, 'request.body.indexOf("<a:summary type="html">Name</a:summary>") !== -1');

        // Try with a null value now.
        request.data.FavoriteNumber = null;
        request.body = null;
        OData.atomHandler.write(request, { metadata: metadata });
        djstest.assert(request.body.indexOf('>123</') === -1, "request.body.indexOf(>123</) === -1");
        djstest.assert(request.body.indexOf('m:null="true"') !== -1, "request.body.indexOf(m:null=true) !== -1");

        // Try with a null complex type now.
        request.data.FavoriteNumber = 123;
        request.data.Address = null;
        request.body = null;
        OData.atomHandler.write(request, { metadata: metadata });
        djstest.assert(request.body.indexOf('Street') === -1, "request.body.indexOf(Street) === -1");
        djstest.assert(request.body.indexOf('m:null="true"') !== -1, "request.body.indexOf(m:null=true) !== -1");

        djstest.done();
    });

    djstest.addFullTest(true, function testParsePrimitivePropertiesBasic() {
        var feed = "\
        <entry xml:base=\'http://services.odata.org/OData/OData.svc/\' \r\n\
               xmlns:d=\'http://schemas.microsoft.com/ado/2007/08/dataservices\' \r\n\
               xmlns:m=\'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\' \r\n\
               xmlns:atom=\'http://www.w3.org/2005/Atom\' \r\n\
               xmlns:app=\'http://www.w3.org/2007/app\' \r\n\
               xmlns=\'http://www.w3.org/2005/Atom\'>\r\n\
           <id>http://services.odata.org/OData/OData.svc/the id</id> \r\n \
           <content type='application/xml'>\r\n \
            <m:properties xmlns=\'http://schemas.microsoft.com/ado/2007/08/dataservices\'>\r\n \
             <Boolean m:type='Edm.Boolean'>true</Boolean>\r\n \
             <Binary m:type='Edm.Binary'>01007A8A680D9E14A64EAC1242DD33C9DB05</Binary>\r\n \
             <Byte m:type='Edm.Byte'>8</Byte>\r\n \
             <DateTime m:type='Edm.DateTime'>2010-11-01T15:13:25</DateTime>\r\n \
             <Decimal m:type='Edm.Decimal'>100.10</Decimal>\r\n \
             <Guid m:type='Edm.Guid'>12345678-aaaa-bbbb-cccc-ddddeeeeffff</Guid>\r\n \
             <!-- <Time m:type='Edm.Time'>P05DT12H30M05.125S</Time> --> \r\n \
             <DateTimeOffset m:type='Edm.DateTimeOffset'>2010-11-01T15:13:25+10:00</DateTimeOffset>\r\n \
             <Double m:type='Edm.Double'>1E+10</Double>\r\n \
             <Single m:type='Edm.Single'>100.01</Single>\r\n \
             <Int16 m:type='Edm.Int16'>16</Int16>\r\n \
             <Int32 m:type='Edm.Int32'>32</Int32>\r\n \
             <Int64 m:type='Edm.Int64'>64</Int64>\r\n \
             <SByte m:type='Edm.SByte'>-8</SByte>\r\n \
            </m:properties>\r\n \
           </content>\r\n \
        </entry>\r\n";

        var response = { body: feed, headers: { "Content-Type": "application/atom+xml"} };
        OData.atomHandler.read(response, {});

        djstest.assertsExpected(1);
        ODataReadOracle.readEntryLoopback(feed, function (expectedData) {
            djstest.assertAreEqualDeep(response.data, expectedData, "Verify deserialized data");
            djstest.done();
        });
    });

    djstest.addFullTest(true, function deserializeCustomizationsNullAndXhtmlTest() {
        var payload = "<entry " +
        ' xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" \r\n' +
        " xmlns:m='http://schemas.microsoft.com/ado/2007/08/dataservices/metadata' \r\n" +
        " xmlns=\"http://www.w3.org/2005/Atom\">\r\n" +
        " <id>http://localhost/tests/endpoints/FoodDataService.svc/Foods(1)</id> " +
        " <author><name>Customer #1</name></author>" +
        " <summary><b>Name</b></summary>" +
        " <category term='Ns.Customer' scheme='http://schemas.microsoft.com/ado/2007/08/dataservices/scheme' /> " +
        " <content type='application/xml'><m:properties><d:ID m:type='Edm.Int32'>1</d:ID>" +
        " <d:LastName m:null='true' /></m:properties></content>" +
        "</entry>";
        var metadata = parseMetadataHelper(customerSampleMetadataText);
        var response = { body: payload, headers: { "Content-Type": "application/atom+xml"} };
        OData.atomHandler.read(response, { metadata: metadata });

        djstest.assertAreEqual(response.data.LastName, null, "last name is null");
        djstest.assertAreEqual(response.data.Name, "<b xmlns=\"http://www.w3.org/2005/Atom\">Name</b>", "name includes tags");

        djstest.done();
    });

    djstest.addFullTest(true, function parseCustomizationSampleTest() {
        var payload = foodServiceV4FoodsSampleText;
        var metadata = parseMetadataHelper(foodServiceV4MetadataText);
        var response = { body: payload, headers: { "Content-Type": "application/atom+xml"} };
        OData.atomHandler.read(response, { metadata: metadata });

        djstest.assert(response.data !== null, "response.data !== null");
        djstest.assert(response.data.results !== null, "response.data.results !== null");

        var r = response.data.results;
        djstest.assertAreEqual(r[0].__metadata.type, "DataJS.Tests.V4.Food", "r[0].__metadata.type");
        djstest.assertAreEqual(r[0].Name, "flour", "r[0].Name");
        djstest.assertAreEqual(r[0].UnitPrice, 0.19999, "r[0].UnitPrice");
        djstest.assertAreEqual(r[0].ServingSize, 1, "r[0].ServingSize");

        // CONSIDER: we intended to have complex type have their type annotation out-of-band, but JSON has it in-line; do we want to normalize this out everywhere?
        // djstest.assertAreEqual(r[0].Packaging.__metadata.type, "DataJS.Tests.PackageV4", "r[0].Packaging.__metadata.type");
        djstest.assertAreEqual(r[0].Packaging.Type, null, "package type for flour is null");
        djstest.assertAreEqual(r[0].Packaging.PackageDimensions.Height, 32767, "r[0].Packaging.PackageDimensions.Height");

        djstest.assertAreEqual(r[0].CookedSize.Length, 2, "r[0].CookedSize.Length");
        djstest.assertAreEqual(r[0].CookedSize.Volume, 6, "r[0].CookedSize.Volume");

        djstest.done();
    });

    djstest.addFullTest(true, function parseIntoPropertiesTest() {
        var payload = '' +
    '<entry xml:base="http://localhost:46541/tests/endpoints/FoodStoreDataServiceV4.svc/" xmlns="http://www.w3.org/2005/Atom" xmlns:d="http://docs.oasis-open.org/odata/ns/data" xmlns:m="http://docs.oasis-open.org/odata/ns/metadata" xmlns:georss="http://www.georss.org/georss" xmlns:gml="http://www.opengis.net/gml" m:context="http://localhost:46541/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods/$entity">' +
	'<id>http://localhost:46541/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)</id>' +
	'<category term="#DataJS.Tests.V4.Food" scheme="http://docs.oasis-open.org/odata/ns/scheme" />' +
	'<link rel="edit" title="Food" href="Foods(0)" />' +
	'<link rel="http://docs.oasis-open.org/odata/ns/related/Category" type="application/atom+xml;type=entry" title="Category" href="Foods(0)/Category" />' +
	'<title />' +
	'<updated>2013-12-30T06:01:30Z</updated>' +
	'<author>' +
	'	<name />' +
	'</author>' +
	'<link rel="http://docs.oasis-open.org/odata/ns/mediaresource/Picture" type="image/png" title="Picture" href="http://localhost:46541/tests/endpoints/FoodStoreDataServiceV4.svc/Picture" />' +
	'<link rel="http://docs.oasis-open.org/odata/ns/edit-media/Picture" type="image/png" title="Picture" href="Foods(0)/Picture" m:etag="W/&quot;123456789&quot;" />' +
	'<content type="application/xml">' +
	'	<m:properties>' +
	'		<d:FoodID m:type="Int32">0</d:FoodID>' +
	'		<d:Name>flour</d:Name>' +
	'		<d:UnitPrice m:type="Double">0.19999</d:UnitPrice>' +
	'		<d:ServingSize m:type="Decimal">1</d:ServingSize>' +
	'		<d:MeasurementUnit>Cup</d:MeasurementUnit>' +
	'		<d:ProteinGrams m:type="Byte">3</d:ProteinGrams>' +
	'		<d:FatGrams m:type="Int16">1</d:FatGrams>' +
	'		<d:CarbohydrateGrams m:type="Int32">20</d:CarbohydrateGrams>' +
	'		<d:CaloriesPerServing m:type="Int64">140</d:CaloriesPerServing>' +
	'		<d:IsAvailable m:type="Boolean">true</d:IsAvailable>' +
	'		<d:ExpirationDate m:type="DateTimeOffset">2010-12-25T12:00:00Z</d:ExpirationDate>' +
	'		<d:ItemGUID m:type="Guid">27272727-2727-2727-2727-272727272727</d:ItemGUID>' +
	'		<d:Weight m:type="Single">10</d:Weight>' +
	'		<d:AvailableUnits m:type="SByte">1</d:AvailableUnits>' +
	'		<d:Packaging m:type="#DataJS.Tests.V4.Package">' +
	'			<d:Type m:null="true" />' +
	'			<d:Color></d:Color>' +
	'			<d:NumberPerPackage m:type="Int32">2147483647</d:NumberPerPackage>' +
	'			<d:RequiresRefridgeration m:type="Boolean">false</d:RequiresRefridgeration>' +
	'			<d:ShipDate m:type="DateTimeOffset">2000-12-29T00:00:00Z</d:ShipDate>' +
	'			<d:PackageDimensions m:type="#DataJS.Tests.V4.Dimensions">' +
	'				<d:Length m:type="Decimal">79228162514264337593543950335</d:Length>' +
	'				<d:Height m:type="Int16">32767</d:Height>' +
	'				<d:Width m:type="Int64">9223372036854775807</d:Width>' +
	'				<d:Volume m:type="Double">1.7976931348623157E+308</d:Volume>' +
	'			</d:PackageDimensions' +
	'		</d:Packaging>' +
	'		<d:CookedSize m:type="#DataJS.Tests.V4.CookedDimensions">' +
	'			<d:Length m:type="Decimal">2</d:Length>' +
	'			<d:Height m:type="Int16">1</d:Height>' +
	'			<d:Width m:type="Int64">3</d:Width>' +
	'			<d:Volume m:type="Double">6</d:Volume>' +
	'		</d:CookedSize>' +
	'		<d:AlternativeNames m:type="#Collection(String)">' +
	'			<m:element>ground cereal</m:element>' +
	'			<m:element>ground grain</m:element>' +
	'		</d:AlternativeNames>' +
	'		<d:Providers m:type="#Collection(DataJS.Tests.V4.Provider)">' +
	'			<m:element>' +
	'				<d:Name>Flour Provider</d:Name>' +
	'				<d:Aliases m:type="#Collection(String)">' +
	'					<m:element>fp1</m:element>' +
	'					<m:element>flour provider1</m:element>' +
	'				</d:Aliases' +
	'				<d:Details m:type="#DataJS.Tests.V4.ProviderDetails">' +
	'					<d:Telephone>555-555-555</d:Telephone>' +
	'					<d:PreferredCode m:type="Int32">1001</d:PreferredCode>' +
	'				</d:Details>' +
	'			</m:element>' +
	'			<m:element>' +
	'				<d:Name>Ground Grains</d:Name>' +
	'				<d:Aliases m:type="#Collection(String)" />' +
	'				<d:Details m:null="true" />' +
	'			</m:element>' +
	'		</d:Providers>' +
	'		<d:SpatialData m:type="GeometryCollection">' +
	'			<gml:MultiGeometry gml:srsName="http://www.opengis.net/def/crs/EPSG/0/4326">' +
	'				<gml:geometryMembers>' +
	'					<gml:Point>' +
	'						<gml:pos>5 5</gml:pos>' +
	'					</gml:Point>' +
	'				</gml:geometryMembers>' +
	'			</gml:MultiGeometry>' +
	'		</d:SpatialData>' +
	'	</m:properties>' +
	'</content>' +
    '</entry>';

        var metadata = parseMetadataHelper(foodServiceV4MetadataText);
        var response = { body: payload, headers: { "Content-Type": "application/atom+xml"} };
        OData.atomHandler.read(response, { metadata: metadata });

        djstest.assert(response.data !== null, "response.data !== null");
        djstest.assertAreEqual(response.data.__metadata.type, "DataJS.Tests.V4.Food", "types match");
        djstest.assertAreEqual(response.data.UnitPrice, 0.19999, "Price is as expected");
        djstest.assertAreEqual(response.data.__metadata.properties.UnitPrice.type, "Edm.Double", "Price was marked as a double");

        djstest.assertAreEqual(response.data.CookedSize.__metadata.properties.Length.type, "Edm.Decimal", "CookedSize.Length was marked as a decimal");

        // When properties are marked on complex type metadata, this assertion will be true as well.
        // djstest.assertAreEqual(response.data.Packaging.__metadata.Type.type, "Edm.String", "Packaging type was marked as a string");

        djstest.done();
    });

    djstest.addFullTest(true, function parseNullInlineTest() {
        // Shorter version of:
        // OData.read("/tests/endpoints/FoodStoreDataService.svc/Foods?$expand=Category&$filter=Category eq null", function(data, response) {

        var body = '' +
    '<feed xml:base="http://localhost:46541/tests/endpoints/FoodStoreDataServiceV4.svc/" xmlns="http://www.w3.org/2005/Atom" xmlns:d="http://docs.oasis-open.org/odata/ns/data" xmlns:m="http://docs.oasis-open.org/odata/ns/metadata" xmlns:georss="http://www.georss.org/georss" xmlns:gml="http://www.opengis.net/gml" m:context="http://localhost:46541/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods">' +
	'<id>http://localhost:46541/tests/endpoints/FoodStoreDataServiceV4.svc/Foods</id>' +
	'<title type="text">Foods</title>' +
	'<updated>2013-12-30T06:09:18Z</updated>' +
	'<link rel="self" title="Foods" href="Foods" />' +
	'<entry>' +
	'	<id>http://localhost:46541/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(2)</id>' +
	'	<category term="#DataJS.Tests.V4.Food" scheme="http://docs.oasis-open.org/odata/ns/scheme" />' +
	'	<link rel="edit" title="Food" href="Foods(2)" />' +
	'	<link rel="http://docs.oasis-open.org/odata/ns/related/Category" type="application/atom+xml;type=entry" title="Category" href="Foods(2)/Category">' +
	'		<m:inline />' +
	'	</link>' +
	'	<title />' +
	'	<updated>2013-12-30T06:09:18Z</updated>' +
	'	<author>' +
	'		<name />' +
	'	</author>' +
	'	<link rel="http://docs.oasis-open.org/odata/ns/mediaresource/Picture" type="image/png" title="Picture" href="http://localhost:46541/tests/endpoints/FoodStoreDataServiceV4.svc/Picture" />' +
	'	<link rel="http://docs.oasis-open.org/odata/ns/edit-media/Picture" type="image/png" title="Picture" href="Foods(2)/Picture" m:etag="W/&quot;123456789&quot;" />' +
	'	<content type="application/xml">' +
	'		<m:properties>' +
	'			<d:FoodID m:type="Int32">2</d:FoodID>' +
	'			<d:Name>1 Chicken Egg</d:Name>' +
	'			<d:UnitPrice m:type="Double">0.55</d:UnitPrice>' +
	'			<d:ServingSize m:type="Decimal">1</d:ServingSize>' +
	'			<d:MeasurementUnit m:null="true" />' +
	'			<d:ProteinGrams m:type="Byte">6</d:ProteinGrams>' +
	'		</m:properties>' +
	'	</content>' +
	'</entry>' +
    '</feed>';
        var response = { body: body, headers: { "Content-Type": "application/atom+xml"} };
        OData.atomHandler.read(response, {});
        var data = response.data;
        var r = data.results[0];
        djstest.assertAreEqual(r.Category, null, "r.Category is null as an empty inline entry");
        djstest.assertAreEqual(r.FoodID, 2, "r.FoodID read correctly");
        djstest.assertAreEqual(r.__metadata.properties.Category.extensions[0].name, "title", "Category title extension parsed");
        djstest.assertAreEqual(r.__metadata.properties.Category.extensions[0].value, "Category", "Category title value parsed");
        djstest.done();
    });

    djstest.addFullTest(true, function serializeEpmTest() {
        var metadata = parseMetadataHelper(foodServiceV4MetadataText);
        var data = { __metadata: { type: "DataJS.Tests.V4.Food" }, FoodID: 123, Name: "name", CookedSize: { Length: 1, Height: 2, Width: 3, Volume: 4} };
        var request = { data: data, headers: { "Content-Type": "application/atom+xml"} };
        OData.atomHandler.write(request, { metadata: metadata });
        djstest.assert(request.body.indexOf("CookedSize") === -1, "CookedSize element is missing from payload");
        djstest.assert(request.body.indexOf("length=") !== -1, "length is available as a mapped attribute");
        djstest.assert(request.body.indexOf("height=") !== -1, "height is available as a mapped attribute");
        djstest.assert(request.body.indexOf("width=") !== -1, "width is available as a mapped attribute");
        djstest.assert(request.body.indexOf("volume>") !== -1, "volume is available as a mapped element");
        djstest.done();
    });

    djstest.addFullTest(true, function writeNullComplexTypeTest() {

        // Verify that the server can be updated to set a complex value to null.
        var foodSetUrl = "./endpoints/FoodStoreDataServiceV4.svc/Foods";
        resetFoodData();

        // Without metadata, this will fail because the server version won't be set to 2.0.
        var metadata = parseMetadataHelper(foodServiceV4MetadataText);
        OData.read(foodSetUrl + "?$top=1", function (data) {
            var item = data.results[0];
            djstest.assert(item.Packaging, "item.Packaging is not null");
            item.Packaging = null;

            // The server will reject links for PUT operations.
            delete item.Category;

            OData.request({ method: "PUT", requestUri: item.__metadata.uri, data: item, headers: { "Content-Type": "application/atom+xml"} }, function (data) {
                // Re-read the item.
                OData.read(item.__metadata.uri, function (data) {
                    djstest.assert(data, "data was read successfully again");
                    djstest.assert(!data.Packaging, "!data.Packaging");
                    resetFoodData();
                    djstest.done();
                }, djstest.failAndDoneCallback("Failed to read back food.", resetFoodData));
            }, djstest.failAndDoneCallback("Failed to write food"), null, null, metadata);
        }, djstest.failAndDoneCallback("Failed to read food"), null, null, metadata);
    });

    djstest.addFullTest(true, function writeNonNullLinkTest() {
        // Verify that the server can be updated to set a link to null.
        resetFoodData();
        var foodSetUrl = "./endpoints/FoodStoreDataServiceV4.svc/Foods";
        var metadata = parseMetadataHelper(foodServiceV4MetadataText);
        OData.read(foodSetUrl + "?$top=1", function (data) {
            var item = data.results[0];

            // Turn this into something different.
            delete item.__metadata.uri;
            item.FoodID = 1001;

            OData.request({ method: "POST", requestUri: foodSetUrl, data: item, headers: { "Content-Type": "application/atom+xml"} }, function (data) {
                // Re-read the item.
                OData.read(data.__metadata.uri + "?$expand=Category", function (data) {
                    djstest.assert(data, "data was read successfully again");
                    djstest.assert(data.Category, "data.Category");
                    djstest.assert(data.Category.Name, "data.Category.Name");
                    resetFoodData();
                    djstest.done();
                }, djstest.failAndDoneCallback("Failed to read back food.", resetFoodData));
            }, djstest.failAndDoneCallback("Failed to add modified food"), null, null, metadata);
        }, djstest.failAndDoneCallback("Failed to read food"), null, null, metadata);
    });

    djstest.addFullTest(true, function writeNullLinkTest() {
        // Verify that the server can be updated to set a link to null.
        resetFoodData();
        var foodSetUrl = "./endpoints/FoodStoreDataServiceV4.svc/Foods";
        var metadata = parseMetadataHelper(foodServiceV4MetadataText);
        OData.read(foodSetUrl + "?$top=1", function (data) {
            var item = data.results[0];

            // Turn this into something different.
            delete item.__metadata.uri;
            item.FoodID = 1001;
            item.Category = null;

            OData.request({ method: "POST", requestUri: foodSetUrl, data: item, headers: { "Content-Type": "application/atom+xml"} }, function (data) {
                // Re-read the item.
                OData.read(data.__metadata.uri + "?$expand=Category", function (data) {
                    djstest.assert(data, "data was read successfully again");
                    djstest.assert(!data.Category, "data.Category");
                    resetFoodData();
                    djstest.done();
                }, djstest.failAndDoneCallback("Failed to read back food.", resetFoodData));
            }, djstest.failAndDoneCallback("Failed to add modified food"), null, null, metadata);
        }, djstest.failAndDoneCallback("Failed to read food"), null, null, metadata);
    });

    // DATAJS INTERNAL START
    djstest.addFullTest(true, function lookupEntityTypeInSchemaTest() {
        var schemaEmpty = {};
        var schemaZero = {
            namespace: "Zero",
            entityType: [
                { name: "Genre" },
                { name: "Language" }
            ]
        };
        var schemaOne = {
            namespace: "One",
            entityType: [
                { name: "Genre1" },
                { name: "Language1" }
            ]
        };
        var edmx = { dataServices: { schema: [schemaEmpty, schemaZero, schemaOne]} };

        var lookupEntityTypeInSchema = function (name, schema) {
            return OData.lookupInMetadata(name, schema, "entityType");
        };

        djstest.assertAreEqual(
        lookupEntityTypeInSchema("Zero.Genre"),
        null, "Expected null for missing metadata");
        djstest.assertAreEqual(
            lookupEntityTypeInSchema("", schemaEmpty),
            null, "Expected null for empty type name");
        djstest.assertAreEqual(
            lookupEntityTypeInSchema("FooWar", schemaEmpty),
            null, "Expected null for mismatched name/namespace");
        djstest.assertAreEqual(
            lookupEntityTypeInSchema("Zero", schemaZero),
            null, "Expected null for unqualified type name");
        djstest.assertAreEqual(
            lookupEntityTypeInSchema("Zero.Something", schemaZero),
            null, "Expected null for mismatched type name");
        djstest.assertAreEqualDeep(
            lookupEntityTypeInSchema("Zero.Genre", schemaZero),
            { name: "Genre" }, "Found type by full name");

        djstest.assertAreEqual(
            lookupEntityTypeInSchema("Zero.Something", edmx),
            null, "Expected null for mismatched type name in edmx");
        djstest.assertAreEqualDeep(
            lookupEntityTypeInSchema("Zero.Genre", edmx),
            { name: "Genre" }, "Found type by full name in edmx");
        djstest.assertAreEqualDeep(
            lookupEntityTypeInSchema("One.Genre1", edmx),
            { name: "Genre1" }, "Found type by full name in edmx");

        djstest.assertAreEqual(
            OData.lookupInMetadata("One.Genre1", edmx, "complexType"),
            null, "Expected null for a complex type lookup of an entity type.");

        djstest.done();
    });

    djstest.addFullTest(true, function testLookupEntityType() {
        var schemaZero = {
            namespace: "Zero",
            entityType: [
                { name: "Genre" },
                { name: "Language" }
            ]
        };
        var schemaOne = {
            namespace: "One",
            entityType: [
                { name: "Genre1" },
                { name: "Language1" }
            ]
        };
        var schemaTwo = {
            namespace: "Two",
            entityType: [
                { name: "Genre2" },
                { name: "Language2" }
            ]
        };
        var edmx = { dataServices: { schema: [schemaZero, schemaOne]} };
        var metadata = [edmx, schemaTwo];

        djstest.assertAreEqual(
            OData.lookupEntityType("Zero.Something", metadata),
            null, "Expected null for mismatched type name in metadata");
        djstest.assertAreEqualDeep(
            OData.lookupEntityType("Zero.Genre", null),
            null, "Expected null for missing metadata");
        djstest.assertAreEqualDeep(
            OData.lookupEntityType(null, metadata),
            null, "Expected null for missing name");
        djstest.assertAreEqualDeep(
            OData.lookupEntityType("Zero.Genre", metadata),
            { name: "Genre" }, "Found type by full name in metadata");
        djstest.assertAreEqualDeep(
            OData.lookupEntityType("One.Genre1", metadata),
            { name: "Genre1" }, "Found type by full name in metadata");
        djstest.assertAreEqualDeep(
            OData.lookupEntityType("One.Genre1", edmx),
            { name: "Genre1" }, "Found type by full name in edmx");
        djstest.assertAreEqualDeep(
            OData.lookupEntityType("Two.Genre2", metadata),
            { name: "Genre2" }, "Found type by full name in metadata");

        djstest.done();
    });

    djstest.addFullTest(true, function testParseSimpleServiceDocument() {
        var serviceDocString = "\
        <service xml:base=\"http://services.odata.org/OData/OData.svc/\" \r\n\
                 xmlns:atom=\"http://www.w3.org/2005/Atom\" \r\n\
                 xmlns:app=\"http://www.w3.org/2007/app\" \r\n\
                 xmlns=\"http://www.w3.org/2007/app\">\r\n\
           <workspace>\r\n\
              <atom:title>Default</atom:title> \r\n\
              <collection href=\"Products\">\r\n\
                <atom:title>Products</atom:title> \r\n\
              </collection>\r\n\
              <collection href=\"Categories\">\r\n\
                <atom:title>Categories</atom:title> \r\n\
              </collection>\r\n\
              <collection href=\"Suppliers\">\r\n\
                <atom:title>Suppliers</atom:title> \r\n\
              </collection>\r\n\
            </workspace>\r\n\
         </service>\r\n";

        var serviceDoc = OData.atomParser(OData.atomHandler, serviceDocString, {});

        djstest.assertAreEqual(serviceDoc.workspaces.length, 1, "Incorrect number of workspaces");

        var workspace = serviceDoc.workspaces[0];
        djstest.assertAreEqual(workspace.title, "Default", "Incorrect service doc title");

        var expectedCollections = [
            { expectedHref: "http://services.odata.org/OData/OData.svc/Products", expectedTitle: "Products" },
            { expectedHref: "http://services.odata.org/OData/OData.svc/Categories", expectedTitle: "Categories" },
            { expectedHref: "http://services.odata.org/OData/OData.svc/Suppliers", expectedTitle: "Suppliers" }
        ];

        djstest.assertAreEqual(workspace.collections.length, expectedCollections.length, "Incorrect number of collections in workspace");

        var i, len;
        for (i = 0, len = expectedCollections.length; i < len; i++) {
            djstest.assertAreEqual(workspace.collections[i].href, expectedCollections[i].expectedHref, "Incorrect href on collection");
            djstest.assertAreEqual(workspace.collections[i].title, expectedCollections[i].expectedTitle, "Incorrect title on collection");
        }

        djstest.done();
    });

    djstest.addFullTest(true, function testServiceDocMustHaveAtLeastOneWorkspaceElement() {
        // Construct a service doc with no workspaces and verify that the parser throws.
        var serviceDocString = "\
        <service xml:base=\"http://services.odata.org/OData/OData.svc/\" \r\n\
                 xmlns:atom=\"http://www.w3.org/2005/Atom\" \r\n\
                 xmlns:app=\"http://www.w3.org/2007/app\" \r\n\
                 xmlns=\"http://www.w3.org/2007/app\">\r\n\
         </service>\r\n";

        djstest.expectException(function () {
            var serviceDoc = OData.atomParser(OData.atomHandler, serviceDocString, {});
        }, "Parsing service doc with no workspaces");

        djstest.done();
    });

    djstest.addFullTest(true, function testServiceDocMayHaveMoreThanOneWorkspaceElement() {
        var serviceDocString = "\
        <service xml:base=\"http://services.odata.org/OData/OData.svc/\" \r\n\
                 xmlns:atom=\"http://www.w3.org/2005/Atom\" \r\n\
                 xmlns:app=\"http://www.w3.org/2007/app\" \r\n\
                 xmlns=\"http://www.w3.org/2007/app\">\r\n\
           <workspace>\r\n\
              <atom:title>Default</atom:title> \r\n\
              <collection href=\"Products\">\r\n\
                <atom:title>Products</atom:title> \r\n\
              </collection>\r\n\
              <collection href=\"Categories\">\r\n\
                <atom:title>Categories</atom:title> \r\n\
              </collection>\r\n\
              <collection href=\"Suppliers\">\r\n\
                <atom:title>Suppliers</atom:title> \r\n\
              </collection>\r\n\
            </workspace>\r\n\
            <workspace>\r\n\
              <atom:title>Second Workspace</atom:title> \r\n\
              <collection href=\"Collection1\">\r\n\
                <atom:title>Collection Number 1</atom:title> \r\n\
              </collection>\r\n\
              <collection href=\"Collection2\">\r\n\
                <atom:title>Collection Number 2</atom:title> \r\n\
              </collection>\r\n\
            </workspace>\r\n\
         </service>\r\n";

        var serviceDoc = OData.atomParser(OData.atomHandler, serviceDocString, {});

        djstest.assertAreEqual(serviceDoc.workspaces.length, 2, "Incorrect number of workspaces");

        var workspace = serviceDoc.workspaces[0];
        djstest.assertAreEqual(workspace.title, "Default", "Incorrect service doc title");

        var expectedCollections;
        expectedCollections = [
            { expectedHref: "http://services.odata.org/OData/OData.svc/Products", expectedTitle: "Products" },
            { expectedHref: "http://services.odata.org/OData/OData.svc/Categories", expectedTitle: "Categories" },
            { expectedHref: "http://services.odata.org/OData/OData.svc/Suppliers", expectedTitle: "Suppliers" }
        ];

        djstest.assertAreEqual(workspace.collections.length, expectedCollections.length, "Incorrect number of collections in workspace");

        var i, len;
        for (i = 0, len = expectedCollections.length; i < len; i++) {
            djstest.assertAreEqual(workspace.collections[i].href, expectedCollections[i].expectedHref, "Incorrect href on collection");
            djstest.assertAreEqual(workspace.collections[i].title, expectedCollections[i].expectedTitle, "Incorrect title on collection");
        }

        workspace = serviceDoc.workspaces[1];
        djstest.assertAreEqual(workspace.title, "Second Workspace", "Incorrect service doc title");

        expectedCollections = [
            { expectedHref: "http://services.odata.org/OData/OData.svc/Collection1", expectedTitle: "Collection Number 1" },
            { expectedHref: "http://services.odata.org/OData/OData.svc/Collection2", expectedTitle: "Collection Number 2" }
        ];

        djstest.assertAreEqual(workspace.collections.length, expectedCollections.length, "Incorrect number of collections in workspace");

        for (i = 0, len = expectedCollections.length; i < len; i++) {
            djstest.assertAreEqual(workspace.collections[i].href, expectedCollections[i].expectedHref, "Incorrect href on collection");
            djstest.assertAreEqual(workspace.collections[i].title, expectedCollections[i].expectedTitle, "Incorrect title on collection");
        }

        djstest.done();
    });

    djstest.addFullTest(true, function testCollectionTitlesAndHrefsMayBeDifferent() {
        var serviceDocString = "\
        <service xml:base=\"http://services.odata.org/OData/OData.svc/\" \r\n\
                 xmlns:atom=\"http://www.w3.org/2005/Atom\" \r\n\
                 xmlns:app=\"http://www.w3.org/2007/app\" \r\n\
                 xmlns=\"http://www.w3.org/2007/app\">\r\n\
           <workspace>\r\n\
              <atom:title>Default</atom:title> \r\n\
              <collection href=\"abc\">\r\n\
                <atom:title>xyz</atom:title> \r\n\
              </collection>\r\n\
              <collection href=\"blah\">\r\n\
                <atom:title>foo</atom:title> \r\n\
              </collection>\r\n\
            </workspace>\r\n\
         </service>\r\n";

        var serviceDoc = OData.atomParser(OData.atomHandler, serviceDocString, {});

        djstest.assertAreEqual(serviceDoc.workspaces.length, 1, "Incorrect number of workspaces");

        var workspace = serviceDoc.workspaces[0];
        djstest.assertAreEqual(workspace.title, "Default", "Incorrect service doc title");

        var expectedCollections = [
            { expectedHref: "http://services.odata.org/OData/OData.svc/abc", expectedTitle: "xyz" },
            { expectedHref: "http://services.odata.org/OData/OData.svc/blah", expectedTitle: "foo" }
        ];

        djstest.assertAreEqual(workspace.collections.length, expectedCollections.length, "Incorrect number of collections in workspace");

        var i, len;
        for (i = 0, len = expectedCollections.length; i < len; i++) {
            djstest.assertAreEqual(workspace.collections[i].href, expectedCollections[i].expectedHref, "Incorrect href on collection");
            djstest.assertAreEqual(workspace.collections[i].title, expectedCollections[i].expectedTitle, "Incorrect title on collection");
        }

        djstest.done();
    });

    djstest.addFullTest(true, function testParserShouldTreatMissingWorkspaceTitleAsBlank() {
        // Per RFC 5023 Section 8.3.2.1, the workspace element MUST have a title but
        // in the interests of being permissive, we should treat this as blank.
        var serviceDocString = "\
        <service xml:base=\"http://services.odata.org/OData/OData.svc/\" \r\n\
                 xmlns:atom=\"http://www.w3.org/2005/Atom\" \r\n\
                 xmlns:app=\"http://www.w3.org/2007/app\" \r\n\
                 xmlns=\"http://www.w3.org/2007/app\">\r\n\
           <workspace>\r\n\
              <!-- No workspace title element -->\r\n\
              <collection href=\"Products\">\r\n\
                <atom:title>Products</atom:title> \r\n\
              </collection>\r\n\
              <collection href=\"Categories\">\r\n\
                <atom:title>Categories</atom:title> \r\n\
              </collection>\r\n\
              <collection href=\"Suppliers\">\r\n\
                <atom:title>Suppliers</atom:title> \r\n\
              </collection>\r\n\
            </workspace>\r\n\
         </service>\r\n";

        var serviceDoc = OData.atomParser(OData.atomHandler, serviceDocString, {});

        djstest.assertAreEqual(serviceDoc.workspaces.length, 1, "Incorrect number of workspaces");

        var workspace = serviceDoc.workspaces[0];
        djstest.assertAreEqual(workspace.title, "", "Incorrect service doc title");

        djstest.done();
    });

    djstest.addFullTest(true, function testWorkspaceMayHaveNoCollections() {
        var serviceDocString = "\
        <service xml:base=\"http://services.odata.org/OData/OData.svc/\" \r\n\
                 xmlns:atom=\"http://www.w3.org/2005/Atom\" \r\n\
                 xmlns:app=\"http://www.w3.org/2007/app\" \r\n\
                 xmlns=\"http://www.w3.org/2007/app\">\r\n\
           <workspace>\r\n\
              <atom:title>Default</atom:title> \r\n\
            </workspace>\r\n\
         </service>\r\n";

        var serviceDoc = OData.atomParser(OData.atomHandler, serviceDocString, {});

        djstest.assertAreEqual(serviceDoc.workspaces.length, 1, "Incorrect number of workspaces");

        var workspace = serviceDoc.workspaces[0];
        var expectedCollections = [];

        djstest.assertAreEqual(workspace.collections.length, expectedCollections.length, "Incorrect number of collections in workspace");

        djstest.done();
    });

    djstest.addFullTest(true, function testCollectionMustHaveTitleElement() {
        var serviceDocString = "\
        <service xml:base=\"http://services.odata.org/OData/OData.svc/\" \r\n\
                 xmlns:atom=\"http://www.w3.org/2005/Atom\" \r\n\
                 xmlns:app=\"http://www.w3.org/2007/app\" \r\n\
                 xmlns=\"http://www.w3.org/2007/app\">\r\n\
           <workspace>\r\n\
              <atom:title>Default</atom:title> \r\n\
              <collection href=\"Products\">\r\n\
                <!-- No title element -->\r\n\
              </collection>\r\n\
            </workspace>\r\n\
         </service>\r\n";

        djstest.expectException(function () {
            var serviceDoc = OData.atomParser(OData.atomHandler, serviceDocString, {});
        }, "Parsing service doc with a collection with no title element");

        djstest.done();
    });

    djstest.addFullTest(true, function testCollectionMustHaveHrefAttribute() {
        var serviceDocString = "\
        <service xml:base=\"http://services.odata.org/OData/OData.svc/\" \r\n\
                 xmlns:atom=\"http://www.w3.org/2005/Atom\" \r\n\
                 xmlns:app=\"http://www.w3.org/2007/app\" \r\n\
                 xmlns=\"http://www.w3.org/2007/app\">\r\n\
           <workspace>\r\n\
              <atom:title>Default</atom:title> \r\n\
              <!-- href attribute missing below --> \r\n\
              <collection>\r\n\
                <atom:title>Products</atom:title> \r\n\
              </collection>\r\n\
            </workspace>\r\n\
         </service>\r\n";

        djstest.expectException(function () {
            var serviceDoc = OData.atomParser(OData.atomHandler, serviceDocString, {});
        }, "Parsing service doc with a collection with no href attribute");

        djstest.done();
    });

    djstest.addFullTest(true, function atomReadDocumentTest() {
        var emptyServiceString = "\
        <service xml:base=\"http://services.odata.org/OData/OData.svc/\" \r\n\
                 xmlns:atom=\"http://www.w3.org/2005/Atom\" \r\n\
                 xmlns:app=\"http://www.w3.org/2007/app\" \r\n\
                 xmlns=\"http://www.w3.org/2007/app\">\r\n\
          <workspace>\r\n\
            <atom:title>empty service</atom:title> \r\n\
          </workspace>\r\n\
        </service>\r\n";

        var emptyFeedString = "\
        <feed xml:base=\'http://services.odata.org/OData/OData.svc/\' \r\n\
              xmlns:app=\'http://www.w3.org/2007/app\' \r\n\
              xmlns=\'http://www.w3.org/2005/Atom\'> \r\n\
           <id>feed id</id> \r\n\
           <title>empty feed</title> \r\n\
        </feed> \r\n";

        var emptyEntryString = "\
        <entry xml:base=\'http://services.odata.org/OData/OData.svc/\' \r\n\
              xmlns:app=\'http://www.w3.org/2007/app\' \r\n\
              xmlns=\'http://www.w3.org/2005/Atom\'> \r\n\
           <id>entry id</id> \r\n\
           <title>empty entry</title> \r\n\
        </entry> \r\n";

        var nonAtomString = "\
        <notAtom xml:base=\'http://services.odata.org/OData/OData.svc/\' \r\n\
              xmlns:app=\'http://www.w3.org/2007/app\' \r\n\
              xmlns=\'http://www.w3.org/2005/Atom\'> \r\n\
           <id>entry id</id> \r\n\
           <title>empty entry</title> \r\n\
        </notAtom> \r\n";

        var service = OData.atomReadDocument(datajs.xmlParse(emptyServiceString).documentElement);
        var feed = OData.atomReadDocument(datajs.xmlParse(emptyFeedString).documentElement);
        var entry = OData.atomReadDocument(datajs.xmlParse(emptyEntryString).documentElement);
        var nonAtom = OData.atomReadDocument(datajs.xmlParse(nonAtomString).documentElement);

        djstest.assert(service && service.workspaces.length === 1, "atomReadDocument deserialized a service document");
        djstest.assert(feed && feed.results.length === 0, "atomReadDocument deserialized a feed document");
        djstest.assert(entry && !entry.results && entry.__metadata.uri === "http://services.odata.org/OData/OData.svc/entry id", "atomReadDocument deserialized a entry document");
        djstest.assertAreEqual(nonAtom, undefined, "atomReadDocument returns undefined with non Atom input");

        djstest.done();
    });

    djstest.addFullTest(true, function atomReadFeedWithActionsAndFunctionsTest() {
        var feed = "\r\n\
        <feed xml:base='http://services.odata.org/OData/OData.svc/' \r\n\
              xmlns:app='http://www.w3.org/2007/app' \r\n\
              xmlns:m='http://schemas.microsoft.com/ado/2007/08/dataservices/metadata' \r\n\
              xmlns:me='http://myExtensions' \r\n\
              xmlns='http://www.w3.org/2005/Atom'> \r\n\
           <id>feed id</id> \r\n\
           <title>test feed</title> \r\n\
           <m:action metadata='#EntityContainer.Action1' title='Action1' target='http://service/entities(0)/action' /> \r\n\
           <m:action metadata='#EntityContainer.Action2' title='Action2' target='entities(0)/action2'/> \r\n\
           <m:action metadata='http://someService/$metadata#Container.Action1' title='Action1' target='http://someService/action' /> \r\n\
           <m:function metadata='#EntityContainer.Function1' title='Function1' target='http://service/entities(0)/function' /> \r\n\
           <m:function metadata='#EntityContainer.Function2' title='Function2' target='entities(0)/function2' /> \r\n\
           <m:function metadata='http://someService/$metadata#Container.Function1' title='Function1' target='http://someService/function' /> \r\n\
        </feed> \r\n";

        var expected = {
            __metadata: {
                uri: "http://services.odata.org/OData/OData.svc/feed id",
                uri_extensions: [],
                title: "test feed",
                title_extensions: [],
                feed_extensions: [],
                actions: [
                    {
                        metadata: "#EntityContainer.Action1",
                        title: "Action1",
                        target: "http://service/entities(0)/action",
                        extensions: []
                    },
                    {
                        metadata: "#EntityContainer.Action2",
                        title: "Action2",
                        target: "http://services.odata.org/OData/OData.svc/entities(0)/action2",
                        extensions: []
                    },
                    {
                        metadata: "http://someService/$metadata#Container.Action1",
                        title: "Action1",
                        target: "http://someService/action",
                        extensions: []
                    }
                ],
                functions: [
                    {
                        metadata: "#EntityContainer.Function1",
                        title: "Function1",
                        target: "http://service/entities(0)/function",
                        extensions: []
                    },
                    {
                        metadata: "#EntityContainer.Function2",
                        title: "Function2",
                        target: "http://services.odata.org/OData/OData.svc/entities(0)/function2",
                        extensions: []
                    },
                    {
                        metadata: "http://someService/$metadata#Container.Function1",
                        title: "Function1",
                        target: "http://someService/function",
                        extensions: []
                    }
                ]
            },
            results: []
        };

        var response = { headers: { "Content-Type": "application/atom+xml", "OData-Version": "4.0" }, body: feed };

        OData.atomHandler.read(response);
        djstest.assertAreEqualDeep(response.data, expected, "atomReadEntry didn't return the expected entry object");
        djstest.done();
    });

    djstest.addFullTest(true, function atomReadFeedExtensionsTest() {
        var feedWithExtensionsString = "\
         <feed xml:base=\'http://services.odata.org/OData/OData.svc/\' \r\n\
              xmlns:app=\'http://www.w3.org/2007/app\' \r\n\
              xmlns:me=\'http://myExtensions' \r\n\
              xmlns=\'http://www.w3.org/2005/Atom\' attr1=\'a1\' me:attr2=\'a2\'> \r\n\
           <me:element1>e1</me:element1> \r\n\
           <me:element2> \r\n\
               <me:element21 attr3=\'a3\' me:attr4=\'a4\' >e1</me:element21> \r\n\
           </me:element2> \r\n\
           <id>feed id</id> \r\n\
           <title>test feed</title> \r\n\
        </feed> \r\n"

        var feed = OData.atomReadFeed(datajs.xmlParse(feedWithExtensionsString).documentElement);
        djstest.assert(feed, "atomReadFeed didn't return a feed object for a payload with feed extensions");
        djstest.assertAreEqual(feed.__metadata.feed_extensions.length, 4, "atomReadFeed didn't return the expected number of extensions");

        djstest.done();
    });

    djstest.addFullTest(true, function atomReadFeedLinksTest() {
        var feedLinksString = "\
        <feed xml:base=\'http://services.odata.org/OData/OData.svc/\' \r\n\
              xmlns:app=\'http://www.w3.org/2007/app\' \r\n\
              xmlns:me=\'http://myExtensions\' \r\n\
              xmlns=\'http://www.w3.org/2005/Atom\'> \r\n\
          <link rel=\'next\' href=\'http://nexturi\' me:attr1=\'a1\' attr2=\'a2\'/> \r\n\
          <link rel=\'self\' href=\'http://selfuri\' me:attr3=\'a1\' attr4=\'a2\'/> \r\n\
          <link rel=\'alternate\' href=\'http://otheruri\'/> \r\n\
        </feed> \r\n";

        var root = datajs.xmlParse(feedLinksString).documentElement;
        var feed = { __metadata: {} };
        datajs.xmlChildElements(root, function (child) {
            OData.atomReadFeedLink(child, feed);
        });

        djstest.assertAreEqual(feed.__next, "http://nexturi", "atomReadFeedLink didn't read the next link element");
        djstest.assertAreEqual(feed.__metadata.next_extensions.length, 2, "atomReadFeedLink didn't return the expected number of next link extensions");
        djstest.assertAreEqual(feed.__metadata.self, "http://selfuri", "atomReadFeedLink didn't read the self link element");
        djstest.assertAreEqual(feed.__metadata.self_extensions.length, 2, "atomReadFeedLink didn't return the expected number of self link extensions");

        djstest.done();
    });

    djstest.addFullTest(true, function atomReadLinkTest() {
        var linkString = "\
        <link xmlns:me=\'http://myExtensions\' \r\n\
              xmlns=\'http://www.w3.org/2005/Atom\' \r\n\
              rel=\'next\' \r\n\
              href=\'http://nexturi\' \r\n\
              type=\'application/atom+xml;type=feed\' \r\n\
              me:attr1=\'a1\' \r\n\
              attr2=\'a2\'/> \r\n";

        var link = OData.atomReadLink(datajs.xmlParse(linkString).documentElement);

        djstest.assert(link, "atomReadLink didn't return a link object");
        djstest.assertAreEqual(link.href, "http://nexturi", "atomReadLink, link object href field has an unexpected value");
        djstest.assertAreEqual(link.rel, "next", "atomReadLink, link object rel field has an unexpected value");
        djstest.assertAreEqual(link.type, "application/atom+xml;type=feed", "atomReadLink, link object type field has an unexpected value");
        djstest.assertAreEqual(link.extensions.length, 2, "atomReadLink, link object extensions doesn't have the expected number of extensions");

        djstest.done();

    });

    djstest.addFullTest(true, function atomReadLinkThrowHrefMissingTest() {
        var linkString = "\
        <link xmlns:me=\'http://myExtensions\' \r\n\
              xmlns=\'http://www.w3.org/2005/Atom\' \r\n\
              rel=\'next\' \r\n\
              type=\'application/atom+xml;type=feed\' \r\n\
              me:attr1=\'a1\' \r\n\
              attr2=\'a2\'/> \r\n";


        var linkRoot = datajs.xmlParse(linkString).documentElement;
        djstest.expectException(function () {
            OData.atomReadLink(linkRoot);
        }, "atomReadLink didn't throw an exception when the link doesn't have the href attribute");
        djstest.done();

    });

    djstest.addFullTest(true, function atomReadExtensionElementTest() {
        var extensionString = "\
        <me:ext xmlns:me=\'http://myExtensions\' me:attr1=\'a1\' attr2=\'a2\'> \r\n\
          <ext>e1</ext> \r\n\
        </me:ext> \r\n";

        var validateExtension = function (ext, name, namespaceURI, attributeCount, childrenCount, value) {
            djstest.assertAreEqual(ext.name, name, "atomReadExtensionElement, extension object name field has an unexpected value");
            djstest.assertAreEqual(ext.namespaceURI, namespaceURI, "atomReadExtensionElement, extension object namespaceURI field has an unexpected value");
            djstest.assertAreEqual(ext.attributes.length, attributeCount, "atomReadExtensionElement, extension object attributes doesn't have the expected number of attributes");
            djstest.assertAreEqual(ext.children.length, childrenCount, "atomReadExtensionElement, extension object attributes doesn't have the expected number of children");
            djstest.assertAreEqual(ext.value, value, "atomReadExtensionElement, extension object value field has an unexpected value");
        };

        var extension = OData.atomReadExtensionElement(datajs.xmlParse(extensionString).documentElement);
        validateExtension(extension, "ext", "http://myExtensions", 2, 1);

        extension = extension.children[0];
        validateExtension(extension, "ext", null, 0, 0, "e1");

        djstest.done();
    });

    djstest.addFullTest(true, function atomReadExtensionAttributesTest() {
        var extensionString = "\
        <me:ext xmlns:me=\'http://myExtensions\' me:attr1=\'a1\' attr2=\'a2\' /> \r\n";

        var extensionAttributes = OData.atomReadExtensionAttributes(datajs.xmlParse(extensionString).documentElement);
        djstest.assertAreEqual(extensionAttributes.length, 2, "atomReadExtensionAttribute, returned collection doesn't have the expected number of attributes");
        djstest.done();
    });

    djstest.addFullTest(true, function atomReadExtensionAttributeTest() {

        var tests = {
            "extension with namespace": {
                i: '<me:ext xmlns:me="http://myExtensions" me:attr1="a1" />',
                e: { name: "attr1", namespaceURI: "http://myExtensions", value: "a1" }
            },
            "extension without namespace": {
                i: '<me:ext xmlns:me="http://myExtensions" attr2="a2" />',
                e: { name: "attr2", namespaceURI: null, value: "a2" }
            }
        };

        for (var name in tests) {
            var test = tests[name];
            var xmlElement = datajs.xmlParse(test.i).documentElement;
            var extensions = OData.atomReadExtensionAttributes(xmlElement);

            djstest.assertAreEqualDeep(extensions[0], test.e, name + " - extension object is the expected one");
        }
        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryTest() {
        var entryString = "\
        <entry xml:base=\'http://services.odata.org/OData/OData.svc/\' \r\n\
               xmlns:d2=\'http://schemas.microsoft.com/ado/2007/08/dataservices\' \r\n\
               xmlns:m2=\'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\' \r\n\
               xmlns:atom=\'http://www.w3.org/2005/Atom\' \r\n\
               xmlns:app=\'http://www.w3.org/2007/app\' \r\n\
               xmlns=\'http://www.w3.org/2005/Atom\'> \r\n\
           <id>the id</id> \r\n\
           <category term=\'the type\' \r\n\
                     scheme=\'http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\' /> \r\n\
           <content type=\'application/xml\'> \r\n\
            <m2:properties xmlns=\'http://schemas.microsoft.com/ado/2007/08/dataservices\'>\r\n\
             <Untyped>untyped value</Untyped> \r\n\
             <Typed m2:type='Edm.Int32'>100</Typed> \r\n\
            </m2:properties> \r\n\
           </content> \r\n\
           <link rel=\'self\' href=\'http://selfuri\' /> \r\n\
        </entry>\r\n";

        var expectedEntry = {
            __metadata: {
                uri: "http://services.odata.org/OData/OData.svc/the id",
                uri_extensions: [],
                type: "the type",
                type_extensions: [],
                self: "http://selfuri",
                self_link_extensions: [],
                properties: {
                    Untyped: {
                        type: "Edm.String",
                        extensions: []
                    },
                    Typed: {
                        type: "Edm.Int32",
                        extensions: []
                    }
                }
            },
            Untyped: "untyped value",
            Typed: 100
        };

        var entry = OData.atomReadEntry(datajs.xmlParse(entryString).documentElement);

        djstest.assert(entry, "atomReadEntry didn't return an entry object");
        djstest.assertAreEqualDeep(entry, expectedEntry);
        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryGmlCRSValueTest() {
        var entryXml =
            "<entry                                                                          \r\n\
               xmlns:m='http://schemas.microsoft.com/ado/2007/08/dataservices/metadata'      \r\n\
               xmlns='http://www.w3.org/2005/Atom'>                                          \r\n\
               <content type='application/xml'>                                              \r\n\
               <m:properties xmlns='http://schemas.microsoft.com/ado/2007/08/dataservices'   \r\n\
                           xmlns:gml='http://www.opengis.net/gml'>                           \r\n\
                 <PointQualified>                                                            \r\n\
                   <gml:Point gml:srsName='http://www.opengis.net/def/crs/EPSG/0/1234'>      \r\n\
                      <gml:pos>1 2 3 4</gml:pos>                                             \r\n\
                   </gml:Point>                                                              \r\n\
                 </PointQualified>                                                           \r\n\
                 <PointUnQualified>                                                          \r\n\
                   <gml:Point srsName='http://www.opengis.net/def/crs/EPSG/0/5678'>          \r\n\
                      <gml:pos>5 6 7 8</gml:pos>                                             \r\n\
                   </gml:Point>                                                              \r\n\
                 </PointUnQualified>                                                         \r\n\
               </m:properties>                                                               \r\n\
              </content>                                                                     \r\n\
            </entry>";

        var entry = {
            __metadata: {
                properties: {
                    PointQualified: { type: "Edm.Geometry", extensions: [] },
                    PointUnQualified: { type: "Edm.Geometry", extensions: [] }
                }
            },
            PointQualified: {
                __metadata: { type: "Edm.Geometry" },
                crs: {
                    type: "name",
                    properties: {
                        name: "EPSG:1234"
                    }
                },
                type: "Point",
                coordinates: [1, 2, 3, 4]
            },
            PointUnQualified: {
                __metadata: { type: "Edm.Geometry" },
                crs: {
                    type: "name",
                    properties: {
                        name: "EPSG:5678"
                    }
                },
                type: "Point",
                coordinates: [5, 6, 7, 8]
            }
        };

        var response = { headers: { "Content-Type": "application/atom+xml" }, body: entryXml };

        OData.atomHandler.read(response);
        djstest.assertAreEqualDeep(response.data, entry, "Entry was read successfully");
        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryGmlUnknownCRSValueThrowsTest() {
        var entryXml =
            "<entry                                                                          \r\n\
               xmlns:m='http://schemas.microsoft.com/ado/2007/08/dataservices/metadata'      \r\n\
               xmlns='http://www.w3.org/2005/Atom'>                                          \r\n\
               <content type='application/xml'>                                              \r\n\
               <m:properties xmlns='http://schemas.microsoft.com/ado/2007/08/dataservices'   \r\n\
                           xmlns:gml='http://www.opengis.net/gml'>                           \r\n\
                 <Point>                                                                     \r\n\
                   <gml:Point srsName='http://www.opengis.net/def/crs/EPSG/1/1234'>          \r\n\
                      <gml:pos>1 2 3 4</gml:pos>                                             \r\n\
                   </gml:Point>                                                              \r\n\
                 </Point>                                                                     \r\n\
               </m:properties>                                                               \r\n\
              </content>                                                                     \r\n\
            </entry>";

        var response = { headers: { "Content-Type": "application/atom+xml" }, body: entryXml };

        try {
            OData.atomHandler.read(response);
            djstest.fail("An exception was expected");
        } catch (e) {
            djstest.assert(e.message.indexOf("Unsupported srs name:") === 0, "Error is the expected one");
        }
        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryGmlPointValueTest() {
        var entryXml =
            "<entry                                                                          \r\n\
               xmlns:m='http://schemas.microsoft.com/ado/2007/08/dataservices/metadata'      \r\n\
               xmlns='http://www.w3.org/2005/Atom'>                                          \r\n\
               <content type='application/xml'>                                              \r\n\
               <m:properties xmlns='http://schemas.microsoft.com/ado/2007/08/dataservices'   \r\n\
                           xmlns:gml='http://www.opengis.net/gml'>                           \r\n\
                 <Point>                                                                     \r\n\
                   <gml:Point>                                                               \r\n\
                      <gml:pos>1 2 -3 4</gml:pos>                                             \r\n\
                   </gml:Point>                                                              \r\n\
                 </Point>                                                                    \r\n\
                 <PointWithExtraTags>                                                        \r\n\
                   <gml:Point>                                                               \r\n\
                      <gml:name>the point</gml:name>                                         \r\n\
                      <gml:pos>5 6 7 8</gml:pos>                                             \r\n\
                   </gml:Point>                                                              \r\n\
                 </PointWithExtraTags>                                                       \r\n\
                 <EmptyPoint >                                                               \r\n\
                   <gml:Point>                                                               \r\n\
                      <gml:pos/>                                                             \r\n\
                   </gml:Point>                                                              \r\n\
                 </EmptyPoint>                                                               \r\n\
                 <PointWithSpacesInValue>                                                    \r\n\
                   <gml:Point>                                                               \r\n\
                      <gml:pos>  8  9 10   11      12 </gml:pos>                             \r\n\
                   </gml:Point>                                                              \r\n\
                 </PointWithSpacesInValue>                                                   \r\n\
                 <PointWithSingleValue>                                                      \r\n\
                   <gml:Point>                                                               \r\n\
                      <gml:pos>13</gml:pos>                                                  \r\n\
                   </gml:Point>                                                              \r\n\
                 </PointWithSingleValue>                                                     \r\n\
                 <PointWithSingleValueAndSpaces>                                             \r\n\
                   <gml:Point>                                                               \r\n\
                      <gml:pos> 14 </gml:pos>                                                \r\n\
                   </gml:Point>                                                              \r\n\
                 </PointWithSingleValueAndSpaces>                                            \r\n\
              </m:properties>                                                                \r\n\
              </content>                                                                     \r\n\
            </entry>";

        var entry = {
            __metadata: {
                properties: {
                    Point: { type: "Edm.Geometry", extensions: [] },
                    PointWithExtraTags: { type: "Edm.Geometry", extensions: [] },
                    EmptyPoint: { type: "Edm.Geometry", extensions: [] },
                    PointWithSpacesInValue: { type: "Edm.Geometry", extensions: [] },
                    PointWithSingleValue: { type: "Edm.Geometry", extensions: [] },
                    PointWithSingleValueAndSpaces: { type: "Edm.Geometry", extensions: [] }
                }
            },
            Point: {
                __metadata: { type: "Edm.Geometry" },
                type: "Point",
                coordinates: [1, 2, -3, 4]
            },
            PointWithExtraTags: {
                __metadata: { type: "Edm.Geometry" },
                type: "Point",
                coordinates: [5, 6, 7, 8]
            },
            EmptyPoint: {
                __metadata: { type: "Edm.Geometry" },
                type: "Point",
                coordinates: []
            },
            PointWithSpacesInValue: {
                __metadata: { type: "Edm.Geometry" },
                type: "Point",
                coordinates: [8, 9, 10, 11, 12]
            },
            PointWithSingleValue: {
                __metadata: { type: "Edm.Geometry" },
                type: "Point",
                coordinates: [13]
            },
            PointWithSingleValueAndSpaces: {
                __metadata: { type: "Edm.Geometry" },
                type: "Point",
                coordinates: [14]
            }
        };

        var response = { headers: { "Content-Type": "application/atom+xml" }, body: entryXml };

        OData.atomHandler.read(response);
        djstest.assertAreEqualDeep(response.data, entry, "Entry was read successfully");
        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryGmlLineStringValueTest() {
        var entryXml =
            "<entry                                                                          \r\n\
               xmlns:m='http://schemas.microsoft.com/ado/2007/08/dataservices/metadata'      \r\n\
               xmlns='http://www.w3.org/2005/Atom'>                                          \r\n\
               <content type='application/xml'>                                              \r\n\
                <m:properties xmlns='http://schemas.microsoft.com/ado/2007/08/dataservices'  \r\n\
                             xmlns:gml='http://www.opengis.net/gml'>                         \r\n\
                 <LineStringExtraTags>                                                       \r\n\
                   <gml:LineString>                                                          \r\n\
                     <gml:name>the line</gml:name>                                           \r\n\
                     <gml:posList>1.0 2.0 3.0 4.0</gml:posList>                              \r\n\
                   </gml:LineString>                                                         \r\n\
                 </LineStringExtraTags>                                                      \r\n\
                 <LineStringPosList>                                                         \r\n\
                   <gml:LineString>                                                          \r\n\
                     <gml:posList>5.0 6.0 7.0 8.0</gml:posList>                              \r\n\
                   </gml:LineString>                                                         \r\n\
                 </LineStringPosList>                                                        \r\n\
                 <LineStringEmptyPosList>                                                    \r\n\
                   <gml:LineString>                                                          \r\n\
                     <gml:posList/>                                                          \r\n\
                   </gml:LineString>                                                         \r\n\
                 </LineStringEmptyPosList>                                                   \r\n\
                 <LineStringPosAndPoint>                                                     \r\n\
                   <gml:LineString>                                                          \r\n\
                     <gml:pos>7 8</gml:pos>                                                  \r\n\
                     <gml:pointProperty>                                                     \r\n\
                        <gml:Point>                                                          \r\n\
                          <gml:pos>9 10 11 12</gml:pos>                                      \r\n\
                        </gml:Point>                                                         \r\n\
                     </gml:pointProperty>                                                    \r\n\
                   </gml:LineString>                                                         \r\n\
                 </LineStringPosAndPoint>                                                    \r\n\
                 <LineStringEmptyPosAndPoint>                                                \r\n\
                   <gml:LineString>                                                          \r\n\
                     <gml:pos/>                                                              \r\n\
                     <gml:pointProperty>                                                     \r\n\
                        <gml:Point>                                                          \r\n\
                          <gml:pos/>                                                         \r\n\
                        </gml:Point>                                                         \r\n\
                     </gml:pointProperty>                                                    \r\n\
                   </gml:LineString>                                                         \r\n\
                 </LineStringEmptyPosAndPoint>                                               \r\n\
               </m:properties>                                                               \r\n\
              </content>                                                                     \r\n\
            </entry>";

        var entry = {
            __metadata: {
                properties: {
                    LineStringExtraTags: { type: "Edm.Geometry", extensions: [] },
                    LineStringPosList: { type: "Edm.Geometry", extensions: [] },
                    LineStringEmptyPosList: { type: "Edm.Geometry", extensions: [] },
                    LineStringPosAndPoint: { type: "Edm.Geometry", extensions: [] },
                    LineStringEmptyPosAndPoint: { type: "Edm.Geometry", extensions: [] }
                }
            },
            LineStringExtraTags: {
                __metadata: { type: "Edm.Geometry" },
                type: "LineString",
                coordinates: [[1, 2], [3, 4]]
            },
            LineStringPosList: {
                __metadata: { type: "Edm.Geometry" },
                type: "LineString",
                coordinates: [[5, 6], [7, 8]]
            },
            LineStringEmptyPosList: {
                __metadata: { type: "Edm.Geometry" },
                type: "LineString",
                coordinates: []
            },
            LineStringPosAndPoint: {
                __metadata: { type: "Edm.Geometry" },
                type: "LineString",
                coordinates: [[7, 8], [9, 10, 11, 12]]
            },
            LineStringEmptyPosAndPoint: {
                __metadata: { type: "Edm.Geometry" },
                type: "LineString",
                coordinates: [[], []]
            }
        };

        var response = { headers: { "Content-Type": "application/atom+xml" }, body: entryXml };

        OData.atomHandler.read(response);
        djstest.assertAreEqualDeep(response.data, entry, "Entry was read successfully");
        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryGmlLineStringValueWithOddPosListTest() {
        var entryXml =
            "<entry                                                                          \r\n\
               xmlns:m='http://schemas.microsoft.com/ado/2007/08/dataservices/metadata'      \r\n\
               xmlns='http://www.w3.org/2005/Atom'>                                          \r\n\
               <content type='application/xml'>                                              \r\n\
                <m:properties xmlns='http://schemas.microsoft.com/ado/2007/08/dataservices'  \r\n\
                             xmlns:gml='http://www.opengis.net/gml'>                         \r\n\
                 <LineString>                                                                \r\n\
                   <gml:LineString>                                                          \r\n\
                     <gml:posList>1.0 2.0 3.0</gml:posList>                                  \r\n\
                   </gml:LineString>                                                         \r\n\
                 </LineString>                                                               \r\n\
               </m:properties>                                                               \r\n\
              </content>                                                                     \r\n\
            </entry>";

        var response = { headers: { "Content-Type": "application/atom+xml" }, body: entryXml };

        try {
            OData.atomHandler.read(response);
            djstest.fail("An exception was expected");
        } catch (e) {
            djstest.assertAreEqual(e.message, "GML posList element has an uneven number of numeric values");
        }
        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryGmlPolygonValueTest() {
        var entryXml =
            "<entry                                                                          \r\n\
               xmlns:m='http://schemas.microsoft.com/ado/2007/08/dataservices/metadata'      \r\n\
               xmlns='http://www.w3.org/2005/Atom'>                                          \r\n\
               <content type='application/xml'>                                              \r\n\
                <m:properties xmlns='http://schemas.microsoft.com/ado/2007/08/dataservices'  \r\n\
                             xmlns:gml='http://www.opengis.net/gml'>                         \r\n\
                 <PolygonExteriorOnly>                                                       \r\n\
                   <gml:Polygon>                                                             \r\n\
                     <gml:exterior>                                                          \r\n\
                       <gml:LinearRing>                                                      \r\n\
                         <gml:pos>1.0 2.0</gml:pos>                                          \r\n\
                       </gml:LinearRing>                                                     \r\n\
                     </gml:exterior>                                                         \r\n\
                   </gml:Polygon>                                                            \r\n\
                 </PolygonExteriorOnly>                                                      \r\n\
                 <PolygonExteriorInterior>                                                   \r\n\
                   <gml:Polygon>                                                             \r\n\
                     <gml:exterior>                                                          \r\n\
                       <gml:LinearRing>                                                      \r\n\
                         <gml:pos>3.0 4.0</gml:pos>                                          \r\n\
                       </gml:LinearRing>                                                     \r\n\
                     </gml:exterior>                                                         \r\n\
                     <gml:interior>                                                          \r\n\
                       <gml:LinearRing>                                                      \r\n\
                         <gml:pos>5.0 6.0</gml:pos>                                          \r\n\
                       </gml:LinearRing>                                                     \r\n\
                     </gml:interior>                                                         \r\n\
                   </gml:Polygon>                                                            \r\n\
                 </PolygonExteriorInterior>                                                  \r\n\
                 <PolygonInteriorFirst>                                                      \r\n\
                   <gml:Polygon>                                                             \r\n\
                     <gml:interior>                                                          \r\n\
                       <gml:LinearRing>                                                      \r\n\
                         <gml:pos>9.0 10.0</gml:pos>                                         \r\n\
                       </gml:LinearRing>                                                     \r\n\
                     </gml:interior>                                                         \r\n\
                     <gml:exterior>                                                          \r\n\
                       <gml:LinearRing>                                                      \r\n\
                         <gml:pos>11.0 12.0</gml:pos>                                        \r\n\
                       </gml:LinearRing>                                                     \r\n\
                     </gml:exterior>                                                         \r\n\
                   </gml:Polygon>                                                            \r\n\
                 </PolygonInteriorFirst>                                                     \r\n\
                 <PolygonInteriorOnly>                                                       \r\n\
                   <gml:Polygon>                                                             \r\n\
                     <gml:interior>                                                          \r\n\
                       <gml:LinearRing>                                                      \r\n\
                         <gml:pos>13.0 14.0</gml:pos>                                        \r\n\
                       </gml:LinearRing>                                                     \r\n\
                     </gml:interior>                                                         \r\n\
                     <gml:interior>                                                          \r\n\
                       <gml:LinearRing>                                                      \r\n\
                         <gml:pos>15.0 16.0</gml:pos>                                        \r\n\
                       </gml:LinearRing>                                                     \r\n\
                     </gml:interior>                                                         \r\n\
                   </gml:Polygon>                                                            \r\n\
                 </PolygonInteriorOnly>                                                      \r\n\
                 <EmptyPolygon>                                                              \r\n\
                   <gml:Polygon/>                                                            \r\n\
                 </EmptyPolygon>                                                             \r\n\
                 <PolygonEmptyExteriorInterior>                                              \r\n\
                   <gml:Polygon>                                                             \r\n\
                     <gml:interior>                                                          \r\n\
                       <gml:LinearRing>                                                      \r\n\
                         <gml:pos/>                                                          \r\n\
                       </gml:LinearRing>                                                     \r\n\
                     </gml:interior>                                                         \r\n\
                     <gml:exterior>                                                          \r\n\
                       <gml:LinearRing>                                                      \r\n\
                         <gml:pos/>                                                          \r\n\
                       </gml:LinearRing>                                                     \r\n\
                     </gml:exterior>                                                         \r\n\
                   </gml:Polygon>                                                            \r\n\
                 </PolygonEmptyExteriorInterior>                                             \r\n\
               </m:properties>                                                               \r\n\
              </content>                                                                     \r\n\
            </entry>";

        var entry = {
            __metadata: {
                properties: {
                    PolygonExteriorOnly: { type: "Edm.Geometry", extensions: [] },
                    PolygonExteriorInterior: { type: "Edm.Geometry", extensions: [] },
                    PolygonInteriorFirst: { type: "Edm.Geometry", extensions: [] },
                    PolygonInteriorOnly: { type: "Edm.Geometry", extensions: [] },
                    EmptyPolygon: { type: "Edm.Geometry", extensions: [] },
                    PolygonEmptyExteriorInterior: { type: "Edm.Geometry", extensions: [] }
                }
            },
            PolygonExteriorOnly: {
                __metadata: { type: "Edm.Geometry" },
                type: "Polygon",
                coordinates: [[[1, 2]]]
            },
            PolygonExteriorInterior: {
                __metadata: { type: "Edm.Geometry" },
                type: "Polygon",
                coordinates: [[[3, 4]], [[5, 6]]]
            },
            PolygonInteriorFirst: {
                __metadata: { type: "Edm.Geometry" },
                type: "Polygon",
                coordinates: [[[11, 12]], [[9, 10]]]
            },
            PolygonInteriorOnly: {
                __metadata: { type: "Edm.Geometry" },
                type: "Polygon",
                coordinates: [[[]], [[13, 14]], [[15, 16]]]
            },
            EmptyPolygon: {
                __metadata: { type: "Edm.Geometry" },
                type: "Polygon",
                coordinates: []
            },
            PolygonEmptyExteriorInterior: {
                __metadata: { type: "Edm.Geometry" },
                type: "Polygon",
                coordinates: [[[]], [[]]]
            }
        };

        var response = { headers: { "Content-Type": "application/atom+xml" }, body: entryXml };

        OData.atomHandler.read(response);
        djstest.assertAreEqualDeep(response.data, entry, "Entry was read successfully");
        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryGmlMultiPointValueTest() {
        var entryXml =
            "<entry                                                                          \r\n\
               xmlns:m='http://schemas.microsoft.com/ado/2007/08/dataservices/metadata'      \r\n\
               xmlns='http://www.w3.org/2005/Atom'>                                          \r\n\
               <content type='application/xml'>                                              \r\n\
               <m:properties xmlns='http://schemas.microsoft.com/ado/2007/08/dataservices'   \r\n\
                           xmlns:gml='http://www.opengis.net/gml'>                           \r\n\
                 <EmptyMultiPoint>                                                           \r\n\
                   <gml:MultiPoint/>                                                         \r\n\
                 </EmptyMultiPoint>                                                          \r\n\
                 <MultiPoint>                                                                \r\n\
                   <gml:MultiPoint>                                                          \r\n\
                     <gml:pointMember>                                                       \r\n\
                       <gml:Point>                                                           \r\n\
                         <gml:pos>1 2</gml:pos>                                              \r\n\
                       </gml:Point>                                                          \r\n\
                     </gml:pointMember>                                                      \r\n\
                     <gml:pointMember>                                                       \r\n\
                       <gml:Point>                                                           \r\n\
                         <gml:pos>3 4</gml:pos>                                              \r\n\
                       </gml:Point>                                                          \r\n\
                     </gml:pointMember>                                                      \r\n\
                     <gml:pointMembers>                                                      \r\n\
                       <gml:Point>                                                           \r\n\
                         <gml:pos>5 6</gml:pos>                                              \r\n\
                       </gml:Point>                                                          \r\n\
                       <gml:Point>                                                           \r\n\
                         <gml:pos>7 8</gml:pos>                                              \r\n\
                       </gml:Point>                                                          \r\n\
                     </gml:pointMembers>                                                     \r\n\
                   </gml:MultiPoint>                                                         \r\n\
                 </MultiPoint>                                                               \r\n\
                 <MultiPointEmptyMembers>                                                    \r\n\
                   <gml:MultiPoint>                                                          \r\n\
                     <gml:pointMember/>                                                      \r\n\
                     <gml:pointMembers/>                                                     \r\n\
                   </gml:MultiPoint>                                                         \r\n\
                 </MultiPointEmptyMembers>                                                   \r\n\
              </m:properties>                                                                \r\n\
              </content>                                                                     \r\n\
            </entry>";

        var entry = {
            __metadata: {
                properties: {
                    EmptyMultiPoint: { type: "Edm.Geometry", extensions: [] },
                    MultiPoint: { type: "Edm.Geometry", extensions: [] },
                    MultiPointEmptyMembers: { type: "Edm.Geometry", extensions: [] }
                }
            },
            EmptyMultiPoint: {
                __metadata: { type: "Edm.Geometry" },
                type: "MultiPoint",
                coordinates: []
            },
            MultiPoint: {
                __metadata: { type: "Edm.Geometry" },
                type: "MultiPoint",
                coordinates: [[1, 2], [3, 4], [5, 6], [7, 8]]
            },
            MultiPointEmptyMembers: {
                __metadata: { type: "Edm.Geometry" },
                type: "MultiPoint",
                coordinates: []
            }
        };

        var response = { headers: { "Content-Type": "application/atom+xml" }, body: entryXml };

        OData.atomHandler.read(response);
        djstest.assertAreEqualDeep(response.data, entry, "Entry was read successfully");
        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryGmlMultiListStringValueTest() {
        var entryXml =
            "<entry                                                                          \r\n\
               xmlns:m='http://schemas.microsoft.com/ado/2007/08/dataservices/metadata'      \r\n\
               xmlns='http://www.w3.org/2005/Atom'>                                          \r\n\
               <content type='application/xml'>                                              \r\n\
               <m:properties xmlns='http://schemas.microsoft.com/ado/2007/08/dataservices'   \r\n\
                           xmlns:gml='http://www.opengis.net/gml'>                           \r\n\
                 <EmptyMultiLineString>                                                      \r\n\
                   <gml:MultiCurve/>                                                         \r\n\
                 </EmptyMultiLineString>                                                     \r\n\
                 <MultiLineString>                                                           \r\n\
                   <gml:MultiCurve>                                                          \r\n\
                     <gml:name>The multi line string</gml:name>                              \r\n\
                     <gml:curveMember>                                                       \r\n\
                       <gml:LineString>                                                      \r\n\
                         <gml:posList>1 2 3 4</gml:posList>                                  \r\n\
                       </gml:LineString>                                                     \r\n\
                     </gml:curveMember>                                                      \r\n\
                     <gml:curveMember>                                                       \r\n\
                       <gml:LineString>                                                      \r\n\
                         <gml:posList>5 6 7 8</gml:posList>                                  \r\n\
                       </gml:LineString>                                                     \r\n\
                     </gml:curveMember>                                                      \r\n\
                     <gml:curveMembers>                                                      \r\n\
                       <gml:LineString>                                                      \r\n\
                         <gml:posList>9 10 11 12</gml:posList>                               \r\n\
                       </gml:LineString>                                                     \r\n\
                       <gml:LineString>                                                      \r\n\
                         <gml:posList>13 14 15 16</gml:posList>                              \r\n\
                       </gml:LineString>                                                     \r\n\
                     </gml:curveMembers>                                                     \r\n\
                   </gml:MultiCurve>                                                         \r\n\
                 </MultiLineString>                                                          \r\n\
                 <MultiLineStringEmptyMembers>                                               \r\n\
                   <gml:MultiCurve>                                                          \r\n\
                     <gml:curveMember/>                                                      \r\n\
                     <gml:curveMembers/>                                                     \r\n\
                   </gml:MultiCurve>                                                         \r\n\
                 </MultiLineStringEmptyMembers>                                              \r\n\
              </m:properties>                                                                \r\n\
              </content>                                                                     \r\n\
            </entry>";

        var entry = {
            __metadata: {
                properties: {
                    EmptyMultiLineString: { type: "Edm.Geometry", extensions: [] },
                    MultiLineString: { type: "Edm.Geometry", extensions: [] },
                    MultiLineStringEmptyMembers: { type: "Edm.Geometry", extensions: [] }
                }
            },
            EmptyMultiLineString: {
                __metadata: { type: "Edm.Geometry" },
                type: "MultiLineString",
                coordinates: []
            },
            MultiLineString: {
                __metadata: { type: "Edm.Geometry" },
                type: "MultiLineString",
                coordinates: [[[1, 2], [3, 4]], [[5, 6], [7, 8]], [[9, 10], [11, 12]], [[13, 14], [15, 16]]]
            },
            MultiLineStringEmptyMembers: {
                __metadata: { type: "Edm.Geometry" },
                type: "MultiLineString",
                coordinates: []
            }
        };

        var response = { headers: { "Content-Type": "application/atom+xml" }, body: entryXml };

        OData.atomHandler.read(response);
        djstest.assertAreEqualDeep(response.data, entry, "Entry was read successfully");
        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryGmlMultiPolygonValueTest() {
        var entryXml =
            "<entry                                                                          \r\n\
               xmlns:m='http://schemas.microsoft.com/ado/2007/08/dataservices/metadata'      \r\n\
               xmlns='http://www.w3.org/2005/Atom'>                                          \r\n\
               <content type='application/xml'>                                              \r\n\
               <m:properties xmlns='http://schemas.microsoft.com/ado/2007/08/dataservices'   \r\n\
                           xmlns:gml='http://www.opengis.net/gml'>                           \r\n\
                 <EmptyMultiPolygon>                                                         \r\n\
                   <gml:MultiSurface/>                                                       \r\n\
                 </EmptyMultiPolygon>                                                        \r\n\
                 <MultiPolygon>                                                              \r\n\
                   <gml:MultiSurface>                                                        \r\n\
                     <gml:name>The multi surface</gml:name>                                  \r\n\
                     <gml:surfaceMember>                                                     \r\n\
                       <gml:Polygon>                                                         \r\n\
                         <gml:exterior>                                                      \r\n\
                           <gml:LinearRing>                                                  \r\n\
                             <gml:pos>1 2</gml:pos>                                          \r\n\
                           </gml:LinearRing>                                                 \r\n\
                         </gml:exterior>                                                     \r\n\
                         <gml:interior>                                                      \r\n\
                           <gml:LinearRing>                                                  \r\n\
                             <gml:pos>3 4</gml:pos>                                          \r\n\
                           </gml:LinearRing>                                                 \r\n\
                         </gml:interior>                                                     \r\n\
                        </gml:Polygon>                                                       \r\n\
                     </gml:surfaceMember>                                                    \r\n\
                     <gml:surfaceMember>                                                     \r\n\
                       <gml:Polygon>                                                         \r\n\
                         <gml:exterior>                                                      \r\n\
                           <gml:LinearRing>                                                  \r\n\
                             <gml:pos>5 6</gml:pos>                                          \r\n\
                           </gml:LinearRing>                                                 \r\n\
                         </gml:exterior>                                                     \r\n\
                         <gml:interior>                                                      \r\n\
                           <gml:LinearRing>                                                  \r\n\
                             <gml:pos>7 8</gml:pos>                                          \r\n\
                           </gml:LinearRing>                                                 \r\n\
                         </gml:interior>                                                     \r\n\
                       </gml:Polygon>                                                        \r\n\
                     </gml:surfaceMember>                                                    \r\n\
                     <gml:surfaceMembers>                                                    \r\n\
                       <gml:Polygon>                                                         \r\n\
                         <gml:exterior>                                                      \r\n\
                           <gml:LinearRing>                                                  \r\n\
                             <gml:pos>9 10</gml:pos>                                         \r\n\
                           </gml:LinearRing>                                                 \r\n\
                         </gml:exterior>                                                     \r\n\
                         <gml:interior>                                                      \r\n\
                           <gml:LinearRing>                                                  \r\n\
                             <gml:pos>11 12</gml:pos>                                        \r\n\
                           </gml:LinearRing>                                                 \r\n\
                         </gml:interior>                                                     \r\n\
                       </gml:Polygon>                                                        \r\n\
                       <gml:Polygon>                                                         \r\n\
                         <gml:exterior>                                                      \r\n\
                           <gml:LinearRing>                                                  \r\n\
                             <gml:pos>13 14</gml:pos>                                        \r\n\
                           </gml:LinearRing>                                                 \r\n\
                         </gml:exterior>                                                     \r\n\
                         <gml:interior>                                                      \r\n\
                           <gml:LinearRing>                                                  \r\n\
                             <gml:pos>15 16</gml:pos>                                        \r\n\
                           </gml:LinearRing>                                                 \r\n\
                         </gml:interior>                                                     \r\n\
                       </gml:Polygon>                                                        \r\n\
                     </gml:surfaceMembers>                                                   \r\n\
                   </gml:MultiSurface>                                                       \r\n\
                 </MultiPolygon>                                                             \r\n\
                 <MultiPolygonEmptyMembers>                                                  \r\n\
                   <gml:MultiSurface>                                                        \r\n\
                     <gml:surfaceMember/>                                                    \r\n\
                     <gml:surfaceMembers/>                                                   \r\n\
                   </gml:MultiSurface>                                                       \r\n\
                 </MultiPolygonEmptyMembers>                                                 \r\n\
              </m:properties>                                                                \r\n\
              </content>                                                                     \r\n\
            </entry>";

        var entry = {
            __metadata: {
                properties: {
                    EmptyMultiPolygon: { type: "Edm.Geometry", extensions: [] },
                    MultiPolygon: { type: "Edm.Geometry", extensions: [] },
                    MultiPolygonEmptyMembers: { type: "Edm.Geometry", extensions: [] }
                }
            },
            EmptyMultiPolygon: {
                __metadata: { type: "Edm.Geometry" },
                type: "MultiPolygon",
                coordinates: []
            },
            MultiPolygon: {
                __metadata: { type: "Edm.Geometry" },
                type: "MultiPolygon",
                coordinates: [
                  [[[1, 2]], [[3, 4]]], [[[5, 6]], [[7, 8]]], [[[9, 10]], [[11, 12]]], [[[13, 14]], [[15, 16]]]
                ]
            },
            MultiPolygonEmptyMembers: {
                __metadata: { type: "Edm.Geometry" },
                type: "MultiPolygon",
                coordinates: []
            }
        };

        var response = { headers: { "Content-Type": "application/atom+xml" }, body: entryXml };

        OData.atomHandler.read(response);
        djstest.assertAreEqualDeep(response.data, entry, "Entry was read successfully");
        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryGmlMultiGeometryValueTest() {
        var entryXml =
            "<entry                                                                          \r\n\
               xmlns:m='http://schemas.microsoft.com/ado/2007/08/dataservices/metadata'      \r\n\
               xmlns='http://www.w3.org/2005/Atom'>                                          \r\n\
               <content type='application/xml'>                                              \r\n\
               <m:properties xmlns='http://schemas.microsoft.com/ado/2007/08/dataservices'   \r\n\
                           xmlns:gml='http://www.opengis.net/gml'>                           \r\n\
                 <EmptyMultiGeometry>                                                        \r\n\
                   <gml:MultiGeometry/>                                                      \r\n\
                 </EmptyMultiGeometry>                                                       \r\n\
                 <MultiGeometry>                                                             \r\n\
                   <gml:MultiGeometry>                                                       \r\n\
                     <gml:geometryMember>                                                    \r\n\
                       <gml:Point>                                                           \r\n\
                         <gml:pos>1 2</gml:pos>                                              \r\n\
                       </gml:Point>                                                          \r\n\
                     </gml:geometryMember>                                                   \r\n\
                     <gml:geometryMember>                                                    \r\n\
                       <gml:Point>                                                           \r\n\
                         <gml:pos>3 4</gml:pos>                                              \r\n\
                       </gml:Point>                                                          \r\n\
                     </gml:geometryMember>                                                   \r\n\
                     <gml:geometryMembers>                                                   \r\n\
                       <gml:LineString>                                                      \r\n\
                         <gml:posList>5 6 7 8</gml:posList>                                  \r\n\
                       </gml:LineString>                                                     \r\n\
                       <gml:Polygon>                                                         \r\n\
                         <gml:exterior>                                                      \r\n\
                           <gml:LinearRing>                                                  \r\n\
                             <gml:pos>9 10</gml:pos>                                         \r\n\
                           </gml:LinearRing>                                                 \r\n\
                         </gml:exterior>                                                     \r\n\
                       </gml:Polygon>                                                        \r\n\
                       <gml:MultiPoint>                                                      \r\n\
                         <gml:pointMember>                                                   \r\n\
                           <gml:Point>                                                       \r\n\
                             <gml:pos>11 12</gml:pos>                                        \r\n\
                           </gml:Point>                                                      \r\n\
                         </gml:pointMember>                                                  \r\n\
                       </gml:MultiPoint>                                                     \r\n\
                       <gml:MultiCurve>                                                      \r\n\
                         <gml:curveMember>                                                   \r\n\
                           <gml:LineString>                                                  \r\n\
                             <gml:posList>13 14 15 16</gml:posList>                          \r\n\
                           </gml:LineString>                                                 \r\n\
                         </gml:curveMember>                                                  \r\n\
                       </gml:MultiCurve>                                                     \r\n\
                       <gml:MultiSurface>                                                    \r\n\
                         <gml:surfaceMember>                                                 \r\n\
                           <gml:Polygon>                                                     \r\n\
                             <gml:exterior>                                                  \r\n\
                               <gml:LinearRing>                                              \r\n\
                                 <gml:pos>17 18</gml:pos>                                    \r\n\
                               </gml:LinearRing>                                             \r\n\
                             </gml:exterior>                                                 \r\n\
                             <gml:interior>                                                  \r\n\
                               <gml:LinearRing>                                              \r\n\
                                 <gml:pos>19 20</gml:pos>                                    \r\n\
                               </gml:LinearRing>                                             \r\n\
                             </gml:interior>                                                 \r\n\
                           </gml:Polygon>                                                    \r\n\
                         </gml:surfaceMember>                                                \r\n\
                       </gml:MultiSurface>                                                   \r\n\
                     </gml:geometryMembers>                                                  \r\n\
                   </gml:MultiGeometry>                                                      \r\n\
                 </MultiGeometry>                                                            \r\n\
                 <MultiGeometryEmptyMembers>                                                 \r\n\
                   <gml:MultiGeometry>                                                       \r\n\
                     <gml:geometryMember/>                                                   \r\n\
                     <gml:geometryMembers/>                                                  \r\n\
                   </gml:MultiGeometry>                                                      \r\n\
                 </MultiGeometryEmptyMembers>                                                \r\n\
                 <NestedMultiGeometry>                                                       \r\n\
                   <gml:MultiGeometry>                                                       \r\n\
                     <gml:geometryMember>                                                    \r\n\
                        <gml:MultiGeometry>                                                  \r\n\
                           <gml:geometryMember>                                              \r\n\
                             <gml:Point>                                                     \r\n\
                               <gml:pos>21 22</gml:pos>                                      \r\n\
                             </gml:Point>                                                    \r\n\
                           </gml:geometryMember>                                             \r\n\
                        </gml:MultiGeometry>                                                 \r\n\
                     </gml:geometryMember>                                                   \r\n\
                     <gml:geometryMembers>                                                   \r\n\
                        <gml:MultiGeometry>                                                  \r\n\
                           <gml:geometryMember>                                              \r\n\
                             <gml:MultiGeometry>                                             \r\n\
                               <gml:geometryMember>                                          \r\n\
                                 <gml:Point>                                                 \r\n\
                                   <gml:pos>23 24</gml:pos>                                  \r\n\
                                 </gml:Point>                                                \r\n\
                               </gml:geometryMember>                                         \r\n\
                             </gml:MultiGeometry>                                            \r\n\
                           </gml:geometryMember>                                             \r\n\
                        </gml:MultiGeometry>                                                 \r\n\
                     </gml:geometryMembers>                                                  \r\n\
                   </gml:MultiGeometry>                                                      \r\n\
                 </NestedMultiGeometry>                                                      \r\n\
              </m:properties>                                                                \r\n\
              </content>                                                                     \r\n\
            </entry>";

        var entry = {
            __metadata: {
                properties: {
                    EmptyMultiGeometry: { type: "Edm.Geometry", extensions: [] },
                    MultiGeometry: { type: "Edm.Geometry", extensions: [] },
                    MultiGeometryEmptyMembers: { type: "Edm.Geometry", extensions: [] },
                    NestedMultiGeometry: { type: "Edm.Geometry", extensions: [] }
                }
            },
            EmptyMultiGeometry: {
                __metadata: { type: "Edm.Geometry" },
                type: "GeometryCollection",
                geometries: []
            },
            MultiGeometry: {
                __metadata: { type: "Edm.Geometry" },
                type: "GeometryCollection",
                geometries: [
                    {
                        type: "Point",
                        coordinates: [1, 2]
                    },
                    {
                        type: "Point",
                        coordinates: [3, 4]
                    },
                    {
                        type: "LineString",
                        coordinates: [[5, 6], [7, 8]]
                    },
                    {
                        type: "Polygon",
                        coordinates: [[[9, 10]]]
                    },
                    {
                        type: "MultiPoint",
                        coordinates: [[11, 12]]
                    },
                    {
                        type: "MultiLineString",
                        coordinates: [[[13, 14], [15, 16]]]
                    },
                    {
                        type: "MultiPolygon",
                        coordinates: [[[[17, 18]], [[19, 20]]]]
                    }
                ]
            },
            MultiGeometryEmptyMembers: {
                __metadata: { type: "Edm.Geometry" },
                type: "GeometryCollection",
                geometries: []
            },
            NestedMultiGeometry: {
                __metadata: { type: "Edm.Geometry" },
                type: "GeometryCollection",
                geometries: [
                    {
                        type: "GeometryCollection",
                        geometries: [
                            {
                                type: "Point",
                                coordinates: [21, 22]
                            }
                        ]
                    },
                    {
                        type: "GeometryCollection",
                        geometries: [
                            {
                                type: "GeometryCollection",
                                geometries: [
                                    {
                                        type: "Point",
                                        coordinates: [23, 24]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        };

        var response = { headers: { "Content-Type": "application/atom+xml" }, body: entryXml };

        OData.atomHandler.read(response);
        djstest.assertAreEqualDeep(response.data, entry, "Entry was read successfully");
        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryGeometryProperties() {
        var entryXml =
            "<entry                                                                          \r\n\
               xmlns:m='http://schemas.microsoft.com/ado/2007/08/dataservices/metadata'      \r\n\
               xmlns='http://www.w3.org/2005/Atom'>                                          \r\n\
               <content type='application/xml'>                                              \r\n\
                <m:properties xmlns='http://schemas.microsoft.com/ado/2007/08/dataservices'  \r\n\
                             xmlns:gml='http://www.opengis.net/gml'>                         \r\n\
                 <Point m:type='Edm.GeometryPoint'>                                          \r\n\
                   <gml:Point>                                                               \r\n\
                      <gml:pos/>                                                             \r\n\
                   </gml:Point>                                                              \r\n\
                 </Point>                                                                    \r\n\
                 <LineString m:type='Edm.GeometryLineString'>                                \r\n\
                   <gml:LineString>                                                          \r\n\
                     <gml:posList/>                                                          \r\n\
                   </gml:LineString>                                                         \r\n\
                 </LineString>                                                               \r\n\
                 <Polygon m:type='Edm.GeometryPolygon'>                                      \r\n\
                   <gml:Polygon/>                                                            \r\n\
                 </Polygon>                                                                  \r\n\
                 <MultiPoint m:type='Edm.GeometryMultiPoint'>                                \r\n\
                   <gml:MultiPoint/>                                                         \r\n\
                 </MultiPoint>                                                               \r\n\
                 <MultiLineString m:type='Edm.GeometryMultiLineString'>                      \r\n\
                   <gml:MultiCurve/>                                                         \r\n\
                 </MultiLineString>                                                          \r\n\
                 <MultiPolygon m:type='Edm.GeometryMultiPolygon'>                            \r\n\
                   <gml:MultiSurface/>                                                       \r\n\
                 </MultiPolygon>                                                             \r\n\
                 <Collection m:type='Edm.GeometryCollection'>                                \r\n\
                   <gml:MultiGeometry/>                                                      \r\n\
                 </Collection>                                                               \r\n\
                 <Geometry m:type='Edm.Geometry'>                                            \r\n\
                   <gml:Point/>                                                              \r\n\
                 </Geometry>                                                                 \r\n\
               </m:properties>                                                               \r\n\
              </content>                                                                     \r\n\
            </entry>";

        var entry = {
            __metadata: {
                properties: {
                    Point: { type: "Edm.GeometryPoint", extensions: [] },
                    LineString: { type: "Edm.GeometryLineString", extensions: [] },
                    Polygon: { type: "Edm.GeometryPolygon", extensions: [] },
                    MultiPoint: { type: "Edm.GeometryMultiPoint", extensions: [] },
                    MultiLineString: { type: "Edm.GeometryMultiLineString", extensions: [] },
                    MultiPolygon: { type: "Edm.GeometryMultiPolygon", extensions: [] },
                    Collection: { type: "Edm.GeometryCollection", extensions: [] },
                    Geometry: { type: "Edm.Geometry", extensions: [] }
                }
            },
            Point: {
                __metadata: { type: "Edm.GeometryPoint" },
                type: "Point",
                coordinates: []
            },
            LineString: {
                __metadata: { type: "Edm.GeometryLineString" },
                type: "LineString",
                coordinates: []
            },
            Polygon: {
                __metadata: { type: "Edm.GeometryPolygon" },
                type: "Polygon",
                coordinates: []
            },
            MultiPoint: {
                __metadata: { type: "Edm.GeometryMultiPoint" },
                type: "MultiPoint",
                coordinates: []
            },
            MultiLineString: {
                __metadata: { type: "Edm.GeometryMultiLineString" },
                type: "MultiLineString",
                coordinates: []
            },
            MultiPolygon: {
                __metadata: { type: "Edm.GeometryMultiPolygon" },
                type: "MultiPolygon",
                coordinates: []
            },
            Collection: {
                __metadata: { type: "Edm.GeometryCollection" },
                type: "GeometryCollection",
                geometries: []
            },
            Geometry: {
                __metadata: { type: "Edm.Geometry" },
                type: "Point",
                coordinates: []
            }
        };

        var response = { headers: { "Content-Type": "application/atom+xml" }, body: entryXml };

        OData.atomHandler.read(response);
        djstest.assertAreEqualDeep(response.data, entry, "Entry was read successfully");
        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryGeographyProperties() {
        var entryXml =
            "<entry                                                                          \r\n\
               xmlns:m='http://schemas.microsoft.com/ado/2007/08/dataservices/metadata'      \r\n\
               xmlns='http://www.w3.org/2005/Atom'>                                          \r\n\
               <content type='application/xml'>                                              \r\n\
                <m:properties xmlns='http://schemas.microsoft.com/ado/2007/08/dataservices'  \r\n\
                             xmlns:gml='http://www.opengis.net/gml'>                         \r\n\
                 <Point m:type='Edm.GeographyPoint'>                                         \r\n\
                   <gml:Point>                                                               \r\n\
                      <gml:pos>1 2 3 4</gml:pos>                                             \r\n\
                   </gml:Point>                                                              \r\n\
                 </Point>                                                                    \r\n\
                 <LineString m:type='Edm.GeographyLineString'>                               \r\n\
                   <gml:LineString>                                                          \r\n\
                     <gml:pos>5 6 7</gml:pos>                                                \r\n\
                     <gml:pos>8 9 10</gml:pos>                                               \r\n\
                   </gml:LineString>                                                         \r\n\
                 </LineString>                                                               \r\n\
                 <Polygon m:type='Edm.GeographyPolygon'>                                     \r\n\
                   <gml:Polygon>                                                             \r\n\
                     <gml:exterior>                                                          \r\n\
                       <gml:LinearRing>                                                      \r\n\
                         <gml:pos>9 10</gml:pos>                                             \r\n\
                       </gml:LinearRing>                                                     \r\n\
                     </gml:exterior>                                                         \r\n\
                     <gml:interior>                                                          \r\n\
                       <gml:LinearRing>                                                      \r\n\
                         <gml:pos>11 12</gml:pos>                                            \r\n\
                       </gml:LinearRing>                                                     \r\n\
                     </gml:interior>                                                         \r\n\
                   </gml:Polygon>                                                            \r\n\
                 </Polygon>                                                                  \r\n\
                 <MultiPoint m:type='Edm.GeographyMultiPoint'>                               \r\n\
                   <gml:MultiPoint>                                                          \r\n\
                     <gml:pointMember>                                                       \r\n\
                       <gml:Point>                                                           \r\n\
                          <gml:pos>13 14</gml:pos>                                           \r\n\
                       </gml:Point>                                                          \r\n\
                     </gml:pointMember>                                                      \r\n\
                   </gml:MultiPoint>                                                         \r\n\
                 </MultiPoint>                                                               \r\n\
                 <MultiLineString m:type='Edm.GeographyMultiLineString'>                     \r\n\
                   <gml:MultiCurve>                                                          \r\n\
                     <gml:curveMember>                                                       \r\n\
                       <gml:LineString>                                                      \r\n\
                         <gml:posList>15 16 17 18</gml:posList>                              \r\n\
                       </gml:LineString>                                                     \r\n\
                     </gml:curveMember>                                                      \r\n\
                   </gml:MultiCurve>                                                         \r\n\
                 </MultiLineString>                                                          \r\n\
                 <MultiPolygon m:type='Edm.GeographyMultiPolygon'>                           \r\n\
                   <gml:MultiSurface>                                                        \r\n\
                     <gml:surfaceMember>                                                     \r\n\
                       <gml:Polygon>                                                         \r\n\
                         <gml:exterior>                                                      \r\n\
                           <gml:LinearRing>                                                  \r\n\
                             <gml:pos>17 18</gml:pos>                                        \r\n\
                           </gml:LinearRing>                                                 \r\n\
                         </gml:exterior>                                                     \r\n\
                         <gml:interior>                                                      \r\n\
                           <gml:LinearRing>                                                  \r\n\
                             <gml:pos>19 20</gml:pos>                                        \r\n\
                           </gml:LinearRing>                                                 \r\n\
                         </gml:interior>                                                     \r\n\
                       </gml:Polygon>                                                        \r\n\
                     </gml:surfaceMember>                                                    \r\n\
                   </gml:MultiSurface>                                                       \r\n\
                 </MultiPolygon>                                                             \r\n\
                 <Collection m:type='Edm.GeographyCollection'>                               \r\n\
                   <gml:MultiGeometry>                                                       \r\n\
                     <gml:geometryMember>                                                    \r\n\
                        <gml:MultiGeometry>                                                  \r\n\
                           <gml:geometryMember>                                              \r\n\
                             <gml:Point>                                                     \r\n\
                               <gml:pos>21 22</gml:pos>                                      \r\n\
                             </gml:Point>                                                    \r\n\
                           </gml:geometryMember>                                             \r\n\
                        </gml:MultiGeometry>                                                 \r\n\
                     </gml:geometryMember>                                                   \r\n\
                     <gml:geometryMembers>                                                   \r\n\
                        <gml:MultiGeometry>                                                  \r\n\
                           <gml:geometryMember>                                              \r\n\
                             <gml:MultiGeometry>                                             \r\n\
                               <gml:geometryMember>                                          \r\n\
                                 <gml:Point>                                                 \r\n\
                                   <gml:pos>23 24</gml:pos>                                  \r\n\
                                 </gml:Point>                                                \r\n\
                               </gml:geometryMember>                                         \r\n\
                             </gml:MultiGeometry>                                            \r\n\
                           </gml:geometryMember>                                             \r\n\
                        </gml:MultiGeometry>                                                 \r\n\
                     </gml:geometryMembers>                                                  \r\n\
                   </gml:MultiGeometry>                                                      \r\n\
                 </Collection>                                                               \r\n\
                 <Geography m:type='Edm.Geography'>                                          \r\n\
                   <gml:Point>                                                               \r\n\
                     <gml:pos>25 26</gml:pos>                                                \r\n\
                   </gml:Point>                                                              \r\n\
                 </Geography>                                                                \r\n\
               </m:properties>                                                               \r\n\
              </content>                                                                     \r\n\
            </entry>";

        var entry = {
            __metadata: {
                properties: {
                    Point: { type: "Edm.GeographyPoint", extensions: [] },
                    LineString: { type: "Edm.GeographyLineString", extensions: [] },
                    Polygon: { type: "Edm.GeographyPolygon", extensions: [] },
                    MultiPoint: { type: "Edm.GeographyMultiPoint", extensions: [] },
                    MultiLineString: { type: "Edm.GeographyMultiLineString", extensions: [] },
                    MultiPolygon: { type: "Edm.GeographyMultiPolygon", extensions: [] },
                    Collection: { type: "Edm.GeographyCollection", extensions: [] },
                    Geography: { type: "Edm.Geography", extensions: [] }
                }
            },
            Point: {
                __metadata: { type: "Edm.GeographyPoint" },
                type: "Point",
                coordinates: [2, 1, 3, 4]
            },
            LineString: {
                __metadata: { type: "Edm.GeographyLineString" },
                type: "LineString",
                coordinates: [[6, 5, 7], [9, 8, 10]]
            },
            Polygon: {
                __metadata: { type: "Edm.GeographyPolygon" },
                type: "Polygon",
                coordinates: [[[10, 9]], [[12, 11]]]
            },
            MultiPoint: {
                __metadata: { type: "Edm.GeographyMultiPoint" },
                type: "MultiPoint",
                coordinates: [[14, 13]]
            },
            MultiLineString: {
                __metadata: { type: "Edm.GeographyMultiLineString" },
                type: "MultiLineString",
                coordinates: [[[16, 15], [18, 17]]]
            },
            MultiPolygon: {
                __metadata: { type: "Edm.GeographyMultiPolygon" },
                type: "MultiPolygon",
                coordinates: [[[[18, 17]], [[20, 19]]]]
            },
            Collection: {
                __metadata: { type: "Edm.GeographyCollection" },
                type: "GeometryCollection",
                geometries: [
                    {
                        type: "GeometryCollection",
                        geometries: [
                            {
                                type: "Point",
                                coordinates: [22, 21]
                            }
                        ]
                    },
                    {
                        type: "GeometryCollection",
                        geometries: [
                            {
                                type: "GeometryCollection",
                                geometries: [
                                    {
                                        type: "Point",
                                        coordinates: [24, 23]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            Geography: {
                __metadata: { type: "Edm.Geography" },
                type: "Point",
                coordinates: [26, 25]
            }
        };

        var response = { headers: { "Content-Type": "application/atom+xml" }, body: entryXml };

        OData.atomHandler.read(response);
        djstest.assertAreEqualDeep(response.data, entry, "Entry was read successfully");
        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryMediaLinkEntryTest() {
        var entryString = "\
        <entry xml:base=\'http://services.odata.org/OData/OData.svc/\' \r\n\
               xmlns:m=\'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\' \r\n\
               xmlns:atom=\'http://www.w3.org/2005/Atom\' \r\n\
               xmlns:app=\'http://www.w3.org/2007/app\' \r\n\
               xmlns=\'http://www.w3.org/2005/Atom\'> \r\n\
           <id>the id</id> \r\n\
           <link m:etag=\'etag\' rel=\'edit-media\' href=\'http://editmediauri\' /> \r\n\
           <content type=\'application/png\' src=\'mediaSource/source.png' /> \r\n\
           <m:properties xmlns=\'http://schemas.microsoft.com/ado/2007/08/dataservices\'>\r\n\
             <Untyped>untyped value</Untyped> \r\n\
             <Typed m:type='Edm.Int32'>100</Typed> \r\n\
           </m:properties> \r\n\
        </entry>\r\n";

        var expectedEntry = {
            __metadata: {
                uri: "http://services.odata.org/OData/OData.svc/the id",
                uri_extensions: [],
                media_src: "http://services.odata.org/OData/OData.svc/mediaSource/source.png",
                content_type: "application/png",
                edit_media: "http://editmediauri",
                edit_media_extensions: [],
                media_etag: "etag",
                properties: {
                    Untyped: {
                        type: "Edm.String",
                        extensions: []
                    },
                    Typed: {
                        type: "Edm.Int32",
                        extensions: []
                    }
                }
            },
            Untyped: "untyped value",
            Typed: 100
        };

        var entry = OData.atomReadEntry(datajs.xmlParse(entryString).documentElement);

        djstest.assert(entry, "atomReadFeed didn't return an entry object for the media link entry payload");
        djstest.assertAreEqualDeep(entry, expectedEntry);
        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryTypeTest() {
        var categoryString = "\
        <category term=\'the type\' \r\n\
                  scheme=\'http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\' \r\n\
                  attr1=\'a1\' me:attr2=\'a2\' \r\n\
                  xmlns:me=\'http//:myExtensions\' \r\n\
                  xmlns=\'http://www.w3.org/2005/Atom\'/> \r\n";
        var entryMetadata = {};
        OData.atomReadEntryType(datajs.xmlParse(categoryString).documentElement, entryMetadata);

        djstest.assertAreEqual(entryMetadata.type, "the type", "atomReadEntryType, entry type has an unexpected value");
        djstest.assertAreEqual(entryMetadata.type_extensions.length, 2, "readATomEntryType, entry type_extensions doens't have the expected number of extensions");

        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryTypeIgnoresCategoryTest() {
        var categoryString = "\
        <category term=\'the type\' \r\n\
                  attr1=\'a1\' me:attr2=\'a2\' \r\n\
                  xmlns:me=\'http//:myExtensions\' \r\n\
                  xmlns=\'http://www.w3.org/2005/Atom\'/> \r\n";

        var entry = { __metadata: {} };
        OData.atomReadEntryType(datajs.xmlParse(categoryString).documentElement, entry, entry.__metadata);

        djstest.assert(!entry.__metadata.type, "atomReadEntryType, processed a category of without a scheme attribute!!");
        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryTypeThrowsWithMultipleCategoryTest() {
        var categoryString = "\
         <entry> \r\n\
            <category term=\'the type\' \r\n\
                      scheme=\'http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\' \r\n\
                      xmlns=\'http://www.w3.org/2005/Atom\'/> \r\n\
            <category term=\'the type\' \r\n\
                      scheme=\'http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\' \r\n\
                      xmlns=\'http://www.w3.org/2005/Atom\'/> \r\n\
         </entry> \r\n";

        var entry = { __metadata: {} };

        djstest.expectException(function () {
            var categories = datajs.xmlParse(categoryString).documentElement;
            datajs.xmlChildElements(categories, function (child) {
                OData.atomReadEntryType(child, entry, entry.__metadata);
            });
        }, "atomReadEntryType didn't throw the expected exception");

        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryContentThrowsWithNoTypeAttributeTest() {
        var contentString = "\
            <content src=\'http://mediasource\' xmlns=\'http://www.w3.org/2005/Atom\'/> \r\n"

        var entry = { __metadata: {} };
        var content = datajs.xmlParse(contentString).documentElement;
        djstest.expectException(function () {
            OData.atomReadEntryContent(content, entry);
        }, "atomReadEntryContent didn't throw the expected exception");

        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryContentThrowsWithSrcAndChildrenTest() {
        var contentString = "\
            <content type=\'applicaton/xml\' src=\'http://mediasource\' \r\n\
                     xmlns=\'http://www.w3.org/2005/Atom\' \r\n\
                     xmlns:m2=\'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\'> \r\n\
              <m2:properties xmlns=\'http://schemas.microsoft.com/ado/2007/08/dataservices\'>\r\n\
                <Untyped>untyped value</Untyped> \r\n\
                <Typed m2:type='Edm.Int32'>100</Typed> \r\n\
              </m2:properties> \r\n\
           </content> \r\n";

        var entry = { __metadata: {} };
        var content = datajs.xmlParse(contentString).documentElement;
        djstest.expectException(function () {
            OData.atomReadEntryContent(content, entry);
        }, "atomReadEntryContent didn't throw the expected exception");

        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryEditMediaLinkTest() {
        var linkString = "\
        <link m:etag=\'etag\' rel=\'edit-media\' href=\'http://editmediauri\' \r\n\
              attr1=\'a1\' me:attr2=\'a2\' \r\n\
              xmlns:me=\'http://myExtensions\' \r\n\
              xmlns:m=\'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\' \r\n\
              xmlns=\'http://www.w3.org/2005/Atom\'/> \r\n";

        var entry = { __metadata: {} };

        OData.atomReadEntryLink(datajs.xmlParse(linkString).documentElement, entry, entry.__metadata);

        djstest.assertAreEqual(entry.__metadata.edit_media, "http://editmediauri", "edit_media field has a un expected value");
        djstest.assertAreEqual(entry.__metadata.media_etag, "etag", "media_etag field has a un expected value");
        djstest.assertAreEqual(entry.__metadata.edit_media_extensions.length, 2, "edit_media_extensions doesn't have the expected number of extensions");
        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryLink() {
        var linksString = "\
        <entry xmlns=\'http://www.w3.org/2005/Atom\'> \r\n\
         <link rel=\'edit-media\' href=\'http://editmediauri\' />\r\n\
         <link rel=\'edit\' href=\'http://edituri\' />\r\n\
         <link rel=\'self\' href=\'http://selfuri\' />\r\n\
         <link rel=\'http://schemas.microsoft.com/ado/2007/08/dataservices/related/otherEntry\' \r\n\
               type=\'application/atom+xml;type=entry\' \r\n\
               href=\'http://otherEntryuri\' /> \r\n\
        </entry> \r\n";

        var expectedEntry = {
            __metadata: {
                edit: "http://edituri",
                edit_link_extensions: [],
                edit_media: "http://editmediauri",
                edit_media_extensions: [],
                self: "http://selfuri",
                self_link_extensions: [],
                properties: {
                    otherEntry: {
                        extensions: []
                    }
                }
            },
            otherEntry: {
                __deferred: { uri: "http://otherEntryuri" }
            }
        };

        var entry = { __metadata: {} };
        var links = datajs.xmlParse(linksString).documentElement;
        datajs.xmlChildElements(links, function (child) {
            OData.atomReadEntryLink(child, entry, entry.__metadata);
        });

        djstest.assertAreEqualDeep(entry, expectedEntry);
        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryNavigationPropertyTest() {
        var entryString = "\
        <entry xml:base='http://baseuri.org/' \r\n\
               xmlns='http://www.w3.org/2005/Atom' \r\n\
               xmlns:m='http://schemas.microsoft.com/ado/2007/08/dataservices/metadata' \r\n\
               xmlns:me='http://myextensions'> \r\n\
          <link rel='http://schemas.microsoft.com/ado/2007/08/dataservices/related/deferred' \r\n\
                type='application/atom+xml;type=entry' \r\n\
                href='entry/deferred' /> \r\n\
          <link rel='http://schemas.microsoft.com/ado/2007/08/dataservices/relatedlinks/deferred' \r\n\
                type='application/xml' \r\n\
                href='entry/deferred/$links' \r\n\
                me:ext1='value1' /> \r\n\
          <link rel='http://schemas.microsoft.com/ado/2007/08/dataservices/related/inline' \r\n\
                type='application/atom+xml;type=feed' \r\n\
                href='http://inline' > \r\n\
            <m:inline> \r\n\
                <feed xml:base='http://services.odata.org/OData/OData.svc/' \r\n\
                      xmlns:app='http://www.w3.org/2007/app' \r\n\
                      xmlns:m='http://schemas.microsoft.com/ado/2007/08/dataservices/metadata' \r\n\
                      xmlns='http://www.w3.org/2005/Atom'> \r\n\
                  <id>feed id</id> \r\n\
                  <title>test feed</title> \r\n\
                </feed> \r\n\
           </m:inline> \r\n\
         </link> \r\n\
          <content type='application/xml'> \r\n\
           <m:properties xmlns='http://schemas.microsoft.com/ado/2007/08/dataservices'>\r\n\
               <Typed m:type='Edm.Int32'>100</Typed> \r\n\
           </m:properties> \r\n\
         </content> \r\n\
       </entry> \r\n";

        var expectedEntry = {
            __metadata: {
                properties: {
                    deferred: {
                        associationuri: "http://baseuri.org/entry/deferred/$links",
                        associationuri_extensions: [{ name: "ext1", namespaceURI: "http://myextensions", value: "value1"}],
                        extensions: []
                    },
                    inline: {
                        extensions: []
                    },
                    Typed: {
                        type: "Edm.Int32",
                        extensions: []
                    }
                }
            },
            deferred: {
                __deferred: { uri: "http://baseuri.org/entry/deferred" }
            },
            inline: {
                __metadata: {
                    uri: "http://services.odata.org/OData/OData.svc/feed id",
                    uri_extensions: [],
                    title: "test feed",
                    title_extensions: [],
                    feed_extensions: []
                },
                results: []
            },
            Typed: 100
        };

        var entry = OData.atomReadEntry(datajs.xmlParse(entryString).documentElement);

        djstest.assertAreEqualDeep(entry, expectedEntry);
        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryStructuralObjectTest() {
        var content = "\
           <d:Data m:type = \"Data\" \r\n \
                      xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" \r\n \
                      xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\">\r\n \
               <d:Complex m:type=\"Complex\">\r\n \
                   <d:Property1>value 1</d:Property1>\r\n \
                   <d:Property2>value 2</d:Property2> \r\n \
                   <d:Nested m:type=\"Complex.Nested\">\r\n \
                       <d:NestedProperty1>value 3</d:NestedProperty1> \r\n \
                       <d:NestedProperty2>value 4</d:NestedProperty2> \r\n \
                       <d:NestedProperty3>value 5</d:NestedProperty3> \r\n \
                   </d:Nested>\r\n \
               </d:Complex>\r\n \
           </d:Data>\r\n";

        var dataElement = datajs.xmlParse(content).documentElement;
        var data = {};
        var metadata = {};

        OData.atomReadEntryStructuralObject(dataElement, data, metadata);

        var expectedData = {
            Complex: {
                __metadata: { type: "Complex" },
                Property1: "value 1",
                Property2: "value 2",
                Nested: {
                    __metadata: { type: "Complex.Nested" },
                    NestedProperty1: "value 3",
                    NestedProperty2: "value 4",
                    NestedProperty3: "value 5"
                }
            }
        };

        var expectedMetadata = {
            properties: {
                Complex: {
                    type: "Complex",
                    extensions: [],
                    properties: {
                        Property1: { type: "Edm.String", extensions: [] },
                        Property2: { type: "Edm.String", extensions: [] },
                        Nested: {
                            type: "Complex.Nested",
                            extensions: [],
                            properties: {
                                NestedProperty1: { type: "Edm.String", extensions: [] },
                                NestedProperty2: { type: "Edm.String", extensions: [] },
                                NestedProperty3: { type: "Edm.String", extensions: [] }
                            }
                        }
                    }
                }
            }
        };

        djstest.assertAreEqualDeep(data, expectedData, "atomReadEntryComplexProperty didn't returned the expected data for a complex property");
        djstest.assertAreEqualDeep(metadata, expectedMetadata, "atomReadEntryComplexProperty didn't returned the expected metadata for a complex property");
        djstest.done();
    });

    djstest.addFullTest(true, function atomReadEntryWithComplexTypePropertiesTest() {
        var entryString = "\
        <entry xml:base=\'http://services.odata.org/OData/OData.svc/\' \r\n\
               xmlns:m2=\'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\' \r\n\
               xmlns:atom=\'http://www.w3.org/2005/Atom\' \r\n\
               xmlns:app=\'http://www.w3.org/2007/app\' \r\n\
               xmlns=\'http://www.w3.org/2005/Atom\'> \r\n\
           <id>the id</id> \r\n\
           <category term=\'the type\' \r\n\
                     scheme=\'http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\' /> \r\n\
           <content type=\'application/xml\'> \r\n\
            <m2:properties xmlns=\'http://schemas.microsoft.com/ado/2007/08/dataservices\'>\r\n\
              <Untyped>untyped value</Untyped> \r\n\
              <Typed m2:type='Edm.Int32'>100</Typed> \r\n\
              <Complex m2:type=\"Complex\">\r\n \
                   <Property1>value 1</Property1>\r\n \
                   <Property2>value 2</Property2> \r\n \
                   <Nested m2:type=\"Complex.Nested\">\r\n \
                       <NestedProperty1>value 3</NestedProperty1> \r\n \
                       <NestedProperty2>value 4</NestedProperty2> \r\n \
                       <NestedProperty3>value 5</NestedProperty3> \r\n \
                   </Nested>\r\n \
               </Complex>\r\n \
               <UntypedComplex>\r\n\
                   <P1>value 3</P1>\r\n\
               </UntypedComplex>\r\n\
           </m2:properties> \r\n\
          </content> \r\n\
         <link rel=\'self\' href=\'http://selfuri\' /> \r\n\
        </entry>\r\n";

        var expectedEntry = {
            __metadata: {
                uri: "http://services.odata.org/OData/OData.svc/the id",
                uri_extensions: [],
                type: "the type",
                type_extensions: [],
                self: "http://selfuri",
                self_link_extensions: [],
                properties: {
                    Untyped: {
                        type: "Edm.String",
                        extensions: []
                    },
                    Typed: {
                        type: "Edm.Int32",
                        extensions: []
                    },
                    Complex: {
                        type: "Complex",
                        extensions: [],
                        properties: {
                            Property1: { type: "Edm.String", extensions: [] },
                            Property2: { type: "Edm.String", extensions: [] },
                            Nested: {
                                type: "Complex.Nested",
                                extensions: [],
                                properties: {
                                    NestedProperty1: { type: "Edm.String", extensions: [] },
                                    NestedProperty2: { type: "Edm.String", extensions: [] },
                                    NestedProperty3: { type: "Edm.String", extensions: [] }
                                }
                            }
                        }
                    },
                    UntypedComplex: {
                        type: null,
                        extensions: [],
                        properties: {
                            P1: { type: "Edm.String", extensions: [] }
                        }
                    }
                }
            },
            Untyped: "untyped value",
            Typed: 100,
            Complex: {
                __metadata: { type: "Complex" },
                Property1: "value 1",
                Property2: "value 2",
                Nested: {
                    __metadata: { type: "Complex.Nested" },
                    NestedProperty1: "value 3",
                    NestedProperty2: "value 4",
                    NestedProperty3: "value 5"
                }
            },
            UntypedComplex: {
                __metadata: { type: null },
                P1: "value 3"
            }
        };

        var entry = OData.atomReadEntry(datajs.xmlParse(entryString).documentElement);

        djstest.assert(entry, "atomReadEntry didn't return an entry object");
        djstest.assertAreEqualDeep(entry, expectedEntry, "atomReadEntry didn't return the expected entry object");
        djstest.done();
    });


    djstest.addFullTest(true, function atomReadEntryWithActionsAndFunctionsTest() {
        var entryString = "\
        <entry xml:base='http://services.odata.org/OData/OData.svc/' \r\n\
               xmlns:m='http://schemas.microsoft.com/ado/2007/08/dataservices/metadata' \r\n\
               xmlns:me='http://myExtensions' \r\n\
               xmlns:atom='http://www.w3.org/2005/Atom' \r\n\
               xmlns:app='http://www.w3.org/2007/app' \r\n\
               xmlns='http://www.w3.org/2005/Atom'> \r\n\
           <id>the id</id> \r\n\
           <category term='the type' scheme='http://schemas.microsoft.com/ado/2007/08/dataservices/scheme' /> \r\n\
           <content type='application/xml' /> \r\n\
           <m:action metadata='#EntityContainer.Action1' title='Action1' target='http://service/entities(0)/action' /> \r\n\
           <m:action metadata='#EntityContainer.Action2' title='Action2' target='entities(0)/action2' /> \r\n\
           <m:action metadata='http://someService/$metadata#Container.Action1' title='Action1' target='http://someService/action' /> \r\n\
           <m:function metadata='#EntityContainer.Function1' title='Function1' target='http://service/entities(0)/function' /> \r\n\
           <m:function metadata='#EntityContainer.Function2' title='Function2' target='entities(0)/function2' /> \r\n\
           <m:function metadata='http://someService/$metadata#Container.Function1' title='Function1' target='http://someService/function' /> \r\n\
        </entry>\r\n";

        var expected = {
            __metadata: {
                uri: "http://services.odata.org/OData/OData.svc/the id",
                uri_extensions: [],
                type: "the type",
                type_extensions: [],
                actions: [
                    {
                        metadata: "#EntityContainer.Action1",
                        title: "Action1",
                        target: "http://service/entities(0)/action",
                        extensions: []
                    },
                    {
                        metadata: "#EntityContainer.Action2",
                        title: "Action2",
                        target: "http://services.odata.org/OData/OData.svc/entities(0)/action2",
                        extensions: []
                    },
                    {
                        metadata: "http://someService/$metadata#Container.Action1",
                        title: "Action1",
                        target: "http://someService/action",
                        extensions: []
                    }
                ],
                functions: [
                    {
                        metadata: "#EntityContainer.Function1",
                        title: "Function1",
                        target: "http://service/entities(0)/function",
                        extensions: []
                    },
                    {
                        metadata: "#EntityContainer.Function2",
                        title: "Function2",
                        target: "http://services.odata.org/OData/OData.svc/entities(0)/function2",
                        extensions: []
                    },
                    {
                        metadata: "http://someService/$metadata#Container.Function1",
                        title: "Function1",
                        target: "http://someService/function",
                        extensions: []
                    }
                ]
            }
        };

            var response = { headers: { "Content-Type": "application/atom+xml", "OData-Version": "4.0" }, body: entryString };

        OData.atomHandler.read(response);
        djstest.assertAreEqualDeep(response.data, expected, "atomReadEntry didn't return the expected entry object");
        djstest.done();

    });

    djstest.addFullTest(true, function atomReadEntryWithNamedStreamsTest() {
        var entryString = "\
        <entry xml:base='http://services.odata.org/OData/OData.svc/' \r\n\
               xmlns:m2='http://schemas.microsoft.com/ado/2007/08/dataservices/metadata' \r\n\
               xmlns:me='http://myExtensions' \r\n\
               xmlns:atom='http://www.w3.org/2005/Atom' \r\n\
               xmlns:app='http://www.w3.org/2007/app' \r\n\
               xmlns='http://www.w3.org/2005/Atom'> \r\n\
           <id>the id</id> \r\n\
           <category term='the type' scheme='http://schemas.microsoft.com/ado/2007/08/dataservices/scheme' /> \r\n\
           <content type='application/xml' /> \r\n\
           <link rel='http://schemas.microsoft.com/ado/2007/08/dataservices/mediaresource/readonly' href='readonly' type='image/png' me:ext1='value1' /> \r\n\
           <link rel='http://schemas.microsoft.com/ado/2007/08/dataservices/mediaresource/readwrite' href='http://readwrite' type='image/gif' me:ext2='value2' /> \r\n\
           <link rel='http://schemas.microsoft.com/ado/2007/08/dataservices/edit-media/readwrite' href='http://readwrite/update' type='image/gif' m2:etag='etag0' me:ext3='value3' /> \r\n\
           <link rel='http://schemas.microsoft.com/ado/2007/08/dataservices/edit-media/writeonly' href='writeonly' type='image/jpeg' m2:etag='etag1' me:ext4='value4' /> \r\n\
        </entry>\r\n";

        var expected = {
            __metadata: {
                uri: "http://services.odata.org/OData/OData.svc/the id",
                uri_extensions: [],
                type: "the type",
                type_extensions: [],
                properties: {
                    readonly: {
                        media_src_extensions: [
                            { name: "ext1", namespaceURI: "http://myExtensions", value: "value1" }
                        ]
                    },
                    readwrite: {
                        media_src_extensions: [
                            { name: "ext2", namespaceURI: "http://myExtensions", value: "value2" }
                        ],
                        edit_media_extensions: [
                            { name: "ext3", namespaceURI: "http://myExtensions", value: "value3" }
                        ]
                    },
                    writeonly: {
                        media_src_extensions: [],
                        edit_media_extensions: [
                            { name: "ext4", namespaceURI: "http://myExtensions", value: "value4" }
                        ]
                    }
                }
            },
            readonly: {
                __mediaresource: {
                    media_src: "http://services.odata.org/OData/OData.svc/readonly",
                    content_type: "image/png"
                }
            },
            readwrite: {
                __mediaresource: {
                    media_src: "http://readwrite",
                    edit_media: "http://readwrite/update",
                    content_type: "image/gif",
                    media_etag: "etag0"
                }
            },
            writeonly: {
                __mediaresource: {
                    media_src: "http://services.odata.org/OData/OData.svc/writeonly",
                    edit_media: "http://services.odata.org/OData/OData.svc/writeonly",
                    content_type: "image/jpeg",
                    media_etag: "etag1"
                }
            }
        };

        var response = { headers: { "Content-Type": "application/atom+xml", "OData-Version": "4.0" }, body: entryString };

        OData.atomHandler.read(response);
        djstest.assertAreEqualDeep(response.data, expected, "atomReadEntry didn't return the expected entry object");
        djstest.done();
    });


    djstest.addFullTest(true, function atomReadEntryWithCollectionPropertiesTest() {
        var entryString = "\
        <entry xml:base='http://services.odata.org/OData/OData.svc/' \r\n\
               xmlns:m2='http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\' \r\n\
               xmlns:me=\'http://myExtensions' \r\n\
               xmlns:atom='http://www.w3.org/2005/Atom' \r\n\
               xmlns:app='http://www.w3.org/2007/app' \r\n\
               xmlns='http://www.w3.org/2005/Atom'> \r\n\
           <id>the id</id> \r\n\
           <category term='the type' \r\n\
                     scheme='http://schemas.microsoft.com/ado/2007/08/dataservices/scheme' /> \r\n\
           <content type='application/xml'> \r\n\
            <m2:properties xmlns='http://schemas.microsoft.com/ado/2007/08/dataservices'>\r\n\
              <Empty m2:type='Collection(Edm.Int32)' me:attr1='value1' /> \r\n\
              <Primitive m2:type='Collection(Edm.Int32)'> \r\n\
                  <element>50</element> \r\n\
                  <element me:attr2='value2'>100</element> \r\n\
              </Primitive>  \r\n\
              <Complex m2:type='Collection(ns.MyType)' me:attr3='value3'> \r\n\
                  <element me:attr4='value4'> \r\n\
                      <Property1>value 1</Property1> \r\n\
                      <Property2>value 2</Property2> \r\n\
                  </element> \r\n\
                  <element> \r\n\
                      <Property1>value 3</Property1> \r\n\
                      <Property2>value 4</Property2> \r\n\
                 </element> \r\n\
              </Complex> \r\n\
              <SingleTyped m2:type='Collection(Edm.Int32)'> \r\n\
                 <element>500</element> \r\n\
              </SingleTyped> \r\n\
              <SingleUntyped> \r\n\
                 <element>600</element> \r\n\
              </SingleUntyped> \r\n\
           </m2:properties> \r\n\
          </content> \r\n\
         <link rel=\'self\' href=\'http://selfuri\' /> \r\n\
        </entry>\r\n";

        var expectedEntry = {
            __metadata: {
                uri: "http://services.odata.org/OData/OData.svc/the id",
                uri_extensions: [],
                type: "the type",
                type_extensions: [],
                self: "http://selfuri",
                self_link_extensions: [],
                properties: {
                    Empty: {
                        type: "Collection(Edm.Int32)",
                        extensions: [
                            { name: "attr1", namespaceURI: "http://myExtensions", value: "value1" }
                        ],
                        elements: []
                    },
                    Primitive: {
                        type: "Collection(Edm.Int32)",
                        extensions: [],
                        elements: [
                            { type: "Edm.Int32", extensions: [] },
                            {
                                type: "Edm.Int32",
                                extensions: [
                                 { name: "attr2", namespaceURI: "http://myExtensions", value: "value2" }
                              ]
                            }
                        ]
                    },
                    Complex: {
                        type: "Collection(ns.MyType)",
                        extensions: [
                            { name: "attr3", namespaceURI: "http://myExtensions", value: "value3" }
                        ],
                        elements: [
                            {
                                type: "ns.MyType",
                                extensions: [
                                  { name: "attr4", namespaceURI: "http://myExtensions", value: "value4" }
                                ],
                                properties: {
                                    Property1: { type: "Edm.String", extensions: [] },
                                    Property2: { type: "Edm.String", extensions: [] }
                                }
                            },
                            {
                                type: "ns.MyType",
                                extensions: [],
                                properties: {
                                    Property1: { type: "Edm.String", extensions: [] },
                                    Property2: { type: "Edm.String", extensions: [] }
                                }
                            }
                        ]
                    },
                    SingleTyped: {
                        type: "Collection(Edm.Int32)",
                        extensions: [],
                        elements: [
                            {
                                type: "Edm.Int32",
                                extensions: []
                            }
                        ]
                    },
                    SingleUntyped: {
                        type: null,
                        extensions: [],
                        properties: {
                            element: {
                                type: "Edm.String",
                                extensions: []
                            }
                        }
                    }
                }
            },
            Empty: {
                __metadata: { type: "Collection(Edm.Int32)" },
                results: []
            },
            Primitive: {
                __metadata: { type: "Collection(Edm.Int32)" },
                results: [50, 100]
            },
            Complex: {
                __metadata: { type: "Collection(ns.MyType)" },
                results: [
                    {
                        __metadata: { type: "ns.MyType" },
                        Property1: "value 1",
                        Property2: "value 2"
                    },
                    {
                        __metadata: { type: "ns.MyType" },
                        Property1: "value 3",
                        Property2: "value 4"
                    }
                ]
            },
            SingleTyped: {
                __metadata: { type: "Collection(Edm.Int32)" },
                results: [500]
            },
            SingleUntyped: {
                __metadata: { type: null },
                element: "600"
            }
        };

        // Todo refactor all this tests to use the mock http client instead. 
        var entry = OData.atomReadEntry(datajs.xmlParse(entryString).documentElement);

        djstest.assert(entry, "atomReadEntry didn't return an entry object");
        djstest.assertAreEqualDeep(entry, expectedEntry, "atomReadEntry didn't return the expected entry object");
        djstest.done();
    });

    djstest.addFullTest(true, function atomSerializeFeedTest() {
        var feed = {
            __metadata: {
                feed_extensions: []
            },
            results: [
                { __metadata: {
                    uri: "http://services.odata.org/OData/OData.svc/entry id",
                    uri_extensions: [],
                    type: "the type",
                    type_extensions: [],
                    properties: {
                        Untyped: {
                            type: "Edm.String",
                            extensions: []
                        },
                        Typed: {
                            type: "Edm.Int32",
                            extensions: []
                        }
                    }
                },
                    Untyped: "untyped value",
                    Typed: 100
                }
           ]
        };

        var feedXml = OData.atomSerializer(OData.atomHandler, feed, {});

        window.ODataReadOracle.readFeedLoopback(feedXml,
                function (expectedData) {
                    djstest.assertAreEqualDeep(feed, expectedData, "Response data not same as expected");
                    djstest.done();
                });
    });

    djstest.addFullTest(true, function atomSerializeEntryTest() {
        var entry = {
            __metadata: {
                uri: "http://services.odata.org/OData/OData.svc/entry id",
                uri_extensions: [],
                type: "the type",
                type_extensions: [],
                properties: {
                    Untyped: {
                        type: "Edm.String",
                        extensions: []
                    },
                    Typed: {
                        type: "Edm.Int32",
                        extensions: []
                    }
                }
            },
            Untyped: "untyped value",
            Typed: 100
        };

        var entryXml = OData.atomSerializer(OData.atomHandler, entry, {});

        window.ODataReadOracle.readEntryLoopback(entryXml,
        function (expectedData) {
            djstest.assertAreEqualDeep(entry, expectedData, "Response data not same as expected");
            djstest.done();
        });
    });

    djstest.addFullTest(true, function atomSerializeEntryWithNamedStreamsTest() {
        var entry = {
            __metadata: {
                uri: "http://services.odata.org/OData/OData.svc/entry id",
                uri_extensions: [],
                type: "the type",
                type_extensions: [],
                properties: {
                    readonly: {
                        media_src_extensions: [
                            { name: "ext1", namespaceURI: "http://myExtensions", value: "value1" }
                        ]
                    },
                    readwrite: {
                        media_src_extensions: [
                            { name: "ext2", namespaceURI: "http://myExtensions", value: "value2" }
                        ],
                        edit_media_extensions: [
                            { name: "ext3", namespaceURI: "http://myExtensions", value: "value3" }
                        ]
                    },
                    writeonly: {
                        media_src_extensions: [],
                        edit_media_extensions: [
                            { name: "ext4", namespaceURI: "http://myExtensions", value: "value4" }
                        ]
                    }
                }
            },
            readonly: {
                __mediaresource: {
                    media_src: "http://services.odata.org/OData/OData.svc/readonly",
                    content_type: "image/png"
                }
            },
            readwrite: {
                __mediaresource: {
                    media_src: "http://readwrite",
                    edit_media: "http://readwrite/update",
                    content_type: "image/gif",
                    media_etag: "etag0"
                }
            },
            writeonly: {
                __mediaresource: {
                    media_src: "http://services.odata.org/OData/OData.svc/writeonly",
                    edit_media: "http://services.odata.org/OData/OData.svc/writeonly",
                    content_type: "image/jpeg",
                    media_etag: "etag1"
                }
            },
            complexAsNamedStream1: {
                __metadata: {},
                __mediaresource: {
                    media_src: "http://services.odata.org/OData/OData.svc/readonly",
                    content_type: "image/png"
                }
            },
            complexAsNamedStream2: {
                __mediaresource: {
                    p1: 500
                }
            }
        };

        var expectedEntry = {
            __metadata: {
                uri: "http://services.odata.org/OData/OData.svc/entry id",
                uri_extensions: [],
                type: "the type",
                type_extensions: [],
                properties: {
                    complexAsNamedStream1: {
                        type: null,
                        extensions: [],
                        properties: {
                            __mediaresource: {
                                type: null,
                                extensions: [],
                                properties: {
                                    content_type: {
                                        extensions: [],
                                        type: "Edm.String"
                                    },
                                    media_src: {
                                        extensions: [],
                                        type: "Edm.String"
                                    }
                                }
                            }
                        }
                    },
                    complexAsNamedStream2: {
                        type: null,
                        extensions: [],
                        properties: {
                            __mediaresource: {
                                type: null,
                                extensions: [],
                                properties: {
                                    p1: {
                                        type: "Edm.String",
                                        extensions: []
                                    }
                                }
                            }
                        }
                    }
                }
            },
            complexAsNamedStream1: {
                __metadata: { type: null },
                __mediaresource: {
                    __metadata: { type: null },
                    media_src: "http://services.odata.org/OData/OData.svc/readonly",
                    content_type: "image/png"
                }
            },
            complexAsNamedStream2: {
                __metadata: { type: null },
                __mediaresource: {
                    __metadata: { type: null },
                    p1: "500"
                }
            }
        };

        var request = { headers: {}, data: entry };
        OData.atomHandler.write(request);

        window.ODataReadOracle.readEntryLoopback(request.body,
        function (expectedData) {
            djstest.assertAreEqualDeep(expectedData, expectedEntry, "Response data not same as expected");
            djstest.done();
        });
    });

    djstest.addFullTest(true, function atomSerializeComplexEntryTest() {
        var entry = {
            __metadata: {
                uri: "http://services.odata.org/OData/OData.svc/entry id",
                uri_extensions: [],
                type: "the type",
                type_extensions: [],
                properties: {
                    Untyped: {
                        type: "Edm.String",
                        extensions: []
                    },
                    Typed: {
                        type: "Edm.Int32",
                        extensions: []
                    },
                    Complex: {
                        type: "Complex",
                        extensions: [],
                        properties: {
                            Property1: { type: "Edm.String", extensions: [] },
                            Property2: { type: "Edm.String", extensions: [] },
                            Nested: {
                                type: "Complex.Nested",
                                extensions: [],
                                properties: {
                                    NestedProperty1: { type: "Edm.String", extensions: [] },
                                    NestedProperty2: { type: "Edm.String", extensions: [] },
                                    NestedProperty3: { type: "Edm.String", extensions: [] }
                                }
                            }
                        }
                    }
                }
            },
            Untyped: "untyped value",
            Typed: 100,
            Complex: {
                __metadata: { type: "Complex" },
                Property1: "value 1",
                Property2: "value 2",
                Nested: {
                    __metadata: { type: "Complex.Nested" },
                    NestedProperty1: "value 3",
                    NestedProperty2: "value 4",
                    NestedProperty3: "value 5"
                }
            }
        };

        var entryXml = OData.atomSerializer(OData.atomHandler, entry, {});

        window.ODataReadOracle.readEntryLoopback(entryXml,
        function (expectedData) {
            djstest.assertAreEqualDeep(entry, expectedData, "Response data not same as expected");
            djstest.done();
        });
    });

    djstest.addFullTest(true, function atomSerializeInlinedDeferredEntryTest() {
        var entry = {
            __metadata: {
                uri: "http://services.odata.org/OData/OData.svc/entry id",
                uri_extensions: [],
                type: "the type",
                type_extensions: [],

                properties: {
                    deferred: {
                        //the test oracle service always adds the title extension to the link
                        extensions: [
                           {
                               name: "title",
                               namespaceURI: null,
                               value: null
                           }
                        ]
                    },
                    inline: {
                        extensions: [
                        {
                            name: "title",
                            namespaceURI: null,
                            value: null
                        }]
                    }
                }
            },
            deferred: {
                __deferred: { uri: "http://deferred/" }
            },
            inline: {
                __metadata: {
                    uri: "http://services.odata.org/OData/OData.svc/entry id",
                    uri_extensions: [],
                    type: "the type",
                    type_extensions: [],
                    properties: {
                        Untyped: {
                            type: "Edm.String",
                            extensions: []
                        },
                        Typed: {
                            type: "Edm.Int32",
                            extensions: []
                        }
                    }
                },
                Untyped: "untyped value",
                Typed: 100
            }
        };

        var entryXml = OData.atomSerializer(OData.atomHandler, entry, {});

        window.ODataReadOracle.readEntryLoopback(entryXml,
        function (expectedData) {
            djstest.assertAreEqualDeep(entry, expectedData, "Response data not same as expected");
            djstest.done();
        });
    });

    djstest.addFullTest(true, function atomSerializeJsObjectTest() {
        var entryData = {
            Color: 0x0000ff,
            Height: 500,
            Width: 100
        };

        var entry = {
            __metadata: {
                properties: {
                    Color: {
                        type: "Edm.String",
                        extensions: []
                    },
                    Width: {
                        type: "Edm.String",
                        extensions: []
                    },
                    Height: {
                        type: "Edm.String",
                        extensions: []
                    }
                }
            },
            Color: "255",
            Height: "500",
            Width: "100"
        };

        var entryXml = OData.atomSerializer(OData.atomHandler, entryData, {});

        window.ODataReadOracle.readEntryLoopback(entryXml,
        function (data) {
            djstest.assertAreEqualDeep(entry, data, "Response data not same as expected");
            djstest.done();
        });
    });

    djstest.addFullTest(true, function atomSerializePrimitiveTypesTest() {
        // Currently DateTime, Time and DateTimeOffset primitive types are not being covered.
        // DateTimeOffset and Time are not covered because they aren't supported by current WCF DataServices implementations.
        // DateTime follow non standard ways of being represented in JSON streams.

        var testEntry = {
            __metadata: {
                properties: {
                    Binary: {
                        type: "Edm.Binary",
                        extensions: []
                    },
                    Boolean: {
                        type: "Edm.Boolean",
                        extensions: []
                    },
                    Byte: {
                        type: "Edm.Byte",
                        extensions: []
                    },
                    Decimal: {
                        type: "Edm.Decimal",
                        extensions: []
                    },
                    Guid: {
                        type: "Edm.Guid",
                        extensions: []
                    },
                    Double: {
                        type: "Edm.Double",
                        extensions: []
                    },
                    Single: {
                        type: "Edm.Single",
                        extensions: []
                    },
                    Int16: {
                        type: "Edm.Int16",
                        extensions: []
                    },
                    Int32: {
                        type: "Edm.Int32",
                        extensions: []
                    },
                    Int64: {
                        type: "Edm.Int64",
                        extensions: []
                    },
                    SByte: {
                        type: "Edm.SByte",
                        extensions: []
                    }
                }
            },
            Binary: "01007A8A680D9E14A64EAC1242DD33C9DB05",
            Boolean: false,
            UntypedBoolean: "true",
            Byte: 0xf0,
            Decimal: "100.0",
            Guid: "12345678-aaaa-bbbb-cccc-ddddeeeeffff",
            Double: 1E+10,
            Single: 100.01,
            Int16: 16,
            Int32: 32,
            Int64: "64",
            SByte: -8
        };

        var expectedEntry = {
            __metadata: {
                properties: {
                    Binary: {
                        type: "Edm.Binary",
                        extensions: []
                    },
                    Boolean: {
                        type: "Edm.Boolean",
                        extensions: []
                    },
                    UntypedBoolean: {
                        type: "Edm.String",
                        extensions: []
                    },
                    Byte: {
                        type: "Edm.Byte",
                        extensions: []
                    },
                    Decimal: {
                        type: "Edm.Decimal",
                        extensions: []
                    },
                    Guid: {
                        type: "Edm.Guid",
                        extensions: []
                    },
                    Double: {
                        type: "Edm.Double",
                        extensions: []
                    },
                    Single: {
                        type: "Edm.Single",
                        extensions: []
                    },
                    Int16: {
                        type: "Edm.Int16",
                        extensions: []
                    },
                    Int32: {
                        type: "Edm.Int32",
                        extensions: []
                    },
                    Int64: {
                        type: "Edm.Int64",
                        extensions: []
                    },
                    SByte: {
                        type: "Edm.SByte",
                        extensions: []
                    }
                }
            },
            Binary: "01007A8A680D9E14A64EAC1242DD33C9DB05",
            Boolean: false,
            UntypedBoolean: "true",
            Byte: 0xf0,
            Decimal: "100.0",
            Guid: "12345678-aaaa-bbbb-cccc-ddddeeeeffff",
            Double: 1E+10,
            Single: 100.01,
            Int16: 16,
            Int32: 32,
            Int64: "64",
            SByte: -8
        };

        var entryXml = OData.atomSerializer(OData.atomHandler, testEntry, {});

        window.ODataReadOracle.readEntryLoopback(entryXml,
        function (data) {
            djstest.assertAreEqualDeep(data, expectedEntry, "Response data not same as expected");
            djstest.done();
        });
    });

    djstest.addFullTest(true, function atomSerializeSpatialPropertyTest() {
        var entry = {
            __metadata: {
                properties: {
                    SpatialEdmTypeOnObjectWins: { type: "My.Type", extensions: [] },
                    SpatialEdmTypeOnMetadata: { type: "Edm.GeometryPoint", extensions: [] }
                }
            },
            SpatialEdmTypeOnly: {
                __metadata: { type: "Edm.GeometryPoint" },
                coordinates: [100, 200]
            },
            SpatialEdmTypeWins: {
                __metadata: { type: "Edm.GeometryPoint" },
                type: "MultiPoint",
                coordinates: [300, 400]
            },
            SpatialAbstractType: {
                __metadata: { type: "Edm.Geometry" },
                type: "Point",
                coordinates: [500, 600]
            },
            SpatialEdmTypeOnObjectWins: {
                __metadata: { type: "Edm.GeometryPoint" },
                type: "Point",
                coordinates: [5, 6]
            },
            SpatialEdmTypeOnMetadata: {
                type: "Point",
                coordinates: [7, 8]
            },
            SpatialUntyped: {
                type: "Point",
                coordinates: [9, 10]
            }
        };

        var request = { headers: {}, data: entry };
        OData.atomHandler.write(request, {});
        var entryXml = request.body;

        djstest.assertAreEqual("4.0", request.headers["OData-Version"], "Request data service version is the expected one");

        var response = {
            headers: { "Content-Type": "application/atom+xml", "OData-Version": "4.0" },
            body: entryXml
        };

        OData.atomHandler.read(response, {});
        var actual = response.data;

        window.ODataReadOracle.readEntryLoopback(entryXml, function (expected) {
            djstest.assertAreEqualDeep(actual, expected, "Response data not same as expected");
            djstest.done();
        });
    });

    djstest.addFullTest(true, function atomSerializeSpatialPointTest() {
        var entry = {
            __metadata: {
                properties: {
                    pointEdmTypeOnObjectWins: { type: "Edm.GeographyPoint", extensions: [] },
                    pointEdmTypeOnMetadata: { type: "Edm.GeometryPoint", extensions: [] }
                }
            },
            geometryPoint: {
                __metadata: { type: "Edm.GeometryPoint" },
                type: "Point",
                coordinates: [1, 2]
            },
            geographyPoint: {
                __metadata: { type: "Edm.GeographyPoint" },
                type: "Point",
                coordinates: [3, 4]
            },
            emptyPoint: {
                __metadata: { type: "Edm.GeometryPoint" },
                type: "Point",
                coordinates: []
            }
        };

        var request = { headers: {}, data: entry };
        OData.atomHandler.write(request, {});
        var entryXml = request.body;

        djstest.assertAreEqual("4.0", request.headers["OData-Version"], "Request data service version is the expected one");

        var response = {
            headers: { "Content-Type": "application/atom+xml", "OData-Version": "4.0" },
            body: entryXml
        };

        OData.atomHandler.read(response, {});
        var actual = response.data;

        window.ODataReadOracle.readEntryLoopback(entryXml, function (expected) {
            djstest.assertAreEqualDeep(actual, expected, "Response data not same as expected");
            djstest.done();
        });
    });

    djstest.addFullTest(true, function atomSerializeSpatialLineStringTest() {
        var entry = {
            __metadata: {
                properties: {
                    lineStringTypeOnObjectWins: { type: "Edm.GeographyLineString", extensions: [] },
                    lineStringTypeOnMetadata: { type: "Edm.GeometryLineString", extensions: [] }
                }
            },
            geometryLineString: {
                __metadata: { type: "Edm.GeometryLineString" },
                type: "LineString",
                coordinates: [[1, 2], [3, 4]]
            },
            geographyLineString: {
                __metadata: { type: "Edm.GeographyLineString" },
                type: "Point",
                coordinates: [[5, 6], [7, 8]]
            },
            emptyLineString: {
                __metadata: { type: "Edm.GeometryLineString" },
                type: "LineString",
                coordinates: []
            },
            lineStringTypeOnObjectWins: {
                __metadata: { type: "Edm.GeometryLineString" },
                type: "LineString",
                coordinates: [[9, 10], [11, 12]]
            },
            lineStringTypeOnMetadata: {
                type: "LineString",
                coordinates: [[13, 14], [15, 16]]
            }
        };

        var request = { headers: {}, data: entry };
        OData.atomHandler.write(request, {});
        var entryXml = request.body;

        djstest.assertAreEqual("4.0", request.headers["OData-Version"], "Request data service version is the expected one");

        var response = {
            headers: { "Content-Type": "application/atom+xml", "OData-Version": "4.0" },
            body: entryXml
        };

        OData.atomHandler.read(response, {});
        var actual = response.data;

        window.ODataReadOracle.readEntryLoopback(entryXml, function (expected) {
            djstest.assertAreEqualDeep(actual, expected, "Response data not same as expected");
            djstest.done();
        });
    });

    djstest.addFullTest(true, function atomSerializeSpatialPolygonTest() {
        var entry = {
            __metadata: {
                properties: {
                    polygonTypeOnObjectWins: { type: "Edm.GeographyPolygon", extensions: [] },
                    polygonTypeOnMetadata: { type: "Edm.GeometryPolygon", extensions: [] }
                }
            },
            geometryPolygon: {
                __metadata: { type: "Edm.GeometryPolygon" },
                type: "Polygon",
                coordinates: [[[1, 2], [3, 4], [5, 6], [1, 2]]]
            },
            geographyPolygon: {
                __metadata: { type: "Edm.GeographyPolygon" },
                type: "Point",
                coordinates: [[[7, 8], [9, 10], [11, 12], [7, 8]]]
            },
            emptyPolygon: {
                __metadata: { type: "Edm.GeometryPolygon" },
                type: "Point",
                coordinates: []
            },
            polygonWithInternalRing: {
                __metadata: { type: "Edm.GeometryPolygon" },
                type: "Polygon",
                coordinates: [[[13, 14], [15, 16], [17, 18], [13, 14]], [[19, 20], [21, 22], [23, 24], [19, 20]]]
            },
            polygonTypeOnObjectWins: {
                __metadata: { type: "Edm.GeometryPolygon" },
                type: "Polygon",
                coordinates: [[[33, 34], [35, 36], [37, 38], [33, 34]]]
            },
            polygonTypeOnMetadata: {
                type: "Polygon",
                coordinates: [[[39, 40], [41, 42], [43, 44], [39, 40]]]
            }
        };

        var request = { headers: {}, data: entry };
        OData.atomHandler.write(request, {});
        var entryXml = request.body;

        djstest.assertAreEqual("4.0", request.headers["OData-Version"], "Request data service version is the expected one");

        var response = {
            headers: { "Content-Type": "application/atom+xml", "OData-Version": "4.0" },
            body: entryXml
        };

        OData.atomHandler.read(response, {});
        var actual = response.data;

        window.ODataReadOracle.readEntryLoopback(entryXml, function (expected) {
            djstest.assertAreEqualDeep(actual, expected, "Response data not same as expected");
            djstest.done();
        });
    });

    djstest.addFullTest(true, function atomSerializeSpatialMultiPointTest() {
        var entry = {
            geometryMultiPoint: {
                __metadata: { type: "Edm.GeometryMultiPoint" },
                type: "MultiPoint",
                coordinates: [[1, 2], [3, 4]]
            },
            geographyMultiPoint: {
                __metadata: { type: "Edm.GeographyMultiPoint" },
                type: "MultiPoint",
                coordinates: [[5, 6], [7, 8]]
            },
            emptyMultiPoint: {
                __metadata: { type: "Edm.GeometryMultiPoint" },
                type: "MultiPoint",
                coordinates: []
            }
        };

        var request = { headers: {}, data: entry };
        OData.atomHandler.write(request, {});
        var entryXml = request.body;

        djstest.assertAreEqual("4.0", request.headers["OData-Version"], "Request data service version is the expected one");

        var response = {
            headers: { "Content-Type": "application/atom+xml", "OData-Version": "4.0" },
            body: entryXml
        };

        OData.atomHandler.read(response, {});
        var actual = response.data;

        window.ODataReadOracle.readEntryLoopback(entryXml, function (expected) {
            djstest.assertAreEqualDeep(actual, expected, "Response data not same as expected");
            djstest.done();
        });
    });

    djstest.addFullTest(true, function atomSerializeSpatialMultiLineStringTest() {
        var entry = {
            geometryMultiLineString: {
                __metadata: { type: "Edm.GeometryMultiLineString" },
                type: "MultiLineString",
                coordinates: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]]
            },
            geographyMultiLineString: {
                __metadata: { type: "Edm.GeographyMultiLineString" },
                type: "Point",
                coordinates: [[[9, 10], [11, 12]]]
            },
            emptyMultiLineString: {
                __metadata: { type: "Edm.GeometryMultiLineString" },
                type: "MultiLineString",
                coordinates: []
            }
        };

        var request = { headers: {}, data: entry };
        OData.atomHandler.write(request, {});
        var entryXml = request.body;

        djstest.assertAreEqual("4.0", request.headers["OData-Version"], "Request data service version is the expected one");

        var response = {
            headers: { "Content-Type": "application/atom+xml", "OData-Version": "4.0" },
            body: entryXml
        };

        OData.atomHandler.read(response, {});
        var actual = response.data;

        window.ODataReadOracle.readEntryLoopback(entryXml, function (expected) {
            djstest.assertAreEqualDeep(actual, expected, "Response data not same as expected");
            djstest.done();
        });
    });

    djstest.addFullTest(true, function atomSerializeSpatialMultiLinePolygonTest() {
        var entry = {
            geometryMultiLineString: {
                __metadata: { type: "Edm.GeometryMultiPolygon" },
                type: "MultiPolygon",
                coordinates: [[[[1, 2], [3, 4], [5, 6], [1, 2]]], [[[7, 8], [9, 10], [11, 12], [7, 8]]]]
            },
            geographyMultiLineString: {
                __metadata: { type: "Edm.GeographyMultiPolygon" },
                type: "MultiPolygon",
                coordinates: [[[[9, 10], [11, 12], [13, 14], [9, 10]]]]
            },
            emptyMultiLineString: {
                __metadata: { type: "Edm.GeometryMultiPolygon" },
                type: "MultiPolygon",
                coordinates: []
            }
        };

        var request = { headers: {}, data: entry };
        OData.atomHandler.write(request, {});
        var entryXml = request.body;

        djstest.assertAreEqual("4.0", request.headers["OData-Version"], "Request data service version is the expected one");

        var response = {
            headers: { "Content-Type": "application/atom+xml", "OData-Version": "4.0" },
            body: entryXml
        };

        OData.atomHandler.read(response, {});
        var actual = response.data;

        window.ODataReadOracle.readEntryLoopback(entryXml, function (expected) {
            djstest.assertAreEqualDeep(actual, expected, "Response data not same as expected");
            djstest.done();
        });
    });

    djstest.addFullTest(true, function atomSerializeSpatialGeometryCollectionTest() {
        var entry = {
            geometryCollection: {
                __metadata: { type: "Edm.GeometryCollection" },
                type: "GeometryCollection",
                geometries: [
                    {
                        type: "Point",
                        coordinates: [1, 2]
                    }
                ]
            },
            geographyCollection: {
                __metadata: { type: "Edm.GeometryCollection" },
                type: "GeometryCollection",
                geometries: [
                    {
                        type: "Point",
                        coordinates: [3, 4]
                    }
                ]
            },
            emptyGeometryCollection: {
                __metadata: { type: "Edm.GeometryCollection" },
                type: "GeometryCollection",
                geometries: []
            },
            nestedGeometryCollection: {
                __metadata: { type: "Edm.GeometryCollection" },
                type: "GeometryCollection",
                geometries: [
                    {
                        type: "GeometryCollection",
                        geometries: [
                            {
                                type: "GeometryCollection",
                                geometries: [
                                    {
                                        type: "Point",
                                        coordinates: [5, 6]
                                    }
                                ]
                            }
                        ]
                    }
               ]
            }
        };

        var request = { headers: {}, data: entry };
        OData.atomHandler.write(request, {});
        var entryXml = request.body;

        djstest.assertAreEqual("4.0", request.headers["OData-Version"], "Request data service version is the expected one");

        var response = {
            headers: { "Content-Type": "application/atom+xml", "OData-Version": "4.0" },
            body: entryXml
        };

        OData.atomHandler.read(response, {});
        var actual = response.data;

        window.ODataReadOracle.readEntryLoopback(entryXml, function (expected) {
            djstest.assertAreEqualDeep(actual, expected, "Response data not same as expected");
            djstest.done();
        });
    });

    djstest.addFullTest(true, function atomSerializeCollectionPropertiesTest() {
        var entry = {
            __metadata: {
                uri: "http://services.odata.org/OData/OData.svc/the id",
                properties: {
                    primitiveColArray: { type: "Collection(Edm.Int16)" },
                    primitiveColObject: { type: "Collection(Edm.Int32)" },
                    primitiveTypelessCollection: { type: "Collection()" },
                    complexColArray: { type: "Collection(My.Type)" },
                    complexColObject: { type: "Collection(My.Type2)" },
                    colObjectTypeInObjectWins: { type: "Collection(Edm.Double)" },
                    complexColArrayPropertiesInfo: {
                        type: "Collection(My.Type3)",
                        properties: {
                            p3: { type: "Edm.Int32" },
                            p4: { type: "Edm.Int16" }
                        }
                    }
                }
            },
            primitiveColArray: [1, 2, 3, 4],
            primitiveColObject: {
                results: [5, 6, 7, 8]
            },
            primitiveColObjectWithType: {
                __metadata: { type: "Collection(Edm.Double)" },
                results: [1.1, 2.2, 3.3]
            },
            primitiveUntypedColArray: [5, 6, 7],
            primitiveUntypedColObject: {
                results: [10, 11, 12]
            },
            primitiveTypelessCollection: [13, 14, 15],
            complexColArray: [{ p1: 10 }, { p1: 20}],
            complexColObject: {
                results: [{ p2: 300 }, { p2: 400}]
            },
            colObjectTypeInObjectWins: {
                __metadata: { type: "Collection(Edm.Single)" },
                results: [1.5, 2.5, 3.5]
            },
            complexColArrayPropertiesInfo: [
               { p3: 900, p4: 1000 },
               { p3: 900, p4: 1000 }
            ],
            complexTypelessCollection: {
                __metadata: { type: "Collection()" },
                results: [{ p5: 1500 }, { p5: 1600}]
            }
        };

        var request = { headers: {}, data: entry };
        OData.atomHandler.write(request, {});
        var entryXml = request.body;

        var response = {
            headers: { "Content-Type": "application/atom+xml", "OData-Version": "4.0" },
            body: entryXml
        };

        OData.atomHandler.read(response, {});
        var actual = response.data;

        window.ODataReadOracle.readEntryLoopback(entryXml, function (expected) {
            djstest.assertAreEqualDeep(actual, expected, "Response data not same as expected");
            djstest.done();
        });
    });

    //    djstest.addFullTest(true, function atomSerializeInvalidPayloadTest() {
    //        djstest.expectException(function () {
    //            OData.atomSerializer(OData.atomHandler, { EntitySets: [] });
    //        }, "expected exception for serializing a service document");

    //        djstest.expectException(function () {
    //            OData.atomSerializer(OData.atomHandler, null, {});
    //        }, "expected exception for serializing null data");

    //        djstest.expectException(function () {
    //            OData.atomSerializer(OData.atomHandler, undefined, {});
    //        }, "expected exception for serializing undefined data");

    //        djstest.done();
    //    });

    djstest.addFullTest(true, function atomSetEntryValueByPathTest() {
        var target = {};

        // simple property added.
        OData.atomSetEntryValueByPath("p", target, 1);
        djstest.assertAreEqual(target.p, 1, "target.p set to 1");

        // simple property replaced.
        OData.atomSetEntryValueByPath("p", target, 2);
        djstest.assertAreEqual(target.p, 2, "target.p overwritten to 1");

        // Construct object and set property.
        OData.atomSetEntryValueByPath("a/b", target, 3);
        djstest.assertAreEqual(target.a.b, 3, "target.a.b set to 3");

        // Construct object and replace property.
        OData.atomSetEntryValueByPath("a/b", target, 4);
        djstest.assertAreEqual(target.a.b, 4, "target.a.b set to 4");

        // Construct object deeply and set property.
        OData.atomSetEntryValueByPath("a/deep/value", target, 5);
        djstest.assertAreEqual(target.a.b, 4, "target.a.b still 4");
        djstest.assertAreEqual(target.a.deep.value, 5, "target.a.deep.value set to 5");

        djstest.done();
    });

    djstest.addFullTest(true, function getXmlPathValueTest() {
        // Tests with expected value and result based on doc.
        var doc = datajs.xmlParse(
        "<atom:entry xmlns:atom='http://www.w3.org/2005/Atom' xmlns:c='custom'>" +
        " <atom:title>title</atom:title>" +
        " <atom:summary>summary</atom:summary>" +
        " <atom:author><atom:name>author name</atom:name><atom:uri>author uri</atom:uri><atom:email>author email</atom:email></atom:author>" +
        " <atom:contributor><atom:name>contributor name</atom:name></atom:contributor>" +
        " <c:element>custom element</c:element>" +
        " <c:other c:with-attribute='attribute' with-attribute='decoy'>text</c:other>" +
        " <c:third><c:item><c:a>a</c:a><c:b>b</c:b><c:empty /></c:item></c:third>" +
        "</atom:entry>");

        var root = datajs.xmlFirstChildElement(doc);

        var atomXmlNs = "http://www.w3.org/2005/Atom";
        var tests = [
        { ns: atomXmlNs, path: "title", e: "title" },
        { ns: atomXmlNs, path: "updated", e: null },
        { ns: atomXmlNs, path: "summary", e: "summary" },
        { ns: atomXmlNs, path: "rights", e: null },
        { ns: atomXmlNs, path: "published", e: null },
        { ns: atomXmlNs, path: "contributor/email", e: null },
        { ns: atomXmlNs, path: "contributor/uri", e: null },
        { ns: atomXmlNs, path: "contributor/name", e: "contributor name" },
        { ns: atomXmlNs, path: "author/uri", e: "author uri" },
        { ns: atomXmlNs, path: "author/name", e: "author name" },
        { ns: atomXmlNs, path: "author/email", e: "author email" },
        { ns: "custom", path: "element", e: "custom element" },
        { ns: "other", path: "element", e: null },
        { ns: "custom", path: "other", e: "text" },
        { ns: "custom", path: "other/@with-attribute", e: "attribute" },
        { ns: "custom", path: "third/item/a", e: "a" },
        { ns: "custom", path: "third/item/b", e: "b" },
        { ns: "custom", path: "third/item/c", e: null },
        { ns: "custom", path: "third/item/empty", e: null }
    ];

        var i, len;
        for (i = 0, len = tests.length; i < len; i++) {
            var test = tests[i];
            var node = datajs.xmlFindNodeByPath(root, test.ns, test.path);
            var actual = node && datajs.xmlNodeValue(node);
            djstest.assertAreEqual(actual, test.e, "match for test #" + i + "(" + test.path + ")");
        }

        djstest.done();
    });

    djstest.addFullTest(true, function atomApplyCustomizationToEntryObjectTest() {
        var entryXml =
            "<atom:entry xmlns:atom='http://www.w3.org/2005/Atom' xmlns:c='custom'>" +
            " <atom:title>title</atom:title>" +
            " <atom:summary>summary</atom:summary>" +
            " <atom:author><atom:name>author name</atom:name><atom:uri>author uri</atom:uri><atom:email>author email</atom:email></atom:author>" +
            " <atom:contributor><atom:name>contributor name</atom:name></atom:contributor>" +
            " <atom:category term='Ns.Customer' scheme='http://schemas.microsoft.com/ado/2007/08/dataservices/scheme' />" +
            " <c:element>custom element</c:element>" +
            " <c:other c:with-attribute='attribute' with-attribute='decoy'>text</c:other>" +
            " <c:third><c:item><c:a>a</c:a><c:b>b</c:b><c:empty /></c:item></c:third>" +
            "</atom:entry>"

        var tests = [
            { ns: null, path: "SyndicationTitle", e: "title" },
            { ns: null, path: "SyndicationUpdated", e: undefined },
            { ns: null, path: "SyndicationSummary", e: "summary" },
            { ns: "custom", path: "element", e: "custom element" },
            { ns: "custom", path: "other/@with-attribute", e: "attribute" }
        ];

        var i, len;
        for (i = 0, len = tests.length; i < len; i++) {
            var test = tests[i];
            var model = {
                "namespace": "Ns",
                entityType: [
                    {
                        name: "Customer",
                        FC_SourcePath: "targetProperty/value",
                        FC_NsUri: test.ns, FC_TargetPath: test.path
                    }
                ]
            };
            var response = { headers: { "Content-Type": "application/atom+xml" }, body: entryXml };

            OData.atomHandler.read(response, { metadata: model });
            var data = response.data;
            var actual = (data.targetProperty) ? data.targetProperty.value : undefined;
            djstest.assertAreEqual(actual, test.e, "match for test #" + i + "(" + test.path + ")");
        }

        djstest.done();
    });

    djstest.addFullTest(true, function atomReadCustomizedEntryWithNoTypeInformation() {
        var entryXml =
        "<atom:entry xmlns:atom='http://www.w3.org/2005/Atom' xmlns:c='custom'>" +
        " <atom:title>title</atom:title>" +
        " <atom:summary>summary</atom:summary>" +
        " <atom:author><atom:name>author name</atom:name><atom:uri>author uri</atom:uri><atom:email>author email</atom:email></atom:author>" +
        " <atom:contributor><atom:name>contributor name</atom:name></atom:contributor>" +
        " <c:element>custom element</c:element>" +
        " <c:other c:with-attribute='attribute' with-attribute='decoy'>text</c:other>" +
        " <c:third><c:item><c:a>a</c:a><c:b>b</c:b><c:empty /></c:item></c:third>" +
        "</atom:entry>";

        var response = { headers: { "Content-Type": "application/atom+xml" }, body: entryXml };
        var metadata = { "namespace": "Ns", entityType: [{ name: "Customer"}] };

        OData.atomHandler.read(response, { metadata: metadata });
        djstest.assertAreEqualDeep(response.data, { __metadata: {} }, "No change for entity with no type name");

        djstest.done();
    });

    djstest.addFullTest(true, function atomReadCustomizedEntryWithMismatchedType() {
        var entryXml =
        "<atom:entry xmlns:atom='http://www.w3.org/2005/Atom' xmlns:c='custom'>" +
        " <atom:title>title</atom:title>" +
        " <atom:summary>summary</atom:summary>" +
        " <atom:author><atom:name>author name</atom:name><atom:uri>author uri</atom:uri><atom:email>author email</atom:email></atom:author>" +
        " <atom:contributor><atom:name>contributor name</atom:name></atom:contributor>" +
        " <atom:category term='Ns.Customer' scheme='http://schemas.microsoft.com/ado/2007/08/dataservices/scheme' />" +
        " <c:element>custom element</c:element>" +
        " <c:other c:with-attribute='attribute' with-attribute='decoy'>text</c:other>" +
        " <c:third><c:item><c:a>a</c:a><c:b>b</c:b><c:empty /></c:item></c:third>" +
        "</atom:entry>";

        var response = { headers: { "Content-Type": "application/atom+xml" }, body: entryXml };
        var metadata = { "namespace": "Ns", entityType: [{ name: "Person"}] };

        OData.atomHandler.read(response, { metadata: metadata });
        djstest.assertAreEqualDeep(response.data,
            { __metadata: { type: "Ns.Customer", type_extensions: []} },
            "No change for entity with no matching type name");

        djstest.done();
    });

    djstest.addFullTest(true, function atomReadCustomizedEntryTest() {
        var entryXml =
        "<atom:entry xmlns:atom='http://www.w3.org/2005/Atom' xmlns:c='custom'>" +
        " <atom:title>title</atom:title>" +
        " <atom:summary>summary</atom:summary>" +
        " <atom:author><atom:name>author name</atom:name><atom:uri>author uri</atom:uri><atom:email>author email</atom:email></atom:author>" +
        " <atom:contributor><atom:name>contributor name</atom:name></atom:contributor>" +
        " <atom:category term='Ns.Customer' scheme='http://schemas.microsoft.com/ado/2007/08/dataservices/scheme' />" +
        " <c:element>custom element</c:element>" +
        " <c:other c:with-attribute='attribute' with-attribute='decoy'>text</c:other>" +
        " <c:third><c:item><c:a>a</c:a><c:b>b</c:b><c:empty /></c:item></c:third>" +
        "</atom:entry>";

        var response = { headers: { "Content-Type": "application/atom+xml" }, body: entryXml };
        var metadata;

        // Entity-level feed customization.
        metadata = { "namespace": "Ns", entityType: [{ name: "Customer", FC_SourcePath: "name", FC_TargetPath: "SyndicationTitle"}] };
        OData.atomHandler.read(response, { metadata: metadata });
        djstest.assertAreEqualDeep(response.data, {
            __metadata: { type: "Ns.Customer", type_extensions: [] },
            name: "title"
        }, "title mapped from entity");

        // Property-level feed customization.
        metadata = {
            "namespace": "Ns",
            entityType: [
                {
                    name: "Customer",
                    FC_SourcePath: "name",
                    FC_TargetPath:
                    "SyndicationTitle",
                    property: [
                        { name: "biography", FC_TargetPath: "SyndicationSummary" },
                        { name: "stuff", FC_TargetPath: "third/item/a", FC_NsUri: "custom" },
                        { name: "contactInfo", FC_SourcePath: "email", FC_TargetPath: "SyndicationAuthorEmail" }
                    ]
                }
            ]
        };

        OData.atomHandler.read(response, { metadata: metadata });
        djstest.assertAreEqualDeep(response.data, {
            __metadata: { type: "Ns.Customer", type_extensions: [] },
            name: "title",
            biography: "summary",
            "stuff": "a",
            contactInfo: { email: "author email" }
        }, "biography and stuff mapped from property feed customizations");

        // Base type customization.
        metadata = {
            "namespace": "Ns",
            entityType: [
                {
                    name: "Customer", baseType: "Ns.Person",
                    FC_SourcePath: "name", FC_TargetPath: "SyndicationTitle",
                    property: [
                        { name: "biography", FC_TargetPath: "SyndicationSummary" },
                        { name: "stuff", FC_TargetPath: "third/item/a", FC_NsUri: "custom" }
                    ]
                },
                {
                    name: "Person",
                    FC_SourcePath: "name", FC_TargetPath: "SyndicationTitle",
                    property: [
                        { name: "personAttribute", FC_TargetPath: "other/@with-attribute", FC_NsUri: "custom" }
                    ]
                }
            ]
        };

        OData.atomHandler.read(response, { metadata: metadata });
        djstest.assertAreEqualDeep(response.data, {
            __metadata: { type: "Ns.Customer", type_extensions: [] },
            name: "title",
            biography: "summary",
            "stuff": "a",
            personAttribute: "attribute"
        }, "attribute mapped from base type");

        djstest.done();
    });

    djstest.addFullTest(true, function lookupPropertyTypeTest() {
        // Tests are in metadata / entity / path / expected name form.

        var schema = {
            namespace: "Ns",
            entityType: [
            { name: "Person", property: [
                { name: "id", type: "Edm.Int32" }, { name: "name" }
            ]
            },
            { name: "Customer", baseType: "Ns.Person", property: [
                { name: "account", type: "Edm.Int32" }, { name: "delivery", type: "Ns.Address" }
            ]
            }
        ],
            complexType: [
            { name: "Address", property: [{ name: "street", type: "Edm.String" }, { name: "city"}] }
        ]
        };

        var tests = [
        { m: schema, e: schema.entityType[0], path: "id", n: "Edm.Int32" },
        { m: schema, e: schema.entityType[0], path: "foo", n: null },
        { m: schema, e: schema.entityType[0], path: "name", n: null },
        { m: schema, e: schema.entityType[1], path: "id", n: "Edm.Int32" },
        { m: schema, e: schema.entityType[1], path: "name", n: null },
        { m: schema, e: schema.entityType[1], path: "account", n: "Edm.Int32" },
        { m: schema, e: schema.entityType[1], path: "delivery/street", n: "Edm.String" }
    ];

        var i, len;
        for (i = 0, len = tests.length; i < len; i++) {
            var test = tests[i];
            var actual = OData.lookupPropertyType(test.m, test.e, test.path);
            djstest.assertAreEqualDeep(actual, test.n, "matching type name for path " + test.path);
        }

        djstest.done();
    });

    var dateMs = function (text, extraMs, ns, offset) {
        /// <summary>Constructs a Date object by parsing the specified text and adding milliseconds, nanosenconds and offest data.</summary>
        /// <param name="text" type="String">Date in string form.</param>
        /// <param name="extraMS" type="Number">Milliseconds to add.</param>
        /// <param name="ns" type="Number">Nanoseconds.</param>
        /// <param name="offset" type="String">Offset data.</param>

        var result = new Date(new Date(text).valueOf() + extraMs);
        if (ns !== undefined) {
            result.__ns = ns;
        }

        if (offset) {
            result.__edmType = "Edm.DateTimeOffset";
            result.__offset = offset;
        }

        return result;
    };

    djstest.addFullTest(true, function parseDateTimeTest() {

        // This function is used to create dates with out-of-range years; it works only on Safari
        var createDateWithLargeYear = function (dateString, actualYear) {
            var date = new Date(dateString);
            date.setFullYear(actualYear);

            if (!isNaN(date.valueOf())) {
                return date;
            }
            else {
                return undefined;
            }
        };

        // Input and expected values (undefined for exceptions).
        var tests = [
        // Valid values.
            {i: "2000-01-02T03:04:05", e: new Date("01/02/2000 03:04:05 GMT") }, // simple date
            {i: "2000-01-31T03:04:05", e: new Date("01/31/2000 03:04:05 GMT") }, // 31st date of month
            {i: "2000-01-31T23:58:59", e: new Date("01/31/2000 23:58:59 GMT") }, // post-noon hours
            {i: "0500-08-09T09:09:09", e: new Date("08/09/0500 09:09:09 GMT") }, // leading zeroes
            {i: "20000-01-31T23:58:59", e: new Date("01/31/20000 23:58:59 GMT") }, // >4 digit years
            {i: "2000-01-02T24:00:00", e: new Date("01/03/2000 00:00:00 GMT") }, // 24:00 for midnight
            {i: "0050-01-31T23:00:00", e: new Date(-60586621200000) }, // year in 0-99 range

            {i: "2000-01-31T03:04:05.5", e: dateMs("01/31/2000 03:04:05 GMT", 500) },  // An extra half-second
            {i: "2000-01-31T03:04:05.001", e: dateMs("01/31/2000 03:04:05 GMT", 1) },  // An extra millisecond
            {i: "2000-01-31T03:04:05.0000001", e: dateMs("01/31/2000 03:04:05 GMT", 0, 1) },  // An extra nanosecond
            {i: "2000-01-31T03:04:05.0010001", e: dateMs("01/31/2000 03:04:05 GMT", 1, 1) },  // An extra millisecond and nanosecond
            {i: "2000-01-31T03:04:05.0011000", e: dateMs("01/31/2000 03:04:05 GMT", 1, 1000) },  // An extra millisecond and 1000 nanoseconds
            {i: "2000-01-31T03:04:05.00101", e: dateMs("01/31/2000 03:04:05 GMT", 1, 100) },  // An extra millisecond and 100 nanoseconds
            {i: "2011-09-24T16:20:15.7724193", e: dateMs("09/24/2011 16:20:15 GMT", 772, 4193) }, // Azure timestamp value
            {i: "-0100-01-31T23:58:59", e: new Date(-65288678461000) },                 // BC years
            {i: "2000-02-29T03:04:05", e: new Date("02/29/2000 03:04:05 GMT") },  // Leap day
            {i: "0000-01-02T03:04:05", e: new Date(-62135499355000) },   // Zero year
            {i: "2000-13-32T25:61:61", e: new Date("02/02/2001 02:02:01 GMT") },  // Time components overflow
            {i: "2000-01-02T24:00:01", e: new Date("01/03/2000 00:00:01 GMT") },  // 24-hour overflow
            {i: "2000-04-31T00:00:00", e: new Date("05/01/2000 00:00:00 GMT") },  // Day overflow
            {i: "2001-02-29T00:00:00", e: new Date("03/01/2001 00:00:00 GMT") },  // Non-existent leap day overflow
            {i: "2000-01-02T03:04", e: new Date("01/02/2000 03:04:00 GMT") },  //Date without seconds
        // Unparseable invalid values.
            {i: "2000-01-02T03:04:05+01:00" }, // Timezone included
            {i: "2000-01-02T03:04:05.00000001" },  // Too much precision, tenths of nanoseconds not supported
            {i: "-100-01-31T23:58:59" },       // Year component too short
            {i: "2000" },                      // Not enough components
            {i: "+2000-01-02T03:04:05" },      // Positive sign prefix
            {i: "2000-1-2T3:4:5" },            // Components too short
            {i: "2000-01-02T03:04:05." },      // Trailing dot with no fractional seconds component

        // Out of range date values (except Safari)
            {i: "-271822-04-19T23:59:59", e: createDateWithLargeYear("04/19/2000 23:59:59 GMT", -271821) },
            { i: "275760-09-13T00:00:01", e: createDateWithLargeYear("09/13/2000 00:00:01 GMT", 275760) }
        ];

        for (var i = 0; i < tests.length; i++) {
            var result;
            try {
                result = OData.parseDateTime(tests[i].i);
            } catch (err) {
                result = undefined;
            }

            djstest.assertAreEqualDeep(result, tests[i].e, "parseDateTime for " + tests[i].i + " expecting " + tests[i].e + " found " + result);
        }
        djstest.done();
    });

    djstest.addFullTest(true, function parseDateTimeOffsetTest() {
        // Each test has input, expected value in text form, and expected offset text.
        var tests = [
        // Valid values.
            {i: "2000-01-02T03:04:05Z", ev: dateMs("01/02/2000 03:04:05 GMT", 0, 0, "Z") }, // simple date
            {i: "2000-01-02T03:04:05+00:00", ev: dateMs("01/02/2000 03:04:05 GMT", 0, 0, "Z") }, // simple date with zero positive offset
            {i: "2000-01-02T03:04:05-00:00", ev: dateMs("01/02/2000 03:04:05 GMT", 0, 0, "Z") }, // simple date with zero negative offset
            {i: "2000-01-02T03:04:05+14:00", ev: dateMs("01/01/2000 13:04:05 GMT", 0, 0, "+14:00") }, // simple date with maximum positive offset
            {i: "2000-01-02T03:04:05-14:00", ev: dateMs("01/02/2000 17:04:05 GMT", 0, 0, "-14:00") }, // simple date with maximum negative offset
            {i: "2000-01-02T03:04:05+01:00", ev: dateMs("01/02/2000 02:04:05 GMT", 0, 0, "+01:00") }, // simple date with an hour positive offset
            {i: "2000-01-02T03:04:05+00:30", ev: dateMs("01/02/2000 02:34:05 GMT", 0, 0, "+00:30") }, // simple date with a half-hour positive offset
            {i: "2000-01-02T03:04:05-01:00", ev: dateMs("01/02/2000 04:04:05 GMT", 0, 0, "-01:00") }, // simple date with an hour negative offset
            {i: "2000-01-02T03:04:05+10:30", ev: dateMs("01/01/2000 16:34:05 GMT", 0, 0, "+10:30") }, // simple date with a ten hour and a half positive offset
            {i: "2000-01-02T03:04:05-10:30", ev: dateMs("01/02/2000 13:34:05 GMT", 0, 0, "-10:30") }, // simple date with a ten hour and a half negative offset
            {i: "2000-01-01T00:29:00+00:30", ev: dateMs("12/31/1999 23:59:00 GMT", 0, 0, "+00:30") }, // positive offset crossing component boundaries
            {i: "1999-12-31T23:30:00-00:30", ev: dateMs("01/01/2000 00:00:00 GMT", 0, 0, "-00:30") },  // negative offset crossing component boundaries
            {i: "2011-09-24T16:20:15.7724193Z", ev: dateMs("09/24/2011 16:20:15 GMT", 772, 4193, "Z")} // Azure timestamp value
        ];

        for (var i = 0; i < tests.length; i++) {
            var result = OData.parseDateTimeOffset(tests[i].i);
            djstest.assertAreEqualDeep(result, tests[i].ev, "parseDateTimeOffset for " + tests[i].i);
        }
        djstest.done();
    });

    djstest.addFullTest(true, function parseTimeTest() {
        var error;
        try {
            OData.parseTime("00:01:02");
            error = null;
        } catch (err) {
            error = err;
        }

        djstest.assert(error !== null, "error !== null");

        djstest.done();
    });

    djstest.addFullTest(true, function formatDateTimeOffsetTest() {
        // Input values that should simply round-trip.
        var tests = [
            "2000-01-02T03:04:05Z",
            "2000-01-31T03:04:05Z",
            "-2000-01-31T03:04:05.002Z",
            "2000-01-31T03:04:05.800+00:10-00:00",
            "2000-01-31T03:04:05.020+00:10+00:00",
            "2000-01-31T03:04:05.500+00:10-08:30",
            "2000-01-31T03:04:05.500+12:10+08:30",
            "2000-01-31T03:04:05.500-12:10-08:30",
            "0099-01-31T03:04:05.500-12:10+00:30",
            "-0001-01-31T03:04:05.500-12:10+00:05",
            "-0001-01-31T03:04:05.500-12:10-00:05",
            "2020-01-31T03:04:05.501-12:10+07:00",
            "2011-09-24T16:20:15.7724193Z"
        ];

        for (var i = 0; i < tests.length; i++) {
            var test = tests[i];
            var dateValue = OData.parseDateTimeOffset(test);
            var textValue = OData.formatDateTimeOffset(dateValue);
            djstest.assertAreEqual(textValue, test, "Roundtripping " + test + " through " + dateValue.toUTCString());
        }

        djstest.done();
    });

    djstest.addFullTest(true, function malformedXmlTest() {
        // Verifies that malformed XML documents (typically incomplete payloads) do indeed throw an error.
        var xmlText = "<top>text <another /> <item> </item> <!-- top not closed -->";
        var err = null;
        try {
            parseMetadataHelper(xmlText);
        } catch (_) { err = _; }

        var expectedErrorMessage0 = "The following tags were not closed: top."; // IE MSXML
        var expectedErrorMessage1 = "XML Parsing Error: no element found";      // FF
        var expectedErrorMessage2 = "This page contains the following errors";  // Chrome
        var expectedErrorMessage3 = "Error";                                    // Opera
        var expectedErrorMessage4 = "DOM Exception: SYNTAX_ERR (12)"            // IE9 DOMParser
        var expectedErrorMessage5 = "SyntaxError"                               // IE10 DOMParser

        djstest.assert(err !== null, "err !== null");
        djstest.assertAreEqual(err.errorXmlText, xmlText, "xmlText matches original");
        djstest.assert(
            err.message.indexOf(expectedErrorMessage0) === 0 ||
            err.message.indexOf(expectedErrorMessage1) === 0 ||
            err.message.indexOf(expectedErrorMessage2) === 0 ||
            err.message.indexOf(expectedErrorMessage3) === 0 && window.opera ||
            err.message.indexOf(expectedErrorMessage4) === 0 ||
            err.message.indexOf(expectedErrorMessage5) === 0,
            err.message + " contains one of '" +
            [expectedErrorMessage0, expectedErrorMessage1, expectedErrorMessage2,
             expectedErrorMessage3, expectedErrorMessage4, expectedErrorMessage5].join(',') + "'");

        djstest.done();
    });

    // DATAJS INTERNAL END
})(this);