# https://catalog.ngc.nvidia.com/orgs/nvidia/containers/l4t-jetpack
# nvidia jetpack image 
FROM nvcr.io/nvidia/l4t-jetpack:r36.4.0 

WORKDIR /backend

# 필수 패키지 설치
RUN apt-get update && apt-get install -y \
    zsh \
    curl \
    wget \
    git \
    python3-pip \
    sudo \
    ninja-build \
    libopenblas-dev \
    language-pack-en \
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

# 코드 복사
COPY . /backend

# # pytorch 및 llama-cpp-python 다운로드
# RUN pip install /backend/torch-2.6.0rc1-cp310-cp310-linux_aarch64.whl
# RUN pip install numpy==1.26.4
# RUN pip install /backend/llama_cpp_python-0.3.7-cp310-cp310-linux_aarch64.whl

# FastAPI 및 라이브러리 설치
RUN pip install --no-cache-dir \
    -r /backend/fastapi/requirements-jetson.txt

# # whl 파일 삭제
# RUN rm -rf /backend/*.whl

# Expose port for FastAPI
EXPOSE 8000