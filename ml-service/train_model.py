"""
GigShield ML Service — Train Premium Prediction Model
Generates 500 synthetic training rows and trains a RandomForestRegressor.
Premium range: ₹15–₹80/week
"""
import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

# ─── Configuration ───────────────────────────────────────────────
NUM_SAMPLES = 500
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
MODEL_PATH = os.path.join(MODEL_DIR, "premium_model.joblib")

# Pincode risk scores (same as Spring Boot PincodeZoneMap)
PINCODE_RISK = {
    "500001": 72, "600001": 68, "400001": 80, "110001": 65,
    "560001": 55, "700001": 78, "411001": 60, "530001": 70,
    "522001": 74, "521001": 71,
}

SEASONS = ["summer", "monsoon", "winter", "post_monsoon"]
TRUST_TIERS = ["New", "Standard", "Verified"]
TRUST_DISCOUNT = {"New": 0.0, "Standard": -0.05, "Verified": -0.10}
SEASON_WEIGHT = {"summer": 0.25, "monsoon": 0.45, "winter": 0.10, "post_monsoon": 0.20}

np.random.seed(42)


def generate_synthetic_data(n: int) -> pd.DataFrame:
    """Generate synthetic training data for premium calculation."""
    records = []
    pincodes = list(PINCODE_RISK.keys())

    for _ in range(n):
        pincode = np.random.choice(pincodes)
        season = np.random.choice(SEASONS)
        zone_risk = PINCODE_RISK[pincode]

        # AQI: varies by season
        if season == "winter":
            aqi = np.random.uniform(100, 450)
        elif season == "monsoon":
            aqi = np.random.uniform(30, 200)
        else:
            aqi = np.random.uniform(50, 350)

        # Rainfall: varies by season
        if season == "monsoon":
            rain = np.random.uniform(5, 120)
        elif season == "post_monsoon":
            rain = np.random.uniform(0, 40)
        else:
            rain = np.random.uniform(0, 15)

        claim_history = np.random.choice([0, 1, 2, 3, 4, 5], p=[0.35, 0.25, 0.20, 0.10, 0.07, 0.03])
        trust_tier = np.random.choice(TRUST_TIERS, p=[0.3, 0.5, 0.2])

        # ─── Premium calculation formula ───
        zone_factor = (zone_risk / 100.0) * 0.40
        weather_factor = (
            min(aqi / 500, 1.0) * 0.15 +
            min(rain / 100, 1.0) * 0.15 +
            SEASON_WEIGHT[season] * 0.05
        )
        history_factor = min(claim_history / 5, 1.0) * 0.15
        trust_disc = TRUST_DISCOUNT[trust_tier]

        risk_multiplier = zone_factor + weather_factor + history_factor + trust_disc
        base_premium = 15
        max_additional = 65  # max premium = 15 + 65 = 80
        premium = base_premium + max_additional * max(0, min(risk_multiplier, 1.0))
        # Add small noise
        premium = round(premium + np.random.uniform(-3, 3), 2)
        premium = max(15, min(80, premium))

        risk_score = int(min(100, max(0,
            zone_risk * 0.4 +
            min(aqi / 500, 1.0) * 100 * 0.25 +
            min(rain / 100, 1.0) * 100 * 0.20 +
            claim_history * 5 * 0.15
        )))

        records.append({
            "zone_risk": zone_risk,
            "season_encoded": SEASONS.index(season),
            "aqi_7day_avg": round(aqi, 2),
            "rain_7day_avg_mm": round(rain, 2),
            "worker_claim_history": claim_history,
            "trust_tier_encoded": TRUST_TIERS.index(trust_tier),
            "premium": premium,
            "risk_score": risk_score,
        })

    return pd.DataFrame(records)


def train_and_save():
    """Train RandomForestRegressor and save model."""
    print("🔧 Generating synthetic training data...")
    df = generate_synthetic_data(NUM_SAMPLES)
    print(f"   Generated {len(df)} samples")
    print(f"   Premium range: ₹{df['premium'].min():.2f} – ₹{df['premium'].max():.2f}")
    print(f"   Risk score range: {df['risk_score'].min()} – {df['risk_score'].max()}")

    features = ["zone_risk", "season_encoded", "aqi_7day_avg", "rain_7day_avg_mm",
                 "worker_claim_history", "trust_tier_encoded"]
    X = df[features]
    y = df["premium"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("\n🤖 Training RandomForestRegressor...")
    model = RandomForestRegressor(
        n_estimators=150,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=3,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    print(f"\n📊 Model Evaluation:")
    print(f"   MAE:  ₹{mae:.2f}")
    print(f"   R²:   {r2:.4f}")

    # Feature importance
    print(f"\n🔍 Feature Importance:")
    for feat, imp in sorted(zip(features, model.feature_importances_), key=lambda x: -x[1]):
        print(f"   {feat}: {imp:.4f}")

    # Save model
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"\n✅ Model saved to {MODEL_PATH}")

    return model


if __name__ == "__main__":
    train_and_save()
