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
/// A weakly typed representation of a JSON object using a dictionary implementation
/// </summary>
/// <typeparam name="T">The CLR type of the values of the properties</typeparam>

namespace DataJS.Tests
{
    using System;
    using System.Collections;
    using System.Collections.Generic;
    using System.Linq;
    using System.Runtime.Serialization;

    [Serializable]
    [KnownType(typeof(JsonObject))]
    [KnownType(typeof(JsonObject[]))]
    [KnownType(typeof(JsDate))]
    [KnownType(typeof(List<object>))]
    public class JsonObject : ISerializable, IEnumerable<KeyValuePair<string, object>>
    {
        Dictionary<string, object> dictionary = new Dictionary<string, object>();

        public void Remove(string key)
        {
            dictionary.Remove(key);
        }

        public object this[string key]
        {
            get
            {
                return this.dictionary[key];
            }
            set
            {
                this.dictionary[key] = value;
            }
        }

        public bool ContainsKey(string key)
        {
            return this.dictionary.ContainsKey(key);
        }

        public static JsonObject Merge(JsonObject first, JsonObject second)
        {
            if (first == null)
            {
                return second;
            }

            if (second != null)
            {
                JsonObject merged = new JsonObject();
                merged.dictionary = new Dictionary<string, object>(first.dictionary);
                foreach (var pair in second.dictionary)
                {
                    merged.dictionary[pair.Key] = pair.Value;
                }
                return merged;
            }
            return first;
        }

        public void GetObjectData(SerializationInfo info, StreamingContext context)
        {
            this.dictionary.ToList().ForEach(pair => info.AddValue(pair.Key, pair.Value));
        }

        public IEnumerator<KeyValuePair<string, object>> GetEnumerator()
        {
            return this.dictionary.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return this.dictionary.GetEnumerator();
        }
    }
}