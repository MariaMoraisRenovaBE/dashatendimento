@echo off
echo ========================================
echo   Push para GitHub - Dashboard
echo ========================================
echo.
echo IMPORTANTE: GitHub requer Personal Access Token
echo.
echo 1. Crie um token em: https://github.com/settings/tokens
echo 2. Selecione a permissao: repo
echo 3. Copie o token gerado
echo.
echo Quando pedir a senha, use o TOKEN (nao a senha)
echo.
pause
echo.
git push -u origin main
pause

