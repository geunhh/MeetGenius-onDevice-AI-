'''
chroma_db 연동 
아래는 Pinecone DB 연동 예시코드입니다.
'''
# 아래는 예시 코드
import pinecone
import os
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENV")
INDEX_NAME = "my-index"

# Pinecone 초기화
pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENV)
index = pinecone.Index(INDEX_NAME)

def insert_vector(id: str, embedding: list):
    """
    Pinecone에 벡터를 삽입하는 함수.
    """
    try:
        index.upsert(vectors=[(id, embedding)])
        print(f"Inserted vector with ID: {id}")
    except Exception as e:
        print(f"Pinecone Insertion Error: {e}")

def search_vector(query_embedding: list, top_k: int = 5):
    """
    Pinecone에서 유사한 벡터를 검색하는 함수.
    """
    try:
        results = index.query(queries=[query_embedding], top_k=top_k, include_metadata=True)
        return results
    except Exception as e:
        print(f"Pinecone Search Error: {e}")
        return None