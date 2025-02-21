import chromadb

client = chromadb.PersistentClient(path="./chroma_db")
table = client.create_collection(name="table") 

####################################################
# SETUP이므로 기본 데이터만 넣어두기. 
프로젝트_id = 'pjt-01'
문서_내용 = '프로젝트 01 문장입니다.'
문서_id = str(1)
문서_type = str(2)
embedding_vector = [0.1, 0.2, 0.3]  # 문서 내용 emb 모델 통해서 받아와야 
프로젝트명 = "온디바이스 미팅 AI AGENT PJT"
회의명 = "킥오프 회의"
안건명 = "프로젝트 일정 및 목표"
담당부서ID = "01"

ids = [문서_id + '_' + 문서_type]
documents = [문서_내용]
embeddings = [embedding_vector]
metadatas = [{
      "projectId": 프로젝트_id,
      "문서id": 문서_id,
      "문서type": 문서_type,
      "프로젝트명": 프로젝트명,
      "회의명": 회의명,
      "안건명": 회의명,
      "담당부서ID": 담당부서ID
    },]
table.add(ids=ids, documents=documents, embeddings=embeddings, metadatas=metadatas)  # 데이터 추가
####################################################
