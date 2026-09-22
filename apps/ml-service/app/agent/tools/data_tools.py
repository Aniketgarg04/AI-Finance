import pandas as pd
from langchain.tools import tool
import os

@tool
def process_excel_dataset(file_path: str, output_csv_path: str) -> str:
    """
    Reads an Excel dataset, standardizes column names, drops completely empty rows, 
    and converts it to CSV for further ML processing.
    Args:
        file_path: The absolute path to the excel file.
        output_csv_path: The absolute path where the cleaned CSV should be saved.
    Returns:
        str: Success message or error message.
    """
    try:
        df = pd.read_excel(file_path)
        # Standardize column names (lowercase, replace spaces with underscores)
        df.columns = [str(c).strip().lower().replace(" ", "_") for c in df.columns]
        # Drop empty rows
        df.dropna(how='all', inplace=True)
        # Save to csv
        df.to_csv(output_csv_path, index=False)
        return f"Successfully processed Excel file. Saved {len(df)} rows to {output_csv_path}."
    except Exception as e:
        return f"Error processing excel dataset: {str(e)}"

@tool
def clean_missing_data(csv_path: str, strategy: str = "mean") -> str:
    """
    Cleans a dataset by handling missing values.
    Args:
        csv_path: Absolute path to the dataset CSV.
        strategy: "mean" (fill with mean), "drop" (drop rows), or "zero" (fill with 0).
    Returns:
        str: Summary of the cleaning operation.
    """
    try:
        df = pd.read_csv(csv_path)
        initial_missing = df.isnull().sum().sum()
        
        if strategy == "drop":
            df.dropna(inplace=True)
        elif strategy == "mean":
            for col in df.columns:
                if pd.api.types.is_numeric_dtype(df[col]):
                    df[col].fillna(df[col].mean(), inplace=True)
                else:
                    df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else "Unknown", inplace=True)
        elif strategy == "zero":
            df.fillna(0, inplace=True)
            
        final_missing = df.isnull().sum().sum()
        df.to_csv(csv_path, index=False)
        return f"Cleaning complete. Reduced missing values from {initial_missing} to {final_missing} using '{strategy}' strategy."
    except Exception as e:
        return f"Error cleaning dataset: {str(e)}"
