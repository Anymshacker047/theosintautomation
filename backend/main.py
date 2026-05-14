import os
import zipfile
import csv
import io
import json
from typing import List, Dict, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Intelligence Search Bot API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state for the database path
DATABASE_PATH = "data/database.zip"

class SearchResult(BaseModel):
    file_name: str
    content: Dict[str, str]

@app.get("/")
async def root():
    return {"status": "online", "database_loaded": os.path.exists(DATABASE_PATH)}

@app.post("/upload-database")
async def upload_database(file: UploadFile = File(...)):
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only ZIP files are allowed")
    
    os.makedirs("data", exist_ok=True)
    with open(DATABASE_PATH, "wb") as buffer:
        buffer.write(await file.read())
    
    return {"message": "Database uploaded successfully", "filename": file.filename}

@app.get("/search")
async def search(q: str = Query(..., min_length=2)):
    if not os.path.exists(DATABASE_PATH):
        raise HTTPException(status_code=404, detail="Database file not found. Please upload a ZIP database.")

    results = []
    query = q.lower()

    try:
        with zipfile.ZipFile(DATABASE_PATH, 'r') as z:
            for file_info in z.infolist():
                if file_info.is_dir():
                    continue
                
                # We only process text-based files (csv, txt, json)
                ext = os.path.splitext(file_info.filename)[1].lower()
                if ext not in ['.csv', '.txt', '.json', '.pdf']:
                    continue

                if ext == '.pdf':
                    try:
                        from pypdf import PdfReader
                        with z.open(file_info.filename) as f:
                            pdf = PdfReader(f)
                            for page_num, page in enumerate(pdf.pages):
                                text = page.extract_text()
                                if text and query in text.lower():
                                    results.append({
                                        "file_name": file_info.filename,
                                        "content": {"match": f"Found on page {page_num + 1}", "snippet": text[:200] + "..."}
                                    })
                                if len(results) >= 100: break
                    except Exception as e:
                        print(f"Error reading PDF {file_info.filename}: {e}")
                    continue

                with z.open(file_info.filename) as f:
                    # Read as text
                    text_stream = io.TextIOWrapper(f, encoding='utf-8', errors='ignore')
                    
                    if ext == '.csv':
                        reader = csv.DictReader(text_stream)
                        for row in reader:
                            # Search in all columns
                            if any(query in str(val).lower() for val in row.values()):
                                results.append({
                                    "file_name": file_info.filename,
                                    "content": row
                                })
                                if len(results) >= 100: break # Limit results for performance
                    
                    elif ext == '.json':
                        try:
                            data = json.load(text_stream)
                            if isinstance(data, list):
                                for item in data:
                                    if any(query in str(val).lower() for val in item.values() if isinstance(item, dict)):
                                        results.append({"file_name": file_info.filename, "content": item})
                            elif isinstance(data, dict):
                                if any(query in str(val).lower() for val in data.values()):
                                    results.append({"file_name": file_info.filename, "content": data})
                        except:
                            continue

                    else: # .txt
                        for line_num, line in enumerate(text_stream, 1):
                            if query in line.lower():
                                results.append({
                                    "file_name": file_info.filename,
                                    "content": {"line": line.strip(), "line_number": str(line_num)}
                                })
                            if len(results) >= 100: break

                if len(results) >= 100:
                    break

    except zipfile.BadZipFile:
        raise HTTPException(status_code=500, detail="Invalid ZIP file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")

    return {"query": q, "total_results": len(results), "results": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
