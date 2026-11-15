@echo off
chcp 65001 >nul
cd /d "E:\arena paranormal"

echo ========================================================
echo   Lançando Versão 4.47.0 (Véu Partido / Arena Paranormal)
echo ========================================================
echo.

echo [1/4] Adicionando arquivos modificados...
git add -A

echo [2/4] Gravando commit v4.47.0...
git commit -m "v4.47.0 — O Outro Lado responde"

echo [3/4] Criando tag v4.47.0...
git tag -a v4.47.0 -m "v4.47.0"

echo [4/4] Enviando commit e tag para o GitHub...
git push origin main
git push origin v4.47.0

echo.
echo ========================================================
echo   Sucesso! A versão 4.47.0 e a tag v4.47.0 foram enviadas.
echo   O GitHub Actions iniciará a geração da release.
echo ========================================================
pause
