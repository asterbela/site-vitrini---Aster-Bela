@echo off
REM ============================================================
REM  Aster Bela - abre o site no navegador
REM  Basta dar DOIS CLIQUES neste arquivo.
REM  Para encerrar, feche esta janela preta.
REM ============================================================
title Aster Bela - servidor local
cd /d "%~dp0"

echo.
echo   Iniciando o site Aster Bela...
echo.

REM Abre o navegador apos 2 segundos
start "" cmd /c "timeout /t 2 >nul && start http://localhost:5500/"

REM Tenta o Python instalado; se nao houver, avisa
python -m http.server 5500 2>nul
if errorlevel 1 (
  echo.
  echo   [!] Python nao encontrado.
  echo   Instale em https://python.org  ou abra o index.html direto no navegador.
  echo.
  pause
)
