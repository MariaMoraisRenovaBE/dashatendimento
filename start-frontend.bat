@echo off
echo ========================================
echo   Iniciando Frontend do Dashboard
echo ========================================
cd frontend
echo.
echo Instalando dependencias (se necessario)...
call npm install
echo.
echo Iniciando servidor de desenvolvimento...
echo.
echo Dashboard disponivel em: http://localhost:3000
echo.
call npm run dev
pause

