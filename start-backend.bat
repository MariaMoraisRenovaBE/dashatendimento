@echo off
echo ========================================
echo   Iniciando Backend do Dashboard
echo ========================================
cd backend
echo.
echo Instalando dependencias (se necessario)...
call npm install
echo.
echo Iniciando servidor na porta 3001...
echo.
call npm start
pause

