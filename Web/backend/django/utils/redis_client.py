import redis
import os

class RedisClient:
    def __init__(self):
        """
        Redis 연결 설정
        """
        self.redis_url = f"redis://{os.getenv('REDIS_HOST', '127.0.0.1')}:{os.getenv('REDIS_PORT', '6379')}"
        self.redis = redis.Redis.from_url(self.redis_url, decode_responses=True)

    def publish(self, channel, message):
        """
        Redis Pub/Sub - 메시지 발행
        """
        self.redis.publish(channel, message)

    def subscribe(self, channel):
        """
        Redis Pub/Sub - 채널 구독
        """
        pubsub = self.redis.pubsub()
        pubsub.subscribe(channel)
        return pubsub

# Redis 클라이언트 인스턴스 생성
redis_client = RedisClient()
