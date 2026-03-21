from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from api.realtime_stream import app as stream_app
import os

# This would ideally serve the built React app
# For now, it's a placeholder to link the pieces

app = FastAPI()

# Mount the streaming API
app.mount("/api", stream_app)

# In a real setup, we would build the React app and serve it:
# app.mount("/", StaticFiles(directory="dashboard-ui/dist", html=True), name="static")

@app.get("/")
async def root():
    return {"message": "AI Trading Agent Ecosystem API is running. Access /ws/{symbol} for live updates."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
