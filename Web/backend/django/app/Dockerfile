# django Dockerfile
# Base image
FROM python:3.12.8

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# wait-for-it.sh 다운로드 + 실행 권한 부여
# COPY wait-for-it.sh /app/wait-for-it.sh
RUN chmod +x ./wait-for-it.sh


# 환경 변수 설정
# ENV DJANGO_SUPERUSER_USERNAME=1000000
# ENV DJANGO_SUPERUSER_EMAIL=1000000@example.com
# ENV DJANGO_SUPERUSER_PASSWORD=1234
ENV CELERY_BROKER_URL=redis://redis:6379/0
ENV CELERY_BACKEND=redis://redis:6379/0

# Expose port
EXPOSE 8000

# Run the server
CMD ["sh", "-c", "./wait-for-it.sh db:3306 -t 30 && python manage.py makemigrations && python manage.py migrate && uvicorn ai203.asgi:application --host 0.0.0.0 --port 8000 --reload"]
# RUN celery -A ai203 worker --loglevel=info --pool=solo
