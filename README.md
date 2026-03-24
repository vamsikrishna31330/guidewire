# GigShield — AI-Powered Parametric Insurance for Gig Workers

> **Team Syntax Shields** | Guidewire DEVTrails 2026

🛡️ GigShield automatically triggers insurance payouts for Indian gig delivery workers (Zomato, Swiggy, Zepto, Blinkit) when real-world disruptions — extreme weather, AQI spikes, curfews — are detected in their delivery zone. **Zero paperwork, zero manual claims.**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Java 21 + Spring Boot 3.x |
| Database | Supabase (PostgreSQL) |
| ML Service | Python 3.11 + FastAPI + scikit-learn |
| Auth | Supabase Auth (JWT) |
| Weather API | OpenWeatherMap |
| AQI API | AQICN |

## Quick Start

### 1. Train ML Model (run once)
```bash
cd ml-service
pip install -r requirements.txt
python train_model.py
```

### 2. Start ML Service
```bash
cd ml-service
uvicorn main:app --reload --port 8000
```

### 3. Start Backend
```bash
cd backend
# Copy .env.example to .env and fill in values
./mvnw spring-boot:run
```

### 4. Start Frontend
```bash
cd client
npm install
npm run dev
```

## Environment Setup

Copy `.env.example` files in `client/`, `backend/`, and `ml-service/` and fill with your Supabase credentials and API keys.

## Features (Phase 2)

- ✅ Supabase Auth (email/password)
- ✅ AI-powered premium calculation (RandomForest ML model)
- ✅ Automatic trigger engine (weather, AQI monitoring every 30 min)
- ✅ Auto-claim creation on disruption detection
- ✅ Admin panel with manual triggers (curfew/flood)
- ✅ Anti-fraud placeholders (FCS hooks for Phase 3)
- ✅ Real-time notification system
- ✅ 10 Indian city zones supported

## License

MIT © 2026 Team Syntax Shields
