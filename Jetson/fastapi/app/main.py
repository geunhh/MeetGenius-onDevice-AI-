from fastapi import FastAPI
from app.api.routes import meetings, projects

app = FastAPI()

@app.get("/")
def hello():
    return {"message": "Hello!"}

app.include_router(meetings.router)
app.include_router(projects.router)
