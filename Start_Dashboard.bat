@echo off
title Zero Leprosy Dashboard - Live Auto-Sync Server
echo ========================================================
echo   Zero Leprosy Dashboard - Live Auto-Sync Server
echo ========================================================
echo.
echo Starting local web server...
echo Dashboard will automatically open in your web browser.
echo.
echo Leave this window open while using the dashboard.
echo To stop the server, close this window.
echo.

where python >nul 2>nul
if %errorlevel% equ 0 (
    start "" "http://127.0.0.1:8080/index.html"
    python -m http.server 8080
    goto end
)

where py >nul 2>nul
if %errorlevel% equ 0 (
    start "" "http://127.0.0.1:8080/index.html"
    py -m http.server 8080
    goto end
)

echo Starting PowerShell local server on http://127.0.0.1:8080...
start "" "http://127.0.0.1:8080/index.html"
powershell -NoProfile -Command "$listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://127.0.0.1:8080/'); $listener.Start(); Write-Host 'Server running at http://127.0.0.1:8080/'; while ($listener.IsListening) { $context = $listener.GetContext(); $req = $context.Request; $res = $context.Response; $path = '.' + [System.Web.HttpUtility]::UrlDecode($req.Url.LocalPath); if ($path -eq './') { $path = './index.html' }; if (Test-Path $path) { $bytes = [System.IO.File]::ReadAllBytes($path); $res.ContentLength64 = $bytes.Length; $res.OutputStream.Write($bytes, 0, $bytes.Length) } else { $res.StatusCode = 404 }; $res.Close() }"

:end
pause
