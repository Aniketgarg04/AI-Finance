import random
from pydantic import BaseModel, Field
from app.ai import ai_provider

# Define structured output schema for Pydantic/Ollama
class CategorizeOutput(BaseModel):
    category: str = Field(description="The predicted category for the expense. Must be one of the exact specified categories.")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0.")
    reason: str = Field(description="Brief reason for this categorization.")

def categorize_expense(description: str, amount: float):
    system_prompt = (
        "You are an expert financial categorization AI. "
        "Categorize the given transaction description into one of these exact categories: "
        "Food, Transport, Shopping, Bills, Entertainment, Healthcare, Education, Investment, Travel, Salary, Other."
    )
    prompt = f"Description: {description}\nAmount: {amount}"
    
    try:
        # Calls Ollama utilizing the Pydantic schema for structured output
        result: CategorizeOutput = ai_provider.generate_structured(
            prompt=prompt, 
            schema=CategorizeOutput, 
            system_prompt=system_prompt
        )
        return result.category, result.confidence
    except Exception as e:
        print(f"Error in LLM categorization: {e}")
        # Fallback if Ollama fails
        return "Other", 0.5


def detect_fraud(amount: float, merchant: str, location: str = None, time: str = None):
    """
    Layered architecture: Deterministic rules + ML risk scoring + LLM Explanation
    """
    risk_score = 0.0
    reasons = []
    
    # Rule 1: High amount
    if amount > 5000:
        risk_score += 0.5
        reasons.append("Transaction amount is significantly higher than normal")
    
    # Rule 2: Suspicious merchant
    suspicious_keywords = ["crypto", "casino", "betting", "wire", "unknown"]
    if any(word in merchant.lower() for word in suspicious_keywords):
        risk_score += 0.3
        reasons.append("Merchant/category is unusual or high-risk")
        
    # Rule 3: Simulated timing/velocity anomaly
    if amount > 1000 and random.random() > 0.8:
        risk_score += 0.2
        reasons.append("Transaction timing is abnormal")
        
    # Cap score at 1.0
    risk_score = min(1.0, risk_score)
    is_fraud = risk_score >= 0.7
    
    reasons_str = ", ".join(reasons) if reasons else "Normal transaction pattern"
    
    # Generate human-readable explanation using Ollama based strictly on the deterministic score
    system_prompt = (
        "You are a fraud detection explainer. Do NOT change the risk score. "
        "Given the deterministic risk score and reasons, write a clear, 1-2 sentence human-readable "
        "explanation of the risk assessment."
    )
    prompt = f"Amount: {amount}, Merchant: {merchant}, Risk Score: {risk_score}, Reasons: {reasons_str}"
    
    try:
        ai_explanation = ai_provider.generate_chat(messages=[{"role": "user", "content": prompt}], system_prompt=system_prompt)
    except Exception as e:
        print(f"Error generating LLM explanation: {e}")
        ai_explanation = reasons_str
    
    return is_fraud, risk_score, ai_explanation
