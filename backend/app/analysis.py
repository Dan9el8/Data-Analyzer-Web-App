import pandas as pd
import numpy as np

def analyze_dataframe(df: pd.DataFrame) -> dict:
    """Compute all stats and chart data from a pandas DataFrame."""
    
    # Basic info
    shape = df.shape
    columns = list(df.columns)
    dtypes = df.dtypes.astype(str).to_dict()
    
    # Missing values
    missing = df.isnull().sum().to_dict()
    missing_pct = (df.isnull().sum() / len(df) * 100).round(2).to_dict()
    
    # Numeric columns stats
    numeric_cols = df.select_dtypes(include=np.number).columns.tolist()
    if numeric_cols:
        desc_stats = df[numeric_cols].describe(percentiles=[.25, .5, .75]).to_dict()
    else:
        desc_stats = {}
    
    # Histogram data for each numeric column
    histograms = {}
    for col in numeric_cols:
        series = df[col].dropna()
        if len(series) > 0:
            counts, bin_edges = np.histogram(series, bins='auto')
            histograms[col] = {
                "counts": counts.tolist(),
                "bin_edges": bin_edges.tolist()
            }
    
    # Categorical value counts (top 10)
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    value_counts = {}
    for col in categorical_cols:
        vc = df[col].value_counts().head(10).to_dict()
        value_counts[col] = vc
    
    # Correlation matrix (numeric)
    correlation = None
    if len(numeric_cols) >= 2:
        corr_matrix = df[numeric_cols].corr().round(4)
        correlation = {
            "columns": corr_matrix.columns.tolist(),
            "data": corr_matrix.values.tolist()
        }
    
    return {
        "shape": shape,
        "columns": columns,
        "dtypes": dtypes,
        "missing": missing,
        "missing_pct": missing_pct,
        "numeric_cols": numeric_cols,
        "categorical_cols": categorical_cols,
        "description": desc_stats,
        "histograms": histograms,
        "value_counts": value_counts,
        "correlation": correlation
    }