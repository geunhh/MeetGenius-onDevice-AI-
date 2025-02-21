// Sidebar.jsx
import React from "react";
import styled from "styled-components";
import { FaTachometerAlt, FaUser, FaEnvelope, FaProjectDiagram, FaDoorOpen, FaMoneyCheckAlt, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // useNavigate 추가
import { useDispatch } from "react-redux"; // useDispatch 추가
import { logoutUser } from "../redux/authSlice"; // Redux logoutUser 액션 임포트

// ✅ 사이드바 스타일
const SidebarContainer = styled.div`
  width: 250px;
  height: 100vh; /* 화면 전체 높이 사용 */
  background-color: #274c77; /* 네이비 컬러 */
  color: white;
  display: flex;
  flex-direction: column;
  padding: 20px;
  justify-content: flex-start; /* 사이드바 내에서 상단 정렬 */
  position: fixed; /* 사이드바를 화면에 고정 */
  top: 0; /* 상단에 고정 */
  left: 0; /* 왼쪽에 고정 */
  z-index: 100; /* 다른 요소 위에 올리기 */
  overflow: hidden; /* 스크롤 방지 */
`;

// ✅ 메뉴 아이템 스타일
const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 16px;
  gap: 10px; /* 아이콘과 텍스트 간 간격 추가 */
  &:hover {
    background-color: #1b3a57;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 16px;
  gap: 10px;
  background: transparent;
  border: none;
  color: white;
  margin-top: auto; /* 하단으로 밀어서 반응형 디자인을 자연스럽게 만듦 */
  margin-bottom: 40px; /* 버튼 위에 여백 추가 */

  
  &:hover {
    background-color: #1b3a57;
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    margin-top: 20px; /* 화면 크기가 작아질 때 위쪽으로 조금 더 올림 */
    margin-bottom: 20px;
  }
`;

const Sidebar = ({ handleProjectClick, handleMeetingRoomClick, handleDashboardClick }) => {
  const navigate = useNavigate(); // useNavigate 훅 사용
  const dispatch = useDispatch(); // useDispatch 훅 사용

  const handleLogout = () => {
    dispatch(logoutUser()); // Redux에서 로그아웃 처리
    localStorage.removeItem("token"); // 로컬 스토리지에서 토큰 삭제
    navigate("/accounts/login"); // 로그인 페이지로 리디렉션
  };

  return (
    <SidebarContainer>
      <div>
        <MenuItem onClick={handleDashboardClick} style={{ marginTop: '60px' }}><FaTachometerAlt /> Dashboard</MenuItem> {/* Dashboard 클릭 시 handleDashboardClick 호출 */}
        <MenuItem><FaUser /> My page</MenuItem>
        <MenuItem><FaEnvelope /> Mail</MenuItem>
        <MenuItem onClick={handleProjectClick}><FaProjectDiagram /> Project</MenuItem> {/* Project 클릭 시 handleProjectClick 호출 */}
        <MenuItem onClick={handleMeetingRoomClick}><FaDoorOpen /> Meeting room</MenuItem> {/* Meeting room 클릭 시 handleMeetingRoomClick 호출 */}
        <MenuItem><FaMoneyCheckAlt /> Paycheck</MenuItem>
      </div>
      <LogoutButton onClick={handleLogout}>
        <FaSignOutAlt /> Logout
      </LogoutButton>
    </SidebarContainer>
  );
};

export default Sidebar;
