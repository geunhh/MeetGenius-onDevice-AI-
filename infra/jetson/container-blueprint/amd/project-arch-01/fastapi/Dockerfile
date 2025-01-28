# 베이스 이미지
FROM nvidia/cuda:12.4.0-devel-ubuntu22.04

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 목록 업데이트 및 zsh 설치
RUN apt-get update && apt-get install -y \
    zsh \
    curl \
    git \
    python3-pip \
    sudo \
    && apt-get clean

# zsh를 기본 셸로 설정
RUN chsh -s $(which zsh)

# zsh를 자동으로 실행하도록 bash를 수정
RUN echo "exec zsh" >> ~/.bashrc

# oh-my-zsh 설치 (선택 사항)
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" || true

# zsh 플러그인 설치 (zsh-autosuggestions, zsh-syntax-highlighting)
RUN git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions && \
    git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

# zsh 플러그인을 .zshrc에 추가https://jinwoo-chang.notion.site/
RUN echo "\nplugins=(git zsh-autosuggestions zsh-syntax-highlighting)\n" >> ~/.zshrc && \
    echo "source ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh" >> ~/.zshrc

# FastAPI 및 관련 라이브러리 설치
RUN pip3 install --no-cache-dir \
    fastapi \
    uvicorn \
    # vllm \
    chromadb

# 애플리케이션 코드 복사
COPY . /app

# 파이썬 심볼릭 링크 설정 
RUN sudo ln -sf /usr/bin/python3 /usr/bin/python

# FastAPI 실행
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
