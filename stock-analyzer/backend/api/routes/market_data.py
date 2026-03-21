from fastapi import APIRouter

router = APIRouter(prefix="/market-data", tags=["market-data"])

@router.get("/")
async def get_market_data():
    return {"message": "Market data endpoint"}
