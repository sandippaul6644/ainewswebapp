@echo off
echo Starting AI News Web App...
echo.

echo Cleaning up ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Killing process %%a on port 3001
    taskkill /f /pid %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    echo Killing process %%a on port 5173
    taskkill /f /pid %%a >nul 2>&1
)

echo Ports cleaned up.
echo.

echo Starting development server...
npm run dev

pause