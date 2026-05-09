@echo off
chcp 65001 >nul
echo ==========================================
echo  Alielenglish - Yerli Server Başladılır
echo ==========================================
echo.

:: Python 3 varmı yoxla
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Python tapildi. Server bashlayir...
    echo.
    echo Brauzerinizdə açın: http://localhost:8080
    echo Dayandırmaq üçün: Ctrl+C
    echo.
    python -m http.server 8080
    goto :end
)

:: Python3 ayrıca qeydə alınmışdırsa
python3 --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Python3 tapildi. Server bashlayir...
    echo.
    echo Brauzerinizdə açın: http://localhost:8080
    echo Dayandırmaq üçün: Ctrl+C
    echo.
    python3 -m http.server 8080
    goto :end
)

:: Node.js varsa
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Node.js tapildi. npx serve ishlediir...
    echo.
    echo Brauzerinizdə açın: http://localhost:8080
    echo Dayandırmaq üçün: Ctrl+C
    echo.
    npx -y serve -p 8080 .
    goto :end
)

echo [XETA] Python ve ya Node.js tapilmadi!
echo.
echo Həll: Python yükləyin — https://python.org
echo      və ya Node.js yükləyin — https://nodejs.org
echo.
pause

:end
