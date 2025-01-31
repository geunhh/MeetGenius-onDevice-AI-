from fastapi import FastAPI, HTTPException 


# FastAPI 앱 초기화 
app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}
