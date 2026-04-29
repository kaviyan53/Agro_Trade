@echo off
echo Starting Agrotrade Project...

echo -------------------------------------------------------------------
echo Setting up and starting Backend Server...
echo -------------------------------------------------------------------
start cmd /k "title Backend && cd backend && if not exist venv (python -m venv venv) && call venv\Scripts\activate && pip install -r requirements.txt && python seed.py && python -m uvicorn main:app --reload"

echo.
echo -------------------------------------------------------------------
echo Setting up and starting Frontend Server...
echo -------------------------------------------------------------------
start cmd /k "title Frontend && cd frontend && npm install && npm run dev"

echo.
echo Both services have been launched in separate windows!
echo It might take a moment to install dependencies for the first run.
echo.
echo Once started:
echo   - Frontend will run on: http://localhost:5173
echo   - Backend will run on: http://127.0.0.1:8000
echo.
echo You can use the seeded demo user to login: 
echo   Email: demo@agrotrade.com
echo   Password: demo1234
echo.
pause
