@echo off
echo ===================================================
echo   GERANDO INSTALADOR WINDOWS - PITTER OS
echo ===================================================
echo.
echo 1/2: Compilando o projeto (Isso pode levar alguns minutos)...
cd /d "%~dp0"
call npm run build

echo.
echo 2/2: Procurando o arquivo gerado...
for /r "src-tauri\target\release\bundle\msi" %%f in (*.msi) do (
    echo Copiando %%f para a area de trabalho...
    copy "%%f" "%USERPROFILE%\Desktop\Pitter OS - Instalador.msi" /Y
)

echo.
echo ===================================================
echo   PRONTO! Verifique sua area de trabalho.
echo ===================================================
pause
