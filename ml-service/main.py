"""
GigShield ML Service — FastAPI Application
Serves the trained premium prediction model via REST API.
"""
import os
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import PremiumRequest, PremiumResponse, PremiumBreakdown

# ─── Configuration ───────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "premium_model.joblib")

PINCODE_RISK = {
    "500001": 72, "600001": 68, "400001": 80, "110001": 65,
    "560001": 55, "700001": 78, "411001": 60, "530001": 70,
    "522001": 74, "521001": 71,
}

SEASONS = ["summer", "monsoon", "winter", "post_monsoon"]
TRUST_TIERS = ["New", "Standard", "Verified"]
TRUST_DISCOUNT = {"New": 0.0, "Standard": -0.05, "Verified": -0.10}
SEASON_WEIGHT = {"summer": 0.25, "monsoon": 0.45, "winter": 0.10, "post_monsoon": 0.20}

# ─── App Setup ───────────────────────────────────────────────────
app = FastAPI(
    title="GigShield ML Service",
    description="AI-powered premium calculation for parametric gig worker insurance",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Load Model ──────────────────────────────────────────────────
model = None
try:
    model = joblib.load(MODEL_PATH)
    print(f"✅ Model loaded from {MODEL_PATH}")
except FileNotFoundError:
    print(f"⚠️  Model not found at {MODEL_PATH}. Run train_model.py first!")
    print("   Falling back to formula-based calculation.")


def calculate_breakdown(req: PremiumRequest, zone_risk: int) -> PremiumBreakdown:
    """Calculate the premium breakdown factors."""
    zone_factor = round((zone_risk / 100.0) * 0.40, 4)
    weather_factor = round(
        min(req.aqi_7day_avg / 500, 1.0) * 0.15 +
        min(req.rain_7day_avg_mm / 100, 1.0) * 0.15 +
        SEASON_WEIGHT.get(req.current_season, 0.15) * 0.05,
        4
    )
    history_factor = round(min(req.worker_claim_history / 5, 1.0) * 0.15, 4)
    trust_disc = TRUST_DISCOUNT.get(req.worker_trust_tier, 0.0)

    return PremiumBreakdown(
        zone_factor=zone_factor,
        weather_factor=weather_factor,
        history_factor=history_factor,
        trust_discount=trust_disc,
    )


def calculate_risk_score(zone_risk: int, aqi: float, rain: float, claims: int) -> int:
    """Calculate overall risk score (0-100)."""
    score = (
        zone_risk * 0.4 +
        min(aqi / 500, 1.0) * 100 * 0.25 +
        min(rain / 100, 1.0) * 100 * 0.20 +
        claims * 5 * 0.15
    )
    return int(min(100, max(0, score)))


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "service": "GigShield ML Service",
    }


@app.post("/api/premium/calculate", response_model=PremiumResponse)
async def calculate_premium(req: PremiumRequest):
    """Calculate weekly insurance premium using ML model or formula fallback."""
    # Get zone risk
    zone_risk = PINCODE_RISK.get(req.pincode, 65)  # default 65 for unknown pincodes

    # Validate season
    season = req.current_season.lower()
    if season not in SEASONS:
        raise HTTPException(status_code=400, detail=f"Invalid season: {req.current_season}. Use: {SEASONS}")

    # Validate trust tier
    if req.worker_trust_tier not in TRUST_TIERS:
        raise HTTPException(status_code=400, detail=f"Invalid trust tier: {req.worker_trust_tier}. Use: {TRUST_TIERS}")

    # Calculate breakdown
    breakdown = calculate_breakdown(req, zone_risk)

    # Calculate risk score
    risk_score = calculate_risk_score(zone_risk, req.aqi_7day_avg, req.rain_7day_avg_mm, req.worker_claim_history)

    if model is not None:
        # Use ML model
        features = np.array([[
            zone_risk,
            SEASONS.index(season),
            req.aqi_7day_avg,
            req.rain_7day_avg_mm,
            req.worker_claim_history,
            TRUST_TIERS.index(req.worker_trust_tier),
        ]])
        prediction = model.predict(features)[0]
        weekly_premium = round(max(15, min(80, prediction)), 2)
    else:
        # Formula fallback
        risk_multiplier = breakdown.zone_factor + breakdown.weather_factor + breakdown.history_factor + breakdown.trust_discount
        weekly_premium = round(15 + 65 * max(0, min(risk_multiplier, 1.0)), 2)

    return PremiumResponse(
        weekly_premium=weekly_premium,
        risk_score=risk_score,
        breakdown=breakdown,
    )


@app.get("/")
async def root():
    return {
        "service": "GigShield ML Service",
        "version": "2.0.0",
        "docs": "/docs",
    }
