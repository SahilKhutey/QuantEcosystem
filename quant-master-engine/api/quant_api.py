from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="Quant Master Engine API")

class SignalRequest(BaseModel):
    asset: str
    lookback: int = 30

@app.get("/")
def read_root():
    return {"status": "online", "engine": "Quant Master"}

@app.post("/generate_signal")
async def generate_signal(request: SignalRequest):
    """
    API endpoint to trigger the full signal fusion pipeline for an asset.
    """
    # This would involve calling the orchestrator and feature engines
    return {
        "asset": request.asset,
        "signal": "BUY",
        "confidence": 0.85,
        "regime": "STEADY_BULL"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
