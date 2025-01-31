# ChromaDB 공식 이미지 사용
FROM chromadb/chroma:latest

# 작업 디렉토리 설정
WORKDIR /chroma

# 필요한 패키지 설치
RUN apt-get update && apt-get install -y \
    build-essential \
    libsqlite3-dev \
    python3-dev \
    git \
    curl \
    zsh \
    && apt-get clean

# zsh 설치 및 oh-my-zsh 설치
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" || true

# zsh 플러그인 설치
RUN git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions && \
    git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

# zsh 플러그인을 .zshrc에 추가
RUN echo "\nplugins=(git zsh-autosuggestions zsh-syntax-highlighting)\n" >> ~/.zshrc && \
    echo "source ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh" >> ~/.zshrc

# 데이터 디렉토리 생성 및 권한 설정
RUN mkdir -p /chroma/data && chmod 777 /chroma/data

# 포트 노출
EXPOSE 8001

# 기본 명령: ChromaDB 서버 실행 (기본 이미지에는 8000번 포트가 설정 되어 있어서 8001번 포트로 변경)
CMD ["uvicorn", "chromadb.app:app", "--host", "0.0.0.0", "--port", "8001"]

