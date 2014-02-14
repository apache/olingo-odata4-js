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

// This script will search for a particular text pattern in an html file and replace its first occurrence with the value defined in 
// the replace-script parameter. All other lines with subsequent occurrences of the pattern will be removed from the file. 

function Main() {
    var shell = new ActiveXObject("WScript.Shell");
    var inputPath = shell.ExpandEnvironmentStrings(WScript.Arguments.Named("in"));
    var replaceScript = WScript.Arguments.Named("replace-script");
    var removePattern = /\.\.\/src\/.*\.js/;

    var files = ArrayWhere(GetFilesRecursive(inputPath), function (file) {
        return MatchesMask(file, "*.htm") || MatchesMask(file, "*.html");
    });

    ArrayForEach(files, function (file) {
        var content = ReadAllTextFile(file);
        var lines = StringSplit(content, "\r\n");
        var result = [];
        var included = false;
        ArrayForEach(lines, function (line) {
            if (line.match(removePattern)) {
                if (!included) {
                    included = true;
                    line = line.replace(removePattern, replaceScript);
                    result.push(line);
                }
            } else {
                result.push(line);
            }
        });

        if (included) {
            content = result.join("\r\n");
            WScript.Echo("Patched " + file);
            RemoveReadOnlyAttribute(file);
            SaveTextToFile(content, file);
        }
    });
}

RunAndQuit(Main);