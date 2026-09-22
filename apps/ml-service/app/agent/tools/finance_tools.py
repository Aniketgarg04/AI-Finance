from langchain.tools import tool

@tool
def calculate_gst(amount: float, rate: float = 18.0) -> dict:
    """
    Calculates the GST (Goods and Services Tax) for a given amount.
    Args:
        amount: The base amount.
        rate: The GST percentage (default is 18.0).
    Returns:
        dict: A dictionary containing the base amount, gst amount, and total amount.
    """
    gst_amount = amount * (rate / 100.0)
    total_amount = amount + gst_amount
    return {
        "base_amount": amount,
        "gst_rate": rate,
        "gst_amount": round(gst_amount, 2),
        "total_amount": round(total_amount, 2)
    }

@tool
def calculate_payroll(base_salary: float, bonus: float = 0.0, deductions: float = 0.0) -> dict:
    """
    Calculates the final payroll amount for an employee.
    Args:
        base_salary: The basic salary.
        bonus: Any additional bonus.
        deductions: Any tax or provident fund deductions.
    Returns:
        dict: Net payable salary breakdown.
    """
    net_salary = base_salary + bonus - deductions
    return {
        "base_salary": base_salary,
        "bonus": bonus,
        "deductions": deductions,
        "net_payable": round(net_salary, 2)
    }

@tool
def generate_invoice(customer_name: str, items: list, tax_rate: float = 18.0) -> str:
    """
    Generates a mock invoice for a customer.
    Args:
        customer_name: Name of the customer.
        items: List of dictionaries with 'name' and 'price'.
        tax_rate: Tax rate to apply.
    Returns:
        str: Formatted invoice text.
    """
    subtotal = sum(item.get('price', 0) for item in items)
    tax = subtotal * (tax_rate / 100.0)
    total = subtotal + tax
    
    invoice = f"--- INVOICE ---\nCustomer: {customer_name}\n"
    for item in items:
        invoice += f"- {item.get('name')}: ${item.get('price', 0):.2f}\n"
    invoice += f"-----------------\nSubtotal: ${subtotal:.2f}\nTax ({tax_rate}%): ${tax:.2f}\nTOTAL: ${total:.2f}\n"
    return invoice
