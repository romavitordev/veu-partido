@echo off
chcp 65001 >nul
cd /d "E:\arena paranormal"

echo ========================================================
echo   Lancando Versao v4.58.0 para o GitHub
echo ========================================================
echo.

echo [1/4] Adicionando arquivos modificados...
git add -A

echo [2/4] Criando commit v4.58.0...
git commit -m "v4.58.0 — Caio Teles"

echo [3/4] Criando tag v4.58.0...
git tag -a v4.58.0 -m "v4.58.0"

echo [4/4] Enviando commit e tag para o repositorio remoto (git push)...
git push origin main
git push origin v4.58.0

echo.
echo ========================================================
echo   Sucesso! Versao v4.58.0 lancada com sucesso.
echo ========================================================
pause
