from fastapi import FastAPI
from api.endpoints import test_router
from api.endpoints import embeddings,rag,reports,stt

app = FastAPI()

# stt.init_app(app)

@app.get("/")
def hello():
    return {"message": "Hello!"}


app.include_router(test_router.router)
app.include_router(stt.router)
app.include_router(embeddings.router)
app.include_router(rag.router)
app.include_router(reports.router)
