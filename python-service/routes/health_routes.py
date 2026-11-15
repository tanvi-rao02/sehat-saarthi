
from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "OK",
        "service": "SehatSaarthi Python AI Service",
        "time": datetime.now().isoformat()
    }

