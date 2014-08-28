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

// odata-xml-tests.js

(function (window, undefined) {

    // DATAJS INTERNAL START

    djstest.addTest(function getURIInfoTest() {
        var tests = [
            { input: "https://host.com:8080/path1/path2?p1=1&p2=2#fragment", expected: { scheme: "https:", authority: "//host.com:8080", path: "/path1/path2", query: "?p1=1&p2=2", fragment: "#fragment", isAbsolute: true} },
            { input: "http://host.com:8080/path1/path2?p1=1&p2=2#fragment", expected: { scheme: "http:", authority: "//host.com:8080", path: "/path1/path2", query: "?p1=1&p2=2", fragment: "#fragment", isAbsolute: true} },
            { input: "https:", expected: { scheme: "https:", isAbsolute: true} },
            { input: "http:", expected: { scheme: "http:", isAbsolute: true} },
            { input: "//host.com", expected: { authority: "//host.com", isAbsolute: false} },
            { input: "path1", expected: { path: "path1", isAbsolute: false} },
            { input: "?query", expected: { query: "?query", isAbsolute: false} },
            { input: "#fragment", expected: { fragment: "#fragment", isAbsolute: false} },
            { input: undefined, expected: { isAbsolute: false} },
            { input: "", expected: { isAbsolute: false} },
            { input: null, expected: { isAbsolute: false} }
        ];

        var i, len;
        for (i = 0, len = tests.length; i < len; i++) {
            var actual = odatajs.utils.getURIInfo(tests[i].input);
            djstest.assertAreEqualDeep(actual, tests[i].expected, "test " + i + "didn't return the expected URI parts");
        }
        djstest.done();
    });

    djstest.addTest(function normalizeURICaseTest() {
        var tests = [
            { uri: "hTTp://HOST.com/path1/Path2/PATH3?Query1=x&query2=Y#Fragment", expected: "http://host.com/path1/Path2/PATH3?Query1=x&query2=Y#Fragment" },
            { uri: "http://fabrikam%20user%3AHisPassWord@www.FaBriKAM.com:5895/Path%3A%201?q1=hi%20%3Ato%20you", expected: "http://fabrikam%20user%3aHisPassWord@www.fabrikam.com:5895/Path%3a%201?q1=hi%20%3ato%20you" },
            { uri: "/PATH1/PATH2?P1=AbC#fraGment", expected: "/PATH1/PATH2?P1=AbC#fraGment" },
            { uri: "HttP://" + encodeURIComponent("FTP://www.example.com&story=breaking_news:password@www.HOST.CoM:5678/"), expected: "http://" + encodeURIComponent("FTP://www.example.com&story=breaking_news:password@www.HOST.CoM:5678/").toLowerCase() }
        ];

        var i, len;
        for (i = 0, len = tests.length; i < len; i++) {
            var actual = odatajs.utils.normalizeURICase(tests[i].uri, tests[i].base);
            djstest.assertAreEqual(actual, tests[i].expected, "test " + i + "didn't return the expected URI");
        }
        djstest.done();
    });

    djstest.addTest(function normalizeURITest() {
        var tests = [
            { uri: "http://host.com/path1#fragment", base: "http://base", expected: "http://host.com/path1#fragment" },
            { uri: "//host.com/path1?p1=0", base: "http://base?p2=1", expected: "http://host.com/path1?p1=0" },
            { uri: "?p1=0#fragment", base: "http://base/basepath", expected: "http://base/basepath?p1=0#fragment" },
            { uri: "?p1=0#fragment", base: "http://base/basepath?p2=1", expected: "http://base/basepath?p1=0#fragment" },
            { uri: "#fragment", base: "http://base/basepath?p2=1", expected: "http://base/basepath?p2=1#fragment" },
            { uri: "/path1/path2?p1=0", base: "http://base/basePath", expected: "http://base/path1/path2?p1=0" },
            { uri: "path1/path2?p1=0", base: "http://base/basepath", expected: "http://base/path1/path2?p1=0" },
            { uri: "path1/path2?p1=0", base: "http://base/basepath/basepath2", expected: "http://base/basepath/path1/path2?p1=0" },
            { uri: "", base: "http://base/basepath?p1=0#fragment", expected: "http://base/basepath?p1=0" },
            { uri: "path1/path2?p1=0", base: "", expected: "path1/path2?p1=0" },
            { uri: "/a/b/c/./../../g", base: "http://base/basepath", expected: "http://base/a/g" },
            { uri: "a/b/c/././../../g", base: "http://base/basepath/", expected: "http://base/basepath/a/g" },
            { uri: "../a/b/c/././../../g", base: "http://base/basepath/", expected: "http://base/a/g" },
            { uri: "./a/b/c/././../../g", base: "http://base/basepath/", expected: "http://base/basepath/a/g" },
            { uri: "/../a/b/c/././../../g", base: "http://base/basepath/", expected: "http://base/a/g" },
            { uri: "/./a/b/c/././../../g", base: "http://base/basepath/", expected: "http://base/a/g" }
        ];

        var i, len;
        for (i = 0, len = tests.length; i < len; i++) {
            var actual = odatajs.utils.normalizeURI(tests[i].uri, tests[i].base);
            djstest.assertAreEqual(actual, tests[i].expected, "test " + i + "didn't return the expected normalized URI");
        }
        djstest.done();
    });

    djstest.addTest(function xmlParseTest() {
        var xml = '<root xmlns:n1="http://namespace1" xml:base="http://base.org" />';
        var root = odatajs.xml.xmlParse(xml);
        djstest.assert(root, "xml._parse didn't return a xml dom object");
        djstest.done();
    });

    djstest.addTest(function xmlbaseURITest() {
        var xml = "\
         <root xmlns:n1=\"http://namespace1\" \r\n\
               xml:base=\"http://base.org\"> \r\n\
           <element base=\"this is not a xml base attribute\" /> \r\n\
         </root>\r\n";

        var doc = odatajs.xml.xmlParse(xml);
        var root = odatajs.xml.xmlFirstChildElement(doc);
        var child = odatajs.xml.xmlFirstChildElement(root);

        djstest.assertAreEqual(odatajs.xml.xmlBaseURI(root), "http://base.org", "xml._baseURI didn't return the expected value");
        djstest.assert(!odatajs.xml.xmlBaseURI(child), "xml._baseURI returned a value when it wasn't expected");
        djstest.done();
    });

    djstest.addTest(function xmlAttributeValueTest() {
        var xml = "\
     <root xmlns:n1=\"http://namespace1\" \r\n\
           xml:base=\"http://base.org\"> \r\n\
        <element attribute=\"value\" n1:nsAttribute=\"nsValue\" /> \r\n\
     </root> \r\n";

        var doc = odatajs.xml.xmlParse(xml);
        var root = odatajs.xml.xmlFirstChildElement(doc);
        var child = odatajs.xml.xmlFirstChildElement(root);

        djstest.assertAreEqual(odatajs.xml.xmlAttributeValue(child, "attribute"), "value", "xml._attribute didn't return the expected value for attribute");
        djstest.assertAreEqual(odatajs.xml.xmlAttributeValue(child, "nsAttribute", "http://namespace1"), "nsValue", "xml._attribute didn't return the expected value for nsAttribute");
        djstest.assert(!odatajs.xml.xmlAttributeValue(child, "nsAttribute"), "xml._attribute returned a value for nsAttribute without specifying a namespace");

        djstest.done();
    });

    djstest.addTest(function xmlLocalNameTest() {
        var xml = "<root xmlns:n1=\"http://namespace1\" /> \r\n";

        var doc = odatajs.xml.xmlParse(xml);
        var root = odatajs.xml.xmlFirstChildElement(doc);

        djstest.assertAreEqual(odatajs.xml.xmlLocalName(root), "root", "xml._localName didn't return the expected localName of the root element");
        djstest.done();
    });

    djstest.addTest(function xmlFirstChildElement() {
        var xml = "\
         <root xmlns:n1=\"http://namespace1\" \r\n\
               xml:base=\"http://base.org\"> \r\n\
           <element1 /> \r\n\
           <element2 /> \r\n\
         </root>\r\n";


        var doc = odatajs.xml.xmlParse(xml);
        var root = odatajs.xml.xmlFirstChildElement(doc);
        var child = odatajs.xml.xmlFirstChildElement(root);

        djstest.assertAreEqual(odatajs.xml.xmlLocalName(child), "element1", "xml.firstElement returned didn't return the expected element");
        djstest.done();
    });

    djstest.addTest(function xmlChildElementsTest() {
        var xml = "\
         <root xmlns:n1=\"http://namespace1\" \r\n\
               xml:base=\"http://base.org\"> \r\n\
           <element1 /> \r\n\
           <element2 xml:base=\"http://otherBase.org\" /> \r\n\
           <n1:element3 xml:base=\"path1/path2\" /> \r\n\
         </root>\r\n";

        var expected = [
            { localName: "element1", nsURI: null },
            { localName: "element2", nsURI: null },
            { localName: "element3", nsURI: "http://namespace1" }
        ];

        var actual = [];

        var doc = odatajs.xml.xmlParse(xml);
        var root = odatajs.xml.xmlFirstChildElement(doc);
    
        odatajs.xml.xmlChildElements(root, function (child) {
            djstest.log("in child elements callback");
            actual.push({
                localName: odatajs.xml.xmlLocalName(child),
                nsURI: odatajs.xml.xmlNamespaceURI(child)
            });
        });

        djstest.assertAreEqualDeep(actual, expected, "xml.childElements didn't return the expected elements");
        djstest.done();
    });

    djstest.addTest(function xmlAttributesTest() {
        var xml = "\
         <root xmlns:n1=\"http://namespace1\" \r\n\
               xml:base=\"http://base.org\" \r\n\
               attribute=\"value\" \r\n\
               n1:nsAttribute=\"nsValue\" />\r\n";

        var expected = {
            n1: { localName: "n1", nsURI: "http://www.w3.org/2000/xmlns/", value: "http://namespace1" },
            base: { localName: "base", nsURI: "http://www.w3.org/XML/1998/namespace", value: "http://base.org" },
            attribute: { localName: "attribute", nsURI: null, value: "value" },
            nsAttribute: { localName: "nsAttribute", nsURI: "http://namespace1", value: "nsValue" }
        };

        var actual = {};

        var doc = odatajs.xml.xmlParse(xml);
        var root = odatajs.xml.xmlFirstChildElement(doc);

        odatajs.xml.xmlAttributes(root, function (attribute) {
            djstest.log("in child elements callback");
            var localName = odatajs.xml.xmlLocalName(attribute);
            actual[localName] = {
                localName: localName, 
                nsURI: odatajs.xml.xmlNamespaceURI(attribute),
                value: attribute.value
            };
        });

        djstest.assertAreEqualDeep(actual, expected, "xml.attributes returned didn't return the expected attributes");
        djstest.done();
    });

    djstest.addTest(function hasLeadingOrTrailingWhitespaceTest() {
        // tests are in text / expected format.
        var tests = [
            { t: "", r: false },
            { t: " ", r: true },
            { t: "text", r: false },
            { t: "text with spaces", r: false },
            { t: "not \r\n really", r: false },
            { t: " at start", r: true },
            { t: "at end ", r: true },
            { t: "end\r", r: true },
            { t: "end\n", r: true },
            { t: "end\r\n", r: true }
        ];

        var i, len;
        for (i = 0, len = tests.length; i < len; i++) {
            var result = odatajs.xml.hasLeadingOrTrailingWhitespace(tests[i].t);
            djstest.assertAreEqual(result, tests[i].r, "match for " + tests[i].t);
        }

        djstest.done();
    });

    djstest.addTest(function xmlInnerTextTest() {
        // Tests are in test / expected format.
        var tests = [
            { t: "<t>text</t>", r: "text" },
            { t: "<t>text with a <![CDATA[cdata block]]></t>", r: "text with a cdata block" },
            { t: "<t> text </t>", r: " text " },
            { t: "<t> </t>", r: null },
            { t: "<t> <b>text</b> </t>", r: null },
            { t: "<t> preceding</t>", r: " preceding" },
            { t: "<t xml:space='preserve'> <b>text</b> </t>", r: "  " },
            { t: "<t xml:space='default'> <b>text</b> </t>", r: null}
        ];

        var i, len;
        for (i = 0, len = tests.length; i < len; i++) {
            var test = tests[i];
            var doc = odatajs.xml.xmlParse(test.t);
            var actual = odatajs.xml.xmlInnerText(doc);
            djstest.assertAreEqual(actual, test.r, "test for [" + test.t + "]");
        }

        djstest.done();
    });

    // DATAJS INTERNAL END
})(this);
