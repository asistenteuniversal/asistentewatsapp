@echo off
chcp 65001 > nul
title ACTUALIZAR COMPORTAMIENTO ASISTENTE
cd /d "%~dp0"

echo ============================================================
echo      ABRIENDO EDITOR VISUAL DE COMPORTAMIENTO...
echo ============================================================
echo.

:: Ejecutar el script ps1 de forma limpia y transparente
powershell -ExecutionPolicy Bypass -File "%~dp0ACTUALIZAR_COMPORTAMIENTO_ASISTENTE.ps1"
set "EXIT_CODE=%errorlevel%"

if %EXIT_CODE% NEQ 0 (
    echo.
    echo ============================================================
    echo           OPERACIÓN CANCELADA POR EL USUARIO
    echo ============================================================
    echo.
    pause
    exit /b
)

echo.
echo ============================================================
echo   PROCESANDO CAMBIOS Y SUBIENDO A PRODUCCIÓN...
echo ============================================================
echo.

:: Ejecutar el empaquetado para validar que no haya errores
call npm run build
if %errorlevel% NEQ 0 (
    echo.
    echo [ERROR] Falló la compilación de React. Revisa la consola.
    pause
    exit /b
)

:: Git commit y push automáticos a Render
git add public\asistente_config.json
git commit -m "Update system instructions via automated script from PC"
git push origin main

echo.
echo ============================================================
echo  ¡CAMBIOS SUBIDOS DE FORMA AUTOMÁTICA CON ÉXITO!
echo  En 2 minutos Render actualizará el asistente en tu celular.
echo ============================================================
echo.
pause
