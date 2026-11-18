@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem LANCAR VERSAO: le a versao e o titulo de src/config/version.js (a entrada do topo do CHANGELOG, via
rem tools/release-info.mjs), entao nao precisa editar este arquivo a cada versao. Antes o numero ficava escrito aqui
rem (v4.58.0) e a tag saiu no commit errado. Para se a tag ja existir, se nao houver nada para commitar ou se algum
rem passo falhar.

set VER=
set TITLE=
for /f "tokens=1,* delims=|" %%a in ('node tools\release-info.mjs') do (set "VER=%%a" & set "TITLE=%%b")
if not defined VER (echo Nao consegui ler a versao: confira src\config\version.js ^(VERSION e a entrada do topo do CHANGELOG^). & pause & exit /b 1)

git rev-parse -q --verify "refs/tags/v%VER%" >nul && (echo A tag v%VER% ja existe. Suba a versao em src\config\version.js. & pause & exit /b 1)

echo ========================================================
echo   Lancando v%VER% - %TITLE%
echo ========================================================
echo.

echo [1/4] Adicionando arquivos modificados (sem a pasta .claude)...
git add -A -- . ":!.claude" || goto :erro
git diff --cached --quiet && (echo Nada para commitar. & pause & exit /b 1)

echo [2/4] Criando o commit...
git commit -m "Release v%VER%: %TITLE%" || goto :erro

echo [3/4] Criando a tag v%VER%...
git tag -a "v%VER%" -m "v%VER% - %TITLE%" || goto :erro

echo [4/4] Enviando commit e tag (git push)...
git push origin main || goto :erro
git push origin "v%VER%" || goto :erro

echo.
echo ========================================================
echo   Pronto! v%VER% lancada.
echo ========================================================
pause
exit /b 0

:erro
echo.
echo Algo deu errado no passo acima. Nada mais foi feito; confira a mensagem.
pause
exit /b 1
