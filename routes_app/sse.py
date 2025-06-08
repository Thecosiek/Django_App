# routes_app/sse.py
import redis
import json
import queue

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def publish_event(event: str, data: dict):
    message = {
        'event': event,
        'data': data
    }
    redis_client.publish('notifications', json.dumps(message))
