import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gigshield_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("gigshield_token");
      localStorage.removeItem("gigshield_worker");
      window.dispatchEvent(new Event("gigshield:logout"));
    }

    return Promise.reject(error);
  }
);

export const getApiError = (error, fallbackMessage = "Something went wrong") => {
  if (error.response?.data?.data?.errors?.length) {
    return error.response.data.data.errors.map((item) => item.msg).join(", ");
  }

  return error.response?.data?.message || error.message || fallbackMessage;
};

export default api;
