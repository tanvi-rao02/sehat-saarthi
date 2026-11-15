from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="SehatSaarthi Python AI Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5000",
        os.getenv("NODE_BACKEND_URL", "http://localhost:5000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes.health_routes import router as health_router
from routes.report_routes import router as report_router

app.include_router(health_router)
app.include_router(report_router, prefix="/analyze")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
