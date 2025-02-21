# 크로마db
from langchain_ollama import OllamaEmbeddings
import chromadb
import time

client = chromadb.PersistentClient(path="./chroma_db")
table = client.get_collection(name="table")

###

프로젝트_id = 'pjt-01'
담당부서ID = "01"
문서_id = str(3)
문서_type = str(3)
프로젝트명 = "온디바이스 미팅 AI AGENT PJT 2"
회의명 = "킥오프 회의 3"
안건명 = "프로젝트 일정 및 목표 3"
문서_내용 = "이번 회의는 스마트뷰티 캠페인을 성공적으로 이끌기 위한 전반적인 마케팅 전략을 논의하고자 마련했습니다. 우선 프로젝트 배경부터 짚고 넘어가겠습니다. 스마트뷰티 캠페인은 당사의 신제품인 ‘AI 피부 분석 기기’를 중심으로, 20~30대 여성 타겟을 집중 공략하는 것을 목적으로 하고 있습니다. 기존 시장에는 유사한 제품이 없다고 보기엔 어렵지만, ‘AI’ 기술을 활용해 개개인에게 최적화된 솔루션을 제공한다는 점을 강조하려 합니다. 다만 경쟁사 B사의 ‘글로벌 뷰티 스캐너’ 역시 AI를 마케팅 포인트로 활용하고 있으니, 이에 대한 차별화가 필요합니다."

embed = OllamaEmbeddings(model="EXAONE3.5:2.4B")
vector = embed.embed_query(문서_내용)
embedding_vector = vector  # 문서 내용 emb 모델 통해서 받아와야 

###

 
table.add(ids=ids, documents=documents, embeddings=embeddings, metadatas=metadatas)  # 데이터 추가
####################################################
all_data = table.get(include=["embeddings", "documents", "metadatas"])  # 컬렉션에서 모든 데이터 가져오기
print(all_data)  # 가져온 데이터 출력

