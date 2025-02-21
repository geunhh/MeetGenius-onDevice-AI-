import axios from "axios";

// ❗ 환경 변수가 없을 경우 기본값을 `127.0.0.1:8000`으로 설정
const baseURL = import.meta.env.VITE_APP_BASEURL  

console.log("🚀 API BASE URL:", baseURL); // 콘솔에서 API URL 확인

// ✅ Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: baseURL, // Django 백엔드 API URL
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ 요청 시 Authorization 헤더 추가
axiosInstance.interceptors.request.use((config) => {
  const authToken = localStorage.getItem("authToken");
  if (authToken) {
    config.headers["Authorization"] = `Token ${authToken}`;
  }
  return config;
});

export default axiosInstance;
