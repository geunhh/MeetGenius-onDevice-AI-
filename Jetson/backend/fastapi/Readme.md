# Fast API 기본구조
```
    fastapi
    │── app/
    │   ├── api/
    │   │   ├── endpoint/
    │   │   │   ├── stt.py         
    │   │   │   ├── reports.py
    │   │   │   ├── test_router.py
    │   │   ├── __init__.py
    │   ├── __init__.py
    │
    ├── core/   # 핵심 유틸리티 및 설정 관리
    │   ├── chromadb_utils.py
    │   ├── config.py
    │   ├── embeddin_utils.py
    │   ├── llm_utils.py
    │
    ├── .env  # 환경 변수 파일
    ├── main.py  # FastAPI 애플리케이션 실행
    ├── Readme.md
    ├── requirements.txt

```