# Dockerfile for Ollama
FROM dustynv/ollama:0.5.1-r36.4.0

# Set working directory
WORKDIR /ollama


# Copy application files (if necessary)
COPY . /app

# Default command
CMD ["ollama", "serve"]
