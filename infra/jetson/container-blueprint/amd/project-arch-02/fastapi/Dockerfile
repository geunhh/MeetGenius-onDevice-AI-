# 베이스 이미지
FROM nvidia/cuda:12.4.0-devel-ubuntu22.04

# 작업 디렉토리 설정
WORKDIR /app

# 필수 패키지 설치
RUN apt-get update && apt-get install -y \
    zsh \
    curl \
    git \
    python3-pip \
    && apt-get clean

    # zsh를 기본 셸로 설정
RUN chsh -s $(which zsh)

# zsh를 자동으로 실행하도록 bash를 수정
RUN echo "exec zsh" >> ~/.bashrc

# zsh 및 플러그인 설정
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" || true && \
    git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions && \
    git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting && \
    echo "\nplugins=(git zsh-autosuggestions zsh-syntax-highlighting)\n" >> ~/.zshrc

# FastAPI 및 라이브러리 설치
RUN pip3 install --no-cache-dir \
    fastapi uvicorn chromadb langchain langchain-ollama

# 애플리케이션 코드 복사
COPY . /app

# # FastAPI 실행
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

