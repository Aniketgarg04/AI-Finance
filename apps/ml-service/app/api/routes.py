from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional

from app.services.llm_service import generate_chat_response, analyze_portfolio, generate_stock_recommendations
from app.agent.tools.stock_tools import sync_demat_account_holdings
from app.services.ml_models import categorize_expense, detect_fraud
from app.agent.tools.cas_parser import extract_holdings_from_cas_pdf, fetch_real_broker_holdings

router = APIRouter()

class BrokerApiRequest(BaseModel):
    broker_name: str
    api_key: str
    access_token: str

@router.post("/demat/broker-connect")
async def demat_broker_connect_endpoint(request: BrokerApiRequest):
    """
    Fetches real live stock holdings via broker API (Zerodha Kite, Upstox, Angel One).
    """
    try:
        import json
        res = fetch_real_broker_holdings.invoke({
            "broker_name": request.broker_name,
            "api_key": request.api_key,
            "access_token": request.access_token
        })
        return json.loads(res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/demat/upload-cas")
async def demat_upload_cas_endpoint(file: UploadFile = File(...), password: Optional[str] = Form(None)):
    """
    Extracts 100% REAL holdings, quantities, and buy prices from uploaded CDSL/NSDL e-CAS PDF statement.
    """
    try:
        content = await file.read()
        holdings = extract_holdings_from_cas_pdf(content, password)
        return {
            "status": "success",
            "source": "CAS_PDF",
            "total_holdings_count": len(holdings),
            "holdings": holdings
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class StockAdvisorRequest(BaseModel):
    portfolio_data: list
    risk_profile: Optional[str] = "MODERATE"

from app.agent.tools.stock_tools import (
    sync_demat_account_holdings,
    initiate_aa_consent,
    verify_aa_otp_and_fetch_holdings
)

class DematInitiateRequest(BaseModel):
    phone_number: str
    pan_or_demat: str
    broker_name: Optional[str] = "AccountAggregator"

class DematVerifyOtpRequest(BaseModel):
    consent_handle: str
    otp: str
    broker_name: Optional[str] = "AccountAggregator"

class DematSyncRequest(BaseModel):
    broker_name: str
    demat_account_number: Optional[str] = None
    pan_or_phone: Optional[str] = None
    auth_token_or_client_id: Optional[str] = "demo_token"

@router.post("/demat/initiate-consent")
async def demat_initiate_consent_endpoint(request: DematInitiateRequest):
    """
    Step 1 of RBI Account Aggregator: Dispatches OTP to registered mobile.
    """
    try:
        import json
        res = initiate_aa_consent.invoke({
            "phone_number": request.phone_number,
            "pan_or_demat": request.pan_or_demat,
            "broker_name": request.broker_name
        })
        return json.loads(res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/demat/verify-otp")
async def demat_verify_otp_endpoint(request: DematVerifyOtpRequest):
    """
    Step 2 of RBI Account Aggregator: Validates OTP and fetches real holdings.
    """
    try:
        import json
        res = verify_aa_otp_and_fetch_holdings.invoke({
            "consent_handle": request.consent_handle,
            "otp": request.otp,
            "broker_name": request.broker_name
        })
        return json.loads(res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stock-advisor")
async def stock_advisor_endpoint(request: StockAdvisorRequest):
    """
    Analyzes user stock holdings with real-time web market data,
    evaluates P/L, and produces BUY/HOLD/SELL decisions + new stock recommendations.
    """
    try:
        result = await generate_stock_recommendations(request.portfolio_data, request.risk_profile)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/demat/sync")
async def demat_sync_endpoint(request: DematSyncRequest):
    """
    Direct Demat Sync for API tokens & BO IDs.
    """
    try:
        import json
        sync_result = sync_demat_account_holdings.invoke({
            "broker_name": request.broker_name,
            "auth_token_or_client_id": request.demat_account_number or request.auth_token_or_client_id
        })
        return json.loads(sync_result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ChatRequest(BaseModel):
    message: str
    user_context: Optional[dict] = None
    history: Optional[list] = None

class ChatResponse(BaseModel):
    reply: str

class PortfolioAnalyzeRequest(BaseModel):
    portfolio_data: list

class PortfolioAnalyzeResponse(BaseModel):
    analysis: str

class ExpenseCategorizeRequest(BaseModel):
    description: str
    amount: float

class ExpenseCategorizeResponse(BaseModel):
    category: str
    confidence: float

class FraudDetectionRequest(BaseModel):
    user_id: str
    amount: float
    merchant: str
    location: Optional[str] = None
    time: Optional[str] = None

class FraudDetectionResponse(BaseModel):
    is_fraud: bool
    risk_score: float
    reason: Optional[str] = None

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        reply = await generate_chat_response(request.message, request.user_context, request.history)
        return ChatResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/categorize", response_model=ExpenseCategorizeResponse)
async def categorize_endpoint(request: ExpenseCategorizeRequest):
    try:
        category, confidence = categorize_expense(request.description, request.amount)
        return ExpenseCategorizeResponse(category=category, confidence=confidence)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/fraud-detect", response_model=FraudDetectionResponse)
async def fraud_detect_endpoint(request: FraudDetectionRequest):
    try:
        is_fraud, risk_score, reason = detect_fraud(
            request.amount, request.merchant, request.location, request.time
        )
        return FraudDetectionResponse(is_fraud=is_fraud, risk_score=risk_score, reason=reason)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-portfolio", response_model=PortfolioAnalyzeResponse)
async def analyze_portfolio_endpoint(request: PortfolioAnalyzeRequest):
    try:
        analysis = await analyze_portfolio(request.portfolio_data)
        return PortfolioAnalyzeResponse(analysis=analysis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Agentic AI Endpoints ---
from app.agent.orchestrator import agent_executor
from langchain_core.messages import HumanMessage, AIMessage

class AgentRequest(BaseModel):
    message: str
    thread_id: str = "default_thread"
    # To handle hitl approval (resume execution)
    approval: Optional[bool] = None

class AgentResponse(BaseModel):
    reply: str
    pending_approval: bool
    tool_calls: Optional[list] = None

@router.post("/agent", response_model=AgentResponse)
async def agent_endpoint(request: AgentRequest):
    try:
        # Configuration for thread memory
        config = {"configurable": {"thread_id": request.thread_id}}
        
        # If the user is approving a paused HITL action
        if request.approval is not None:
            if request.approval:
                # Resume execution
                result = agent_executor.invoke(None, config=config)
            else:
                # Cancel execution
                return AgentResponse(reply="Action cancelled by user.", pending_approval=False)
        else:
            # Start new reasoning loop
            input_message = HumanMessage(content=request.message)
            result = agent_executor.invoke({"messages": [input_message]}, config=config)
        
        last_message = result["messages"][-1]
        reply = last_message.content if isinstance(last_message, AIMessage) else "Processed."
        tool_calls = last_message.tool_calls if hasattr(last_message, "tool_calls") else []
        
        return AgentResponse(
            reply=reply, 
            pending_approval=result.get("pending_approval", False),
            tool_calls=tool_calls
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
