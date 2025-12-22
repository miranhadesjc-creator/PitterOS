@echo off
title Pitter OS - Inicializando...
color 0A

echo.
echo  ====================================
echo       PITTER OS - Inicializador
echo  ====================================
echo.

REM Verifica se o Node.js esta instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo  [ERRO] Node.js nao esta instalado!
    echo.
    echo  Para usar o Pitter OS, voce precisa instalar o Node.js:
    echo  1. Acesse: https://nodejs.org/
    echo  2. Baixe a versao LTS (recomendada)
    echo  3. Instale normalmente
    echo  4. Reinicie o computador
    echo  5. Execute este arquivo novamente
    echo.
    pause
    exit /b 1
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

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo  [ERRO] Ocorreu um erro ao iniciar o Pitter OS.
    pause
)
