using System.Net;
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

    }
}