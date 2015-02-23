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

// odata-metadata-tests.js

(function (window, undefined) {
    djstest.addTest(function testMetadataHandler() {
        // Test cases as result / model tuples.
        var cases = [
            { i: {}, e: undefined },
            { i: { headers: { "Content-Type": "application/xml" }, body: '<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" />' },
                e: { version: "4.0" }
            }
        ];

        var i, len;
        for (i = 0, len = cases.length; i < len; i++) {
            var response = cases[i].i;
            var testClient = { request: function (r, success, error) { success(response); } };
            window.odatajs.oData.read("foo", function (data) {
                djstest.assertAreEqualDeep(data, cases[i].e, "handler result matches target");
            }, function (err) {
                djstest.fail(err.message);
            }, window.odatajs.oData.metadataHandler, testClient);
        }

        djstest.done();
    });

    // DATAJS INTERNAL START
    djstest.addTest(function testScriptCase() {
        // Test cases as input/result pairs.
        var cases = [
            { i: null, e: null },
            { i: "", e: "" },
            { i: "a", e: "a" },
            { i: "A", e: "a" },
            { i: "TestCase", e: "testCase" },
            { i: "123abc", e: "123abc" },
            { i: "ITEM", e: "ITEM" }
        ];

        var i, len;
        for (i = 0, len = cases.length; i < len; i++) {
            djstest.assertAreEqual(window.odatajs.oData.metadata.scriptCase(cases[i].i), cases[i].e, "processed input matches expected value");
        }

        djstest.done();
    });

    djstest.addTest(function testGetChildSchema() {
        // Test cases as input parent / input element / result tuples.
        var schema = window.odatajs.oData.metadata.schema;
        var cases = [
            { ip: schema.elements.EntityType, ie: "Property", e: { isArray: true, propertyName: "property"} },
            { ip: schema.elements.EntityType, ie: "Key", e: { isArray: true, propertyName: "key"} },
            { ip: schema.elements.EntitySet, ie: "SomethingElse", e: null },
            { ip: schema.elements.Property, ie: "Name", e: null} // this is an attribute, not an element, thus it's no found
        ];

        var i, len;
        for (i = 0, len = cases.length; i < len; i++) {
            var result = window.odatajs.oData.metadata.getChildSchema(cases[i].ip, cases[i].ie);
            djstest.assertAreEqualDeep(result, cases[i].e, "getChildSchema matches target");
        }

        djstest.done();
    });

    var testFullCsdl = '' +
        '<?xml version="1.0" encoding="utf-8"?>\r\n' +
        '<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">\r\n' +
        '  <edmx:DataServices xmlns:m="http://docs.oasis-open.org/odata/ns/metadata" m:MaxDataServiceVersion="4.0" m:DataServiceVersion="4.0">\r\n' +
        '    <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="TestCatalog.Model">\r\n' +
        '      <EntityType Name="Genre">\r\n' +
        '        <Key><PropertyRef Name="Name" /></Key>\r\n' +
        '        <Property Name="Name" Type="Edm.String" Nullable="false" MaxLength="50" Unicode="false" />\r\n' +
        '        <NavigationProperty Name="Titles" Type="Collection(TestCatalog.Model.Title)" Partner="Series" />\r\n' +
        '      </EntityType>\r\n' +
        '      <EntityType Name="Language">\r\n' +
        '        <Key><PropertyRef Name="Name" /></Key>\r\n' +
        '        <Property Name="Name" Type="Edm.String" Nullable="false" MaxLength="80" Unicode="false" />\r\n' +
        '        <NavigationProperty Name="Titles" Type="Collection(TestCatalog.Model.Title)" Partner="Languages" />\r\n' +
        '      </EntityType>\r\n' +
        '      <EntityType Name="Person">\r\n' +
        '        <Key><PropertyRef Name="Id" /></Key>\r\n' +
        '        <Property Name="Id" Type="Edm.Int32" Nullable="false" />\r\n' +
        '        <Property Name="Name" Type="Edm.String" Nullable="false" MaxLength="80" Unicode="true" />\r\n' +
        '        <NavigationProperty Name="Awards" Type="Collection(TestCatalog.Model.TitleAward)" Partner="Person"/>\r\n' +
        '        <NavigationProperty Name="TitlesActedIn" Type="Collection(TestCatalog.Model.Title)" Partner="Cast"/>\r\n' +
        '        <NavigationProperty Name="TitlesDirected" Type="Collection(TestCatalog.Model.Title)" Partner="Directors"/>\r\n' +
        '      </EntityType>\r\n' +
        '      <EntityType Name="TitleAudioFormat">\r\n' +
        '        <Key><PropertyRef Name="TitleId" /><PropertyRef Name="DeliveryFormat" /><PropertyRef Name="Language" /><PropertyRef Name="Format" /></Key>\r\n' +
        '        <Property Name="TitleId" Type="Edm.String" Nullable="false" MaxLength="30" FixedLength="false" />\r\n' +
        '        <Property Name="DeliveryFormat" Type="Edm.String" Nullable="false" MaxLength="10" Unicode="false" />\r\n' +
        '        <Property Name="Language" Type="Edm.String" Nullable="false" MaxLength="30" Unicode="false" FixedLength="false" />\r\n' +
        '        <Property Name="Format" Type="Edm.String" Nullable="false" MaxLength="30" Unicode="false" FixedLength="false" />\r\n' +
        '        <NavigationProperty Name="Title" Type="TestCatalog.Model.Title" Partner="AudioFormats" >\r\n' +
        '            <ReferentialConstraint Property="TitleId" ReferencedProperty="Id" />' +
        '        </NavigationProperty>' +
        '      </EntityType>\r\n' +
        '      <EntityType Name="TitleAward">\r\n' +
        '        <Key><PropertyRef Name="Id" /></Key>\r\n' +
        '        <Property Name="Id" Type="Edm.Guid" Nullable="false" />\r\n' +
        '        <Property Name="Type" Type="Edm.String" Nullable="false" MaxLength="30" Unicode="false" />\r\n' +
        '        <Property Name="Category" Type="Edm.String" Nullable="false" MaxLength="60" Unicode="false" />\r\n' +
        '        <Property Name="Year" Type="Edm.Int32" Nullable="true" />\r\n' +
        '        <Property Name="Won" Type="Edm.Boolean" Nullable="false" />\r\n' +
        '        <NavigationProperty Name="Title" Type="TestCatalog.Model.Title" Partner="Awards"/>\r\n' +
        '        <NavigationProperty Name="Person" Type="TestCatalog.Model.Person" Partner="Awards"/>\r\n' +
        '      </EntityType>\r\n' +
        '      <EntityType Name="Title" HasStream="true">\r\n' +
        '        <Key><PropertyRef Name="Id" /></Key>\r\n' +
        '        <Property Name="Id" Type="Edm.String" Nullable="false" MaxLength="30" />\r\n' +
        '        <Property Name="Synopsis" Type="Edm.String" Nullable="true" MaxLength="Max" Unicode="false" />\r\n' +
        '        <Property Name="ShortSynopsis" Type="Edm.String" Nullable="true" MaxLength="Max" Unicode="false" />\r\n' +
        '        <Property Name="AverageRating" Type="Edm.Double" Nullable="true" />\r\n' +
        '        <Property Name="ReleaseYear" Type="Edm.Int32" Nullable="true" />\r\n' +
        '        <Property Name="Url" Type="Edm.String" Nullable="true" MaxLength="200" Unicode="false" />\r\n' +
        '        <Property Name="Runtime" Type="Edm.Int32" Nullable="true" />\r\n' +
        '        <Property Name="Rating" Type="Edm.String" Nullable="true" MaxLength="10" Unicode="false" />\r\n' +
        '        <Property Name="DateModified" Type="Edm.DateTime" Nullable="false" />\r\n' +
        '        <Property Name="Type" Type="Edm.String" Nullable="false" MaxLength="8" Unicode="false" />\r\n' +
        '        <Property Name="BoxArt" Type="TestCatalog.Model.BoxArt" Nullable="false" />\r\n' +
        '        <Property Name="ShortName" Type="Edm.String" Nullable="false" MaxLength="200" Unicode="false" />\r\n' +
        '        <Property Name="Name" Type="Edm.String" Nullable="false" MaxLength="200" Unicode="false" />\r\n' +
        '        <Property Name="Instant" Type="TestCatalog.Model.InstantAvailability" Nullable="false" />\r\n' +
        '        <Property Name="Dvd" Type="TestCatalog.Model.DeliveryFormatAvailability" Nullable="false" />\r\n' +
        '        <Property Name="BluRay" Type="TestCatalog.Model.DeliveryFormatAvailability" Nullable="false" />\r\n' +
        '        <Property Name="TinyUrl" Type="Edm.String" Nullable="false" />\r\n' +
        '        <Property Name="WebsiteUrl" Type="Edm.String" Nullable="true" />\r\n' +
        '        <Property Name="TestApiId" Type="Edm.String" Nullable="false" />\r\n' +
        '        <NavigationProperty Name="AudioFormats" Type="Collection(TestCatalog.Model.TitleAudioFormat)" Partner="Title" Nullable="false" />\r\n' +
        '        <NavigationProperty Name="Awards" Type="Collection(TestCatalog.Model.TitleAward)" Partner="Title" Nullable="false" />\r\n' +
        '        <NavigationProperty Name="Disc" Type="Collection(TestCatalog.Model.Title)" />\r\n' +
        '        <NavigationProperty Name="Movie" Type="Collection(TestCatalog.Model.Title)" />\r\n' +
        '        <NavigationProperty Name="Season" Type="Collection(TestCatalog.Model.Title)" />\r\n' +
        '        <NavigationProperty Name="Series" Type="Collection(TestCatalog.Model.Title)" />\r\n' +
        '        <NavigationProperty Name="ScreenFormats" Type="Collection(TestCatalog.Model.TitleScreenFormat)" Partner="Title" Nullable="false" />\r\n' +
        '        <NavigationProperty Name="Cast" Type="Collection(TestCatalog.Model.Person)" Partner="TitlesActedIn" Nullable="false" />\r\n' +
        '        <NavigationProperty Name="Languages" Type="Collection(TestCatalog.Model.Language)" Partner="Titles" Nullable="false" />\r\n' +
        '        <NavigationProperty Name="Directors" Type="Collection(TestCatalog.Model.Person)" Partner="TitlesDirected" Nullable="false" />\r\n' +
        '        <NavigationProperty Name="Genres" Type="Collection(TestCatalog.Model.Genre)" Partner="Titles" Nullable="false" />\r\n' +
        '      </EntityType>\r\n' +
        '      <ComplexType Name="BoxArt">\r\n' +
        '        <Property Name="SmallUrl" Type="Edm.String" Nullable="true" MaxLength="80" Unicode="false" />\r\n' +
        '        <Property Name="MediumUrl" Type="Edm.String" Nullable="true" MaxLength="80" Unicode="false" />\r\n' +
        '        <Property Name="LargeUrl" Type="Edm.String" Nullable="true" MaxLength="80" Unicode="false" />\r\n' +
        '        <Property Name="HighDefinitionUrl" Type="Edm.String" Nullable="true" MaxLength="80" Unicode="false" />\r\n' +
        '      </ComplexType>\r\n' +
        '      <ComplexType Name="InstantAvailability">\r\n' +
        '        <Property Name="Available" Type="Edm.Boolean" Nullable="false" />\r\n' +
        '        <Property Name="AvailableFrom" Type="Edm.DateTime" Nullable="true" />\r\n' +
        '        <Property Name="AvailableTo" Type="Edm.DateTime" Nullable="true" />\r\n' +
        '        <Property Name="HighDefinitionAvailable" Type="Edm.Boolean" Nullable="false" />\r\n' +
        '        <Property Name="Runtime" Type="Edm.Int32" Nullable="true" />\r\n' +
        '        <Property Name="Rating" Type="Edm.String" Nullable="true" MaxLength="10" Unicode="false" />\r\n' +
        '      </ComplexType>\r\n' +
        '      <ComplexType Name="DeliveryFormatAvailability">\r\n' +
        '        <Property Name="Available" Type="Edm.Boolean" Nullable="false" />\r\n' +
        '        <Property Name="AvailableFrom" Type="Edm.DateTime" Nullable="true" />\r\n' +
        '        <Property Name="AvailableTo" Type="Edm.DateTime" Nullable="true" />\r\n' +
        '        <Property Name="Runtime" Type="Edm.Int32" Nullable="true" />\r\n' +
        '        <Property Name="Rating" Type="Edm.String" Nullable="true" MaxLength="10" Unicode="false" />\r\n' +
        '      </ComplexType>\r\n' +
        '      <EntityType Name="TitleScreenFormat">\r\n' +
        '        <Key><PropertyRef Name="TitleId" /><PropertyRef Name="DeliveryFormat" /><PropertyRef Name="Format" /></Key>\r\n' +
        '        <Property Name="TitleId" Type="Edm.String" Nullable="false" MaxLength="30" />\r\n' +
        '        <Property Name="DeliveryFormat" Type="Edm.String" Nullable="false" MaxLength="10" Unicode="false" />\r\n' +
        '        <Property Name="Format" Type="Edm.String" Nullable="false" MaxLength="30" Unicode="false" />\r\n' +
        '        <NavigationProperty Name="Title" Type="TestCatalog.Model.Title" Partner="ScreenFormats" >\r\n' +
        '            <ReferentialConstraint Property="TitleId" ReferencedProperty="Id" />' +
        '        </NavigationProperty>' +
        '      </EntityType>\r\n' +
        '      <Function Name="ProductsByRating">' +
        '        <ReturnType Type="Collection(TestCatalog.Model.Title)" />\r\n' +
        '      </Function>\r\n' +
        '    </Schema>\r\n' +
        '    <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="Test.Catalog">\r\n' +
        '      <EntityContainer Name="TestCatalog" >\r\n' +
        '        <FunctionImport Name="Movies" EntitySet="Titles" Function="estCatalog.Model.GetTitles" />\r\n' +
        '        <FunctionImport Name="Series" EntitySet="Titles" Function="estCatalog.Model.GetTitles" />\r\n' +
        '        <FunctionImport Name="Seasons" EntitySet="Titles" Function="estCatalog.Model.GetTitles" />\r\n' +
        '        <FunctionImport Name="Discs" EntitySet="Titles" Function="estCatalog.Model.GetTitles" />\r\n' +
        '        <FunctionImport Name="Episodes" EntitySet="Titles" Function="estCatalog.Model.GetTitles" />\r\n' +
        '        <EntitySet Name="Genres" EntityType="TestCatalog.Model.Genre" >\r\n' +
        '            <NavigationPropertyBinding Target="Titles" Path="Titles" />\r\n' +
        '        </EntitySet>\r\n' +
        '        <EntitySet Name="Languages" EntityType="TestCatalog.Model.Language" >\r\n' +
        '            <NavigationPropertyBinding Target="Titles" Path="Languages" />\r\n' +
        '        </EntitySet>\r\n' +
        '        <EntitySet Name="People" EntityType="TestCatalog.Model.Person" >\r\n' +
        '            <NavigationPropertyBinding Target="Titles" Path="Cast" />\r\n' +
        '            <NavigationPropertyBinding Target="Titles" Path="Directors" />\r\n' +
        '        </EntitySet>' +
        '        <EntitySet Name="TitleAudioFormats" EntityType="TestCatalog.Model.TitleAudioFormat" >\r\n' +
        '            <NavigationPropertyBinding Target="Titles" Path="AudioFormats" />\r\n' +
        '        </EntitySet>\r\n' +
        '        <EntitySet Name="TitleAwards" EntityType="TestCatalog.Model.TitleAward" >\r\n' +
        '            <NavigationPropertyBinding Target="Titles" Path="Awards" />\r\n' +
        '        </EntitySet>\r\n' +
        '        <EntitySet Name="Titles" EntityType="TestCatalog.Model.Title" >\r\n' +
        '            <NavigationPropertyBinding Target="TitleAudioFormats" Path="Title" />\r\n' +
        '            <NavigationPropertyBinding Target="TitleAwards" Path="Title" />\r\n' +
        '            <NavigationPropertyBinding Target="Titles" Path="Disc" />\r\n' +
        '            <NavigationPropertyBinding Target="Titles" Path="Movie" />\r\n' +
        '            <NavigationPropertyBinding Target="Titles" Path="Season" />\r\n' +
        '            <NavigationPropertyBinding Target="Titles" Path="Series" />\r\n' +
        '            <NavigationPropertyBinding Target="TitleScreenFormats" Path="ScreenFormats" />\r\n' +
        '            <NavigationPropertyBinding Target="People" Path="TitlesActedIn" />\r\n' +
        '            <NavigationPropertyBinding Target="Languages" Path="Titles" />\r\n' +
        '            <NavigationPropertyBinding Target="People" Path="TitlesDirected" />\r\n' +
        '            <NavigationPropertyBinding Target="Genres" Path="Genres" />\r\n' +
        '        </EntitySet>\r\n' +
        '        <EntitySet Name="TitleScreenFormats" EntityType="TestCatalog.Model.TitleScreenFormat" >\r\n' +
        '            <NavigationPropertyBinding Target="TitleScreenFormats" Path="Title" />\r\n' +
        '        </EntitySet>\r\n' +
        '      </EntityContainer>\r\n' +
        '    </Schema>\r\n' +
        '  </edmx:DataServices>\r\n' +
        '</edmx:Edmx>\r\n' +
        '';

    var testFullMetadataResult = {
        "version": "4.0",
        "dataServices": {
            "dataServiceVersion": "4.0",
            "maxDataServiceVersion": "4.0",
            "schema": [{
                "namespace": "TestCatalog.Model",
                "entityType": [{
                    "name": "Genre",
                    "key": [{ "propertyRef": [{ "name": "Name"}] }],
                    "property": [{ "name": "Name", "type": "Edm.String", "nullable": "false", "maxLength": "50", "unicode": "false"}],
                    "navigationProperty": [{ "name": "Titles", "partner": "Series", "type": "Collection(TestCatalog.Model.Title)"}]
                }, {
                    "name": "Language",
                    "key": [{ "propertyRef": [{ "name": "Name"}] }],
                    "property": [{ "name": "Name", "type": "Edm.String", "nullable": "false", "maxLength": "80", "unicode": "false"}],
                    "navigationProperty": [{ "name": "Titles", "partner": "Languages", "type": "Collection(TestCatalog.Model.Title)"}]
                }, {
                    "name": "Person",
                    "key": [{ "propertyRef": [{ "name": "Id"}] }],
                    "property": [
                        { "name": "Id", "type": "Edm.Int32", "nullable": "false" },
                        { "name": "Name", "type": "Edm.String", "nullable": "false", "maxLength": "80", "unicode": "true" }
                    ],
                    "navigationProperty": [
                        { "name": "Awards", "partner": "Person", "type": "Collection(TestCatalog.Model.TitleAward)" },
                        { "name": "TitlesActedIn", "partner": "Cast", "type": "Collection(TestCatalog.Model.Title)" },
                        { "name": "TitlesDirected", "partner": "Directors", "type": "Collection(TestCatalog.Model.Title)" }
                    ]
                }, {
                    "name": "TitleAudioFormat",
                    "key": [{ "propertyRef": [{ "name": "TitleId" }, { "name": "DeliveryFormat" }, { "name": "Language" }, { "name": "Format"}] }],
                    "property": [
                        { "name": "TitleId", "type": "Edm.String", "nullable": "false", "maxLength": "30" },
                        { "name": "DeliveryFormat", "type": "Edm.String", "nullable": "false", "maxLength": "10", "unicode": "false" },
                        { "name": "Language", "type": "Edm.String", "nullable": "false", "maxLength": "30", "unicode": "false" },
                        { "name": "Format", "type": "Edm.String", "nullable": "false", "maxLength": "30", "unicode": "false" }
                    ],
                    "navigationProperty": [{ "name": "Title", "partner": "AudioFormats", "referentialConstraint": [{"property": "TitleId", "referencedProperty": "Id"}], "type": "TestCatalog.Model.Title" }]
                }, {
                    "name": "TitleAward",
                    "key": [{ "propertyRef": [{ "name": "Id"}] }],
                    "property": [
                        { "name": "Id", "type": "Edm.Guid", "nullable": "false" },
                        { "name": "Type", "type": "Edm.String", "nullable": "false", "maxLength": "30", "unicode": "false" },
                        { "name": "Category", "type": "Edm.String", "nullable": "false", "maxLength": "60", "unicode": "false" },
                        { "name": "Year", "type": "Edm.Int32", "nullable": "true" }, { "name": "Won", "type": "Edm.Boolean", "nullable": "false" }
                    ],
                    "navigationProperty": [
                        { "name": "Title", "partner": "Awards", "type": "TestCatalog.Model.Title" },
                        { "name": "Person", "partner": "Awards", "type": "TestCatalog.Model.Person" }
                    ]
                }, {
                    "name": "Title",
                    "hasStream": "true",
                    "key": [{ "propertyRef": [{ "name": "Id"}] }],
                    "property": [
                        { "name": "Id", "type": "Edm.String", "nullable": "false", "maxLength": "30" },
                        { "name": "Synopsis", "type": "Edm.String", "nullable": "true", "maxLength": "Max", "unicode": "false" },
                        { "name": "ShortSynopsis", "type": "Edm.String", "nullable": "true", "maxLength": "Max", "unicode": "false" },
                        { "name": "AverageRating", "type": "Edm.Double", "nullable": "true" }, { "name": "ReleaseYear", "type": "Edm.Int32", "nullable": "true" },
                        { "name": "Url", "type": "Edm.String", "nullable": "true", "maxLength": "200", "unicode": "false" },
                        { "name": "Runtime", "type": "Edm.Int32", "nullable": "true" },
                        { "name": "Rating", "type": "Edm.String", "nullable": "true", "maxLength": "10", "unicode": "false" },
                        { "name": "DateModified", "type": "Edm.DateTime", "nullable": "false"},
                        { "name": "Type", "type": "Edm.String", "nullable": "false", "maxLength": "8", "unicode": "false" },
                        { "name": "BoxArt", "type": "TestCatalog.Model.BoxArt", "nullable": "false" },
                        { "name": "ShortName", "type": "Edm.String", "nullable": "false", "maxLength": "200", "unicode": "false" },
                        { "name": "Name", "type": "Edm.String", "nullable": "false", "maxLength": "200", "unicode": "false" },
                        { "name": "Instant", "type": "TestCatalog.Model.InstantAvailability", "nullable": "false" },
                        { "name": "Dvd", "type": "TestCatalog.Model.DeliveryFormatAvailability", "nullable": "false" },
                        { "name": "BluRay", "type": "TestCatalog.Model.DeliveryFormatAvailability", "nullable": "false" },
                        { "name": "TinyUrl", "type": "Edm.String", "nullable": "false" },
                        { "name": "WebsiteUrl", "type": "Edm.String", "nullable": "true" },
                        { "name": "TestApiId", "type": "Edm.String", "nullable": "false" }
                    ],
                    "navigationProperty": [
                        { "name": "AudioFormats", "nullable": "false", "partner": "Title", "type": "Collection(TestCatalog.Model.TitleAudioFormat)" },
                        { "name": "Awards", "nullable": "false", "partner": "Title", "type": "Collection(TestCatalog.Model.TitleAward)" },
                        { "name": "Disc", "type": "Collection(TestCatalog.Model.Title)" },
                        { "name": "Movie", "type": "Collection(TestCatalog.Model.Title)" },
                        { "name": "Season", "type": "Collection(TestCatalog.Model.Title)" },
                        { "name": "Series", "type": "Collection(TestCatalog.Model.Title)" },
                        { "name": "ScreenFormats", "nullable": "false", "partner": "Title", "type": "Collection(TestCatalog.Model.TitleScreenFormat)" },
                        { "name": "Cast", "nullable": "false", "partner": "TitlesActedIn", "type": "Collection(TestCatalog.Model.Person)" },
                        { "name": "Languages", "nullable": "false", "partner": "Titles", "type": "Collection(TestCatalog.Model.Language)" },
                        { "name": "Directors", "nullable": "false", "partner": "TitlesDirected", "type": "Collection(TestCatalog.Model.Person)" },
                        { "name": "Genres", "nullable": "false", "partner": "Titles", "type": "Collection(TestCatalog.Model.Genre)" }
                    ]
                }, {
                    "name": "TitleScreenFormat",
                    "key": [{ "propertyRef": [{ "name": "TitleId" }, { "name": "DeliveryFormat" }, { "name": "Format"}]}],
                    "property": [
                        { "name": "TitleId", "type": "Edm.String", "nullable": "false", "maxLength": "30" },
                        { "name": "DeliveryFormat", "type": "Edm.String", "nullable": "false", "maxLength": "10", "unicode": "false" },
                        { "name": "Format", "type": "Edm.String", "nullable": "false", "maxLength": "30", "unicode": "false" }
                    ],
                    "navigationProperty": [{ "name": "Title", "partner": "ScreenFormats", "referentialConstraint": [{"property": "TitleId", "referencedProperty": "Id"}], "type": "TestCatalog.Model.Title" }]
                }],
                "complexType": [{
                    "name": "BoxArt",
                    "property": [
                        { "name": "SmallUrl", "type": "Edm.String", "nullable": "true", "maxLength": "80", "unicode": "false" },
                        { "name": "MediumUrl", "type": "Edm.String", "nullable": "true", "maxLength": "80", "unicode": "false" },
                        { "name": "LargeUrl", "type": "Edm.String", "nullable": "true", "maxLength": "80", "unicode": "false" },
                        { "name": "HighDefinitionUrl", "type": "Edm.String", "nullable": "true", "maxLength": "80", "unicode": "false" }
                    ]
                }, {
                    "name": "InstantAvailability",
                    "property": [
                        { "name": "Available", "type": "Edm.Boolean", "nullable": "false" },
                        { "name": "AvailableFrom", "type": "Edm.DateTime", "nullable": "true" },
                        { "name": "AvailableTo", "type": "Edm.DateTime", "nullable": "true" },
                        { "name": "HighDefinitionAvailable", "type": "Edm.Boolean", "nullable": "false" },
                        { "name": "Runtime", "type": "Edm.Int32", "nullable": "true" },
                        { "name": "Rating", "type": "Edm.String", "nullable": "true", "maxLength": "10", "unicode": "false" }
                    ]
                }, {
                    "name": "DeliveryFormatAvailability",
                    "property": [
                        { "name": "Available", "type": "Edm.Boolean", "nullable": "false" },
                        { "name": "AvailableFrom", "type": "Edm.DateTime", "nullable": "true" },
                        { "name": "AvailableTo", "type": "Edm.DateTime", "nullable": "true" },
                        { "name": "Runtime", "type": "Edm.Int32", "nullable": "true" },
                        { "name": "Rating", "type": "Edm.String", "nullable": "true", "maxLength": "10", "unicode": "false" }
                    ]
                }],
                "function": [
                {
                   "name": "ProductsByRating",
                   "returnType": {"type": "Collection(TestCatalog.Model.Title)" }
                }]
            }, {
                "namespace": "Test.Catalog",
                "entityContainer": {
                    "name": "TestCatalog",
                    "functionImport": [
                        { "entitySet": "Titles", "function": "estCatalog.Model.GetTitles", "name": "Movies"},
                        { "entitySet": "Titles", "function": "estCatalog.Model.GetTitles", "name": "Series"},
                        { "entitySet": "Titles", "function": "estCatalog.Model.GetTitles", "name": "Seasons" },
                        { "entitySet": "Titles", "function": "estCatalog.Model.GetTitles", "name": "Discs" },
                        { "entitySet": "Titles", "function": "estCatalog.Model.GetTitles", "name": "Episodes" }
                    ], "entitySet": [
                        { "name": "Genres", "entityType": "TestCatalog.Model.Genre", "navigationPropertyBinding": [{"path": "Titles", "target": "Titles"}] },
                        { "name": "Languages", "entityType": "TestCatalog.Model.Language", "navigationPropertyBinding": [{ "path": "Languages", "target": "Titles"}] },
                        { "name": "People", "entityType": "TestCatalog.Model.Person", "navigationPropertyBinding": [{ "path": "Cast", "target": "Titles" }, { "path": "Directors", "target": "Titles"}] },
                        { "name": "TitleAudioFormats", "entityType": "TestCatalog.Model.TitleAudioFormat", "navigationPropertyBinding": [{ "path": "AudioFormats", "target": "Titles"}] },
                        { "name": "TitleAwards", "entityType": "TestCatalog.Model.TitleAward", "navigationPropertyBinding": [{ "path": "Awards", "target": "Titles"}] },
                        { "name": "Titles", "entityType": "TestCatalog.Model.Title", "navigationPropertyBinding": [{ "path": "Title", "target": "TitleAudioFormats" }, { "path": "Title", "target": "TitleAwards" }, { "path": "Disc", "target": "Titles" }, { "path": "Movie", "target": "Titles" }, { "path": "Season", "target": "Titles" }, { "path": "Series", "target": "Titles" }, { "path": "ScreenFormats", "target": "TitleScreenFormats" }, { "path": "TitlesActedIn", "target": "People" }, { "path": "Titles", "target": "Languages" }, { "path": "TitlesDirected", "target": "People" }, { "path": "Genres", "target": "Genres"}] },
                        { "name": "TitleScreenFormats", "entityType": "TestCatalog.Model.TitleScreenFormat", "navigationPropertyBinding": [{ "path": "Title", "target": "TitleScreenFormats"}] }
                    ]
                }
            }]
        }
    };

    var testCsdlV4 = '' +
    '<edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\r\n' +
    '  <edmx:DataServices xmlns:m="http://docs.oasis-open.org/odata/ns/metadata" m:MaxDataServiceVersion="4.0" m:DataServiceVersion="4.0">\r\n' +
    '    <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="TestCatalog.Model"/>\r\n' +
    '  </edmx:DataServices>\r\n' +
    '</edmx:Edmx>';

    var testMetadataV4 = {
        "version": "4.0",
        "dataServices": {
            "maxDataServiceVersion": "4.0",
            "dataServiceVersion": "4.0",
            "schema": [{
                "namespace": "TestCatalog.Model"
            }]
        }
    };

    djstest.addTest(function testParseConceptualModelElement() {
        // Test cases as input XML text / result tuples.
        var cases = [
            { i: "<foo />", e: null },
            { i: '<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" />', e: { version: "4.0"} },
            { i: '<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx-invalid" />', e: null },
            { i: testCsdlV4, e: testMetadataV4 },
            { i: testFullCsdl, e: testFullMetadataResult }
        ];

        var i, len;
        for (i = 0, len = cases.length; i < len; i++) {
            var doc = window.odatajs.xml.xmlParse(cases[i].i);
            var schema = window.odatajs.oData.metadata.parseConceptualModelElement(doc.documentElement);
            djstest.assertAreEqualDeep(schema, cases[i].e, "parseConceptualModelElement result matches target");
        }

        djstest.done();
    });

    djstest.addTest(function metadataVocabularyTest() {
        var testCsdl = '' +
        '<?xml version="1.0" encoding="utf-8" standalone="yes"?>\r\n' +
        '<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" >\r\n' +
        '  <edmx:DataServices xmlns:m="http://docs.oasis-open.org/odata/ns/metadata" m:MaxDataServiceVersion="4.0" m:DataServiceVersion="4.0">\r\n' +
        '    <Schema Namespace="TestCatalog.Model" xmlns="http://docs.oasis-open.org/odata/ns/edm">\r\n' +
        '          <Term Name="Rating" Type="Edm.Int32" />\r\n' +
        '          <Term Name="CanEdit" Type="Edm.String" />\r\n' +
        '      <EntityType Name="Genre">\r\n' +
        '        <Key><PropertyRef Name="Name" /></Key>\r\n' +
        '        <Property Name="Name" Type="Edm.String" Nullable="false" MaxLength="50" Unicode="false" />\r\n' +
        '      </EntityType></Schema></edmx:DataServices></edmx:Edmx>';


        var doc = window.odatajs.xml.xmlParse(testCsdl);
        var schema = window.odatajs.oData.metadata.parseConceptualModelElement(doc.documentElement);

        djstest.assertAreEqual(schema.dataServices.schema[0].term.length, 2, "schema.DataServices.Schema.Term.length === 2");
        djstest.assertAreEqual(schema.dataServices.schema[0].term[0].name, "Rating", "schema.DataServices.Schema.Term[0].name === 'Rating'");
        djstest.assertAreEqual(schema.dataServices.schema[0].term[1].name, "CanEdit", "schema.DataServices.Schema.Term[1].name === 'CanEdit'");
        djstest.done();
    });

    djstest.addTest(function metadataAnnotationTest() {
        var testCsdl = '' +
        '<?xml version="1.0" encoding="utf-8" standalone="yes"?>\r\n' +
        '<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" >\r\n' +
        '  <edmx:DataServices xmlns:m="http://docs.oasis-open.org/odata/ns/metadata" m:MaxDataServiceVersion="4.0" m:DataServiceVersion="4.0">\r\n' +
        '    <Schema Namespace="TestCatalog.Model" xmlns="http://docs.oasis-open.org/odata/ns/edm">\r\n' +
        '      <EntityType Name="Genre">\r\n' +
        '        <Key><PropertyRef Name="Name" /></Key>\r\n' +
        '        <Property Name="Name" Type="Edm.String" Nullable="false" MaxLength="50" Unicode="false" />\r\n' +
        '      </EntityType>\r\n' +
        '      <EntityType Name="Language">\r\n' +
        '        <Key><PropertyRef Name="Name" /></Key>\r\n' +
        '        <Property Name="Name" Type="Edm.String" Nullable="false" MaxLength="80" Unicode="false" />\r\n' +
        '        <Property Name="Id" Type="Edm.Int32" />\r\n' +
        '      </EntityType>\r\n' +
        '      <Annotations Target="TestCatalog.Model.Genre/Name">\r\n' +
        '        <Annotation String="Genre Name" Term="Org.OData.Display.V1.DisplayName"/>\r\n' +
        '      </Annotations>\r\n' +
        '      <Annotations Target="TestCatalog.Model.Language/Name">\r\n' +
        '        <Annotation String="Language Name" Term="Org.OData.Display.V1.DisplayName"/>\r\n' +
        '        <Annotation String="Language Name 2" Term="Org.OData.Display.V1.DisplayName 2"/>\r\n' +
        '      </Annotations>\r\n' +
        '    </Schema></edmx:DataServices></edmx:Edmx>';


        var doc = window.odatajs.xml.xmlParse(testCsdl);
        var schema = window.odatajs.oData.metadata.parseConceptualModelElement(doc.documentElement);

        djstest.assertAreEqual(schema.dataServices.schema[0].annotations.length, 2, "Annotations number");
        djstest.assertAreEqual(schema.dataServices.schema[0].annotations[0].annotation.length, 1, "Annotation number");
        djstest.assertAreEqual(schema.dataServices.schema[0].annotations[0].annotation[0].string, "Genre Name", "Annotation name");
        djstest.assertAreEqual(schema.dataServices.schema[0].annotations[0].annotation[0].term, "Org.OData.Display.V1.DisplayName", "Annotation term");
        djstest.assertAreEqual(schema.dataServices.schema[0].annotations[1].annotation.length, 2, "Annotation number");
        djstest.assertAreEqual(schema.dataServices.schema[0].annotations[1].annotation[0].string, "Language Name", "Annotation name");
        djstest.assertAreEqual(schema.dataServices.schema[0].annotations[1].annotation[0].term, "Org.OData.Display.V1.DisplayName", "Annotation term");
        djstest.assertAreEqual(schema.dataServices.schema[0].annotations[1].annotation[1].string, "Language Name 2", "Annotation name");
        djstest.assertAreEqual(schema.dataServices.schema[0].annotations[1].annotation[1].term, "Org.OData.Display.V1.DisplayName 2", "Annotation term");
        djstest.done();
    });

    // DATAJS INTERNAL END
})(this);
