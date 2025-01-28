# Dockerfile for FastAPI
FROM langchain:r36.4.3-cu126-langchain

WORKDIR /app

# 패키지 목록 업데이트 및 zsh 설치
RUN apt-get update && apt-get install -y \
    zsh \
    sudo \
    git \
    curl \
    wget \
    python3-pip \
    # python-is-python3 \
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

RUN sudo ln -s /usr/bin/python3 /usr/bin/python

# Install Python Packages
RUN pip3 install --no-cache-dir \
    fastapi \
    uvicorn \
    chromadb    
    # langchain \
    # langchain-ollama

# Copy application code
COPY . /app/

# # Expose port for FastAPI
# EXPOSE 8000

# # Command to run the FastAPI app
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
