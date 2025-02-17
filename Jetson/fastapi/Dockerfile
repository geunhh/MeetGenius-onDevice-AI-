# https://catalog.ngc.nvidia.com/orgs/nvidia/containers/l4t-jetpack
# nvidia jetpack image 
FROM nvcr.io/nvidia/l4t-jetpack:r36.4.0 

WORKDIR /fastapi

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
    libomp-dev \
    libasound2-dev \
    alsa-utils \
    portaudio19-dev \
    cmake \
    build-essential \
    zlib1g-dev \
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
COPY . /fastapi

# FastAPI 및 라이브러리 설치 - 일단 타 로컬에서 끌고왔음 
RUN pip install --no-cache-dir --ignore-installed numpy
RUN pip install --no-cache-dir --use-feature=in-tree-build \
    ./llama_cpp_python-0.3.7-cp310-cp310-linux_aarch64.whl \
    ./torch-2.5.0-cp310-cp310-linux_aarch64.whl \
    ./bitsandbytes-0.45.0-cp310-cp310-linux_aarch64.whl \
    ./ctranslate2-4.5.0-cp310-cp310-linux_aarch64.whl \
    -r /fastapi/requirements-jetson.txt

# 기존에 설치되어 있을 수 있는 ctranslate2 제거 (오류 방지를 위해)
RUN pip uninstall -y ctranslate2 || true

# CTranslate2 소스코드 클론 후 빌드 및 설치
# RUN git clone --recursive https://github.com/OpenNMT/CTranslate2.git /opt/CTranslate2 && \
#     cd /opt/CTranslate2 && \
#     mkdir build && cd build && \
#     cmake -DWITH_MKL=OFF -DWITH_INTEL_OPENMP=OFF -DOPENMP_RUNTIME=NONE -DWITH_CUDA=ON -DWITH_CUDNN=ON .. && \
#     make -j$(nproc) && \
#     make install && \
#     ldconfig && \
#     cd ../python && \
#     pip install -r install_requirements.txt && \
#     python setup.py bdist_wheel && \
#     pip install dist/*.whl

# Expose port for FastAPI
EXPOSE 8000