from pydantic import BaseModel, Field
from typing import Dict


class PremiumRequest(BaseModel):
    pincode: str = Field(..., description="Indian pincode of the delivery zone")
    current_season: str = Field(..., description="Current season: summer, monsoon, winter, post_monsoon")
    aqi_7day_avg: float = Field(..., description="7-day average AQI value")
    rain_7day_avg_mm: float = Field(..., description="7-day average rainfall in mm")
    worker_claim_history: int = Field(default=0, description="Number of past claims by this worker")
    worker_trust_tier: str = Field(default="New", description="Worker trust tier: New, Standard, Verified")


class PremiumBreakdown(BaseModel):
    zone_factor: float
    weather_factor: float
    history_factor: float
    trust_discount: float


class PremiumResponse(BaseModel):
    weekly_premium: float
    risk_score: int
    breakdown: PremiumBreakdown
