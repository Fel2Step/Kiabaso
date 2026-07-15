@echo off
title Kiabasso Backend
cd /d "%~dp0kiabasso-backend"
echo Starting Kiabasso Backend...
echo.
echo Antes de iniciar, certifique-se que:
echo 1. MySQL esta rodando (localhost:3306)
echo 2. A base de dados 'kiabasso' existe
echo.
echo Para criar a BD e popular dados:
echo   npm run migration:run
echo   npm run seed
echo.
npm start
pause
