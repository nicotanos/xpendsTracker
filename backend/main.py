from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routes.expenses import router as expenses_router
from routes.auth import router as auth_router
from routes.users import router as users_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="xpendsTracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(expenses_router)


@app.get("/")
def root():
    return {"message": "xpendsTracker API is running"}
