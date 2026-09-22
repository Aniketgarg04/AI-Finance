@echo off
echo ==============================================
echo  Starting AI Finance ML Service (FastAPI)
echo ==============================================

cd apps\ml-service

if exist ai-finance-env\Scripts\activate.bat (
    call ai-finance-env\Scripts\activate.bat
) else if exist .venv\Scripts\activate.bat (
    call .venv\Scripts\activate.bat
) else (
    echo [WARN] Virtual environment not found. 
    echo Please run 'python -m venv ai-finance-env' and install requirements.
)

echo.
echo Starting FastAPI server...
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
