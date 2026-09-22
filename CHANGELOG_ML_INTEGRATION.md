# Phase 3: AI & Machine Learning Integration

This document outlines the changes and new implementations made to integrate the AI/ML microservice into the AI Finance Copilot platform.

## 1. New ML Microservice (`apps/ml-service`)
A new Python FastAPI microservice has been built from scratch to handle all artificial intelligence, machine learning, and natural language processing tasks.

### Core Files Added:
* **`main.py`**: The entry point for the FastAPI server. Configures CORS and loads environment variables dynamically so that API keys (`GEMINI_API_KEY`) are properly recognized by the AI SDKs.
* **`requirements.txt`**: Added necessary dependencies, crucially bumping `google-generativeai>=0.5.2` to support the latest available Gemini models.
* **`app/api/routes.py`**: Exposes three core REST endpoints:
  * `POST /api/v1/chat`: Handles conversational AI queries.
  * `POST /api/v1/categorize`: Analyzes expense descriptions and returns a predicted category.
  * `POST /api/v1/fraud-detect`: Analyzes transaction velocity and merchant context to score fraud probability.
* **`app/services/ml_models.py`**: Implements the logic for `categorize_expense` and `detect_fraud`. Currently utilizing high-confidence heuristics and keyword scoring to simulate models, which can be easily swapped for trained Scikit-learn models in the future.
* **`app/services/llm_service.py`**: Implements `generate_chat_response`. Successfully integrated Google's newer **`gemini-flash-latest`** model (bypassing Google's recent deprecation of legacy `gemini-pro` models). Also includes fallback support for OpenAI (`OPENAI_API_KEY`) if needed.

## 2. NestJS Backend Updates (`apps/api`)
The main TypeScript backend was wired up to act as a bridge between the frontend and the Python ML service.

### Modified Files:
* **`src/chat/chat.service.ts`**: 
  * Overhauled the `create` method. Instead of just saving a mock response, the backend now makes an HTTP `POST` request to the ML service's `http://localhost:8000/api/v1/chat` endpoint. 
  * Retrieves the real AI response and saves the complete Chat interaction to the Prisma Database.
* **`src/transactions/transactions.service.ts`**:
  * Added auto-categorization: When an `EXPENSE` is created without a predefined category, it automatically queries the ML service (`/categorize`) to intelligently assign one.
  * Added fraud detection: Every new expense is routed through the ML service (`/fraud-detect`). If flagged as fraudulent, the backend automatically creates a persistent `FraudAlert` record in the database linked to the transaction.

## 3. Next.js Frontend Updates (`apps/web`)
* **`src/app/(dashboard)/assistant/page.tsx`**: 
  * Modified the `api.post('/chat')` call. Removed the hardcoded mock frontend response payload so the backend is forced to query the real ML service.
  * **Bug Fix**: Resolved a Next.js React Hydration Mismatch error that was occurring due to timestamp formatting differences between the SSR build and the client browser timezone. Fixed by adding `suppressHydrationWarning` to the timestamp element.

## 4. Automation & DevOps
* **`start-ml.bat`**: Created a dedicated Windows batch script in the repository root to streamline the startup of the Python environment. It handles changing into the `ml-service` directory, installing `pip` requirements, and booting the Uvicorn server on port 8000 with auto-reload enabled.

## Environment Variables Required
Backend team members running this branch will need to ensure the following are added to `apps/ml-service/.env`:
```env
# Required for Conversational AI:
GEMINI_API_KEY="your-google-ai-studio-key"

# Optional Fallback:
OPENAI_API_KEY="sk-..."
```
