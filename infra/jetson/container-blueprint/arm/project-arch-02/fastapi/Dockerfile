# Base Image
FROM langchain:r36.4.3-cu126-langchain

# Set working directory
WORKDIR /app

# 패키지 목록 업데이트 및 필수 패키지 설치
RUN apt-get update && apt-get install -y \
    zsh \
    sudo \
    git \
    curl \
    wget \
    python3-pip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# zsh를 기본 셸로 설정
RUN chsh -s $(which zsh)

# zsh를 자동으로 실행하도록 bash를 수정
RUN echo "exec zsh" >> ~/.bashrc

# Oh My Zsh 설치 및 플러그인 설정
RUN curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh | bash || true && \
    git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions && \
    git clone https://github.com/zsh-users/zsh-syntax-highlighting ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

# .zshrc 설정 추가
RUN echo "\nplugins=(git\nzsh-autosuggestions\nzsh-syntax-highlighting)\n" >> ~/.zshrc

# zshrc 변경 사항 적용
RUN zsh -c "source ~/.zshrc"

# Python symlink 설정
RUN sudo ln -s /usr/bin/python3 /usr/bin/python

# Install Python Packages
RUN python3 -m pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
    fastapi \
    uvicorn \
    chromadb \
    transformers

# Copy application code
COPY . /app/

# Expose port for FastAPI
EXPOSE 8000
