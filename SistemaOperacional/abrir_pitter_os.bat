@echo off
title Pitter OS - Inicializando...
color 0A

echo.
echo  ====================================
echo       PITTER OS - Inicializador
echo  ====================================
echo.

REM Verifica se esta rodando de dentro de um ZIP
if "%~dp0"=="%TEMP%\" (
    color 0C
    echo  [ERRO] VOCE NAO EXTRAIU OS ARQUIVOS!
    echo.
    echo  Por favor, extraia o arquivo ZIP para uma pasta comum antes de executar.
    echo.
    pause
    exit
)

REM Verifica se o Node.js esta instalado
node -v >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo  [ERRO] Node.js nao encontrado!
    echo.
    echo  Voce precisa instalar o Node.js para rodar o Pitter OS.
    echo  Baixe em: https://nodejs.org/ (Versao LTS)
    echo.
    pause
    exit
)

echo  [OK] Node.js encontrado!

REM Verifica se as dependencias estao instaladas
if not exist "node_modules\" (
    echo.
    echo  [INFO] Primeira execucao detectada!
    echo  [INFO] Instalando dependencias...
    echo  [INFO] Isso pode demorar alguns minutos...
    echo.
    npm install
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo  [ERRO] Falha ao instalar dependencias!
        pause
        exit /b 1
    )
    echo.
    echo  [OK] Dependencias instaladas com sucesso!
)

echo.
echo  [INFO] Iniciando o Pitter OS...
echo.
npm run dev

echo.
echo  [AVISO] O Pitter OS foi encerrado.
pause
exit /b 0
