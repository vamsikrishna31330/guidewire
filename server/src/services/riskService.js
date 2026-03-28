const disruptionCatalog = [
  { type: "HEAVY_RAIN", label: "Heavy rain above 10 mm/hr" },
  { type: "EXTREME_HEAT", label: "Extreme heat above 42 C" },
  { type: "POOR_AIR_QUALITY", label: "Poor AQI above 300" },
  { type: "HIGH_WIND_SPEED", label: "High wind above 50 km/h" },
  { type: "SIMULATED_CURFEW", label: "Curfew or civic restriction trigger" },
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const calculateRiskQuote = (conditions) => {
  const risk_score = Number(
    ((conditions.rain_mm * 2) + (conditions.wind_speed * 1.5) + (conditions.aqi / 50) + 10).toFixed(2)
  );
  const weekly_premium = clamp(Math.round(risk_score * 2.5), 49, 199);
  const coverage_amount = weekly_premium * 8;

  return {
    risk_score,
    weekly_premium,
    coverage_amount,
    disruption_triggers: disruptionCatalog,
  };
};

const detectTriggers = (conditions) => {
  const triggers = [];

  if (conditions.rain_mm > 10) {
    triggers.push({
      trigger_type: "HEAVY_RAIN",
      severity: conditions.rain_mm > 20 ? "critical" : "high",
      metric: `${conditions.rain_mm} mm/hr rain`,
    });
  }

  if (conditions.temperature > 42) {
    triggers.push({
      trigger_type: "EXTREME_HEAT",
      severity: conditions.temperature > 45 ? "critical" : "high",
      metric: `${conditions.temperature} C`,
    });
  }

  if (conditions.aqi > 300) {
    triggers.push({
      trigger_type: "POOR_AIR_QUALITY",
      severity: conditions.aqi > 400 ? "critical" : "high",
      metric: `AQI ${conditions.aqi}`,
    });
  }

  if (conditions.wind_speed > 50) {
    triggers.push({
      trigger_type: "HIGH_WIND_SPEED",
      severity: conditions.wind_speed > 70 ? "critical" : "high",
      metric: `${conditions.wind_speed} km/h`,
    });
  }

  return triggers;
};

module.exports = {
  calculateRiskQuote,
  detectTriggers,
};
