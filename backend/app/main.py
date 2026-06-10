import os
import uuid
import shutil
import json
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from dotenv import load_dotenv
from .tasks import analyze_file
from .filters import apply_filters
from .reports import generate_html_report, generate_pdf_report
from .analysis import analyze_dataframe
import pandas as pd

load_dotenv()

COUNTRY_MAP = {
    'united states': 'USA', 'usa': 'USA', 'us': 'USA',
    'canada': 'CAN', 'ca': 'CAN',
    'united kingdom': 'GBR', 'uk': 'GBR', 'england': 'GBR',
    'germany': 'DEU', 'de': 'DEU',
    'france': 'FRA', 'fr': 'FRA',
    'italy': 'ITA', 'it': 'ITA',
    'spain': 'ESP', 'es': 'ESP',
    'china': 'CHN', 'cn': 'CHN',
    'japan': 'JPN', 'jp': 'JPN',
    'india': 'IND', 'in': 'IND',
    'brazil': 'BRA', 'br': 'BRA',
    'australia': 'AUS', 'au': 'AUS',
    # add more as needed
}



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
RESULTS_DIR = os.getenv("RESULTS_DIR", "results")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Validate file type
    if not (file.filename.endswith('.csv') or file.filename.endswith(('.xls', '.xlsx'))):
        raise HTTPException(400, "Only CSV or Excel files are allowed")
    
    # Save file
    file_ext = os.path.splitext(file.filename)[1]
    unique_id = str(uuid.uuid4())
    saved_filename = f"{unique_id}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, saved_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(500, f"Could not save file: {str(e)}")
    
    # Start Celery task
    task = analyze_file.delay(file_path, file.filename)
    
    return {
        "task_id": task.id,
        "message": "Analysis started. Poll /task/{task_id} for status."
    }

@app.get("/task/{task_id}")
def get_task_status(task_id: str):
    from celery.result import AsyncResult
    from .tasks import celery_app
    task = AsyncResult(task_id, app=celery_app)
    
    if task.state == "PENDING":
        return {"status": "pending"}
    elif task.state == "FAILURE":
        return {"status": "failed", "error": str(task.info)}
    elif task.state == "SUCCESS":
        result_path = os.path.join(RESULTS_DIR, f"{task_id}.json")
        if os.path.exists(result_path):
            with open(result_path) as f:
                data = json.load(f)
            return {"status": "completed", "result": data}
        else:
            return {"status": "completed", "result": task.result}
    else:
        return {"status": task.state.lower()}

@app.post("/filter/{task_id}")
def filter_analysis(task_id: str, filter_str: str):
    result_path = os.path.join(RESULTS_DIR, f"{task_id}.json")
    if not os.path.exists(result_path):
        raise HTTPException(404, "Analysis not found")
    
    with open(result_path) as f:
        saved = json.load(f)
    
    file_path = os.path.join(UPLOAD_DIR, saved["saved_filename"])
    if not os.path.exists(file_path):
        raise HTTPException(404, "Original file not found")
    
    # Load DataFrame
    if file_path.endswith('.csv'):
        df = pd.read_csv(file_path)
    else:
        df = pd.read_excel(file_path)
    
    try:
        filtered_df = apply_filters(df, filter_str)
    except ValueError as e:
        raise HTTPException(400, str(e))
    
    # Re-run analysis on filtered data
    new_results = analyze_dataframe(filtered_df)
    
    return {
        "task_id": task_id,
        "filter": filter_str,
        "original_rows": len(df),
        "filtered_rows": len(filtered_df),
        "results": new_results
    }

@app.get("/scatter/{task_id}")
def scatter_data(task_id: str, x_col: str, y_col: str, filter_str: str = ""):
    # Load original file
    result_path = os.path.join(RESULTS_DIR, f"{task_id}.json")
    if not os.path.exists(result_path):
        raise HTTPException(404, "Analysis not found")
    with open(result_path) as f:
        saved = json.load(f)
    file_path = os.path.join(UPLOAD_DIR, saved["saved_filename"])
    if file_path.endswith('.csv'):
        df = pd.read_csv(file_path)
    else:
        df = pd.read_excel(file_path)
    
    if filter_str:
        df = apply_filters(df, filter_str)
    
    if x_col not in df.columns or y_col not in df.columns:
        raise HTTPException(400, "Column not found")
    
    # Prepare scatter data
    scatter_df = df[[x_col, y_col]].dropna()
    return {
        "x_col": x_col,
        "y_col": y_col,
        "data": scatter_df.to_dict(orient="records")
    }

@app.get("/boxplot/{task_id}")
def boxplot_data(task_id: str, numeric_col: str, category_col: str, filter_str: str = ""):
    result_path = os.path.join(RESULTS_DIR, f"{task_id}.json")
    if not os.path.exists(result_path):
        raise HTTPException(404, "Analysis not found")
    with open(result_path) as f:
        saved = json.load(f)
    file_path = os.path.join(UPLOAD_DIR, saved["saved_filename"])
    if file_path.endswith('.csv'):
        df = pd.read_csv(file_path)
    else:
        df = pd.read_excel(file_path)
    
    if filter_str:
        df = apply_filters(df, filter_str)
    
    if numeric_col not in df.columns or category_col not in df.columns:
        raise HTTPException(400, "Column not found")
    
    # Compute five-number summary per category
    grouped = df.groupby(category_col)[numeric_col].describe(percentiles=[.25, .5, .75])
    result = []
    for cat, stats in grouped.iterrows():
        result.append({
            "category": str(cat),
            "min": stats["min"],
            "q1": stats["25%"],
            "median": stats["50%"],
            "q3": stats["75%"],
            "max": stats["max"]
        })
    return result

@app.get("/report/{task_id}")
def generate_report(task_id: str, format: str = "html"):
    result_path = os.path.join(RESULTS_DIR, f"{task_id}.json")
    if not os.path.exists(result_path):
        raise HTTPException(404, "Analysis not found")
    with open(result_path) as f:
        saved = json.load(f)
    
    html = generate_html_report(saved["results"], saved["original_filename"])
    
    if format == "html":
        return HTMLResponse(content=html, media_type="text/html")
    elif format == "pdf":
        pdf_path = os.path.join(RESULTS_DIR, f"{task_id}.pdf")
        generate_pdf_report(html, pdf_path)
        return FileResponse(pdf_path, media_type="application/pdf")
    else:
        raise HTTPException(400, "Format must be 'html' or 'pdf'")
    

@app.get("/map-data/{task_id}")
def get_map_data(task_id: str, geo_col: str, value_col: str = None):
    """
    Returns aggregated data for choropleth map.
    Groups by geo_col (country names) and counts rows or sums value_col.
    Returns list of {id: country_code, value: number}
    """
    result_path = os.path.join(RESULTS_DIR, f"{task_id}.json")
    if not os.path.exists(result_path):
        raise HTTPException(404, "Analysis not found")
    with open(result_path) as f:
        saved = json.load(f)
    file_path = os.path.join(UPLOAD_DIR, saved["saved_filename"])
    if file_path.endswith('.csv'):
        df = pd.read_csv(file_path)
    else:
        df = pd.read_excel(file_path)
    
    if geo_col not in df.columns:
        raise HTTPException(400, f"Column '{geo_col}' not found")
    
    # Normalize country names to ISO3
    if value_col and value_col in df.columns:
        grouped = df.groupby(geo_col)[value_col].sum().reset_index()
    else:
        grouped = df.groupby(geo_col).size().reset_index(name='count')
        value_col = 'count'
    
    result = []
    for _, row in grouped.iterrows():
        country_name = row[geo_col].strip().lower()
        iso = COUNTRY_MAP.get(country_name, None)
        if iso:
            result.append({
                "id": iso,
                "value": float(row[value_col]) if pd.notna(row[value_col]) else 0
            })
    return result