"""
Extension management endpoints
"""
import zipfile
import io
import os
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

router = APIRouter()


@router.get("/download")
async def download_extension():
    """Download the Chrome extension as a zip file"""
    try:
        # Find the extension directory
        extension_dir = Path(__file__).parent.parent.parent / "extension"
        
        if not extension_dir.exists():
            raise HTTPException(status_code=404, detail="Extension not found")
        
        # Create zip buffer
        buf = io.BytesIO()
        
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
            # Walk through extension directory and add all files
            for root, dirs, files in os.walk(extension_dir):
                for file in files:
                    # Skip certain files
                    if file.startswith('.') or file.endswith('.pyc'):
                        continue
                    
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, extension_dir)
                    zf.write(file_path, arcname)
        
        buf.seek(0)
        
        return StreamingResponse(
            iter([buf.getvalue()]),
            media_type="application/zip",
            headers={
                "Content-Disposition": "attachment; filename=ai-ngfw-extension-v1.0.0.zip"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create extension zip: {str(e)}")
