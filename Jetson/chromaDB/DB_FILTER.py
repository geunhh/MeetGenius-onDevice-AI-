# 크로마db
import chromadb

client = chromadb.PersistentClient(path="./chroma_db")
table = client.get_collection(name="table")

# 메타데이터 필터링 조건
filter_conditions = { "$and": [ {"projectId": "pjt-01"}, {"문서type": "2"} ] }
# filter_conditions = { "$or":  [ {"projectId": "pjt-01"}, {"문서type": "2"} ] }

filtered_data = table.get(where=filter_conditions, include=["documents", "metadatas", "embeddings"])

print(filtered_data)  # 결과 출력            