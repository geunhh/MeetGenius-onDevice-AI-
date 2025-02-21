import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaSearch, FaBell, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; // Redux에서 사용자 정보 가져오기
import { logoutUser } from "../redux/authSlice"; // 로그아웃 액션
import NotificationWidget from "./notificationWidget";

// 네비게이션 바 스타일
const NavbarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: white;
  padding: 0 20px;
  border-bottom: 1px solid #ddd;
  z-index: 1000;
`;

const Logo = styled.img`
  width: 120px;
  height: auto;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-right: 50px;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  input {
    width: 150px;
    padding: 8px;
    border-radius: 5px;
    border: 1px solid #ccc;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 16px;
  font-weight: bold;
  color: #274C77;
`;

const Name = styled.span`
  color:#274C77;
`;

const LogoutButton = styled.button`
  background: transparent;
  border: none;
  color: #274C77;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: bold;

  &:hover {
    color: #0056b3;
  }
`;

const NotificationIcon = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  font-size: 1.5rem;
`;

const Badge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: red;
  color: white;
  font-size: 12px;
  font-weight: bold;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
`;


const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user); // Redux에서 사용자 정보 가져오기
  const [unreadCount, setUnreadCount] = useState(0); // 읽지 않은 알림 개수 상태

  const handleLogout = () => {
    dispatch(logoutUser()); // 로그아웃 액션 디스패치
    localStorage.removeItem("authToken"); // 로컬 스토리지에서 토큰 삭제
    navigate("/accounts/login"); // 로그아웃 후 로그인 페이지로 리디렉션
  };

  return (
    <NavbarContainer>
      <Logo src="/203ai_logo.png" alt="203ai Logo" />
      <RightSection>
        <SearchBar>
          <FaSearch />
          <input type="text" placeholder="Search..." />
        </SearchBar>

        <UserInfo>       
        {/* 알림 위젯 */}
        <NotificationWidget />
          
          {user ? (
            <>
              <span>{user.department}팀</span>
              <Name>{user.name}님</Name>
            </>
          ) : (
            <span>사용자 정보 없음</span>
          )}
          <FaUserCircle />
        </UserInfo>

        <LogoutButton onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </LogoutButton>
      </RightSection>
    </NavbarContainer>
  );
};

export default Navbar;
