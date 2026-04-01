@echo off
setlocal enabledelayedexpansion

echo AI-NGFW Development Setup
echo ==========================

REM Check Python version
echo Checking Python version...
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo Python version: %PYTHON_VERSION%

REM Create virtual environment
echo Creating virtual environment...
if not exist "venv" (
    python -m venv venv
    echo Virtual environment created
) else (
    echo Virtual environment already exists
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install backend dependencies
echo Installing backend dependencies...
pip install -e .

REM Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed. Please install Node.js 20+
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo Node version: %NODE_VERSION%

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend

if exist "pnpm-lock.yaml" (
    echo Using pnpm...
    npm install -g pnpm
    pnpm install
) else if exist "yarn.lock" (
    echo Using yarn...
    yarn install
) else (
    echo Using npm...
    npm install
)

cd ..

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    (
        echo # Database Configuration
        echo DATABASE_URL=sqlite:///./ai_ngfw.db
        echo REDIS_URL=redis://localhost:6379
        echo.
        echo # Groq API
        echo GROQ_API_KEY=your_groq_api_key_here
        echo GROQ_MODEL=mixtral-8x7b-32768
        echo.
        echo # HuggingFace
        echo HUGGINGFACE_API_TOKEN=your_token_here
        echo.
        echo # FastAPI
        echo API_TITLE=AI-NGFW API
        echo API_VERSION=0.1.0
        echo DEBUG=true
        echo.
        echo # Frontend
        echo REACT_APP_API_URL=http://localhost:7860/api
    ) > .env
    echo Created .env file - please add your Groq API key
) else (
    echo .env file already exists
)

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Update .env with your Groq API key
echo 2. Run the backend: python -m backend.main
echo 3. In another terminal, run the frontend:
echo    cd frontend ^&^& npm run dev
echo 4. Visit http://localhost:5173
echo.

pause
