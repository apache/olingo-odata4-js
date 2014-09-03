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
var run = function() {
    //testJQueryReadMetadata();
    runSimpleReadRequest();
    runSimpleReadRequestWithMetadata();
    //    readWithJsonP();
    //alert(OData.odataRelatedLinksPrefix);
    //OData.odataRelatedLinksPrefix = "dasfs";
    //alert(OData.odataRelatedLinksPrefix);
    //var time = new Date("1992-08-06T00:00:00+01:00");
    //var jsonTime = {value : time};
    //var jsonstring = window.JSON.stringify(jsonTime);
    //alert(jsonstring);

    //time.offset = 100;
    //alert(time.offset);
    //var offsite = time.getTimezoneOffset();
    //alert(offsite);
};

var runSimpleReadRequest = function() {
    var oHeaders = {
        'Accept': 'application/json',
        "Odata-Version": "4.0",
        "OData-MaxVersion": "4.0"
    };

    var request =
    {
        headers: oHeaders,
        // requestUri: "http://services.odata.org/OData/OData.svc/Categories",
        requestUri: "http://odatasampleservices.azurewebsites.net/V4/OData/OData.svc/Categories",
        data: null,
    };
    var successFunction = function (data) {
        document.getElementById("simpleRead").innerHTML = JSON.stringify(data, undefined, 2);
    };
    var failFunction = function (err) {
        alert("err");
        alert(JSON.stringify(err));
    };
    odatajs.oData.read(request, successFunction, failFunction);
};

var runSimpleReadRequestWithMetadata = function () {
    var oHeaders = {
        'Accept': 'text/html,application/xhtml+xml,application/xml,application/json;odata.metadata=minimal',
        "Odata-Version": "4.0",
        "OData-MaxVersion": "4.0",
        "Prefer": "odata.allow-entityreferences"
    };
    
    var readMetadataSuccess = function (metadata) {
        document.getElementById("metadata").innerHTML = JSON.stringify(metadata, undefined, 2);
        var request =
        {
            headers: oHeaders,
            // requestUri: "http://services.odata.org/OData/OData.svc/Categories",
            requestUri: "http://odatasampleservices.azurewebsites.net/V4/OData/OData.svc/Products",
            data: null,
        };
        var successFunction = function(data) {
            document.getElementById("simpleReadWithMetadata").innerHTML = JSON.stringify(data, undefined, 2);
        };
        var failFunction = function(err) {
            alert("err");
            alert(JSON.stringify(err));
        };
        odatajs.oData.read(request, successFunction, failFunction, null, null, metadata);
    };

    var readMetadataFail = function (err) {
        alert("err");
        alert(JSON.stringify(err));
    };
    
    var metadataRequest =
    {
        headers: oHeaders,
        // requestUri: "http://services.odata.org/OData/OData.svc/$metadata",
        requestUri: "http://odatasampleservices.azurewebsites.net/V4/OData/OData.svc/$metadata", 
        // "http://localhost:6630/PrimitiveKeys.svc/$metadata",
        data: null,
    };

    odatajs.oData.read(metadataRequest, readMetadataSuccess, readMetadataFail, odatajs.V4.oData.metadataHandler);
};

var readWithJsonP = function() {
    var sUrl2 = "http://odatasampleservices.azurewebsites.net/V4/OData/OData.svc?$expand=Category";

    var oRequest = {
        requestUri: sUrl2,
        enableJsonpCallback: true,
    };

    odatajs.oData.read(oRequest, function (data) {
        document.getElementById("simpleReadWithJSONP").innerHTML = JSON.stringify(data, undefined, 2);
    },
    function (oError) {
        alert(oError.message);
    });
};

var testJQueryReadMetadata = function () {
    $.ajax({
        url: "http://odatasampleservices.azurewebsites.net/V4/OData/OData.svc/$metadata",
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml,application/json;odata.metadata=full',
            "Odata-Version": "4.0",
            "OData-MaxVersion": "4.0",
            "Prefer": "odata.allow-entityreferences"
        },
        type: "GET",
        converters: { "text xml": OData.metadataParser },
        dataType: "xml",
        success: function (xml, textStatus, jqXHR) {
            var data = OData.metadataParser2(xml) || undefined;
            document.getElementById("simpleReadWithMetadata").innerHTML = JSON.stringify(data, undefined, 2);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("err");
        }
    });
};
