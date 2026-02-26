import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "https://tutionmasterbacknend.onrender.com/api";

const API = axios.create({
  baseURL: BASE,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;