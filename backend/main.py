from app.services.repair import repair_service
from app.services.scanner import scanner_service
import asyncio
from fastapi import FastAPI, Request, Response
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.api.endpoints import router as api_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Financial Dashboard API")

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://financial-dashboard-two-wheat.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

# Start scanner on startup
@app.on_event("startup")
async def startup_event():
    from app.services.brain import system_brain
    from app.services.system_agent import system_agent
    # asyncio.create_task(scanner_service.start_scanning())
    # asyncio.create_task(system_brain.start_brain())
    # asyncio.create_task(system_agent.start())
    print("DEBUG: Background tasks disabled for debugging")

# Global Exception Handler
@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except StarletteHTTPException as exc:
        # Handle FastAPI's own HTTPExceptions
        return Response(content=f"Error: {exc.detail}", status_code=exc.status_code)
    except Exception as e:
        # Handle other unexpected exceptions
        return Response(content=f"Internal Server Error: {e}", status_code=500)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
