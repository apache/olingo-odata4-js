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

//
// References:
//
// JScript Language Reference
// http://msdn2.microsoft.com/en-us/library/yek4tbz0
//
// Windows Script Host Object Model
// http://msdn2.microsoft.com/en-us/library/a74hyyw0
//
// Script Runtime
// http://msdn2.microsoft.com/en-us/library/hww8txat.aspx
//

function ArrayAny(arr, callback) {
    /// <summary>Checks whether any element in an array satisfies a predicate.</summary>
    /// <param name="arr" type="Array">Array to operate on.</param>
    /// <param name="callback" type="Function">Function to test with element and index, returning true or false.</param>
    /// <returns type="Boolean">true if 'callback' returns true for any element; false otherwise.</returns>
    for (var i = 0; i < arr.length; i++) {
        if (callback(arr[i], i)) {
            return true;
        }
    }

    return false;
}

function ArrayWhere(arr, callback) {
    /// <summary>Returns the elements in an array that satisfy a predicate.</summary>
    /// <param name="arr" type="Array">Array to operate on.</param>
    /// <param name="callback" type="Function">Function to test with element and index, returning true or false.</param>
    /// <returns type="Array">Array of elements from arr that satisfy the predicate.</returns>

    var result = [];

    for (var i = 0; i < arr.length; i++) {
        if (callback(arr[i], i)) {
            result.push(arr[i]);
        }
    }
    return result;
}

function ArrayForEach(arr, callback) {
    /// <summary>Invokes a callback for each element in the array.</summary>
    /// <param name="arr" type="Array">Array to operate on.</param>
    /// <param name="callback" type="Function">Function to invoke with element and index.</param>
    for (var i = 0; i < arr.length; i++) {
        callback(arr[i], i);
    }
}

function CheckScriptFlag(name) {
    /// <summary>Checks whether a script argument was given with true or false.</summary>
    /// <param name="name" type="String">Argument name to check.</param>
    /// <returns type="Boolean">
    /// true if the argument was given witha value of 'true' or 'True'; false otherwise.
    /// </returns>
    var flag = WScript.Arguments.Named(name);
    if (!flag) {
        return false;
    }

    return flag === "true" || flag === "True";
}

function CreateFolderIfMissing(path) {
    /// <summary>Creates a folder if it doesn't exist.</summary>
    /// <param name="path" type="String">Path to folder to create.</param>
    /// <remarks>This function will write out to the console on creation.</remarks>
    if (!path) return;
    var parent = PathGetDirectory(path);
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    if (!fso.FolderExists(parent)) {
        CreateFolderIfMissing(parent);
    }
    if (!fso.FolderExists(path)) {
        WScript.Echo("Creating " + path + "...");
        fso.CreateFolder(path);
    }
}

function DeleteFile(path, force) {
    /// <summary>Deletes a file.</summary>
    /// <param name="path" type="String">Path to the file.</param>
    /// <param name="force" type="Boolean">Whether to delete the file even if it has the read-only attribute set.</param>

    var fso = new ActiveXObject("Scripting.FileSystemObject");
    fso.DeleteFile(path, force);
}

function DeleteFolder(path, force) {
    /// <summary>Deletes a folder.</summary>
    /// <param name="path" type="String">Path to the folder.</param>
    /// <param name="force" type="Boolean">Whether to delete the folder even if it has the read-only attribute set.</param>

    var fso = new ActiveXObject("Scripting.FileSystemObject");
    fso.DeleteFolder(path, force);
}

function CopyFolder(source, dest, overwrite) {
    /// <summary>Recursively copies a folder and its contents from source to dest.</summary>
    /// <param name="source" type="String">Path to the source folder location.</param>
    /// <param name="dest" type="String">Path to the destination folder location.</param>
    /// <param name="overwrite" type="Boolean">Whether to overwrite a folder in the destination location.</param>

    var fso = new ActiveXObject("Scripting.FileSystemObject");
    fso.CopyFolder(source, dest, overwrite);
}


function CopyFile(source, dest, overwrite) {
    /// <summary>Copies a file from source to dest.</summary>
    /// <param name="source" type="String">Path to the source file location.</param>
    /// <param name="dest" type="String">Path to the destination file location.</param>
    /// <param name="overwrite" type="Boolean">Whether to overwrite a file in the destination location.</param>

    var fso = new ActiveXObject("Scripting.FileSystemObject");

    if (overwrite && fso.FileExists(dest)) {
        var f = fso.getFile(dest);
        f.attributes = 0;
    }

    fso.CopyFile(source, dest, overwrite);
}

function ExtractContentsBetweenMarkers(path, contentOnly, isExclusion, startMarker, endMarker, callback) {
    /// <summary>
    /// Extracts the lines from the 'path' text file between the start and end markers.
    /// </summary>
    /// <param name="path" type="String">Path to file.</param>
    /// <param name="contentOnly" type="Boolean">
    /// true to skip everything until it's found between markers, false to start including everything from the start.
    /// </param>
    /// <param name="isExclusion" type="Boolean">
    /// false if the 'extraction' means keeping the content; true if it means not excluding it from the result.
    /// </param>
    /// <param name="startMarker" type="String">Line content to match for content start.</param>
    /// <param name="endMarker" type="String">Line content to match for content end.</param>
    /// <param name="callback" type="Function" mayBeNull="true">
    /// If true, then this function is called for every line along with the inContent flag
    /// before the line is added; the called function may return a line
    /// to be added in its place, null to skip processing.
    /// </param>
    /// <returns type="String">The string content of the file.</returns>

    var content = ReadAllTextFile(path);
    return ExtractContentsBetweenMarkersForText(content, contentOnly, isExclusion, startMarker, endMarker, callback);
}

function ExtractContentsBetweenMarkersForText(content, contentOnly, isExclusion, startMarker, endMarker, callback) {
    /// <summary>
    /// Extracts the lines from the specified text between the start and end markers.
    /// </summary>
    /// <param name="content" type="String">Text to process.</param>
    /// <param name="contentOnly" type="Boolean">
    /// true to skip everything until it's found between markers, false to start including everything from the start.
    /// </param>
    /// <param name="isExclusion" type="Boolean">
    /// false if the 'extraction' means keeping the content; true if it means not excluding it from the result.
    /// </param>
    /// <param name="startMarker" type="String">Line content to match for content start.</param>
    /// <param name="endMarker" type="String">Line content to match for content end.</param>
    /// <param name="callback" type="Function" mayBeNull="true">
    /// If true, then this function is called for every line along with the inContent flag
    /// before the line is added; the called function may return a line
    /// to be added in its place, null to skip processing.
    /// </param>
    /// <returns type="String">The extracted content.</returns>

    var inContent = contentOnly === false;
    var lines = StringSplit(content, "\r\n");
    var result = [];
    var i, len;
    for (i = 0, len = lines.length; i < len; i++) {
        var line = lines[i];
        var contentStartIndex = line.indexOf(startMarker);
        if (inContent === false && contentStartIndex !== -1) {
            inContent = true;
            continue;
        }

        var contentEndIndex = line.indexOf(endMarker);
        if (inContent === true && contentEndIndex !== -1) {
            inContent = false;
            continue;
        }

        if (inContent !== isExclusion) {
            if (callback) {
                var callbackResult = callback(line, inContent);
                if (callbackResult !== null && callbackResult !== undefined) {
                    result.push(callbackResult);
                }
            } else {
                result.push(line);
            }
        }
    }

    return result.join("\r\n");
}

function FolderExists(path) {
    /// <summary>Checks whether the specified directory exists.</summary>
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    if (fso.FolderExists(path)) {
        return true;
    }
    else {
        return false;
    }
}

function FileExists(path) {
    /// <summary>Checks whether the specified file exists.</summary>
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    if (fso.FileExists(path)) {
        return true;
    }
    else {
        return false;
    }
}

function GetEnvironmentVariable(name) {
    /// <summary>Gets the value of the specified environment variable.</summary>
    /// <param name="name" type="String">Name of the variable value to get.</param>
    /// <returns type="String">Value for the given environment variable; null if undefined.</returns>
    var shell = new ActiveXObject("WScript.Shell");
    var result = shell.ExpandEnvironmentStrings("%" + name + "%");
    if (result == "%" + name + "%") {
        result = null;
    }

    return result;
}

function GetFilesRecursive(path) {
    /// <summary>Gets all file names under the specified directory path.</summary>
    /// <param name="path" type="String">Path to directory.</param>
    /// <returns type="Array">Array of all file names under path.</returns>

    var result = [];
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var pending = [path];

    while (pending.length) {
        var item = pending.pop();
        var folder = fso.GetFolder(item);
        for (var files = new Enumerator(folder.Files); !files.atEnd(); files.moveNext()) {
            result.push(files.item().Path);
        }

        for (var subFolders = new Enumerator(folder.SubFolders); !subFolders.atEnd(); subFolders.moveNext()) {
            pending.push(subFolders.item().Path);
        }
    }

    return result;
}

function GetRelativePathFrom(startPath, endPath) {
    if (startPath[startPath.length - 1] !== "\\") {
        startPath += "\\";
    }

    if (startPath.length > endPath.length) {
        throw { message: "traversing up NYI" };
    }

    return endPath.substr(startPath.length);
}

function MatchesMask(file, mask) {
    if (!mask) {
        return false;
    }

    if (file === mask) {
        return true;
    }

    if (mask.substr(0, 1) === "*") {
        var rest = mask.substr(1);
        return file.substr(file.length - rest.length) === rest;
    } else if (mask.substr(mask.length - 1) === "*") {
        var end = mask.substr(0, mask.length - 1);
        return file.substr(0, end.length) === end;
    }

    return false;
}

function PathGetDirectory(path) {
    /// <summary>
    /// Returns the directory of the specified path string (excluding the trailing "\\");
    /// empty if there is no path.
    /// </summary>

    var l = path.length;
    var startIndex = l;
    while (--startIndex >= 0) {
        var ch = path.substr(startIndex, 1);
        if (ch == "\\") {
            if (startIndex === 0) {
                return "";
            } else {
                return path.substr(0, startIndex);
            }
        }
    }

    return "";
}

function PathGetFileName(path) {
    /// <summary>
    /// Returns the file name for the specified path string; empty if there is no
    /// directory information.
    /// </summary>
    var l = path.length;
    var startIndex = l;
    while (--startIndex >= 0) {
        var ch = path.substr(startIndex, 1);
        if (ch == "\\" || ch == "/" || ch == ":") {
            return path.substr(startIndex, l - startIndex);
        }
    }
    return "";
}

function PathGetExtension(path) {
    /// <summary>
    /// Returns the extension of the specified path string (including the ".");
    /// empty if there is no extension.
    /// </summary>
    var l = path.length;
    var startIndex = l;
    while (--startIndex >= 0) {
        var ch = path.substr(startIndex, 1);
        if (ch == ".") {
            if (startIndex != (l - 1)) {
                return path.substr(startIndex, l - startIndex);
            }
            return "";
        }
        else if (ch == "\\" || ch == ":") {
            break;
        }
    }
    return "";
}

function ReadAllTextFile(path) {
    /// <summary>Reads all the content of the file into a string.</summary>
    /// <param name="path" type="String">File name to read from.</param>
    /// <returns type="String">File contents.</returns>
    var ForReading = 1, ForWriting = 2;
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var file = fso.OpenTextFile(path, ForReading);
    try {
        var result;
        if (file.AtEndOfStream) {
            result = "";
        } else {
            result = file.ReadAll();
        }
    } finally {
        file.Close();
    }

    return result;
}

function ReadXmlFile(path) {
    /// <summary>Reads an XML document from the specified path.</summary>
    /// <param name="path" type="String">Path to file on disk.</param>
    /// <returns>A DOMDocument with the contents of the given file.</returns>
    var result = new ActiveXObject("Msxml2.DOMDocument.6.0");
    result.async = false;
    result.load(path);
    if (result.parseError.errorCode !== 0) {
        throw { message: "Error reading '" + path + "': " + result.parseError.reason };
    }

    return result;
}

// Runs the specified function catching exceptions and quits the current script.
function RunAndQuit(f) {
    try {
        f();
    }
    catch (e) {
        // An error with 'statusCode' defined will avoid the usual error dump handling.
        if (e.statusCode !== undefined) {
            if (e.message) {
                WScript.Echo(e.message);
            }

            WScript.Quit(e.statusCode);
        }

        WScript.Echo("Error caught while running this function:");
        WScript.Echo(f.toString());
        WScript.Echo("Error details:");
        if (typeof (e) == "object" && e.toString() == "[object Object]" || e.toString() === "[object Error]") {
            for (var p in e) WScript.Echo(" " + p + ": " + e[p]);
        }
        else {
            WScript.Echo(e);
        }

        WScript.Quit(1);
    }
    WScript.Quit(0);
}

function RunConsoleCommand(strCommand, timeout, retry) {
    /// <summary>Runs a command and waits for it to exit.</summary>
    /// <param name="strCommand" type="String">Command to run.</param>
    /// <param name="timeout" type="int">Timeout in seconds.</param>
    /// <param name="timeout" type="bool">Boolean specifying whether to retry on timeout or not.</param>
    /// <returns type="Array">An array with stdout in 0, stderr in 1 and exit code in 2. Forced
    /// termination sets 2 to 1.</returns>
    var WshShell = new ActiveXObject("WScript.Shell");
    var result = new Array(3);
    var oExec = WshShell.Exec(strCommand);
    var counter = 0;

    if (timeout) {
        // Status of 0 means the process is still running
        while (oExec.Status === 0 && counter < timeout) {
            WScript.Sleep(1000);
            counter++;
        }

        if (timeout === counter && oExec.Status === 0) {
            WScript.Echo("Forcefully terminating " + strCommand + " after " + timeout + " seconds.");
            oExec.Terminate();
            result[2] = 1;
            if (retry) {
                return RunConsoleCommand(strCommand, timeout, false);
            }
        }
    }

    result[0] = oExec.StdOut.ReadAll();
    result[1] = oExec.StdErr.ReadAll();

    if (!result[2]) {
        result[2] = oExec.ExitCode;
    }

    return result;
}

function SaveTextToFile(content, path) {
    /// <summary>Saves text content into a file.</summary>
    /// <param name="content" type="String">Content to save.</param>
    /// <param name="path" type="String">Path of file to save into.</param>
    var ForReading = 1, ForWriting = 2;
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var file = fso.OpenTextFile(path, ForWriting, true);
    file.Write(content);
    file.Close();
}

function StringSplit(strLine, strSeparator) {
    /// <summary>Splits a string into a string array.</summary>
    var result = new Array();
    var startIndex = 0;
    var resultIndex = 0;
    while (startIndex < strLine.length) {
        var endIndex = strLine.indexOf(strSeparator, startIndex);
        if (endIndex == -1) {
            endIndex = strLine.length;
        }
        result[resultIndex] = strLine.substring(startIndex, endIndex);
        startIndex = endIndex + strSeparator.length;
        resultIndex++;
    }
    return result;
}

function PathCombine(path1, path2) {
    if (path1.charAt(path1.length - 1) !== "\\") {
        return path1 + "\\" + path2;
    }
    return path1 + path2;
}

function RemoveReadOnlyAttribute(path) {
    /// <summary>Removes the read-only attribute on the specified file.</summary>
    /// <param name="path" type="String">Path to the file.</param>
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var f = fso.getFile(path);
    if (1 === (f.attributes & 1)) {
        f.attributes = (f.attributes & ~1);
    }
}

function WriteXmlFile(document, path) {
    /// <summary>Write an XML document to the specified path.</summary>
    /// <param name="path" type="String">Path to file on disk.</param>
    document.save(path);
}