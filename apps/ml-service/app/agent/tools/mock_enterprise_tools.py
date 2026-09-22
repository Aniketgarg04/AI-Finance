from langchain.tools import tool

@tool
def send_email(to_address: str, subject: str, body: str) -> str:
    """
    Sends an email to the specified address.
    Args:
        to_address: The recipient email address.
        subject: The subject of the email.
        body: The content of the email.
    Returns:
        str: Success message.
    """
    # In a real scenario, this would use an SMTP server or an API like SendGrid.
    # We are simulating it for the MVP.
    return f"Successfully sent email to {to_address} with subject '{subject}'."

@tool
def generate_pdf_report(title: str, content: str) -> str:
    """
    Generates a PDF report and returns the file path.
    Args:
        title: The title of the report.
        content: The text content of the report.
    Returns:
        str: The path where the PDF is saved.
    """
    # Mocking PDF generation
    file_path = f"/tmp/reports/{title.replace(' ', '_').lower()}.pdf"
    return f"PDF report '{title}' successfully generated and saved to {file_path}."
