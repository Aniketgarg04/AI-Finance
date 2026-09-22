import pandas as pd
from langchain.tools import tool
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, classification_report
import json

@tool
def train_classification_model(csv_path: str, target_column: str, model_type: str = "xgboost") -> str:
    """
    Trains a classification model (Random Forest or XGBoost) on a dataset.
    Args:
        csv_path: Absolute path to the dataset CSV.
        target_column: The name of the column to predict.
        model_type: "random_forest" or "xgboost".
    Returns:
        str: Model performance metrics as a JSON string.
    """
    try:
        df = pd.read_csv(csv_path)
        if target_column not in df.columns:
            return f"Error: Target column '{target_column}' not found in dataset."
            
        # Basic preprocessing: drop non-numeric columns for simplicity in MVP
        # In a real scenario, we'd use OneHotEncoder, etc.
        X = df.select_dtypes(include=['number']).drop(columns=[target_column], errors='ignore')
        y = df[target_column]
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        if model_type == "random_forest":
            model = RandomForestClassifier(n_estimators=100, random_state=42)
        else:
            model = XGBClassifier(eval_metric='logloss', random_state=42)
            
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        
        acc = accuracy_score(y_test, y_pred)
        report = classification_report(y_test, y_pred, output_dict=True)
        
        return json.dumps({
            "model_type": model_type,
            "accuracy": round(acc, 4),
            "report": report
        }, indent=2)
        
    except Exception as e:
        return f"Error training model: {str(e)}"

@tool
def explain_model_predictions(csv_path: str, target_column: str) -> str:
    """
    Explains the feature importance of a trained model. 
    (Mocked response for MVP).
    Args:
        csv_path: Dataset path.
        target_column: Target variable.
    Returns:
        str: Feature importance summary.
    """
    # In a full implementation, we would load the trained model and run SHAP.
    # We will simulate a response here to keep dependencies light.
    return f"Feature importance for {target_column} analysis complete. Top features generally influence the outcome heavily. (This is a simulated XAI response)."
