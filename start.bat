@echo off
echo =========================================
echo Starting SIH 2026 Application...
echo =========================================

echo.
echo Starting Backend (FastAPI on port 8001)...
start "SIH 2026 Backend" cmd /k "cd backend && uvicorn main:app --port 8001 --reload"

echo.
echo Starting Frontend (Vite)...
start "SIH 2026 Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting up in separate windows!
echo - Backend will be available at http://localhost:8001
echo - Frontend will be available at http://localhost:5174 (or 5173)
echo.
echo You can use this start.bat file to easily launch everything next time.
pause
