import os
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
import json

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "templates")

def generate_html_report(analysis_results: dict, original_filename: str) -> str:
    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))
    template = env.get_template("report.html")
    
    # Prepare histogram data for template
    histograms = analysis_results.get("histograms", {})
    hist_charts = {}
    for col, data in histograms.items():
        bin_edges = data["bin_edges"]
        counts = data["counts"]
        labels = [f"{bin_edges[i]:.2f}-{bin_edges[i+1]:.2f}" for i in range(len(counts))]
        hist_charts[col] = {"labels": labels, "counts": counts}
    
    return template.render(
        filename=original_filename,
        shape=analysis_results["shape"],
        columns=analysis_results["columns"],
        dtypes=analysis_results["dtypes"],
        missing=analysis_results["missing"],
        missing_pct=analysis_results["missing_pct"],
        numeric_cols=analysis_results["numeric_cols"],
        categorical_cols=analysis_results["categorical_cols"],
        description=analysis_results["description"],
        value_counts=analysis_results["value_counts"],
        histograms=hist_charts
    )

def generate_pdf_report(html_content: str, output_path: str):
    HTML(string=html_content).write_pdf(output_path)