@echo off
title Dashboard - Frontend
color 0A
echo ========================================
echo   INICIANDO FRONTEND DO DASHBOARD
echo ========================================
echo.
cd /d %~dp0frontend
echo Instalando dependencias (se necessario)...
call npm install
echo.
echo ========================================
echo   Frontend iniciando...
echo   Acesse: http://localhost:3000
echo ========================================
echo.
call npm run dev
pause

