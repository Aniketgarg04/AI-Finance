import json
import yfinance as yf
from app.ai import ai_provider

async def generate_stock_recommendations(portfolio_data: list, risk_profile: str = "MODERATE") -> dict:
    """
    Analyzes user stock holdings with real-time web market data and generates
    actionable BUY / HOLD / SELL recommendations plus new high-potential stock ideas.
    """
    enriched_holdings = []
    
    # 1. Fetch live market metrics for each holding
    for item in portfolio_data:
        symbol = item.get("assetSymbol") or item.get("symbol") or "N/A"
        buy_price = float(item.get("buyPrice", 0) or item.get("buy_price", 0))
        quantity = float(item.get("quantity", 0))
        name = item.get("assetName") or item.get("name") or symbol

        # Live data lookup
        live_price = buy_price
        pe_ratio = "N/A"
        analyst_rating = "HOLD"
        day_change = "0.0%"

        if symbol != "N/A":
            try:
                ticker = yf.Ticker(symbol if symbol.endswith((".NS", ".BO")) or len(symbol) <= 4 else f"{symbol}.NS")
                info = ticker.info
                live_price = info.get("currentPrice") or info.get("regularMarketPrice") or buy_price
                pe_ratio = info.get("trailingPE", "N/A")
                analyst_rating = info.get("recommendationKey", "HOLD").upper()
            except Exception:
                pass

        pnl = (live_price - buy_price) * quantity if buy_price > 0 else 0
        pnl_percent = ((live_price - buy_price) / buy_price) * 100 if buy_price > 0 else 0

        enriched_holdings.append({
            "symbol": symbol,
            "name": name,
            "quantity": quantity,
            "buy_price": buy_price,
            "current_price": round(live_price, 2),
            "pnl_amount": round(pnl, 2),
            "pnl_percent": f"{round(pnl_percent, 2)}%",
            "pe_ratio": pe_ratio,
            "analyst_rating": analyst_rating
        })

    # 2. Synthesize AI Stock Advisor Decision
    system_prompt = (
        "You are an Elite AI Stock Analyst and Portfolio Manager. "
        "Analyze the user's current holdings with the live market data provided. "
        "For each holding, classify it into one of: BUY MORE, HOLD, or SELL with a concise reasoning and target price. "
        "Also recommend 3 NEW high-potential stocks to buy based on their risk profile. "
        "Format your answer cleanly with Markdown headings, tables, and bullet points."
    )

    prompt = (
        f"User Risk Profile: {risk_profile}\n\n"
        f"Enriched Portfolio Data with Live Market Prices:\n{json.dumps(enriched_holdings, indent=2)}\n\n"
        "Please provide:\n"
        "1. **Portfolio Health & Performance Summary**\n"
        "2. **Stock-by-Stock Decision Table** (Symbol | Action [BUY MORE/HOLD/SELL] | Target Price | Rationale)\n"
        "3. **Suggested New Stock Picks** (Tailored for profit and the user's risk profile with entry range & target)\n"
        "4. **Risk Management & Exit Strategy**"
    )

    try:
        analysis = ai_provider.generate_chat(messages=[{"role": "user", "content": prompt}], system_prompt=system_prompt)
        return {
            "status": "success",
            "risk_profile": risk_profile,
            "enriched_holdings": enriched_holdings,
            "recommendations": analysis
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "enriched_holdings": enriched_holdings,
            "recommendations": "Error generating AI recommendations. Please check Ollama/LLM status."
        }

async def analyze_portfolio(portfolio_data: list) -> str:
    system_prompt = (
        "You are an expert AI Wealth Manager. The user has requested a comprehensive analysis of their current investment portfolio. "
        "Provide a detailed markdown report including exactly the following sections:\n"
        "### Risk Analysis\n### Diversification Score\n### Sector Exposure\n"
        "### Asset Allocation Review\n### Suggested Rebalancing\n### Tax Saving Opportunities\n"
        "Make your response professional, visually structured with markdown, and highly insightful."
    )
    
    portfolio_str = json.dumps(portfolio_data, indent=2)
    message = f"Here is my current portfolio data:\n{portfolio_str}\nPlease analyze it and give me recommendations."

    try:
        return ai_provider.generate_chat(messages=[{"role": "user", "content": message}], system_prompt=system_prompt)
    except Exception as e:
        return f"AI Provider Error: {str(e)}"

async def generate_chat_response(message: str, user_context: dict = None, history: list = None) -> str:
    system_prompt = (
        "You are 'AI Finance Copilot', an expert financial assistant. "
        "Help the user manage their finances, provide insights, and answer their questions professionally and concisely. "
        "System Behavior Rules:\n"
        "- Use the provided financial data.\n"
        "- Be conservative and state assumptions.\n"
        "- Perform calculations based on provided values.\n"
        "- NEVER invent financial data, fake transactions, or fabricate account balances.\n"
        "- Give actionable recommendations."
    )
    
    if user_context:
        context_str = json.dumps(user_context)
        system_prompt += f"\nHere is the user's real financial context for reference: {context_str}"

    formatted_history = []
    if history:
        for h in history:
            formatted_history.append({"role": "user", "content": h.get("prompt", "")})
            formatted_history.append({"role": "assistant", "content": h.get("response", "")})

    formatted_history.append({"role": "user", "content": message})

    try:
        reply = ai_provider.generate_chat(messages=formatted_history, system_prompt=system_prompt)
        return reply
    except Exception as e:
        return f"Ollama Connection Error. Ensure Ollama is running and the model is downloaded. Details: {str(e)}"

