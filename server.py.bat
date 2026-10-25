@echo off
chcp 65001 >nul
title IT-Шутки - Локальный сервер
color 0A

echo ==========================================
echo   Запуск локального сервера IT-шуток
echo ==========================================
echo.

:: Проверяем наличие Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ОШИБКА] Python не найден в системе!
    echo Установите Python с сайта python.org и добавьте его в PATH.
    echo.
    pause
    exit /b
)

:: Запускаем скрипт
python server.py

:: Если сервер упал или был закрыт, ставим паузу, чтобы окно не закрылось
pause