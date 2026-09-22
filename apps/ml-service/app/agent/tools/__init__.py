from .finance_tools import calculate_gst, calculate_payroll, generate_invoice
from .mock_enterprise_tools import send_email, generate_pdf_report
from .data_tools import process_excel_dataset, clean_missing_data
from .ml_tools import train_classification_model, explain_model_predictions
from .connector_tools import fetch_user_transactions, create_salesforce_lead, trigger_sap_erp_payment
from .stock_tools import get_stock_market_data, search_stock_news_sentiment, sync_demat_account_holdings

ALL_TOOLS = [
    calculate_gst,
    calculate_payroll,
    generate_invoice,
    send_email,
    generate_pdf_report,
    process_excel_dataset,
    clean_missing_data,
    train_classification_model,
    explain_model_predictions,
    fetch_user_transactions,
    create_salesforce_lead,
    trigger_sap_erp_payment,
    get_stock_market_data,
    search_stock_news_sentiment,
    sync_demat_account_holdings
]

