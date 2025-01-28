# ChromaDB 공식 이미지 사용
FROM chromadb/chroma:latest

# 작업 디렉토리 설정
WORKDIR /chroma

# 데이터 디렉토리 생성
RUN mkdir -p /chroma/data && chmod 777 /chroma/data

# 포트 노출
EXPOSE 8001

# 기본 명령
# CMD ["uvicorn", "chromadb.app:app", "--host", "0.0.0.0", "--port", "8001"]
