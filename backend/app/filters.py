import pandas as pd

def apply_filters(df: pd.DataFrame, filter_str: str) -> pd.DataFrame:
    """
    Apply filter string like "age > 30 AND city == 'NYC'"
    Returns filtered DataFrame. Uses pandas.query() after basic transformation.
    """
    if not filter_str or filter_str.strip() == "":
        return df
    
    # Convert to pandas query syntax
    # Replace 'AND' -> '&', 'OR' -> '|'
    query = filter_str.replace('AND', '&').replace('OR', '|')
    try:
        return df.query(query)
    except Exception as e:
        raise ValueError(f"Invalid filter expression: {str(e)}")