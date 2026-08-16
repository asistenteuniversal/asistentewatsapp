@echo off
title ACTUALIZAR COMPORTAMIENTO ASISTENTE
chcp 65001 > nul
cd /d "%~dp0"

powershell -ExecutionPolicy Bypass -File "ACTUALIZAR_COMPORTAMIENTO_ASISTENTE.ps1"
if %errorlevel% neq 0 (
    echo.
    echo Operación cancelada. El comportamiento no se ha modificado.
    echo.
    pause
    exit /b
)

echo.
echo Sincronizando con base de datos Supabase...
call node update_supabase.cjs

echo.
echo Procesando compilación de seguridad...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo Error al compilar. Cambios no subidos.
    echo.
    pause
    exit /b
)

echo Subiendo nuevas instrucciones a Render...
git add public\asistente_config.json
git commit -m "Update system instructions via automated script"
git push origin main

echo.
echo ============================================================
echo  ¡ACTUALIZACIÓN COMPLETADA CON ÉXITO!
echo  En 2 minutos se aplicará el cambio en tu celular.
echo ============================================================
echo.
pause
