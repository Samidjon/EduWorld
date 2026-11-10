@echo off
chcp 65001 >nul
title EduWorld - пересборка
cd /d "%~dp0"
echo Пересобираю EduWorld после изменений в коде...
if exist ".next" rmdir /s /q ".next"
call npm run build
if errorlevel 1 (
  echo Сборка не удалась. Пришлите текст ошибки выше.
  pause
  exit /b 1
)
echo Готово. Теперь запускайте "Запустить EduWorld.bat".
pause
