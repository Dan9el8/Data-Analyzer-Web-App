import os
import json
import pandas as pd
from celery import Celery
from dotenv import load_dotenv
from .analysis import analyze_dataframe

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
celery_app = Celery("data_analyzer", broker=REDIS_URL, backend=REDIS_URL)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task(bind=True)
def analyze_file(self, file_path: str, original_filename: str):
    """Heavy analysis task"""
    try:
        # Read file
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)
        
        # Run analysis
        results = analyze_dataframe(df)
        
        # Save results to a JSON file
        task_id = self.request.id
        results_dir = os.getenv("RESULTS_DIR", "results")
        os.makedirs(results_dir, exist_ok=True)
        result_path = os.path.join(results_dir, f"{task_id}.json")
        
        output = {
            "task_id": task_id,
            "original_filename": original_filename,
            "saved_filename": os.path.basename(file_path),
            "results": results
        }
        with open(result_path, "w") as f:
            json.dump(output, f)
        
        return {"status": "completed", "result_path": result_path}
    
    except Exception as e:
        return {"status": "failed", "error": str(e)}