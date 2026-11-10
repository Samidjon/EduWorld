@echo off
chcp 65001 >nul
title EduWorld
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js не найден. Установите его с https://nodejs.org и запустите этот файл снова.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Первый запуск: устанавливаю зависимости, это займёт пару минут...
  call npm install
  if errorlevel 1 goto failed
)

if not exist ".next\BUILD_ID" (
  echo Собираю EduWorld, это займёт около минуты...
  call npm run build
  if errorlevel 1 goto failed
)

echo Запускаю EduWorld...
start "EduWorld - сервер (закройте это окно, чтобы остановить)" /min cmd /c "npm run start"

:wait
timeout /t 1 >nul
curl -s -o nul http://localhost:3000/ >nul 2>nul
if errorlevel 1 goto wait

start "" http://localhost:3000/
echo.
echo EduWorld открыт в браузере: http://localhost:3000
echo Чтобы остановить, закройте свёрнутое окно "EduWorld - сервер".
timeout /t 5 >nul
exit /b 0

:failed
echo.
echo Что-то пошло не так. Пришлите текст ошибки выше.
pause
exit /b 1
