import React, { useState } from "react";
// React와 useState 훅을 가져옵니다. useState는 컴포넌트의 상태 관리에 사용됩니다.

import Sidebar from "../components/Sidebar"; // 사이드바 컴포넌트를 가져옵니다.
import Navbar from "../components/Navbar"; // 네비게이션 바 컴포넌트를 가져옵니다.
import Dashboard from "../components/Dashboard"; // 대시보드 컴포넌트를 가져옵니다.
import Project from "../components/Project"; // 프로젝트 관리 컴포넌트를 가져옵니다.
import MeetingRoom from "../components/MeetingRoom"; // 회의실 예약 컴포넌트를 가져옵니다.

const DashboardPage = () => {
  // 프로젝트 페이지와 회의실 예약 페이지의 상태를 관리하기 위해 useState 훅을 사용합니다.
  const [isProjectPage, setIsProjectPage] = useState(false); // 프로젝트 페이지 표시 여부를 결정합니다.
  const [isMeetingRoomPage, setIsMeetingRoomPage] = useState(false); // 회의실 예약 페이지 표시 여부를 결정합니다.

  // 사이드바에서 '프로젝트' 메뉴 항목 클릭 시 호출되는 함수입니다.
  const handleProjectClick = () => {
    setIsProjectPage(true); // 프로젝트 페이지를 활성화합니다.
    setIsMeetingRoomPage(false); // 회의실 예약 페이지를 비활성화합니다.
  };

  // 사이드바에서 '회의실 예약' 메뉴 항목 클릭 시 호출되는 함수입니다.
  const handleMeetingRoomClick = () => {
    setIsMeetingRoomPage(true); // 회의실 예약 페이지를 활성화합니다.
    setIsProjectPage(false); // 프로젝트 페이지를 비활성화합니다.
  };

  // 사이드바에서 '대시보드' 메뉴 항목 클릭 시 호출되는 함수입니다.
  const handleDashboardClick = () => {
    setIsProjectPage(false); // 모든 특정 페이지 표시를 비활성화하여 대시보드로 돌아갑니다.
    setIsMeetingRoomPage(false);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh", // 전체 뷰포트 높이 사용
        width: "100vw", // 전체 뷰포트 너비 사용
        overflow: "hidden", // 스크롤바 숨김
        margin: 0, // 마진 제거
      }}
    >
      <Sidebar
        handleProjectClick={handleProjectClick}
        handleMeetingRoomClick={handleMeetingRoomClick}
        handleDashboardClick={handleDashboardClick}
      />
      <div
        style={{
          flexGrow: 1,
          marginLeft: "250px", // 사이드바 너비 만큼 왼쪽 여백을 줍니다.
          overflowX: "hidden", // 가로 스크롤바를 숨깁니다.
        }}
      >
        <Navbar /> // 네비게이션 바를 렌더링합니다.
        {/* 조건부 렌더링을 사용하여 현재 활성화된 페이지 컴포넌트를 표시합니다. */}
        {isProjectPage ? (
          <Project />
        ) : isMeetingRoomPage ? (
          <MeetingRoom />
        ) : (
          <Dashboard />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
