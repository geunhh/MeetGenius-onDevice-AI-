import React, { useEffect } from "react"; // useEffect import 추가
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"; // React Router 추가
import { Provider, useSelector, useDispatch } from "react-redux"; // Redux Provider, useSelector, useDispatch 가져오기
import { store } from "./redux/store"; // Redux store 가져오기
import { setAuthenticated } from "./redux/authSlice"; // Redux 액션
import LoginPage from "./pages/LoginPage"; // 로그인 페이지 컴포넌트 가져오기
import DashboardPage from "./pages/DashboardPage"; // 대시보드 페이지 컴포넌트 가져오기
import RealtimeMeetingPage from "./pages/RealtimeMeetingPage"; // 실시간 회의 페이지 컴포넌트 가져오기
import MomEidtPage from "./pages/MomEidtPage"; // 실시간 회의 페이지 컴포넌트 가져오기
import MomSummaryPage from "./pages/MomSummaryPage"; // 실시간 회의 페이지 컴포넌트 가져오기

// ✅ 인증된 사용자만 접근 가능한 보호된 라우트
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated); // Redux에서 로그인 상태 가져오기
  return isAuthenticated ? children : <Navigate to="/accounts/login" />; // 로그인 상태면 대시보드, 아니면 로그인 페이지로 이동
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // 인증 상태를 true로 설정하는 액션
      dispatch(setAuthenticated(true));
    }
  }, [dispatch]);

  return (
    <Provider store={store}> {/* Redux Store를 앱 전체에서 사용하도록 설정 */}
      <Router> {/* React Router 설정 */}
        <Routes>
          {/* 기본 루트가 로그인 페이지로 이동하도록 설정 */}
          <Route path="/" element={<Navigate to="/accounts/login" />} />

          {/* 로그인 페이지 */}
          <Route path="/accounts/login" element={<LoginPage />} />

          {/* 대시보드 페이지 (로그인된 사용자만 접근 가능) */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />

          {/* 실시간 회의 페이지 (로그인된 사용자만 접근 가능) */}
          <Route
            path="/realtime-meeting/:meetingId"
            element={
              <PrivateRoute>
                <RealtimeMeetingPage />
              </PrivateRoute>
            }
          />

          {/* 회의록 수정 페이지 */}
          <Route
            path="/momedit/:meetingId"
            element={
              <PrivateRoute>
                <MomEidtPage />
              </PrivateRoute>
            }
          />

          {/* 요약된 회의록 페이지 */}
          <Route
            path="/mom-summary/:meetingId"
            element={
              <PrivateRoute>
                <MomSummaryPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
