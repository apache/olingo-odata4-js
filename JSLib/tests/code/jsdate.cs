/// <summary>
/// The oracle's representation of a Javascript date object as deserialized by the library
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
    using System.Spatial;
    using Microsoft.Data.OData;

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