/// <reference path="djscommon.js" />

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


var markerFormats = {};

markerFormats[".js"] = "// MARKER";
markerFormats[".html"] = "<!-- MARKER -->";
markerFormats[".htm"] = markerFormats[".html"];

function MakeMarker(ext, marker) {
    /// <summary>Builds the appropriate marker string based on the file extension.</summary>
    /// <param name="ext" type="String">Extension of the file for which the marker string is going to be generated.</param>
    /// <param name="marker" type="String">Text to be contained in the marker.</param>
    /// <returns type="String">Specific marker string.</returns>

    var format = markerFormats[ext.toLowerCase()];
    if (format) {
        return format.replace("MARKER", marker);
    }
    return null;
}

function BuildFromProject(path, outBasePath) {
    // Read the csproj.
    WScript.Echo("Reading project " + path);
    var xml = new ActiveXObject("Msxml2.DOMDocument.6.0");
    xml.load(path);
    xml.setProperty("SelectionNamespaces", "xmlns:msb='http://schemas.microsoft.com/developer/msbuild/2003'");
    xml.setProperty("SelectionLanguage", "XPath");

    var files = xml.selectNodes("//msb:ItemGroup/*[not(self::msb:Reference)]/@Include");
    var fileIncludes = {};
    var i, len, filePath;

    // Get file dependencies.
    for (i = 0, len = files.length; i < len; i++) {
        filePath = PathCombine(PathGetDirectory(path), files[i].value);
        if (FileExists(filePath)) {
            var includes = GetFileIncludes(filePath);
            var j, includeLen;
            for (j = 0, includeLen = includes.length; j < includeLen; j++) {
                fileIncludes[includes[j]] = {};
            }
        } else if (!FolderExists(filePath)) {
            throw { message: "path doesn't exist " + filePath };
        }
    }

    // Build the files that are not in the dependency list.
    for (i = 0, len = files.length; i < len; i++) {
        filePath = PathCombine(PathGetDirectory(path), files[i].value);
        var outputPath = PathCombine(outBasePath, files[i].value);
        if (!fileIncludes[filePath] && !FolderExists(filePath)) {
            BuildFile(filePath, outputPath);
        }
    }
}

function GetFileIncludes(path) {
    var content = ReadAllTextFile(path);
    var lines = StringSplit(content, "\r\n");
    var result = [];
    var i, len;
    for (i = 0, len = lines.length; i < len; i++) {
        var line = lines[i];
        var includeIndex = line.indexOf("// INCLUDE:");
        if (includeIndex !== -1) {
            var anotherPath = line.substr(includeIndex + 11);
            anotherPath = anotherPath.replace(/^\s+|\s+$/g, "");
            if (!FileExists(anotherPath)) {
                anotherPath = PathGetDirectory(path) + "\\" + anotherPath;
            }
            result.push(GetFileIncludes(anotherPath));
            result.push(anotherPath);
        }
    }

    return result;
}

// TODO: provide support for composing relative paths.
function BuildFromSln(path, outBasePath) {
    WScript.Echo("Reading solution " + path);
    var outPath = PathCombine(outBasePath, PathGetFileName(path));
    var regEx = /(Project\("[^"]+"\)\s*=\s*)"([^"]+)"\s*,\s*"([^"]+)"/;
    var content = ReadAllTextFile(path);
    var lines = StringSplit(content, "\r\n");
    var i, len;
    for (i = 0, len = lines.length; i < len; i++) {
        var matches = regEx.exec(lines[i]);
        if (matches) {
            var projectPath = PathCombine(PathGetDirectory(path), matches[3]);
            BuildFromProject(projectPath, outPath);
        }
    }
}

function BuildFile(path, outPath) {
    /// <summary>Builds a JavaScript file. </summary>
    /// <param name="path" type="String">Path to the file whose content is going to be built.</param>
    /// <param name="outPath" type="String">Path of the built file.</param>

    if (!FileExists(path)) {
        throw { message: "File does not exist: " + inName };
    }

    CreateFolderIfMissing(PathGetDirectory(outPath));
    switch (PathGetExtension(path).toLowerCase()) {
        case ".js":
        case ".htm":
        case ".html":
            WScript.Echo("building file: " + path);
            var built = BuildFileForContent(path, false);
            SaveTextToFile(built, outPath);
            break;
        default:
            WScript.Echo("copying file: " + path);
            CopyFile(path, outPath, true);
            break;
    }
}

function BuildFileForContent(path, contentOnly) {
    var ext = PathGetExtension(path);
    var includeCallback = function (line, inContent) {    
        var includeIndex = line.indexOf(MakeMarker(ext, "INCLUDE: "));
        if (includeIndex !== -1) {
            var anotherPath = line.substr(includeIndex + 11);
            anotherPath = anotherPath.replace(/^\s+|\s+$/g, "");
            if (!FileExists(anotherPath)) {
                anotherPath = PathGetDirectory(path) + "\\" + anotherPath;
            }

            return BuildFileForContent(anotherPath, true);
        } else {
            return (inContent) ? line : null;
        }
    };

    return ExtractContentsBetweenMarkers(path, contentOnly, /*isExclusion*/ false, 
        MakeMarker(ext, "CONTENT START"), MakeMarker(ext, "CONTENT END"), includeCallback);
}

function RemoveInternals(inName, outName) {
    var ext = PathGetExtension(inName);
    var includeCallback = function (line, inContent) {
        return (line.indexOf("djsassert") === -1) ? line : null;
    };
    var content = ExtractContentsBetweenMarkers(inName, true, /*isExclusion*/ true,
        MakeMarker(ext, "DATAJS INTERNAL START"), MakeMarker(ext, "DATAJS INTERNAL END"), includeCallback);
    
    SaveTextToFile(content, outName);
}

RunAndQuit(function () {
    var args = WScript.Arguments;
    var inName = WScript.Arguments.Unnamed(0);
    if (!inName) {
        throw { message: "no input specified" };
    }

    var outName = WScript.Arguments.Named("out");
    if (!outName) {
        throw { message: "no output specified" };
    }

    if (CheckScriptFlag("build-solution")) {
        BuildFromSln(inName, outName);
    }
    if (CheckScriptFlag("remove-internals")) {
        RemoveInternals(inName, outName);
    }
});