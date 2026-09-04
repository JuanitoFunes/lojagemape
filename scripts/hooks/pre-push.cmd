@echo off
setlocal enabledelayedexpansion

set "PROTECTED_BRANCHES=main master"
set "WORK_BRANCH=desenvolvimento"

for /f "delims=" %%i in ('git rev-parse --abbrev-ref HEAD') do set "BRANCH=%%i"

echo [pre-push hook] Verificando seguranca do push...
echo [pre-push hook] Branch atual: %BRANCH%

for %%b in (%PROTECTED_BRANCHES%) do (
    if /i "%BRANCH%"=="%%b" (
        echo.
        echo ============================================================
        echo   ERRO CRITICO: Push BLOQUEADO para a branch protegida '%%b'!
        echo ============================================================
        echo.
        echo   Esta branch e para PRODUCAO.
        echo   Todas as alteracoes devem ser enviadas para: '%WORK_BRANCH%'
        echo.
        echo   Para corrigir:
        echo     1. git checkout %WORK_BRANCH%
        echo     2. git cherry-pick (se necessario)
        echo     3. git push origin %WORK_BRANCH%
        echo.
        echo   Somente faca merge em '%%b' via Pull Request APOS aprovacao.
        echo ============================================================
        exit /b 1
    )
)

echo [pre-push hook] Push permitido. Saindo...
exit /b 0
