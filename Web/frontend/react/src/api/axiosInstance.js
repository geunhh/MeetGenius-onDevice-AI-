import axios from "axios";

const baseURL = import.meta.env.VITE_APP_BASEURL;
// ✅ Axios 인스턴스 생성
const axiosInstance = axios.create({
  
  baseURL: baseURL, // Django 백엔드 API URL
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const authToken = localStorage.getItem("authToken");
  if (authToken) {
    config.headers["Authorization"] = `Token ${authToken}`;
  }
  return config;
});

export default axiosInstance;
