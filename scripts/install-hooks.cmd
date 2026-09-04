@echo off
echo Instalando hooks de seguranca do Git...
copy /Y "scripts\hooks\pre-push.cmd" ".git\hooks\pre-push.cmd" >nul
copy /Y "scripts\hooks\pre-push" ".git\hooks\pre-push" >nul
echo Hooks instalados com sucesso: pre-push (bloqueia push para main/master)
echo.
