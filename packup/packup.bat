@echo off
echo 开始打包
@REM 复制启动代码
copy /y .\meteor.spec ..\meteor.spec
copy /y .\startup.py ..\meteor.py
cd ..
@REM 打包
pyinstaller meteor.spec --noconfirm
copy /y .\dist\meteor.exe .\packup\meteor.exe
echo 打包完成
@REM 清理临时文件
rd /s /q build
rd /s /q dist
del meteor.spec
del meteor.py
pause