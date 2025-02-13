from fastapi import FastAPI
from app.api.routes import meetings, projects, tests

app = FastAPI()

@app.get("/")
def hello():
    return {"message": "Hello!"}

app.include_router(meetings.router)
app.include_router(projects.router)
app.include_router(tests.router)  # 테스트 라우터 추가
