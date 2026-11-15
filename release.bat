@echo off
chcp 65001 >nul
cd /d "E:\arena paranormal"

echo ========================================================
echo   Enviando atualizações para o GitHub
echo ========================================================
echo.

echo [1/3] Adicionando arquivos modificados...
git add -A

echo [2/3] Criando commit...
git commit -m "feat(stages): paginacao em grade de 16 mapas com navegacao lateral e indicadores"

echo [3/3] Enviando para o repositorio remoto (git push)...
git push origin main

echo.
echo ========================================================
echo   Sucesso! Commit e push realizados com sucesso.
echo ========================================================
pause
