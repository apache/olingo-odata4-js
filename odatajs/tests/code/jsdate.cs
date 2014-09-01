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

/// <summary>
/// The verifiers's representation of a Javascript date object as deserialized by the library
/// </summary>

namespace DataJS.Tests
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Net;
    using System.Runtime.Serialization;
    using System.ServiceModel;
    using System.ServiceModel.Activation;
    using System.ServiceModel.Syndication;
    using System.ServiceModel.Web;
    using System.Xml;
    using System.Xml.Linq;
    using Microsoft.Spatial;
    using Microsoft.OData.Core;

    [Serializable]
    public class JsDate : JsonObject
    {
        private static readonly DateTime JsEpoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        public JsDate(DateTime dateTime)
            : base()
        {
            this["milliseconds"] = dateTime.Subtract(JsEpoch).TotalMilliseconds;
        }

        public JsDate(DateTimeOffset dateTimeOffset)
            : this(dateTimeOffset.UtcDateTime)
        {
            this["__edmType"] = "Edm.DateTimeOffset";
            this["__offset"] = (dateTimeOffset.Offset < TimeSpan.Zero ? "-" : "+") + dateTimeOffset.Offset.ToString("hh':'mm");
        }
    }
}