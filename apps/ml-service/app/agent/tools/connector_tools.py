import requests
from langchain.tools import tool

@tool
def fetch_user_transactions(user_id: str, backend_api_url: str = "http://localhost:3001/api/transactions") -> str:
    """
    Fetches user transactions from the core backend API.
    Args:
        user_id: The ID of the user.
        backend_api_url: The internal URL for the backend API.
    Returns:
        str: JSON string of transactions or error.
    """
    try:
        # For MVP, we mock the response instead of making a real HTTP request 
        # to avoid complex authentication setup in the tool itself.
        mock_data = [
            {"id": "txn_1", "amount": 1500, "category": "Office Supplies", "date": "2026-07-01"},
            {"id": "txn_2", "amount": 3200, "category": "Software Subscriptions", "date": "2026-07-10"},
            {"id": "txn_3", "amount": 800, "category": "Travel", "date": "2026-07-15"}
        ]
        import json
        return json.dumps(mock_data)
    except Exception as e:
        return f"Error fetching transactions: {str(e)}"

@tool
def create_salesforce_lead(name: str, company: str, email: str) -> str:
    """
    Mocks creating a lead in Salesforce CRM.
    Args:
        name: Name of the lead.
        company: Company of the lead.
        email: Email address of the lead.
    Returns:
        str: Confirmation message with Mock ID.
    """
    return f"Successfully created lead '{name}' from '{company}' in Salesforce. (Mock ID: SF-LEAD-998)"

@tool
def trigger_sap_erp_payment(vendor_id: str, amount: float, invoice_id: str) -> str:
    """
    Mocks triggering a payment in SAP ERP. HIGH RISK action.
    Args:
        vendor_id: ID of the vendor in SAP.
        amount: Payment amount.
        invoice_id: Corresponding invoice ID.
    Returns:
        str: Success message.
    """
    return f"SAP ERP Payment of ${amount} to vendor {vendor_id} for invoice {invoice_id} successfully scheduled. (Mock Transaction: SAP-PAY-441)"
