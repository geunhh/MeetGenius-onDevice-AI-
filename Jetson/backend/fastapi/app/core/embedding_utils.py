'''
embedding 생성 로직.
아래는 Solar Embedding API 연동 예시 코드입니다.
'''

import httpx
import os
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()
SOLAR_API_URL = os.getenv("SOLAR_API_URL")
SOLAR_API_KEY = os.getenv("SOLAR_API_KEY")

async def get_embedding(text: str):
    """
    Solar Embedding API를 호출하여 텍스트 임베딩을 생성하는 함수.
    """
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {SOLAR_API_KEY}"}
        payload = {"text": text}

        try:
            response = await client.post(SOLAR_API_URL, json=payload, headers=headers)
            response.raise_for_status()
            return response.json().get("embedding")  # API 응답에서 임베딩 값 추출
        except Exception as e:
            print(f"Solar Embedding API Error: {e}")
            return None