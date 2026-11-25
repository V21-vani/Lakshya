@echo off
setlocal EnableDelayedExpansion
title Lakshya - Run everything
cd /d "%~dp0"

echo.
echo ==========================================
echo   Lakshya - Placement Mentoring Platform
echo ==========================================
echo.

:: ---- 1. Find Java 17 (JAVA_HOME, then PATH, then %USERPROFILE%\tools\jdk-17*) ----
echo [1/4] Looking for Java 17...
if defined JAVA_HOME if exist "%JAVA_HOME%\bin\java.exe" goto :java_ok
for /f "delims=" %%J in ('where java 2^>nul') do (
    for %%D in ("%%~dpJ..") do set "JAVA_HOME=%%~fD"
    goto :java_ok
)
for /d %%D in ("%USERPROFILE%\tools\jdk-17*") do (
    set "JAVA_HOME=%%~fD"
    goto :java_ok
)
echo   ERROR: Java 17 not found.
echo   Install it from https://adoptium.net/temurin/releases/?version=17
echo   then run this script again.
pause
exit /b 1
:java_ok
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo   Using Java at %JAVA_HOME%

:: ---- 2. Check Node.js ----
echo.
echo [2/4] Checking Node.js...
where npm >nul 2>nul
if errorlevel 1 (
    echo   ERROR: Node.js not found. Install it from https://nodejs.org/
    pause
    exit /b 1
)
echo   Node.js found.

:: ---- 3. Start the two Spring Boot services (Maven is downloaded by mvnw, no install needed) ----
echo.
echo [3/4] Starting backends (first run downloads Maven + libraries, takes a few minutes)...
start "Lakshya backend :8080" cmd /k "cd /d "%~dp0backend" && .\mvnw.cmd spring-boot:run"
start "Lakshya placement-services :8082" cmd /k "cd /d "%~dp0placement-services" && .\mvnw.cmd spring-boot:run"

:: ---- 4. Start the React frontend ----
echo.
echo [4/4] Starting frontend...
if not exist "frontend\node_modules" (
    start "Lakshya frontend :5173" cmd /k "cd /d "%~dp0frontend" && npm install && npm run dev"
) else (
    start "Lakshya frontend :5173" cmd /k "cd /d "%~dp0frontend" && npm run dev"
)

echo.
echo ==========================================
echo   Frontend:           http://localhost:5173
echo   Backend API:        http://localhost:8080/api   (Swagger: /swagger-ui.html)
echo   Placement services: http://localhost:8082/api
echo.
echo   Logins (password123): student1, mentor1, admin
echo   Close the three new windows to stop everything.
echo ==========================================
echo.
pause
