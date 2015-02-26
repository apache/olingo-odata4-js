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
        this.provider = provider ? provider : window.odatajs.oData.net.defaultHttpClient;
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
    };

    Session.prototype.end = function () {
        $(this.client).unbind("request", this.requestHandler);
        $(this.client).unbind("success", this.successHandler);
    };

    window.ObservableHttpClient = ObservableHttpClient;
    window.Session = Session;

})(this);