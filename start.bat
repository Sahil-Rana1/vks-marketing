@echo off
echo ======================================================
echo Launching VKS Marketing MERN Development Servers
echo ======================================================
echo.
echo Starting backend server on port 5000...
start cmd /k "cd server && npm run dev"

echo Starting frontend client on port 5173...
start cmd /k "npm run dev"

echo.
echo Launch sequence initiated successfully!
echo.
echo [API URL]     http://localhost:5000/health
echo [Client URL]  http://localhost:5173/
echo.
echo Press any key to close this launcher console window...
pause > nul
