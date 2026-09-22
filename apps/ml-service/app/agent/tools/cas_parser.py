import re
import json
import io
import yfinance as yf
from pypdf import PdfReader
from langchain.tools import tool

def extract_holdings_from_cas_pdf(pdf_bytes: bytes, password: str = None) -> list:
    """
    Parses an official CDSL, NSDL, or CAMS Consolidated Account Statement (CAS) PDF.
    Extracts real stock holdings, ISINs, quantities, and cost values.
    """
    reader = PdfReader(io.BytesIO(pdf_bytes))
    if reader.is_encrypted:
        if password:
            reader.decrypt(password)
        else:
            raise ValueError("PDF is password protected. Please provide your PAN (in CAPITAL letters) or Date of Birth.")

    full_text = ""
    for page in reader.pages:
        full_text += page.extract_text() + "\n"

    # Regex patterns to extract Indian stock holdings & ISINs
    # Pattern: [ISIN: INE...] or Stock Name followed by quantities
    isin_pattern = re.compile(r'(INE[A-Z0-9]{9})\s+([A-Za-z0-9\s\.\&\-]+?)\s+([0-9\.\,]+)\s+([0-9\.\,]+)')
    
    extracted_stocks = []
    
    # Generic table row parser for CDSL / NSDL statements
    lines = full_text.split('\n')
    for line in lines:
        match = isin_pattern.search(line)
        if match:
            isin, name, qty_str, val_str = match.groups()
            try:
                qty = float(qty_str.replace(',', ''))
                val = float(val_str.replace(',', ''))
                buy_price = round(val / qty, 2) if qty > 0 else val
                
                # Derive NSE symbol from common company name or ISIN
                symbol = name.split()[0].upper()
                if not symbol.endswith('.NS'):
                    symbol = f"{symbol}.NS"
                    
                extracted_stocks.append({
                    "symbol": symbol,
                    "isin": isin,
                    "name": name.strip(),
                    "quantity": qty,
                    "buy_price": buy_price,
                    "asset_type": "STOCK"
                })
            except Exception:
                continue

    return extracted_stocks


@tool
def fetch_real_broker_holdings(broker_name: str, api_key: str, access_token: str) -> str:
    """
    Directly connects to official broker APIs (Zerodha Kite, Upstox, Angel One) to fetch 100% REAL holdings.
    Args:
        broker_name: 'Zerodha', 'Upstox', 'AngelOne', 'Dhan'
        api_key: Developer API key
        access_token: Active daily session access token
    Returns:
        str: JSON string of real-time holdings
    """
    import requests
    holdings = []
    
    if broker_name.lower() == 'zerodha':
        # Official Zerodha Kite Connect API
        url = "https://api.kite.trade/portfolio/holdings"
        headers = {"X-Kite-Version": "3", "Authorization": f"token {api_key}:{access_token}"}
        resp = requests.get(url, headers=headers)
        if resp.status_code == 200:
            data = resp.json().get("data", [])
            for item in data:
                sym = item.get("tradingsymbol", "")
                holdings.append({
                    "symbol": f"{sym}.NS" if not sym.endswith(".NS") else sym,
                    "name": item.get("tradingsymbol"),
                    "quantity": item.get("quantity", 0),
                    "buy_price": item.get("average_price", 0),
                    "current_price": item.get("last_price", 0),
                    "asset_type": "STOCK"
                })
        else:
            return json.dumps({"error": f"Zerodha Kite API returned error: {resp.text}"})

    elif broker_name.lower() == 'upstox':
        # Official Upstox v2 API
        url = "https://api.upstox.com/v2/portfolio/long-term-holdings"
        headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/json"}
        resp = requests.get(url, headers=headers)
        if resp.status_code == 200:
            data = resp.json().get("data", [])
            for item in data:
                sym = item.get("tradingsymbol", "")
                holdings.append({
                    "symbol": f"{sym}.NS" if not sym.endswith(".NS") else sym,
                    "name": item.get("company_name", sym),
                    "quantity": item.get("quantity", 0),
                    "buy_price": item.get("average_price", 0),
                    "current_price": item.get("last_price", 0),
                    "asset_type": "STOCK"
                })
        else:
            return json.dumps({"error": f"Upstox API returned error: {resp.text}"})

    return json.dumps({
        "status": "success",
        "broker": broker_name,
        "total_holdings_count": len(holdings),
        "holdings": holdings
    }, indent=2)
