# main.py
import asyncio
import json
import aioredis
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS – dopasuj do swojego frontendu
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # lub ['http://localhost:3000']
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REDIS_URL = "redis://localhost"
CHANNEL_NAME = "notifications"

@app.on_event("startup")
async def startup_event():
    app.state.redis = await aioredis.from_url(REDIS_URL, decode_responses=True)
    app.state.pubsub = app.state.redis.pubsub()
    await app.state.pubsub.subscribe(CHANNEL_NAME)

@app.on_event("shutdown")
async def shutdown_event():
    await app.state.pubsub.unsubscribe(CHANNEL_NAME)
    await app.state.pubsub.close()
    await app.state.redis.close()

@app.get("/events")
async def sse(request: Request):
    async def event_generator():
        pubsub = app.state.pubsub
        while True:
            if await request.is_disconnected():
                break

            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
            if message:
                try:
                    data = json.loads(message["data"])
                    event = data.get("event", "message")
                    payload = data.get("data", {})

                    yield f"event: {event}\ndata: {json.dumps(payload)}\n\n"
                except Exception as e:
                    print(f"Error in SSE: {e}")
            await asyncio.sleep(0.01)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
