## Jetson Orin Nano 보드 컨테이너 아키텍처 02
---
### 설명 
---
- 3개의 컨테이너로 구성된 아키텍처 
  - Ollama
  - FastAPI
  - ChromaDB
### Directory Tree
---
```
📦project-arch-02
 ┣ 📂chromadb
 ┃ ┣ 📂data
 ┃ ┗ 📜Dockerfile
 ┣ 📂fastapi
 ┃ ┣ 📂app
 ┃ ┃ ┣ 📂api
 ┃ ┃ ┣ 📂core
 ┃ ┃ ┗ 📜main.py
 ┃ ┗ 📜Dockerfile
 ┣ 📂ollama
 ┃ ┗ 📜Dockerfile
 ┗ 📜docker-compose.yml
 ```