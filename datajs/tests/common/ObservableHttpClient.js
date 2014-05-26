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

// ObservableHttpClient.js
// This object extends OData's default httpClient by supporting request and response recording sessions, and firing a custom
// JQuery event for each request/response.
//
// The events fired by this object are:
//      request: Before a request is made
//      success: Before the primary success handler is called
//
// To bind to an event, JQuery event attachers can be used on the object, e.g.
//      $(observableHttpClient).bind("request", function (request) { ... });
//
// To begin a new recording session, use:
//      var session = observableHttpClient.newSession();
//
// Requests and responses are then recorded in session.requests and session.responses. Session can be ended by session.end().
// Multiple simultaneous sessions are supported.

(function (window, undefined) {

    var ObservableHttpClient = function (provider) {
        this.provider = provider ? provider : OData.net.defaultHttpClient;
    };

    ObservableHttpClient.prototype.newSession = function () {
        return new Session(this);
    };

    ObservableHttpClient.prototype.request = function (request, success, error) {
        var that = this;

        $(this).triggerHandler("request", request);
        return this.provider.request(request, function (response) {
            $(that).triggerHandler("success", response);
            success(response);
        }, error);
    };


    var Session = function (client) {
        var that = this;

        this.client = client;
        this.clear();

        this.requestHandler = function (event, request) { that.requests.push(request); };
        $(client).bind("request", this.requestHandler);

        this.successHandler = function (event, response) { that.responses.push(response); };
        $(client).bind("success", this.successHandler);
    };

    Session.prototype.clear = function () {
        this.requests = [];
        this.responses = [];
    }

    Session.prototype.end = function () {
        $(this.client).unbind("request", this.requestHandler);
        $(this.client).unbind("success", this.successHandler);
    };

    window.ObservableHttpClient = ObservableHttpClient;
    window.Session = Session;

})(this);