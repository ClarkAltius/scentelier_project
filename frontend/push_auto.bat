@echo off
:: ============================================
:: Git 자동 푸시 스크립트
:: 프로젝트: scentelier_project
:: 작성자: 톰맨 아
:: ============================================

cd /d "D:\scentelier_project\frontend"

echo.
echo ============================================
echo 🚀 GitHub 자동 업로드를 시작합니다...
echo ============================================

:: 변경사항 모두 스테이징
git add .

:: 현재 시각으로 자동 커밋 메시지 생성
for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set DATE=%%a-%%b-%%c
for /f "tokens=1-3 delims=:." %%a in ("%time%") do set TIME=%%a%%b%%c
set MSG=Auto commit on %DATE%_%TIME%

git commit -m "%MSG%"

:: GitHub(main)으로 푸시
git push origin main

echo.
echo ============================================
echo ✅ GitHub 전송 완료!
echo (커밋 메시지: %MSG%)
echo ============================================

pause