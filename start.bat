@echo off
echo Starting Bus Ticket System...
start "Backend" cmd /c "cd backend && venv\Scripts\python.exe manage.py runserver"
start "Frontend" cmd /c "cd frontend && npm run dev"
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
pause
