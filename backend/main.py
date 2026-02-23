import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import text
from database import Base, engine
from routes.expenses import router as expenses_router
from routes.auth import router as auth_router
from routes.users import router as users_router
from routes.categories import router as categories_router
from routes.persons import router as persons_router
from routes.scan import router as scan_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with engine.connect() as _conn:
        try:
            _conn.execute(text("ALTER TABLE persons ADD COLUMN relation TEXT"))
            _conn.commit()
        except Exception:
            pass  # column already exists
    yield


app = FastAPI(title="xpendsTracker API", redirect_slashes=False, lifespan=lifespan)

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(expenses_router)
app.include_router(categories_router)
app.include_router(persons_router)
app.include_router(scan_router)

# Serve the Vite-built React SPA in production
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.isdir(STATIC_DIR):
    assets_dir = os.path.join(STATIC_DIR, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        file_path = os.path.join(STATIC_DIR, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
else:
    @app.get("/")
    def root():
        return {"message": "xpendsTracker API is running"}
