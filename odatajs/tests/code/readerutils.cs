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

using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Web.Script.Serialization;

namespace DataJS.Tests
{
    public static class ReaderUtils
    {
        public static JsonObject CreateEntryPropertyMetadata(string type)
        {
            return CreateEntryPropertyMetadata(type, true);
        }

        public static JsonObject CreateEntryPropertyMetadata(string type, bool withExtensions)
        {
            JsonObject json = new JsonObject();
            json["type"] = type;


            // TODO: add proper support for property extensions
            if (withExtensions)
            {
                json["extensions"] = new JsonObject[] { };
            }

            return json;
        }

        public static JsonObject CreateExtension(string name, string nameSpace, string value)
        {
            JsonObject json = new JsonObject();
            json["name"] = name;
            json["namespaceURI"] = nameSpace;
            json["value"] = value;
            return json;
        }

        public static WebRequest CreateRequest(string url, string user = null, string password = null)
        {
            WebRequest request = WebRequest.Create(url);
            if (user != null || password != null)
            {
                request.Credentials = new NetworkCredential(user, password);
                request.PreAuthenticate = true;
            }

            return request;
        }

        public static Stream ConvertDictionarytoJsonlightStream(Dictionary<string, object> dict)
        {
            MemoryStream stream = new MemoryStream();
            if (dict == null)
            {
                return stream;
            }

            string jsonString = new JavaScriptSerializer().Serialize(dict);
            StreamWriter writer = new StreamWriter(stream);
            writer.Write(jsonString);
            writer.Flush();
            stream.Position = 0;
            return stream;
        }

    }
}