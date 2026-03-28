const axios = require("axios");

const WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const AQI_BASE_URL = "https://api.waqi.info/feed";

const hashSeed = (value) => {
  const normalized = (value || "").toLowerCase();
  return normalized.split("").reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
};

const buildFallbackMetrics = (city, pincode) => {
  const seed = hashSeed(`${city}-${pincode}`);
  const rain_mm = Number(((seed % 15) + 1.2).toFixed(1));
  const wind_speed = Number((((seed % 18) + 8) * 1.9).toFixed(1));
  const temperature = Number((28 + (seed % 17) * 0.8).toFixed(1));
  const aqi = 70 + (seed % 280);

  return {
    weatherSource: "fallback",
    aqiSource: "fallback",
    rain_mm,
    wind_speed,
    temperature,
    aqi,
  };
};

const getWeatherMetrics = async (city, pincode) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return buildFallbackMetrics(city, pincode);
  }

  try {
    const response = await axios.get(WEATHER_BASE_URL, {
      params: {
        q: `${city},IN`,
        appid: apiKey,
        units: "metric",
      },
      timeout: 8000,
    });

    const weather = response.data;
    const rain_mm = Number(
      (
        weather?.rain?.["1h"] ??
        (weather?.rain?.["3h"] ? weather.rain["3h"] / 3 : 0)
      ).toFixed(1)
    );

    return {
      weatherSource: "live",
      rain_mm,
      wind_speed: Number(((weather?.wind?.speed || 0) * 3.6).toFixed(1)),
      temperature: Number((weather?.main?.temp || 0).toFixed(1)),
    };
  } catch (error) {
    console.warn(`Weather API failed for ${city}. Using fallback metrics.`);
    return buildFallbackMetrics(city, pincode);
  }
};

const getAqiMetrics = async (city, pincode) => {
  const apiKey = process.env.AQICN_API_KEY;

  if (!apiKey) {
    return buildFallbackMetrics(city, pincode);
  }

  try {
    const response = await axios.get(`${AQI_BASE_URL}/${encodeURIComponent(city)}/`, {
      params: {
        token: apiKey,
      },
      timeout: 8000,
    });

    if (response.data?.status !== "ok") {
      throw new Error("AQICN returned a non-ok status");
    }

    return {
      aqiSource: "live",
      aqi: Number(response.data?.data?.aqi || 0),
    };
  } catch (error) {
    console.warn(`AQI API failed for ${city}. Using fallback metrics.`);
    return buildFallbackMetrics(city, pincode);
  }
};

const getZoneConditions = async (city, pincode) => {
  const [weatherMetrics, aqiMetrics] = await Promise.all([
    getWeatherMetrics(city, pincode),
    getAqiMetrics(city, pincode),
  ]);

  return {
    city,
    pincode,
    rain_mm: weatherMetrics.rain_mm,
    wind_speed: weatherMetrics.wind_speed,
    temperature: weatherMetrics.temperature,
    aqi: aqiMetrics.aqi,
    sources: {
      weather: weatherMetrics.weatherSource || "fallback",
      aqi: aqiMetrics.aqiSource || "fallback",
    },
  };
};

module.exports = {
  getZoneConditions,
};
