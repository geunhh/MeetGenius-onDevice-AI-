from fastapi import FastAPI
# import requests

app = FastAPI()

# Root endpoint for health check
@app.get("/")
def read_root():
    return {"message": "FastAPI is running!"}