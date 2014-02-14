@echo off

rem Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.
rem Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation 
rem files (the "Software"), to deal  in the Software without restriction, including without limitation the rights  to use, copy,
rem modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the 
rem Software is furnished to do so, subject to the following conditions:
rem 
rem The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
rem 
rem THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  IMPLIED, INCLUDING BUT NOT LIMITED TO THE
rem WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
rem COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
rem ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

setlocal    


if "%DJSROOT%" == "" (
  echo Please set the DJSROOT environment variable for the build process.
  exit /b 1
)

if "%DJSOUT%" == "" (
  echo Please set the DJSOUT environment variable for the build process.
  exit /b 1
)

rem Build overview:
rem 1. Call msbuild to generate the webapplication bin directory.
rem 2. All solution files are copied or merged into the output directory.
rem 3. Internal references are removed from the merged file (eg, ODATA_INTERNAL).
rem    This produces datajs.js.
rem 4. The minifier is run. This produces datajs.min.js.
rem 5. The files are renamed to the version-specific filenames.

echo Invoking msbuild...
where /Q msbuild.exe
if errorlevel 1 (
    echo Please add the path to msbuild.exe to the Path environment variable for the build process.
    exit /b 1
)
msbuild /nologo /clp:DisableConsoleColor /target:rebuild "%DJSROOT%\JSLib\JSLib.sln"

echo Building internal datajs version...
cscript "%DJSROOT%\BuildTools\djsbuildfile.wsf" //Nologo /build-solution:true /out:"%DJSOUT%" "%DJSROOT%\JSLib\JSLib.sln"
if errorlevel 1 (
  exit /b %errorlevel%
)

if exist "%DJSOUT%\jslib.sln\src\datajs.merged.js" (
  del "%DJSOUT%\jslib.sln\src\datajs.merged.js"
  if errorlevel 1 (
    exit /b %errorlevel%
  )
)

ren "%DJSOUT%\jslib.sln\src\datajs.js" datajs.merged.js
if errorlevel 1 (
  exit /b %errorlevel%
)

echo.
echo Removing internal references...
cscript "%DJSROOT%\BuildTools\djsbuildfile.wsf" //Nologo /remove-internals:true /out:"%DJSOUT%\jslib.sln\src\datajs.js" "%DJSOUT%\jslib.sln\src\datajs.merged.js"
if errorlevel 1 (
  exit /b %errorlevel%
)

echo.
echo Minifying output file...
if exist "%DJSROOT%\BuildTools\ajaxmin\AjaxMin.exe" (
  "%DJSROOT%\BuildTools\ajaxmin\AjaxMin.exe" -JS -debug:false -analyze -clobber:true "%DJSOUT%\jslib.sln\src\datajs.js" -out "%DJSOUT%\jslib.sln\src\datajs.min.body.js" > "%DJSOUT%\jslib.sln\src\datajs.js.log" 2>&1
  if errorlevel 1 (
    echo Error when running AjaxMin.exe on "%DJSOUT%\jslib.sln\src\datajs.js"
    echo See log at "%DJSOUT%\jslib.sln\src\datajs.js.log"
    exit /b 1
  )

  copy "%DJSROOT%\BuildTools\djslicense.js" /B +"%DJSOUT%\jslib.sln\src\datajs.min.body.js" /B "%DJSOUT%\jslib.sln\src\datajs.min.js" /B
  del /Q "%DJSOUT%\jslib.sln\src\datajs.min.body.js"
  
) else (
  type "%DJSROOT%\BuildTools\ajaxmin\readme.txt"
  echo.
  echo Using non-minified file instead.
  copy /y "%DJSOUT%\jslib.sln\src\datajs.js" "%DJSOUT%\jslib.sln\src\datajs.min.js"
)


call "%DJSROOT%\BuildTools\djsbuildver.cmd"

if exist "%DJSOUT%\jslib.sln\src\datajs-%DJSVER%.js" (
  del /q "%DJSOUT%\jslib.sln\src\datajs-%DJSVER%.js"
  if errorlevel 1 (
    exit /b %errorlevel%
  )
)

if exist "%DJSOUT%\jslib.sln\src\datajs-%DJSVER%.min.js" (
  del /q "%DJSOUT%\jslib.sln\src\datajs-%DJSVER%.min.js"
  if errorlevel 1 (
    exit /b %errorlevel%
  )
)

ren "%DJSOUT%\jslib.sln\src\datajs.js" datajs-%DJSVER%.js
ren "%DJSOUT%\jslib.sln\src\datajs.min.js" datajs-%DJSVER%.min.js

echo.
echo Redirecting unit tests to internal file...
cscript "%DJSROOT%\BuildTools\djspatchtests.wsf" //Nologo /in:"%DJSOUT%\jslib.sln\tests" /replace-script:"../src/datajs.merged.js"
if errorlevel 1 (
   exit /b %errorlevel%
)

echo.
echo Copying bin folder...
robocopy "%DJSROOT%\JSLib\bin" "%DJSOUT%\jslib.sln\bin" /E /R:10 1>NUL

if errorlevel 8 (
    exit /b %errorlevel%
)

if errorlevel 16 (
    exit /b %errorlevel%
)

echo.
echo The built files are:
echo %DJSOUT%\jslib.sln\src\datajs-%DJSVER%.js     - development version
echo %DJSOUT%\jslib.sln\src\datajs-%DJSVER%.min.js - minified version

endlocal

exit /b 0