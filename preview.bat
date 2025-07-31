@echo off
echo 🚀 启动本地预览服务器...
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 检测到Python，使用Python启动服务器...
    echo 🌐 网站将在 http://localhost:8000 打开
    echo.
    echo 💡 提示：
    echo    - 按 Ctrl+C 停止服务器
    echo    - 修改文件后刷新浏览器即可看到更新
    echo.
    python -m http.server 8000
    goto :end
)

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 检测到Node.js，使用Node.js启动服务器...
    echo 🌐 网站将在 http://localhost:3000 打开
    echo.
    echo 💡 提示：
    echo    - 按 Ctrl+C 停止服务器
    echo    - 修改文件后刷新浏览器即可看到更新
    echo.
    npx serve . -p 3000
    goto :end
)

REM 检查PHP是否安装
php --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 检测到PHP，使用PHP启动服务器...
    echo 🌐 网站将在 http://localhost:8000 打开
    echo.
    echo 💡 提示：
    echo    - 按 Ctrl+C 停止服务器
    echo    - 修改文件后刷新浏览器即可看到更新
    echo.
    php -S localhost:8000
    goto :end
)

echo ❌ 未检测到Python、Node.js或PHP
echo.
echo 📋 请安装以下任一环境：
echo    1. Python: https://www.python.org/downloads/
echo    2. Node.js: https://nodejs.org/
echo    3. PHP: https://www.php.net/downloads.php
echo.
echo 🔄 或者直接双击 index.html 文件在浏览器中打开
echo.
pause

:end 