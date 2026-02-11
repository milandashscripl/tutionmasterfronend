import axios from "axios";

const API = axios.create({
  baseURL: "https://tutionmasterbacknend.onrender.com/api", // 🔁 change to Render URL later
});

export default API;
