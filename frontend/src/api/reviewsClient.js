import axios from "axios";

const REVIEWS_API_BASE_URL = import.meta.env.VITE_REVIEWS_API_BASE_URL || "http://localhost:8082";

export const reviewsApiClient = axios.create({
  baseURL: REVIEWS_API_BASE_URL,
});

reviewsApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
