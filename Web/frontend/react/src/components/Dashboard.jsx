import React from "react";
import styled from "styled-components";
import NoticeWidget from "./NoticeWidget"; // 공지사항 위젯 가져오기
import ToDoWidget from "./ToDoWidget"; // 할 일 위젯 가져오기
import { DayPicker } from "react-day-picker"; // react-day-picker 임포트
import "react-day-picker/style.css"; // 기본 스타일링 불러오기

// ✅ 대시보드 전체 컨테이너
const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh; /* 화면 전체 높이 사용 */
  width: calc(100vw - 250px); /* 화면 전체 너비 사용 */
  overflow: hidden; /* 화면 넘침을 방지 */
  margin: 0; /* 화면의 가로 여백을 없앰 */
  padding: 0; /* 여백을 0으로 설정 */
`;

// ✅ 메인 콘텐츠 영역
const MainContent = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  padding: 20px;
  width: 100%;
  height: calc(100vh - 60px); /* 상단 네비게이션바 크기를 빼고 나머지 공간을 사용 */
  overflow-x: hidden; /* 가로 스크롤 숨김 */
  overflow-y: hidden; /* 가로 스크롤 숨김 */
`;

// ✅ 배너와 달력을 나란히 배치할 컨테이너
const BannerAndCalendarContainer = styled.div`
  display: flex;
  margin-top: 20px;
  gap: 40px; /* 배너와 달력 간 간격 */
  flex-wrap: wrap; /* 화면 크기 축소 시 자동으로 한 줄로 줄어들게 */
  margin-left: 40px;
`;

const Banner = styled.img`
  max-width: 100%; /* 배너 가로 크기 제한 */
  max-height: 300px; /* 배너 세로 크기 제한 */
  height: auto; /* 비율을 유지하면서 자동으로 세로 크기 조정 */
  margin-bottom: 20px;
  margin-top: 20px;
`;

// ✅ 달력 스타일
const CalendarContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 270px;
  height: 270px;
  margin-top: 20px;
`;

// ✅ DayPicker 스타일
const StyledDayPicker = styled(DayPicker)`
  font-family: 'Arial', sans-serif;
  font-size: 0.7rem; /* 기본 폰트 크기 설정 */
  text-align: center;
`;

const WidgetsContainer = styled.div`
  display: flex;
  gap: 60px;
  margin-top: 20px;
  flex-wrap: wrap;
  align-items: flex-start;
  margin-left: 40px;

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Dashboard = () => {
  return (
    <DashboardContainer>
      <MainContent>
        <BannerAndCalendarContainer>
          <Banner src="/banner.png" alt="배너" />
          <CalendarContainer>
            <StyledDayPicker />
          </CalendarContainer>
        </BannerAndCalendarContainer>

        <WidgetsContainer>
          <ToDoWidget />
          <NoticeWidget />
        </WidgetsContainer>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
