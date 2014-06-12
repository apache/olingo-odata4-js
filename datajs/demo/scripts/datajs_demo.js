var run = function() {
    //testJQueryReadMetadata();
    //runSimpleReadRequest();
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
        'Accept': 'application/atom+xml',
        "Odata-Version": "4.0",
        "OData-MaxVersion": "4.0"
    };

    var request =
    {
        headers: oHeaders,
        requestUri: "http://services.odata.org/OData/OData.svc/Categories",
        data: null,
    };
    var successFunction = function (data) {
        document.getElementById("simpleRead").innerHTML = JSON.stringify(data, undefined, 2);
    };
    var failFunction = function (err) {
        alert("err");
        alert(JSON.stringify(err));
    };
    OData.read(request, successFunction, failFunction);
};

var runSimpleReadRequestWithMetadata = function () {
    var oHeaders = {
        'Accept': 'text/html,application/xhtml+xml,application/xml,application/json;odata.metadata=none',
        "Odata-Version": "4.0",
        "OData-MaxVersion": "4.0",
        "Prefer": "odata.allow-entityreferences"
    };
    
    var readMetadataSuccess = function (metadata) {
        document.getElementById("metadata").innerHTML = JSON.stringify(metadata, undefined, 2);
        var request =
        {
            headers: oHeaders,
            //requestUri: "http://services.odata.org/OData/OData.svc/Categories",
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
        OData.read(request, successFunction, failFunction, null, null, metadata);
    };

    var readMetadataFail = function (err) {
        alert("err");
        alert(JSON.stringify(err));
    };
    
    var metadataRequest =
    {
        headers: oHeaders,
        //requestUri: "http://services.odata.org/OData/OData.svc/$metadata",
        requestUri: "http://odatasampleservices.azurewebsites.net/V4/OData/OData.svc/$metadata", //"http://localhost:6630/PrimitiveKeys.svc/$metadata",
        data: null,
    };

    OData.read(metadataRequest, readMetadataSuccess, readMetadataFail, OData.metadataHandler);
};

var readWithJsonP = function() {
    var sUrl2 = "http://services.odata.org/V3/OData/OData.svc/Products?$expand=Category";

    var oRequest = {
        requestUri: sUrl2,
        enableJsonpCallback: true,
    };

    OData.read(oRequest, function (data) {
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
