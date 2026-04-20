@echo off
REM ========================================================================
REM  Baseball Daily Intelligence — Daily Ingestion Runner
REM  Target: Windows Task Scheduler, 5:00 AM local time.
REM ========================================================================

cd /d "%~dp0"
if not exist "logs" mkdir logs

echo. >> logs\ingestion.log
echo [%DATE% %TIME%] ------------------------------------------ >> logs\ingestion.log
echo [%DATE% %TIME%] Starting daily ingestion... >> logs\ingestion.log

node ingestion\fetch-daily.js >> logs\ingestion.log 2>&1
if errorlevel 1 (
  echo [%DATE% %TIME%] INGESTION FAILED — see log above. >> logs\ingestion.log
  exit /b 1
)

echo [%DATE% %TIME%] Ingestion complete. >> logs\ingestion.log
exit /b 0
