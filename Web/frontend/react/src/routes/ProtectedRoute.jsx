import React from "react";
import { Navigate } from "react-router-dom"; // 리디렉트를 위한 컴포넌트
import { useSelector } from "react-redux"; // Redux에서 상태를 가져오기

// ✅ 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated); // 로그인 상태 가져오기

  return isAuthenticated ? children : <Navigate to="/accounts/login" replace />; // 로그인된 경우만 페이지 접근 허용
};

export default ProtectedRoute;
