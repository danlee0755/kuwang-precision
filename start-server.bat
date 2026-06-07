@echo off
title Kuwang Precision - Local Web Server
echo ============================================
echo   Kuwang Precision Manufacturing Website
echo   Local Development Server
echo ============================================
echo.
echo Starting local web server on http://localhost:8080
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"

REM Try Python 3 first
python -m http.server 8080 2>nul
if %errorlevel% == 0 goto :end

REM Try Python 2
python -m SimpleHTTPServer 8080 2>nul
if %errorlevel% == 0 goto :end

REM Try Node.js
node -e "var http=require('http');var fs=require('fs');var path=require('path');var mime={'.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json','.mp4':'video/mp4','.webm':'video/webm','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.gif':'image/gif','.svg':'image/svg+xml','.ico':'image/x-icon'};http.createServer(function(req,res){var f='.'+req.url.split('?')[0];if(f==='./')f='./index.html';fs.readFile(f,function(err,data){if(err){res.writeHead(404);res.end('404 Not Found');}else{var ext=path.extname(f).toLowerCase();res.writeHead(200,{'Content-Type':mime[ext]||'application/octet-stream'});res.end(data);}})}).listen(8080);console.log('Server running at http://localhost:8080');" 2>nul
if %errorlevel% == 0 goto :end

echo.
echo ERROR: Neither Python nor Node.js found.
echo Please install Python (python.org) or Node.js (nodejs.org)
echo OR simply double-click index.html to open the website directly.
echo.
pause

:end
