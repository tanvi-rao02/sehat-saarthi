
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.extractor import extract_text
from services.analyzer import analyze_medical_report

router = APIRouter()


class ReportRequest(BaseModel):
    reportId: str
    filePath: str
    fileType: str


@router.post("/report")
async def analyze_report(request: ReportRequest):
    try:
        raw_text = extract_text(request.filePath, request.fileType)

        if not raw_text:
            raise HTTPException(
                status_code=422,
                detail="Could not extract text from file."
            )

        analysis = analyze_medical_report(raw_text)

        return {
            "status": "success",
            "reportId": request.reportId,
            **analysis
        }

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@router.post("/analyze-report")
async def analyze_report_alias(request: ReportRequest):
    return await analyze_report(request)

